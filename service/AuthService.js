require("dotenv").config();
var { Firebase } = require('../core');
var User = require('../model/User');


exports.loginUser = function(req) {
    return new Promise(function(resolve, reject) {
        if(!req.body.email) req.body.email = "";
        if(!req.body.password) req.body.password = "";
        Firebase.signInWithEmail(req.body.email, req.body.password, function(error, result){
        if (error)
            reject(error);
        else
            resolve(result);
        });
    });
}

exports.registerUser = function(req) {
    return new Promise(function(resolve, reject) {
        if(!req.body.email) req.body.email = "";
        if(!req.body.password) req.body.password = "";
        if(!req.body.username) reject({ message: "Invalid or missing field: Username"});
        Firebase.registerWithEmail(req.body.email, req.body.password, { name: req.body.username }, function(error, result) {
        if (!error) {
            Firebase.sendVerificationEmail(result.token, function(error2, result2) {
                if(!error2) {
                    new User({ _id: result.user.id, user: result.user, settings: { language: 'de' } }).save()
                    .then(() => resolve(result)).catch(error => reject(error));
                } else
                    reject(error2);
            });
        } else {
            reject(error);
        }
        
        });
    });
}

exports.getProfile = function(req) {
    return new Promise(function(resolve, reject) {
        if(!req.headers.authorization) req.headers.authorization = "";
        const token = req.headers.authorization.split(' ');
        if(!token[1]) token[1] = "";
        Firebase.getProfile(token[1], function(error, result) {
        if (error)
            reject(error);
        else
            resolve(result[0]);
        });
    });
}