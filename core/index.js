require("dotenv").config();
exports.router = require('express').Router();
exports.mongoose = require('mongoose');
var FirebaseAuth = require('firebaseauth');
exports.Firebase = new FirebaseAuth(process.env.FIREBASE_API_KEY);
exports.AuthService = require('../service/AuthService');
exports.UsersService = require('../service/UsersService');
exports.User = require('../model/User');
exports.Response = require('./Response');