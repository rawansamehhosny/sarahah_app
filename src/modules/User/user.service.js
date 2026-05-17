import {UserRepository } from "../../DB/Repositories/index.js";
import envConfig from "../../config/env.config.js";


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
    const user = await UserRepository.UpdateById(_id, updateData);
    if (!user) {
        const error = new Error("User not found");
        error.cause = 404;
        throw error;
    }
    return user.toObject();
}

    