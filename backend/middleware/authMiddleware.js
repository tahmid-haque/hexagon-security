const jwt = require('jsonwebtoken');
const HexagonUser = require('../models/HexagonUser');

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;
    if(token){
        jwt.verify(token, 'secret',(err,decodedToken) =>{
            if(err) res.redirect('/login');
            else{
                next();
            }
        });
    } else {
        res.redirect('/login');
    }
}


const checkUser = (req, res, next) =>{
    const token = req.cookies.jwt;
    if (token){
        jwt.verify(token, 'secret', async (err,decodedToken) =>{
            if(err){
                res.redirect('/login');
                res.locals.hexagonUser =  null;
                next();
            }
            else{
                let hexagonUser = await HexagonUser.findById(decodedToken.id);
                res.locals.hexagonUser = hexagonUser;
                next();
            }
        });
    } else {
        res.locals.hexagonUser = null;
        next();
    }
}

module.exports = {requireAuth, checkUser};
