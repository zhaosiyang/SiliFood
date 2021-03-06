/**
 * Deal with all the GET and POST
 */

var express = require('express');
var router = express.Router();
var collections = require('../dbConfig');
var bcrypt = require('bcrypt');
var fs = require('fs');
var escape = require('escape-html');

//get a user object by username
router.get('/userById', function(req, res, next) {
    var username = escape(req.query.username);
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

//get a recipeobject by recipe ID
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

// get all users (for admin use)
router.get('/allUsers', function(req, res, next) {
    collections.User.find({}, function(err, data){
        if (err) {
            res.status(500).send(err);
        }
        else{
            res.json(data);
        }
    });
});

//get a list of recipes which belong to a particular user
router.get('/allRecipesByUsername', function(req, res, next) {
    var username = escape(req.query.username);
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

//get top n best rated recipes
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

// get a list of recipe objects which contains search string
router.get('/searchRecipeByTitle', function(req, res, next){
    var title = escape(req.query.title);
    collections.Recipe.find({title: {$regex: title, $options: 'i'}}, function(err, recipes){
        if(err){
            res.status(500).send(err);
        }
        else{
            res.json(recipes);
        }
    });
});

// get a list of recipe objects that belong to a particular user
router.get('/recipesByUsername', function(req, res, next){
    var username = req.query.username;
    collections.User.findOne({username: username}, function(err, user){
        if(err){
            res.status(500).send(err);
        }
        else if(!user){
            res.status(500).send("user not found");
        }
        else{
            var recipes = user.recipes;
            collections.Recipe.find({_id: {$in: recipes}}, function(err, recipes){
                if (err){
                    res.status(500).send(err);
                }
                else{
                    res.json(recipes);
                }
            });
        }
    });
});

// add a new comment
router.post('/newComment', function(req, res, next){
    var params = req.body;
    var commenter = escape(params.commenter);
    var recipeId = params.recipeId;
    var contents = escape(params.contents);
    collections.Recipe.findOne({_id:recipeId}, function(err, recipe){
        if (err) {
            res.status(500).send(err);
            return;
        }
        if(!recipe){
            res.status(500).send("recipe not found");
            return;
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
                res.redirect('/');
            }
        });
    });
});

// add a new rating
router.post('/newRating', function(req, res, next){
    var params = req.body;
    var rater = escape(params.rater);
    var recipeId = params.recipeId;
    var rating = params.rating;
    console.log(params);

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
            recipe.markModified('averageRating');
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

// follow someone
router.post('/follow', function(req, res, next){
    var params = req.body;
    //var username = escape(params.username);
    var objId = escape(params.objId);

    var authCookie = req.cookies.siliFoodAuth;

    collections.Cookie.findOne({cookie: authCookie}, function(err, c){
        if(err){
            res.status(500).send(err);
        }
        else if(!c){
            res.status.send("session expired");
        }
        else{
            var username = c.username;
            collections.User.findOne({username:username}, function(err, user){
                if (err) {
                    res.status(500).send(err);
                    return;
                }
                if(!user){
                    res.status(500).send("not valid username");
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
                            res.redirect('/');
                        });
                    });

                });
            });
        };
    });
});


// unfollow someone
router.post('/unfollow', function(req, res, next){
    var params = req.body;
    //var username = escape(params.username);
    var objId = escape(params.objId);
    var authCookie = req.cookies.authCookie;

    collections.Cookie.findOne({cookie: authCookie}, function(err, c) {
        if (err) {
            res.status(500).send(err);
        }
        else if (!c) {
            res.status.send("session expired");
        }
        else {
            var username = c.username;
            collections.User.findOne({username:username}, function(err, user){
                if (err) {
                    res.status(500).send(err);
                    return;
                }
                if(!user){
                    res.status(500).send("not valid username");
                    return;
                }
                user.followings.splice(user.followings.indexOf(objId),1);
                user.markModified('followings');
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
                        obj.followers.splice(user.followers.indexOf(username) ,1);
                        obj.markModified('followers');
                        obj.save(function(err){
                            if (err) {
                                res.status(500).send(err);
                                return;
                            }
                            res.redirect('/');
                        });
                    });
                });
            });


        }
    });
});

// create a new recipe
router.post('/newRecipe', function(req, res, next) {
    var params = req.body;
    console.log(params);
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
                else{
                    fs.readFile(req.file.path, function (err, data) {
                        fs.writeFile("./public/recipeImage/" + new_recipe._id, data, function (err) {
                            if(err){res.status(500).send(err);}
                            else{
                                res.redirect('/');
                            }
                        });
                    });
                }
            });
        });
    });
});

// create a new user
router.post('/newUser', function(req, res, next) {
    var params = req.body;
    bcrypt.genSalt(10, function(err, salt){
        if (err) {
            res.status(500).send(err);
        }
        else{
            bcrypt.hash(params.password, salt, function(err, hashValue){
                if (err) {
                    res.status(500).send(err);
                }
                else{
                    params.password = hashValue;
                    var newUser = collections.User(params);
                    newUser.save(function(err){
                        if(err){
                            res.status(500).send(err);
                        }
                        else{
                            res.send('ok');
                        }
                    });
                }

            });
        }
    });
});

// add profile image
router.post('/addProfileImage', function(req, res, next){
    fs.readFile(req.file.path, function (err, data) {
        console.log("username is:");
        console.log(req.body);
        fs.writeFile("./public/profileImage/" + req.body.username, data, function (err) {
            if(err){res.status(500).send(err);}
            else{
                res.redirect('/');
            }
        });
    });
});

// delete a recipe
router.post('/deleteRecipe', function(req, res, next){
    var recipeId = req.body.recipeId;
    collections.Recipe.find({_id: recipeId}, function(err, recipe){
        if(err){
            res.status(500).send(err);
        }
        else if(!recipe){
            res.status(500).send("recipe not valid");
        }
        else{
            var owner = recipe.owner;
            recipe.remove(function(err){
                if(err){
                    res.status(500).send(err);
                }
                else{
                    collections.User.findOne({username: owner}, function(err, u){
                        if(err){
                            res.status(500).send(err);
                        }
                        else if (!u){
                            res.status(500).send("not a valid owner");
                        }
                        else{
                            var i = u.recipes.indexOf(recipeId);
                            u.recipes.splice(i,1);
                            u.markModified('recipes');
                            u.save(function(err){
                                if(err){
                                    res.status(500).send(err);
                                }
                                else{
                                    res.status(200).send('ok');
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

// change a password
router.post('/changePassword', function(req, res, next){
    var password = req.body.password;
    var username = req.body.username;
    collections.findOne({username: username}, function(err, user){
        if(err){
            res.status(500).send(err);
        }
        else if (!user){
            res.status(500).send("no user found");
        }
        else{
            bcrypt.genSalt(10, function(err, salt){
                bcrypt.hash(password, salt, function(err, hash){
                    password = hash;
                    user.password = password;
                    user.markModified('password');
                    user.save(function(err){
                        if(err){
                            res.status(500).send(err);
                        }
                        else{
                            res.send('ok');
                        }
                    });
                });
            });
        }
    });

});

module.exports = router;
