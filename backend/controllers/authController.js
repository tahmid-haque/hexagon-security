const HexagonUser = require('../models/HexagonUser');
const jwt = require('jsonwebtoken');
import {v4 as uuid} from 'uuid';

//handle errors
const handleErrors = (err) =>{
    let errors = {username: '', password: ''};

    if(err.message === 'incorrect username'){
        errors.username = 'That username is not registered'
    }
    if(err.message === 'incorrect password'){
        errors.password = 'That password is incorrect'
    }
    if(err.code === 11000){
        errors.email = "Email is already registered";
        return errors;
    }

    if(err.message.includes('user validation failed')){
        Object.values(err.errors).forEach( ({properties}) => {
            errors[properties.path] = properties.message;
        });
    }
    return errors;
}

const maxAge = 3*24*60*60;
const createToken = (id) => {
    return jwt.sign({id}, 'secret', {
        expiresIn: maxAge
    });
}

module.exports.signup_get = (req, res) =>{
    res.render('signup');
};
module.exports.login_get = (req, res) =>{
    res.render('login');
};
module.exports.signup_post = async (req, res) =>{
    const {username, password} = req.body;

    try{
        // let hexagonUser = new HexagonUser({
        //     username: username,
        //     password: password,
        //     UID: username,
        //     masterKey: "test"
        // });
        // hexagonUser.save();
        const hexagonUser = await new HexagonUser.create({username: username, password: password, UID: uuid(), masterKey: "test"});
        const token = createToken(hexagonUser.UID);
        res.cookie('jwt',token, {httpOnly: true, maxAge: maxAge*1000});
        res.status(201).json(hexagonUser.UID);
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
        res.status(200).json(hexagonUser.UID);
    } catch (error) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
};

module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', {maxAge: 1});
    res.redirect('/');
}