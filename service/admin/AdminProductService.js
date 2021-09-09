require("dotenv").config();
var Product = require('../../model/Product');

exports.addProduct = function(req) {
    return new Promise(function(resolve, reject) {
      if(!req.body.type) return reject({ message: "Du musst einen Typen angeben"});
      if(!req.body.data) return reject({ message: "Du musst Daten angeben"});
      if(!req.body.price) return reject({ message: "Du musst einen Preis angeben"});
      new Product({ type: req.body.type, data: req.body.data, price: req.body.price }).save().then(product => {
          resolve({product})
      });
    });
}