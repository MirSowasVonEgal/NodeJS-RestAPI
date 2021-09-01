var express = require("express");
var app = express();

// Controllers
var AuthController = require('./controller/AuthController');
var UsersController = require('./controller/UsersController');
var RolesController = require('./controller/RolesController');
var ChargeController = require('./controller/ChargeController');
var InvoiceController = require('./controller/InvoiceController');
var TestController = require('./controller/TestController');

// Use Controllers
app.use('/auth', AuthController);
app.use('/users', UsersController);
app.use('/roles', RolesController);
app.use('/charge', ChargeController);
app.use('/invoices', InvoiceController);
app.use('/test', TestController);

module.exports = app;