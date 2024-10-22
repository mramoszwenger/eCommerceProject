import mongoose from 'mongoose';
import { daoFactory } from '../factories/factory.js';
import CartRepository from '../repositories/cartRepository.js';
import { User } from '../models/userModel.js';

class CartController {
  constructor() {
    this.cartRepository = null;
  }

  initialize = async () => {
    const { CartDao } = await daoFactory.initializeDaos();
    this.cartRepository = CartRepository(CartDao);
  }

  getCart = async (request, response) => {
    try {
      const { cid } = request.params;
      const cart = await this.cartRepository.getCart(cid);
      if (!cart) {
        return response.status(404).json({ error: 'Carrito no encontrado' });
      }
      response.json(cart);
    } catch (error) {
      console.error('Error al obtener el carrito:', error);
      response.status(500).json({ error: 'Error al obtener el carrito' });
    }
  }

  createCart = async (request, response) => {
    try {
      const userId = request.session.user.id;
      const newCart = await this.cartRepository.createCart({ user: userId });
      response.status(201).json(newCart);
    } catch (error) {
      console.error('Error al crear el carrito:', error);
      response.status(500).json({ error: 'Error al crear el carrito' });
    }
  }

  addProductToCart = async (request, response) => {
    try {
      const { cid, pid } = request.params;
      const { quantity = 1 } = request.body;
      const userId = request.session.user.id;
      const user = await User.findById(userId);

      if (!user) {
        return response.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
      }

      console.log(`Intentando agregar producto ${pid} al carrito ${cid} con cantidad ${quantity}`);

      // Verifica si el producto ya pertenece al usuario
      const cart = await this.cartRepository.getCart(cid);
      const productInCart = cart.products.find(product => product.id === pid);

      if (user.role === 'premium' && productInCart) {
        return response.status(403).json({ status: 'error', message: 'No puedes agregar un producto que ya te pertenece' });
      }

      const updatedCart = await this.cartRepository.addProductToCart(cid, pid, parseInt(quantity, 10));
      console.log('Carrito actualizado:', JSON.stringify(updatedCart, null, 2));
      response.json(updatedCart);
    } catch (error) {
      console.error('Error al agregar producto al carrito:', error);
      if (error.message === 'Carrito no encontrado') {
        return response.status(404).json({ error: 'Carrito no encontrado' });
      }
      response.status(500).json({ error: 'Error al agregar producto al carrito', details: error.message });
    }
  }

  removeProductFromCart = async (request, response) => {
    try {
      const { cid, pid } = request.params;
      console.log(`Intentando eliminar producto ${pid} del carrito ${cid}`);
      
      const updatedCart = await this.cartRepository.removeProductFromCart(cid, pid);
      
      console.log('Carrito actualizado:', updatedCart);
      response.json({ success: true, cart: updatedCart });
    } catch (error) {
      console.error('Error al eliminar producto del carrito:', error);
      if (error.message === 'Carrito no encontrado') {
        return response.status(404).json({ error: 'Carrito no encontrado' });
      }
      response.status(500).json({ error: 'Error al eliminar producto del carrito' });
    }
  }

  updateCart = async (request, response) => {
    try {
      const { cid } = request.params;
      const { products } = request.body;
      const cart = await this.cartRepository.updateCart(cid, products);
      response.json(cart);
    } catch (error) {
      console.error('Error al actualizar el carrito:', error);
      if (error.message === 'Carrito no encontrado') {
        return response.status(404).json({ error: 'Carrito no encontrado' });
      }
      response.status(500).json({ error: 'Error al actualizar el carrito' });
    }
  }

  updateProductQuantity = async (request, response) => {
    try {
      const { cid, pid } = request.params;
      const { quantity } = request.body;
      const cart = await this.cartRepository.updateProductQuantity(cid, pid, parseInt(quantity, 10), false);
      response.json({ success: true, cart });
    } catch (error) {
      console.error('Error al actualizar la cantidad del producto:', error);
      if (error.message === 'Carrito no encontrado' || error.message === 'Producto no encontrado en el carrito') {
        return response.status(404).json({ error: error.message });
      }
      response.status(500).json({ error: 'Error al actualizar la cantidad del producto' });
    }
  }

  clearCart = async (request, response) => {
    try {
      const { cid } = request.params;
      console.log(`Intentando vaciar el carrito: ${cid}`);
      const cart = await this.cartRepository.clearCart(cid);
      console.log('Carrito vaciado:', cart);
      response.json({ success: true, cart });
    } catch (error) {
      console.error('Error al vaciar el carrito:', error);
      if (error.message === 'Carrito no encontrado') {
        return response.status(404).json({ error: 'Carrito no encontrado' });
      }
      response.status(500).json({ error: 'Error al vaciar el carrito' });
    }
  }

  renderCart = async (request, response) => {
    try {
      const { cid } = request.params;
      
      if (!mongoose.Types.ObjectId.isValid(cid)) {
        return response.status(400).render('error', { error: 'ID de carrito inválido' });
      }
  
      const cart = await this.cartRepository.getCart(cid);
      if (!cart) {
        return response.status(404).render('error', { error: 'Carrito no encontrado' });
      }
      
      response.render('cartDetail', { 
        title: 'Carrito de Compras',
        cart,
        cartId: cid
      });
    } catch (error) {
      console.error('Error al renderizar el carrito:', error);
      response.status(500).render('error', { error: 'Error al cargar el carrito' });
    }
  }
}

const cartController = new CartController();
await cartController.initialize();
export default cartController;
