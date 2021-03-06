/**
 * Including database initialization and schema design
 */


var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/SiliFood');
var collections = {};
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    var userSchema = mongoose.Schema({
        username: {type:String, unique: true},
        firstName: String,
        lastName: String,
        password: String,
        authSource: String,    // "local" or "facebook" or "google"
        recipes: {type:[String], default: []},
        followers: {type:[String], default: []},
        followings: {type:[String], default: []},
        createdAt: {type: Date, default: Date.now}
    });
    var recipeSchema = mongoose.Schema({
        title: {type:String, required: true},
        owner: String,
        ingredients: {type: {String:String}, default: {}},
        imageUrl: {type: [String], default: []},
        steps: {type: [String], default: []},
        notes: String,
        ratings: {type: mongoose.Schema.Types.Mixed, default: {}},
        averageRating: {type: Number, default: 0},
        comments:{type:[mongoose.Schema.Types.Mixed], default: []},
        createdAt: {type: Date, default: Date.now}
    });

    var cookieSchema = mongoose.Schema({
        cookie: String,
        username: String,
        createdAt: {type: Date, default: Date.now, expires: 3600}
    });

    collections.User = mongoose.model('user', userSchema);
    collections.Recipe = mongoose.model('recipe', recipeSchema);
    collections.Cookie = mongoose.model('cookie', cookieSchema);

});

module.exports = collections;