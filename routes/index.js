var express = require('express');
var router = express.Router();
var passport = require("passport");
require('./passport.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.use(passport.initialize());
router.use(passport.session());

router.get('/search', function(req, res, next){
    res.render('search');
});

router.get('/auth/facebook',
    passport.authenticate('facebook'));

router.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/' }),
    function(req, res) {
      // Successful authentication, redirect home.
      res.redirect('/');
    });

router.get('/testDB', function(req, res, next){
  res.render("testDB");
});

module.exports = router;
