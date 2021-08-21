require("dotenv").config();
exports.router = require('express').Router();
exports.mongoose = require('mongoose');
const {google} = require('googleapis');
exports.Google = google;
exports.AuthService = require('../service/AuthService');
exports.UsersService = require('../service/UsersService');
exports.User = require('../model/User');
exports.Response = require('./Response');