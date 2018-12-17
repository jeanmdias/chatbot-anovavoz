#!/usr/bin/env node

var request = require('request');
var assert = require('assert');
var async = require('async');
var parse = require('xml-parser');
var moment = require('moment-timezone');

require('dotenv').config();

var utilities = require('../controllers/utilities');
var twitter = require('../controllers/twitter');

var db = require('../models/db');
var user = require('../models/user');

console.log(' ');
console.log('*******************************************************************************************');
console.log('** Start HEROKU scheduler_get_event_dep_federal_votings.js at', moment().format("dddd, MMMM Do YYYY, h:mm:ss a"));
console.log('*******************************************************************************************');

var _idsEventVoting = [];
var usersForDelivery = [];
var allPropositions = [];

var dateEnd = moment().add(1, 'days').format('DD/MM/YYYY');
var dateStart = moment().subtract(8, 'days').format('DD/MM/YYYY');
var _year = moment().format('YYYY');

console.log('** GET ', dateStart, dateEnd);

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
    user.findFollowersDepFederal(function(users) {
      usersForDelivery = users;
      callback();
    });
  },

  function(callback) {
    getPropositionsVotings("PL", function(res) {
      async.forEach(res, function(p, callback){
        allPropositions.push(p);
        callback();
      }, function() {
        callback();
      });
    })
  },

  function(callback) {
    getPropositionsVotings("MPV", function(res) {
      async.forEach(res, function(p, callback){
        allPropositions.push(p);
        callback();
      }, function() {
        callback();
      });
    })
  },

  function(callback) {
    getPropositionsVotings("PEC", function(res) {
      async.forEach(res, function(p, callback){
        allPropositions.push(p);
        callback();
      }, function() {
        callback();
      });
    })
  },

  function(callback) {
    getPropositionsVotings("PLN", function(res) {
      async.forEach(res, function(p, callback){
        allPropositions.push(p);
        callback();
      }, function() {
        callback();
      });
    })
  },

  function(callback) {
    getPropositionsVotings("REQ", function(res) {
      async.forEach(res, function(p, callback){
        allPropositions.push(p);
        callback();
      }, function() {
        callback();
      });
    })
  },

  function(callback) {
    getPropositionsVotings("PDC", function(res) {
      async.forEach(res, function(p, callback){
        allPropositions.push(p);
        callback();
      }, function() {
        callback();
      });
    })
  },

  function(callback) {
    getEmentas(allPropositions, function(res) {
      allPropositions = res;
      callback();
    })
  },


  function(callback) {
    getVotings(allPropositions, usersForDelivery, function(res) {
      callback();
    });
  },

  function(callback) {
    setTimeout( function() {
      db.get().close( function(err) {
        assert.equal(null, err);
        console.log('** MongoDB Disconnected.');
        callback();
      })
    }, 5000);
  }

], function() {
  console.log('** The End!!');
  console.log('*******************************************************************************************');
});


function getPropositionsVotings(type, done) {

  var options = {
    url: 'http://www.camara.leg.br/SitCamaraWS/Proposicoes.asmx/ListarProposicoesVotadasEmPlenario?ano='+_year+'&tipo='+type,
    headers: {
      'Accept': 'application/json'
    }
  };

  var bodyXml;
  var propositions = [];

  async.series([
    
    function(callback) {
      try {
        request(options, function (error, response, body) {
          if (error) {
            console.log(error);
            assert.equal(error,null);
          } else {
            bodyXml = body;
            callback();            
          }
        });        
      } catch (err) {
        console.log('** Erro no request', err);
      }
    },

    function(callback) {
      var dados = parse(bodyXml);

      if (dados.root) {
        var proposicoes = dados.root.children;

        async.forEach(proposicoes, function(proposicao, callback) {
          
          //Busca a data da votaçao da proposição
          dataVotacao = proposicao.children[2].content

          if (moment(dataVotacao, "DD/MM/YYYY").isBetween(moment(dateStart,"DD/MM/YYYY"), moment(dateEnd,"DD/MM/YYYY"))) {
            
            var _find = false;
            async.forEach(propositions, function(p, callback) {
              if (p.codProposicao == proposicao.children[0].content) {
                _find = true
                callback();
              } else {
                callback()
              }
            }, function() {
              if (!_find) {
                propositions.push({
                  codProposicao: proposicao.children[0].content,
                  nomeProposicao: proposicao.children[1].content,
                  dataVotacao: proposicao.children[2].content,
                  ementa: '',
                  explicacaoEmenta: '',
                  tipo: '',
                  numero: '',
                  ano: ''
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
        })

      } else {
        console.log('** Não encontrou proposições para processar.');
        callback();
      }
    },

  ], function() {
    done(propositions);
  });
}


function getEmentas(propositions, callback) {

  res = [];

  async.forEach(propositions, function(proposition, callback) {

    var codProposicao = proposition.codProposicao

    var options = {
      url: 'http://www.camara.leg.br/SitCamaraWS/Proposicoes.asmx/ObterProposicaoPorID?IdProp='+codProposicao
    };

    var bodyXml;
    var ementa = null;

    async.series([
      
      function(callback) {
        try {
          request(options, function (error, response, body) {
            if (error) {
              console.log(error);
              assert.equal(error,null);
            } else {
              bodyXml = body;
              callback();            
            }
          });        
        } catch (err) {
          console.log('** Erro no request getEmentas() ' + err);
          callback();
        }
      },

      function(callback) {
        var dados = parse(bodyXml);

        if (dados.root) {

          proposition.tipo = dados.root.attributes.tipo.replace(/^\s+|\s+$/gm,'');
          proposition.numero = dados.root.attributes.numero;
          proposition.ano = dados.root.attributes.ano;
          proposition.ementa = dados.root.children[6].content;
          proposition.explicacaoEmenta = dados.root.children[7].content;
          res.push(proposition); 
          callback();
        } else {
          callback();
        }
      }

    ], function() {
      callback();
    });
  }, function() {
    callback(res);
  })
}


function getVotings(propositions, usersForDelivery, done) {

  var bodyXml;
  async.forEach(propositions, function(proposition, callback) {
      
    var options = {
      url: 'http://www.camara.leg.br/SitCamaraWS/Proposicoes.asmx/ObterVotacaoProposicao?tipo='+proposition.tipo+'&numero='+proposition.numero+'&ano='+proposition.ano+"'",
      timeout: 5000
    };

    async.series([

      function(callback) {
        request(options, function (error, response, body) {
          assert.equal(error, null);
          bodyXml = body;
          callback();
        });
      },

      function(callback) {
        var dados = parse(bodyXml);
        
        if (dados.root) {
          var votacoes = dados.root.children[3].children;        
          var document;

          async.forEach(votacoes, function(votacao, callback) {
            var event = {
              codProposicao: proposition.codProposicao,
              tipoProposicao: proposition.tipo,
              numero: proposition.numero,
              ano: proposition.ano,
              ementa: proposition.ementa,
              explicacaoEmenta: proposition.explicacaoEmenta,
              resumo: votacao.attributes.Resumo,
              dataVotacao: votacao.attributes.Data,
              horaVotacao: votacao.attributes.Hora,
              objVotacao: votacao.attributes.ObjVotacao,
              codSessao: votacao.attributes.codSessao
            }

            var dataVotacao = votacao.attributes.Data;
            var arrDataVotacao = dataVotacao.split('/');
            var stringFormatada = arrDataVotacao[1] + '-' + arrDataVotacao[0] + '-' + arrDataVotacao[2];
            var dataVotacao = moment([arrDataVotacao[2], arrDataVotacao[1], arrDataVotacao[0]]).subtract(1, 'months');
           
            if (moment(dataVotacao, "DD/MM/YYYY").isBetween(moment(dateStart,"DD/MM/YYYY"), moment(dateEnd,"DD/MM/YYYY"))) {

              //Verifica se ja existe
              findEventVoting(event, function(find) {
                if (find) {
                  console.log('** '+event.codSessao, event.tipoProposicao, event.numero+'/'+event.ano, '--> (R) VOTACOES no dia '+event.dataVotacao+' '+event.horaVotacao);
                  callback();
                } else {
                  if (votacao.children[1] && votacao.children[1].children) {
                    votos = votacao.children[1].children;
                    var votes = [];

                    async.forEach(votos, function(voto, callback) {  
                      votes.push({
                        tratamento: voto.name,
                        codigoParlamentar: voto.attributes.ideCadastro,
                        nomeParlamentar: voto.attributes.Nome,
                        siglaPartido: voto.attributes.Partido.trim(),
                        siglaUF: voto.attributes.UF.trim(),
                        voto: voto.attributes.Voto.trim()
                      });
                      callback();
                    }, function() {
                      insertEventVoting(event, votes, function(type, _id) {
                        if(type == 'I') {
                          _idsEventVoting = [];
                          _idsEventVoting.push({type, _id});
                          insertEventDelivery(_idsEventVoting, usersForDelivery, function(cb) {
                            console.log('** '+event.codSessao, event.tipoProposicao, event.numero+'/'+event.ano, '--> (I) VOTACOES no dia '+event.dataVotacao+' '+event.horaVotacao);
                            callback();
                          });
                        } else {
                          callback();
                        }
                      });
                    });                    
                  } else {
                    console.log('** '+event.tipoProposicao, event.codSessao, event.numero+'/'+event.ano, 'Não tem votos cadastrados.');
                    callback();
                  }
                }
              });
            } else {
              callback();
            }
          }, function() {
            callback();
          })

        } else {
          callback();
        }
      }
    ], function() {
      callback();
    });
  }, function() {
    done();
  })
}


function findEventVoting(event, callback) {
  db.get().collection('events_dep_federal_votings').findOne({
    'event.tipoProposicao' : event.tipoProposicao,
    'event.numero' : event.numero,
    'event.ano' : event.ano,
    'event.dataVotacao' : event.dataVotacao,
    'event.horaVotacao' : event.horaVotacao,
    'event.codSessao' : event.codSessao
  }, function(err, res) {
    assert.equal(null, err);
    if (res) {
      callback(true);
    } else {
      callback(false);
    }
  })
}


function insertEventVoting(event, votes, callback) {
  if (!event) {
    console.log('Não gravou porque nao tem EVENTO.');
    callback('F', 0);
  } else if (!votes) {
    console.log('Não gravou porque nao tem VOTOS.');
    callback('F', 0);
  } else {
    db.get().collection('events_dep_federal_votings').insertOne({
      auth: 'waiting',
      event: event,
      votes: votes
    }, function(err, res) {
      assert.equal(null, err);
      callback('I', res.ops[0]._id);
    });    
  }
}


function insertEventDelivery(eventVotings, usersForDelivery, callback) {
  var document = [];

  async.forEach(eventVotings, function(eventVoting, callback) {

    async.forEach(usersForDelivery, function(user, callback) {

      if (user.user_followers.length > 0) {
        db.get().collection('events_dep_federal_votings_deliveries').findOne({
          _idEventVoting: eventVoting._id,
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
    if (document.length > 0) {
      res = db.get().collection('events_dep_federal_votings_deliveries').insertMany(document);
      callback(document);
    } else {
      callback(document);
    }
  });
}


function postTwitter(documentVoting){
  var str_twitter = '#ANovaVoz acaba de compartilhar os votos dos Dep. Federais na Proposição '+documentVoting.codigoProposicao+'. '+documentVoting.ementa.substr(0, 50)+'.. 🇧🇷';
  twitter.postTweet(str_twitter);
}
