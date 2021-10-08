require("dotenv").config();
var router = require('express').Router();
var { Response, AdminNewsService, Auth } = require('../../core');

router.post('', Auth, async function(req, res) {
    if((req.user.role.permissions.find(i => i == "news")) || req.user.role.permissions.find(i => i == '*')) {
        AdminNewsService.addNews(req)
        .then(function (response) {
            Response.successfully(response, req, res);
        })
        .catch(function (response) {
            Response.failed(response, req, res);
        });
    }
});

module.exports = router;