import joi from 'joi';
import { gender } from '../Utils/index.js';

export const registerSchema = {
    body: joi.object({
        firstName: joi.string().min(3).max(50).required(),
        lastName: joi.string().min(3).max(50).required(), 
        email: joi.string().email().required(),
        password: joi.string().min(6).required(),
        phone: joi.string().optional(),
        gender: joi.string().valid(...Object.values(gender)).optional(),
        avatar: joi.string().optional()
    })
};
export const loginSchema = {
    body: joi.object({
        email: joi.string().email().required(), // لازم يكتب إيميل حقيقي
        password: joi.string().required()        // لازم يكتب الباسورد
    })
};

// جوه ملف src/validators/auth.validators.js

export const googleAuthSchema = {
    body: joi.object({
        idToken: joi.string().required()
    })
};

