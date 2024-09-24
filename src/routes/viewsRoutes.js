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

// Nueva ruta para la vista de productos con filtros y paginación
router.get('/products', ProductController.renderProductsPage);

// Ruta para mostrar el formulario de agregar producto (protegida)
router.get('/products/add', isAuthenticated, ProductController.renderAddProductForm);

// Nueva ruta para la vista de detalle de producto
router.get('/products/:pid', ProductController.renderProductDetail);

// Ruta para el perfil de usuario (protegida)
router.get('/profile', isAuthenticated, UserController.renderUserProfile);

// Nueva ruta para visualizar un carrito específico
router.get('/carts/:cid', isAuthenticated, CartController.renderCart);

// Ruta para cerrar sesión (protegida)
router.get('/logout', isAuthenticated, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
    }
    res.redirect('/login');
  });
});

router.get('/chat', isAuthenticated, (req, res) => {
  const userEmail = req.session.user.email;
  res.render('chat', { title: 'Chat', userEmail });
});

export default router;
