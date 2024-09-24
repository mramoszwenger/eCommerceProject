import { daoFactory } from '../factories/factory.js';

class MessageController {
  constructor() {
    this.messageManager = null;
  }

  async initialize() {
    const { MessageDao } = await daoFactory.initializeDaos();
    this.messageManager = MessageDao;
  }

  getAllMessages = async (req, res) => {
    try {
      const messages = await this.messageManager.getAllMessages();
      res.json(messages);
    } catch (error) {
      console.error('Error al obtener los mensajes:', error);
      res.status(500).json({ error: 'Error al obtener los mensajes' });
    }
  }

  addMessage = async (req, res) => {
    try {
      const newMessage = await this.messageManager.addMessage(req.body);
      res.status(201).json(newMessage);
    } catch (error) {
      console.error('Error al agregar el mensaje:', error);
      res.status(400).json({ error: error.message });
    }
  }
}

const messageController = new MessageController();
await messageController.initialize();
export default messageController;
