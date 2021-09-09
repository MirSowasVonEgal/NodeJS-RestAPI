require("dotenv").config();
var OS = require('../../model/OS');

exports.addOS = function(req) {
    return new Promise(function(resolve, reject) {
      if(!req.body.os) return reject({ message: "Du musst den OS angeben"});
      if(!req.body.number) return reject({ message: "Du musst die Nummer angeben"});
      new OS({ os: req.body.os, number: req.body.number, }).save().then(os => {
          resolve({os})
      });
    });
}