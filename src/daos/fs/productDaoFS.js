import fs from 'node:fs';
import { config } from '../../config/config.js';

class ProductManager {
  constructor() {
    this.path = config.PRODUCTS_FILE_PATH;
    this.products = [];
  }

  readFile = async () => {
    try {
      const data = await fs.promises.readFile(this.path, 'utf-8');
      return data.trim() ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error al leer el archivo:', error);
      return [];
    }
  }

  writeFile = async (data) => {
    try {
      await fs.promises.writeFile(this.path, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error al escribir el archivo:', error);
      throw error;
    }
  }

  getAllProducts = async ({ limit, page, sort, query }) => {
    try {
      this.products = await this.readFile();
      let filteredProducts = this.products;

      if (query && query.category) {
        filteredProducts = filteredProducts.filter(product => product.category.match(new RegExp(query.category, 'i')));
      }

      if (sort) {
        filteredProducts.sort((a, b) => sort.price * (a.price - b.price));
      }

      const start = (page - 1) * limit;
      const end = start + limit;
      return filteredProducts.slice(start, end);
    } catch (error) {
      console.error('Error al obtener los productos:', error);
      return [];
    }
  }

  getProductById = async (id) => {
    try {
      this.products = await this.readFile();
      const product = this.products.find(product => product.id === id);
      if (!product) {
        throw new Error('Producto no encontrado');
      }
      return product;
    } catch (error) {
      console.error('Error al obtener el producto:', error);
      throw error;
    }
  }

  addProduct = async (productData) => {
    try {
      const products = await this.readFile();

      const requiredFields = ['title', 'description', 'price', 'code', 'stock', 'category', 'user'];
      if (!requiredFields.every(field => field in productData && productData[field] !== '')) {
        throw new Error('Todos los campos son obligatorios excepto la imagen.');
      }

      if (products.some(product => product.code === productData.code)) {
        throw new Error('El código del producto ya existe.');
      }

      const newProduct = {
        id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
        ...productData,
        price: Number(productData.price),
        stock: Number(productData.stock),
        image: productData.image || config.DEFAULT_IMAGE_PATH,
        status: true
      };

      products.push(newProduct);
      await this.writeFile(products);

      return newProduct;
    } catch (error) {
      console.error('Error al agregar el producto:', error);
      throw error;
    }
  }

  updateProduct = async (id, productToUpdate) => {
    try {
      const products = await this.readFile();
      const index = products.findIndex(product => product.id === id);
      if (index === -1) {
        throw new Error('Producto no encontrado');
      }
      
      const { id: _, ...updateData } = productToUpdate;
      
      if ('price' in updateData) updateData.price = Number(updateData.price);
      if ('stock' in updateData) updateData.stock = Number(updateData.stock);

      products[index] = { ...products[index], ...updateData };
      await this.writeFile(products);
      return products[index];
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
      throw error;
    }
  }

  deleteProduct = async (id) => {
    try {
      const products = await this.readFile();
      const index = products.findIndex(product => product.id === id);
      if (index === -1) {
        throw new Error('Producto no encontrado');
      }
      const [deletedProduct] = products.splice(index, 1);
      await this.writeFile(products);
      return deletedProduct;
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
      throw error;
    }
  }
}

export default ProductManager;