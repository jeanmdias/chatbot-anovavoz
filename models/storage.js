var assert = require('assert');
var MongoClient = require('mongodb').MongoClient;

require('dotenv').config();

var mongoDbUri = process.env.MONGODB_URI;
if (process.env.NODE_ENV == 'test') {
  mongoDbUri = process.env.MONGODB_URI_TEST;
}

var state = {
  db: null,
}

exports.connect = function(callback) {
  MongoClient.connect(mongoDbUri, function(err, db) {
    assert.equal(null, err);
    callback(db);
  })
}

exports.disconnect = function(db, callback) {
  db.close;
  callback(true);
}
