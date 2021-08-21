require("dotenv").config();
var { User, Google } = require('../core');

// OAuth2 from Google
const oauth2Client = new Google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
);

exports.getGoogleURL = function(req) {
    return new Promise(function(resolve, reject) {
        const url = oauth2Client.generateAuthUrl({
            access_type: 'online',
            scope: [ 'email', 'profile', 'openid' ],
        });
        if(url)
            resolve({ url: url })
        else
            reject()
    });
}

exports.getGoogleCallback = function(req) {
    return new Promise(function(resolve, reject) {
        const url = oauth2Client.generateAuthUrl({
            access_type: 'online',
            scope: [ 'email', 'profile', 'openid' ],
        });
        if(url)
            resolve({ url: url })
        else
            reject()
    });
}

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