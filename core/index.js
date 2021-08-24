require("dotenv").config();
exports.router = require('express').Router();
exports.mongoose = require('mongoose');
const {google} = require('googleapis');
exports.Google = google;
var { SMTPClient } = require('emailjs');
exports.Mail = new SMTPClient({
	user: 'admin@shademc.de',
	password: 'Timo0580!',
	host: 'coffee.deinserverhost.de',
	ssl: true,
});

exports.JWT = require("jsonwebtoken");
exports.Argon2 = require("argon2");
exports.Auth = require("../middleware/Auth");
exports.AuthService = require('../service/AuthService');
exports.UsersService = require('../service/UsersService');
exports.User = require('../model/User');
exports.Response = require('./Response');

