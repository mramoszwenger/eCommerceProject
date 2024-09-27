import { daoFactory } from '../factories/factory.js';
import { config } from '../config/config.js';
import path from 'path';
import { getIO } from '../services/websocket.js';
import ProductRepository from '../repositories/productRepository.js';

class ProductController {
  constructor() {
    this.productRepository = null;
    this.defaultImagePath = config.DEFAULT_IMAGE_PATH;
    this.uploadsPath = config.UPLOAD_PATH;
  }

  async initialize() {
    const { ProductDao } = await daoFactory.initializeDaos();
    this.productRepository = ProductRepository(ProductDao);
  }

  getAllProducts = async (request, response) => {
    console.log('getAllProducts called');
    try {
      const { limit = 10, page = 1, sort, query } = request.query;
      const filters = query ? { $or: [{ category: new RegExp(query, 'i') }, { availability: new RegExp(query, 'i') }] } : {};
      const options = {
        limit: parseInt(limit),
        page: parseInt(page),
        sort: sort ? { price: sort === 'asc' ? 1 : -1 } : {},
      };

      const result = await this.productRepository.getAllProducts(filters, options);
      if (!result?.docs) {
        return response.status(500).send('Error en los datos de productos');
      }

      const { docs, totalPages, hasPrevPage, hasNextPage, prevPage, nextPage } = result;

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
    try {
      const { pid } = request.params;
      const product = await this.productRepository.getProductById(pid);
      if (!product) {
        return response.status(404).json({ error: 'Producto no encontrado' });
      }
      response.json(product);
    } catch (error) {
      console.error('Error al obtener el producto:', error);
      response.status(500).json({ error: 'Error al obtener el producto' });
    }
  }

  addProduct = async (request, response) => {
    try {
      const productData = request.body;
      const userId = request.session.user.id;
      productData.user = userId;

      if (request.file) {
        productData.image = request.file.filename;
      }
      const newProduct = await this.productRepository.addProduct(productData);
      
      getIO().emit('productAdded', {
        ...newProduct,
        image: newProduct.image ? path.join(this.uploadsPath, newProduct.image) : this.defaultImagePath
      });

      response.status(201).json(newProduct);
    } catch (error) {
      console.error('Error al agregar el producto:', error);
      response.status(400).json({ error: error.message });
    }
  }

  updateProduct = async (request, response) => {
    try {
      const { pid } = request.params;
      const updateData = { ...request.body };

      if (request.file) {
        updateData.image = request.file.filename;
      }

      if (updateData.price) {
        updateData.price = Number(updateData.price);
        if (isNaN(updateData.price) || updateData.price <= 0) {
          return response.status(400).json({ error: 'El precio debe ser un número positivo' });
        }
      }

      if (updateData.stock) {
        updateData.stock = Number(updateData.stock);
        if (isNaN(updateData.stock) || updateData.stock < 0 || !Number.isInteger(updateData.stock)) {
          return response.status(400).json({ error: 'El stock debe ser un número entero no negativo' });
        }
      }

      const updatedProduct = await this.productRepository.updateProduct(pid, updateData);
      
      if (!updatedProduct) {
        return response.status(404).json({ error: 'Producto no encontrado' });
      }

      getIO().emit('productUpdated', {
        ...updatedProduct,
        image: updatedProduct.image ? path.join(this.uploadsPath, updatedProduct.image) : this.defaultImagePath
      });

      response.json(updatedProduct);
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
      response.status(500).json({ error: 'Error al actualizar el producto', details: error.message });
    }
  }

  deleteProduct = async (request, response) => {
    try {
      const { pid } = request.params;
      const deletedProduct = await this.productRepository.deleteProduct(pid);
      if (!deletedProduct) {
        return response.status(404).json({ error: 'Producto no encontrado' });
      }

      getIO().emit('productDeleted', pid);

      response.json({ message: 'Producto eliminado con éxito' });
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
      response.status(500).json({ error: 'Error al eliminar el producto' });
    }
  }

  renderProductsPage = async (request, response) => {
    console.log('renderProductsPage called');
    try {
      const { limit = 10, page = 1, sort, query } = request.query;
  
      let filters = {};
      if (query) {
        filters = {
          $or: [
            { category: new RegExp(query, 'i') },
            { title: new RegExp(query, 'i') },
            { description: new RegExp(query, 'i') }
          ]
        };
      }
  
      const options = {
        limit: parseInt(limit),
        page: parseInt(page),
        sort: sort ? { price: sort === 'asc' ? 1 : -1 } : {},
      };
  
      const result = await this.productRepository.getAllProducts(filters, options);
  
      if (!result?.docs) {
        return response.status(500).send('Error en los datos de productos');
      }
  
      const { docs, totalPages, hasPrevPage, hasNextPage, prevPage, nextPage } = result;
  
      const productsToRender = docs.map(product => ({
        ...product,
        image: product.image ? `/uploads/products/${product.image}` : 
               product.thumbnail ? product.thumbnail :
               this.defaultImagePath.replace(this.uploadsPath, '/uploads')
      }));
  
      response.render('products', {
        title: 'Nuestros Productos',
        products: productsToRender,
        totalPages,
        prevPage,
        nextPage,
        page: parseInt(page),
        hasPrevPage,
        hasNextPage,
        prevLink: hasPrevPage ? `/products?limit=${limit}&page=${prevPage}&sort=${sort}&query=${query}` : null,
        nextLink: hasNextPage ? `/products?limit=${limit}&page=${nextPage}&sort=${sort}&query=${query}` : null,
        limit: parseInt(limit),
        sort,
        query,
        cartId: request.session.user?.cartId
      });
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      response.status(500).render('error', { error: 'Error al obtener los productos' });
    }
  }

  renderProductDetail = async (request, response) => {
    try {
      const { pid } = request.params;
      const product = await this.productRepository.getProductById(pid);
      console.log('Producto obtenido:', product);

      if (!product) {
        return response.status(404).render('error', { error: 'Producto no encontrado' });
      }

      const imagePath = product.image ? `/uploads/products/${product.image}` : 
                        product.thumbnail ? product.thumbnail :
                        this.defaultImagePath.replace(this.uploadsPath, '/uploads');

      console.log('Ruta de la imagen:', imagePath);

      response.render('productDetail', { 
        title: product.title, 
        product: {
          ...product,
          image: imagePath
        },
        cartId: request.session.user?.cartId
      });
    } catch (error) {
      console.error('Error al obtener el producto:', error);
      response.status(500).render('error', { error: 'Error al cargar el producto' });
    }
  }

  renderAddProductForm = (request, response) => {
    response.render('addProduct', { title: 'Agregar Nuevo Producto' });
  }
}

const productController = new ProductController();
await productController.initialize();
export default productController;