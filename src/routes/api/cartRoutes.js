import express from 'express';
import cartController from '../../controllers/cartController.js';
import { isAuthenticated } from '../../middlewares/auth.js';

const router = express.Router();

// Obtener un carrito específico
router.get('/:cid', isAuthenticated, cartController.getCart);

// Crear un nuevo carrito
router.post('/', isAuthenticated, cartController.createCart);

// Agregar un producto a un carrito
router.post('/:cid/products/:pid', isAuthenticated, cartController.addProductToCart);

// Eliminar un producto del carrito
router.delete('/:cid/products/:pid', isAuthenticated, cartController.removeProductFromCart);

// Actualizar el carrito con un arreglo de productos
router.put('/:cid', isAuthenticated, cartController.updateCart);

// Actualizar la cantidad de un producto en el carrito
router.put('/:cid/products/:pid', isAuthenticated, cartController.updateProductQuantity);

// Eliminar todos los productos del carrito
router.delete('/:cid', isAuthenticated, cartController.clearCart);

export default router;