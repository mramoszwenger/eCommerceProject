import { daoFactory } from '../factories/factory.js';
import { config } from '../config/config.js';
import { Cart } from '../models/cartModel.js';

class SessionController {
  constructor() {
    this.userManager = null;
  }

  async initialize() {
    const { UserDao } = await daoFactory.initializeDaos();
    this.userManager = UserDao;
  }

  login = async (request, response) => {
    try {
      const { email, password } = request.body;
      const user = await this.userManager.validateUser(email, password);
      if (user) {
        // Buscar o crear un carrito para el usuario
        let cart = await Cart.findOne({ user: user._id });
        if (!cart) {
          cart = await Cart.create({ user: user._id });
        }

        request.session.user = {
          id: user._id.toString(),
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email,
          role: user.role,
          cartId: cart._id.toString() // Añadir el cartId a la sesión
        };
        console.log('Session user establecido:', request.session.user);
        response.json({ status: 'success', message: 'Login successful', redirectUrl: '/profile' });
      } else {
        response.status(401).json({ status: 'error', message: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Error en el login:', error);
      response.status(500).json({ status: 'error', message: error.message });
    }
  }

  register = async (request, response) => {
    try {
      const { firstName, lastName, email, password, confirmPassword } = request.body;
      
      if (password !== confirmPassword) {
        return response.status(400).json({ status: 'error', message: 'Las contraseñas no coinciden' });
      }

      const newUser = await this.userManager.addUser({ firstName, lastName, email, password });
      
      // Crear un nuevo carrito para el usuario registrado
      const cart = await Cart.create({ user: newUser.id });

      request.session.user = {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
        cartId: cart._id.toString() // Añadir el cartId a la sesión
      };
      response.status(201).json({ status: 'success', message: 'Usuario registrado con éxito', redirectUrl: '/profile' });
    } catch (error) {
      console.error('Error en el registro:', error);
      response.status(400).json({ status: 'error', message: error.message });
    }
  }

  logout = (request, response) => {
    request.session.destroy((err) => {
      if (err) {
        console.error('Error al cerrar sesión:', err);
        return response.status(500).json({ status: 'error', message: 'Error al cerrar sesión' });
      }
      response.json({ status: 'success', message: 'Sesión cerrada exitosamente', redirectUrl: '/login' });
    });
  }

  getCurrentUser = (request, response) => {
    if (request.session.user) {
      response.json({ status: 'success', user: request.session.user });
    } else {
      response.status(401).json({ status: 'error', message: 'No hay usuario autenticado' });
    }
  }

  configuresponseession = (request, response, next) => {
    if (request.session) {
      request.session.cookie.maxAge = config.SESSION_DURATION || 3600000; // 1 hora por defecto
    }
    next();
  }
}

const sessionController = new SessionController();
await sessionController.initialize();
export default sessionController;
