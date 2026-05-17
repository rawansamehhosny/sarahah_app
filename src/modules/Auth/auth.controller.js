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


export default authcontroller;