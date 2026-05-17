import { decryptData, encryptData } from "../../Utils/crypto.util.js";
import { MessageRepository } from "../../DB/Repositories/index.js"

//helper function to format message and decrypt its content before sending it to the user
const formatAndDecryptMessage = (msg) => {
    const plainObject = msg.toObject();
    plainObject.content = decryptData(plainObject.content);
    return plainObject;
};

//service to create a new message, it encrypts the content before saving it to the database
export const createMessageService = async (messageData) => {
    const {content, receiver} = messageData;
    const encryptedContent = encryptData(content);
    const newMessage = await MessageRepository.Createdoc({
        content: encryptedContent,
        receiver
    });
    return newMessage;
}
//service to get messages for a specific receiver, it decrypts the content of each message before sending it to the user
export const getMessagesByReceiverService = async (loggedInId) => {
    const messages = await MessageRepository.FindDocs({ receiver: loggedInId });
    return messages.map(formatAndDecryptMessage);
}

//testing for roles and authorization
export const getAllMessagesService = async () => {
    const messages = await MessageRepository.FindAllDocs();
    return messages.map(formatAndDecryptMessage);
}

