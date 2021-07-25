var express = require("express");
var app = express();

// Controllers
var AuthController = require('./controller/AuthController');
var UsersController = require('./controller/UsersController');
var TestController = require('./controller/TestController');

// Use Controllers
app.use('/auth', AuthController);
app.use('/users', UsersController);
app.use('/test', TestController);

module.exports = app;