require("dotenv").config();
exports.mongoose = require('mongoose');
const {google} = require('googleapis');
exports.Google = google;

// Enable Mail Server
var { SMTPClient } = require('emailjs');
exports.Mail = new SMTPClient({
	user: process.env.MAIL_USERNAME,
	password: process.env.MAIL_PASSWORD,
	host: process.env.MAIL_HOST,
	ssl: (process.env.MAIL_SSL === 'true'),
});

// Enable TelegramBot
process.env.NTBA_FIX_319 = 1;
const TG = require('node-telegram-bot-api');
const TelegramBot = new TG(process.env.TELEGRAM_TOKEN, {polling: true});
TelegramBot.onText(/\/chatid/, (msg, match) => {
	TelegramBot.sendMessage(msg.chat.id, 'Die ChatID lautet: ' + msg.chat.id);
});
exports.TelegramBot = TelegramBot;

exports.JWT = require("jsonwebtoken");
exports.PDF = require('html-pdf');
exports.FS = require("fs");
exports.Argon2 = require("argon2");
exports.PayPal = require('paypal-rest-sdk');
exports.Auth = require("../middleware/Auth");

// Service
exports.AuthService = require('../service/AuthService');
exports.InvoiceService = require('../service/InvoiceService');
exports.TicketService = require('../service/TicketService');

// Admin Service
exports.AdminUsersService = require('../service/admin/AdminUsersService');
exports.AdminRolesService = require('../service/admin/AdminRolesService');
exports.AdminTicketService = require('../service/admin/AdminTicketService');


// Payment Services
exports.PayPalService = require('../service/payment/PayPalService');

exports.User = require('../model/User');
exports.Response = require('./Response');

