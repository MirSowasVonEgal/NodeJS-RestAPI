var { mongoose } = require('../core');
const Schema = mongoose.Schema;

const schema = new Schema ({
        _id: { type: String, default: () => generateUUID() },
        userid: { type: String, required: true },
        email: { type: String, required: true },
        title: { type: String, required: true },
        category: { type: String, required: true},
        status: { type: String, required: true, default: "Offen" },
        created: { type: Number, default: () => new Date().getTime() },
        priority: { type: Number, required: true},
        telegramid: { type: Number, required: true},
        closed: { type: Boolean, default: false },
        messages: { type: Object, required: true},
        lastupdate: { type: Number, default: () => new Date().getTime() },
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


module.exports = mongoose.model('Ticket', schema);