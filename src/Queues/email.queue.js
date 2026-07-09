import { Queue } from "bullmq";
import envConfig from "../config/env.config.js";

export const emailQueue = new Queue("emailQueue", {
    connection: { url: envConfig.redis.url }, // Dedicated BullMQ connection for the queue
    defaultJobOptions: {
        removeOnComplete: true, // Automatically remove completed jobs from the queue
        removeOnFail: false, // Keep failed jobs in the queue for debugging
    },
});