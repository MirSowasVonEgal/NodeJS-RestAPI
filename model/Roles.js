var { mongoose } = require('../core');
const Schema = mongoose.Schema;

const schema = new Schema ({
        _id: { type: String, default: () => generateUUID() },
        name: { type: String, default: () => generateSupportID() },
        fullname: { type: String, required: true },
        color: { type: String, required: true},
        permissions: { type: Array, required: true},
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


module.exports = mongoose.model('Roles', schema);