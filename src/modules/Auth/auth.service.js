import { comparePassword, hashPassword } from "../../Utils/crypto.util.js";
import { encryptData } from "../../Utils/crypto.util.js";
import {UserRepository } from "../../DB/Repositories/index.js";
import envConfig from "../../config/env.config.js";
import { validateTokenAndGetUser } from "../../middelwares/tokens.js";
import { tokenTypes } from "../../Utils/constants.utils.js";
import { OAuth2Client } from "google-auth-library";
import { createLoginCredentials } from "../../middelwares/tokens.js";
import { PROVIDESR } from "../../Utils/constants.utils.js";
import path from 'path';
import fs from 'fs';
import {
    ConflictError,
    NotFoundError,
    BadRequestError,
    AuthenticationError
} from "../../Utils/errors/exceptions.js";
import { BlacklistToken, ttl } from "../../services/redis.services.js";
import { sendEmail } from "../../services/email.service.js";
import { set, get, del } from "../../services/redis.services.js";
import { welcomeOtpTemplate } from "../../Utils/templates/email.temp.js";
import { emailQueue } from "../../Queues/email.queue.js";

// Helper function to generate a 6-digit OTP
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
}

// Helper function to send and save OTP in Redis and queue the email
const sendAndSaveOtpHelper = async (user, otp) => {
    const EXPIRE_TIME = 5 * 60; // 5 دقائق

    //save the OTP in Redis with an expiration time of 5 minutes
    await set(`otp:${user.email}`, otp, 'EX', EXPIRE_TIME);
    await set(`otp:verify:${otp}`, user._id.toString(), 'EX', EXPIRE_TIME);

    // send the OTP email using the email queue
    const emailHtmlContent = welcomeOtpTemplate(user.firstName, otp);
    await emailQueue.add("sendWelcomeEmail", {
        email: user.email,
        subject: "Verify Your Account - Sarahah App 🔐",
        htmlContent: emailHtmlContent
    });
};


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
        phone: null, // Initialize phone as null, will update if provided wee encrypt it
        isEmailVerified: false // Initialize email verification status
    });
    // Encrypt phone number if provided
    if(phone) {
        newUser.phone = encryptData(phone);
        await newUser.save();
    }

    // Generate OTP for email verification
    // Generate a 6-digit OTP
    const otp = generateOtp();
    try {
        await sendAndSaveOtpHelper(newUser, otp);

    } catch (emailError) {
        console.error("⚠️ Welcome email failed to send, but user was created:", emailError);
        throw new Error("User registered successfully, but failed to send welcome email. Please contact support.");
    }

    return newUser;
};

// Function to resend OTP
export const resendOtpService = async (email) => {
    // Check if user exists
    const user = await UserRepository.FindOneDoc( email );
    if (!user) {
        throw new NotFoundError("User not found");
    }
    if (user.isEmailVerified) {
        throw new BadRequestError("Email is already verified");
    }

    // Generate a new 6-digit OTP
    const otp = generateOtp();
    try {
        await sendAndSaveOtpHelper(user, otp);
    } catch (emailError) {
        console.error("⚠️ Failed to send OTP email:", emailError);
        throw new Error("Failed to send OTP email. Please try again.");
    }

    return { message: "OTP sent successfully" };
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
        }
    });
    return { user: userFound, token };
}


export const refreshTokenService = async (refreshToken) => {
    try {

        const { user } = await validateTokenAndGetUser({ token: refreshToken, tokenTypes: tokenTypes.REFRESH });
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

export const logoutService = async (accessToken, refreshToken) => {
    try {
        if (!refreshToken) {
            throw new AuthenticationError("Refresh token is required");
        }

        const decodedAcess = accessToken;
        const { decoded: decodedRefresh } = await validateTokenAndGetUser({
            token: refreshToken,
            tokenTypes: tokenTypes.REFRESH
        });

        if (decodedAcess.userId?.toString() !== decodedRefresh.userId?.toString()) {
            throw new AuthenticationError("Access token and refresh token do not belong to same user");
        }
        const { exp: accessExp, jti: accessJti } = decodedAcess;
        const { exp: refreshExp, jti: refreshJti } = decodedRefresh;
     

        // Blagcklist both tokens in Redis with their respective expiration times
        //put in a promise.all to make sure both operations happen at the same time and we don't have a case where one token is blacklisted and the other isn't due to an error or something
        await Promise.all([
            BlacklistToken({
                key: `bl_${tokenTypes.REFRESH}_${refreshJti}`,
                exp: refreshExp * 1000
            }),
            BlacklistToken({
                key: `bl_${tokenTypes.ACCESS}_${accessJti}`,
                exp: accessExp * 1000
            })
        ]);

        return { message: "Logged out successfully" ,
            refreshtokenttl : await ttl(`bl_${tokenTypes.REFRESH}_${refreshJti}`),
            accesstokenttl : await ttl(`bl_${tokenTypes.ACCESS}_${accessJti}`)
        };
    } catch (error) {
        throw new AuthenticationError(error.message || "Invalid token(s) provided for logout");
    } };


export const verifyEmailOtpService = async ({ otp }) => {
    const userId = await get(`otp:verify:${otp}`);

    if (!userId) {
        throw new BadRequestError("OTP has expired or is invalid. Please request a new one.");
    }

    const user = await UserRepository.FindById(userId);
    if (!user) {
        throw new NotFoundError("User not found");
    }

    user.isEmailVerified = true;
    await user.save();

    await del(`otp:verify:${otp}`);

    return { message: "Account verified successfully! You can login now." };
};