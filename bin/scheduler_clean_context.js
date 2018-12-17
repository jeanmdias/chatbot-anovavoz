#!/usr/bin/env node

var express = require('express');
var assert = require('assert');
var async = require('async');

require('dotenv').config();

var db = require('../models/db');
var user = require('../models/user');
var facebook = require('../controllers/facebook');

console.log(' ');
console.log('**************************************************************************************');
console.log('Start HEROKU scheduler_clean_context.js');
console.log('**************************************************************************************');
console.log(' ');

var users = [];

async.series([

  function(callback) {
    db.connect(function(err) {
      if (err) {
        console.log('Nao foi possivel conectar no MongoDB!!');
        process.exit(1);
      } else {
        console.log('MongoDB Connected!!!');
        console.log(' ');
        callback();
      }
    });    
  },

  function(callback) {
    db.get().collection('users').find().toArray(function(err, res) {
      if (res.length > 0) {
        users = res;        
      }
      callback();
    });
  },

  function(callback) {
    async.forEach(users, function(user, callback) {
      db.get().collection('users').findOneAndUpdate(
        { _id: user._id },
        { $set: { context: "" } },
        function(err, res) {
          assert.equal(null,err);
          callback();
        }
      );
    }, function() {
      callback();
    });
  },

  function(callback) {
    db.get().collection("situations").deleteMany({})
    callback();
  }

], function() {
  db.close(function(err) {
    console.log('MongoDB Disconnected!!');
  });
});
