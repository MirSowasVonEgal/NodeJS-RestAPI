var router = require('express').Router();
var AuthService = require('../service/AuthService');

router.post('/login', function(req, res) {
    AuthService.loginUser(req)
    .then(function (response) {
        res.json({ error: false, response});
    })
    .catch(function (response) {
        res.json({ error: true, response});
    });
});

router.post('/register', function(req, res) {
    AuthService.registerUser(req)
    .then(function (response) {
        res.json({ error: false, response});
    })
    .catch(function (response) {
        res.json({ error: true, response});
    });
});

router.get('/profile', function(req, res) {
    AuthService.getProfile(req)
    .then(function (response) {
        res.json({ error: false, response});
    })
    .catch(function (response) {
        res.json({ error: true, response});
    });
});

module.exports = router;