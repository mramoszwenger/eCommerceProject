import { Cart } from '../../models/cartModel.js';
import mongoose from 'mongoose';

class CartDaoMongo {
  getCarts = async () => {
    return await Cart.find().populate('products.product');
  }

  getCart = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('ID de carrito inválido');
    }
    return await Cart.findById(id).populate('products.product');
  }

  getCartsByUserId = async (userId) => {
    return await Cart.find({ user: userId }).populate('products.product');
  }

  createCart = async (cartData) => {
    const newCart = new Cart(cartData);
    return await newCart.save();
  }

  addProductToCart = async (cartId, productId, quantity = 1) => {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error('Carrito no encontrado');
  
    // Convertir quantity a número
    quantity = parseInt(quantity, 10);
  
    const productIndex = cart.products.findIndex(p => p.product.toString() === productId);
  
    if (productIndex > -1) {
      // Reemplazar la cantidad existente con la nueva cantidad
      cart.products[productIndex].quantity = quantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }
  
    return await cart.save();
  }

  removeProductFromCart = async (cartId, productId) => {
    console.log(`Intentando eliminar producto ${productId} del carrito ${cartId}`);
    
    const result = await Cart.findByIdAndUpdate(
      cartId,
      { $pull: { products: { product: productId } } },
      { new: true }
    ).populate('products.product');
  
    if (!result) {
      throw new Error('Carrito no encontrado');
    }
  
    console.log('Carrito actualizado:', result);
    return result;
  }

  updateCart = async (cartId, products) => {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error('Carrito no encontrado');

    cart.products = products;
    return await cart.save();
  }

  updateProductQuantity = async (cartId, productId, quantity, isAdjustment = false) => {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error('Carrito no encontrado');
  
    // Convertir quantity a número
    quantity = parseInt(quantity, 10);
  
    const productIndex = cart.products.findIndex(p => p.product.toString() === productId);
  
    if (productIndex > -1) {
      if (isAdjustment) {
        // Ajustar la cantidad existente
        cart.products[productIndex].quantity += quantity;
      } else {
        // Reemplazar la cantidad existente
        cart.products[productIndex].quantity = quantity;
      }
      // Asegurarse de que la cantidad no sea negativa
      if (cart.products[productIndex].quantity < 0) {
        cart.products[productIndex].quantity = 0;
      }
    } else if (quantity > 0) {
      // Si el producto no existe y la cantidad es positiva, agregarlo
      cart.products.push({ product: productId, quantity });
    }
  
    return await cart.save();
  }

  clearCart = async (cartId) => {
    console.log(`Vaciando carrito: ${cartId}`);
    const cart = await Cart.findByIdAndUpdate(
      cartId,
      { $set: { products: [] } },
      { new: true }
    );
  
    if (!cart) {
      console.log('Carrito no encontrado');
      throw new Error('Carrito no encontrado');
    }
  
    console.log('Carrito vaciado:', cart);
    return cart;
  }
}

export default CartDaoMongo;
