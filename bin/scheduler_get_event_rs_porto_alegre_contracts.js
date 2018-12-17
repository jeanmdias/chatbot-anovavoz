const async = require('async');
const puppeteer = require('puppeteer');
const assert = require('assert');

const db = require('../models/db');
const follower = require('../models/follower');

console.log('**************************************************************************************');
console.log('** Start HEROKU scheduler_get_event_rs_porto_alegre_contracts.js ');
console.log('**************************************************************************************');


let scrape = async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();

  await page.goto('http://cnc.procempa.com.br/cnc/servlet/cnc.procempa.com.br.wwgorcontratos_portal/');
  await page.waitFor(1000);

  await page.click('#GridContainerTbl > tbody > tr:nth-child(1) > th:nth-child(10) > span');
  await page.waitFor(1000);
  await page.click('#GridContainerTbl > tbody > tr:nth-child(1) > th:nth-child(10) > span');
  await page.waitFor(1000);

  const result = await page.evaluate(() => {
    
    let data = [];
    let elements = document.querySelectorAll('.WorkWithEven');

    for (var element of elements) {

      let contrato = element.childNodes[0].innerText
      let orgao = element.childNodes[1].innerText
      let registro = element.childNodes[2].innerText
      let orgao_nome = element.childNodes[4].innerText
      let processo = element.childNodes[5].innerText
      let ntif_pessoa = element.childNodes[6].innerText
      let nome_pessoa = element.childNodes[7].innerText
      let objeto_contrato = element.childNodes[8].innerText
      let dataPublicacao = element.childNodes[9].innerText
      let dataVencimento = element.childNodes[10].innerText
      let valorContrato = element.childNodes[11].innerText

      var anoPublicacao = parseInt(dataPublicacao.split('/')[2]);

      if (anoPublicacao >= 2018) {
        let document = {
          contrato: contrato.trim(),
          orgao: orgao.trim(),
          registro: registro.trim(),
          orgao_nome: orgao_nome.trim(),
          processo: processo.trim(),
          ntif_pessoa: ntif_pessoa.trim(),
          nome_pessoa: nome_pessoa.trim(),
          objeto_contrato: objeto_contrato.trim(),
          dataPublicacao: dataPublicacao.trim(),
          dataVencimento: dataVencimento.trim(),
          valorContrato: valorContrato.trim()
        }
        data.push(document)        
      }

    };

    let elementsOdd = document.querySelectorAll('.WorkWithOdd');

    for (var element of elementsOdd) {

      let contrato = element.childNodes[0].innerText
      let orgao = element.childNodes[1].innerText
      let registro = element.childNodes[2].innerText
      let orgao_nome = element.childNodes[4].innerText
      let processo = element.childNodes[5].innerText
      let ntif_pessoa = element.childNodes[6].innerText
      let nome_pessoa = element.childNodes[7].innerText
      let objeto_contrato = element.childNodes[8].innerText
      let dataPublicacao = element.childNodes[9].innerText
      let dataVencimento = element.childNodes[10].innerText
      let valorContrato = element.childNodes[11].innerText

      var anoPublicacao = parseInt(dataPublicacao.split('/')[2]);

      if (anoPublicacao >= 2018) {
        let document = {
          contrato: contrato.trim(),
          orgao: orgao.trim(),
          registro: registro.trim(),
          orgao_nome: orgao_nome.trim(),
          processo: processo.trim(),
          ntif_pessoa: ntif_pessoa.trim(),
          nome_pessoa: nome_pessoa.trim(),
          objeto_contrato: objeto_contrato.trim(),
          dataPublicacao: dataPublicacao.trim(),
          dataVencimento: dataVencimento.trim(),
          valorContrato: valorContrato.trim()
        }
        data.push(document)
      }

    }

    return (data) 

  });

  browser.close();
  return result;
};


scrape().then((contracts) => {

  let _reads = 0;
  let _writes = 0;

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
      if (contracts.length > 0 ) {
        async.forEachLimit(contracts, 1, function(event, callback) {
          db.get().collection('events_rs_porto_alegre_contracts').findOne({
            'event.contrato' : event.contrato,
            'event.orgao' : event.orgao,
            'event.orgao_nome' : event.orgao_nome,
            'event.registro' : event.registro,
            'event.processo' : event.processo,
            'event.ntif_pessoa' : event.ntif_pessoa,
            'event.nome_pessoa' : event.nome_pessoa
          }, function(err, res) {
            assert.equal(null, err);
            if (res) {
              _reads = _reads + 1;
              console.log('R -> ', res._id)
              callback();
            } else {
              db.get().collection('events_rs_porto_alegre_contracts').insertOne(
                { status: 'waiting',
                  auth: 'waiting',
                  event: event
                },
                function(err, res) {
                  assert.equal(null,err);
                  _writes = _writes + 1;
                  console.log('I', res.ops[0]._id);
                  callback();
                }
              )                
            }
          })          
        }, function() {
          console.log('Contratos Processados ->', contracts.length)
          console.log('Contratos Novos ->', _writes)
          callback();
        })
      } else {
        callback();
      }
    },

    function(callback) {
      follower.findFollowers('followers_rs_porto_alegre_exec', function(users) {
        usersToDelivery = users;
        callback();
      });
    },

    function(callback) {
      db.get().collection('events_rs_porto_alegre_contracts').find({status: 'waiting'}).toArray(function(err,res) {
        votingsToDelivery = res;
        callback();
      })
    },

    function(callback) {
      async.forEach(votingsToDelivery, function(voting, callback) {
        async.forEach(usersToDelivery, function(user, callback) {  

          if (user.user_followers.length > 0) {

            db.get().collection('events_rs_porto_alegre_contracts_deliveries').findOne({
              _idEventVoting: voting._id,
              _idUser: user._id
            }, function(err, res) {
              assert.equal(null, err);
              if (res == null) {
                db.get().collection('events_rs_porto_alegre_contracts_deliveries').insertOne({
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
          db.get().collection('events_rs_porto_alegre_contracts').findOneAndUpdate(
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
    }


  ], function() {
    db.close(function(err) {
      console.log('** MongoDB Disconnected!');
    });
  });
});
