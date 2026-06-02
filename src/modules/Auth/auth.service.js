import { comparePassword, hashPassword } from "../../Utils/crypto.util.js";
import { encryptData } from "../../Utils/crypto.util.js";
import {UserRepository } from "../../DB/Repositories/index.js";
import envConfig from "../../config/env.config.js";
import { validateTokenAndGetUser } from "../../middelwares/tokens.js";
import { tokenTypes } from "../../Utils/constants.utils.js";
import { OAuth2Client } from "google-auth-library";
import { createLoginCredentials } from "../../middelwares/tokens.js";
import { PROVIDESR } from "../../Utils/constants.utils.js";
import {
    ConflictError,
    NotFoundError,
    BadRequestError,
    AuthenticationError
} from "../../Utils/errors/exceptions.js";
const JWT_SECRET = envConfig.jwt.secret;
const JWT_ACCESS_EXPIRATION = envConfig.jwt.accessExpiration;

export const signUpService = async (data) => {
    const { firstName, lastName, email, password, gender, phone } = data;
    //(Check Duplication)
    const isEmailExist = await UserRepository.FindOneDoc({ email });
    if (isEmailExist) {
     throw new ConflictError("Email already exists");
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
        throw new NotFoundError("This account doesn't exist");
    }
    const isPasswordValid = await comparePassword(password, userFound.password);
    if (!isPasswordValid) {
        throw new AuthenticationError("Invalid email or password");
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
        const message = error.name === 'TokenExpiredError'
            ? "Refresh token expired, please login completely"
            : error.message || "Invalid refresh token";

        throw new AuthenticationError(message);
    }
}

// Google Authentication Service
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuthService = async ({idToken}) => {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: envConfig.google.clientId
    });
    const payload = ticket.getPayload();
    console.log("DEBUG PAYLOAD:", JSON.stringify(payload, null, 2));
    const { email, given_name, family_name, picture } = payload;
    if (!payload || !payload.email_verified) {
        throw new BadRequestError("Invalid Google ID token");
    }
    let user = await UserRepository.FindOneDoc({
        $or: [
            { email: payload.email },
            { googlesub: payload.sub }
        ], provider: PROVIDESR.GOOGLE

    });
    if (user) {
        user = await UserRepository.UpdateById({    
            id: user._id.toString(),
             updateData:
            {
                firstName: payload.given_name,
                lastName: payload.family_name || '',
                avatar: payload.picture,
                provider: PROVIDESR.GOOGLE,
                googlesub: payload.sub // تأكدي من الاسم هنا
            }
        });
    } else {
        user = await UserRepository.Createdoc({
            firstName: payload.given_name,
            lastName: payload.family_name,
            email: payload.email,
            provider: PROVIDESR.GOOGLE,
            googlesub: payload.sub,
            avatar: payload.picture
        });
    }
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