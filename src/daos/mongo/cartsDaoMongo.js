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
            return await cartsModel.find({});
        } catch (error) {
            console.error('Error al obtener los carritos:', error);
            return [];
        }
    }

    getCart = async (cid) => {
        try {
            return await cartsModel.findOne({ _id: cid });
        } catch (error) {
            console.error('Error al obtener el carrito:', error);
            return null;
        }
    }

    createCart = async () => {
      try {
          const newCart = await cartsModel.create({ products: [] });
          return newCart;
      } catch (error) {
          console.error('Error al crear el carrito:', error);
          return null;
      }
    }
  

    addProductToCart = async (cid, product) => {
        try {
            const cart = await this.getCart(cid);
            if (!cart) {
                console.error('El carrito no existe');
                return null;
            }
            const existingProductIndex = cart.products.findIndex(item => item.product.equals(product.product));
            if (existingProductIndex !== -1) {
                cart.products[existingProductIndex].quantity += product.quantity;
            } else {
                cart.products.push(product);
            }
            await cart.save();
            return cart;
        } catch (error) {
            console.error('Error al agregar producto al carrito:', error);
            return null;
        }
    }

    removeProductFromCart = async (cid, pid) => {
        try {
          const cart = await this.getCart(cid);
          if (!cart) {
            console.error('El carrito no existe');
            return null;
          }
          cart.products = cart.products.filter(item => !item.product.equals(pid));
          await cart.save();
          return cart;
        } catch (error) {
          console.error('Error al eliminar producto del carrito:', error);
          return null;
        }
      }
    
      updateCart = async (cid, products) => {
        try {
          const cart = await this.getCart(cid);
          if (!cart) {
            console.error('El carrito no existe');
            return null;
          }
          cart.products = products;
          await cart.save();
          return cart;
        } catch (error) {
          console.error('Error al actualizar el carrito:', error);
          return null;
        }
      }
    
      updateProductQuantity = async (cid, pid, quantity) => {
        try {
          const cart = await this.getCart(cid);
          if (!cart) {
            console.error('El carrito no existe');
            return null;
          }
          const product = cart.products.find(item => item.product.equals(pid));
          if (!product) {
            console.error('El producto no existe en el carrito');
            return null;
          }
          product.quantity = quantity;
          await cart.save();
          return cart;
        } catch (error) {
          console.error('Error al actualizar la cantidad del producto en el carrito:', error);
          return null;
        }
      }
    
      clearCart = async (cid) => {
        try {
          const cart = await this.getCart(cid);
          if (!cart) {
            console.error('El carrito no existe');
            return null;
          }
          cart.products = [];
          await cart.save();
          return cart;
        } catch (error) {
          console.error('Error al vaciar el carrito:', error);
          return null;
        }
      }

      purchaseCart = async (cid, purchaserEmail) => {
        try {
            const cart = await this.getCart(cid);
            if (!cart) {
                console.error('Carrito no encontrado');
                return null;
            }

            let totalAmount = 0;
            const failedProducts = [];
            const purchasedProducts = [];

            for (const item of cart.products) {
                const product = await productModel.findById(item.product);
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
                    purchaser: purchaserEmail
                });
                await ticket.save();
            }

            cart.products = failedProducts.map(productId => cart.products.find(item => item.product.equals(productId)));
            await cart.save();

            return {
                message: 'Compra completada',
                failedProducts
            };
        } catch (error) {
            console.error('Error al finalizar la compra:', error);
            return null;
        }
    }
}

export default CartManager;