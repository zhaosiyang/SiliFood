var express = require('express');
var router = express.Router();
var passport = require("passport");
var collections = require('../dbConfig');
require('./passport.js');
var collections = require('../dbConfig.js');
var bcrypt = require("bcrypt");

/* GET home page. */
//router.get('/', function(req, res, next) {
//  res.render('index');
//});

router.use(passport.initialize());
router.use(passport.session());

//local sign up
router.post('/signup', function(req, res, next){
    var params = req.body;
    var username = params.username;
    var password = params.password;
    var firstName = params.firstName;
    var lastName = params.lastName;
    var authSource = params.authSource;

    bcrypt.genSalt(10, function(err, salt){
        bcrypt.hash(password, salt, function(err, hash){
            password = hash;
            var t = new collections.User({
                username: username,
                password: password,
                firstName: firstName,
                lastName: lastName,
                authSource: authSource
            });
            t.save(function(err) {
                if(err) {
                    if (err.code == 11000){
                        res.render("username already exist");
                    }
                    else{
                        res.send(err);
                    }
                }
                else {
                    res.redirect("/");
                }
            });
        });
    });
});

// local authentication
router.post('/login', function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    console.log(req.body);
    collections.User.findOne({username:username}, function(err, user){
        if(err){
            res.send(err);
        }
        if (!user) {
            res.status(401).send("username not found");
        }
        else {
            var hashedPassword = user.password;
            bcrypt.compare(password, hashedPassword, function(err, result){
                if (result) {   //password match
                    //generate a session cookie (nothing to do with encryption, just a generate a random string with bcrypt function)
                    bcrypt.genSalt(function(err, salt) {
                        var cookieEntry = new collections.Cookie({username: username, cookie: salt});
                        cookieEntry.save(function(err){
                            if(err){
                                res.status(500).send(err);
                            }
                        });
                        res.cookie('siliFoodAuth', salt, {maxAge: 3600000}); //expire one min later
                        setTimeout(res.render('profile', {username:username}),2000);
                    });
                }
                else {   //wrong password
                    res.status(401).send("wrong password");
                }
            });
        }
    });
});

// facebook authentication
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

// check cookies
router.use(function(req, res, next){
    var authCookie = req.cookies.siliFoodAuth;
    collections.Cookie.findOne({cookie: authCookie}, function(err, c){
        if(err){
            res.status(500).send(err);
        }
        else if(!c){
            res.render('index');
        }
        else{
            res.render('profile');
        }
    });
});

router.get('/search', function(req, res, next){
    res.render('search');
});

router.get('/testDB', function(req, res, next){
  res.render("testDB");
});

module.exports = router;
