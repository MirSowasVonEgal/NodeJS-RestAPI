var router = require('express').Router();
var TestService = require('../service/TestService');

router.get('/hello/:msg', async function(req, res) {
    TestService.getTest(req)
    .then(function (response) {
        res.status(200);
        res.json({ error: false, response});
    })
    .catch(function (message) {
        res.status(500);
        res.json({ error: true, message});
    });
});

module.exports = router;