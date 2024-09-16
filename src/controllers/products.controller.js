import ProductManagerMongo from '../daos/mongo/productsDaoMongo.js';

import {} from '../daos/mongo/models/products.model.js';
import { userModel } from '../daos/mongo/models/users.model.js';

import { productService } from '../services/service.js';

const productManager = new ProductManagerMongo();

class productController {

  constructor() {
    console.log('ProductController instantiated');
    this.service = productService
  }

  getAllProducts = async (request, response) => {
    console.log('getAllProducts called');
    try {
      const { limit = 10, page = 1, sort, query } = request.query;
      const filters = query ? { $or: [{ category: query }, { availability: query }] } : {};
      const options = {
        limit: parseInt(limit),
        page: parseInt(page),
        sort: sort ? { price: sort === 'asc' ? 1 : -1 } : {},
      };

      const result = await productManager.getProducts(filters, options);
      if (!result || !result.docs) {
        return response.status(500).send('Error en los datos de productos');
      }

      const { docs, totalDocs, totalPages, hasPrevPage, hasNextPage, prevPage, nextPage } = result;

      response.json({
        status: 'success',
        payload: docs,
        totalPages,
        prevPage,
        nextPage,
        page: options.page,
        hasPrevPage,
        hasNextPage,
        prevLink: hasPrevPage ? `/api/products?limit=${limit}&page=${prevPage}&sort=${sort}&query=${query}` : null,
        nextLink: hasNextPage ? `/api/products?limit=${limit}&page=${nextPage}&sort=${sort}&query=${query}` : null,
      });
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      response.status(500).send('Error al obtener los productos');
    }
  }

  getProductById = async (request, response) => {
    const pid = Number(request.params.pid);
    try {
      const product = await productManager.getProductById(pid);
      if (!product) {
        return response.status(404).send('Producto no encontrado');
      }
      response.json(product);
    } catch (error) {
      response.status(500).send('Error al obtener producto por ID');
    }
  }

  addProduct = async (request, response) => {
    try {
      const { email } = request.user;
      console.log('User email:', email);

      const user = await userModel.findOne({ email });
      console.log('Found user:', user);

      if (!user || (user.role !== 'premium' && user.role !== 'admin')) {
        console.log('Usurio no tiene permisos');
        return response.status(403).send('No tienes permiso para agregar productos.');
      }      

      const product = { ...request.body, owner: email };
      console.log('Product to add:', product);

      const newProduct = await productManager.addProduct(product);
      if (!newProduct) {
        console.log('Failed to add product');
        return response.status(400).send('Todos los campos son obligatorios.');
      }
      console.log('Product added:', newProduct);
      response.status(201).send(product);
    } catch (error) {
      console.error('Error en addProduct:', error);
      response.status(500).send('Error al agregar el producto');
    }
  }

  updateProduct = async (request, response) => {
    const pid = Number(request.params.pid);
    try {
      const { email, role } = request.user;
      const product = await productManager.getProductById(pid);
      if (!product) {
        return response.status(404).send('Producto no encontrado');
      }

      // Verificar que los usuarios 'premium' solo pueden actualizar sus propios productos
      if (role === 'premium' && product.owner !== email) {
        return response.status(403).send('No tienes permiso para actualizar este producto');
      }
      
      const updatedProduct = await productManager.updateProduct(pid, request.body);
      if (!updatedProduct) {
        return response.status(404).send('Producto no encontrado');
      }
      response.send(updatedProduct);
    } catch (error) {
      response.status(500).send('Error al actualizar el producto');
    }
  }

  deleteProduct = async (request, response) => {
    const pid = Number(request.params.pid);
    try {
      const { email, role } = request.user;
      const product = await productManager.getProductById(pid);

      if (!product) {
        return response.status(404).send('Producto no encontrado');
      }

      // Verificar que los usuarios 'premium' solo pueden eliminar sus propios productos
      if (role === 'premium' && product.owner !== email) {
        return response.status(403).send('No tienes permiso para eliminar este producto');
      }

      const deletedProduct = await productManager.deleteProduct(pid);
      if (!deletedProduct) {
        return response.status(404).send('Producto no encontrado');
      }
      response.send(deletedProduct);
    } catch (error) {
      response.status(500).send('Error al eliminar el producto');
    }
  }
};

export default new productController();