var assert = require('assert');
var async = require('async');

var user = require('../models/user');
var db = require('../models/db');
var service = require('../models/service');

var facebook = require('../controllers/facebook');
var utilities = require('../controllers/utilities');

exports.listPoliticians = function(recipientID, messageFromWatson, situation_now, callback) {
  if (situation_now.action == 'waiting_name') {
    list('politicians_'+situation_now.intent, function(list1, list2) {
      facebook.sendResponse(recipientID, messageFromWatson, function(res) {
        facebook.sendResponse(recipientID, list1, function(result) {
          facebook.sendResponse(recipientID, list2, function(result) {
            facebook.sendResponse(recipientID, 'Digite o nome ou digite LISTA ou SAIR.', function(result) {
              callback(true);
            });
          });
        });      
      });      
    });
  } else {
    facebook.sendResponse(recipientID, 'Para verificar a lista de políticos disponíveis na A NOVA VOZ, você precisa escolher, primeiramente, quem deseja seguir.', function(res) {
      facebook.buttonsDefault(recipientID, function(res) {
        callback(true);
      });
    });
  }  
}

function list(collection, callback) {

  var list1 = "";
  var list2 = "";

  async.series([

    function(callback) {
      db.connect(function(err) {
        if(err) {
          console.log('Nao foi possivel conectar DB');
          process.exit(1);
        } else {
          callback();
        }
      });
    },

    function(callback) {
      db.get().collection(collection).find().toArray(function(err, res) {
        assert.equal(null, err);

        async.forEach(res, function(politician, callback) {
          var msg = politician.acronym_political_party + " - " +politician.name + '\n';

          if ((list1.length + msg.length) < 640) {
            list1 = list1 + msg;
            callback();        
          } else {
            list2 = list2 + msg;
            callback();                
          }

        }, function() {
          callback();
        })
      });
    },
  ], function() {
    db.close(function(err) {
      callback(list1, list2);
    });
  });
}


exports.find = function(politicianName, situation_now, callback) {
  var collection = 'politicians_' + situation_now.intent;
  db.get().collection(collection).findOne({name: politicianName }, function(err, doc) {
    assert.equal(null, err);
    callback(doc);
  })
}

exports.findAll = function(collection, callback) {
  try {
    db.get().collection(collection).find({}).toArray(function(err, docs) {
      assert.equal(null, err);
      callback(docs);
    });
  } catch (e) {
    console.log('** Error: politician.findAll **',e);
  }
}

exports.isReturnEntity = function(entities, situation_now, callback) {
  var result = false;
  var politicians = [];

  var _entity = 'politicians_' + situation_now.intent;

  async.forEach(entities, function(row, callback) {
    if (row && row.entity) {
      if ( row.entity == _entity) {
        politicians.push(row.value);
        result = true;
        callback();
      } else {
        callback();
      }
    } else {
      callback();
    }
  }, function() {
    callback(result, politicians);
  });
}

exports.getElementXX = function(document, serviceAvailable, callback) {

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


exports.askWhich = function(recipientID, politicians, situation_now, serviceAvailable, done) {
  var element = [];
  var data;
  var politicians_length = politicians.length;

  async.series([

    function(callback) {
      facebook.sendResponse(recipientID, "Encontrei "+politicians_length+" "+serviceAvailable.plural+".", function(res) {
        callback();
      });
    },

    function(callback) {
      async.forEachLimit(politicians, 1, function(politicianName, callback) {
        db.get().collection('politicians_'+situation_now.intent).findOne({name: politicianName}, function(err, doc) {
          assert.equal(null, err);
          utilities.getElement(doc, serviceAvailable, function(res) {
            element.push(res);    
            callback();
          })
        });
      }, function() {
        callback();
      });
    },

    function(callback) {
      data = {
        attachment: {
          type: "template",
          payload: {
            template_type: "list",
            top_element_style: "compact",
            elements: element,
          }
        }
      }
      callback();
    },

    function(callback) {
      facebook.sendList(recipientID, data, function(res) {
        callback();
      });
    }
  ], function() {
    facebook.sendResponse(recipientID, "Escolha o " + serviceAvailable.singular + " que você deseja seguir, por favor?", function(result) {
      done();
    });
  });
}


exports.withFollowers = function(collection1, collection2, callback) {
  try {
    db.get().collection(collection1).aggregate(
      [
        {
          $lookup: {
            from: collection2,
            localField: "code",
            foreignField: "code",
            as: "politicians_followers"
          }
        }
      ]
    ).toArray(function(err, docs) {
      assert.equal(null, err);
      callback(docs);
    });
  } catch (e) {
    console.log(e);
  }
}
