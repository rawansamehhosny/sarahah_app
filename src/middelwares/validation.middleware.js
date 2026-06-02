import Joi from "joi";
import {BadRequestError} from "../utils/errors/exceptions.js";
import { registerSchema } from "../validators/auth.validators.js";

const validationMiddleware = (schema) => {
    return (req, res, next) => {
        const ErrorMessages = [];
        for (const key in schema) {
            const { error } = schema[key].validate(req[key], { abortEarly: false });
            if (error){
                const messages = error.details.map(detail => detail.message);
                ErrorMessages.push(...messages);
            }
        }
        if (ErrorMessages.length > 0) {
            return next(new BadRequestError("Validation failed: " + ErrorMessages.join(", ") ));
        }
        next();
    }
     }
export default validationMiddleware;