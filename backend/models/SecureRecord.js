const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SecureRecordSchema = new Schema({
    name: String,
    key: String,
    recordID: String,
    UID: String,
    type: String
});

module.exports = mongoose.model('SecureRecord', SecureRecordSchema);