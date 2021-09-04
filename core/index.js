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

// pvea library.
const pveajs = require("pvea")

// create a new instance, you can use this to connect to multiple nodes if you want.
const pvea = new pveajs('192.168.2.133', 'root@pam', 'Timo0580');
 function main() {
    // get version of proxmox API.
	
    pvea.getLxcContainerStatus("pve", 110).then(res => {
		console.log(res)
	});
    pvea.getClusterNextid().then(nextid => {
		params = {
			vmid: nextid,
			ostemplate: "local:vztmpl/debian-11-standard_11.0-1_amd64.tar.gz",
			storage: 'local-lvm',
			cores: 6,
			memory: 2048,
			password: 'Timo0580',
			start: 1,
			net0: 'virtio=3A:39:38:30:36:31,bridge=vmbr0'
		}
        pvea.createLxcContainer("pve", params).then(lxc => {
			if(lxc.status == 200) {
				console.log(lxc.data)
			} else {
				console.log("Error!")
			}
		})
    })
}

// execute the application.
pvea.run(main)

exports.JWT = require("jsonwebtoken");
exports.PDF = require('html-pdf');
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

