var express = require("express");
var app = express();

// Controllers
var AuthController = require('./controller/AuthController');
var ChargeController = require('./controller/ChargeController');
var InvoiceController = require('./controller/InvoiceController');
var TicketController = require('./controller/TicketController');
var VServerController = require('./controller/VServerController');
var ProductController = require('./controller/ProductController');
var OSController = require('./controller/OSController');
var RootServerController = require('./controller/RootServerController');

// Admin Controllers
var AdminTicketController = require('./controller/admin/AdminTicketController');
var AdminUsersController = require('./controller/admin/AdminUsersController');
var AdminRolesController = require('./controller/admin/AdminRolesController');
var AdminVServerController = require('./controller/admin/AdminVServerController');
var AdminNetworkController = require('./controller/admin/AdminNetworkController');
var AdminProductController = require('./controller/admin/AdminProductController');
var AdminOSController = require('./controller/admin/AdminOSController');
var AdminRootServerController = require('./controller/admin/AdminRootServerController');

// Use Controllers
app.use('/auth', AuthController);
app.use('/charge', ChargeController);
app.use('/invoices', InvoiceController);
app.use('/ticket', TicketController);
app.use('/vserver', VServerController);
app.use('/product', ProductController);
app.use('/os', OSController);
app.use('/rootserver', RootServerController);

// Use Admin Controllers
app.use('/admin/users', AdminUsersController);
app.use('/admin/roles', AdminRolesController);
app.use('/admin/ticket', AdminTicketController);
app.use('/admin/vserver', AdminVServerController);
app.use('/admin/network', AdminNetworkController);
app.use('/admin/product', AdminProductController);
app.use('/admin/os', AdminOSController);
app.use('/admin/rootserver', AdminRootServerController);

module.exports = app;