var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');
var Users = require('../app/collections/users');
var Links = require('../app/collections/links');
var mongoose = require('../mongooseUtil');


exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  mongoose.urlDB.find(function(err, links) {
    console.log('LINKS: ', links);
    res.status(200).send(links);
  });

  // Links.reset().fetch().then(function(links) {
  //   res.status(200).send(links.models);
  // });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }

  var newLink = new Link(uri);
  
  newLink.checkTableForLink(function(flag, item) {
    if (flag) {
      console.log('flag', flag);
      console.log('item.attributes', item.attributes);
      res.status(200).send(item);
    } else {
      console.log('flag2', flag);

      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.sendStatus(404);
        }
        newLink.title = title;
        newLink.baseUrl = req.headers.origin;
        // newLink.url = newLink.baseUrl + '/' + newLink.url;
        newLink.saveToMongo(function(newLink) {
          res.status(200).send(newLink);
        });
      });
    }
  });

};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var potentialUser = new User(username, password);
  potentialUser.checkTableForUser(function(exists, tablePassword) {
    if (!exists) {
      res.redirect('/login');
    } else {
      potentialUser.comparePassword(tablePassword, function(match) {
        if (match) {
          util.createSession(req, res, potentialUser);
        } else {
          res.redirect('/login');
        }
      });
    }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var potentialUser = new User (username, password);
  potentialUser.checkTableForUser(function(flag) {
    if (flag) {
      console.log('Account already exists');
      res.redirect('/signup');        
    } else {
      potentialUser.saveToMongo(function () {
        util.createSession(req, res, potentialUser);
      });
      
    }
  });
};

exports.navToLink = function(req, res) {
  var link = mongoose.urlDB.findOne({code: req.params[0]}, function(err, link) {
    if (!link) {
      res.redirect('/');
    } else {
      link.visits++;
      mongoose.urlDB.findOneAndUpdate({url: link.url}, link, function() {
        console.log('updated db');
        return res.redirect(link.url);
      });
      // .save()
    }
  });
};