import nodemailer from 'nodemailer';
import { transporter } from '../client/email.client.js';

// Get the sender email from environment variables or use a default
const FromEmail = process.env.SMTP_USER || 'noreply@sarahah.com';

// Function to send email
export const sendEmail = async ({ to, subject, htmlContent, attachments = [] }) => {
    try {
        const mailOptions = {
            from: `"Sarahah App" <${FromEmail}>`, // Sender address
            to, // List of recipients
            subject,
            html: htmlContent,
            attachments
        };
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.messageId);
        console.log("SMTP response:", {
            accepted: info.accepted,
            rejected: info.rejected,
            response: info.response
        });
        return info; 
    } catch (error) {
        console.error("Error sending email:", error);
        throw error; 
    }
};