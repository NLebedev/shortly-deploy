// var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

var url = 'mongodb://localhost:27017/users';

var User = function(username, password) {
  this.username = username;
  this.password = password;
  this.hashPassword();
  this.tableName = 'users';
};

User.prototype.comparePassword = function(attemptedPassword, callback) {
  bcrypt.compare(attemptedPassword, this.password, function(err, isMatch) {
    callback(isMatch);
  });
};

User.prototype.hashPassword = function() {
  var cipher = Promise.promisify(bcrypt.hash);
  // console.log('HASH!!!!!!!!',bcrypt.hash('t',null,null));
  // console.log('HASH!!!!!!!!',bcrypt.hash('t',null,null));

  return cipher(this.password, null, null).bind(this)
    .then(function(hash) {
      this.password = hash;
    });
};

User.prototype.saveToMongo = function(callback) {
  var context = this;
  MongoClient.connect(url, function(err, db) {
    if (err) {
      console.log('error in db:', err);
    } else {
      console.log('connected to', db);
      var collection = db.collection('users');
      collection.insert({
        username: context.username,
        password: context.password
      }, {w: 1}, function(err, records) {
        if (err) {
          console.log(err);
        } else {
          console.log('Records added as ', records[0]);
        }
        callback();
        db.close();

      });
    }
  });
};

User.prototype.checkTableForUser = function(cb) {
  var context = this;
  MongoClient.connect(url, function(err, db) {
    if (err) {
      console.log('error in db:', err);
    } else {
      console.log('connected!');
      var collection = db.collection('users');
      // collection.find({
      //   username: context.username,
      //   password: context.password
      // }, {w: 1}, function(err, records) {
      //   if (err) {
      //     console.log('NO USER FOUND, TRYING TO SAVE. ERR:', err);
      //     context.saveToMongo();
      //     cb(false);
      //   } else {
      //     console.log('FOUND USER. ERR:', err);
      //     // context.saveToMongo();
      //     cb(true);
      //   }
      // });
      console.log(context.username, context.password);
      collection.findOne({
        username: context.username
        //password: context.password
      }, function(err, item) {
        console.log('error', err);
        console.log('item', item);
        if (item) {
          console.log('USER FOUND', err);
          cb(true);
        } else {
          console.log('USER NOT FOUND. ERR:', err);
          context.saveToMongo(function() { cb(false); });
          
        }
        db.close();
      });

    }
  });
};

// User.prototype.saveToMongoSync = Promise.promisify(User.prototype.saveToMongo);

module.exports = User;