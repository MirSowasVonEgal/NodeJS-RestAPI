require("dotenv").config();


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
  admin.auth().verifyIdToken(token).then((claims) => {
    return claims;
  });
}