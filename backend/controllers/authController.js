const HexagonUser = require('../models/HexagonUser');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');

//handle errors
const handleErrors = (err) => {
    let errors = { username: '', password: '' };
    let status = 400;
    if (err.message === 'Incorrect username') {
        errors.username = 'That username is not registered';
    }
    if (err.message === 'Incorrect password') {
        errors.password = 'That password is incorrect';
        status = 401;
    }
    if (err.code === 11000) {
        errors.username = 'Email is already registered';
        return errors;
    }

    if (err.message.includes('HexagonUser validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }
    return { errors, status };
};

const maxAge = 3 * 24 * 60 * 60;
const createToken = (UID, username) => {
    return jwt.sign({ UID: UID, username: username }, 'secret', {
        expiresIn: maxAge,
    });
};

module.exports.signup_post = async (req, res) => {
    const { username, password } = req.body;

    try {
        const hexagonUser = await HexagonUser.create({
            username: username,
            password: password,
            UID: uuid.v4(),
            masterKey: uuid.v4(),
        });
        const token = createToken(hexagonUser.UID, hexagonUser.username);
        res.status(201).json({ masterKey: hexagonUser.masterKey, jwt: token });
    } catch (err) {
        const { errors, status } = handleErrors(err);
        res.status(status).json({ errors });
    }
};

module.exports.login_post = async (req, res) => {
    const { username, password } = req.body;

    try {
        const hexagonUser = await HexagonUser.login(username, password);
        const token = createToken(hexagonUser.UID, hexagonUser.username);
        res.status(200).json({ masterKey: hexagonUser.masterKey, jwt: token });
    } catch (err) {
        const { errors, status } = handleErrors(err);
        res.status(status).json({ errors });
    }
};

module.exports.checkUser = async (req, res) => {
    const { username } = req.body;
    HexagonUser.findOne({ username }, (error, data) => {
        if (data) {
            res.json({ exists: true });
        } else {
            res.json({ exists: false });
        }
    });
};
