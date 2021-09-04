require("dotenv").config();
var router = require('express').Router();
var { Response, AdminRolesService, Auth } = require('../../core');

router.post('', Auth, async function(req, res) {
    if((req.user.role.permissions.find(i => i == "role")) || req.user.role.permissions.find(i => i == '*')) {
        AdminRolesService.createRole(req)
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

router.put('/:id', Auth, async function(req, res) {
    if((req.user.role.permissions.find(i => i == "role")) || req.user.role.permissions.find(i => i == '*')) {
        AdminRolesService.updateRole(req)
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
    if((req.user.role.permissions.find(i => i == "role")) || req.user.role.permissions.find(i => i == '*')) {
        AdminRolesService.deleteRole(req)
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
    if((req.user.role.permissions.find(i => i == "role")) || req.user.role.permissions.find(i => i == '*')) {
        AdminRolesService.getRole(req)
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
    if((req.user.role.permissions.find(i => i == "role")) || req.user.role.permissions.find(i => i == '*')) {
        AdminRolesService.getRoles(req)
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