var { mongoose } = require('../core');
const Schema = mongoose.Schema;
require('mongoose-double')(mongoose);

const schema = new Schema ({
        _id: { type: String, default: () => generateUUID() },
        serverid: { type: Number, required: true },
        userid: { type: String, required: true },
        password: { type: String, required: true },
        os: { type: String },
        memory: { type: Number },
        cores: { type: Number },
        disk: { type: Number },
        node: { type: String },
        upid: { type: String },
        blocked: { type: Boolean },
        status: { type: String },
        product: { type: Object },
        traffic: { type: Number, default: 0 },
        maxbackups: { type: Number, default: 3 },
        backupcount: { type: Number, default: 0 },
        created: { type: String, default: () => new Date().getTime()  },
        price: { type: Schema.Types.Double },
        paidup: { type: Number },
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


module.exports = mongoose.model('VServer', schema);