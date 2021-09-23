require("dotenv").config();
var router = require('express').Router();
var { Response, PayPalService, Auth } = require('../core');


router.get('/paypal', Auth, async function(req, res) {
    PayPalService.getURL(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});

router.post('/paypal', Auth, async function(req, res) {
    PayPalService.chargeUser(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});

module.exports = router;