#!/usr/bin/env node

var express = require('express');
var request = require('request');
var assert = require('assert');
var async = require('async');
var bodyParser = require('body-parser');

require('dotenv').config();

console.log('Start HEROKU scheduler_politicians_sp_sao_paulo.js at');

var app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var options = {
  url: 'http://splegisws.camara.sp.gov.br/ws/ws2.asmx/OcupacaoGabineteJSON',
  headers: {
    'Accept': 'application/json'
  }
};

var MongoClient = require('mongodb').MongoClient;

request(options, function (error, response, body) {

  var body = JSON.parse(body);
  var url = process.env.MONGODB_URI
  var politicians = [];

  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);

    var collection = db.collection('politicians_sp_sao_paulo');

    collection.deleteMany({}, function(err, result) {
      assert.equal(null,err);
      console.log(String(result.deletedCount) + " records deleted!!");

      async.forEach( body, function(politician, callback) {
        
        if (politician.legislatura == 17) {  
          add_permalink(politician.vereador, function(name_webpage) {
            titleize(politician.vereador, function(name) {
              politicians.push({
                code: politician.codigo,
                name: name,
                webpage: 'http://www.camara.sp.gov.br/vereador/'+name_webpage+'/',
              });
              callback();            
            });
          });

        } else {
          callback();
        }
      }, function() {
        db.close();
        console.log(politicians);
        console.log('Vereadores importados --> ',politicians.length)
      });
    });
  });
});

function titleize(text, callback) {
  var words = text.toLowerCase().split(" ");
  for (var a = 0; a < words.length; a++) {
      var w = words[a];
      words[a] = w[0].toUpperCase() + w.slice(1);
  }
  callback(words.join(" "));
}


function add_permalink(texto, callback) {

  texto = texto.toLowerCase();
  texto = texto.replace(/[á|ã|â|à]/gi, "a");
  texto = texto.replace(/[é|ê|è]/gi, "e");
  texto = texto.replace(/[í|ì|î]/gi, "i");
  texto = texto.replace(/[õ|ò|ó|ô]/gi, "o");
  texto = texto.replace(/[ú|ù|û]/gi, "u");
  texto = texto.replace(/[ç]/gi, "c");
  texto = texto.replace(/[ñ]/gi, "n");
  texto = texto.replace(/[á|ã|â]/gi, "a");

  //faz a substituição dos espaços e outros caracteres por - (hífen)
  texto = texto.replace(/\s/gi, "-");

  // remove - (hífen) duplicados
  texto = texto.replace(/(-)1+/gi, "-");
  
  callback(texto);
}
