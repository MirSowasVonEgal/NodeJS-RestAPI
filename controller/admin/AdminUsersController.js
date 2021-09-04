require("dotenv").config();
var router = require('express').Router();
var { Response, AdminUsersService, Auth } = require('../../core');


router.put('/:id', Auth, async function(req, res) {
    if((req.user.role.permissions.find(i => i == "user")) || req.user.role.permissions.find(i => i == '*')) {
        AdminUsersService.updateUser(req)
        .then(function (response) {
            Response.successfully(response, req, res);
        })
        .catch(function (response) {
            Response.failed(response, req, res);
        });
    } else {
        Response.failed({ message: "Dafür hast du keine Rechte!" }, req, res);
    }
});

router.delete('/:id', Auth, async function(req, res) {
    if((req.user.role.permissions.find(i => i == "user")) || req.user.role.permissions.find(i => i == '*')) {
        AdminUsersService.deleteUser(req)
        .then(function (response) {
            Response.successfully(response, req, res);
        })
        .catch(function (response) {
            Response.failed(response, req, res);
        });
    } else {
        Response.failed({ message: "Dafür hast du keine Rechte!" }, req, res);
    }
});

router.get('/:id', Auth, async function(req, res) {
    if((req.user.role.permissions.find(i => i == "user")) || req.user.role.permissions.find(i => i == '*')) {
        AdminUsersService.getUser(req)
        .then(function (response) {
            Response.successfully(response, req, res);
        })
        .catch(function (response) {
            Response.failed(response, req, res);
        });
    } else {
        Response.failed({ message: "Dafür hast du keine Rechte!" }, req, res);
    }
});

router.get('/supportid/:id', Auth, async function(req, res) {
    if((req.user.role.permissions.find(i => i == "user")) || req.user.role.permissions.find(i => i == '*')) {
        AdminUsersService.getUserBySupportID(req)
        .then(function (response) {
            Response.successfully(response, req, res);
        })
        .catch(function (response) {
            Response.failed(response, req, res);
        });
    } else {
        Response.failed({ message: "Dafür hast du keine Rechte!" }, req, res);
    }
});

router.get('/', Auth, async function(req, res) {
    if((req.user.role.permissions.find(i => i == "user")) || req.user.role.permissions.find(i => i == '*')) {
        AdminUsersService.getUsers(req)
        .then(function (response) {
            Response.successfully(response, req, res);
        })
        .catch(function (response) {
            Response.failed(response, req, res);
        });
    } else {
        Response.failed({ message: "Dafür hast du keine Rechte!" }, req, res);
    }
});

module.exports = router;