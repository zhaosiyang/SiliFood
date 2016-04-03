/**
 * Deal with all the GET and POST
 */

var express = require('express');
var router = express.Router();
var collections = require('../dbConfig');
var bcrypt = require('bcrypt');
var fs = require('fs');
var escape = require('escape-html');

//
router.get('/userById', function(req, res, next) {
    var username = req.query.username;
    console.log(username);
    collections.User.findOne({username: username}, function(err, data){
        if (err) {
            res.status(500).send(err);
        }
        else if (!data) {
            res.status(500).send("User Not Found!")
        }
        else{
            res.json(data);
        }
    });
});

router.get('/recipeById', function(req, res, next) {
    var recipeId = req.query.recipeId;
    collections.Recipe.findOne({_id: recipeId}, function(err, data){
        if (err) {
            res.status(500).send(err);
        }
        else if (!data) {
            res.status(500).send("Recipe Not Found!")
        }
        else{
            res.json(data);
        }
    });
});

router.get('/allUsers', function(req, res, next) {
    collections.Recipe.find({}, function(err, data){
        if (err) {
            res.status(500).send(err);
        }
        else{
            res.json(data);
        }
    });
});

router.get('/allRecipesByUsername', function(req, res, next) {
    var username = req.query.username;
    collections.User.findOne({username: username}, function(err, user){
        if (err) {
            res.status(500).send(err);
        }
        else if (!user) {
            res.status(500).send("User Not Found!");
        }
        else{
            var recipeIds = user.recipes;
            collections.Recipe.find({_id: {$in:recipeIds}}, function(err, recipes){
                if(err){
                    res.status(500).send(err);
                }
                else if(!recipes){
                    res.json(recipes);
                }
                else {
                    res.json(recipes);
                }
            });
        }
    });
});

router.get('/recipeOrderByRating', function(req, res, next){
    var number = parseInt(req.query.number);
    if(!number){
        res.status(500).send("not a valid number");
    }
    else{
        collections.Recipe.find().sort('-averageRating').limit(number).exec(function(err, recipes){
            if(err){
                res.status(500).send(err);
            }
            else{
                res.json(recipes);
            }
        });
    }
});

router.get('/searchRecipeByTitle', function(req, res, next){
    var title = req.query.title;
    collections.Recipe.find({title: {$regex: title, $options: 'i'}}, function(err, recipes){
        if(err){
            res.status(500).send(err);
        }
        else{
            res.json(recipes);
        }
    });
});

router.post('/newComment', function(req, res, next){
    var params = req.body;
    var commenter = params.commenter;
    var recipeId = params.recipeId;
    var contents = params.contents;
    collections.Recipe.findOne({_id:recipeId}, function(err, recipe){
        if (err) {
            res.status(500).send(err);
        }
        recipe.comments.push({
            commenter: commenter,
            contents: contents,
            createdAt: new Date()
        });
        recipe.markModified('comments');
        recipe.save(function(err){
            if (err) {
                res.status(500).send(err);
            }
            else{
                res.status(200).send("ok");
            }
        });
    });
});
router.post('/newRating', function(req, res, next){
    var params = req.body;
    var rater = params.rater;
    var recipeId = params.recipeId;
    var rating = params.rating;
    //console.log(rater);
    //console.log(rating);
    //console.log(recipeId);
    if(rating!='1' && rating!='2' && rating!='3' && rating!='4' && rating!='5'){
        res.status(500).send("rating not correct");
        return;
    }
    rating = parseInt(rating);
    collections.Recipe.findOne({_id:recipeId}, function(err, recipe){
        if (err) {
            res.status(500).send(err);
        }
        else if(!recipe){
            res.status(500).send("no recipe found based on your id");
        }
        else{
            recipe.ratings[rater] = rating;
            var newRatings = recipe.ratings;
            var ratingNumber = Object.keys(newRatings).length;
            var sum = 0;
            for (var key in newRatings){
                sum += newRatings[key];
            }
            recipe.averageRating = sum / ratingNumber;

            recipe.markModified('ratings');
            recipe.save(function(err, r, numAffected){
                if (err) {
                    res.status(500).send(err);
                }
                //console.log(r);
                //console.log(numAffected);
                else {
                    res.status(200).send("ok");
                }
            });
        }
    });
});
router.post('/follow', function(req, res, next){
    var params = req.body;
    var username = params.username;
    var objId = params.objId;

    collections.User.findOne({username:username}, function(err, user){
        if (err) {
            res.status(500).send(err);
            return;
        }
        user.followings.push(objId);
        user.save(function(err, u){
            if (err) {
                res.status(500).send(err);
                return;
            }

            collections.User.findOne({username: objId}, function(err, obj){
                if (err) {
                    res.status(500).send(err);
                    return;
                }
                obj.followers.push(username);
                obj.save(function(err, o){
                    if (err) {
                        res.status(500).send(err);
                        return;
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
        if (!user1 || !user2){
            res.status(500).send("username not correct");
        }
        else{
            users[0].friends.push(users[1].username);
            users[1].friends.push(users[2].username);
            users[0].save(function(err, u){
                if (err) {
                    res.status(500).send(err);
                }
                else{
                    users[1].save(function(err, u){
                        if (err) {
                            res.status(500).send(err);
                        }
                        else{
                            res.status(200).send("ok");
                        }

                    });
                }
            });
        }
    });
});
router.post('/newRecipe', function(req, res, next) {
    var params = req.body;
    var new_recipe = collections.Recipe(params);
    new_recipe.steps = JSON.parse(new_recipe.steps);
    new_recipe.ingredients = JSON.parse(new_recipe.ingredients);

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
            user.recipes.push(new_recipe._id);
            user.save(function(err, u){
                if (err) {
                    res.status(500).send(err);
                }
                fs.readFile(req.file.path, function (err, data) {
                    fs.writeFile("./public/recipeImage/" + new_recipe._id + ".jpg", data, function (err) {
                        if(err){res.status(500).send(err);}
                        else{
                            res.send("ok");
                        }
                    });
                });
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
