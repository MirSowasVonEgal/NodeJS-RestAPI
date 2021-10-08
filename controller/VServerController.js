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

router.post('/:id/extend', Auth, async function(req, res) {
    VServerService.extendVServer(req)
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

router.post('/:id/backup', Auth, async function(req, res) {
    VServerService.createBackup(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});

router.get('/:id/backup', Auth, async function(req, res) {
    VServerService.getBackups(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});

router.put('/:id/backup/:volid1/:volid2', Auth, async function(req, res) {
    VServerService.restoreBackup(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});


router.delete('/:id/backup/:volid1/:volid2', Auth, async function(req, res) {
    VServerService.deleteBackup(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});

router.put('/:id/resetpassword', Auth, async function(req, res) {
    VServerService.resetPassword(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});

module.exports = router;