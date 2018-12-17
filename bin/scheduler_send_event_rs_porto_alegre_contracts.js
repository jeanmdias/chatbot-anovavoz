#!/usr/bin/env node

var express = require('express');
var assert = require('assert');
var async = require('async');
var moment = require('moment-timezone');

require('dotenv').config();

var utilities = require('../controllers/utilities');
var facebook = require('../controllers/facebook');
var model_user = require('../models/user');
var db = require('../models/db');

var moment_hour = moment.tz("America/Sao_Paulo").hour();

console.log('********************************************************************************************');
console.log('** Start HEROKU scheduler_send_event_rs_porto_alegre_contracts.js');
console.log('********************************************************************************************');

if ((moment_hour >= 8 && moment_hour <= 20) || (process.env.NODE_ENV == 'development')) {

  var deliveries = [];
  var event;

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

    /********
    auth = 'waiting'    --> Aguardando autorização para envio
    auth = 'authorized' --> Evento autorizado para envio
    auth = 'sent'       --> Evento enviado para usuários
    *******/
    function(callback) {
      db.get().collection('events_rs_porto_alegre_contracts').findOne({ auth: "authorized"}, function(err, document) {
        if (document) {
          event = document;
          db.get().collection('events_rs_porto_alegre_contracts_deliveries').find({ delivery: false, _idEventVoting: document._id }).toArray(function(err, documents) {
            deliveries = documents;
            callback();
          })
        } else {
          console.log('** Nenhum registro [events_rs_porto_alegre_contracts_deliveries] para ser entregue.');
          callback();
        }
      });
    },

    function(callback) {
      formatListDeliveries(deliveries, function(res) {
        callback();
      });
    },

    function(callback) {
      if (event) {
        db.get().collection('events_rs_porto_alegre_contracts').findOneAndUpdate({_id: event._id}, {$set: {auth: 'sent'}});
        callback();
      } else {
        callback();
      }
    },

  ], function() {
    db.close(function(err) {
      console.log('** MongoDB Disconnected!');
      console.log('** The End!!');
      console.log('********************************************************************************************');
    });
  })
} else {
  console.log('** Process PAUSED');
  console.log('********************************************************************************************');
}


function formatListDeliveries(deliveries, done) {
  async.forEach(deliveries, function(delivery, callback) {
    formatDelivery(delivery, function(user, message1, message2, message3, message4) {
      facebook.sendList(user.code, message1, function(res) {
        facebook.sendResponse(user.code, message2, function(res) {
          db.get().collection('events_rs_porto_alegre_contracts_deliveries').findOneAndUpdate(
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

  var element_message = [];
  var message1 = '';
  var message2 = '';
  var message3 = '';
  var message4 = '';

  var contract;
  var user;
  var followers;
  var data;

  async.series([

    function(callback) {
      db.get().collection('events_rs_porto_alegre_contracts').findOne({_id: delivery._idEventVoting}, function(err, document) {
        contract = document;
        callback();
      });
    },

    function(callback) {
      db.get().collection('users').findOne({_id: delivery._idUser}, function(err, document) {
        user = document;
        callback();
      });
    },

    function(callback) {
      db.get().collection('followers_rs_porto_alegre_exec').find({user: user.code}).toArray(function(err, res) {
        followers = res;
        callback();
      });
    },

    function(callback) {
      element_message.push({
        title: 'Prefeitura Municipal Porto Alegre',
        image_url: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509477737/anovavoz-cover-poa_rhwq8d.jpg',
        subtitle: 'Contrato ' + contract.event.contrato,
        default_action: {
            type: 'web_url',
            url: 'https://www.anovavoz.com.br',
            messenger_extensions: true,
            webview_height_ratio: 'tall',
            fallback_url: 'https://www.anovavoz.com.br'
        }
      });

      element_message.push({
        title: "Processo: " + contract.event.processo,
        subtitle: contract.event.orgao_nome,
      });

      element_message.push({
        title: "Valor: " + contract.event.valorContrato,
        subtitle: contract.event.nome_pessoa,
      });

      element_message.push({
        title: "Publicação: " + contract.event.dataPublicacao,
        subtitle: "Vencimento: " + contract.event.dataVencimento
      });

      message1 = {
        attachment: {
          type: "template",
          payload: {
            template_type: "list",
            elements: element_message
          }
        }
      }
      callback();
    },

    function(callback) {
      message2 =  contract.event.objeto_contrato.substr(0, 639)
      callback();
    },

  ], function() {

    done(user, message1, message2);
  });
}
