var { router, Response, UsersService } = require('../core');

router.get('/', function(req, res) {
    UsersService.getUsers(req)
    .then(function (response) {
        Response.successfully(response, res);
    })
    .catch(function (response) {
        Response.failed(response, res);
    });
});

router.get('/:userid', function(req, res) {
    UsersService.getUser(req)
    .then(function (response) {
        Response.successfully(response, res);
    })
    .catch(function (response) {
        Response.failed(response, res);
    });
});

module.exports = router;