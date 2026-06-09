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



export const expire = async (key , seconds) => {
    return await redisClient.expire(key , seconds);
};

export const ttl = async (key) => {
    return await redisClient.ttl(key);
};