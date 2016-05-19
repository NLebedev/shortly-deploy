var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports.users = new Schema({
  username: String,
  password: String,
});

module.exports.urls = new Schema({
  url: String,
  baseUrl: String,
  code: String,
  title: String,
  visits: Number
});
