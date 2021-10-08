require("dotenv").config();
var router = require('express').Router();
var { Response, NewsService, Auth } = require('../core');

router.get('', Auth, async function(req, res) {
    NewsService.getNews(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});


module.exports = router;