const jwt = require('jsonwebtoken');
const HexagonUser = require('../models/HexagonUser');

const requireAuth = (req, res, next) => {
    const token = req.headers.jwt;
    if(token){
        jwt.verify(token, 'secret',(err,decodedToken) =>{
            if(err) {
                //redirect?
                console.log("fail");
                next();
            }
            else{
                console.log("success");
                const decodedToken = jwt.decode(token);
                req.token = decodedToken;
                next();
            }
        });
    } else {
        console.log("fail");
        //res.redirect('/login');
        next();
    }
}


const checkUser = (req, res, next) =>{
    const token = req.headers.jwt;
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
