'use strict';

process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();
var assert = require('assert');

var app = require('../../app');
var storage = require('../../models/storage');

chai.use(chaiHttp);

require('dotenv').config();

describe('Test Connect/Disconnect MongoDB', function() {
  
  it('Connect/Disconnect MongoDB', function(done) {
    var db;
    storage.connect(function(db) {
      db.s.databaseName.should.equal('anovavoz-test');
      
      storage.disconnect(db, function(result) {
        result.should.equal(true);
        done();
      });
    });
  });

});
