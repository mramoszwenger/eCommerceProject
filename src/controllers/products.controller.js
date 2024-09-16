import ProductManagerMongo from '../daos/mongo/productsDaoMongo.js';
import {} from '../daos/mongo/models/products.model.js';
import { getServices, initializeServices } from '../services/service.js';

const productManager = new ProductManagerMongo();

class ProductController {
  constructor() {
    console.log('ProductController instantiated');
    this.service = null;
    this.initialize();
  }

  async initialize() {
    await initializeServices();
    const services = getServices();
    this.service = services.productService;
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

      const result = await productManager.getAllProducts(filters, options);
      if (!result?.docs) {
        return response.status(500).send('Error en los datos de productos');
      }

      const { docs, totalPages, hasPrevPage, hasNextPage, prevPage, nextPage } = result;

      response.render('index', {
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
    const pid = request.params.pid;
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
      const { title, description, category, price, stock, code } = request.body;

      if (!title || !description || !category || !price || isNaN(price) || !stock || isNaN(stock) || !code) {
        throw CustomError.createError({
          name: "Product creation error",
          cause: generateProductErrorInfo({ title, description, price, thumbnail, code, stock, category }),
          message: "Error Trying to create Product",
          code: EErrors.INVALID_TYPES_ERROR
        });
      }

      const newProduct = {
        title,
        description,
        category,
        price,
        stock,
        code,
        thumbnail: req.file ? `/static/products/${req.file.filename}` : '/static/products/default.png',
      };

      const userId = request.user._id;
      const userRole = request.user.role;

      if (!userId && userRole === 'admin') {
        const result = await this.service.addProduct(newProduct);
        response.status(201).send({ status: "Success: Producto agregado", payload: result });
        return;
      }

      const user = await userService.getUserById(userId);
      if (user) newProduct.owner = user._id;

      const result = await this.service.addProduct(newProduct);
      request.logger.info(`Producto agregado: ${newProduct.title}`);

      response.status(201).send({ status: "Success: Producto agregado", payload: result });
    } catch (error) {
      request.logger.error(`Error al agregar el producto: ${error.message}`);
      response.status(400).send({ error: 'Error al agregar el producto', details: error.message });
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
}

export default new ProductController();
