require("dotenv").config();
var router = require('express').Router();
var { Response, AdminNetworkService, Auth } = require('../../core');

router.post('', Auth, async function(req, res) {
    if((req.user.role.permissions.find(i => i == "network")) || req.user.role.permissions.find(i => i == '*')) {
        AdminNetworkService.addIPAddresses(req)
        .then(function (response) {
            Response.successfully(response, req, res);
        })
        .catch(function (response) {
            Response.failed(response, req, res);
        });
    }
});

module.exports = router;