const translate = require('@vitalets/google-translate-api');

exports.successfully = function(response, req, res) {
    if(res.statusCode == -1) res.status(200);
    
    if(!response) var response = {};
    if(response.message) {
        var language = "de"
        if(req.user) {
            if(req.user.settings) {
                if(req.user.settings.language) {
                    language = req.user.settings.language;
                }
            }
        }/*
        translate(response.message, {to: language}).then(translated => {
            response.message = translated.text + ".";
            res.json({ error: false, response});
        }).catch(err => {
            res.json({ error: false, response});
        });*/
        response.message += ".";
        res.json({ error: false, response});
    } else {
        res.json({ error: false, response});
    }
}

exports.failed = function(response, req, res) {
    if(res.statusCode == -1) res.status(400);

    if(!response) var response = {};
    if(!response.message) response.message = "An unknown error occurred";
    var language = "de"
    if(req.user) {
        if(req.user.settings) {
            if(req.user.settings.language) {
                language = req.user.settings.language;
            }
        }
    }
    /*translate(response.message, {to: language}).then(translated => {
        response.message = translated.text + "!";
        res.json({ error: true, response});
    }).catch(err => {
        res.json({ error: true, response});
    });*/
    response.message += "!";
    res.json({ error: true, response});
}