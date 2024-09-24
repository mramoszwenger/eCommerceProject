import express from 'express';
import messageController from '../../controllers/messageController.js';

const router = express.Router();

router.get('/', messageController.getAllMessages);
router.post('/', messageController.addMessage);

export default router;
