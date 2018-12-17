#!/usr/bin/env node

var express = require('express');
var assert = require('assert');

require('dotenv').config();

console.log('Start HEROKU SCHEDULER scheduler_politicians_rs_porto_alegre.js');

var app = express();

var document = []
document.push({
  code: 1,
  name: 'Adeli Sell',
  picture: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509124019/adeli_sell_gcbv8x.jpg',
  webpage: 'https://www.camarapoa.rs.gov.br/vereadores/adeli-sell',
  email: 'adelisell@camarapoa.rs.gov.br',
  acronym_political_party: 'PT'
});

document.push({
  code: 2,
  name: 'Airto Ferronato',
  picture: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509124018/airto_ferronato_ddj40z.jpg',
  webpage: 'https://www.camarapoa.rs.gov.br/vereadores/airto-ferronato',
  email: 'ferronato@camarapoa.rs.gov.br',
  acronym_political_party: 'PSB'
});

document.push({
  code: 3,
  name: 'Aldacir Oliboni',
  picture: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509124019/aldacir_oliboni_mm7hqn.jpg',
  webpage: 'https://www.camarapoa.rs.gov.br/vereadores/aldacir-oliboni',
  email: 'oliboni@camarapoa.rs.gov.br',
  acronym_political_party: 'PT'
});

document.push({
  code: 4,
  name: 'Alvoni Medina',
  picture: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509124019/alvoni_medina_mtgk3g.jpg',
  webpage: 'https://www.camarapoa.rs.gov.br/vereadores/alvoni-medina',
  email: 'alvonimedina@camarapoa.rs.gov.br',
  acronym_political_party: 'PRB'
});
document.push({
  code: 5,
  name: 'André Carús',
  picture: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509124018/andre_carus_jbdvkv.jpg',
  webpage: 'https://www.camarapoa.rs.gov.br/vereadores/andre-carus',
  email: 'andrecarus@camarapoa.rs.gov.br',
  acronym_political_party: 'PMDB'
});
document.push({
  code: 6,
  name: 'Cassio Trogildo',
  picture: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509124017/cassio_trogildo_n8ol2h.jpg',
  webpage: 'https://www.camarapoa.rs.gov.br/vereadores/cassio-trogildo',
  email: 'cassiotrogildo@camarapoa.rs.gov.br',
  acronym_political_party: 'PTB'
});
document.push({
  code: 7,
  name: 'Cassiá Carpes',
  picture: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509124018/cassia_carpes_mgv1ng.jpg',
  webpage: 'https://www.camarapoa.rs.gov.br/vereadores/cassia-carpes',
  email: 'cassiacarpes@camarapoa.rs.gov.br',
  acronym_political_party: 'PP'
});
document.push({
  code: 8,
  name: 'Clàudio Janta',
  picture: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509124016/claudio_janta_jzub1j.jpg',
  webpage: 'https://www.camarapoa.rs.gov.br/vereadores/claudio-janta',
  email: '',
  acronym_political_party: 'SDD'
});
document.push({
  code: 9,
  name: 'Cláudio Conceição',
  picture: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509133696/claudio-conceicao-d_kylwcc.jpg',
  webpage: 'https://www.camarapoa.rs.gov.br/vereadores',
  email: '',
  acronym_political_party: 'DEM'
});
document.push({
  code: 10,
  name: 'Comandante Nádia',
  picture: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509124019/comandante_nadia_dudjt2.jpg',
  webpage: 'https://www.camarapoa.rs.gov.br/vereadores/comandante-nadia',
  email: 'comandantenadia@camarapoa.rs.gov.br',
  acronym_political_party: 'PMDB'
});
document.push({
  code: 11,
  name: 'Dr. Goulart',
  picture: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509124016/dr_goulart_ftnelf.jpg',
  webpage: 'https://www.camarapoa.rs.gov.br/vereadores/dr-goulart',
  email: 'dr.goulart@camarapoa.rs.gov.br',
  acronym_political_party: 'PTB'
});
document.push({
  code: 12,
  name: 'Felipe Camozzato',
  picture: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509124017/felipe_camozzato_di92ad.jpg',
  webpage: 'https://www.camarapoa.rs.gov.br/vereadores/felipe-camozzato',
  email: '',
  acronym_political_party: 'NOVO'
});
document.push({
  code: 13,
  name: 'Fernanda Melchionna',
  picture: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509124015/fernanda_melchionna_rr1uak.jpg',
  webpage: 'https://www.camarapoa.rs.gov.br/vereadores/fernanda-melchionna',
  email: '',
  acronym_political_party: 'PSOL'
});
document.push({
  code: 14,
  name: 'Idenir Cecchim',
  picture: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509124018/idenir_cecchim_r2pvqg.jpg',
  webpage: 'https://www.camarapoa.rs.gov.br/vereadores/idenir-cecchim',
  email: '',
  acronym_political_party: 'PMDB'
});
document.push({
  code: 15,
  name: 'José Freitas',
  picture: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509124014/jose_freitas_zdssid.jpg',
  webpage: 'https://www.camarapoa.rs.gov.br/vereadores/jose-freitas',
  email: '',
  acronym_political_party: 'PRB'
});
document.push({
  code: 16,
  name: 'João Bosco Vaz',
  picture: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509124015/joao_bosco_vaz_o3lsko.jpg',
  webpage: 'https://www.camarapoa.rs.gov.br/vereadores/joao-bosco-vaz',
  email: '',
  acronym_political_party: 'PTB'
});
document.push({
  code: 17,
  name: 'João Carlos Nedel',
  picture: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509124015/joao_carlos_nedel_vvqplp.jpg',
  webpage: 'https://www.camarapoa.rs.gov.br/vereadores/joao-carlos-nedel',
  email: '',
  acronym_political_party: 'PP'
});
document.push({
  code: 18,
  name: 'Luciano Marcantonio',
  picture: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509124014/luciano_marcantonio_zuyzge.jpg',
  webpage: 'https://www.camarapoa.rs.gov.br/vereadores/luciano-marcantonio',
  email: '',
  acronym_political_party: 'PTB'
});
document.push({
  code: 19,
  name: 'Marcelo Sgarbossa',
  picture: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509124014/marcelo_sgarbossa_dtecc4.jpg',
  webpage: 'https://www.camarapoa.rs.gov.br/vereadores/marcelo-sgarbossa',
  email: '',
  acronym_political_party: 'PT'
});
document.push({
  code: 20,
  name: 'Mauro Pinheiro',
  picture: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509124014/mauro_pinheiro_ryah1t.jpg',
  webpage: 'https://www.camarapoa.rs.gov.br/vereadores/mauro-pinheiro',
  email: '',
  acronym_political_party: 'REDE'
});
document.push({
  code: 21,
  name: 'Mauro Zacher',
  picture: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509124014/mauro_zacher_obxeik.jpg',
  webpage: 'https://www.camarapoa.rs.gov.br/vereadores/mauro-zacher',
  email: '',
  acronym_political_party: 'PDT'
});
document.push({
  code: 22,
  name: 'Mendes Ribeiro',
  picture: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509124014/mendes_ribeiro_gevrtq.jpg',
  webpage: 'https://www.camarapoa.rs.gov.br/vereadores/mendes-ribeiro',
  email: '',
  acronym_political_party: 'PMDB'
});
document.push({
  code: 23,
  name: 'Moisés Maluco do Bem',
  picture: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509124014/moises_maluco_do_bem_zcflvv.jpg',
  webpage: 'https://www.camarapoa.rs.gov.br/vereadores/moises-maluco-do-bem',
  email: '',
  acronym_political_party: 'PSDB'
});
document.push({
  code: 24,
  name: 'Monica Leal',
  picture: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509124013/monica_leal_zrq3db.jpg',
  webpage: 'https://www.camarapoa.rs.gov.br/vereadores/monica-leal',
  email: '',
  acronym_political_party: 'PP'
});
document.push({
  code: 25,
  name: 'Márcio Bins Ely',
  picture: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509124014/marcio_bins_ely_xmzxgv.jpg',
  webpage: 'https://www.camarapoa.rs.gov.br/vereadores/marcio-bins-ely',
  email: '',
  acronym_political_party: 'PDT'
});
document.push({
  code: 26,
  name: 'Paulinho Motorista',
  picture: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509124013/paulinho_motorista_cnfdk6.jpg',
  webpage: 'https://www.camarapoa.rs.gov.br/vereadores/paulinho-motorista',
  email: '',
  acronym_political_party: 'PSB'
});
document.push({
  code: 27,
  name: 'Paulo Brum',
  picture: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509124013/paulo_brum_ft9ypz.jpg',
  webpage: 'https://www.camarapoa.rs.gov.br/vereadores/paulo-brum',
  email: '',
  acronym_political_party: 'PTB'
});
document.push({
  code: 28,
  name: 'Professor Alex Fraga',
  picture: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509124013/prof_alex_fraga_fek4c9.jpg',
  webpage: 'https://www.camarapoa.rs.gov.br/vereadores/professor-alex-fraga',
  email: '',
  acronym_political_party: 'PSOL'
});
document.push({
  code: 29,
  name: 'Professor Wambert',
  picture: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509124014/professor_wambert_p5ppms.jpg',
  webpage: 'https://www.camarapoa.rs.gov.br/vereadores/professor-wambert',
  email: '',
  acronym_political_party: 'PROS'
});
document.push({
  code: 30,
  name: 'Reginaldo Pujol',
  picture: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509124013/reginaldo_pujol_a9xoyo.jpg',
  webpage: 'https://www.camarapoa.rs.gov.br/vereadores/reginaldo-pujol',
  email: '',
  acronym_political_party: 'DEM'
});
document.push({
  code: 31,
  name: 'Ricardo Gomes',
  picture: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509124012/ricardo_gomes_xksikn.jpg',
  webpage: 'https://www.camarapoa.rs.gov.br/vereadores/ricardo-gomes',
  email: '',
  acronym_political_party: 'PP'
});
document.push({
  code: 32,
  name: 'Roberto Robaina',
  picture: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509124013/roberto_robaina_dgdmar.jpg',
  webpage: 'https://www.camarapoa.rs.gov.br/vereadores/roberto-robaina',
  email: '',
  acronym_political_party: 'PSOL'
});
document.push({
  code: 33,
  name: 'Rodrigo Maroni',
  picture: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509124012/rodrigo_maroni_qheyxi.jpg',
  webpage: 'https://www.camarapoa.rs.gov.br/vereadores/rodrigo-maroni',
  email: '',
  acronym_political_party: 'PODE'
});
document.push({
  code: 34,
  name: 'Sofia Cavedon',
  picture: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509124012/sofia_cavedon_udiwsn.jpg',
  webpage: 'https://www.camarapoa.rs.gov.br/vereadores/sofia-cavedon',
  email: '',
  acronym_political_party: 'PT'
});
document.push({
  code: 35,
  name: 'Tarciso Flecha Negra',
  picture: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509124012/tarciso_flecha_negra_cmhmwq.jpg',
  webpage: 'https://www.camarapoa.rs.gov.br/vereadores/tarciso-flecha-negra',
  email: '',
  acronym_political_party: 'PSD'
});
document.push({
  code: 36,
  name: 'Valter Nagelstein',
  picture: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509124012/valter_nagelstein_yfiw1l.jpg',
  webpage: 'https://www.camarapoa.rs.gov.br/vereadores/valter-nagelstein',
  email: 'valtern@camarapoa.rs.gov.br',
  acronym_political_party: 'PMDB'
});
document.push({
  code: 37,
  name: 'Elizandro Sabino',
  picture: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509124012/elizandro_sabino_u5mqyo.jpg',
  webpage: 'https://www.camarapoa.rs.gov.br/vereadores/elizandro-sabino',
  email: 'elizandrosabino@camarapoa.rs.gov.br',
  acronym_political_party: 'PTB'
});
document.push({
  code: 38,
  name: 'Ramiro Rosário',
  picture: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509123985/ramiro_rosario_mm7m9k.jpg',
  webpage: 'https://www.camarapoa.rs.gov.br/vereadores/ramiro-rosario',
  email: 'ramirorosario@camarapoa.rs.gov.br',
  acronym_political_party: 'PSDB'
});
document.push({
  code: 39,
  name: 'Dinho do Grêmio',
  picture: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509390051/dinho-do-gremio-d_puvm2n.jpg',
  webpage: 'https://www.camarapoa.rs.gov.br/vereadores',
  email: '',
  acronym_political_party: 'Não Identificado'
});


var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGODB_URI;

MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);

  db.collection('politicians_rs_porto_alegre_legis').insertMany(document, function(err,res) {
    assert.equal(null, err);
    db.close();
  });
});

