#!/usr/bin/env node

var request = require('request');
var assert = require('assert');
var async = require('async');

require('dotenv').config();

var utilities = require('../controllers/utilities');
var facebook = require('../controllers/facebook');

var db = require('../models/db');
var user = require('../models/user');

console.log('**************************************************************************************');
console.log('** Start HEROKU SCHEDULER scheduler_send_news.js at');
console.log('**************************************************************************************');

var elements = [];
var buttons = [];

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
    elements.push({
      title: 'A NOVA VOZ - News',
      image_url: "https://res.cloudinary.com/hgfippcp2/image/upload/v1509529054/cover-face_qid3sb.jpg",
      subtitle: 'Acompanhe o Poder Executivo de Porto Alegre!',
      default_action: {
          type: 'web_url',
          url: 'https://www.anovavoz.com.br',
          messenger_extensions: true,
          webview_height_ratio: 'tall',
          fallback_url: 'https://www.anovavoz.com.br'
      }
    });

    elements.push({
      title: "Contratos - Porto Alegre",
      subtitle: "Acompanhe os Contratos assinados pela Prefeitura de Porto Alegre.",
      image_url: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509477737/anovavoz-cover-poa_rhwq8d.jpg'
    });

    elements.push({
      title: "Licitações - Porto Alegre",
      subtitle: "Acompanhe as Licitações de Porto Alegre.",
      image_url: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509477737/anovavoz-cover-poa_rhwq8d.jpg'
    });

    buttons.push({
      "title": "Seguir Porto Alegre",
      "type": "postback",
      "payload": "FOLLOW_RS_PORTO_ALEGRE_EXEC"            
    });
    callback();
  },

  function(callback) {
    user.findAll(function(users) {

      async.forEachLimit(users, 1, function(user, callback) {

        console.log('** Avisando o '+user.first_name);

        setTimeout( function() {
          facebook.sendListButton(user.code, elements, buttons, function(res) {
            callback();
          });
        }, 1500);

      }, function() {
        callback();
      });
    });
  },

  function(callback) {
    setTimeout( function() {
      db.get().close( function(err) {
        assert.equal(null, err);
        console.log('** MongoDB Disconnected!!!');
        callback();
      })
    }, 1000);
  }

], function() {
  console.log('** The End!!');
});
