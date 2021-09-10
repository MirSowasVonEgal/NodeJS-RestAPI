require("dotenv").config();
exports.mongoose = require('mongoose');
const {google} = require('googleapis');
var FS = require("fs");
exports.FS = FS;
exports.Google = google;

// Enable Mail Server
var { SMTPClient } = require('emailjs');
exports.Mail = new SMTPClient({
	user: process.env.MAIL_USERNAME,
	password: process.env.MAIL_PASSWORD,
	host: process.env.MAIL_HOST,
	ssl: (process.env.MAIL_SSL === 'true'),
});

var Default_Mail = FS.readFileSync("./templates/mail/Default.html").toString();
exports.Default_Mail = Default_Mail;

// Enable TelegramBot
process.env.NTBA_FIX_319 = 1;
const TG = require('node-telegram-bot-api');
const TelegramBot = new TG(process.env.TELEGRAM_TOKEN, {polling: true});
TelegramBot.onText(/\/chatid/, (msg, match) => {
	TelegramBot.sendMessage(msg.chat.id, 'Die ChatID lautet: ' + msg.chat.id);
});
exports.TelegramBot = TelegramBot;

const pveajs = require("pvea")
exports.Proxmox = new pveajs(process.env.PROXMOX_HOST, process.env.PROXMOX_USER, process.env.PROXMOX_PASSWORD);
    

exports.JWT = require("jsonwebtoken");
exports.PDF = require('html-pdf');
exports.Argon2 = require("argon2");
exports.PayPal = require('paypal-rest-sdk');
exports.Auth = require("../middleware/Auth");

// Service
exports.AuthService = require('../service/AuthService');
exports.InvoiceService = require('../service/InvoiceService');
exports.TicketService = require('../service/TicketService');
exports.VServerService = require('../service/VServerService');
exports.ProductService = require('../service/ProductService');
exports.OSService = require('../service/OSService');
exports.RootServerService = require('../service/RootServerService');

// Admin Service
exports.AdminUsersService = require('../service/admin/AdminUsersService');
exports.AdminRolesService = require('../service/admin/AdminRolesService');
exports.AdminTicketService = require('../service/admin/AdminTicketService');
exports.AdminVServerService = require('../service/admin/AdminVServerService');
exports.AdminNetworkService = require('../service/admin/AdminNetworkService');
exports.AdminProductService = require('../service/admin/AdminProductService');
exports.AdminOSService = require('../service/admin/AdminOSService');
exports.AdminRootServerService = require('../service/admin/AdminRootServerService');


// Payment Services
exports.PayPalService = require('../service/payment/PayPalService');

exports.User = require('../model/User');
exports.Response = require('./Response');

