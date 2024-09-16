import fs from 'node:fs';

class ProductManager {
    constructor(path) {
        this.path = path;
        this.products = [];
        this.productIdCounter = 1;
    }

    init = async () => {
        try {
            const dataJson = await fs.promises.readFile(this.path, 'utf-8');
            this.products = dataJson.trim() ? JSON.parse(dataJson) : [];
            this.productIdCounter = this.products.length > 0 ? Math.max(...this.products.map(product => product.pid)) + 1 : 1;
            this.initialized = true;
        } catch (error) {
            console.error('Error al inicializar:', error);
        }
    }

    readFile = async () => {
        try {
            const dataJson = await fs.promises.readFile(this.path, 'utf-8');
            return JSON.parse(dataJson);
        } catch(error) {
            console.error('Error al leer el archivo:', error);
            return [];
        }
    }

    addProduct = async (product) => {
        
        // Validar que todos los campos sean obligatorios
        const requiredFields = ['title', 'description', 'price', 'thumbnail', 'code', 'stock'];
        const allFields = requiredFields.every(field => product.hasOwnProperty(field) && (product[field] !== undefined && product[field] !== ''));
        if (!allFields) {
            console.error('Todos los campos son obligatorios.');
        }

        // Validar que no se repita el campo "code"
        const uniqueCode = this.products.every(existingProduct => existingProduct.code !== product.code);
        if (!uniqueCode) {
            console.error('El código del producto ya existe.');
        }

        // Asignar un id autoincrementable al producto y agregarlo
        product.pid = this.productIdCounter++;
        this.products.push(product);
        console.log('Producto agregado:', product);

        try {
            await fs.promises.writeFile(this.path, JSON.stringify(this.products, null, '\t'), 'utf-8');
        } catch(error) {
            console.error('Error al agregar el producto:', error);
        }
        return this.products;

    }

    getProducts = async () => {
        return this.products;
    }

    getProductById = async (pid) => {
        const product = this.products.find(product => product.pid === pid);
        if (!product) {
            return 'Producto no encontrado';
        }
        return product;
    }

    updateProduct = async (pid, productToUpdate) => {
        const findProduct = this.products.findIndex(product => product.pid === pid);
        if (findProduct === -1) {
            console.log('Producto no encontrado');
            return null;
        }
        this.products[findProduct] = { ...this.products[findProduct], ...productToUpdate }
        await fs.promises.writeFile(this.path, JSON.stringify(this.products, null, '\t'), 'utf-8');
        return this.products[findProduct];
    }

    deleteProduct = async (pid) => {
        const findProduct = this.products.findIndex(product => product.pid === pid);
        if (findProduct === -1) {
            console.error('Error: Producto no encontrado');
        }
        const deletedProduct = this.products.splice(findProduct, 1)[0];
        fs.writeFile(this.path, JSON.stringify(this.products, null, '\t'), 'utf-8');
            return deletedProduct;
    }
}

export default ProductManager