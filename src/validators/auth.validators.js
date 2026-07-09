import joi from 'joi';
import { gender } from '../Utils/index.js';
import { generalValidators } from './general.validators.js';


export const registerSchema = {
    body: joi.object({
        firstName: joi.string().alphanum().min(3).max(50).required(),

        lastName: joi.string().alphanum().min(3).max(50).required(), 
       
        email: generalValidators.email,

        password: generalValidators.password,

        confirmPassword: joi.string()
            .valid(joi.ref('password'))
            .messages({ 'any.only': 'Passwords do not match!' }),

        phone: joi.string().min(11).max(12).optional(),

        gender: joi.string().valid(...Object.values(gender)).optional(),

        avatar: joi.string().optional()
    })
};
export const loginSchema = {
    body: joi.object({
        email: generalValidators.email,
        password: generalValidators.password
    })
};


export const googleAuthSchema = {
    body: joi.object({
        idToken: joi.string().required()
    })
};

export const verifyOtpSchema = {
    body: joi.object({
        otp: joi.string().pattern(/^\d{6}$/).required()
    })
};

