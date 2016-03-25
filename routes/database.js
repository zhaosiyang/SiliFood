/**
 * Created by zhaosiyang on 2016-03-24.
 */

var express = require('express');
var router = express.Router();
var collections = require('../dbConfig');
var bcrypt = require('bcrypt');

router.get('/userById', function(req, res, next) {
    var username = req.query.username;
    collections.User.findOne({username: username}, function(err, data){
        if (err) {
            res.status(500).send(err);
        }
        if (!data) {
            res.status(500).send("User Not Found!")
        }
        res.json(data);
    });
});

router.get('/recipeById', function(req, res, next) {
    var recipeId = req.query.recipeId;
    collections.Recipe.findOne({recipeId: recipeId}, function(err, data){
        if (err) {
            res.status(500).send(err);
        }
        if (!data) {
            res.status(500).send("Recipe Not Found!")
        }
        res.json(data);
    });
});

router.get('/allUsers', function(req, res, next) {
    collections.Recipe.find({}, function(err, data){
        if (err) {
            res.status(500).send(err);
        }
        res.json(data);
    });
});

router.get('/allRecipesByUsername', function(req, res, next) {
    var username = req.query.username;
    collections.User.findOne({username: username}, function(err, user){
        if (err) {
            res.status(500).send(err);
        }
        if (!user) {
            res.status(500).send("User Not Found!");
        }
        var recipeIds = data.recipes;
        var result = [];
        for (var recipeId in recipeIds) {
            collections.Recipe.findOne({recipeId: recipeId}, function(err, recipe){
                if(err){
                    res.status(500).send("Error when trying to find recipe ID: " + recipeId);
                }
                if(recipe){
                    result.push(recipe);
                }
            });
        }
        /* may have bugs here */
        res.json(result);
    });
});
router.post('/newComment', function(req, res, next){
    var params = req.body;
    var commenter = params.commenter;
    var recipeId = params.recipeId;
    var contents = params.contents;
    collections.Recipe.findOne({recipeId:recipeId}, function(err, recipe){
        if (err) {
            res.status(500).send(err);
        }
        recipe.comments.push({
            commenter: commenter,
            contents: contents,
            createdAt: new Date()
        });
        recipe.save(function(err, r){
            if (err) {
                res.status(500).send(err);
            }
            res.status(200).send("ok");
        });
    });
});
router.post('/newRating', function(req, res, next){
    var params = req.body;
    var rater = params.rater;
    var recipeId = params.recipeId;
    var rating = params.rating;
    collections.Recipe.findOne({recipeId:recipeId}, function(err, recipe){
        if (err) {
            res.status(500).send(err);
        }
        recipe.ratings[rater] = rating;
        recipe.save(function(err, r){
            if (err) {
                res.status(500).send(err);
            }
            res.status(200).send("ok");
        });
    });
});
router.post('/follow', function(req, res, next){
    var params = req.body;
    var username = params.username;
    var objId = params.objId;

    collections.User.findOne({username:username}, function(err, user){
        if (err) {
            res.status(500).send(err);
        }
        user.followings.push(objId);
        user.save(function(err, u){
            if (err) {
                res.status(500).send(err);
            }

            collections.User.findOne({username: objId}, function(err, obj){
                if (err) {
                    res.status(500).send(err);
                }
                obj.followers.push(username);
                obj.save(function(err, o){
                    if (err) {
                        res.status(500).send(err);
                    }
                    res.status(200).send("ok");
                });
            });

        });
    });
});
router.post('/addFriend', function(req, res, next){
    var params = req.body;
    var user1 = params.user1;
    var user2 = params.user2;
    collections.find({username: {$in: [user1, user2]}}, function(err, users){
        if (err) {
            res.status(500).send(err);
        }
        users[0].friends.push(users[1].username);
        users[1].friends.push(users[2].username);
        users[0].save(function(err, u){
            if (err) {
                res.status(500).send(err);
            }
            users[1].save(function(err, u){
                if (err) {
                    res.status(500).send(err);
                }
                res.status(200).send("ok");
            });
        });
    });
});
router.post('/newRecipe', function(req, res, next) {
    var params = req.body;
    var new_recipe = collections.Recipe(params);
    new_recipe.save(function(err, r){
        if (err) {
            res.status(500).send(err);
        }
        collections.User.findOne({username: params.owner}, function(err, user){
            if (err) {
                res.status(500).send(err);
            }
            if (!user) {
                res.status(500).send("User not found");
            }
            user.recipes.push(params.recipeId);
            user.save(function(err, u){
                if (err) {
                    res.status(500).send(err);
                }
                res.status(200).send("ok");
            });
        });
    });
});
router.post('/newUser', function(req, res, next) {
    var params = req.body;
    bcrypt.genSalt(10, function(err, salt){
        if (err) {
            res.status(500).send(err);
        }
        bcrypt.hash(params.password, salt, function(err, hashValue){
            if (err) {
                res.status(500).send(err);
            }
            params.password = hashValue;
            var newUser = collections.User(params);
            newUser.save(function(err, u){
                if(err){
                    res.status(500).send(err);
                }
                res.status(200).send("ok");
            });
        });
    });
});

module.exports = router;
