const redis = require('redis');

/**
 * Controller to manage the in-memory cache for the JWT blacklist.
 */
class RedisController {
    redisClient;
    isConnected = false;

    constructor() {
        this.redisClient = redis.createClient({ url: process.env.REDIS_URI });
        this.redisClient.on('ready', () => {
            this.isConnected = true;
            console.log('Redis Connected');
        });
        this.redisClient.on('error', (err) => {
            this.isConnected = false;
            console.log('Redis Client Error', err);
        });
        this.redisClient.on('end', () => {
            this.isConnected = false;
            console.log('Redis Disconnected');
        });
        this.redisClient.on('reconnecting', () => {
            this.isConnected = false;
            console.log('Redis Reconnecting');
        });
        this.redisClient.connect();
    }

    /**
     * Attempt to connect to redis one time and execute the callback.
     * @param {() => any} callback
     * @returns
     */
    async tryConnectOnce(callback) {
        if (!this.isConnected) await this.redisClient.connect();
        return callback();
    }

    /**
     * Attempt to get one value from Redis once
     * @param  {...any} args command args
     * @returns
     */
    async get(...args) {
        return this.tryConnectOnce(() => this.redisClient.get(...args));
    }

    /**
     * Attempt to set one value in Redis once
     * @param  {...any} args command args
     * @returns
     */
    async set(...args) {
        return this.tryConnectOnce(() => this.redisClient.set(...args));
    }
}

module.exports = RedisController;
