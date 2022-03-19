const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hexagoUserScehma = new Schema({
    username: String,
    password: String,
    masterKey: String,
    UID: String
});

module.exports = mongoose.model('HexagonUser', hexagoUserScehma);