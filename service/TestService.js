require("dotenv").config();
var { User, Google } = require('../core');


exports.getTest = function(req) {
    return new Promise(function(resolve, reject) {

        //new User({ user: "Test", settings: "test@test.com" }).save()
        //.then(result => resolve(result)).catch(error => resolve(error));
        
        const oauth2Client = new Google.auth.OAuth2(
        "174360191367-3bgteqbn590i8g015cjv97k1k8jdj84e.apps.googleusercontent.com",
        "i412Y3qC8WzZBw_aoDoKxeg6",
        "http://localhost:3000/v1/test/hello/Hallo"
        );
        
        
        const url = oauth2Client.generateAuthUrl({
            access_type: 'online',
            scope: [ 'email', 'profile', 'openid' ],
        });

        //resolve(url);

        //const {tokens} = oauth2Client.getToken(req.query.code).then(result => console.log(result)).catch(error => console.log(error));
        
        oauth2Client.setCredentials({
            access_token: "ya29.a0ARrdaM9EaM4jm491sZxT5aMvTZg2IzmlqUHYxUUMP4PvKJZEYWyrwlEyv4lG2lH3HSlrwxg2fJ1YCY4iKLp7F9iFLiWwc279NKu7pUKbhGSChqVUJIqxM-j_7wpKqdQe1lV2W3PDmkH6l6-EfW5xQ0m4iV0i",
        });

        Google.oauth2("v2").userinfo.get({
            auth: oauth2Client,
        }, (err, data) => (err ? reject(err) : resolve(data)));
    });
}