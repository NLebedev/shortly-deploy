var db = require('../config');
var crypto = require('crypto');
var mongoose = require('../../mongooseUtil');

var Link = function(url, baseUrl, code, title) {
  this.url = url;
  this.baseUrl = baseUrl;
  this.code = code;
  this.title = title;
  this.visits = 0;

  var shasum = crypto.createHash('sha1');
  shasum.update(this.url);
  this.code = shasum.digest('hex').slice(0, 5);
  
};

Link.prototype.saveToMongo = function(callback) {
  var context = this;
  var newLink = new mongoose.urlDB({
    url: context.url, 
    baseUrl: context.baseUrl, 
    code: context.code, 
    title: context.title, 
    visits: context.visits
  });
  newLink.save(function (err, link) {
    callback(link);
  });

};

Link.prototype.checkTableForLink = function(cb) {
  var context = this;
  mongoose.urlDB.findOne({url: context.url}, 
  function(err, item) {
    console.log('error', err);
    console.log('item', item);
    if (item) {
      console.log('LINK FOUND', err);
      console.log('LINK ITEM', item);
      cb(true, item);
    } else {
      console.log('LINK NOT FOUND. ERR:', err);
      cb(false);
    }
  });
};


module.exports = Link;
