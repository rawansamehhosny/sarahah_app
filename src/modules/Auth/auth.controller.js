import { Router } from "express";
import * as authService from "./auth.service.js";
const authcontroller = Router();
import { unifiedResponseMiddleware } from "../../middelwares/unified-response.middleware.js";
import validationMiddleware from "../../middelwares/validation.middleware.js";
import { registerSchema, loginSchema , googleAuthSchema, verifyOtpSchema } from "../../validators/auth.validators.js";
import multerLocal from "../../middelwares/multer.middleware.js";
import { authMiddleware } from "../../middelwares/auth.middleware.js";
import { resendOtpService } from "./auth.service.js";
const upload = multerLocal();

const getRefreshTokenFromHeaders = (req) => {
    const refreshHeader = req.header('x-refresh-token') || req.header('refresh-token');

    if (!refreshHeader) {
        return null;
    }

    return refreshHeader.startsWith('Bearer ')
        ? refreshHeader.split(' ')[1]
        : refreshHeader;
};

authcontroller.get('/login', validationMiddleware(loginSchema), unifiedResponseMiddleware(async (req, res) => {
    return {
        data: 'Login route is working'
    };
}));


authcontroller.post('/signup', validationMiddleware(registerSchema), unifiedResponseMiddleware(async (req, res, next) => {
    const response = await authService.signUpService(req.body);
    return res.status(201).json({
        message: "User registered successfully!",
        user: {
            id: response._id,
            firstName: response.firstName,
            email: response.email
        }
    });
}));

authcontroller.post('/login', validationMiddleware(loginSchema), unifiedResponseMiddleware(async (req, res, next) => {
    const response = await authService.loginService(req.body);
    return {
        data: response,
        message: "Logged in successfully"
    };
}));

// verify OTP route
authcontroller.post('/verify-otp', validationMiddleware(verifyOtpSchema), unifiedResponseMiddleware(async (req, res, next) => {
    const result = await authService.verifyEmailOtpService({ otp: req.body.otp });
    return {
        data: result,
        message: "OTP verified successfully"
    };
}));

// resend OTP route
authcontroller.post('/resend-otp', unifiedResponseMiddleware(async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const result = await resendOtpService({ email });
        return res.status(200).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
}));


// 1. Refresh Token Route
authcontroller.post('/refresh-token', unifiedResponseMiddleware(async (req, res, next) => {
    const refreshToken = getRefreshTokenFromHeaders(req);

    if (!refreshToken) {
        return next(new Error("Refresh token is required", { cause: 401 })); // يفضل 401 للـ Auth
    }

    const newTokens = await authService.refreshTokenService(refreshToken);

    return {
        data: newTokens,
        message: "Token refreshed successfully"
    };
}));

// 2. Google Register Route
authcontroller.post('/gmail/register', validationMiddleware(googleAuthSchema), unifiedResponseMiddleware(async (req, res, next) => {
    const { idToken } = req.body;

    const response = await authService.googleAuthService({ idToken });

    return {
        data: response,
        message: "User registered successfully with Google"
    };
}));

authcontroller.post('/logout', authMiddleware, unifiedResponseMiddleware(async (req, res, next) => {
    // هنا ممكن تضيف لوجيك لمسح الـ Refresh Token من الـ Redis أو قاعدة البيانات
   const result = await authService.logoutService(req.accessToken, getRefreshTokenFromHeaders(req));
    return {
        data: result,
        message: "Logged out successfully"
    };
}));

export default authcontroller;