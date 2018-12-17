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


utilities.allowedSend(function(res) {
  
  if (res) {
    console.log('******************************************************************************************');
    console.log('** Start HEROKU scheduler_send_event_senator_matters.js');
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
        db.get().collection('events_senator_matters_deliveries').findOne({ 'delivery' : false }, function(err, document) {
          if (document) {
            db.get().collection('events_senator_matters_deliveries').find({ 'delivery' : false, '_idEvent' : document._idEvent }).toArray(function(err, documents) {
              deliveries = documents;
              callback();
            })
          } else {
            console.log('** Nenhum registro [events_senator_matters_deliveries] para ser entregue.');
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
        console.log('** DB disconnected!');
        console.log('** The End!!');
        console.log('******************************************************************************************');
      });
    })
  }
})


function formatListDeliveries(deliveries, done) {
  async.forEach(deliveries, function(delivery, callback) {
    formatDelivery(delivery, function(user, data_header, data_description, data_numberMatter) {

      facebook.sendList(user.code, data_header, function(res) {
        facebook.sendResponse(user.code, data_description, function(res) {
          db.get().collection('events_senator_matters_deliveries').findOneAndUpdate(
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

  var element_list = [];
  var user;
  var matter;
  var politician;

  async.series([

    function(callback) {
      db.get().collection('users').findOne({ _id: delivery._idUser}, function(err, res) {
        user = res;
        callback();
      })
    },

    function(callback) {
      db.get().collection('events_senator_matters').findOne({ _id: delivery._idEvent}, function(err, res) {
        matter = res;
        callback();
      })
    },

    function(callback) {
      db.get().collection('politicians_senator').findOne({ code: matter.codigoParlamentar}, function(err, res) {
        politician = res;
        callback();
      })
    },

    function(callback) {
      element_list.push({
        title: 'Autoria de Matéria',
        image_url: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509477737/anovavoz-cover-congresso_uvhfi5.jpg',
        subtitle: matter.siglaSubtipoMateria+' '+matter.numeroMateria+'/'+matter.anoMateria,
        default_action: {
            type: 'web_url',
            url: 'https://www25.senado.leg.br/web/atividade/materias/-/materia/'+matter.codigoMateria,
            messenger_extensions: true,
            webview_height_ratio: 'tall',
            fallback_url: 'https://www25.senado.leg.br/web/atividade/materias/-/materia/'+matter.codigoMateria
        }
      });
      element_list.push({
        title: 'Sen. '+politician.name + ' - ' + politician.acronym_political_party+'/'+politician.state,
        image_url: 'https://www.senado.leg.br/senadores/img/fotos-oficiais/senador'+politician.code+'.jpg',
        subtitle: politician.acronym_political_party+' - '+politician.state,
        default_action: {
            type: 'web_url',
            url: 'https://www25.senado.leg.br/web/senadores/senador/-/perfil/'+politician.code,
            messenger_extensions: true,
            webview_height_ratio: 'tall',
            fallback_url: 'https://www25.senado.leg.br/web/senadores/senador/-/perfil/'+politician.code
        }
      });
      callback();
    },

    function(callback) {
      data_header = {
        attachment: {
          type: "template",
          payload: {
            template_type: "list",
            elements: element_list
          }
        }
      }
      callback();
    }

  ], function() {
    done(user, data_header, matter.ementaMateria, matter.numeroMateria);
  });

}
