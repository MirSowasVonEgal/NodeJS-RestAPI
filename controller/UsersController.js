var router = require('express').Router();
var UsersService = require('../service/UsersService');

router.get('/', function(req, res) {
    UsersService.getUsers(req)
    .then(function (response) {
        res.json({ error: false, response});
    })
    .catch(function (response) {
        res.json({ error: true, response});
    });
});

router.get('/:userid', function(req, res) {
    UsersService.getUser(req)
    .then(function (response) {
        res.json({ error: false, response});
    })
    .catch(function (response) {
        res.json({ error: true, response});
    });
});

module.exports = router;