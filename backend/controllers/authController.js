const HexagonUser = require('../models/HexagonUser');
const jwt = require('jsonwebtoken');
const uuid = require('uuid')

//handle errors
const handleErrors = (err) =>{
    let errors = {username: '', password: ''};
    if(err.message === 'Incorrect username'){
        errors.username = 'That username is not registered'
    }
    if(err.message === 'Incorrect password'){
        errors.password = 'That password is incorrect'
    }
    if(err.code === 11000){
        errors.username = "Email is already registered";
        return errors;
    }

    if(err.message.includes('HexagonUser validation failed')){
        Object.values(err.errors).forEach( ({properties}) => {
            errors[properties.path] = properties.message;
        });
    }
    return errors;
}

const maxAge = 3*24*60*60;
const createToken = (UID) => {
    return jwt.sign({UID}, 'secret', {
        expiresIn: maxAge
    });
}

module.exports.signup_post = async (req, res) =>{
    const {username, password} = req.body;

    try{
        const hexagonUser = await HexagonUser.create({username: username, password: password, UID: uuid.v4(), masterKey: "test"});
        const token = createToken(hexagonUser.UID);
        res.status(201).json({UID: hexagonUser.UID, token: token});
    }
    catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({errors});
    }
};


module.exports.login_post = async (req, res) =>{
    const {username, password} = req.body;

    try {
        const hexagonUser = await HexagonUser.login(username, password);
        const token = createToken(hexagonUser.UID);
        res.status(200).json({UID: hexagonUser.UID, token: token});
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
};

module.exports.checkUser = async (req, res) =>{
    const {username} = req.body;
    HexagonUser.findOne({username}, (error, data) => {
        if (data) {
            res.json({exists: true});
        } else {
            res.json({exists: false});
        }
    });
};