require("dotenv").config();
var router = require('express').Router();
var { Response, RootServerService, Auth } = require('../core');


router.post('/:id', Auth, async function(req, res) {
    RootServerService.orderRootServer(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});

router.get('/:id', Auth, async function(req, res) {
    RootServerService.getRootServer(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});

router.get('', Auth, async function(req, res) {
    RootServerService.getRootServers(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});

router.get('/:id/vnc', Auth, async function(req, res) {
    RootServerService.getVNC(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});

router.post('/:id/start', Auth, async function(req, res) {
    RootServerService.startRootServer(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});

router.post('/:id/stop', Auth, async function(req, res) {
    RootServerService.stopRootServer(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});

router.post('/:id/reboot', Auth, async function(req, res) {
    RootServerService.rebootRootServer(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});

router.post('/:id/shutdown', Auth, async function(req, res) {
    RootServerService.shutdownRootServer(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});


router.post('/:id/shutdown', Auth, async function(req, res) {
    RootServerService.shutdownRootServer(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});

module.exports = router;