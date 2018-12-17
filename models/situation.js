var facebook = require('../controllers/facebook');
var utilities = require('../controllers/utilities');
var storage = require('../models/storage');
var db = require('../models/db');

var moment = require('moment-timezone');
var assert = require('assert');

exports.set = function(userID, menu, intent, callback) {
  try {
    storage.connect(function(db) {
      db.collection('situations').updateOne(
        { user: userID },
        { $set: { menu: menu,
                  intent: intent,
                  action: '',
                  times: 0,
                  document: null,
                  date_context: moment().format('MMM Do YYYY, h:mm:ss a') } },
        { upsert: true },
      function(error, result) {
        storage.disconnect(db, function() {
          callback(true);
        });
      });
    });
  } catch (e) {
    console.log(e);
  }
}


exports.setAction = function(userID, action, times, doc, callback) {
  try {
    storage.connect(function(db) {
      db.collection('situations').updateOne(
        { user: userID },
        { $set: { action: action,
                  times: times,
                  document: doc,
                  date_context: moment().format('MMM Do YYYY, h:mm:ss a') } },
        { upsert: true },
      function(error, result) {
        storage.disconnect(db, function() {
          callback(true);
        });
      });
    });
  } catch (e) {
    console.log(e);
  }
}

exports.addTimes = function(userID, callback) {
  try {
    storage.connect(function(db) {
      db.collection('situations').findOne({user: userID}, function(err, res) {
        if (res) {
          db.collection('situations').updateOne(
            { user: userID },
            { $set: { times: res.times + 1,
                      date_context: moment().format('MMM Do YYYY, h:mm:ss a') } },
            { upsert: true },
          function(error, result) {
            storage.disconnect(db, function() {
              callback(true);
            });
          });          
        }
      })
    });
  } catch (e) {
    console.log(e);
  }
}

exports.get = function(userID, callback) {
  try {
    storage.connect(function(db) {
      db.collection('situations').findOne({user: userID}, function(err, res) {
        storage.disconnect(db, function() {
          if (res) {
            callback(res);
          } else {
            callback('');
          }
        });
      });
    });
  } catch (e) {
    console.log(e);
  }
}
