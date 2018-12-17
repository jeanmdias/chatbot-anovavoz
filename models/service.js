var async = require('async');

exports.get = function(callback) {
  var services = [];

  services.push({name: 'senator', title: 'Senadores', state: '', city: '', singular: 'Senador', plural: 'Senadores', short: 'Sen.', limit: 4, followEntity: false });
  services.push({name: 'dep_federal', title: 'Dep Federais', state: '', city: '', singular: 'Dep. Federal', plural: 'Dep. Federais', short: 'Dep. Fed.', limit: 4, followEntity: false });
  services.push({name: 'rs_porto_alegre_legis', title: 'CM Porto Alegre', state: 'RS', city: 'Porto Alegre', singular: 'Vereador', plural: 'Vereadores', short: 'Ver.', limit: 4, followEntity: false });
  services.push({name: 'rj_rio_de_janeiro', title: 'CM Rio de Janeiro', state: 'RJ', city: 'Rio de Janeiro', singular: 'Vereador', plural: 'Vereadores', short: 'Ver.', limit: 4, followEntity: false });
  services.push({name: 'sp_sao_paulo', title: 'CM São Paulo', state: 'SP', city: 'São Paulo', singular: 'Vereador', plural: 'Vereadores', short: 'Ver.', limit: 4, followEntity: false });
  services.push({name: 'df_distrito_federal', title: 'CL Distrito Federal', state: '', city: 'Distrito Federal', singular: 'Dep. Distrital', plural: 'Dep. Distritais', short: 'Dep. Dist.', limit: 4, followEntity: false });

  services.push({name: 'rs_porto_alegre_exec', title: 'Prefeitura Porto Alegre', state: 'RS', city: 'Porto Alegre', singular: 'Cidade', plural: 'Cidades', short: 'Pref.', limit: 0, followEntity: true, image: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509477737/anovavoz-cover-poa_rhwq8d.jpg' });

  callback(services);
}

exports.available = function(intent, callback) {
  
  var _intent = intent.toLowerCase();
  var serviceAvailable = {};

  this.get(function(res) {
    var list_services = res;

    intent_service = _intent.substr(_intent.indexOf('_')+1);
    async.forEach(list_services, function(serv, callback) {
      if (serv.name == intent_service) {
        serviceAvailable = serv;
        callback();
      } else {
        callback();
      }
    }, function() {
      
      if (!serviceAvailable.name) {
        serviceAvailable = {name: ''}
      }
      callback(serviceAvailable);
    });
  });
}