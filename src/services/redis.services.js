import { redisClient } from '../config/redis.config.js';

export const set = async (Key , value , options) => {
    return await redisClient.set(Key , value , options);
};

export const get = async (key) => {
    return await redisClient.get(key);
};

export const del = async (key) => {
    return await redisClient.del(key);
};


export const exists = async (key) => {
    return await redisClient.exists(key);
};

export const incr = async (key) => {
    return await redisClient.incr(key);
};
export const decr = async (key) => {
    return await redisClient.decr(key);
};
export const expire = async (key , seconds) => {
    return await redisClient.expire(key , seconds);
};

export const ttl = async (key) => {
    return await redisClient.ttl(key);
};

export const flushAll = async () => {
    return await redisClient.flushAll();
};

export const keys = async (pattern) => {
    return await redisClient.keys(pattern);
};  

export const hset = async (key , field , value) => {
    return await redisClient.hset(key , field , value);
};

export const hget = async (key , field) => {
    return await redisClient.hget(key , field);
};

export const hdel = async (key , field) => {
    return await redisClient.hdel(key , field);
};

export const hgetall = async (key) => {
    return await redisClient.hgetall(key);
};  

export const hkeys = async (key) => {
    return await redisClient.hkeys(key);
};

export const hvals = async (key) => {
    return await redisClient.hvals(key);
};