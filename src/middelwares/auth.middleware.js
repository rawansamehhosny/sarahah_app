import jwt from 'jsonwebtoken';
import envConfig from '../config/env.config.js';
import { verifyToken, decodeToken } from './tokens.js';
import { UserRepository } from '../DB/Repositories/index.js';
const JWT_SECRET = envConfig.jwt.secret;


export const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        const error = new Error('No token provided');
        error.cause = 401;
        return next(error);
    }

    const token = authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : authHeader;
    try {
        const user = await decodeToken({ token, secret: JWT_SECRET });
        if (!user) {
            throw new Error("User no longer exists");
        }
        req.user = user;
        next();

    } catch (error) {
        error.cause = 401;
        error.message = error.name === 'TokenExpiredError'
            ? "Token expired, please login again"
            : "Invalid token";
        next(error);
    }
};

export const roleMiddleware = (requiredRoles) => {
    return (req,res,next) => {
        const userRole = req.user.role;
        if(!requiredRoles?.includes(userRole)) {
            const error = new Error("Forbidden: Insufficient permissions");
            error.cause = 403;
            return next(error);
        }
        next();
    }
}