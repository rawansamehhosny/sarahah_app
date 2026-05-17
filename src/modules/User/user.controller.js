import { Router } from "express";
import { getUserProfileService } from "./user.service.js";
import { updateUserProfileService } from "./user.service.js";
import {authMiddleware } from '../../middelwares/auth.middleware.js';

const usercontroller = Router();

usercontroller.get('/profile', authMiddleware, async (req, res, next) => {
    try {
    const user = await getUserProfileService(req.user);
    res.json(user);
    } catch (error) {
    next(error);
    }
});

usercontroller.patch('/profile-update', authMiddleware, async (req, res, next) => {
    try{
      const userId = req.user._id;
      const updateData = req.body;
      const updateUser = await updateUserProfileService(userId, updateData);
        res.json({
            success: true,
            message: "User profile updated successfully",
            data: updateUser
        });
    } catch (error) {
        next(error);
    }
});

export default usercontroller;