import { Message } from '../../models/messageModel.js';

class MessageDaoMongo {
  async addMessage(messageData) {
    const newMessage = new Message(messageData);
    await newMessage.save();
    return newMessage;
  }

  async getAllMessages() {
    return await Message.find().sort({ createdAt: -1 });
  }
}

export default MessageDaoMongo;
