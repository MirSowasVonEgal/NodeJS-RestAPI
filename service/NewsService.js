require("dotenv").config();
var News = require('../model/News');

exports.getNews = function(req) {
    return new Promise(function(resolve, reject) {
      News.find().then(news => {
        resolve({news});
      });
    });
}
