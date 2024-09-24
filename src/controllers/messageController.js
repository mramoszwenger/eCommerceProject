import { daoFactory } from '../factories/factory.js';

class MessageController {
  constructor() {
    this.messageManager = null;
  }

  async initialize() {
    const { MessageDao } = await daoFactory.initializeDaos();
    this.messageManager = MessageDao;
  }

  getAllMessages = async (request, response) => {
    try {
      const messages = await this.messageManager.getAllMessages();
      response.json(messages);
    } catch (error) {
      console.error('Error al obtener los mensajes:', error);
      response.status(500).json({ error: 'Error al obtener los mensajes' });
    }
  }

  addMessage = async (request, response) => {
    try {
      const newMessage = await this.messageManager.addMessage(req.body);
      response.status(201).json(newMessage);
    } catch (error) {
      console.error('Error al agregar el mensaje:', error);
      response.status(400).json({ error: error.message });
    }
  }
}

const messageController = new MessageController();
await messageController.initialize();
export default messageController;
