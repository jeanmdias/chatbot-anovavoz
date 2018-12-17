var menu = require('../controllers/menu');
var facebook = require('../controllers/facebook');

var user = require('../models/user');
var politician = require('../models/politician');
var follower = require('../models/follower');
var situation = require('../models/situation');
var service = require('../models/service');

var async = require('async');
var assert = require('assert');

var ConversationV1 = require('watson-developer-cloud/conversation/v1');

var conversation = new ConversationV1({
  username: process.env.WATSON_USERNAME,
  password: process.env.WATSON_PASSWORD,
  version_date: process.env.WATSON_VERSION_DATE
});

exports.receivingMessage = function(recipientID, messageText, callback) {

  var situation_now;

  conversation.message({
    input: { text: messageText },
    workspace_id: process.env.WATSON_WORKSPACE_ID
  }, function(err, response) {
    
    if (err) {
      console.error(err);
    } else {
      situation.get(recipientID, function(res) {
        situation_now = res;

        response.output.text.forEach( function(messageFromWatson) {

          var intentFromWatson = response.intents[0].intent;
          var confidenceFromWatson = response.intents[0].confidence;
          var entities = response.entities;

          console.log('****************************************************************');
          console.log('** IBM - Watson');
          console.log('** received --> ' + messageText);
          console.log('** response --> ' + messageFromWatson);
          console.log('** intents  --> ', response.intents);
          console.log('** entities --> ', response.entities);

          if (confidenceFromWatson <= 0.5) {
            intentFromWatson = "irrelevant";
          }

          processData(recipientID, messageFromWatson, intentFromWatson, confidenceFromWatson, entities, situation_now, function(result) {
            situation.get(recipientID, function(res) {
              callback();
            });
          });
        });
      });
    }
  });
}


function processData(recipientID, messageFromWatson, intentFromWatson, confidenceFromWatson, entities, situation_now, callback) {

  service.available(intentFromWatson, function(res) {

    var service_available = res.name;
    var oneService = res;

    if (intentFromWatson == "leave" && confidenceFromWatson == 1) {
      menu.leave(recipientID, messageFromWatson, function(res) {callback(true)});
    }

    else if (intentFromWatson == "list_politicians") {
      politician.listPoliticians(recipientID, messageFromWatson, situation_now, function(res) {callback(true)});
    }

    else if (situation_now.action == 'waiting_name') {
      follower.waitingName(recipientID, messageFromWatson, entities, situation_now, function(res) {callback(true)});
    }

    else if (situation_now.action == 'waiting_confirmation' && intentFromWatson == "yes") {
      follower.waitingConfirmation(recipientID, entities, messageFromWatson, situation_now, function(res) {callback(true)});
    }

    else if (intentFromWatson == 'follow') {
      menu.follow(recipientID, messageFromWatson, entities, function(res) {callback(true)})
    }

    else if (intentFromWatson == 'unfollow') {
      menu.unfollow(recipientID, messageFromWatson, entities, function(res) {callback(true)})
    }

    else if (intentFromWatson == 'list_who_am_i_following') {
      follower.listWhoAmIFollowing(recipientID, messageFromWatson, function(res) {callback(true)})
    }

    else if (intentFromWatson == 'ranking_'+ service_available) {
      follower.ranking(recipientID, messageFromWatson, oneService, function(res) {callback(true)})
    }

    else if (intentFromWatson == 'start') {
      menu.start(recipientID, messageFromWatson, function(res) {callback(true)})
    }

    else if (intentFromWatson == 'greeting') {
      menu.greeting(recipientID, messageFromWatson, function(res) {callback(true)})
    }

    else if (intentFromWatson == 'about_us') {
      menu.aboutUs(recipientID, messageFromWatson, function(res) {callback(true)})
    } else {
      facebook.sendResponse(recipientID, messageFromWatson, function(res) {
        facebook.buttonsDefault(recipientID, function(res) {
          situation.set(recipientID, '', '', function(res) {
            callback(true);
          });
        });
      });      
    }
  });
}

