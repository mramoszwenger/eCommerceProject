import express from 'express';
import messageController from '../../controllers/messageController.js';

const router = express.Router();

// Obtener todos los mensajes
router.get('/', messageController.getAllMessages);

// Agregar un nuevo mensaje
router.post('/', messageController.addMessage);

export default router;
