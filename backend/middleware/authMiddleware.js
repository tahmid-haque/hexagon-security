const jwt = require('jsonwebtoken');
const redis = require('redis');
const JWT_SECRET = process.env.JWT_TOKEN ?? 'secret';
const RedisController = require('../controllers/redisController');
const redisController = new RedisController();

const requireAuth = (req, res, next) => {
    const token = req.headers.jwt;
    if (token) {
        jwt.verify(token, JWT_SECRET, async (err, decodedToken) => {
            if (err) {
                console.log(14, err);
                return res.status(401).end('Invalid JWT');
            } else {
                let isRetired = 'true';
                try {
                    console.log('key:', token);
                    console.log('value:', await redisController.get(token));
                    isRetired = Boolean(await redisController.get(token));
                } catch (error) {
                    console.log(22, error);
                }
                if (isRetired) return res.status(401).end('Invalid JWT');
                req.token = decodedToken;
                req.originalToken = token;
                next();
            }
        });
    } else {
        return res.status(401).end('No JWT');
    }
};

const maxAge = 24 * 60 * 60; // 1 day
const createToken = (uid, username) => {
    return jwt.sign(
        { uid, username, exp: Math.floor(Date.now() / 1000) + maxAge },
        JWT_SECRET
    );
};

const retireToken = async (req, res, next) => {
    await redisController.set(req.originalToken, 1, {
        EX: Number(req.token.exp) - Math.floor(Date.now() / 1000),
    });
    res.status(200).json({ success: true });
};

module.exports = { requireAuth, retireToken, createToken };
