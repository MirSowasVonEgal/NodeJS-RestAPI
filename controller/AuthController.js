require("dotenv").config();
var { router, Response, AuthService, Auth } = require('../core');

router.get('/google/url', async function(req, res) {
    AuthService.getGoogleURL(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});

router.get('/google/callback', async function(req, res) {
    AuthService.getGoogleCallback(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});

router.post('/login', async function(req, res) {
    AuthService.loginUser(req)
    .then(function (response) {
        response.message = "You have successfully logged in";
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});

router.post('/register', async function(req, res) {
    AuthService.registerUser(req)
    .then(function (response) {
        response.message = "You have successfully registered";
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});


router.get('/resetpassword', async function(req, res) {
    AuthService.resetPassword(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});

router.get('/confirm/:token', async function(req, res) {
    AuthService.confirmUser(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        Response.failed(response, req, res);
    });
});

router.get('/profile', Auth, async function(req, res) {
    AuthService.getProfile(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        res.status(401);
        Response.failed(response, req, res);
    });
});

router.post('/profile', Auth, async function(req, res) {
    AuthService.setProfile(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        res.status(401);
        Response.failed(response, req, res);
    });
});

router.post('/profileinfo', Auth, async function(req, res) {
    AuthService.sendProfileInfo(req)
    .then(function (response) {
        Response.successfully(response, req, res);
    })
    .catch(function (response) {
        res.status(401);
        Response.failed(response, req, res);
    });
});

module.exports = router;