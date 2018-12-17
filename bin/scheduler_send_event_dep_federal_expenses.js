#!/usr/bin/env node

var express = require('express');
var request = require('request');
var assert = require('assert');
var async = require('async');

require('dotenv').config();

var utilities = require('../controllers/utilities');
var facebook = require('../controllers/facebook');
var model_user = require('../models/user');
var db = require('../models/db');

var formatCurrencyToBr = require('format-currency-to-br');

var moment = require('moment-timezone');

var momentNow = moment.tz("America/Sao_Paulo").format('DD/MM/YYYY HH:MI:SS');
var momentHour = moment.tz("America/Sao_Paulo").hour();

if (momentHour >= 8 && momentHour <= 20) {

  console.log('******************************************************************************************');
  console.log('** Start HEROKU scheduler_send_event_dep_federal_expenses.js');
  console.log('******************************************************************************************');

  var deliveries = [];

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
      db.get().collection('events_dep_federal_expenses_aggregate_deliveries').findOne({ 'delivery' : false }, function(err, document) {
        if (document) {
          db.get().collection('events_dep_federal_expenses_aggregate_deliveries').find({ 'delivery' : false, '_idEventsDepFederalExpensesAggregate' : document._idEventsDepFederalExpensesAggregate }).toArray(function(err, documents) {
            deliveries = documents;
            callback();
          })
        } else {
          console.log('** Nenhum registro [events_dep_federal_expenses_aggregate_deliveries] para ser entregue.');
          callback();
        }
      });
    },

    function(callback) {
      formatListDeliveries(deliveries, function(res) {
        callback();
      });
    },


  ], function() {
    db.close(function(err) {
      console.log('** DB Disconnected!');
      console.log('** The End!!');
      console.log('******************************************************************************************');
    });
  })
}


function formatListDeliveries(deliveries, done) {
  async.forEach(deliveries, function(delivery, callback) {
    formatDelivery(delivery, function(user, data_header, data_detail) {
      facebook.sendList(user.code, data_header, function(res) {
        facebook.sendResponse(user.code, data_detail, function(res) {
          db.get().collection('events_dep_federal_expenses_aggregate_deliveries').findOneAndUpdate(
            { _id: delivery._id },
            { $set: { delivery: true } },
            function(err, res) {
              assert.equal(null,err);
              callback();
            }
          );
        });
      });
    });
  }, function() {
    done();
  });
}


function formatDelivery(delivery, done) {

  var element_header = [];
  var element_detail = [];
  var buttons = [];
  var expenses;
  var politician;
  var user;
  var description = '';
  var period = '';

  async.series([

    function(callback) {
      db.get().collection('users').findOne({ _id: delivery._idUser}, function(err, res) {
        user = res;
        callback();
      })
    },

    function(callback) {
      db.get().collection('events_dep_federal_expenses_aggregate').findOne({ _id: delivery._idEventsDepFederalExpensesAggregate}, function(err, res) {
        expenses = res;
        callback();
      })
    },

    function(callback) {
      db.get().collection('politicians_dep_federal').findOne({ code: expenses.event.codigoParlamentar}, function(err, res) {
        politician = res;
        callback();
      })
    },

    function(callback) {
      if (expenses.event.dataInicio == null || expenses.event.dataFim == null) {
        period = 'Período não divulgado.'
        callback();
      } else {
        period = 'Dados de '+utilities.dateReplaceFormat(expenses.event.dataInicio) + " a " + utilities.dateReplaceFormat(expenses.event.dataFim);
        callback();
      }
    },

    function(callback) {
      element_header.push({
        title: 'Cota Parlamentar',
        image_url: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509477737/anovavoz-cover-congresso_uvhfi5.jpg',
        subtitle: period,
        default_action: {
            type: 'web_url',
            url: 'https://www.anovavoz.com.br',
            messenger_extensions: true,
            webview_height_ratio: 'tall',
            fallback_url: 'https://www.anovavoz.com.br'
        }
      });
      element_header.push({
        title: 'Dep. Federal '+politician.name,
        image_url: 'https://www.camara.leg.br/internet/deputado/bandep/'+politician.code+'.jpg',
        subtitle: politician.acronym_political_party+' - '+politician.state,
        default_action: {
            type: 'web_url',
            url: 'https://www.camara.leg.br/internet/Deputado/dep_Detalhe.asp?id='+politician.code,
            messenger_extensions: true,
            webview_height_ratio: 'tall',
            fallback_url: 'https://www.camara.leg.br/internet/Deputado/dep_Detalhe.asp?id='+politician.code
        }
      });
      console.log('** Deputado Federal '+politician.name);
      callback();
    },

    function(callback) {
      var count = 0;
      async.forEach(expenses.expenses, function(expense, callback1) {
        count = count + 1;
        description = description + count + "-"+expense.tipoDespesa + "\n"+formatCurrencyToBr(expense.total)+'\n'+'\n'
        callback1();        
      }, function() {
        callback();
      });
    },

    function(callback) {
      data_header = {
        attachment: {
          type: "template",
          payload: {
            template_type: "list",
            elements: element_header
          }
        }
      }
      callback();     
    }

  ], function() {
    done(user, data_header, description);
  });

}

function getDetail(events_dep_federal_expenses_id, done) {
  db.get().collection('events_dep_federal_expenses').findOne({ _id: events_dep_federal_expenses_id}, function(err, res) {
    done(res);
  });
}
