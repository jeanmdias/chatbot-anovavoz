var express = require('express');
var router = express.Router();

var assert = require('assert');
var async = require('async');

var politician = require('../../models/politician');
var service = require('../../models/service');
var db = require('../../models/db');

require('dotenv').config();

router.get('/', function(req, res) {

  if (true) {
    var doc = '{';
    var rankingSenator = [];
    var rankingDepFederal = [];
    var activeUsers = [];
    var _count = 0;
    var rank_senator;
    var rank_dep_federal;
    var countAllSenator;
    var countAllDepFederal;
    var totalUsers = 0;
    var totalUsersSenator = 0;
    var totalUsersDepFederal = 0;
    var totalUsersRsPortoAlegre = 0;
    var totalUsersSpSaoPaulo = 0;
    var totalUsersRjRioDeJaneiro = 0;
    var totalActiveUsers = 0;
    var services;

    async.series([
      function(callback) {
        db.connect(function(err) {
          assert.equal(null, err);
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
        db.get().collection('users').find().toArray(function(err, res) {
          totalUsers = res.length;
          doc = doc + '"totalUsers": ' + totalUsers + ',';
          callback();
        });
      },

      function(callback) {
        async.forEach(services, function(s, callback) {
          db.get().collection('followers_'+s.name).find().toArray(function(err, res) {
            
            var activeUsersServ = [];
            var srv = s.name.charAt(0).toUpperCase() + s.name.slice(1);
            var x = 1
            while(x > 0) {
              var x = srv.indexOf('_');
              var srv = srv.substring(0,x)+srv.charAt(x+1).toUpperCase()+srv.slice(x+2);
            }

            var _count = 0;
            
            async.forEach(res, function(f, callback) {
              var _index = activeUsers.indexOf(f.user);
              var _indexServ = activeUsersServ.indexOf(f.user);

              async.series([

                function(callback) {
                  if (_index == -1) {
                    activeUsers.push(f.user);
                    callback();
                  } else {
                    callback();
                  }
                },

                function(callback) {
                  if (_indexServ == -1) {
                    activeUsersServ.push(f.user);
                    callback();
                  } else {
                    callback();
                  }
                }
              ], function() {
                callback();
              })

            }, function() {
              doc = doc + '"followers'+srv+'":' + activeUsersServ.length +', '
              callback();
            });
          });
        }, function() {
          doc = doc + '"totalActiveUsers":' + activeUsers.length + ',';
          callback();
        });
      },

      function(callback) {
        // Total de Parlamentares seguidos.
        var _count = 0;
        service.get(function(res) {
          async.forEach(res, function(serv, callback) {
            politician.findAll('politicians_'+serv.name, function(res) {
              _count = _count + res.length;
              callback();
            })
          }, function() {
            doc = doc + '"totalPoliticians":' + _count + ',';
            callback();
          })
        })
      },

      function(callback) {
        db.get().collection("followers_senator").find().count(function(err, res) {
          countAllSenator = res;
          callback();
        });
      },

      function(callback) {
        db.get().collection("followers_dep_federal").find().count(function(err, res) {
          countAllDepFederal = res;
          callback();
        });
      },

      function(callback) {
        db.get().collection("followers_senator").aggregate([
          { $group: 
            { _id: "$code", 
              count: { $sum: 1 }
            }
          },
          {
            $sort: {count: -1}
          },
          { $limit: 4  }
        ]).toArray(function(err, res) {
          assert.equal(err, null);
          rank_senator = res;
          callback();
        });
      },

      function(callback) {
        db.get().collection("followers_dep_federal").aggregate([
          { $group: 
            { _id: "$code", 
              count: { $sum: 1 }
            }
          },
          {
            $sort: {count: -1}
          },
          { $limit: 4 }
        ]).toArray(function(err, res) {
          assert.equal(err, null);
          rank_dep_federal = res;
          callback();
        });
      },

      function(callback) {
        var pos = 0;
        async.forEachLimit(rank_senator, 1, function(politician, callback) {
          db.get().collection('politicians_senator').findOne({code: politician._id}, function(err, res) {
            assert.equal(null, err);
            
            var document = res;
            var url = document.webpage.replace("http:", "https:");
            var image_url = document.picture.replace("http:", "https:");
            var treatment = 'Sen.';

            if (document.state) {
              var state = document.state;
            } else {
              var state = '';
            }

            var perc = politician.count * 100 / countAllSenator;
            pos = pos + 1;

            rankingSenator.push({
              pos: pos,
              image: image_url,
              name: treatment+' '+document.name,
              party: document.acronym_political_party+'-'+state,
              perc: perc.toFixed(2) + "%"
            })

            callback();
          }) 
        }, function() {
          doc = doc + '"rankingSenator":'+ JSON.stringify(rankingSenator) +',';
          callback();
        });
      },


      function(callback) {
        var pos = 0;
        async.forEachLimit(rank_dep_federal, 1, function(politician, callback) {
          db.get().collection('politicians_dep_federal').findOne({code: politician._id}, function(err, res) {
            assert.equal(null, err);
            
            var document = res;
            var url = document.webpage.replace("http:", "https:");
            var image_url = document.picture.replace("http:", "https:");
            var treatment = 'Dep. Fed.';

            if (document.state) {
              var state = document.state;
            } else {
              var state = '';
            }

            var perc = politician.count * 100 / countAllDepFederal;
            pos = pos + 1;

            rankingDepFederal.push({
              pos: pos,
              image: image_url,
              name: treatment+' '+document.name,
              party: document.acronym_political_party+'-'+state,
              perc: perc.toFixed(2) + "%"
            })

            callback();
          }) 
        }, function() {
          doc = doc + '"rankingDepFederal":'+ JSON.stringify(rankingDepFederal);
          callback();
        });
      },

    ], function() {
      db.close( function(err) {
        assert.equal(null, err);
        doc = doc + '}'
        res.status(200).send(doc);
      });
    });
  } 
  else {
    console.log('Validação falhou!');
    res.status(403);
  }
});


router.get('/pendencies', function(req, res) {

  var doc = [];

  async.series([
    function(callback) {
      db.connect(function(err) {
        assert.equal(null, err);
        callback();
      });          
    },

    function(callback) {
      db.get().collection('events_senator_votings').find({auth: 'waiting'}).toArray(function(err, res) {
        assert.equal(err, null)
        if (res.length > 0) {
          async.forEach(res, function(voting, callback) {
            doc.push({
              _id: voting._id,
              auth: voting.auth,
              servico: 'senator',              
              descricaoVotacao: voting.event.descricaoVotacao,
              siglaMateria: voting.event.siglaMateria,
              numeroMateria: voting.event.numeroMateria,
              anoMateria: voting.event.anoMateria
            });
            callback();
          }, function() {
            callback();
          });
        } else {
          callback();
        }
      })
    },

    function(callback) {
      db.get().collection('events_dep_federal_votings').find({auth: 'waiting'}).toArray(function(err, res) {
        assert.equal(err, null)
        if (res.length > 0) {
          async.forEach(res, function(voting, callback) {
            doc.push({
              _id: voting._id,
              auth: voting.auth,
              servico: 'dep_federal',
              descricaoVotacao: voting.event.ementa,
              siglaMateria: voting.event.tipoProposicao,
              numeroMateria: voting.event.numero,
              anoMateria: voting.event.ano
            });
            callback();
          }, function() {
            callback();
          });
        } else {
          callback();
        }
      })
    },

    function(callback) {
      db.get().collection('events_rs_porto_alegre_votings').find({auth: 'waiting'}).toArray(function(err, res) {
        assert.equal(err, null)
        if (res.length > 0) {
          async.forEach(res, function(voting, callback) {
            doc.push({
              _id: voting._id,
              auth: voting.auth,
              servico: 'rs_porto_alegre_legis',
              ementa: voting.event.ementa,
              processId: voting.processId,
              proposicao: voting.event.proposicao
            });
            callback();
          }, function() {
            callback();
          });
        } else {
          callback();
        }
      })
    },

    function(callback) {
      db.get().collection('events_rs_porto_alegre_contracts').find({auth: 'waiting'}).toArray(function(err, res) {
        assert.equal(err, null)
        if (res.length > 0) {
          async.forEach(res, function(contract, callback) {
            doc.push({
              _id: contract._id,
              auth: contract.auth,
              servico: 'rs_porto_alegre_exec',
              contrato: contract.event.contrato,
              objeto: contract.objeto_contrato
            });
            callback();
          }, function() {
            callback();
          });
        } else {
          callback();
        }
      })
    },

  ], function() {
    db.close( function(err) {
      assert.equal(null, err);
      res.status(200).json(doc);
    });
  });
});

module.exports = router;
