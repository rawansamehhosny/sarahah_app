import {UserRepository } from "../../DB/Repositories/index.js";
import envConfig from "../../config/env.config.js";
import fs from "fs";

const JWT_SECRET = envConfig.jwt.secret;


export const getUserProfileService = async (userData) => {
    // const { _id } = userData;
    if (userData && typeof userData === "object" && userData._id) {
        return userData; 
    }

    const user = await UserRepository.FindById(userData);
    console.log("Uuuuuuuser found in Service:", user);
    if (!user) {
        const error = new Error("User not found");
        error.cause = 404;
        throw error;
    }
    return user;
};

export const updateUserProfileService = async (_id, updateData) => {
    const user = await UserRepository.UpdateById({_id, updateData});
    if (!user) {
        const error = new Error("User not found");
        error.cause = 404;
        throw error;
    }
    return user.toObject();
}

export const updateUserAvatarService = async (userId, filePath) => {
    const user = await UserRepository.FindById(userId);
    if (!user) {
        const error = new Error("User not found");
        error.cause = 404;
        throw error;
    }
    // Delete old avatar file if it exists and is accessible
    if (user.avatar && fs.existsSync(user.avatar)) {
        fs.unlinkSync(user.avatar); 
    }
    // Update user document with new avatar path
    const updatedUser = await UserRepository.UpdateById({
        _id: userId,
        updateData: { avatar: filePath },
        options: { new: true }
    });
    const userObject = updatedUser.toObject();
   delete userObject.password;
    return userObject;
};