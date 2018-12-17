#!/usr/bin/env node

var express = require('express');
var request = require('request');
var assert = require('assert');
var lupus = require('lupus');
var async = require('async');
var moment = require('moment-timezone');

var twitter = require('../controllers/twitter');

require('dotenv').config();

var db = require('../models/db');
var user = require('../models/user');

var dateEnd = moment().format('YYYYMMDD');
var dateStart = moment().subtract(10, 'days').format('YYYYMMDD');

console.log(' ');
console.log('**************************************************************************************');
console.log('** Start HEROKU scheduler_get_event_senator_votings.js at', moment().format("dddd, MMMM Do YYYY, h:mm:ss a"));
console.log('**************************************************************************************');

db.connect(function(err) {
  if (err) {
    console.log('** Não foi possivel conectar no MongoDB!!');
    process.exit(1);
  } else {
    console.log('** MongoDB Connected!!!');
  }
});

var options = {
  url: 'http://legis.senado.leg.br/dadosabertos/plenario/lista/votacao/'+dateStart+'/'+dateEnd+'?v=2',
  headers: {
    'Accept': 'application/json'
  }
};

request(options, function (error, response, body) {
  var body = JSON.parse(body);

  if (body['ListaVotacoes']['Votacoes'] == undefined) {
    console.log('** Não existe votação no período.');
    setTimeout( function() {
      db.get().close( function(err) {
        assert.equal(null, err);
        console.log('** MongoDB Disconnected!!!');
        callback();
      })
    }, 1000);
    return;
  }

  var votings = body['ListaVotacoes']['Votacoes']['Votacao'];
  var count_votings = votings.length;

  if (count_votings == undefined) {
    count_votings = 1;
    votings = [votings];
  }

  var _idsEventVoting = [];
  var usersForDelivery = [];

  async.series([

    function(callback) {
      async.forEach(votings, function(voting, callback) {
        checkVoting(voting, function(documentVoting)  {

          if (voting['Votos'] && voting['Votos']['VotoParlamentar']) {
            checkVotes(voting['Votos']['VotoParlamentar'], function(documentVotes) {
              insertEventVoting(documentVoting, documentVotes, function(type, _id, codigoMateria) {
                console.log('**', type, _id, codigoMateria);
//                if(documentVoting.secreta != 'S') {
                  _idsEventVoting.push({type, _id});
//                }
                callback();
              });
            });
          } else {
            console.log('**', voting.SiglaMateria, voting.NumeroMateria+'/'+voting.AnoMateria, 'Não existem votos cadastrados.');
            callback();
          }
        });
      }, function() {
        console.log('**', 'Votações encontradas --> ', count_votings);
        callback();
      });
    },

    function(callback) {
      user.findFollowersSenator(function(users) {
        usersForDelivery = users;
        console.log('** Usuários para entrega --> ', usersForDelivery.length)
        callback();
      });
    },

    function(callback) {
      insertEventDelivery(_idsEventVoting, usersForDelivery, function(cb) {
        console.log('** Eventos para entregar --> ', cb.length);
        callback();
      });
    },

    function(callback) {
      setTimeout( function() {
        db.get().close( function(err) {
          assert.equal(null, err);
          console.log('** MongoDB Disconnected!!!');
          callback();
        })
      }, count_votings * 500);
    }
  ], function() {
    console.log('** The End!!');
    console.log('**************************************************************************************');
  });
});


function insertEventVoting(documentVoting, documentVotes, callback) {
  db.get().collection('events_senator_votings').findOne({
    'event.codigoMateria'       : documentVoting.codigoMateria,
    'event.codigoSessaoVotacao' : documentVoting.codigoSessaoVotacao,
    'event.sequencialSessao'    : documentVoting.sequencialSessao
  }, function(err, res) {
    assert.equal(null, err);
    if (!res) {
      db.get().collection('events_senator_votings').insertOne({
        auth: 'waiting',
        event: documentVoting,
        votes: documentVotes
      }, function(err, res) {
        assert.equal(null, err);
        postTwitter(documentVoting);
        callback('I', res.ops[0]._id, res.ops[0].event.codigoMateria);
      });
    } else {
      callback('R', res._id, res.event.codigoMateria);
    }
  })
}


function insertEventDelivery(eventVotings, usersForDelivery, callback) {
  var document = [];

  async.forEach(eventVotings, function(eventVoting, callback) {

    async.forEach(usersForDelivery, function(user, callback) {

      if (user.user_followers.length > 0) {

        db.get().collection('events_senator_votings_deliveries').findOne({ _idEventVoting: eventVoting._id,
                                                          _idUser: user._id
                                                        }, function(err, res) {
          assert.equal(null, err);
          if (res == null) {
            document.push({
              _idEventVoting: eventVoting._id,
              _idUser: user._id,
              delivery: false
            });
            callback();
          } else {
            callback();
          }
        });

      } else {
        callback();
      }
    }, function() {
      callback();
    });
  }, function() {
    try {
      if (document.length > 0) {
        res = db.get().collection('events_senator_votings_deliveries').insertMany(document);
        callback(document);
      } else {
        callback(document);
      }
    } catch(e) {
      console.log(e);
    }
  });
}

function checkVoting(voting, callback) {
  var document = {};

  lupus(0, 1, function(i) {
    document = {
      codigoSessao: voting.CodigoSessao,
      siglaCasa: voting.SiglaCasa,
      codigoSessaoLegislativa: voting.CodigoSessaoLegislativa,
      tipoSessao: voting.TipoSessao,
      numeroSessao: voting.NumeroSessao,
      dataSessao: voting.DataSessao,
      horaInicio: voting.HoraInicio,
      codigoTramitacao: voting.CodigoTramitacao,
      codigoSessaoVotacao: voting.CodigoSessaoVotacao,
      sequencialSessao: voting.SequencialSessao,
      secreta: voting.Secreta,
      descricaoVotacao: voting.DescricaoVotacao,
      resultado: voting.Resultado,
      totalVotosSim: voting.TotalVotosSim,
      totalVotosNao: voting.TotalVotosNao,
      totalVotosAbstencao: voting.TotalVotosAbstencao,
      codigoMateria: voting.CodigoMateria,
      siglaMateria: voting.SiglaMateria,
      numeroMateria: voting.NumeroMateria,
      anoMateria: voting.AnoMateria
    };
  }, function() {
    callback(document);
  })
}


function checkVotes(lists, callback) {
  var document = [];

  async.forEach(lists, function(list, callback) {
    document.push({
      codigoParlamentar: list.CodigoParlamentar,
      nomeParlamentar: list.NomeParlamentar,
      siglaPartido: list.SiglaPartido,
      siglaUF: list.SiglaUF,
      tratamento: list.Tratamento,
      voto: list.Voto
    });
    callback();
  }, function() {
    callback(document);
  })
}


function postTwitter(documentVoting, callback){
  var str_twitter = 'Confira os votos dos Senadores na '+documentVoting.siglaMateria+'-'+documentVoting.numeroMateria+'/'+documentVoting.anoMateria+'. '+documentVoting.descricaoVotacao.substr(0, 50)+'.. http://www25.senado.leg.br/web/atividade/materias/-/materia/votacao/'+documentVoting.codigoTramitacao+' #ANovaVoz 🇧🇷';
  twitter.postTweet(str_twitter);
}
