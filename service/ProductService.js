require("dotenv").config();
var Product = require('../model/Product');

exports.getProduct = function(req) {
    return new Promise(function(resolve, reject) {
      Product.find({type: req.params.type}).then(products => {
        resolve({products});
      });
    });
}

exports.getProducts = function(req) {
    return new Promise(function(resolve, reject) {
      Product.find().then(products => {
        resolve({products});
      });
    });
}