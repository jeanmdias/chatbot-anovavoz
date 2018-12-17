'use strict';

process.env.NODE_ENV = 'test';

var chai = require('chai');
var app = require('../../app');
var should = chai.should();

var assert = require('assert');
var storage = require('../../models/storage');
var user = require('../../models/user');

before(function() {
  storage.connect(function(db) {
    db.collection('users').deleteMany({});
    db.collection('users').insertOne({code: 1, first_name: 'first', last_name: 'last'});
    storage.disconnect(db, function() {});
  })
})

describe('Test model user', function() {
  it('exists?', function(done) {
    storage.connect(function(db) {
      user.exists(db, 1, function(result) {
        storage.disconnect(db, function() {});
        result.should.equal(true);
        done();
      });
    });
  });

  it('NOT exists?', function(done) {
    storage.connect(function(db) {
      user.exists(db, 100, function(result) {
        storage.disconnect(db, function() {});
        result.should.equal(false);
        done();
      });
    });
  });


});
