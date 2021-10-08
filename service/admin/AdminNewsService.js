require("dotenv").config();
var News = require('../../model/News');

exports.addNews = function(req) {
    return new Promise(function(resolve, reject) {
      if(!req.body.tag) return reject({ message: "Du musst einen Tag angeben"});
      if(!req.body.title) return reject({ message: "Du musst einen Titel angeben"});
      if(!req.body.color) return reject({ message: "Du musst eine Farbe angeben"});
      if(!req.body.message) return reject({ message: "Du musst eine Nachricht angeben"});
      new News({ tag: req.body.tag, title: req.body.title, color: req.body.color, message: req.body.message }).save().then(news => {
          resolve({news})
      });
    });
}