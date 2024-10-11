import passport from 'passport';
import { daoFactory } from '../factories/factory.js';
import { config } from '../config/config.js';
import { Cart } from '../models/cartModel.js';
import { sendRegistrationEmail } from '../services/emailServices.js';

class SessionController {
  constructor() {
    this.userManager = null;
  }

  async initialize() {
    const { UserDao } = await daoFactory.initializeDaos();
    this.userManager = UserDao;
  }

  login = (request, response, next) => {
    passport.authenticate('local-login', (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return response.status(401).json({ status: 'error', message: info.message });
      }
      request.logIn(user, async (err) => {
        if (err) {
          return next(err);
        }
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
          cartId: cart._id.toString()
        };
        return response.json({ status: 'success', message: 'Login successful', redirectUrl: '/profile' });
      });
    })(request, response, next);
  }

  register = (request, response, next) => {
    passport.authenticate('local-register', async (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return response.status(400).json({ status: 'error', message: info.message });
      }
      request.logIn(user, async (err) => {
        if (err) {
          return next(err);
        }
        const cart = await Cart.create({ user: user._id });
        request.session.user = {
          id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          cartId: cart._id.toString()
        };

        // Enviar correo de registro
        try {
          await sendRegistrationEmail(user.email, user.firstName);
          console.log('Correo de registro enviado con éxito');
        } catch (emailError) {
          console.error('Error al enviar correo de registro:', emailError);
        }

        return response.status(201).json({ status: 'success', message: 'Usuario registrado con éxito', redirectUrl: '/profile' });
      });
    })(request, response, next);
  }

  logout = (request, response) => {
    request.logout((err) => {
      if (err) {
        console.error('Error al cerrar sesión:', err);
        return response.status(500).json({ status: 'error', message: 'Error al cerrar sesión' });
      }
      request.session.destroy((err) => {
        if (err) {
          console.error('Error al destruir la sesión:', err);
        }
        response.json({ status: 'success', message: 'Sesión cerrada exitosamente', redirectUrl: '/login' });
      });
    });
  }

  getCurrentUser = (request, response) => {
    if (request.user) {
      response.json({ status: 'success', user: request.user });
    } else {
      response.status(401).json({ status: 'error', message: 'No hay usuario autenticado' });
    }
  }

  configureSession = (request, response, next) => {
    if (request.session) {
      request.session.cookie.maxAge = config.SESSION_DURATION || 3600000; // 1 hora por defecto
    }
    next();
  }

  githubAuth = passport.authenticate('github', { scope: ['user:email'] });

  githubAuthCallback = (request, response, next) => {
    passport.authenticate('github', async (err, user) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return response.redirect('/login');
      }
      request.logIn(user, async (err) => {
        if (err) {
          return next(err);
        }
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
          cartId: cart._id.toString()
        };
        return response.redirect('/profile');
      });
    })(request, response, next);
  }
}

const sessionController = new SessionController();
await sessionController.initialize();
export default sessionController;
