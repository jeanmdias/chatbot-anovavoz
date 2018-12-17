var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('politicadeprivacidade', { title: 'A NOVA VOZ' });
});

module.exports = router;
