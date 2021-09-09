require("dotenv").config();
var router = require('express').Router();
var { Response, AdminVServerService, Auth } = require('../../core');

router.post('', Auth, async function(req, res) {
    if((req.user.role.permissions.find(i => i == "vserver")) || req.user.role.permissions.find(i => i == '*')) {
        AdminVServerService.createVServer(req)
        .then(function (response) {
            Response.successfully(response, req, res);
        })
        .catch(function (response) {
            Response.failed(response, req, res);
        });
    }
});

router.get('', Auth, async function(req, res) {
    if((req.user.role.permissions.find(i => i == "vserver")) || req.user.role.permissions.find(i => i == '*')) {
        AdminVServerService.getVServers(req)
        .then(function (response) {
            Response.successfully(response, req, res);
        })
        .catch(function (response) {
            Response.failed(response, req, res);
        });
    }
});

router.get('/:id', Auth, async function(req, res) {
    if((req.user.role.permissions.find(i => i == "vserver")) || req.user.role.permissions.find(i => i == '*')) {
        AdminVServerService.getVServer(req)
        .then(function (response) {
            Response.successfully(response, req, res);
        })
        .catch(function (response) {
            Response.failed(response, req, res);
        });
    }
});

router.post('/:id/start', Auth, async function(req, res) {
    if((req.user.role.permissions.find(i => i == "vserver")) || req.user.role.permissions.find(i => i == '*')) {
        AdminVServerService.startVServer(req)
        .then(function (response) {
            Response.successfully(response, req, res);
        })
        .catch(function (response) {
            Response.failed(response, req, res);
        });
    }
});

router.post('/:id/stop', Auth, async function(req, res) {
    if((req.user.role.permissions.find(i => i == "vserver")) || req.user.role.permissions.find(i => i == '*')) {
        AdminVServerService.stopVServer(req)
        .then(function (response) {
            Response.successfully(response, req, res);
        })
        .catch(function (response) {
            Response.failed(response, req, res);
        });
    }
});

router.post('/:id/reboot', Auth, async function(req, res) {
    if((req.user.role.permissions.find(i => i == "vserver")) || req.user.role.permissions.find(i => i == '*')) {
        AdminVServerService.rebootVServer(req)
        .then(function (response) {
            Response.successfully(response, req, res);
        })
        .catch(function (response) {
            Response.failed(response, req, res);
        });
    }
});

router.post('/:id/shutdown', Auth, async function(req, res) {
    if((req.user.role.permissions.find(i => i == "vserver")) || req.user.role.permissions.find(i => i == '*')) {
        AdminVServerService.shutdownVServer(req)
        .then(function (response) {
            Response.successfully(response, req, res);
        })
        .catch(function (response) {
            Response.failed(response, req, res);
        });
    }
});

router.get('/user/:id', Auth, async function(req, res) {
    if((req.user.role.permissions.find(i => i == "vserver")) || req.user.role.permissions.find(i => i == '*')) {
        AdminVServerService.getVServersByUser(req)
        .then(function (response) {
            Response.successfully(response, req, res);
        })
        .catch(function (response) {
            Response.failed(response, req, res);
        });
    }
});

router.get('/user/:id/vnc', Auth, async function(req, res) {
    if((req.user.role.permissions.find(i => i == "vserver")) || req.user.role.permissions.find(i => i == '*')) {
        AdminVServerService.getVNC(req)
        .then(function (response) {
            Response.successfully(response, req, res);
        })
        .catch(function (response) {
            Response.failed(response, req, res);
        });
    }
});


module.exports = router;