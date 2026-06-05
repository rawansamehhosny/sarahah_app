import { Router } from "express";
import * as authService from "./auth.service.js";
const authcontroller = Router();
import { unifiedResponseMiddleware } from "../../middelwares/unified-response.middleware.js";
import validationMiddleware from "../../middelwares/validation.middleware.js";
import { registerSchema, loginSchema , googleAuthSchema} from "../../validators/auth.validators.js";
import multerLocal from "../../middelwares/multer.middleware.js";
const upload = multerLocal();

authcontroller.get('/login', validationMiddleware(loginSchema), unifiedResponseMiddleware(async (req, res) => {
    return {
        data: 'Login route is working'
    };
}));


authcontroller.post('/signup', validationMiddleware(registerSchema), unifiedResponseMiddleware(async (req, res, next) => {
    const response = await authService.signUpService(req.body);
    return {
        data: response,
        message: "User signed up successfully" // ممكن تبعتي رسالة مخصصة هنا
    };
}));

authcontroller.post('/login', validationMiddleware(loginSchema), unifiedResponseMiddleware(async (req, res, next) => {
    const response = await authService.loginService(req.body);
    return {
        data: response,
        message: "Logged in successfully"
    };
}));

// 1. Refresh Token Route
authcontroller.post('/refresh-token', unifiedResponseMiddleware(async (req, res, next) => {
    const authorization = req.header('authorization') || req.header('Authorization');

    if (!authorization) {
        return next(new Error("Refresh token is required", { cause: 401 })); // يفضل 401 للـ Auth
    }

    const refreshToken = authorization.startsWith('Bearer ')
        ? authorization.split(' ')[1]
        : authorization;

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


export default authcontroller;