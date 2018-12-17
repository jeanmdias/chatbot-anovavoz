#!/usr/bin/env node

var express = require('express');
var request = require('request');
var assert = require('assert');
var async = require('async');

require('dotenv').config();

var db = require('../models/db');

console.log(' ');
console.log('**************************************************************************************');
console.log('Start HEROKU SCHEDULER scheduler_politicians_dep_federal.js');
console.log('**************************************************************************************');
console.log(' ');

var fs = require('fs');
var wstream = fs.createWriteStream('deputados.csv');

async.series([

  function(callback) {
    db.connect(function(err) {
      if (err) {
        console.log('Nao foi possivel conectar no MongoDB!!');
        process.exit(1);
      } else {
        console.log('MongoDB Connected!!!');
        console.log(' ');
        callback();
      }
    });
  },

  function(callback) {
    getPoliticians(1, function(res) {
      callback();
    });
  },

  function(callback) {
    getPoliticians(2, function(res) {
      callback();
    });
  },

  function(callback) {
    getPoliticians(3, function(res) {
      callback();
    });
  },

  function(callback) {
    getPoliticians(4, function(res) {
      callback();
    });
  },

  function(callback) {
    getPoliticians(5, function(res) {
      callback();
    });
  },

  function(callback) {
    getPoliticians(6, function(res) {
      callback();
    });
  },

], function() {
  wstream.end();
  db.close(function(err) {
    console.log('MongoDB Disconnected!!');
  });
});


function getPoliticians(page, done) {

  var options = {
    url: 'https://dadosabertos.camara.leg.br/api/v2/deputados/?pagina='+page+'&itens=100',
    headers: {
      'Accept': 'application/json'
    }
  };

  request(options, function (error, response, body) {

    var body = JSON.parse(body);
    var parlamentares = body['dados'];

    console.log('Page '+page+', total Dep. Federal',parlamentares.length);

    async.forEach(parlamentares, function(parlamentar, callback) {

console.log(parlamentar);

      db.get().collection('politicians_dep_federal').insertOne({
        code: parlamentar['id'],
        type: 'Deputado Federal',
        name: formatName(parlamentar['nome']),
        picture: parlamentar['urlFoto'],
        webpage: parlamentar['uri'],
        acronym_political_party: parlamentar['siglaPartido'],
        state: parlamentar['siglaUf'],
        treatment: 'Dep. Federal'
      }, function(err, res) {
        assert.equal(null, err);
      });

      string_politician = 'politicians_dep_federal,' + formatName(parlamentar['nome'])+'\n';
      wstream.write(string_politician);
      callback();
    }, function() {
      done();
    });
  });
}

/*
 * Formata "NOME DO POLITICO" para "Nome Do Politico"
 */
function formatName(name) {

  var str_name = name;
  var str_name_format = '';

  var str_array = str_name.split(' ');

  for (var i = 0; i < str_array.length; i++) {

     str_name = str_array[i];
     str_name = str_name.substr(0,1)+str_name.substr(1,str_name.length).toLowerCase();
     str_name_format = str_name_format+' '+str_name;

  }

  return str_name_format.trim();

}
