var express = require('express');
var router = express.Router();
var passport = require("passport");
var collections = require('../dbConfig');
require('./passport.js');
var bcrypt = require("bcrypt");

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
        bcrypt.genSalt(function(err, result){
            if (err) {
                res.status(500).send(err);
            }else{
                var newCookie = new collections.Cookie();
                newCookie.cookie = result;
                newCookie.save(function(err){
                    if (err){
                        res.status(500).send(err);
                    }else{
                        res.cookie('siliFoodAuth', result, {maxAge:3600000});
                        res.redirect('/');
                    }
                });
            }
        });
    });

router.get('/testDB', function(req, res, next){
  res.render("testDB");
});

module.exports = router;
