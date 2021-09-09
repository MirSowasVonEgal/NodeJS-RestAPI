require("dotenv").config();
var router = require('express').Router();
var { Response, AdminProductService, Auth } = require('../../core');

router.post('', Auth, async function(req, res) {
    if((req.user.role.permissions.find(i => i == "product")) || req.user.role.permissions.find(i => i == '*')) {
        AdminProductService.addProduct(req)
        .then(function (response) {
            Response.successfully(response, req, res);
        })
        .catch(function (response) {
            Response.failed(response, req, res);
        });
    }
});

module.exports = router;