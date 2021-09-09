require("dotenv").config();
var OS = require('../model/OS');

exports.getOSs = function(req) {
    return new Promise(function(resolve, reject) {
      OS.find().then(os => {
        resolve({os});
      });
    });
}

exports.getOS = function(req) {
    return new Promise(function(resolve, reject) {
      OS.findById(req.params.id).then(os => {
        resolve({os});
      });
    });
}