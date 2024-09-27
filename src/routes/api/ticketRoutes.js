import express from 'express';
import ticketController from '../../controllers/ticketController.js';
import { isAuthenticated } from '../../middlewares/auth.js';

const router = express.Router();

// Obtener un ticket específico
router.get('/:id', isAuthenticated, ticketController.getTicketById);

// Obtener todos los tickets
router.get('/', isAuthenticated, ticketController.getAllTickets);

// Obtener tickets de un usuario específico
router.get('/user', isAuthenticated, ticketController.getTicketsByUser);

export default router;
