import { TooManyRequestsError } from "../Utils/errors/exceptions.js";
import RateLimit from 'express-rate-limit';

export const limiter = RateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3,// limit each IP to 3 requests per windowMs
    handler: (req, res, next) => {
        throw new TooManyRequestsError("Too many requests");
    },
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    standardHeaders: true, // Enable the `RateLimit-*` headers
    skipSuccessfulRequests: false, // Count successful requests towards the rate limit
});