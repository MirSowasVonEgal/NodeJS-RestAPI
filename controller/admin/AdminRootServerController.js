require("dotenv").config();
var router = require('express').Router();
var { Response, AdminRootServerService, Auth } = require('../../core');

router.post('', Auth, async function(req, res) {
    if((req.user.role.permissions.find(i => i == "rootserver")) || req.user.role.permissions.find(i => i == '*')) {
        AdminRootServerService.createRootServer(req)
        .then(function (response) {
            Response.successfully(response, req, res);
        })
        .catch(function (response) {
            Response.failed(response, req, res);
        });
    }
});

router.get('', Auth, async function(req, res) {
    if((req.user.role.permissions.find(i => i == "rootserver")) || req.user.role.permissions.find(i => i == '*')) {
        AdminRootServerService.getVServers(req)
        .then(function (response) {
            Response.successfully(response, req, res);
        })
        .catch(function (response) {
            Response.failed(response, req, res);
        });
    }
});

router.get('/:id', Auth, async function(req, res) {
    if((req.user.role.permissions.find(i => i == "rootserver")) || req.user.role.permissions.find(i => i == '*')) {
        AdminRootServerService.getVServer(req)
        .then(function (response) {
            Response.successfully(response, req, res);
        })
        .catch(function (response) {
            Response.failed(response, req, res);
        });
    }
});

router.post('/:id/start', Auth, async function(req, res) {
    if((req.user.role.permissions.find(i => i == "rootserver")) || req.user.role.permissions.find(i => i == '*')) {
        AdminRootServerService.startVServer(req)
        .then(function (response) {
            Response.successfully(response, req, res);
        })
        .catch(function (response) {
            Response.failed(response, req, res);
        });
    }
});

router.post('/:id/stop', Auth, async function(req, res) {
    if((req.user.role.permissions.find(i => i == "rootserver")) || req.user.role.permissions.find(i => i == '*')) {
        AdminRootServerService.stopVServer(req)
        .then(function (response) {
            Response.successfully(response, req, res);
        })
        .catch(function (response) {
            Response.failed(response, req, res);
        });
    }
});

router.post('/:id/reboot', Auth, async function(req, res) {
    if((req.user.role.permissions.find(i => i == "rootserver")) || req.user.role.permissions.find(i => i == '*')) {
        AdminRootServerService.rebootVServer(req)
        .then(function (response) {
            Response.successfully(response, req, res);
        })
        .catch(function (response) {
            Response.failed(response, req, res);
        });
    }
});

router.post('/:id/shutdown', Auth, async function(req, res) {
    if((req.user.role.permissions.find(i => i == "rootserver")) || req.user.role.permissions.find(i => i == '*')) {
        AdminRootServerService.shutdownVServer(req)
        .then(function (response) {
            Response.successfully(response, req, res);
        })
        .catch(function (response) {
            Response.failed(response, req, res);
        });
    }
});

router.get('/user/:id', Auth, async function(req, res) {
    if((req.user.role.permissions.find(i => i == "rootserver")) || req.user.role.permissions.find(i => i == '*')) {
        AdminRootServerService.getVServersByUser(req)
        .then(function (response) {
            Response.successfully(response, req, res);
        })
        .catch(function (response) {
            Response.failed(response, req, res);
        });
    }
});

router.get('/user/:id/vnc', Auth, async function(req, res) {
    if((req.user.role.permissions.find(i => i == "rootserver")) || req.user.role.permissions.find(i => i == '*')) {
        AdminRootServerService.getVNC(req)
        .then(function (response) {
            Response.successfully(response, req, res);
        })
        .catch(function (response) {
            Response.failed(response, req, res);
        });
    }
});


module.exports = router;