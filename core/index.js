require("dotenv").config();
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
exports.PDF = require('html-pdf');
exports.FS = require("fs");
exports.Argon2 = require("argon2");
exports.Auth = require("../middleware/Auth");
exports.AuthService = require('../service/AuthService');
exports.UsersService = require('../service/UsersService');
exports.RolesService = require('../service/RolesService');
exports.InvoiceService = require('../service/InvoiceService');
exports.PayPal = require('paypal-rest-sdk');

// Payment Services
exports.PayPalService = require('../service/payment/PayPalService');

exports.User = require('../model/User');
exports.Response = require('./Response');

