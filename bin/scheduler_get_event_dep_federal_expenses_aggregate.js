#!/usr/bin/env node

var express = require('express');
var assert = require('assert');
var async = require('async');

require('dotenv').config();

var utilities = require('../controllers/utilities');
var model_user = require('../models/user');
var db = require('../models/db');

console.log('***********************************************************************************************');
console.log('** Start HEROKU scheduler_get_event_dep_federal_expenses_aggregate.js at', utilities.dateFormat('YYYY-MM-DD HH:MI:SS'));
console.log('***********************************************************************************************');

var politicians;

async.series([

  function(callback) {
    db.connect(function(err) {
      if (err) {
        console.log('** Nao foi possivel conectar no MongoDB!!');
        process.exit(1);
      } else {
        console.log('** MongoDB Connected!!!');
        callback();
      }
    });
  },

  function(callback) {
    db.get().collection('events_dep_federal_expenses').aggregate([
      { "$match" : {  status: 'waiting' }},
      { "$group" : {  _id: { codigoParlamentar: "$codigoParlamentar" }}}
    ]).toArray(function(err, res) {
      assert.equal(err, null);
      politicians = res;
      callback();
    });
  },

  function(callback) {
    async.forEach(politicians, function(politician, callback) {
      var politician_code = politician._id.codigoParlamentar;
      db.get().collection('events_dep_federal_expenses').find( { status: 'waiting', codigoParlamentar: politician_code}).toArray(function(err,expenses) {
        processExpenses(politician_code, expenses, function(done) {
          console.log(politician_code, 'done');
          callback();
        });
      });
    }, function() {
      callback();
    });
  }

], function() {
  db.close(function(err) {
    console.log('** MongoDB disconnected!');
    console.log('** Processo finalizado!!');
  });
});


function processExpenses(politician_code, expenses, done) {
  
  var expenses_aggregate;
  var expenses_dates;
  var expenses_to_save;
  var event_id;
  var politician;
  var politician_expenses = expenses;

  async.series([

    function(callback) {
      db.get().collection('politicians_dep_federal').findOne({code: politician_code}, function(err, res) {
        assert.equal(err, null);
        politician = res;
        callback();
      })
    },

    function(callback) {
      async.forEach(expenses, function(expense, callback) {
        db.get().collection('events_dep_federal_expenses').findOneAndUpdate(
          { _id: expense._id },
          { $set: { status: 'sending' } },
          function(err, res) {
            assert.equal(null,err);
            callback();
          }
        );
      }, function() {
        callback();
      })
    },

    function(callback) {
      db.get().collection('events_dep_federal_expenses').aggregate([
        { "$match" : {  status: 'sending', codigoParlamentar: politician.code } },
        { "$group" : {  _id: { codigoParlamentar: "$codigoParlamentar" },
                        min: { $min: "$dataDocumento" },
                        max: { $max: "$dataDocumento" }
                      }
        }
      ]).toArray(function(err, res) {
        assert.equal(err, null);
        expenses_dates = res;
        callback();
      });
    },

    function(callback) {
      db.get().collection('events_dep_federal_expenses').aggregate([
        { "$match" : {  status: 'sending', codigoParlamentar: politician.code } },
        { "$group" : {  _id: { codigoParlamentar: "$codigoParlamentar",
                              nomeParlamentar: "$nomeParlamentar",
                              tipoDespesa: "$tipoDespesa" },
                        total: { $sum: "$valorLiquido" },
                        count: { $sum: 1 }
                      }
        }
      ]).toArray(function(err, res) {
        assert.equal(err, null);
        expenses_aggregate = res;
        callback();
      });
    },

    function(callback) {
      createEvent(politician, expenses, expenses_aggregate, expenses_dates, function(res) {
        expenses_to_save = res;
        callback();
      })      
    },

    function(callback) {
      if (expenses_to_save) {
        saveEvent(expenses_to_save, function(res) {
          event_id = res;
          callback();
        })      
      } else {
        callback();
      }
    },

    function(callback) {
      saveEventDelivery(politician, event_id, function(res) {
        callback();
      })
    },

    function(callback) {
      async.forEach(expenses, function(expense, callback) {
        db.get().collection('events_dep_federal_expenses').findOneAndUpdate(
          { _id: expense._id },
          { $set: { status: 'delivery' } },
          function(err, res) {
            assert.equal(null,err);
            callback();
          }
        );
      }, function() {
        callback();
      })
    }
  ], function() {
    done();
  });
}


function createEvent(politician, expenses_sending, expenses_sending_aggregate, expenses_sending_dates, callback) {
  var event;
  var _ids = [];
  var expenses = [];

  async.series([

    function(callback) {
      event = { codigoParlamentar: politician.code,
                nomeParlamentar: politician.name,
                dataInicio: expenses_sending_dates[0].min,
                dataFim: expenses_sending_dates[0].max }
      callback();
    },

    function(callback) {
      async.forEach(expenses_sending, function(expense, callback) {
        _ids.push({ _id: expense._id });
        callback();
      }, function() {
        callback();
      })

    },

    function(callback) {
      async.forEach(expenses_sending_aggregate, function(expense, callback) {
        var doc = { tipoDespesa: expense._id.tipoDespesa,
                    total: expense.total,
                    count: expense.count }
        expenses.push(doc);
        callback();
      }, function() {
        callback();
      })
    }

  ], function() {
    var doc = { event, _ids, expenses }
    callback(doc);    
  })
}


function saveEvent(documents, callback) {
  db.get().collection('events_dep_federal_expenses_aggregate').insertOne(documents, function(err, res) {
    assert.equal(err, null);
    callback(res.ops[0]._id);
  })  
}


function saveEventDelivery(politician, event_id, callback) {
  var documents = [];
  var users;

  async.series([

    function(callback) {
      db.get().collection('followers_dep_federal').find( { code: politician.code } ).toArray(function(err, res) {
        followers = res;
        callback();
      });
    },

    function(callback) {
      async.forEachLimit(followers, 1, function(follower, callback) {      
        db.get().collection('users').findOne({code: follower.user}, function(err, res) {
          assert.equal(err, null);
          if (res) {
            documents.push({
              _idUser: res._id,
              _idEventsDepFederalExpensesAggregate: event_id,
              delivery: false
            });
            callback();            
          } else {
            callback();
          }
        })
      }, function() {
        callback();
      });      
    },

    function(callback) {
      if (documents.length > 0) {
        db.get().collection('events_dep_federal_expenses_aggregate_deliveries').insertMany(documents, function(err, res) {
          assert.equal(err, null);
          callback();
        })        
      } else {
        callback();
      }
    }
  ], function() {
    callback();
  });
}


/*
db.events_dep_federal_expenses.aggregate([
          { "$match" : {  status: 'waiting' } },
          { "$group" : {  _id: { codigoParlamentar: "$codigoParlamentar",
                                nomeParlamentar: "$nomeParlamentar",
                                tipoDespesa: "$tipoDespesa" },
                          total: { $sum: "$valorDocumento" },
                          count: { $sum: 1 },
                          min: { $min: "$dataDocumento" },
                          max: { $max: "$dataDocumento" }
                        }
          } ] )
*/
