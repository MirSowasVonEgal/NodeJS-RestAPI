require("dotenv").config();
var router = require('express').Router();
var { Response, ProductService, Auth } = require('../core');

router.get('/:type', Auth, async function(req, res) {
    ProductService.getProduct(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});

router.get('', Auth, async function(req, res) {
    ProductService.getProducts(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});


module.exports = router;