// var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var db = require('../../mongoUtil');
var mongoose = require('../../mongooseUtil');

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
  var context = this;
  var newUser = new mongoose.userDB({username: context.username, password: context.password});
  newUser.save(function (err, fluffy) {
    callback();
  });

};

User.prototype.checkTableForUser = function(cb) {
  var context = this;
  mongoose.userDB.findOne({username: context.username}, 
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