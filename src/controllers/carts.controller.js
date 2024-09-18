import CartManager from '../daos/mongo/cartsDaoMongo.js';
import ProductManager from '../daos/mongo/productsDaoMongo.js';
import { v4 as uuidv4 } from 'uuid';
import Ticket from '../daos/mongo/models/tickets.model.js';

const cartManager = new CartManager();
const productManager = new ProductManager();

class CartController {
  getCart = async (req, res) => {
    try {
      const { cid } = req.params;
      const cart = await cartManager.getCart(cid);
      if (!cart) {
        return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
      }
      res.json({ status: 'success', payload: cart });
    } catch (error) {
      console.error('Error al obtener el carrito:', error);
      res.status(500).json({ status: 'error', message: 'Error al obtener el carrito' });
    }
  }

  createCart = async (req, res) => {
    try {
      const newCart = await cartManager.createCart();
      res.status(201).json({ status: 'success', payload: newCart });
    } catch (error) {
      console.error('Error al crear el carrito:', error);
      res.status(500).json({ status: 'error', message: 'Error al crear el carrito' });
    }
  }

  addProductToCart = async (req, res) => {
    try {
      const { cid, pid } = req.params;
      const { quantity } = req.body;
      
      if (!quantity || quantity < 1) {
        return res.status(400).json({ status: 'error', message: 'Cantidad inválida' });
      }

      const cart = await cartManager.addProductToCart(cid, { product: pid, quantity });
      if (!cart) {
        return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
      }
      res.json({ status: 'success', payload: cart });
    } catch (error) {
      console.error('Error al agregar producto al carrito:', error);
      res.status(500).json({ status: 'error', message: 'Error al agregar producto al carrito' });
    }
  }

  removeProductFromCart = async (req, res) => {
    try {
      const { cid, pid } = req.params;
      const updatedCart = await cartManager.removeProduct(cid, pid);
      if (!updatedCart) {
        return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
      }
      res.json({ status: 'success', payload: updatedCart });
    } catch (error) {
      console.error('Error al eliminar el producto del carrito:', error);
      res.status(500).json({ status: 'error', message: 'Error al eliminar el producto del carrito' });
    }
  }

  updateCart = async (req, res) => {
    try {
      const { cid } = req.params;
      const { products } = req.body;
      
      if (!Array.isArray(products)) {
        return res.status(400).json({ status: 'error', message: 'Formato de productos inválido' });
      }

      const updatedCart = await cartManager.updateCart(cid, products);
      if (!updatedCart) {
        return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
      }
      res.json({ status: 'success', payload: updatedCart });
    } catch (error) {
      console.error('Error al actualizar el carrito:', error);
      res.status(500).json({ status: 'error', message: 'Error al actualizar el carrito' });
    }
  }

  updateProductQuantity = async (req, res) => {
    try {
      const { cid, pid } = req.params;
      const { quantity } = req.body;
      
      if (!quantity || quantity < 1) {
        return res.status(400).json({ status: 'error', message: 'Cantidad inválida' });
      }

      const updatedCart = await cartManager.updateProductQuantity(cid, pid, quantity);
      if (!updatedCart) {
        return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
      }
      res.json({ status: 'success', payload: updatedCart });
    } catch (error) {
      console.error('Error al actualizar la cantidad del producto:', error);
      res.status(500).json({ status: 'error', message: 'Error al actualizar la cantidad del producto' });
    }
  }

  clearCart = async (req, res) => {
    try {
      const { cid } = req.params;
      const clearedCart = await cartManager.clearAllProducts(cid);
      if (!clearedCart) {
        return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
      }
      res.json({ status: 'success', payload: clearedCart });
    } catch (error) {
      console.error('Error al vaciar el carrito:', error);
      res.status(500).json({ status: 'error', message: 'Error al vaciar el carrito' });
    }
  }

  purchaseCart = async (req, res) => {
    try {
      const { cid } = req.params;
      const cart = await cartManager.getCart(cid);
      if (!cart) {
        return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
      }

      let totalAmount = 0;
      const failedProducts = [];
      const purchasedProducts = [];

      for (const item of cart.products) {
        const product = await productManager.getProductById(item.product);
        if (product && product.stock >= item.quantity) {
          product.stock -= item.quantity;
          totalAmount += product.price * item.quantity;
          purchasedProducts.push(item);
          await product.save();
        } else {
          failedProducts.push(item.product);
        }
      }

      if (purchasedProducts.length > 0) {
        const ticket = new Ticket({
          code: uuidv4(),
          purchase_datetime: new Date(),
          amount: totalAmount,
          purchaser: req.user.email
        });
        await ticket.save();
      }

      cart.products = failedProducts.map(productId => cart.products.find(item => item.product.toString() === productId.toString()));
      await cart.save();

      res.status(200).json({
        status: 'success',
        message: 'Compra completada',
        payload: {
          purchasedProducts,
          failedProducts,
          totalAmount
        }
      });
    } catch (error) {
      console.error('Error al finalizar la compra:', error);
      res.status(500).json({ status: 'error', message: 'Error al finalizar la compra' });
    }
  }
}

export default new CartController();