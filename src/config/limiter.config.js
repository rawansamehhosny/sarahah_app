import RateLimit from 'express-rate-limit';
import { ipKeyGenerator } from "express-rate-limit";
import { RedisStore } from 'rate-limit-redis'; //  تصحيح الـ Import بالأقواس والكابيتال
import { redisClient } from "../config/redis.config.js";
import { TooManyRequestsError } from "../Utils/errors/exceptions.js";
import { getIPLocation } from "../Utils/iplocation.utils.js";

export const limiter = RateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes

    max: async (req) => {
        //  تعديل req.socket عشان الأمان وضمان عدم ضرب الأيرور
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const location = await getIPLocation(ip);

        console.log(`Rate limit check for IP: ${ip}, Location: ${location?.country}, ${location?.city}`);

        switch (location?.country) {
            case 'EG':
                return 3; // Limit for Egypt
            case 'US':
                return 5; // Limit for USA
            default:
                return 3; // Default limit for other countries
        }
    },

    handler: (req, res, next) => {
        throw new TooManyRequestsError("Too many requests");
    },

    legacyHeaders: false,
    standardHeaders: true,
    skipSuccessfulRequests: false,

    keyGenerator: (req, res) => {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const sanitizedIp = ipKeyGenerator(ip);
        console.log(`Rate limit key generated for IPppp: ${sanitizedIp}, Method: ${req.method}, Path: ${req.path}`);
        return `${sanitizedIp}_${req.method}_${req.path}`;
    },

    requestPropertyName: 'rate_limiter_data',

    store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
        prefix: 'rate_limit:',
    }),
});