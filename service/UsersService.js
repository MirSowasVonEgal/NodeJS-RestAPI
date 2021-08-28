require("dotenv").config();
var User = require('../model/User');

exports.getUsers = function(req) {
    return new Promise(function(resolve, reject) {
        admin.auth().listUsers(1000).then((users) => {
          resolve(users.users);
          })
          .catch((error) => {
            reject(error);
          });
    });
}

exports.getUser = function(req) {
  return new Promise(function(resolve, reject) {
     if(!req.params.userid) req.params.userid = "";
      admin.auth().getUser(req.params.userid).then((user) => {
          resolve(user);
        })
        .catch((error) => {
          reject(error);
        });
  });
}