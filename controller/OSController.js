require("dotenv").config();
var router = require('express').Router();
var { Response, OSService, Auth } = require('../core');

router.get('', Auth, async function(req, res) {
    OSService.getOSs(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});

router.get('/:id', Auth, async function(req, res) {
    OSService.getOS(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});



module.exports = router;