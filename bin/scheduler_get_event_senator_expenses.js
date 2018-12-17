#!/usr/bin/env node

const request = require('request');
const csv = require('csvtojson');

var debug = 0;

var options = {
  url: 'http://www.senado.gov.br/transparencia/LAI/verba/2018.csv',
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  }
};

csv().fromStream(request.get(options)).on('csv',(csvRow)=>{

  if(debug < 15){

    var linha = csvRow[0].split('";"');
    console.log('** ',linha[2]);
    debug++;

  }
}).on('done',(error)=>{
    console.log('FIM');
});
