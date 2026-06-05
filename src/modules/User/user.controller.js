import { Router } from "express";
import { getUserProfileService } from "./user.service.js";
import { updateUserProfileService } from "./user.service.js";
import {authMiddleware } from '../../middelwares/auth.middleware.js';
import { unifiedResponseMiddleware } from "../../middelwares/unified-response.middleware.js";
import multerLocal from "../../middelwares/multer.middleware.js";
import { updateUserAvatarService } from "./user.service.js";

const usercontroller = Router();

usercontroller.get('/profile', authMiddleware, unifiedResponseMiddleware(async (req, res, next) => {
    const user = await getUserProfileService(req.user);
    return {
        data: user
    };
}));

usercontroller.patch('/profile-update', authMiddleware, unifiedResponseMiddleware(async (req, res, next) => {
      const userId = req.user._id;
      const updateData = req.body;
      const updateUser = await updateUserProfileService(userId, updateData);
      return {
          data: updateUser
      };
}));

usercontroller.patch(
   '/profile-update-avatar',
    authMiddleware, 
    multerLocal('avatars', { fileSize: 5 * 1024 * 1024 }).single('avatar'), // بنستخدم .array عشان multer يتعامل مع الملف حتى لو كان واحد، وده بيحل مشكلة req.file اللي بتكون undefined
    unifiedResponseMiddleware(async (req, res, next) => {
     
        if (!req.file) {
            const error = new Error("Please upload an image");
            error.cause = 400;
            throw error;
        }
        const userId = req.user._id;
        const updatedUser = await updateUserAvatarService(userId, req.file.path);
        return {
            statusCode: 200,
            message: "Profile picture updated successfully! ✨",
            data: updatedUser
        };
    })
);

export default usercontroller;