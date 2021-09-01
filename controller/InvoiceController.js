require("dotenv").config();
var router = require('express').Router();
var { Response, InvoiceService, Auth } = require('../core');


router.get('/:id', Auth, async function(req, res) {
    InvoiceService.showInvoice(req, res).then()
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});

router.get('', Auth, async function(req, res) {
    InvoiceService.getInvoices(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});


module.exports = router;