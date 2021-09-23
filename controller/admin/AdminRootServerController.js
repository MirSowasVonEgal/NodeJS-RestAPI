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
        AdminRootServerService.getRootServers(req)
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
        AdminRootServerService.getRootServer(req)
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
        AdminRootServerService.startRootServer(req)
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
        AdminRootServerService.stopRootServer(req)
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
        AdminRootServerService.rebootRootServer(req)
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
        AdminRootServerService.shutdownRootServer(req)
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
        AdminRootServerService.getRootServersByUser(req)
        .then(function (response) {
            Response.successfully(response, req, res);
        })
        .catch(function (response) {
            Response.failed(response, req, res);
        });
    }
});

router.get('/:id/vnc', Auth, async function(req, res) {
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

router.post('/:id/extend', Auth, async function(req, res) {
    if((req.user.role.permissions.find(i => i == "rootserver")) || req.user.role.permissions.find(i => i == '*')) {
        AdminRootServerService.extendRootServer(req)
        .then(function (response) {
            Response.successfully(response, req, res);
        })
        .catch(function (response) {
            Response.failed(response, req, res);
        });
    }
});


module.exports = router;