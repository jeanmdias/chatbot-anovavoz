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

var utc = 3;
var hrs = utilities.dateFormat('HH');

if ((hrs-utc) > 8 && (hrs-utc) < 22) {

console.log('******************************************************************************************');
console.log('Start HEROKU SCHEDULER scheduler_send_event_senator_comissions.js at', utilities.dateFormat('YYYY-MM-DD HH:MI:SS'));
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
    db.get().collection('events_senator_commissions_deliveries').findOne({ 'delivery' : false }, function(err, document) {
      if (document) {
        db.get().collection('events_senator_commissions_deliveries').find({ 'delivery' : false, '_idEvent' : document._idEvent }).toArray(function(err, documents) {
          deliveries = documents;
          callback();
        })
      } else {
        console.log('** Nenhum registro [events_senator_commissions_deliveries] para ser entregue.');
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
    console.log('** Processo finalizado!!');
    console.log('******************************************************************************************');
  });
})

} else {

console.log('******************************************************************************************');
console.log('** Paused HEROKU SCHEDULER scheduler_send_event_senator_comissions.js at', utilities.dateFormat('YYYY-MM-DD HH:MI:SS'));
console.log('******************************************************************************************');

}

function formatListDeliveries(deliveries, done) {
  async.forEach(deliveries, function(delivery, callback) {
    formatDelivery(delivery, function(user, data_header, data_detail) {
      facebook.sendList(user.code, data_header, function(res) {
        db.get().collection('events_senator_commissions_deliveries').findOneAndUpdate(
          { _id: delivery._id },
          { $set: { delivery: true } },
          function(err, res) {
            assert.equal(null,err);
            callback();
          }
        );
      });
    });
  }, function() {
    done();
  });
}


function formatDelivery(delivery, done) {

  var element_list = [];
  var element_buttons = [];

  var user;
  var commission;
  var politician;

  async.series([

    function(callback) {
      db.get().collection('users').findOne({ _id: delivery._idUser}, function(err, res) {
        user = res;
        callback();
      })
    },

    function(callback) {
      db.get().collection('events_senator_commissions').findOne({ _id: delivery._idEvent}, function(err, res) {
        commission = res;
        callback();
      })
    },

    function(callback) {
      db.get().collection('politicians_senator').findOne({ code: commission.codigoParlamentar}, function(err, res) {
        politician = res;
        callback();
      })
    },

    function(callback) {
      element_list.push({
        title: 'Participação em Comissões',
        image_url: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509477737/anovavoz-cover-congresso_uvhfi5.jpg',
        subtitle: 'Compartilhe utilizando #ANovaVoz',
        default_action: {
            type: 'web_url',
            url: 'https://www.anovavoz.com.br',
            messenger_extensions: true,
            webview_height_ratio: 'tall',
            fallback_url: 'https://www.anovavoz.com.br'
        }
      });
      element_list.push({
        title: utilities.trimText(politician.treatment)+' '+politician.name,
        image_url: 'https://www.senado.leg.br/senadores/img/fotos-oficiais/senador'+politician.code+'.jpg',
        subtitle: 'Partido '+politician.acronym_political_party+' - '+politician.state,
        default_action: {
            type: 'web_url',
            url: 'https://www25.senado.leg.br/web/senadores/senador/-/perfil/'+politician.code,
            messenger_extensions: true,
            webview_height_ratio: 'tall',
            fallback_url: 'https://www25.senado.leg.br/web/senadores/senador/-/perfil/'+politician.code
        }
      });
      element_list.push({
        title: 'Tornou-se '+commission.descricaoParticipacao+' na comissão '+commission.siglaComissao+' em '+utilities.dateReplaceFormat(commission.dataInicio),
        subtitle: commission.nomeComissao,
        default_action: {
            type: 'web_url',
            url: 'https://www25.senado.leg.br/web/senadores/senador/-/perfil/'+politician.code,
            messenger_extensions: true,
            webview_height_ratio: 'tall',
            fallback_url: 'https://www25.senado.leg.br/web/senadores/senador/-/perfil/'+politician.code
        }
      });
      element_buttons.push({
        type: "element_share"
      });
      callback();
    },

    function(callback) {
      data_header = {
        attachment: {
          type: "template",
          payload: {
            template_type: "list",
            elements: element_list,
            buttons: element_buttons
          }
        }
      }
      callback();
    }

  ], function() {
    done(user, data_header);
  });

}
