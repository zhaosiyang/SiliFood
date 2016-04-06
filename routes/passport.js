/**
 * Created by vijaybala on 16-04-03.
 */
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var auth = require('./auth.js');
var collections = require("../dbConfig.js");

passport.serializeUser(function(user, cb) {
    cb(null, user);
});

passport.deserializeUser(function(user, cb){
    cb(null,user);
});

passport.use(new FacebookStrategy({
        clientID: auth.facebookAuth.clientID,
        clientSecret: auth.facebookAuth.clientSecret,
        callbackURL: auth.facebookAuth.callbackURL,
        profileFields: ['id', 'displayName', 'name']
    },
    function(accessToken, refreshToken, profile, cb) {
        process.nextTick(function(){
            collections.User.findOne({username : profile.id}, function(err, user){
                if (err) {
                    return cb(err);
                }
                if (user){
                    return cb(null, user);
                }else{
                    var newU = new collections.User();
                    newU.username = profile._json.id;
                    newU.firstName = profile._json.first_name;
                    newU.lastName = profile._json.last_name;
                    newU.authSource = "facebook";
                    newU.save(function(err){
                        if (err){
                            return cb(err);
                        }else{
                            return cb(null,newU);
                        }
                    });
                }
            });
        });
    }
));

