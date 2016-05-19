var mongoose = require('mongoose');

var schemas = require('./schema');
var c = mongoose.createConnection('mongodb://localhost:27017/users');
module.exports.userDB = c.model('users', schemas.users);
var c2 = mongoose.createConnection('mongodb://localhost:27017/urls');

module.exports.urlDB = c2.model('urls', schemas.urls);