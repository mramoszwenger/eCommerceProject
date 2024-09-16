import CartManager from '../daos/mongo/cartsDaoMongo.js';
import ProductManager from '../daos/mongo/productsDaoMongo.js';
import { v4 as uuidv4 } from 'uuid';
import Ticket from '../daos/mongo/models/tickets.model.js';

const cartManager = new CartManager();
const productManager = new ProductManager();

class CartController {
  getCart = async (request, response) => {
    try {
      const { cid } = request.params;
      const cart = await cartManager.getCart(cid);
      if (!cart) {
        return response.status(404).send('Carrito no encontrado');
      }
      response.json(cart);
    } catch (error) {
      response.status(500).send('Error al obtener el carrito');
    }
  }

  createCart = async (request, response) => {
    try {
      const newCart = await cartManager.createCart();
      response.json(newCart);
    } catch (error) {
      response.status(500).send('Error al crear el carrito');
    }
  }

  addProductToCart = async (request, response) => {
    try {
      const { cid, pid } = request.params;
      const { quantity } = request.body;
      const cart = await cartManager.addProductToCart(cid, { product: pid, quantity: quantity || 1 });
      if (!cart) {
        return response.status(404).send('Carrito no encontrado');
      }
      response.json(cart);
    } catch (error) {
      response.status(500).send('Error al agregar producto al carrito');
    }
  }

  removeProductFromCart = async (request, response) => {
    try {
      const { cid, pid } = request.params;
      const updatedCart = await cartManager.removeProduct(cid, pid);
      if (!updatedCart) {
        return response.status(404).send('Carrito no encontrado');
      }
      response.json(cart);
    } catch (error) {
      response.status(500).send('Error al eliminar el producto del carrito');
    }
  }

  updateCart = async (request, response) => {
    try {
      const { cid } = request.params;
      const { products } = request.body;
      const updatedCart = await cartManager.updateCart(cid, products);
      if (!updatedCart) {
        return response.status(404).send('Carrito no encontrado');
      }
      response.json(updatedCart);
    } catch (error) {
      response.status(500).send('Error al actualizar el carrito');
    }
  }

  updateProductQuantity = async (request, response) => {
    try {
      const { cid, pid } = request.params;
      const { quantity } = request.body;
      const updatedCart = await cartManager.updateProductQuantity(cid, pid, quantity);
      if (!updatedCart) {
        return response.status(404).send('Carrito no encontrado');
      }
      response.json(updatedCart);
    } catch (error) {
      response.status(500).send('Error al actualizar la cantidad del producto en el carrito');
    }
  }

  clearCart = async (request, response) => {
    try {
      const { cid } = request.params;
      const clearedCart = await cartManager.clearAllProducts(cid);
      if (!clearedCart) {
        return response.status(404).send('Carrito no encontrado');
      }
      response.json(clearedCart);
    } catch (error) {
      response.status(500).send('Error al vaciar el carrito');
    }
  }

  purchaseCart = async (request, response) => {
    try {
      const { cid } = request.params;
      const cart = await cartManager.getCart(cid);
      if (!cart) {
        return response.status(404).send('Carrito no encontrado');
      }

      let totalAmount = 0;
      const failedProducts = [];
      const purchasedProducts = [];

      for (const item of cart.products) {
        const product = await productManager.getProductById(item.product);
        if (product.stock >= item.quantity) {
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
          purchaser: request.user.email
        });
        await ticket.save();
      }

      cart.products = failedProducts.map(productId => cart.products.find(item => item.product === productId));
      await cart.save();

      response.status(200).send({
        message: 'Compra completada',
        failedProducts
      });
    } catch (error) {
      response.status(500).send('Error al finalizar la compra');
    }
  }
};

export default new CartController();