#!/usr/bin/env node

var request = require('request');
var assert = require('assert');
var async = require('async');

require('dotenv').config();

var utilities = require('../controllers/utilities');
var twitter = require('../controllers/twitter');

var db = require('../models/db');
var user = require('../models/user');
var politician = require('../models/politician');

console.log('**');
console.log('******************************************************************************************');
console.log('** Start HEROKU SCHEDULER scheduler_get_event_senator.js at',utilities.dateFormat('YYYY-MM-DD HH:MI:SS'));
console.log('******************************************************************************************');

var senators = [];
var usersForDelivery = [];

var newEventCommiss = [];
var newEventMatters = [];
var newEventLicense = [];

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
    politician.findAll('politicians_senator', function(docs) {
      senators = docs;
      callback();
    });
  },

  function(callback) {
    processSenators(senators, function(cb) {
      callback();
    });
  },

  function(callback) {
    user.findFollowersSenator(function(users) {
      usersForDelivery = users;
      callback();
    });
  },

  function(callback) {
    insertEventCommissDelivery(newEventCommiss, usersForDelivery, function(cb) {
      console.log('** Comissao para entregar --> ', cb.length);
      callback();
    });
  },

  function(callback) {
    insertEventMattersDelivery(newEventMatters, usersForDelivery, function(cb) {
      console.log('** Materias para entregar --> ', cb.length);
      callback();
    });
  },

  function(callback) {
    insertEventLicenseDelivery(newEventLicense, usersForDelivery, function(cb) {
      console.log('** Licencas para entregar --> ', cb.length);
      callback();
    });
  },

  function(callback) {
    setTimeout( function() {
      db.get().close( function(err) {
        assert.equal(null, err);
        console.log('** MongoDB Disconnected!!!');
        console.log(' ');
        callback();
      })
    }, 1500);
  }

], function() {
  console.log('** Processo finalizado!!');
  console.log(' ');
});

function getOpenData(politicianId, done) {

  var options = {
    url: 'http://legis.senado.leg.br/dadosabertos/senador/'+politicianId,
    headers: {
      'Accept': 'application/json'
    }
  };

  request(options, function (error, response, body) {

    var comm = [];
    var matt = [];
    var body = JSON.parse(body);

    try {
      comm = body['DetalheParlamentar']['Parlamentar']['MembroAtualComissoes']['Comissao'];
    } catch (e) {
      console.log('** Error getOpenData.comm '+politicianId);
    }

    try {
      matt = body['DetalheParlamentar']['Parlamentar']['MateriasDeAutoriaTramitando']['Materia'];
    } catch (e) {
      console.log('** Error getOpenData.matt '+politicianId);
    }

    done(comm,matt);

  });
}

function getLicenses(politicianId, done) {

  var options = {
    url: 'http://legis.senado.leg.br/dadosabertos/parlamentar/'+politicianId,
    headers: {
      'Accept': 'application/json'
    }
  };

  request(options, function (error, response, body) {

    var licenses = [];
    var body = JSON.parse(body);

    try {
      licenses = body['parlamentar']['licencas']['licenca'];
    } catch (e) {
      console.log('** Error getLicenses '+politicianId);
    }

    done(licenses);

  });
}

function processSenators(senators, done) {

  async.forEach(senators, function(senator, callback) {

    var json_commiss = [];
    var json_matters = [];
    var json_license = [];

    var senatorId = senator.code;

    async.series([

      function(callback) {
        getOpenData(senator.code, function(commiss, matters) {
          json_commiss = commiss;
          json_matters = matters;
          callback();
        });
      },

      function(callback) {
        getLicenses(senator.code, function(licenses) {
          json_license = licenses;
          callback();
        });
      },

      function(callback) {

        if(json_commiss) {

          if(json_commiss.constructor === Object){

            document = {
              codigoParlamentar: senator.code,
              nomeParlamentar: senator.name,
              generoParlamentar: senator.gender,
              estadoParlamentar: senator.state,
              perfilParlamentar: senator.profile_twitter,
              codigoComissao: json_commiss.IdentificacaoComissao.CodigoComissao,
              siglaComissao: json_commiss.IdentificacaoComissao.SiglaComissao,
              siglaCasaComissao: json_commiss.IdentificacaoComissao.SiglaCasaComissao,
              nomeComissao: json_commiss.IdentificacaoComissao.NomeComissao,
              nomeCasaComissao: json_commiss.IdentificacaoComissao.NomeCasaComissao,
              descricaoParticipacao: json_commiss.DescricaoParticipacao,
              dataInicio: json_commiss.DataInicio
            }
            insertEventCommission(document, function(type, _id) {
              if(type == 'I') {
                newEventCommiss.push({type, _id, senatorId});
                console.log('** '+type+' - Commission '+_id+' of Politician '+senator.code+' - '+senator.name);
              }
              callback();
            });

          } else {

            async.forEach(json_commiss, function(commission, cb) {
              document = {
                codigoParlamentar: senator.code,
                nomeParlamentar: senator.name,
                generoParlamentar: senator.gender,
                estadoParlamentar: senator.state,
                perfilParlamentar: senator.profile_twitter,
                codigoComissao: commission.IdentificacaoComissao.CodigoComissao,
                siglaComissao: commission.IdentificacaoComissao.SiglaComissao,
                siglaCasaComissao: commission.IdentificacaoComissao.SiglaCasaComissao,
                nomeComissao: commission.IdentificacaoComissao.NomeComissao,
                nomeCasaComissao: commission.IdentificacaoComissao.NomeCasaComissao,
                descricaoParticipacao: commission.DescricaoParticipacao,
                dataInicio: commission.DataInicio
              }
              insertEventCommission(document, function(type, _id) {
                if(type == 'I') {
                  newEventCommiss.push({type, _id, senatorId});
                  console.log('** '+type+' - Commission '+_id+' of Politician '+senator.code+' - '+senator.name);
                }
                cb();
              });
            }, function() {
              callback();
            });

          }

        } else {
          callback();
        }

      },

      function(callback) {

        if(json_matters) {

          if(json_matters.constructor === Object){

            document = {
              codigoParlamentar: senator.code,
              nomeParlamentar: senator.name,
              generoParlamentar: senator.gender,
              estadoParlamentar: senator.state,
              perfilParlamentar: senator.profile_twitter,
              codigoMateria: json_matters.IdentificacaoMateria.CodigoMateria,
              siglaCasaIdentificacaoMateria: json_matters.IdentificacaoMateria.SiglaCasaIdentificacaoMateria,
              nomeCasaIdentificacaoMateria: json_matters.IdentificacaoMateria.NomeCasaIdentificacaoMateria,
              siglaSubtipoMateria: json_matters.IdentificacaoMateria.SiglaSubtipoMateria,
              descricaoSubtipoMateria: json_matters.IdentificacaoMateria.DescricaoSubtipoMateria,
              numeroMateria: json_matters.IdentificacaoMateria.NumeroMateria,
              anoMateria: json_matters.IdentificacaoMateria.AnoMateria,
              ementaMateria: json_matters.EmentaMateria
            }
            insertEventMatter(document, function(type, _id) {
              if(type == 'I') {
                newEventMatters.push({type, _id, senatorId});
                console.log('** '+type+' - Matter '+_id+' of Politician '+senator.code+' - '+senator.name);
              }
              callback();
            });

          } else {

            async.forEach(json_matters, function(matter, cb) {
              document = {
                codigoParlamentar: senator.code,
                nomeParlamentar: senator.name,
                generoParlamentar: senator.gender,
                estadoParlamentar: senator.state,
                perfilParlamentar: senator.profile_twitter,
                codigoMateria: matter.IdentificacaoMateria.CodigoMateria,
                siglaCasaIdentificacaoMateria: matter.IdentificacaoMateria.SiglaCasaIdentificacaoMateria,
                nomeCasaIdentificacaoMateria: matter.IdentificacaoMateria.NomeCasaIdentificacaoMateria,
                siglaSubtipoMateria: matter.IdentificacaoMateria.SiglaSubtipoMateria,
                descricaoSubtipoMateria: matter.IdentificacaoMateria.DescricaoSubtipoMateria,
                numeroMateria: matter.IdentificacaoMateria.NumeroMateria,
                anoMateria: matter.IdentificacaoMateria.AnoMateria,
                ementaMateria: matter.EmentaMateria
              }
              insertEventMatter(document, function(type, _id) {
                if(type == 'I') {
                  newEventMatters.push({type, _id, senatorId});
                  console.log('** '+type+' - Matter '+_id+' of Politician '+senator.code+' - '+senator.name);
                }
                cb();
              });
            }, function() {
              callback();
            });

          }

        } else {
          callback();
        }

      },

      function(callback) {

        if(json_license) {

          if(json_license.constructor === Object){

            document = {
              codigoParlamentar: senator.code,
              nomeParlamentar: senator.name,
              generoParlamentar: senator.gender,
              estadoParlamentar: senator.state,
              perfilParlamentar: senator.profile_twitter,
              codigoLicensa: json_license.idLicenca,
              dataInicio: json_license.dataInicio,
              dataInicioPrevista: json_license.dataInicioPrevista,
              dataTermino: json_license.dataTermino,
              dataTerminoPrevista: json_license.dataTerminoPrevista,
              tipoAfastamento: json_license.tipoAfastamento,
              tipoDocumento: json_license.tipoDocumento,
              descricaoNumDocumento: json_license.descricaoNumDocumento,
              siglaOrgaoLicenca: json_license.siglaOrgaoLicenca,
              descricaoFinalidade: json_license.descricaoFinalidade
            }
            insertEventLicense(document, function(type, _id) {
              if(type == 'I') {
                newEventLicense.push({type, _id, senatorId});
                console.log('** '+type+' - License '+_id+' of Politician '+senator.code+' - '+senator.name);
              }
              callback();
            });

          } else {

            async.forEach(json_license, function(license, cb) {
              document = {
                codigoParlamentar: senator.code,
                nomeParlamentar: senator.name,
                generoParlamentar: senator.gender,
                estadoParlamentar: senator.state,
                perfilParlamentar: senator.profile_twitter,
                codigoLicensa: license.idLicenca,
                dataInicio: license.dataInicio,
                dataInicioPrevista: license.dataInicioPrevista,
                dataTermino: license.dataTermino,
                dataTerminoPrevista: license.dataTerminoPrevista,
                tipoAfastamento: license.tipoAfastamento,
                tipoDocumento: license.tipoDocumento,
                descricaoNumDocumento: license.descricaoNumDocumento,
                siglaOrgaoLicenca: license.siglaOrgaoLicenca,
                descricaoFinalidade: license.descricaoFinalidade
              }
              insertEventLicense(document, function(type, _id) {
                if(type == 'I') {
                  newEventLicense.push({type, _id, senatorId});
                  console.log('** '+type+' - License '+_id+' of Politician '+senator.code+' - '+senator.name);
                }
                cb();
              });
            }, function() {
              callback();
            });

          }

        } else {
          callback();
        }

      }

    ], function() {
      callback();
    });

  }, function() {
    done();
  });

}

function insertEventCommission(document, callback) {
  db.get().collection('events_senator_commissions').findOne({
    'codigoParlamentar': document.codigoParlamentar,
    'codigoComissao': document.codigoComissao,
    'descricaoParticipacao': document.descricaoParticipacao
  }, function(err, res) {
    assert.equal(null, err);
    if (!res) {
      db.get().collection('events_senator_commissions').insertOne(document, function(err, res) {
        assert.equal(null, err);
        postTwitterEventCommission(document);
        callback('I', res.ops[0]._id);
      });
    } else {
      callback('R', res._id);
    }
  })
}

function insertEventMatter(document, callback) {
  db.get().collection('events_senator_matters').findOne({
    'codigoParlamentar': document.codigoParlamentar,
    'codigoMateria': document.codigoMateria,
    'anoMateria': document.anoMateria
  }, function(err, res) {
    assert.equal(null, err);
    if (!res) {
      db.get().collection('events_senator_matters').insertOne(document, function(err, res) {
        assert.equal(null, err);
        postTwitterEventMatter(document);
        callback('I', res.ops[0]._id);
      });
    } else {
      callback('R', res._id);
    }
  })
}

function insertEventLicense(document, callback) {
  db.get().collection('events_senator_licenses').findOne({
    'codigoParlamentar': document.codigoParlamentar,
    'codigoLicensa': document.codigoLicensa
  }, function(err, res) {
    assert.equal(null, err);
    if (!res) {
      db.get().collection('events_senator_licenses').insertOne(document, function(err, res) {
        assert.equal(null, err);
        //postTwitterEventLicense(document);
        callback('I', res.ops[0]._id);
      });
    } else {
      callback('R', res._id);
    }
  })
}

function insertEventCommissDelivery(eventCommiss, usersForDelivery, callback) {
  var documentCommiss = [];
  async.forEach(eventCommiss, function(commiss, callback) {
    async.forEach(usersForDelivery, function(user, callback) {
      if (checkFollowingSenator(commiss.senatorId, user.user_followers)) {
        db.get().collection('events_senator_commissions_deliveries').findOne({ _idEvent: commiss._id, _idUser: user._id }, function(err, res) {
          assert.equal(null, err);
          if (res == null) {
            documentCommiss.push({
              _idEvent: commiss._id,
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
      if (documentCommiss.length > 0) {
        res = db.get().collection('events_senator_commissions_deliveries').insertMany(documentCommiss);
        callback(documentCommiss);
      } else {
        callback(documentCommiss);
      }
    } catch(e) {
      console.log(e);
    }
  });
}

function insertEventMattersDelivery(eventMatters, usersForDelivery, callback) {
  var documentMatters = [];
  async.forEach(eventMatters, function(matters, callback) {
    async.forEach(usersForDelivery, function(user, callback) {
      if (checkFollowingSenator(matters.senatorId, user.user_followers)) {
        db.get().collection('events_senator_matters_deliveries').findOne({ _idEvent: matters._id, _idUser: user._id }, function(err, res) {
          assert.equal(null, err);
          if (res == null) {
            documentMatters.push({
              _idEvent: matters._id,
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
      if (documentMatters.length > 0) {
        res = db.get().collection('events_senator_matters_deliveries').insertMany(documentMatters);
        callback(documentMatters);
      } else {
        callback(documentMatters);
      }
    } catch(e) {
      console.log(e);
    }
  });
}

function insertEventLicenseDelivery(eventLicense, usersForDelivery, callback) {
  var documentLicense = [];
  async.forEach(eventLicense, function(license, callback) {
    async.forEach(usersForDelivery, function(user, callback) {
      if (checkFollowingSenator(license.senatorId, user.user_followers)) {
        db.get().collection('events_senator_licenses_deliveries').findOne({ _idEvent: license._id, _idUser: user._id }, function(err, res) {
          assert.equal(null, err);
          if (res == null) {
            documentLicense.push({
              _idEvent: license._id,
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
      if (documentLicense.length > 0) {
        res = db.get().collection('events_senator_licenses_deliveries').insertMany(documentLicense);
        callback(documentLicense);
      } else {
        callback(documentLicense);
      }
    } catch(e) {
      console.log(e);
    }
  });
}

function checkFollowingSenator(senatorId, senatorFollowers) {

  var ret = false;

  for (i = 0; senatorFollowers.length > i; i += 1) {
    if (senatorId === senatorFollowers[i].code) {
      ret = true;
    }
  }
  return ret;
}

function postTwitterEventCommission(doc, callback){

  var _parlamentar = doc.nomeParlamentar;
  if(doc.perfilParlamentar != '') {
    _parlamentar = '@'+doc.perfilParlamentar;
  }

  var _autor_da_materia = 'do Senador';
  if(doc.generoParlamentar == 'Feminino') {
    _autor_da_materia = 'da Senadora';
  }

  var str_twitter = 'Cidadão do #'+ doc.estadoParlamentar +' acompanhe a participação '+ _autor_da_materia +' '+ _parlamentar +' como '+doc.descricaoParticipacao+' na Comissão '+doc.siglaComissao+' - '+doc.nomeComissao+' no @SenadoFederal #ANovaVoz #Cidadania #DadosAbertos #Transparência';

  setTimeout( function() {
    twitter.postTweet(str_twitter);
  }, 1500);

}

function postTwitterEventMatter(doc, callback){

  var _parlamentar = doc.nomeParlamentar;
  if(doc.perfilParlamentar != '') {
    _parlamentar = '@'+doc.perfilParlamentar;
  }

  var _autor_da_materia = 'do Senador';
  if(doc.generoParlamentar == 'Feminino') {
    _autor_da_materia = 'da Senadora';
  }

  var str_twitter = 'Cidadão do #'+ doc.estadoParlamentar +' confira a matéria '+ doc.siglaSubtipoMateria + ' ' + parseInt(doc.numeroMateria)+'/'+doc.anoMateria+' http://www25.senado.leg.br/web/atividade/materias/-/materia/'+doc.codigoMateria+' de autoria '+ _autor_da_materia +' '+ _parlamentar +' no @SenadoFederal #ANovaVoz #Cidadania #DadosAbertos #Transparência';

  setTimeout( function() {
    twitter.postTweet(str_twitter);
  }, 1500);

}

function postTwitterEventLicense(doc, callback){

  var tratamento = 'Sen.';
  var data_inicio = '[não informado]';
  var data_termino = '[não informado]';

  if(doc.dataInicio != undefined){
    data_inicio = utilities.dateReplaceFormat(doc.dataInicio);
  } else {
    if(doc.dataInicioPrevista != undefined){
      data_inicio = utilities.dateReplaceFormat(doc.dataInicioPrevista);
    }
  }

  if(doc.dataTermino != undefined){
    data_termino = utilities.dateReplaceFormat(doc.dataTermino);
  } else {
    if(doc.dataTerminoPrevista != undefined){
      data_termino = utilities.dateReplaceFormat(doc.dataTerminoPrevista);
    }
  }

  var afastamento = '';
  if(doc.tipoAfastamento != undefined){
    afastamento = utilities.formatLicense(doc.tipoAfastamento);
  }

  var periodo = '.';
  if (data_inicio == data_termino) {
    periodo = 'em ' + data_inicio;
  } else {
    periodo = 'de ' + data_inicio + ' até ' + data_termino;
  }

  var motivo;
  if (doc.descricaoFinalidade == undefined) {
    motivo = 'Motivo não informado';
  } else {
    motivo = doc.descricaoFinalidade;
  }

  var str_twitter = 'Licença para Sen. '+doc.nomeParlamentar+' '+periodo+'.';

  setTimeout( function() {
    twitter.postTweet(str_twitter);
  }, 1500);

}
