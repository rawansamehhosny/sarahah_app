import { tokenTypes } from '../Utils/constants.utils.js';
import { validateTokenAndGetUser } from './tokens.js'



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
        const { user, decoded } = await validateTokenAndGetUser({token, tokenTypes: tokenTypes.ACCESS});
        const userObj = user.toObject();
        userObj._id = userObj._id.toString();

        req.user = userObj;
        req.accessToken = decoded;
        next();

    } catch (error) {
        error.cause = 401;
        error.message = error.name === 'TokenExpiredError'
            ? "Token expired, please login again"
            : error.message || "Invalid token";
        next(error);
    }}

export const roleMiddleware = (requiredRoles) => {
    return (req,res,next) => {
        const userRole = req.user?.role;
            if(!requiredRoles?.includes(userRole)) {
            const error = new Error("Forbidden: Insufficient permissions");
            error.cause = 403;
            return next(error);
        }
        next();
    }
}