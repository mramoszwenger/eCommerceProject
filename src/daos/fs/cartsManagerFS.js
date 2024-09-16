class CartManager {
    constructor(path) {
        this.path = path
    }

    getCarts = async () => {
        try {
            const data = await fs.promises.readFile(this.path, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error al obtener los carritos:', error);
            return [];
        }
    }

    getCart = async (cid) => {
        try {
            const carts = await this.getCarts();
            const cart = carts.find(cart => cart.cid === cid);
            return cart || null;
        } catch (error) {
            console.error('Error al obtener el carrito:', error);
            return null;
        }
    }

    createCart = async () => {
        try {
            const carts = await this.getCarts();
            const cid = Math.floor(Math.random() * 1000); // Genera un ID aleatorio
            const newCart = { cid, products: [] };
            carts.push(newCart);
            await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
            return newCart;
        } catch (error) {
            console.error('Error al crear el carrito:', error);
            return null;
        }
    }

    addProductToCart = async (cid, product) => {
        try {
            const carts = await this.getCarts();
            const cartIndex = carts.findIndex(cart => cart.cid === cid);
            if (cartIndex === -1) {
                console.error('El carrito no existe');
                return null;
            }
            const cart = carts[cartIndex];
            const existingProductIndex = cart.products.findIndex(item => item.product === product.product);
            if (existingProductIndex !== -1) {
                cart.products[existingProductIndex].quantity += product.quantity;
            } else {
                cart.products.push(product);
            }
            carts[cartIndex] = cart;
            await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
            return cart;
        } catch (error) {
            console.error('Error al agregar producto al carrito:', error);
            return null;
        }
    }
}

export default CartManager