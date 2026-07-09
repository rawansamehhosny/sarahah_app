import nodemailer from "nodemailer";
import emailConfig from "../config/email.config.js";

// Create transporter
export const transporter = nodemailer.createTransport(emailConfig);

// Verify the transporter configuration
export const verifyEmailTransporter = async () => {
    try {
        await transporter.verify();
        console.log("Email transporter is ready to send emails");
    }
    catch (error) {
        console.error("Error verifying email transporter:", error);
    }
};