const CryptoService = require('hexagon-shared/services/CryptoService');
const HexagonUser = require('../models/HexagonUser');
const uuid = require('uuid');
const crypto = require('crypto').webcrypto;
const cryptoService = new CryptoService(crypto);
const { createToken } = require('../middleware/authMiddleware');

/**
 * Return the provided error after converting it to the app format
 * @param {any} err the error
 * @returns
 */
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

/**
 * Sign up a new user given their username and password.
 * @param {*} req express request object
 * @param {*} res express response object
 */
module.exports.signup_post = async (req, res) => {
    const { username, password } = req.body;

    try {
        const masterKey = cryptoService.generatePlainSecret();
        const uid = uuid.v4();
        const [encryptedMasterKey, encryptedUid] =
            await cryptoService.encryptSecrets([masterKey, uid], password);
        await HexagonUser.create({
            username: username,
            password: password,
            uid: encryptedUid,
            masterKey: encryptedMasterKey,
        });
        const token = createToken(uid, username);
        res.status(201).json({ masterKey, jwt: token });
    } catch (err) {
        const { errors, status } = handleErrors(err);
        res.status(status).json({ errors });
    }
};

module.exports.login_post = async (req, res) => {
    const { username, password } = req.body;

    try {
        const hexagonUser = await HexagonUser.login(username, password);
        const [masterKey, uid] = await cryptoService.decryptSecrets(
            [hexagonUser.masterKey, hexagonUser.uid],
            password
        );
        const token = createToken(uid, hexagonUser.username);
        res.status(200).json({ masterKey, jwt: token });
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
