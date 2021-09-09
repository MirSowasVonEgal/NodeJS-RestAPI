require("dotenv").config();
var router = require('express').Router();
var { Response, VServerService, Auth } = require('../core');


router.post('/:id', Auth, async function(req, res) {
    VServerService.orderVServer(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});

router.get('/:id', Auth, async function(req, res) {
    VServerService.getVServer(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});

router.get('', Auth, async function(req, res) {
    VServerService.getVServers(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});

router.get('/:id/vnc', Auth, async function(req, res) {
    VServerService.getVNC(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});

router.post('/:id/start', Auth, async function(req, res) {
    VServerService.startVServer(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});

router.post('/:id/stop', Auth, async function(req, res) {
    VServerService.stopVServer(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});

router.post('/:id/reboot', Auth, async function(req, res) {
    VServerService.rebootVServer(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});

router.post('/:id/shutdown', Auth, async function(req, res) {
    VServerService.shutdownVServer(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});


router.post('/:id/shutdown', Auth, async function(req, res) {
    VServerService.shutdownVServer(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});

module.exports = router;