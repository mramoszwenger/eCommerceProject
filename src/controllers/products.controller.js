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
    try {
      await initializeServices();
      const services = getServices();
      this.service = services.productService;
      console.log('ProductController initialized with service:', this.service);
    } catch (error) {
      console.error('Error initializing ProductController:', error);
    }
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
      console.log('Iniciando addProduct en el controlador');
      console.log('Usuario autenticado:', request.user);
      console.log('Datos del producto recibidos:', request.body);

      const { title, description, category, price, stock, code } = request.body;

      if (!title || !description || !category || !price || isNaN(price) || !stock || isNaN(stock) || !code) {
        return response.status(400).json({ error: 'Datos del producto inválidos o incompletos' });
      }

      const newProduct = {
        title,
        description,
        category,
        price: Number(price),
        stock: Number(stock),
        code,
        thumbnail: request.file ? `/static/products/${request.file.filename}` : '/static/products/default.png',
      };

      const userId = request.user._id;
      const userRole = request.user.role;

      console.log('ID de usuario:', userId);
      console.log('Rol de usuario:', userRole);

      if (userRole !== 'admin' && userRole !== 'premium') {
        return response.status(403).json({ error: 'No tienes permisos para crear productos' });
      }

      newProduct.owner = userId;
      const result = await this.service.addProduct(newProduct);
      console.log('Producto creado:', result);
      response.status(201).json({ status: "Success", message: "Producto agregado", payload: result });

    } catch (error) {
      console.error('Error al agregar el producto:', error);
      response.status(500).json({ error: 'Error al agregar el producto', message: error.message });
    }
  }

  updateProduct = async (request, response) => {
    const pid = request.params.pid;
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
      console.error('Error al actualizar el producto:', error);
      response.status(500).json({ error: 'Error al actualizar el producto', message: error.message });
    }
  }

  deleteProduct = async (request, response) => {
    const pid = request.params.pid;
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
      console.error('Error al eliminar el producto:', error);
      response.status(500).json({ error: 'Error al eliminar el producto', message: error.message });
    }
  }

  renderAddProductForm = async (req, res) => {
    try {
      res.render('products/add', {
        title: 'Añadir Nuevo Producto',
        user: req.user // Asumiendo que tienes información del usuario en req.user
      });
    } catch (error) {
      console.error('Error al renderizar el formulario de añadir producto:', error);
      res.status(500).render('error', { message: 'Error al cargar el formulario' });
    }
  }

  renderEditProductForm = async (req, res) => {
    try {
      const { pid } = req.params;
      const product = await productService.getProductById(pid);
      
      if (!product) {
        return res.status(404).render('error', { message: 'Producto no encontrado' });
      }

      res.render('products/edit', {
        title: 'Editar Producto',
        product,
        user: req.user
      });
    } catch (error) {
      console.error('Error al renderizar el formulario de editar producto:', error);
      res.status(500).render('error', { message: 'Error al cargar el formulario' });
    }
  }
}

export default new ProductController();
