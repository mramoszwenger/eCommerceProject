import express from 'express';
import path from 'path';
import ProductController from '../controllers/productController.js';
import UserController from '../controllers/userController.js';
import CartController from '../controllers/cartController.js';
import MessageController from '../controllers/messageController.js';
import apiRoutes from './api/index.js';
import { isAuthenticated, isNotAuthenticated, setUserInLocals } from '../middlewares/auth.js';

const router = express.Router();

// Aplicar setUserInLocals a todas las rutas
router.use(setUserInLocals);

// Rutas de la API
router.use('/api', apiRoutes);

// Rutas de vistas
router.get('/', async (request, response) => {
  try {
    console.log('Fetching products for home page');
    const result = await ProductController.productManager.getAllProducts({}, { limit: 4, sort: { createdAt: -1 } });
    console.log('Result from getAllProducts:', result);

    let featuredProducts;
    if (result.docs && Array.isArray(result.docs)) {
      featuredProducts = result.docs.map(product => ({
        ...product,
        id: product._id.toString(),
        image: product.image || 'default-product.jpg'
      }));
    } else if (Array.isArray(result)) {
      featuredProducts = result.map(product => ({
        ...product,
        id: product._id.toString(),
        image: product.image || 'default-product.jpg'
      }));
    } else {
      console.error('Estructura de datos inesperada:', result);
      featuredProducts = [];
    }

    console.log('Featured products:', featuredProducts);

    response.render('home', {
      title: 'errezeta Shop',
      featuredProducts
    });
  } catch (error) {
    console.error('Error al cargar la página de inicio:', error);
    response.status(500).render('error', { error: 'Error al cargar la página de inicio' });
  }
});

router.get('/login', isNotAuthenticated, (request, response) => {
  response.render('login', { title: 'Iniciar Sesión' });
});

router.get('/register', isNotAuthenticated, (request, response) => {
  response.render('register', { title: 'Registro de Usuario' });
});

router.get('/products', ProductController.renderProductsPage);

router.get('/products/add', isAuthenticated, ProductController.renderAddProductForm);

router.get('/products/:pid', ProductController.renderProductDetail);

router.get('/profile', isAuthenticated, UserController.renderUserProfile);

router.get('/carts/:cid', isAuthenticated, CartController.renderCart);

router.get('/logout', isAuthenticated, (request, response) => {
  request.session.destroy((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
    }
    response.redirect('/login');
  });
});

router.get('/chat', isAuthenticated, (request, response) => {
  const userEmail = request.session.user.email;
  response.render('chat', { title: 'Chat', userEmail });
});

export default router;
