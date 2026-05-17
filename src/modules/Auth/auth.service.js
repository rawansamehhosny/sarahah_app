import User from "../../DB/models/user.model.js";
import { comparePassword, hashPassword } from "../../Utils/crypto.util.js";
import { encryptData } from "../../Utils/crypto.util.js";
import {UserRepository } from "../../DB/Repositories/index.js";
import jwt from "jsonwebtoken";
import envConfig from "../../config/env.config.js";
import { generateToken, loginCredentialsCreator } from "../../middelwares/index.js";
const JWT_SECRET = envConfig.jwt.secret;
const JWT_ACCESS_EXPIRATION = envConfig.jwt.accessExpiration;

export const signUpService = async (data) => {
    const { firstName, lastName, email, password, gender, phone } = data;

    //(Check Duplication)
    const isEmailExist = await UserRepository.FindOneDoc({ email });
    if (isEmailExist) {
        // بنرمي Error محترم يروح للـ Global Handler
        const error = new Error("Email already exists");
        error.cause = 409; // Conflict
        throw error;
    }

    // New User Creation
    const hashedPassword = await hashPassword(password);
    const newUser = await UserRepository.Createdoc({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        gender,
        phone: null // Initialize phone as null, will update if provided wee encrypt it
    });
    if(phone) {
        newUser.phone = encryptData(phone);
        await newUser.save();
    }

    return newUser;
};

export const loginService = async (data) => {
    const {email, password} = data;
    // Check if user exists
    const userFound = await UserRepository.FindOneDoc({ email });
    if (!userFound) {
        const error = new Error("This account doesn't exist");
        error.cause = 401; // Unauthorized
        throw error;
    }
    const isPasswordValid = await comparePassword(password, userFound.password);
    if (!isPasswordValid) {
        const error = new Error("Invalid email or password");
        error.cause = 401;
        throw error;
    }

    //token generation 
    const token = loginCredentialsCreator({
        payload: {
            userId: userFound._id,
            email: userFound.email,
            role: userFound.role
        },
        secret: JWT_SECRET,
        options: { expiresIn: JWT_ACCESS_EXPIRATION },
        issuer: 'SarahahApp',
        audience: 'SarahahUsers',
        jwid: userFound._id.toString(), // Unique identifier for the token
        timestamp: Date.now() // Add timestamp for better token management
    });
    return { user: userFound, token };
}
