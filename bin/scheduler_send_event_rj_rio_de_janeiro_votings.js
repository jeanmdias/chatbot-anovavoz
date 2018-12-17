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


utilities.allowedSend(function(res) {

  if (res) {
    console.log('********************************************************************************************');
    console.log('** Start HEROKU scheduler_send_event_rj_rio_de_janeiro_votings.js');
    console.log('********************************************************************************************');

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
        db.get().collection('events_rj_rio_de_janeiro_votings_deliveries').findOne({ 'delivery' : false}, function(err, document) {
          if (document) {
            db.get().collection('events_rj_rio_de_janeiro_votings_deliveries').find({ 'delivery' : false, '_idEventVoting' : document._idEventVoting }).toArray(function(err, documents) {
              deliveries = documents;
              callback();
            })
          } else {
            console.log('** Nenhum registro [events_rj_rio_de_janeiro_votings_deliveries] para ser entregue.');
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
        console.log('** MongoDB Disconnected!');
        console.log('** The End!!');
        console.log('********************************************************************************************');
      });
    })
  }
})


function formatListDeliveries(deliveries, done) {
  async.forEach(deliveries, function(delivery, callback) {
    formatDelivery(delivery, function(user, message1, message2, message3, message4, message5) {
      facebook.sendList(user.code, message1, function(res) {
        facebook.sendResponse(user.code, message2, function(res) {
          facebook.sendResponse(user.code, message3, function(res) {
            facebook.sendResponse(user.code, message4, function(res) {
              facebook.sendList(user.code, message5, function(res) {
                db.get().collection('events_rj_rio_de_janeiro_votings_deliveries').findOneAndUpdate(
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
  var message4 = '';
  var message5 = '';
  var voting_type = '';
  var voting_res = '';

  var voting;
  var user;
  var followers;
  var data;

  async.series([

    function(callback) {
      db.get().collection('events_rj_rio_de_janeiro_votings').findOne({_id: delivery._idEventVoting}, function(err, document) {
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
      db.get().collection('followers_rj_rio_de_janeiro').find({user: user.code}).toArray(function(err, res) {
        followers = res;
        console.log(followers);
        callback();
      });
    },

    function(callback) {
      // Header
      if (voting.event.resultado == "A") {
        voting_res = 'Resultado APROVADA';
      } else if (voting.event.resultado == "R") {
        voting_res = 'Resultado NÃO APROVADA';
      } else {
        voting_res = 'Resultado Não Encontrado';
      }

      if (voting.event.secreta == "N") {
        voting_type = 'Votação ABERTA';
      } else {
        voting_type = 'Votação SECRETA';
      }

      element_message1.push({
        title: 'Votação Câmara Municipal Rio de Janeiro em '+utilities.dateReplaceFormat(voting.event.dataSessao),
        image_url: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1510107564/anovavoz-cover-rj_yrkqsu.jpg',
        subtitle: voting.event.siglaMateria+' '+voting.event.numeroMateria+'/'+voting.event.anoMateria,
        default_action: {
            type: 'web_url',
            url: 'https://www.anovavoz.com.br',
            messenger_extensions: true,
            webview_height_ratio: 'tall',
            fallback_url: 'https://www.anovavoz.com.br'
        }
      });

      element_message1.push({
        title: voting_res,
        subtitle: voting_type,
      });

      callback();
    },

    function(callback) {
      message2 = voting.event.proposicao.substr(0, 639);
      callback();
    },

    function(callback) {
      message3 = voting.event.ementa.substr(0, 639);
      callback();
    },

    function(callback) {
      var totalVotos =  parseInt(voting.event.totalVotosSim) +
                        parseInt(voting.event.totalVotosNao) +
                        parseInt(voting.event.totalVotosAbstencao);

      if (totalVotos > 0) {
        message4    = "Sim: " + voting.event.totalVotosSim + "\n" +
                      "Não: " + voting.event.totalVotosNao + "\n" +
                      "Abstenção: " + voting.event.totalVotosAbstencao;
      }
      callback();
    },

    function(callback) {
      // List votes
      async.forEach(followers, function(follower, callback) {
        async.forEach(voting.votes, function(vote, callback) {
          if (vote.codigoParlamentar == follower.code) {
            db.get().collection('politicians_rj_rio_de_janeiro').findOne({code: vote.codigoParlamentar}, function(err,res) {

              element_detail.push({
                title: utilities.formatVote(vote.voto),
                image_url: res.picture,
                subtitle: 'Ver. '+vote.nomeParlamentar + '-'+ vote.siglaPartido,
                default_action: {
                    type: 'web_url',
                    url: res.webpage,
                    messenger_extensions: true,
                    webview_height_ratio: 'tall',
                    fallback_url: res.webpage
                }
              });
              callback();
            })
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
          title: 'Seguir + vereadores.',
          type: 'postback',
          payload: 'FOLLOW_RJ_RIO_DE_JANEIRO'
        });

        if (element_detail.length == 1) {
          element_detail.push({
            title: 'Continue acompanhando A Nova Voz.',
            subtitle: 'No futuro, mais informações!',
          });
        }

        message5 = {
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
    done(user, message1, message2, message3, message4, message5);
  });
}
