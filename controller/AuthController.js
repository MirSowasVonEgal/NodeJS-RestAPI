require("dotenv").config();
var { router, Response, AuthService, UsersService } = require('../core');

router.post('/login', function(req, res) {
    AuthService.loginUser(req)
    .then(function (response) {
        response.message = "You have successfully logged in";
        Response.successfully(response, res);
    })
    .catch(function (response) {
        Response.failed(response, res);
    });
});

router.post('/register', function(req, res) {
    AuthService.registerUser(req)
    .then(function (response) {
        response.message = "You have successfully registered";
        Response.successfully(response, res);
    })
    .catch(function (response) {
        Response.failed(response, res);
    });
});

router.get('/profile', function(req, res) {
    AuthService.getProfile(req)
    .then(function (response) {
        req.params.userid = response.id;
        UsersService.getUser(req)
        .then(function (response) {
            Response.successfully(response, res);
        })
        .catch(function (response) {
            Response.failed(response, res);
        });
    })
    .catch(function (response) {
        res.status(401);
        Response.failed(response, res);
    });
});

module.exports = router;