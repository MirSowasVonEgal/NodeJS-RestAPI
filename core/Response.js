const translate = require('@vitalets/google-translate-api');

exports.successfully = function(response, res) {
    if(res.statusCode == -1) res.status(200);
    if(response.message) {
        translate(response.message, {to: 'de'}).then(translated => {
            response.message = translated.text + ".";
            res.json({ error: false, response});
        }).catch(err => {
            res.json({ error: false, response});
        });
    } else {
        res.json({ error: false, response});
    }
}

exports.failed = function(response, res) {
    if(res.statusCode == -1) res.status(400);
    if(!response.message) response.message = "An unknown error occurred";
    translate(response.message, {to: 'de'}).then(translated => {
        response.message = translated.text + "!";
        res.json({ error: true, response});
    }).catch(err => {
        res.json({ error: true, response});
    });
}