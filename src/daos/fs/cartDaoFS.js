import fs from 'node:fs';
import { config } from '../../config/config.js';

class CartManager {
    constructor() {
        this.path = config.CARTS_FILE_PATH;
    }

    getCarts = async () => {
        try {
            if (!fs.existsSync(this.path)) {
                await fs.promises.writeFile(this.path, '[]');
                return [];
            }
            const data = await fs.promises.readFile(this.path, 'utf-8');
            return data.trim() ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error al obtener los carritos:', error);
            return [];
        }
    }

    getCartById = async (cid) => {
        try {
            const carts = await this.getCarts();
            return carts.find(cart => cart.cid === cid) || null;
        } catch (error) {
            console.error('Error al obtener el carrito:', error);
            return null;
        }
    }

    createCart = async (cartData) => {
        try {
            const carts = await this.getCarts();
            const cid = Date.now().toString();
            const newCart = { 
                cid, 
                products: [], 
                user: cartData.user,
                status: 'active',
                createdAt: new Date()
            };
            carts.push(newCart);
            await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
            return newCart;
        } catch (error) {
            console.error('Error al crear el carrito:', error);
            return null;
        }
    }

    addProductToCart = async (cid, productId, quantity = 1) => {
        try {
            const carts = await this.getCarts();
            const cartIndex = carts.findIndex(cart => cart.cid === cid);
            if (cartIndex === -1) {
                throw new Error('Carrito no encontrado');
            }
            const cart = carts[cartIndex];
            const existingProductIndex = cart.products.findIndex(item => item.product === productId);
            if (existingProductIndex !== -1) {
                cart.products[existingProductIndex].quantity += quantity;
            } else {
                cart.products.push({ product: productId, quantity });
            }
            await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
            return cart;
        } catch (error) {
            console.error('Error al agregar producto al carrito:', error);
            throw error;
        }
    }

    getActiveCartByUserId = async (userId) => {
        try {
            const carts = await this.getCarts();
            return carts
                .filter(cart => cart.user === userId && cart.status === 'active')
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;
        } catch (error) {
            console.error('Error al obtener el carrito activo del usuario:', error);
            return null;
        }
    }
}

export default CartManager;