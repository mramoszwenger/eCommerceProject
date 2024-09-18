import { cartsModel } from './models/carts.model.js';
import { productModel } from './models/products.model.js';
import { v4 as uuidv4 } from 'uuid';
import Ticket from './models/tickets.model.js';

class CartManager {
    constructor() {
      this.cartsModel = cartsModel;
    }

    getCarts = async () => {
        try {
            return await this.cartsModel.find({}).lean();
        } catch (error) {
            console.error('Error al obtener los carritos:', error);
            throw error;
        }
    }

    getCart = async (cid) => {
        try {
            const cart = await this.cartsModel.findById(cid).populate('products.product').lean();
            if (!cart) {
                console.log('Carrito no encontrado:', cid);
                return null;
            }
            return cart;
        } catch (error) {
            console.error('Error al obtener el carrito:', error);
            throw error;
        }
    }

    createCart = async () => {
      try {
          const newCart = await this.cartsModel.create({ products: [] });
          return newCart.toObject();
      } catch (error) {
          console.error('Error al crear el carrito:', error);
          throw error;
      }
    }
  

    addProductToCart = async (cid, productData) => {
        try {
            const cart = await this.cartsModel.findById(cid);
            if (!cart) {
                console.log('Carrito no encontrado:', cid);
                return null;
            }
            const existingProductIndex = cart.products.findIndex(item => item.product.toString() === productData.product);
            if (existingProductIndex !== -1) {
                cart.products[existingProductIndex].quantity += productData.quantity;
            } else {
                cart.products.push(productData);
            }
            await cart.save();
            return cart.toObject();
        } catch (error) {
            console.error('Error al agregar producto al carrito:', error);
            throw error;
        }
    }

    removeProductFromCart = async (cid, pid) => {
        try {
          const cart = await this.cartsModel.findById(cid);
          if (!cart) {
            console.log('Carrito no encontrado:', cid);
            return null;
          }
          cart.products = cart.products.filter(item => item.product.toString() !== pid);
          await cart.save();
          return cart.toObject();
        } catch (error) {
          console.error('Error al eliminar producto del carrito:', error);
          throw error;
        }
      }
    
      updateCart = async (cid, products) => {
        try {
          const cart = await this.cartsModel.findById(cid);
          if (!cart) {
            console.log('Carrito no encontrado:', cid);
            return null;
          }
          cart.products = products;
          await cart.save();
          return cart.toObject();
        } catch (error) {
          console.error('Error al actualizar el carrito:', error);
          throw error;
        }
      }
    
      updateProductQuantity = async (cid, pid, quantity) => {
        try {
          const cart = await this.cartsModel.findById(cid);
          if (!cart) {
            console.log('Carrito no encontrado:', cid);
            return null;
          }
          const productIndex = cart.products.findIndex(item => item.product.toString() === pid);
          if (productIndex === -1) {
            console.log('Producto no encontrado en el carrito:', pid);
            return null;
          }
          cart.products[productIndex].quantity = quantity;
          await cart.save();
          return cart.toObject();
        } catch (error) {
          console.error('Error al actualizar la cantidad del producto en el carrito:', error);
          throw error;
        }
      }
    
      clearCart = async (cid) => {
        try {
          const cart = await this.cartsModel.findById(cid);
          if (!cart) {
            console.log('Carrito no encontrado:', cid);
            return null;
          }
          cart.products = [];
          await cart.save();
          return cart.toObject();
        } catch (error) {
          console.error('Error al vaciar el carrito:', error);
          throw error;
        }
      }

      purchaseCart = async (cid, purchaserEmail) => {
        try {
            const cart = await this.cartsModel.findById(cid).populate('products.product');
            if (!cart) {
                console.log('Carrito no encontrado:', cid);
                return null;
            }

            let totalAmount = 0;
            const failedProducts = [];
            const purchasedProducts = [];

            for (const item of cart.products) {
                const product = item.product;
                if (product.stock >= item.quantity) {
                    product.stock -= item.quantity;
                    totalAmount += product.price * item.quantity;
                    purchasedProducts.push(item);
                    await product.save();
                } else {
                    failedProducts.push(item.product._id);
                }
            }

            let ticket = null;
            if (purchasedProducts.length > 0) {
                ticket = await Ticket.create({
                    code: uuidv4(),
                    purchase_datetime: new Date(),
                    amount: totalAmount,
                    purchaser: purchaserEmail
                });
            }

            cart.products = cart.products.filter(item => failedProducts.includes(item.product._id));
            await cart.save();

            return {
                success: purchasedProducts.length > 0,
                ticket: ticket ? ticket.toObject() : null,
                purchasedProducts: purchasedProducts.map(item => ({
                    product: item.product._id,
                    quantity: item.quantity
                })),
                failedProducts: failedProducts
            };
        } catch (error) {
            console.error('Error al finalizar la compra:', error);
            throw error;
        }
    }
}

export default CartManager;