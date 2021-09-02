require("dotenv").config();
var Roles = require('../../model/Roles');

exports.createRole = function(req) {
    return new Promise(function(resolve, reject) {
      if(!req.body.name) reject({ message: "Du musst einen Namen angeben"});
      if(!req.body.fullname) reject({ message: "Du musst einen kompletten Namen angeben"});
      if(!req.body.color) reject({ message: "Du musst eine Farbe angeben"});
      if(!req.body.permissions) req.body.permissions = [];
      new Roles({ name: req.body.name, fullname: req.body.fullname, color: req.body.color, permissions: req.body.permissions }).save()
      .then(result => {
        if(result) {
          resolve({result, message: "Diese Role wurde erstellt"})
        } else {
          reject();
        }
      });
    });
}

exports.updateRole = function(req) {
  return new Promise(function(resolve, reject) {
    var update = {};
    if(req.body.name)
      update.name = req.body.name;
    if(req.body.fullname)
      update.fullname = req.body.fullname;
    if(req.body.color)
      update.color = req.body.color;
    if(Array.isArray(req.body.permissions)) { 
      if(req.body.permissions)
        update.permissions = req.body.permissions;
    } else {
      if(req.body.permissions)
        update = { $addToSet: { permissions: req.body.permissions } };
    }
    Roles.findByIdAndUpdate(req.params.id, update, {new: true})
    .then(result => {
      if(result) {
        resolve({result, message: "Diese Role wurde aktualisiert"})
      } else {
        reject();
      }
    });
  });
}

exports.deleteRole = function(req) {
  return new Promise(function(resolve, reject) {
    Roles.findByIdAndDelete(req.params.id)
    .then(result => {
      if(result) {
        resolve({result, message: "Diese Role wurde gelöscht"})
      } else {
        reject();
      }
    });
  });
}

exports.getRoles = function(req) {
  return new Promise(function(resolve, reject) {
    Roles.find()
    .then(result => {
      if(result) {
        resolve({result})
      } else {
        reject();
      }
    });
  });
}

exports.getRole = function(req) {
  return new Promise(function(resolve, reject) {
    Roles.findById(req.params.id)
    .then(result => {
      if(result) {
        resolve({result})
      } else {
        reject();
      }
    });
  });
}