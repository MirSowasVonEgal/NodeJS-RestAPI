var { mongoose } = require('../core');
const Schema = mongoose.Schema;

const schema = new Schema ({
        _id: { type: String, required: false },
        username: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, required: false },
        role: { type: String, required: true },
        provider: { type: String, required: true },
        address: { type: Object, required: true },
        settings: { type: Object, required: true },
});

module.exports = mongoose.model('User', schema)