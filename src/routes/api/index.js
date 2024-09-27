import express from 'express';
import productRoutes from './productRoutes.js';
import cartRoutes from './cartRoutes.js';
import userRoutes from './userRoutes.js';
import sessionRoutes from './sessionRoutes.js';
import messageRoutes from './messageRoutes.js';
import ticketRoutes from './ticketRoutes.js';

const router = express.Router();

// Rutas de productos
router.use('/products', productRoutes);

// Rutas de carritos
router.use('/carts', cartRoutes);

// Rutas de usuarios
router.use('/users', userRoutes);

// Rutas de sesiones
router.use('/sessions', sessionRoutes);

// Rutas de mensajes
router.use('/messages', messageRoutes);

// Rutas de tickets
router.use('/tickets', ticketRoutes);

export default router;
