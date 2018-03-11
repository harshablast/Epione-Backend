var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://harshablast:atom1234@ds012168.mlab.com:12168/epione-users");

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
    console.log("Connected")
});

module.exports = {mongoose};