var assert = require('assert');
var async = require('async');

var db = require('../models/db');
var user = require('../models/user');
var situation = require('../models/situation');
var politician = require('../models/politician');
var service = require('../models/service');

var facebook = require('../controllers/facebook');
var utilities = require('../controllers/utilities');

console.log('**************************************************************************************');
console.log('Start HEROKU scheduler_ranking.js at',utilities.dateFormat('YYYY-MM-DD HH:MI:SS'));
console.log('**************************************************************************************');

var element_detail = [];
var buttons = [];

var users;
var countAll = 0;
var element = [];

var services = [];

services.push({name: 'senator', title: 'Senadores', state: '', city: '', singular: 'Senador', plural: 'Senadores', short: 'Sen.' });
services.push({name: 'dep_federal', title: 'Dep Federais', state: '', city: '', singular: 'Dep. Federal', plural: 'Dep. Federais', short: 'Dep. Fed.' });

async.series([
  function(callback) {
    db.connect(function(err) {
      assert.equal(null, err);
      callback();
    });          
  },

  async.forEachLimit(services, 1, function(oneService, callback) {

    async.series([
      function(callback) {
        db.get().collection("followers_"+oneService.name).find().count(function(err, res) {
          countAll = res;
          callback();
        });
      },
 
      function(callback) {
        db.get().collection("followers_"+oneService.name).aggregate([
          { $group: 
            { _id: "$code", 
              count: { $sum: 1 }
            }
          },
          {
            $sort: {count: -1}
          },
          { $limit: 3 }
        ]).toArray(function(err, res) {
          assert.equal(err, null);
          ranking = res;
          callback();
        });
      },

      function(callback) {
        db.get().collection("followers_"+oneService.name).aggregate([
          { $group: 
            { _id: "$user", 
              count: { $sum: 1 }
            }
          }]).toArray(function(err, res) {
          assert.equal(err, null);
          users = res;
        });
      },

      function(callback) {
        async.forEachLimit(ranking, 1, function(politician, callback) {
          db.get().collection('politicians_'+oneService.name).findOne({code: politician._id}, function(err, res) {
            assert.equal(null, err);
            
            var document = res;
            var url = document.webpage.replace("http:", "https:");
            var image_url = document.picture.replace("http:", "https:");
            var treatment = oneService.short;

            if (document.state) {
              var state = document.state;
            } else {
              var state = '';
            }

            var perc = politician.count * 100 / countAll;

            var doc = {
                    title: treatment+' '+document.name + " " + perc.toFixed(2) + "%",
                    image_url: image_url,
                    subtitle: document.acronym_political_party+'-'+state,
                    default_action: {
                      type: 'web_url',
                      url: url,
                      messenger_extensions: true,
                      webview_height_ratio: 'tall',
                      fallback_url: url
                    }
                  }


            element.push(doc);    
            callback();
          }) 
        }, function() {

          if (element.length == 1) {
            element.push({
              title: 'Continue acompanhando nosso ranking de seguidores.',
              subtitle: 'No futuro, mais informações!',
            });          
          }

          data = {
            attachment: {
              type: "template",
              payload: {
                template_type: "list",
                top_element_style: "compact",
                elements: element
              }
            }
          }
          callback();
        });
      }
    ], function() {




    }),

    function(callback) {
      if (data) {
        facebook.sendList(recipientID, data, function(res) {
          callback();
        });
      } else {
        callback();
      }
    }   
  });

], function() {
  db.close( function(err) {
    assert.equal(null, err);
    callback(ranking);
  });
});
