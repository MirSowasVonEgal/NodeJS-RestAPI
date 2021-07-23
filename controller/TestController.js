var router = require('express').Router();
var TestService = require('../service/TestService');

router.get('/hello/:msg', function(req, res) {
    TestService.getTest(req)
    .then(function (response) {
        res.json({ error: false, response});
    })
    .catch(function (message) {
        res.json({ error: true, message});
    });
});

module.exports = router;