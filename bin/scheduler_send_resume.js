#!/usr/bin/env node

var express = require('express');
var assert = require('assert');
var async = require('async');

require('dotenv').config();

var db = require('../models/db');
var user = require('../models/user');
var service = require('../models/service');
var facebook = require('../controllers/facebook');
var moment = require('moment-timezone');

var momentNow = moment.tz("America/Sao_Paulo").format('DD/MM/YYYY HH:MI:SS');
var moment_hour = moment.tz("America/Sao_Paulo").hour();

if (moment_hour >= 8 && moment_hour <= 20) {

  console.log('**************************************************************************************');
  console.log('Start HEROKU scheduler_resume.js at', momentNow);
  console.log('**************************************************************************************');

  var totalUsers = 0;
  var totalDeliveriesSenator = 0;
  var totalDeliveriesDepFederal = 0;
  var totalDeliveriesRsPortoAlegre = 0;
  var usersActive = [];
  var services;

  var message1 = '';
  var message2 = '';
  var element_message1 = [];
  var element_message2 = [];
  var pendencies = false;

  async.series([

    function(callback) {
      db.connect(function(err) {
        if (err) {
          console.log('** Nao foi possivel conectar no MongoDB!!');
          process.exit(1);
        } else {
          console.log('** MongoDB Connected!!!');
          console.log(' ');
          callback();
        }
      });
    },

    function(callback) {
      db.get().collection('users').find().toArray(function(err, res) {
        totalUsers = res.length;
        callback();
      });
    },

    function(callback) {
      db.get().collection('events_senator_votings').find({auth: 'waiting'}).toArray(function(err, res) {
        totalDeliveriesSenator = res.length;
        callback();
      });
    },

    function(callback) {
      db.get().collection('events_dep_federal_votings').find({auth: 'waiting'}).toArray(function(err, res) {
        totalDeliveriesDepFederal = res.length;
        callback();
      });
    },

    function(callback) {
      db.get().collection('events_rs_porto_alegre_votings').find({auth: 'waiting'}).toArray(function(err, res) {
        totalDeliveriesRsPortoAlegre = res.length;
        callback();
      });
    },

    function(callback) {
      service.get(function(res) {
        services = res;
        callback();
      })
    },

    function(callback) {
      async.forEach(services, function(s, callback) {
        db.get().collection('followers_'+s.name).find().toArray(function(err, res) {
          async.forEach(res, function(f, callback) {
            var _index = usersActive.indexOf(f.user);
            if (_index == -1) {
              usersActive.push(f.user);
              callback();
            } else {
              callback();
            }
          }, function() {
            callback();
          });
        });
      }, function() {
        callback();
      });
    },

    function(callback) {
      element_message1.push({
        title: 'A NOVA VOZ - Usuários',
        image_url: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509529054/cover-face_qid3sb.jpg',
        subtitle: 'Resumo diário',
        default_action: {
            type: 'web_url',
            url: 'https://www.anovavoz.com.br',
            messenger_extensions: true,
            webview_height_ratio: 'tall',
            fallback_url: 'https://www.anovavoz.com.br'
        }
      });

      element_message1.push({
        title: 'Total Usuários',
        subtitle: totalUsers
      });

      element_message1.push({
        title: 'Usuários ATIVOS',
        subtitle: usersActive.length + ' - ' + (usersActive.length*100/totalUsers).toFixed(2) + "%"
      });

      message1 = {
        attachment: {
          type: "template",
          payload: {
            template_type: "list",
            elements: element_message1
          }
        }
      }
      callback();
    },


    function(callback) {
      element_message2.push({
        title: 'A NOVA VOZ - Pendências',
        image_url: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509529054/cover-face_qid3sb.jpg',
        subtitle: 'Resumo diário',
        default_action: {
            type: 'web_url',
            url: 'https://www.anovavoz.com.br',
            messenger_extensions: true,
            webview_height_ratio: 'tall',
            fallback_url: 'https://www.anovavoz.com.br'
        }
      });

      if (totalDeliveriesSenator > 0) {
        element_message2.push({
          title: 'Senado Federal',
          subtitle: 'Votações: ' + totalDeliveriesSenator
        });
        pendencies = true;
      }

      if (totalDeliveriesDepFederal > 0) {      
        element_message2.push({
          title: 'Câmara de Deputados',
          subtitle: 'Votações: ' + totalDeliveriesDepFederal
        });
        pendencies = true;
      }

      if (totalDeliveriesRsPortoAlegre > 0) {
        element_message2.push({
          title: 'Câmara de PORTO ALEGRE ',
          subtitle: 'Votações: ' + totalDeliveriesRsPortoAlegre
        });        
        pendencies = true;
      }

      message2 = {
        attachment: {
          type: "template",
          payload: {
            template_type: "list",
            elements: element_message2
          }
        }
      }
      callback();
    },

    function(callback) {
      if(moment_hour == 20) {
        facebook.sendList(1553273071358884, message1, function(res) {
          facebook.sendList(1561693973871939, message1, function(res) {
            facebook.sendList(1293438224038341, message1, function(res) {
              callback();
            });
          });
        });
      }
    },  

    function(callback) {
      if(moment_hour == 20 || pendencies) {
        facebook.sendList(1553273071358884, message2, function(res) {
          facebook.sendList(1561693973871939, message2, function(res) {
            facebook.sendList(1293438224038341, message2, function(res) {
              callback();
            });
          });
        });
      } else {
        callback();
      }
    },  


  ], function() {
    db.close(function(err) {
      console.log('** MongoDB Disconnected!!');
    });
  });
}
