require("dotenv").config();
var User = require('../../model/User');

exports.updateUser = function(req) {
  return new Promise(function(resolve, reject) {
    var update = {};
    if(req.body.confirmed)
      update.confirmed = req.body.confirmed;
    if(req.body.blocked)
      update.blocked = req.body.blocked;
    if(req.body.role)
      update.role = req.body.role;
    if(req.body.balance)
      update.balance = req.body.balance;
    if(req.body.settings)
      update.settings = req.body.settings;
    if(req.body.username)
      update.username = req.body.username;
    if(req.body.email)
      update.email = req.body.email;
    if(req.body.supportid)
      update.supportid = req.body.supportid;
    User.findByIdAndUpdate(req.params.id, update, {new: true})
    .then(user => {
      if(user) {
        resolve({user, message: "Dieser User wurde aktualisiert"})
      } else {
        reject();
      }
    });
  });
}

exports.deleteUser = function(req) {
  return new Promise(function(resolve, reject) {
    User.findByIdAndDelete(req.params.id)
    .then(user => {
      if(user) {
        resolve({user, message: "Dieser User wurde gelöscht"})
      } else {
        reject();
      }
    });
  });
}

exports.getUsers = function(req) {
  return new Promise(function(resolve, reject) {
    User.find()
    .then(user => {
      if(user) {
        resolve({user})
      } else {
        reject();
      }
    });
  });
}

exports.getUser = function(req) {
  return new Promise(function(resolve, reject) {
    User.findById(req.params.id)
    .then(user => {
      if(user) {
        resolve({user})
      } else {
        reject();
      }
    });
  });
}

exports.getUserBySupportID = function(req) {
  return new Promise(function(resolve, reject) {
    User.find({ "supportid" : { $regex : new RegExp(`^${req.params.id}`) } })
    .then(users => {
      if(users) {
        resolve({users})
      } else {
        reject();
      }
    });
  });
}