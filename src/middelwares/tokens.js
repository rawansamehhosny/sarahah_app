import jwt from 'jsonwebtoken';
import envConfig from '../config/env.config.js';
import { UserRepository } from '../DB/Repositories/index.js';
const JWT_SECRET = envConfig.jwt.secret;

export const generateToken = ({payload, secret, options}) => {
  return jwt.sign(payload, secret, options);
};

export const verifyToken = ({token, secret}) => {
  return jwt.verify(token, secret);
};

export const loginCredentialsCreator = ({payload, secret, options}) => {
    const token = generateToken({
        payload,
        secret: secret || JWT_SECRET,
        options
    });
    return token;
}

export const decodeToken = async ({token, secret}) => {
    const decoded = verifyToken({token, secret});

    if(!decoded || !decoded.userId) {
        throw new Error("Invalid token payload")
    }

    return UserRepository.FindById(decoded.userId)
};




