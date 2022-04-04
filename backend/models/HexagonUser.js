const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const hexagoUserScehma = new Schema({
    username: {
        type: String,
        required: [true, 'Please enter a username'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
    },
    masterKey: {
        type: String,
        required: true,
    },
    uid: {
        type: String,
        required: true,
    },
});

hexagoUserScehma.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

hexagoUserScehma.statics.login = async function (username, password) {
    const hexagonUser = await this.findOne({ username: username });
    if (hexagonUser) {
        const auth = await bcrypt.compare(password, hexagonUser.password);
        if (auth) {
            return hexagonUser;
        }
        throw Error('Incorrect password');
    }
    throw Error('Incorrect username');
};

module.exports = mongoose.model('HexagonUser', hexagoUserScehma);
