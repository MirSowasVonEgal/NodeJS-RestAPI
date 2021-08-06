require("dotenv").config();
const FirebaseAuth = require('firebaseauth'); // or import FirebaseAuth from 'firebaseauth';
const Firebase = new FirebaseAuth(process.env.FIREBASE_API_KEY);
var admin = require('firebase-admin');  


exports.getTest = function(req) {
    return new Promise(function(resolve, reject) {
        var db = admin.firestore();
        const docRef = db.collection('users').doc('alovelace');

        docRef.set({
        first: 'Ada',
        last: 'Lovelace',
        born: 1815
        }).then(result => {
            resolve(result);
        });

    });
}