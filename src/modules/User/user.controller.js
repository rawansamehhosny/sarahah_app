import { Router } from "express";
import { getUserProfileService } from "./user.service.js";
import { updateUserProfileService } from "./user.service.js";
import {authMiddleware } from '../../middelwares/auth.middleware.js';
import { unifiedResponseMiddleware } from "../../middelwares/unified-response.middleware.js";

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

export default usercontroller;