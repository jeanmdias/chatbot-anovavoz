#!/usr/bin/env node

var express = require('express');
var request = require('request');
var assert = require('assert');
var async = require('async');

var twitter = require('../controllers/twitter');

require('dotenv').config();

var db = require('../models/db');
var user = require('../models/user');
var follower = require('../models/follower');

console.log(' ');
console.log('**************************************************************************************');
console.log('** Start HEROKU scheduler_get_event_rj_rio_de_janeiro_votings.js ');
console.log('**************************************************************************************');

var votingsToDelivery;
var usersToDelivery;
var document = [];

async.series([

  function(callback) {
    db.connect(function(err) {
      if (err) {
        console.log('** Nao foi possivel conectar no MongoDB!!');
        process.exit(1);
      } else {
        console.log('** MongoDB Connected!!!');
        callback();
      }
    });
  },

  function(callback) {
    follower.findFollowers('followers_rj_rio_de_janeiro', function(users) {
      usersToDelivery = users;
      callback();
    });
  },

  function(callback) {
    db.get().collection('events_rj_rio_de_janeiro_votings').find({"status": 'waiting'}).toArray(function(err,res) {
      votingsToDelivery = res;
      callback();
    })
  },

  function(callback) {
    async.forEach(votingsToDelivery, function(voting, callback) {
      async.forEach(usersToDelivery, function(user, callback) {

        if (user.user_followers.length > 0) {

          db.get().collection('events_rj_rio_de_janeiro_votings_deliveries').findOne({
            _idEventVoting: voting._id,
            _idUser: user._id
          }, function(err, res) {
            assert.equal(null, err);
            if (res == null) {
              db.get().collection('events_rj_rio_de_janeiro_votings_deliveries').insertOne({
                _idEventVoting: voting._id,
                _idUser: user._id,
                delivery: false
              }, function(err, res) {
                assert.equal(null, err);
                console.log('** I', res.ops[0]._id);
                callback();
              });
            } else {
              console.log('** R', res._id);
              callback();
            }
          });
        } else {
          callback();
        }
      }, function() {
        db.get().collection('events_rj_rio_de_janeiro_votings').findOneAndUpdate(
          { _id: voting._id },
          { $set: { "status": 'done' } },
          function(err, res) {
            assert.equal(null,err);
            callback();
          }
        );
      });
    }, function() {
      callback();
    })
  },

  function(callback) {
    setTimeout( function() {
      db.get().close( function(err) {
        assert.equal(null, err);
        console.log('** MongoDB Disconnected!!!');
        console.log('** The End!!');
        console.log('**************************************************************************************');
        callback();
      })
    }, 1500);
  }
], function() {
  process.exit(1);
});
