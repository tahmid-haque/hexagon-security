const jwt = require('jsonwebtoken');
const redis = require('redis');
const JWT_SECRET = process.env.JWT_TOKEN ?? 'secret';
const RedisController = require('../controllers/redisController');
const redisController = new RedisController();

/**
 * Checks if authentication is needed by using the token to verify
 * @param {any} res the response
 * @param {any} req the request
 * @param {any} next the next functionto perform
 * @returns {any} response with status code
 */
const requireAuth = (req, res, next) => {
    const token = req.headers.jwt;
    if (token) {
        jwt.verify(token, JWT_SECRET, async (err, decodedToken) => {
            if (err) {
                return res.status(401).end('Invalid JWT');
            } else {
                let isRetired = 'true';
                try {
                    isRetired = Boolean(await redisController.get(token));
                } catch (error) {}
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

/**
 * Creates a personalized jwt token using uid and username
 * @param {any} uid the uid
 * @param {any} username the username
 * @returns {any} jwt token
 */
const maxAge = 24 * 60 * 60; // 1 day
const createToken = (uid, username) => {
    return jwt.sign(
        { uid, username, exp: Math.floor(Date.now() / 1000) + maxAge },
        JWT_SECRET
    );
};
/**
 * Retires the token
 * @param {any} req the request
 * @param {any} res the response
 * @param {any} next the next functionto perform
 * @returns {any} response with status code
 */
const retireToken = async (req, res, next) => {
    await redisController.set(req.originalToken, 1, {
        EX: Number(req.token.exp) - Math.floor(Date.now() / 1000),
    });
    res.status(200).json({ success: true });
};

module.exports = { requireAuth, retireToken, createToken };
