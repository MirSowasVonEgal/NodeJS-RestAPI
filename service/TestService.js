require("dotenv").config();
const FirebaseAuth = require('firebaseauth'); // or import FirebaseAuth from 'firebaseauth';
const Firebase = new FirebaseAuth(process.env.FIREBASE_API_KEY);

exports.getTest = function(req) {
    return new Promise(function(resolve, reject) {
        Firebase.signInWithEmail("timootten95@gmail.com", "Timo0580ABC", function(error, result){
        if (error)
            reject(error);
        else
            resolve(result);
        });
    });
}