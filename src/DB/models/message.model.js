import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: {
            Name: 'receiver_index'
        }
    }
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);

export default Message;