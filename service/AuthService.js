require("dotenv").config();
var User = require('../model/User');
var { Google, JWT } = require('../core');

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
            reject({ message: "The url could not be created" })
    });
}

exports.getGoogleCallback = function(req) {
    return new Promise(function(resolve, reject) {
        if(req.query.code == null) reject({ messsage: "No query input \"code\" was found!" })
        oauth2Client.getToken(req.query.code).then((result) => {
            oauth2Client.setCredentials(result.tokens);
            Google.oauth2("v2").userinfo.get({
                auth: oauth2Client,
            }).then(result => {
                const data = result.data;
                User.findOne({ email: data.email }, (err, result) => {
                    if(!result) {
                        new User({ username: data.name, email: data.email, provider: "Google", confirmed: data.verified_email, settings: { language: data.locale } }).save()
                        .then(result => {
                            result.password = undefined;
                            const token = JWT.sign({
                                uuid: result._id,
                                email: result.email,
                                role: result.role,
                            }, process.env.JWT_SECRET, { expiresIn: '2h' });
                            resolve({ user: result, token: token })
                        })
                        .catch(error => {
                            console.log(error) 
                            reject(error)
                        });

                    } else {
                        User.updateOne({ email: data.email }, { last_login: new Date().getTime(), confirmed: data.verified_email }).then();
                        result.password = undefined;
                        const token = JWT.sign({
                            uuid: result._id,
                            email: result.email,
                            role: result.role,
                        }, process.env.JWT_SECRET, { expiresIn: '2h' });
                        resolve({ user: result, token: token })
                    }
                });
                

            }).catch(error => reject(error))
        }).catch(error => reject(error));
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
        if(!(req.body.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email))) reject({ message: "Du musst eine gültige E-Mail angeben"});
        if(!(req.body.password && req.body.password.length >= 8)) reject({ message: "Du musst ein Passwort mit mindestens 8 Zeichen angeben"});
        if(!(req.body.username && req.body.username.length >= 4 && req.body.username.length <= 16)) reject({ message: "Du musst einen Nutzernamen mit mindestens 4 und maximal 16 Zeichen angeben"});
        new User({ username: req.body.username, email: req.body.email, password: req.body.password }).save()
        .then(result => {
            result.password = undefined;
            resolve(result);
        }).catch(error => {
            reject({ message: "Deine E-Mail oder dein Nutzername wurde bereits verwendet. Es kann sein, dass du dich über einen Provider angemelden musst" })
        });
    });
}

exports.getProfile = function(req) {
    return new Promise(function(resolve, reject) {
        User.findOne({ _id: req.user.uuid })
        .then(result => {
            result.password = undefined;
            resolve(result)
        })
        .catch(error => reject(error));
    });
}