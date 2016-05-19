// var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var db = require('../../mongoUtil');

var User = function(username, password) {
  this.username = username;
  this.password = password;
  this.unHashed = password;
  this.hashPassword();
  this.tableName = 'users';
};

User.prototype.comparePassword = function(tablePassword, callback) {
  var result = bcrypt.compareSync(this.unHashed, tablePassword);
  callback(result);
};

User.prototype.hashPassword = function() {
  var cipher = Promise.promisify(bcrypt.hash);
  return cipher(this.password, null, null).bind(this)
    .then(function(hash) {
      this.password = hash;
    });
};

User.prototype.saveToMongo = function(callback) {
  //refactored
  var context = this;
  var connection = db.get();
  var table = connection.collection('users');
  table.insert({
    username: context.username,
    password: context.password
  }, {w: 1}, function(err, records) {
    if (err) {
      console.log(err);
    } else {
      console.log('Record added');
    }
    callback();
  });
};

User.prototype.checkTableForUser = function(cb) {
  
  var context = this;
  var connection = db.get();
  var table = connection.collection('users');
  table.findOne({
    username: context.username
  }, 
  function(err, item) {
    console.log('error', err);
    console.log('item', item);
    if (item) {
      console.log('USER FOUND', err);
      console.log('PASSWORD: ', item.password);
      cb(true, item.password);
    } else {
      console.log('USER NOT FOUND. ERR:', err);
      cb(false);
    }
  });
};

// User.prototype.saveToMongoSync = Promise.promisify(User.prototype.saveToMongo);

module.exports = User;