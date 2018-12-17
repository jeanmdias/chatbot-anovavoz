var express = require('express');
var router = express.Router();

var facebook = require('../../controllers/facebook');

require('dotenv').config();


router.get('/', function(req, res){
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === process.env.HUB_VERIFY_TOKEN ) {
    console.log('Validação OK!');
    res.status(200).send(req.query['hub.challenge']);  
  }
    
  else {
    console.log('Validação falhou!');
    res.status(403);
  }
});


router.post('/', function(req, res) {
  var data = req.body;

  if (data && data.object === 'page') {
    data.entry.forEach(function (pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;

      pageEntry.messaging.forEach(function(messagingEvent) {
        if (messagingEvent.optin) {
          facebook.receivedAuthentication(messagingEvent);
        } else if (messagingEvent.message) {
          facebook.receivedMessage(messagingEvent);
        } else if (messagingEvent.delivery) {
          facebook.receivedDeliveryConfirmation(messagingEvent);
        } else if (messagingEvent.postback) {
          facebook.receivedPostback(messagingEvent);
        } else if (messagingEvent.read) {
          facebook.receivedMessageRead(messagingEvent);
        } else if (messagingEvent.account_linking) {
          facebook.receivedAccountLink(messagingEvent);
        } else {
          console.log("Webhook received unknown messagingEvent: ", messagingEvent);
        }
      });
    });
    res.sendStatus(200);
  }
})

module.exports = router;
