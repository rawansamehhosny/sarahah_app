import {Worker} from "bullmq";
import {sendEmail} from "./services/email.service.js";
import envConfig from "./config/env.config.js";
import { verifyEmailTransporter } from "./client/email.client.js";

// Create a worker to process email jobs
console.log("worker started processing job");

verifyEmailTransporter().catch((error) => {
    console.error("Email transporter verification failed:", error);
});

const emailWorker = new Worker("emailQueue", async job => {
    const { email, subject, htmlContent } = job.data;
    try {
        await sendEmail({
            to: email,
            subject: subject,
            htmlContent: htmlContent
        });
        console.log(`✅ [Worker] Success! Email delivered to ${email}`);
    } catch (error) {
        console.error(`❌ [Worker] Failed to send email to ${email}:`, error);

        throw error;
    }
}, {
    // Dedicated BullMQ connection for the worker
    connection: { url: envConfig.redis.url },

    // Retry settings for failed jobs
    settings: {
        backoff: {
            type: 'exponential', // Use exponential backoff for retries
            delay: 5000 // Initial delay of 5 seconds before the first retry
        }
    }
});

// Handle worker events for logging
emailWorker.on('failed', (job, err) => {
    console.error(`🚨 Job ${job.id} failed completely after retries: ${err.message}`);
});