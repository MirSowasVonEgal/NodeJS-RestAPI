var express = require("express");
var app = express();

// Controllers
var AuthController = require('./controller/AuthController');
var ChargeController = require('./controller/ChargeController');
var InvoiceController = require('./controller/InvoiceController');
var TicketController = require('./controller/TicketController');

// Admin Controllers
var AdminTicketController = require('./controller/admin/AdminTicketController');
var AdminUsersController = require('./controller/admin/AdminUsersController');
var AdminRolesController = require('./controller/admin/AdminRolesController');

// Use Controllers
app.use('/auth', AuthController);
app.use('/charge', ChargeController);
app.use('/invoices', InvoiceController);
app.use('/ticket', TicketController);

// Use Admin Controllers
app.use('/admin/users', AdminUsersController);
app.use('/admin/roles', AdminRolesController);
app.use('/admin/ticket', AdminTicketController);

module.exports = app;