var request = require('request');
var watson = require('./watson');

var user = require('../models/user');
var situation = require('../models/situation');
var service = require('../models/service');
var menu = require('./menu');

require('dotenv').config();

exports.receivedMessage = function(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

//  console.log("** Received message for user %d and page %d at %d with message:", senderID, recipientID, timeOfMessage);
//  console.log("** Message -> "+ JSON.stringify(message));

  var isEcho = message.is_echo;
  var messageID = message.mid;
  var appID = message.app_id;
  var metadata = message.metadata;

  var messageText = message.text;
  var messageAttachments = message.attachments;
  var quickReply = message.quick_reply;


  if (isEcho) {
    console.log("** Received echo for message %s and app %d with metadata %s", messageID, appID, metadata);
  } 

  else if (quickReply) {   

    var quickReplyPayload = quickReply.payload;
    var serviceAvailable = '';

    service.available(quickReplyPayload, function(res) {
      serviceAvailable = res.name;

      if (quickReplyPayload == 'YES') {
        watson.receivingMessage(senderID, "yes", function(responseFromWatson) {});
      }

      else if (quickReplyPayload == 'NO') {
        watson.receivingMessage(senderID, "no", function(responseFromWatson) {});
      }

      else if (quickReplyPayload == 'FOLLOW') {
        watson.receivingMessage(senderID, 'follow', function(responseFromWatson) {} );
      }

      else if (quickReplyPayload == 'FOLLOW_CONGRESS') {
        watson.receivingMessage(senderID, "follow_congress", function(responseFromWatson) {});
      }

      else if (quickReplyPayload == 'FOLLOW_COUNTIES_CHAMBER') {
        watson.receivingMessage(senderID, "follow_counties_chamber", function(responseFromWatson) {});
      }

      else if (quickReplyPayload == 'FOLLOW_CITIES') {
        watson.receivingMessage(senderID, "follow_cities", function(responseFromWatson) {});
      }

      else if (quickReplyPayload == 'FOLLOW_'+serviceAvailable.toUpperCase()) {
        watson.receivingMessage(senderID, "follow_"+serviceAvailable, function(responseFromWatson) {});
      }

      else if (quickReplyPayload == 'UNFOLLOW') {
        watson.receivingMessage(senderID, 'unfollow', function(responseFromWatson) {} );
      }

      else if (quickReplyPayload == 'UNFOLLOW_CONGRESS') {
        watson.receivingMessage(senderID, "unfollow_congress", function(responseFromWatson) {});
      }

      else if (quickReplyPayload == 'UNFOLLOW_CITIES') {
        watson.receivingMessage(senderID, "unfollow_cities", function(responseFromWatson) {});
      }

      else if (quickReplyPayload == 'UNFOLLOW_COUNTIES_CHAMBER') {
        watson.receivingMessage(senderID, "unfollow_counties_chamber", function(responseFromWatson) {});
      }

      else if (quickReplyPayload == 'UNFOLLOW_'+serviceAvailable.toUpperCase()) {
        watson.receivingMessage(senderID, "unfollow_"+serviceAvailable, function(responseFromWatson) {});
      }

      else if (quickReplyPayload == 'LIST_WHO_AM_I_FOLLOWING') {
        watson.receivingMessage(senderID, 'list_who_am_i_following', function(responseFromWatson) {} );
      }

      else if (quickReplyPayload == 'RANKING_'+serviceAvailable.toUpperCase()) {
        watson.receivingMessage(senderID, 'ranking_'+serviceAvailable, function(responseFromWatson) {} );
      }

      else if (quickReplyPayload == 'MORE') {
        menu.moreButtonsDefault(senderID, function(res) {});
      }
    });
  }

  else if (messageText) {
    watson.receivingMessage(senderID, messageText, function(responseFromWatson) {} );
  } 

  else if (messageAttachments) {
    console.log(messageAttachments);
  }

}


exports.receivedPostback = function(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;
  var payload = event.postback.payload;

  if (payload == 'GET_STARTED_PAYLOAD') {
    user.save(senderID, "get_start", "", function(result) {
      watson.receivingMessage(senderID, "start", function(responseFromWatson) {});
    });
  }
  else if (payload == 'FOLLOW') {
    watson.receivingMessage(senderID, "follow", function(responseFromWatson) {});
  }
  else if (payload == 'FOLLOW_SENATOR') {
    watson.receivingMessage(senderID, "follow_senator", function(responseFromWatson) {});
  }
  else if (payload == 'FOLLOW_DEP_FEDERAL') {
    watson.receivingMessage(senderID, "follow_dep_federal", function(responseFromWatson) {});
  }
  else if (payload == 'UNFOLLOW') {
    watson.receivingMessage(senderID, 'unfollow', function(responseFromWatson) {} );
  }
  else if (payload == 'UNFOLLOW_SENATOR') {
    watson.receivingMessage(senderID, 'unfollow_senator', function(responseFromWatson) {} );
  }
  else if (payload == 'UNFOLLOW_DEP_FEDERAL') {
    watson.receivingMessage(senderID, 'unfollow_dep_federal', function(responseFromWatson) {} );
  }
  else if (payload == 'LIST_WHO_AM_I_FOLLOWING') {
    watson.receivingMessage(senderID, 'list_who_am_i_following', function(responseFromWatson) {} );
  }
  else if (payload == 'RANKING_SENATOR') {
    watson.receivingMessage(senderID, 'ranking_senator', function(responseFromWatson) {} );
  }
  else if (payload == 'RANKING_DEP_FEDERAL') {
    watson.receivingMessage(senderID, 'ranking_dep_federal', function(responseFromWatson) {} );
  }
  else if (payload == 'FOLLOW_RS_PORTO_ALEGRE_LEGIS') {
    watson.receivingMessage(senderID, "follow_rs_porto_alegre_legis", function(responseFromWatson) {});
  }
  else if (payload == 'FOLLOW_RS_PORTO_ALEGRE_EXEC') {
    watson.receivingMessage(senderID, "follow_rs_porto_alegre_exec", function(responseFromWatson) {});
  }
  //console.log("** Received postback for user %d and page %d with payload '%s' at %d", senderID, recipientID, payload, timeOfPostback);
}


exports.receivedDeliveryConfirmation = function(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var delivery = event.delivery;
  var messageIDs = delivery.mids;
  var watermark = delivery.watermark;
  var sequenceNumber = delivery.seq;

  if (messageIDs) {
    messageIDs.forEach(function(messageID) {
    });
  }
}


exports.receivedMessageRead = function(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  var watermark = event.read.watermark;
  var sequenceNumber = event.read.seq;
}


exports.receivedAccountLink = function(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  var status = event.account_linking.status;
  var authCode = event.account_linking.authorization_code;

  console.log("** Received account link event with for user %d with status %s and auth code %s ", senderID, status, authCode);
}


exports.receivedAuthentication = function(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfAuth = event.timestamp;

  // The 'ref' field is set in the 'Send to Messenger' plugin, in the 'data-ref'
  // The developer can set this to an arbitrary value to associate the
  // authentication callback with the 'Send to Messenger' click event. This is
  // a way to do account linking when the user clicks the 'Send to Messenger'
  // plugin.
  var passThroughParam = event.optin.ref;

  console.log("Received authentication for user %d and page %d with pass through param '%s' at %d", senderID, recipientID, passThroughParam,timeOfAuth);

  // When an authentication is received, we'll send a message back to the sender
  // to let them know it was successful.
  sendResponse(senderID, "Authentication successful", function(result) {});
}

exports.buttonsDefault = function(recipientID, callback) {

  this.sendMenuCarrousel(recipientID, function(res) {
    situation.set(recipientID, '', '', function(res) {
      callback(true);
    }); 
  });

/*
  let quick_replies = {
    text: "Escolha uma opção, por favor:",
    quick_replies:[
      {
        content_type:"text",
        title: "Seguir",
        payload:"FOLLOW"
      },
      {
        content_type: "text",
        title: "Minha lista",
        payload: "LIST_WHO_AM_I_FOLLOWING"
      },
      {
        content_type: "text",
        title: "Deixar",
        payload: "UNFOLLOW"
      },
      {
        content_type: "text",
        title: "+",
        payload: "MORE"
      }
    ]
  }


  this.sendList(recipientID, quick_replies, function(res) {
    situation.set(recipientID, '', '', function(res) {
      callback(true);
    });    
  });
*/

}


exports.getUserName = function(userID, callback) {
  var name;
  request({
    url: 'https://graph.facebook.com/v2.6/'+ userID +'?fields=first_name,last_name',
    qs: {access_token: process.env.MESSENGER_ACCESS_TOKEN},
    method: 'GET'
  },
  function(error, response, body) {
    if (error) {
      console.log('** Error sending message: ', error);
      callback('');
    } else if (response.body.error) {
      console.log('** Error: ', response.body.error);
      callback('');
    } else {
      name = JSON.parse(body);
      callback(name.first_name+' '+name.last_name);
    }
  });
}


exports.sendResponse = function(recipientID, messageText, callback) {
  if (messageText == "") {
    callback(true);
  } else {
    var messageData = {
      recipient: {
        id: recipientID
      },
      message: {
        text: messageText,
        metadata: "DEVELOPER_DEFINED_METADATA"
      }
    };
    callSendAPI(messageData, function(ret) {
      callback(ret);
    });    
  }
}


exports.sendMessageButtons = function(recipientID, text, buttons, callback) {
  var messageData = {
    recipient: {
      id: recipientID
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: text,
          buttons: buttons
        }
      }
    }
  };
  callSendAPI(messageData, function(result) {
    callback(result);
  });
}


function sendButtons(recipientID, text, buttons, callback) {
  var messageData = {
    recipient: {
      id: recipientID
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: text,
          buttons: buttons
        }
      }
    }
  };
  callSendAPI(messageData, function(result) {
    callback(result);
  });
}


exports.sendList = function(recipientID, message, callback) {
  var messageData = {
    recipient: {
      id: recipientID
    },
    message: message
  };

  callSendAPI(messageData, function(result) {
    callback(result);
  });
}


exports.sendListButton = function(recipientID, elements, buttons, callback) {
  var messageData = {
    recipient: {
      id: recipientID
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "list",
          top_element_style: "large",
          elements: elements,
          buttons: buttons
        }
      }
    }
  };
  callSendAPI(messageData, function(ret) {
    callback();
  });
}


function callSendAPI(messageData, callback) {
  request({
    uri: process.env.MESSENGER_URI,
    qs: { access_token: process.env.MESSENGER_ACCESS_TOKEN},
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      if (messageId) {
//        console.log("** Successfully sent message with id %s to recipient %s", messageId, recipientId);
      } else {
//        console.log("** Successfully called Send API for recipient %s", recipientId);
      }
      callback(true);
    } else {
      console.error("** Failed calling Send API", response.statusCode, response.statusMessage, body.error);
      callback(false);
    }
  });
}



exports.sendMenuCarrousel = function(recipientID, callback) {
  let attachment = {
    type: "template",
    payload: {
      template_type: "generic",
      elements: [
         {
          title: "Senado Federal",
          subtitle: "Senadores da República",
          image_url: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509477737/anovavoz-cover-congresso_uvhfi5.jpg',
          default_action : {
            type: "web_url",
            url: "https://www.anovavoz.com.br",
            messenger_extensions: true,
            webview_height_ratio: "tall",
            fallback_url: "https://www.anovavoz.com.br"
          },
          buttons:[
            {
              type: "postback",
              title: "Seguir SENADOR",
              payload: "FOLLOW_SENATOR"
            }, 
            {
              type: "postback",
              title: "Deixar de Seguir",
              payload: "UNFOLLOW_SENATOR"
            }, 
            {
              type: "postback",
              title: "Ver Ranking",
              payload: "RANKING_SENATOR"
            }              
          ]      
        },
        {
          title: "Câmara de Deputados",
          subtitle: "Deputados Federais",
          image_url: 'https://res.cloudinary.com/hgfippcp2/image/upload/v1509477737/anovavoz-cover-congresso_uvhfi5.jpg',
          default_action : {
            type: "web_url",
            url: "https://www.anovavoz.com.br",
            messenger_extensions: true,
            webview_height_ratio: "tall",
            fallback_url: "https://www.anovavoz.com.br"
          },
          buttons:[
            {
              type: "postback",
              title: "Seguir DEP FEDERAL",
              payload: "FOLLOW_DEP_FEDERAL"
            }, 
            {
              type: "postback",
              title: "Deixar de Seguir",
              payload: "UNFOLLOW_DEP_FEDERAL"
            }, 
            {
              type: "postback",
              title: "Ver Ranking",
              payload: "RANKING_DEP_FEDERAL"
            }              
          ]      
        },
        {
          title: "Menu Geral",
          subtitle: "Acompanhe A NOVA VOZ",
          image_url: "https://res.cloudinary.com/hgfippcp2/image/upload/v1509529054/cover-face_qid3sb.jpg",
          default_action : {
            type: "web_url",
            url: "https://www.anovavoz.com.br",
            messenger_extensions: true,
            webview_height_ratio: "tall",
            fallback_url: "https://www.anovavoz.com.br"
          },
          buttons:[
            {
              type: "postback",
              title: "Ver Minha Lista",
              payload: "LIST_WHO_AM_I_FOLLOWING"
            }, 
            {
              type: "postback",
              title: "Seguir",
              payload: "FOLLOW"
            }, 
            {
              type: "postback",
              title: "Deixar de Seguir",
              payload: "UNFOLLOW"
            }              
          ]      
        }
      ]
    }
  }

  let messageData = {
    recipient: {
      id: recipientID
    },
    message: {
      attachment: attachment
    }
  };
  callSendAPI(messageData, function(ret) {
    callback();
  });

}
