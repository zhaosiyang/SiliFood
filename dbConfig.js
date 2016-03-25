/**
 * Created by zhaosiyang on 2016-03-11.
 */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/SiliFood');
var collections = {};
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    var userSchecma = mongoose.Schema({
        username: {type:String, unique: true},
        firstName: String,
        lastName: String,
        password: String,
        authSource: String,    // "local" or "facebook" or "google"
        recipes: {type:[String], default: []},
        friends: {type:[String], default: []},
        followers: {type:[String], default: []},
        followings: {type:[String], default: []},
        createdAt: {type: Date, default: Date.now}
    });
    var recipeSchema = mongoose.Schema({
        title: {type:String, required: true},
        owner: String,
        ingredients: {default: {}},
        imageUrl: {type: [String], default: []},
        steps: {type: [String], default: []},
        notes: String,
        ratings: {type: {String: Number}, default: {}},
        comments:{type: [{
            commenter: String,
            contents: String,
            createdAt: Date
        }], default: []},
        createdAt: {type: Date, default: Date.now}
    });

    collections.User = mongoose.model('user', userSchecma);
    collections.Recipe = mongoose.model('recipe', recipeSchema);

});

module.exports = collections;