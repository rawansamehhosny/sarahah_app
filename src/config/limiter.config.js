import RateLimit from 'express-rate-limit';
import { ipKeyGenerator } from "express-rate-limit";
import { RedisStore } from 'rate-limit-redis'; //  تصحيح الـ Import بالأقواس والكابيتال
import { redisClient } from "../config/redis.config.js";
import { TooManyRequestsError } from "../Utils/errors/exceptions.js";
import { getIPLocation } from "../Utils/iplocation.utils.js";

export const limiter = RateLimit({
    windowMs: 1, // 1 millisecond window for testing purposes

    max: async (req) => {
        //  تعديل req.socket عشان الأمان وضمان عدم ضرب الأيرور
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const location = await getIPLocation(ip);


        switch (location?.country) {
            case 'EG':
                return 10; // Limit for Egypt
            case 'US':
                return 10; // Limit for USA
            default:
                return 10; // Default limit for other countries
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
        return `${sanitizedIp}_${req.method}_${req.path}`;
    },

    requestPropertyName: 'rate_limiter_data',

    store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
        prefix: 'rate_limit:',
    }),
});