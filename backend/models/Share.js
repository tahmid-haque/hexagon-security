const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ShareSchema = new Schema({
    secureRecordID: {
        type: String,
        required: true
    },
    reciever: {
        type: String,
        required: true
    },
    key: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Share', ShareSchema);