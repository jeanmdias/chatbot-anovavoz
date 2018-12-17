// requires
require('dotenv').config();

var moment = require('moment');


exports.allowedSend = function(callback) {
  var moment_hour = moment().hour();

  if (moment_hour >= 10 && moment_hour <= 20) {
    callback(true);
  } else {
    callback(false);
  }
}

/*
 * DD/MM/YYYY
 * DD/MM/YYYY HH:MI:SS
 * YYYY-MM-DD
 * YYYY-MM-DD HH:MI:SS
 * YYYY
 */
exports.dateFormat = function(mask) {

  var date = new Date();
  var dateFormat = '';

  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  month = (month < 10 ? '0' : '') + month;
  var day  = date.getDate();
  day = (day < 10 ? '0' : '') + day;
  var hour = date.getHours();
  hour = (hour < 10 ? '0' : '') + hour;
  var min  = date.getMinutes();
  min = (min < 10 ? '0' : '') + min;
  var sec  = date.getSeconds();
  sec = (sec < 10 ? '0' : '') + sec;

  if (mask == 'DD/MM/YYYY') dateFormat = day+'/'+month+'/'+year;
  if (mask == 'DD/MM/YYYY HH:MI:SS') dateFormat = day+'/'+month+'/'+year+' '+hour+':'+min+':'+sec;
  if (mask == 'YYYY-MM-DD') dateFormat = year+'-'+month+'-'+day;
  if (mask == 'YYYY-MM-DD HH:MI:SS') dateFormat = year+'-'+month+'-'+day+' '+hour+':'+min+':'+sec;
  if (mask == 'YYYY') dateFormat = year;
  if (mask == 'HH') dateFormat = hour;

  return dateFormat;
}


exports.dateDiff = function(strDate1,strDate2) {

	var datePat = /^(\d{1,2})(\/|-)(\d{1,2})\2(\d{4})$/;

	var matchArray = strDate1.match(datePat);
	dia1=(matchArray[3]);
	mes1=(matchArray[1]);
	ano1=(matchArray[4]);

	var matchArray = strDate2.match(datePat);
	dia2=(matchArray[3]);
	mes2=(matchArray[1]);
	ano2=(matchArray[4]);

	data1=(dia1+'/'+mes1+'/'+ano1);
	data2=(dia2+'/'+mes2+'/'+ano2);

	datDate1=Date.parse(data1);
	datDate2=Date.parse(data2);

	diferenca=((datDate2-datDate1)/(1000*60*60*24));

	return diferenca;
}


/*
 * Replace format YYYY-MM-DD to DD/MM/YYYY
 */
exports.dateReplaceFormat = function(date) {

  var dateFormat = '';

  var year = date.substring(0,4);
  var month = date.substring(5,7);
  var day  = date.substring(8,10);

  dateFormat = day + '/' + month + '/' + year;

  return dateFormat;

}


/*
 * MIS    - Presente(art.40 - em Missão)
 * P-NRV  - Presente-Não registrou voto
 * P-OD   - Presente(obstrução declarada)
 * REP    - Presente(art.67/13 - em Representação da Casa)
 * Ncom   - Não compareceu
 * AP     - art.13, caput-Atividade política/cultural
 * LA     - art.43, §6º-Licença à adotante
 * LAP    - art.43, §7º-Licença paternidade ou ao adotante
 * LC     - art.44-A-Candidatura à Presidência/Vice-Presidência
 * LS     - Licença sáude
 * LG     - art.43, §5-Licença à gestante
 * NA     - dispositivo não citado
 */
exports.formatVote = function(vote) {

  vote = vote.replace(/^\s+|\s+$/gm,'');
  vote = vote.toUpperCase();

  var res = vote;

  if(vote == 'SIM') res = 'Votou SIM';
  if(vote == 'NÃO') res = 'Votou NÃO';
  if(vote == 'VOTOU') res = 'Votou (Voto Secreto)';
  if(vote == 'P-NRV') res = 'NÃO REGISTROU VOTO';
  if(vote == 'NCOM') res = 'NÃO COMPARECEU';
  if(vote == 'MIS') res = 'Presente( em Missão )';
  if(vote == 'P-OD') res = 'Presente( Obstrução Declarada )';
  if(vote == 'REP') res = 'Presente( em Representação da Casa)';
  if(vote == 'AP') res = 'Em Atividade política/cultural';
  if(vote == 'LA') res = 'Em Licença à adotante';
  if(vote == 'LAP') res = 'Em Licença paternidade ou ao adotante';
  if(vote == 'LC') res = 'Em Candidatura à Presidência/Vice-Presidência';
  if(vote == 'LS') res = 'Em Licença Saúde';
  if(vote == 'LG') res = 'Em Licença à gestante';
  if(vote == '-') res = 'Não Registrou Voto';

  return res;
}

exports.formatLicense = function(license) {

  license = license.replace(/^\s+|\s+$/gm,'');
  license = license.toUpperCase();

  return license;
}

exports.trimText = function(text) {

  text = text.replace(/^\s+|\s+$/gm,'');

  return text;
}

exports.getElement = function(document, serviceAvailable, callback) {

  var url = document.webpage.replace("http:", "https:");
  var image_url = document.picture.replace("http:", "https:");
  var treatment = serviceAvailable.short;

  if (document.state) {
    var state = document.state;
  } else {
    var state = '';
  }

  doc = {
          title: treatment+' '+document.name,
          image_url: image_url,
          subtitle: document.acronym_political_party+' - '+state,
          default_action: {
            type: 'web_url',
            url: url,
            messenger_extensions: true,
            webview_height_ratio: 'tall',
            fallback_url: url
          }
        }
  callback(doc);
}
