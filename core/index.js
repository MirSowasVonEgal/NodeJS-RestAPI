require("dotenv").config();
exports.router = require('express').Router();
exports.mongoose = require('mongoose');
const {google} = require('googleapis');
exports.Google = google;
var { SMTPClient } = require('emailjs');

exports.Mail = new SMTPClient({
	user: process.env.MAIL_USERNAME,
	password: process.env.MAIL_PASSWORD,
	host: process.env.MAIL_HOST,
	ssl: (process.env.MAIL_SSL === 'true'),
});
exports.JWT = require("jsonwebtoken");
exports.FS = require("fs");
exports.Argon2 = require("argon2");
exports.Auth = require("../middleware/Auth");
exports.AuthService = require('../service/AuthService');
exports.UsersService = require('../service/UsersService');
exports.User = require('../model/User');
exports.Response = require('./Response');

