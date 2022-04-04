const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ShareSchema = new Schema({
    type: {
        type: String,
        required: true,
    },
    name: {
        type: String,
    },
    recordId: {
        type: String,
        required: true,
    },
    receiver: {
        type: String,
        required: true,
    },
    key: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('Share', ShareSchema);
