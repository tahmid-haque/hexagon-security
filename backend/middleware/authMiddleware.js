const jwt = require('jsonwebtoken');
const HexagonUser = require('../models/HexagonUser');

const requireAuth = (req, res, next) => {
    const token = req.headers.jwt;
    if (token) {
        jwt.verify(token, 'secret', (err, decodedToken) => {
            if (err) {
                return res.status(401).end('Invalid JWT');
            } else {
                const decodedToken = jwt.decode(token);
                req.token = decodedToken;
                next();
            }
        });
    } else {
        res.status(401).end('No JWT');
        next();
    }
};

const checkUser = (req, res, next) => {
    const token = req.headers.jwt;
    if (token) {
        jwt.verify(token, 'secret', async (err, decodedToken) => {
            if (err) {
                res.redirect('/login');
                res.locals.hexagonUser = null;
                next();
            } else {
                let hexagonUser = await HexagonUser.findById(decodedToken.id);
                res.locals.hexagonUser = hexagonUser;
                next();
            }
        });
    } else {
        res.locals.hexagonUser = null;
        next();
    }
};

module.exports = { requireAuth, checkUser };
