var { mongoose } = require('../core');
const Schema = mongoose.Schema;

const schema = new Schema ({
        collectionname: { type: String },
        method: { type: String },
        query: { type: String },
        doc: { type: String },
});


module.exports = mongoose.model('GlobalLogs', schema);