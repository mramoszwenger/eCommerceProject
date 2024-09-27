import { getUploadsPath } from '../utils/dirname.js';
import path from 'path';

class CartDTO {
  constructor(cart) {
    if (!cart) {
      throw new Error('Cart object is undefined or null');
    }

    this.id = cart._id || cart.id;
    this.products = (cart.products || []).map(item => {
      if (!item || !item.product) {
        console.warn('Invalid product item in cart:', item);
        return null;
      }
      return {
        product: {
          _id: item.product._id || item.product.id,
          title: item.product.title || 'Unknown Product',
          price: item.product.price || 0,
          image: item.product.image 
            ? path.join('/uploads/products', item.product.image)
            : '/uploads/products/default-product.jpg'
        },
        quantity: item.quantity || 0
      };
    }).filter(Boolean); // Elimina los elementos null

    this.user = cart.user;
    this.createdAt = cart.createdAt;
    this.updatedAt = cart.updatedAt;
  }
}

export default CartDTO;