require("dotenv").config();
var { User, Google } = require('../core');


exports.getTest = function(req) {
    return new Promise(function(resolve, reject) {
        resolve("dd")

    });
}