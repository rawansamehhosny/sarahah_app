import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import envConfig from '../config/env.config.js';
import { UserRepository } from '../DB/Repositories/index.js';
import { tokenTypes } from '../Utils/constants.utils.js';
import { BlacklistToken, get } from '../services/redis.services.js';
const JWT_SECRET = envConfig.jwt.secret;

//to hendele the roles and return the right signature for each role
export const detectSignatureByRole = ({role}) => {
    if(role === "admin") {
        return envConfig.jwt.admin
    }
    return envConfig.jwt.user
};

//to define which token type we would return 
export const getSignatureByTypeAndRole = ({role, tokentypes, both = false}) => {
    const signature = detectSignatureByRole({role});
    if(both) {
        return signature;
    }
    let TokenSignature;
    let TokenExpiration;

    switch (tokentypes) {
        case tokenTypes.ACCESS:
            TokenSignature = signature.accessSecret;
            TokenExpiration = signature.accessExpiration;
            break;
    
        case tokenTypes.REFRESH:
            TokenSignature = signature.refreshSecret;
            TokenExpiration = signature.refreshExpiration;
            break;

        default:
            throw new Error('invalid token type', { cause: { status: 400 } });
    }
    return {TokenSignature, TokenExpiration};
}

//function to create both access and refresh tokens for a user after login, it uses the getSignatureByTypeAndRole function to get the right signature and expiration for each token based on the user's role
export const createLoginCredentials = ({payload}) => {
    const rolekeys = getSignatureByTypeAndRole ({role: payload.role, both: true})
    const accessJwtId = crypto.randomUUID();
    const refreshJwtId = crypto.randomUUID();

    const accessToken = generateToken ({
        payload: payload,
        secret: rolekeys.accessSecret,
        options: { expiresIn: rolekeys.accessExpiration, jwtid: accessJwtId } });
    const refreshToken = generateToken ({
        payload: payload,
        secret: rolekeys.refreshSecret,
        options: { expiresIn: rolekeys.refreshExpiration, jwtid: refreshJwtId }
    });
    return { accessToken, refreshToken };
}

export const decodedTokenRole = async ({token, tokenType}) => {
    const data = jwt.decode(token);
    const blacklistKey = `bl_${tokenType}_${data.jti}`;
    const isBlacklisted = await get(blacklistKey);
    if (isBlacklisted) {
        throw new Error("Token has been blacklisted");
    }
    if (!data || !data.userId) {
        console.log("Invalid token payload:", data);
        throw new Error("Invalid token payload")
    };
    return data;
};


export const generateToken = ({payload, secret, options}) => {
  return jwt.sign(payload, secret, options);
};

export const verifyToken = ({token, secret}) => {
  return jwt.verify(token, secret);
};


export const validateTokenAndGetUser = async ({token, tokenTypes}) => {
    const payload = await decodedTokenRole({token, tokenType: tokenTypes});
    const {TokenSignature} = getSignatureByTypeAndRole({
        role: payload.role,
        tokentypes: tokenTypes
    });
    const decoded = verifyToken({token, secret: TokenSignature});

    const user = await UserRepository.FindById(decoded.userId);
    if (!user) {
        const error = new Error('User no longer exists');
        error.cause = 404;
        throw error;
    }
    return {user, decoded};

};
