require("dotenv").config();
var admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(process.env.FIREBASE_API_FILE),
  databaseURL: process.env.FIREBASE_API_DATABASE
});

exports.getUsers = function(req) {
    return new Promise(function(resolve, reject) {
        admin.auth().listUsers(1000).then((users) => {
            resolve(users.users);
          })
          .catch((error) => {
            reject(error);
          });
    });
}

exports.getUser = function(req) {
  return new Promise(function(resolve, reject) {
      console.log(setClaim("eyJhbGciOiJSUzI1NiIsImtpZCI6IjFiYjk2MDVjMzZlOThlMzAxMTdhNjk1MTc1NjkzODY4MzAyMDJiMmQiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiVGVzdEFjYzEiLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vZmlyZWF1dGgtZGV2IiwiYXVkIjoiZmlyZWF1dGgtZGV2IiwiYXV0aF90aW1lIjoxNjI3MjMxOTIyLCJ1c2VyX2lkIjoiZGVKbGJCam1IU1EyUm11UUllNWt1R1duR2hHMyIsInN1YiI6ImRlSmxiQmptSFNRMlJtdVFJZTVrdUdXbkdoRzMiLCJpYXQiOjE2MjcyMzE5MjIsImV4cCI6MTYyNzIzNTUyMiwiZW1haWwiOiJ0aW1vb3R0ZW45NUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJ0aW1vb3R0ZW45NUBnbWFpbC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.AWfdaqpTt_9uZdlnyxJrffCdntP0lH1LzqiYcf2dKGAv4FqQfJA9hHgmwWl3y2qlawYN-hUucPoA4vdOOk2l8lrsHlVuBYy4ylyfJBwRv2NxoY_AFTm1oLeBupsxizT3nQ1XQKPLdAtSgqNwreDlgc68clkqlXVOoUW-EYnYxwNdPkp6sa4Cete4V15KBd28qIVAVEfOaSyfWMjkO_bmwlLpdQAUwTI8xJQufJTKfV5EIWwW-StsiE9ZDiXM3rBiL4gmSF2Y8Km6GfmCnTRACIL5CfBFCJnx3nOBkU2EVDmRmrPxRXxdEjSk96Rb3NWHBslWD6fbZe_ydPGosU92ow"));
      if(!req.params.userid) req.params.userid = "";
      admin.auth().getUser(req.params.userid).then((user) => {
          resolve(user);
        })
        .catch((error) => {
          reject(error);
        });
  });
}

setClaim = function(userid) { 
    admin.auth().setCustomUserClaims("deJlbBjmHSQ2RmuQIe5kuGWnGhG3", { rank: "Admin" }).then();
}

getClaimsByToken = function(token) { 
  admin
  .auth()
  .verifyIdToken(token)
  .then((claims) => {
    return claims;
  });
}