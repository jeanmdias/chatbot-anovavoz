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
var moment = require('moment-timezone');

var momentNow = moment.tz("America/Sao_Paulo").format('DD/MM/YYYY HH:MI:SS');
var momentHour = moment.tz("America/Sao_Paulo").hour();

if (momentHour >= 8 && momentHour <= 20) {

  console.log('********************************************************************************************');
  console.log('** Start HEROKU scheduler_send_event_dep_federal_votings.js at', utilities.dateFormat('YYYY-MM-DD HH:MI:SS'));
  console.log('********************************************************************************************');

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

    function(callback) {
      db.get().collection('events_dep_federal_votings').findOne({ auth: 'authorized'}, function(err, document) {
        if (document) {
          event = document;
          db.get().collection('events_dep_federal_votings_deliveries').find({ 'delivery' : false, '_idEventVoting' : document._id }).toArray(function(err, documents) {
            deliveries = documents;
            callback();
          })
        } else {
          console.log('** Nenhum registro [events_dep_federal_votings] autorizado para entrega.');
          callback();
        }
      });
    },

    function(callback) {
      if (deliveries.length > 0) {
        formatListDeliveries(deliveries, function(res) {
          callback();
        });
      } else {
        callback();
      }
    },

    function(callback) {
      if (event) {
        db.get().collection('events_dep_federal_votings').findOneAndUpdate({_id: event._id}, {$set: {auth: 'sent'}});
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
}

function formatListDeliveries(deliveries, done) {
  async.forEach(deliveries, function(delivery, callback) {
    formatDelivery(delivery, function(user, message1, message2, message3, message4, ementa) {
      facebook.sendList(user.code, message1, function(res) {
        facebook.sendResponse(user.code, ementa, function(res) {
          facebook.sendResponse(user.code, message2, function(res) {
            facebook.sendResponse(user.code, message3, function(res) {
              facebook.sendList(user.code, message4, function(res) {
                db.get().collection('events_dep_federal_votings_deliveries').findOneAndUpdate(
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
        });
      });
    });
  }, function() {
    done();
  });
}


function formatDelivery(delivery, done) {

  var element_message1 = [];
  var element_detail = [];
  var buttons = [];
  var message2 = '';
  var message3 = '';
  var ementa = '';
  var voting_type = '';
  var voting_res = '';

  var voting;
  var user;
  var followers;
  var data;

  async.series([

    function(callback) {
      db.get().collection('events_dep_federal_votings').findOne({_id: delivery._idEventVoting}, function(err, document) {
        voting = document;
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
      db.get().collection('followers_dep_federal').find({user: user.code}).toArray(function(err, res) {
        followers = res;
        callback();
      });
    },

    function(callback) {
      // Header
      if (voting.event.resultado == true) {
        voting_res = 'Resultado APROVADA';
      } else if (voting.event.resultado == false) {
        voting_res = 'Resultado NÃO APROVADA';
      } else {
        voting_res = 'Resultado Não Divulgado';
      }

      element_message1.push({
        title: 'Votação Câmara dos Deputados',
        image_url: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509477737/anovavoz-cover-congresso_uvhfi5.jpg',
        subtitle: 'Sessão '+voting.event.codSessao+' - '+voting.event.dataVotacao + ' às '+ voting.event.horaVotacao,
        default_action: {
            type: 'web_url',
            url: 'https://www.anovavoz.com.br',
            messenger_extensions: true,
            webview_height_ratio: 'tall',
            fallback_url: 'https://www.anovavoz.com.br'
        }
      });

      element_message1.push({
        title: voting.event.tipoProposicao+' '+voting.event.numero+'/'+voting.event.ano,
        subtitle: 'Cód: ' + voting.event.codProposicao,
      });

      callback();
    },

    function(callback) {
      message2 = voting.event.objVotacao.substr(0, 639);
      callback();
    },

    function(callback) {
      message3 = voting.event.resumo.substr(0, 639);
      callback();
    },

    function(callback) {
      ementa = voting.event.ementa.substr(0, 639);
      callback();
    },

    function(callback) {
      // List votes
      async.forEach(voting.votes, function(vote, callback) {
        async.forEach(followers, function(follower, callback) {
          if (vote.codigoParlamentar == follower.code) {
            element_detail.push({
              title: utilities.formatVote(vote.voto),
              image_url: 'https://www.camara.leg.br/internet/deputado/bandep/'+vote.codigoParlamentar+'.jpg',
              subtitle: 'Dep. Federal '+vote.nomeParlamentar + '-'+ vote.siglaPartido + '/'+vote.siglaUF,
              default_action: {
                  type: 'web_url',
                  url: 'https://dadosabertos.camara.leg.br/api/v2/deputados/'+vote.codigoParlamentar,
                  messenger_extensions: true,
                  webview_height_ratio: 'tall',
                  fallback_url: 'https://dadosabertos.camara.leg.br/api/v2/deputados/'+vote.codigoParlamentar
              }
            });
            callback();
          } else {
            callback();
          }
        }, function() {
          callback();
        });
      }, function() {

        message1 = {
          attachment: {
            type: "template",
            payload: {
              template_type: "list",
              elements: element_message1
            }
          }
        }

        buttons.push({
          title: 'Seguir + parlamentares',
          type: 'postback',
          payload: 'FOLLOW'
        });

        if (element_detail.length == 1) {
          element_detail.push({
            title: 'Continue acompanhando seus parlamentares.',
            subtitle: 'No futuro, mais informações!',
          });
        }

        message4 = {
          attachment: {
            type: "template",
            payload: {
              template_type: "list",
              top_element_style: "compact",
              elements: element_detail,
              buttons: buttons
            }
          }
        }

        callback();
      })
    }
  ], function() {
    done(user, message1, message2, message3, message4, ementa);
  });
}
