#!/usr/bin/env node

var express = require('express');
var request = require('request');
var assert = require('assert');
var async = require('async');

var twitter = require('../controllers/twitter');

require('dotenv').config();

var db = require('../models/db');
var user = require('../models/user');
var follower = require('../models/follower');

console.log(' ');
console.log('**************************************************************************************');
console.log('** Start HEROKU scheduler_get_event_rs_porto_alegre_votings.js ');
console.log('**************************************************************************************');

var votingsToDelivery;
var usersToDelivery;
var document = [];
var votings;

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
    getVotings(function(res) {
      votings = res;
      callback();
    });
  },

  function(callback) {
    setVotings(votings, function(res) {
      callback();
    })
  },

  function(callback) {
    follower.findFollowers('followers_rs_porto_alegre_legis', function(users) {
      usersToDelivery = users;
      callback();
    });
  },

  function(callback) {
    db.get().collection('events_rs_porto_alegre_votings').find({status: 'waiting'}).toArray(function(err,res) {
      votingsToDelivery = res;
      callback();
    })
  },

  function(callback) {
    async.forEach(votingsToDelivery, function(voting, callback) {
      async.forEach(usersToDelivery, function(user, callback) {  

        if (user.user_followers.length > 0) {

          db.get().collection('events_rs_porto_alegre_votings_deliveries').findOne({
            _idEventVoting: voting._id,
            _idUser: user._id
          }, function(err, res) {
            assert.equal(null, err);
            if (res == null) {
              db.get().collection('events_rs_porto_alegre_votings_deliveries').insertOne({
                _idEventVoting: voting._id,
                _idUser: user._id,
                delivery: false
              }, function(err, res) {
                assert.equal(null, err);
                callback();
              });    
            } else {
              callback();
            }
          });
        } else {
          callback();
        }
      }, function() {
        db.get().collection('events_rs_porto_alegre_votings').findOneAndUpdate(
          { _id: voting._id },
          { $set: { "status": 'done' } },
          function(err, res) {
            assert.equal(null,err);
            callback();
          }
        );
      });
    }, function() {
      callback();
    })
  },

  function(callback) {
    setTimeout( function() {
      db.get().close( function(err) {
        assert.equal(null, err);
        console.log('** MongoDB Disconnected!!!');
        console.log('** The End!!');
        console.log('**************************************************************************************');
        callback();
      })
    }, 1500);
  }
], function() {
  process.exit(1);
});


function getVotings(callback) {
  var options = {
    url: 'https://votacoes.camarapoa.rs.gov.br/votacoes/por_periodo?format=json&mes=2&ano=2018',
    headers: {
      'Accept': 'application/json'
    }
  };

  request(options, function (error, response, body) {
    var body = JSON.parse(body);
    callback(body);
  });

}


function setVotings(votings, done) {
  async.forEach(votings, function(oneVoting, callback) {
    var votes = [];
    var document = [];

    db.get().collection('events_rs_porto_alegre_votings').findOne({processId: oneVoting.processo_id}, function(err, res) {
      assert.equal(null, err);
      
      if (res == null) {
        politicians = Object.keys(oneVoting.votos);

        async.forEach(politicians, function(politician, callback) {

          db.get().collection('politicians_rs_porto_alegre_legis').findOne({name: politician}, function(err, res) {
            assert.equal(null, err);

            if (res) {
              votes.push({
                "codigoParlamentar": res.code,
                "nomeParlamentar": res.name,
                "siglaPartido": res.acronym_political_party,
                "voto": oneVoting.votos[politician]
              });
              callback();          
            } else {
              console.log('Vereador Porto Alegre não encontrado: ', politician);
              callback();
            }
          })
        }, function() {
          document = {
            status: "waiting",
            auth: "waiting",
            processId: oneVoting.processo_id,
            event: {
              tipoSessao: oneVoting.sessao,
              dataSessao: oneVoting.data,
              secreta: "N",
              proposicao: oneVoting.proposicao,
              ementa: oneVoting.ementa,
              resultado: oneVoting.resultado,
              totalVotosSim: oneVoting.total_sim,
              totalVotosNao: oneVoting.total_nao,
              totalVotosAbstencao: oneVoting.total_abstencoes
            },
            votes: votes
          }
          insertVoting(document, function(type, _id) {
            console.log(type, _id);
            callback();
          })
        });        
      } else {
        console.log('** R', res._id);
        callback();
      }
    });
  }, function() {
    done();
  });
}

function insertVoting(voting, callback) {
  db.get().collection('events_rs_porto_alegre_votings').insertOne(voting, function(err, res) {
    assert.equal(null, err);
    callback('** I', res.ops[0]._id);
  })
}

