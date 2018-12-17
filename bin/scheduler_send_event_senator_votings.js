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

  console.log('**************************************************************************************');
  console.log('** Start HEROKU SCHEDULER scheduler_send_event_senator_votings.js at', momentNow);
  console.log('**************************************************************************************');

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
      /********
      auth = 'waiting'    --> Aguardando autorização para envio
      auth = 'authorized' --> Evento autorizado para envio
      auth = 'sent'       --> Evento enviado para usuários
      *******/
      db.get().collection('events_senator_votings').findOne({ auth: 'authorized' }, function(err, document) {
        if (document) {
          event = document;
          db.get().collection('events_senator_votings_deliveries').find({ delivery: false, '_idEventVoting' : document._id }).toArray(function(err, documents) {
            deliveries = documents;
            callback();
          })
        } else {
          console.log('** Nenhum registro [events_senator_votings] autorizado para envio.');
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
        db.get().collection('events_senator_votings').findOneAndUpdate({_id: event._id}, {$set: {auth: 'sent'}});
        callback();
      } else {
        callback();
      }
    },

  ], function() {
    db.close(function(err) {
      console.log('** MongoDB disconnected!');
      console.log('** The End!!');
      console.log('**************************************************************************************');
    });
  })
}


function formatListDeliveries(deliveries, done) {

  async.forEach(deliveries, function(delivery, callback) {
    formatDelivery(delivery, function(user, data_header, data_detail, data_description, desc_result) {
      facebook.sendList(user.code, data_header, function(res) {
        facebook.sendResponse(user.code, data_description, function(res) {
          facebook.sendResponse(user.code, desc_result, function(res) {
            facebook.sendList(user.code, data_detail, function(res) {
              db.get().collection('events_senator_votings_deliveries').findOneAndUpdate(
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
  }, function() {
    done();
  });
}


function formatDelivery(delivery, done) {

  var element_header = [];
  var element_detail = [];
  var buttons = [];
  var description = '';
  var desc_result = '';
  var voting_type = '';
  var voting_res = '';

  var voting;
  var user;
  var followers;
  var data;

  async.series([

    function(callback) {
      db.get().collection('events_senator_votings').findOne({_id: delivery._idEventVoting}, function(err, document) {
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
      db.get().collection('followers_senator').find({user: user.code}).toArray(function(err, res) {
        followers = res;
        callback();
      });
    },

    function(callback) {
      // Header
      if (voting.event.siglaCasa == 'SF') {
        casa = 'Senado Federal';
      } else if (voting.event.siglaCasa == 'CN') {
        casa = 'Congresso Nacional';
      } else {
        casa = voting.event.siglaCasa;
      }

      if (voting.event.secreta == "N") {
        voting_type = 'Votação ABERTA';
      } else {
        voting_type = 'Votação SECRETA';
      }

      if (voting.event.resultado == "A") {
        voting_res = 'Resultado APROVADA';
      } else if (voting.event.resultado == "R") {
        voting_res = 'Resultado NÃO APROVADA';
      } else {
        voting_res = 'Resultado Não Divulgado';
      }

      description = voting.event.descricaoVotacao.substr(0, 639);

      var totalVotos =  parseInt(voting.event.totalVotosSim) +
                        parseInt(voting.event.totalVotosNao) +
                        parseInt(voting.event.totalVotosAbstencao);
      
      if (totalVotos > 0) {
        desc_result = "Sim: " + voting.event.totalVotosSim + "\n" +
                      "Não: " + voting.event.totalVotosNao + "\n" +
                      "Abstenção: " + voting.event.totalVotosAbstencao;        
      }

      element_header.push({
        title: 'Votação ' + casa + '\n' + ' em ' + utilities.dateReplaceFormat(voting.event.dataSessao),
        image_url: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509477737/anovavoz-cover-congresso_uvhfi5.jpg',
        subtitle: voting.event.siglaMateria + ' ' + parseInt(voting.event.numeroMateria) + '/' + voting.event.anoMateria,
        default_action: {
            type: 'web_url',
            url: 'https://www.anovavoz.com.br',
            messenger_extensions: true,
            webview_height_ratio: 'tall',
            fallback_url: 'https://www.anovavoz.com.br'
        }
      });
      element_header.push({
        title: voting_res,
        subtitle: voting_type,
      });
      callback();
    },

    function(callback) {
      // List votes
      async.forEach(voting.votes, function(vote, callback) {
        async.forEach(followers, function(follower, callback) {
          if (vote.codigoParlamentar == follower.code) {
            element_detail.push({
              title: utilities.formatVote(vote.voto),
              image_url: 'https://www.senado.leg.br/senadores/img/fotos-oficiais/senador'+vote.codigoParlamentar+'.jpg',
              subtitle: 'Sen. '+vote.nomeParlamentar + '-'+vote.siglaPartido+'/'+vote.siglaUF,
              default_action: {
                  type: 'web_url',
                  url: 'https://www25.senado.leg.br/web/senadores/senador/-/perfil/'+vote.codigoParlamentar,
                  messenger_extensions: true,
                  webview_height_ratio: 'tall',
                  fallback_url: 'https://www25.senado.leg.br/web/senadores/senador/-/perfil/'+vote.codigoParlamentar
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

        data_description = description;

        data_header = {
          attachment: {
            type: "template",
            payload: {
              template_type: "list",
              elements: element_header
            }
          }
        }

        data_detail = {
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
    done(user, data_header, data_detail, data_description, desc_result);
  });
}
