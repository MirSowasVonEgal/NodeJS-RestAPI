require("dotenv").config();
var { User } = require('../core');


exports.getTest = function(req) {
    return new Promise(function(resolve, reject) {

        new User({ _id: 'Test1232', username: "Test", email: "test@test.com" }).save()
        .then(result => resolve(result)).catch(error => resolve(error));
    });
}