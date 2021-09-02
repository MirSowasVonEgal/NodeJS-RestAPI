require("dotenv").config();
var router = require('express').Router();
var { Response, AdminTicketService, Auth } = require('../../core');


router.post('', Auth, async function(req, res) {
    AdminTicketService.createTicket(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});

router.put('/:id', Auth, async function(req, res) {
    AdminTicketService.updateTicket(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});

router.get('', Auth, async function(req, res) {
    AdminTicketService.getTickets(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});


module.exports = router;