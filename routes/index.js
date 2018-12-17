var express = require('express');
var router = express.Router();

var async = require('async');

var db = require('../models/db');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'A NOVA VOZ' });
});

module.exports = router;
