#!/usr/bin/env node

var express = require('express');
var request = require('request');
var assert = require('assert');
var bodyParser = require('body-parser');

require('dotenv').config();

var dateDebug = getDateFormat(true);
console.log('Start HEROKU SCHEDULER scheduler_politicians at',dateDebug);

var app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var options = {
  url: 'http://legis.senado.leg.br/dadosabertos/senador/lista/atual',
  headers: {
    'Accept': 'application/json'
  }
};

var MongoClient = require('mongodb').MongoClient;

request(options, function (error, response, body) {

  var body = JSON.parse(body);
  var parlamentares = body['ListaParlamentarEmExercicio']['Parlamentares']['Parlamentar'];

  if (parlamentares) {

    var url = process.env.MONGODB_URI

    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);

      var collection = db.collection('politicians_senator');

      collection.deleteMany({}, function(err, result) {
        assert.equal(null,err);
        console.log(String(result.deletedCount) + " records deleted!!");

        //var fs = require('fs');
        //var wstream = fs.createWriteStream('politicians.csv');

        for (indice in parlamentares) {
          var parlamentar = parlamentares[indice]['IdentificacaoParlamentar']

          collection.insertOne({
            code: parlamentar['CodigoParlamentar'],
            type: 'Senador',
            name: parlamentar['NomeParlamentar'],
            full_name: parlamentar['NomeCompletoParlamentar'],
            gender: parlamentar['SexoParlamentar'],
            picture: parlamentar['UrlFotoParlamentar'],
            webpage: parlamentar['UrlPaginaParlamentar'],
            email: parlamentar['EmailParlamentar'],
            acronym_political_party: parlamentar['SiglaPartidoParlamentar'],
            state: parlamentar['UfParlamentar'],
            treatment: parlamentar['FormaTratamento']
          },
            function(err, result) {
              assert.equal(err, null);
            }
          );

          indice = indice + 1;

          string_politician = 'politicians,' + parlamentar['NomeParlamentar'] + ',' + parlamentar['FormaTratamento'] + parlamentar['NomeParlamentar'] + ',' + parlamentar['NomeCompletoParlamentar']+'\n';
          console.log(string_politician);
          //wstream.write(string_politician);
        };
        //wstream.end();

        collection.createIndex({name: "text"});
        db.close();
      });
    });
  }
});

function getDateFormat(dateTime) {
  var dateFormart = '';
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  month = (month < 10 ? '0' : '') + month;
  var day  = date.getDate();
  day = (day < 10 ? '0' : '') + day;

  dateFormart = year+'-'+month+'-'+day;

  if(dateTime){
    var hour = date.getHours();
    hour = (hour < 10 ? '0' : '') + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? '0' : '') + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? '0' : '') + sec;
    dateFormart = dateFormart+' '+hour+':'+min+':'+sec;
  }
  return dateFormart;
}
