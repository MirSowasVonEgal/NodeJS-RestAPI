var { mongoose } = require('../core');
const Schema = mongoose.Schema;
require('mongoose-double')(mongoose);

const schema = new Schema ({
        _id: { type: String, default: () => generateUUID() },
        user: { type: Object, required: true },
        userid: { type: String, required: true },
        serviceid: { type: String, required: true },
        product: { type: String , default: 'Guthaben' },
        method: { type: String },
        created: { type: String, default: () => new Date().getTime()  },
        amount: { type: Schema.Types.Double },
        status: { type: String },
        data: { type: String },
});

function generateUUID(){
        var dt = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (dt + Math.random()*16)%16 | 0;
            dt = Math.floor(dt/16);
            return (c=='x' ? r :(r&0x3|0x8)).toString(16);
        });
        return uuid;
}


module.exports = mongoose.model('Invoice', schema);