require("dotenv").config();
const mongoose = require('mongoose');
mongoose.connect(`mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DATABASE}`, {useNewUrlParser: true, useUnifiedTopology: true});

exports.getTest = function(req) {
    return new Promise(function(resolve, reject) {
        const Cat = mongoose.model('Cat', { _id: Number, name: String, settings: Object });

        const kitty = new Cat({ _id: '', name: "Test", settings: { language: 'de' }});
        kitty.save().then(() => console.log('meow'));
        resolve("finish");
    });
}