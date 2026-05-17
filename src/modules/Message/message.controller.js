import { Router } from "express";
import { createMessageService } from "./message.service.js";
import { getMessagesByReceiverService, getAllMessagesService} from "./message.service.js";
import { authMiddleware, roleMiddleware } from "../../middelwares/auth.middleware.js";

const messagecontroller = Router();

messagecontroller.post("/send", async (req, res, next) => {
    try {
    const { receiverId, content } = req.body;
        if (!receiverId || !content) {
        return res.status(400).json({
            success: false,
            message: "Recipient ID and content are required"
        });
    }
    const newMessage = createMessageService({
        content,
        receiver: receiverId 
    });

    return res.status(201).json({
        success: true,
        message: "Message sent successfully",
        data: newMessage
    });
} catch (error) {
    next(error);
}
});

messagecontroller.get("/inbox", authMiddleware, async (req, res, next) => {
    try {
        const loggedInId = req.user._id; // Assuming the receiver is the logged-in user

        const messages = await getMessagesByReceiverService(loggedInId);

        return res.status(200).json({
            success: true,
            data: messages  
        });

    } catch (error) {
        next(error);
    }});

    messagecontroller.get("/all", authMiddleware, roleMiddleware(['admin', 'user']), async (req, res, next) => {
        try {
            const messages = await getAllMessagesService();
            return res.status(200).json({
                success: true,
                data: messages
            });
        } catch (error) {
            next(error);
        }
    });
export default messagecontroller;