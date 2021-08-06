var { router, Response, UsersService } = require('../core');

router.get('/', async function(req, res) {
    UsersService.getUsers(req)
    .then(function (response) {
        Response.successfully(response, res);
    })
    .catch(function (response) {
        Response.failed(response, res);
    });
});

router.get('/:userid', async function(req, res) {
    UsersService.getUser(req)
    .then(function (response) {
        Response.successfully(response, res);
    })
    .catch(function (response) {
        Response.failed(response, res);
    });
});

module.exports = router;