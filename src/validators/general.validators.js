import { isValidObjectId } from "mongoose";
import joi from "joi";

const objectIdValidator = (value, helpers) => {
    return isValidObjectId(value) ? value : helpers.message('Invalid ObjectID');
};

export const generalValidators = {
    _id: joi.custom(objectIdValidator),

     email: joi.string()
            .email(
            { tlds: { allow: ['com', 'org', 'net'] }})
            .required()
            .messages({
            'string.email': 'Email must be a valid email address example: example@gmail.com, example@outlook.com, example@domain.net'
            }),
    
            password: joi.string()
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
            .min(8)
            .required()
            .messages({
            'string.pattern.base': 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character from @$!%*?&',
            'string.min': 'Password must be at least 8 characters long',
            'any.required': 'Password is required'
            })
        };

// userId: joi.string().custom(objectIdValidator).required()
