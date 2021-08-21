var { mongoose } = require('../core');
const Schema = mongoose.Schema;

const schema = new Schema ({
        _id: { type: String, required: true },
        user: { type: Object, required: true },
        settings: { type: Object, required: true },
});

module.exports = mongoose.model('User', schema)