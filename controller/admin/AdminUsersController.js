require("dotenv").config();
var router = require('express').Router();
var { Response, AdminUsersService, Auth } = require('../../core');


router.put('/:id', Auth, async function(req, res) {
    if((req.user.role.permissions.find(i => i == "user")) || req.user.role.permissions.find(i => i == '*')) {
        UsersService.updateUser(req)
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
        UsersService.deleteUser(req)
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
        UsersService.getUser(req)
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
        UsersService.getUserBySupportID(req)
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
        UsersService.getUsers(req)
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