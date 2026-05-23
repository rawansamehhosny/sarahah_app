import { comparePassword, hashPassword } from "../../Utils/crypto.util.js";
import { encryptData } from "../../Utils/crypto.util.js";
import {UserRepository } from "../../DB/Repositories/index.js";
import envConfig from "../../config/env.config.js";
import { generateToken, createLoginCredentials } from "../../middelwares/index.js";
import { validateTokenAndGetUser } from "../../middelwares/tokens.js";
import { tokenTypes } from "../../Utils/constants.utils.js";
import { GoogleAuth } from "google-auth-library";
import { OAuth2Client } from "google-auth-library";
import { createLoginCredentials } from "../../middelwares/tokens.js";
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
    const token = createLoginCredentials({
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


export const refreshTokenService = async (refreshToken) => {
    try {

        const user = await validateTokenAndGetUser({ token: refreshToken, tokenTypes: tokenTypes.REFRESH });
        const newTokens = createLoginCredentials({
            payload: {
                userId: user._id,
                email: user.email,
                role: user.role
            }
        });

        return newTokens;

    } catch (error) {
        error.cause = error.cause || 401;
        error.message = error.name === 'TokenExpiredError'
            ? "Refresh token expired, please login completely"
            : error.message || "Invalid refresh token";
        throw error;
    }
}

// Google Authentication Service
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuthService = async ({idToken}) => {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await UserRepository.FindOneDoc({ email });
    if (!user ) {
        user = await UserRepository.Createdoc({
            firstName: name,
            lastName: '',
            email: email,
            googleId: googleId,
            avatar: picture
        }) 
    };

    const token = createLoginCredentials({
        payload: {
            userId: user._id,
            email: user.email,
            role: user.role
        }
    });
    return {
        message: "Logged in successfully with Google",
        user: { id: user._id, email: user.email, username: user.username },
        ...token
    };
};