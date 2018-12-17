var facebook = require('../controllers/facebook');
var utilities = require('../controllers/utilities');
var storage = require('../models/storage');
var db = require('../models/db');

var assert = require('assert');

exports.save = function(userID, context, info, callback) {
  try {
    storage.connect(function(db) {
      find(db, userID, function(document) {
        fullNameUser(userID, document, function(firstName, lastName) {
          db.collection('users').updateOne(
            { code: userID },
            { $set: { "first_name" : firstName,
                      "last_name"  : lastName,
                      "context"    : context,
                      "info"       : info,
                      "date_start" : utilities.dateFormat('YYYY-MM-DD HH:MI:SS') } },
            { upsert: true },
          function(error, result) {
            storage.disconnect(db, function() {
              callback(true);
            });
          });
        });
      });
    });
  } catch (e) {
    console.log(e);
  }
}

exports.saveCollection = function(userID, collection, callback) {
  try {
    storage.connect(function(db) {
      find(db, userID, function(document) {
        db.collection('users').updateOne(
          { code: userID },
          { $set: { "collection" : collection } },
          { upsert: true },
        function(error, result) {
          storage.disconnect(db, function() {
            callback(true);
          });
        });
      });
    });
  } catch (e) {
    console.log(e);
  }
}

exports.getContext = function(userID, callback) {
  try {
    storage.connect(function(db) {
      find(db, userID, function(res) {
        storage.disconnect(db, function() {
          if (res) {
            callback(res.context, res.info, res.collection);
          } else {
            callback('', '');
          }
        });
      });
    });
  } catch (e) {
    console.log(e);
  }
}


exports.findFollowersSenator = function(callback) {
  try {
    db.get().collection('users').aggregate(
      [
        {
          $lookup: {
            from: "followers_senator",
            localField: "code",
            foreignField: "user",
            as: "user_followers"
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

exports.findFollowersDepFederal = function(callback) {
  try {
    db.get().collection('users').aggregate(
      [
        {
          $lookup: {
            from: "followers_dep_federal",
            localField: "code",
            foreignField: "user",
            as: "user_followers"
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

exports.findAll = function(callback) {
  try {
    db.get().collection('users').find({}).toArray(function(err, docs) {
      assert.equal(null, err);
      callback(docs);
    });
  } catch (e) {
    console.log(e);
  }
}

exports.findByCode = function(userID, callback) {
  try {
    db.get().collection('users').find({code: userID}).toArray(function(err, docs) {
      assert.equal(null, err);
      assert.equal(1, docs.length);
      callback(docs[0]);
    });
  } catch (e) {
    console.log(e);
  }
}

function find(db, userID, callback) {
  db.collection('users').findOne({code: userID}, function(err, document) {
    assert.equal(null, err);
    callback(document);
  })
}

function fullNameUser(userID, document, callback) {
  if (document) {
    firstName = document.first_name;
    lastName = document.last_name;
    callback(firstName, lastName);
  } else {
    facebook.getUserName(userID, function(fullName) {
      var n = fullName.indexOf(" ");
      firstName = fullName.slice(0,n).trim();
      lastName = fullName.slice(n).trim();
      callback(firstName, lastName);
    });
  };
}
