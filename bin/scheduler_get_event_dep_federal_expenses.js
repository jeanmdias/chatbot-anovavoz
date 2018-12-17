#!/usr/bin/env node

var request = require('request');
var assert = require('assert');
var async = require('async');
var parse = require('xml-parser');
var formatCurrencyToBr = require('format-currency-to-br');

require('dotenv').config();

var utilities = require('../controllers/utilities');
var facebook = require('../controllers/facebook');

var db = require('../models/db');
var user = require('../models/user');
var politician = require('../models/politician');

console.log('**');
console.log('******************************************************************************************');
console.log('** Start HEROKU scheduler_get_event_dep_federal_expenses.js at',utilities.dateFormat('YYYY-MM-DD HH:MI:SS'));
console.log('******************************************************************************************');

var politicians = [];

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
    politician.withFollowers('politicians_dep_federal', 'followers_dep_federal', function(docs) {
      politicians = docs;
      callback();
    });
  },

  function(callback) {
    processPoliticians(politicians, function(cb) {
      callback();
    });
  },

  function(callback) {
    setTimeout( function() {
      db.get().close( function(err) {
        assert.equal(null, err);
        console.log('** MongoDB Disconnected!!!');
        console.log(' ');
        callback();
      })
    }, 1000);
  }

], function() {
  console.log('** Processo finalizado!!');
});


function getExpenses(politicianId, year, month, done) {
  var options = {
    url: 'https://dadosabertos.camara.leg.br/api/v2/deputados/'+politicianId+'/despesas?ano='+year+'&mes='+month+'&itens=200&ordem=ASC&ordenarPor=numAno',
    headers: {
      'Accept': 'application/json'
    }
  };

  request(options, function (error, response, body) {

    var despesas = [];
    var body = JSON.parse(body);

    despesas = body['dados'];

    done(despesas);

  });
}


function processPoliticians(politicians, done) {

  async.forEach(politicians, function(politician, callback) {

    if (politician.politicians_followers.length > 0) {

      var expenses = [];

      async.series([

        function(callback) {
          getExpenses(politician.code, 2018, 4, function(res) {
            expenses = res;
            callback();
          });
        },

        function(callback) {
          if (expenses) {
            async.forEach(expenses, function(expense, cb) {
              
              document = {
                codigoParlamentar: politician.code,
                nomeParlamentar: politician.name,
                ano: expense.ano,
                mes: expense.mes,
                tipoDespesa: expense.tipoDespesa,
                idDocumento: expense.idDocumento,
                tipoDocumento: expense.tipoDocumento,
                dataDocumento: expense.dataDocumento,
                numDocumento: expense.numDocumento,
                valorDocumento: parseFloat(expense.valorDocumento),
                urlDocumento: expense.urlDocumento,
                nomeFornecedor: expense.nomeFornecedor,
                cnpjCpfFornecedor: expense.cnpjCpfFornecedor,
                valorLiquido: parseFloat(expense.valorLiquido),
                valorGlosa: parseFloat(expense.valorGlosa),
                numRessarcimento: expense.numRessarcimento,
                idLote: expense.idLote,
                parcela: expense.parcela,
                status: 'waiting'
              }
  
              insertEventExpenses(document, function(type, _id) {
                console.log('** '+type+' - Despesas '+_id);
                cb();
              });
            }, function() {
              callback();
            });          
          } else {
            callback();
          }
        }
      ], function() {
        callback();
      });
    } else {
      callback();
    }
  }, function() {
    done();
  });
}


function insertEventExpenses(document, callback) {
  db.get().collection('events_dep_federal_expenses').findOne({
    'codigoParlamentar': document.codigoParlamentar,
    'ano' : document.ano,
    'mes': document.mes,
    'idDocumento' : document.idDocumento,
    'numDocumento' : document.numDocumento,
    'cnpjCpfFornecedor' : document.cnpjCpfFornecedor
  }, function(err, res) {
    assert.equal(null, err);
    if (!res) {
      db.get().collection('events_dep_federal_expenses').insertOne(document, function(err, res) {
        assert.equal(null, err);
        callback('I', res.ops[0]._id);
      });
    } else {
      callback('R', res._id);
    }
  })
}


