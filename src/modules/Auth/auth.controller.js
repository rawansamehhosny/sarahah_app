import { Router } from "express";
import * as authService from "./auth.service.js";
const authcontroller = Router();

authcontroller.get('/login', (req, res) => {
    res.send('Login route is working');
});



authcontroller.post('/signup', async (req, res, next) => {
    try {
        // نبعت الـ body للسيرفس ونستنى النتيجة
        const response = await authService.signUpService(req.body);

        // لو كله تمام، نرد على العميل
        return res.status(201).json({
            success: true,
            message: "User created successfully",
            data: response
        });
    } catch (error) {
        next(error);
    }
});

authcontroller.post('/login', async (req, res, next) => {
    try {
        const response = await authService.loginService(req.body);
        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: response
        });
    } catch (error) {
        next(error);
    }
});

authcontroller.post('/refresh-token', async (req, res, next) => {
    const { authorization } = req.headers;
    console.log("--- Raw Authorization Header From Postman ---", authorization); // 👈 سطر الفحص 1
    if (!authorization) {
        return next(new Error("Refresh token is required", { cause: 400 }));
    }

    const refreshToken = authorization.startsWith('Bearer ')
        ? authorization.split(' ')[1]
        : authorization;
    console.log("--- Cleaned Refresh Token Sent To Service ---", refreshToken); // 👈 سطر الفحص 2
    try {
        const newTokens = await authService.refreshTokenService(refreshToken);
        return res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            ...newTokens 
        });

    } catch (error) {
        next(error);
    }
});


authcontroller.post('/gmail/regsiter', async (req, res, next) => {
    try {
        const response = await authService.googleSignUpService(req.body);
        return res.status(201).json({
            success: true,
            message: "User registered successfully with Google",
            data: response
        });
    } catch (error) {
        next(error);
    }
});

authcontroller.post('/gmail/login', async (req, res, next) => {
    try {
        const response = await authService.googleLoginService(req.body);
        return res.status(200).json({
            success: true,
            message: "Login successful with Google",
            data: response
        });
    } catch (error) {
        next(error);
    }
});

export default authcontroller;