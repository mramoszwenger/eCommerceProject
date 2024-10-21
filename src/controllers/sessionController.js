import passport from 'passport';
import { daoFactory } from '../factories/factory.js';
import { config } from '../config/config.js';
import { Cart } from '../models/cartModel.js';
import { sendRegistrationEmail, sendPasswordResetEmail } from '../services/emailServices.js';
import crypto from 'crypto';

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

  forgotPassword = async (request, response) => {
    try {
      const { email } = request.body;
      const user = await this.userManager.findOne({ email });

      if (!user) {
        return response.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
      }

      const resetToken = crypto.randomBytes(20).toString('hex');
      
      await this.userManager.updateUser(user._id, {
        resetPasswordToken: resetToken,
        resetPasswordExpires: Date.now() + 3600000 // 1 hora
      });

      const resetUrl = `http://${request.headers.host}/reset-password/${resetToken}`;
      await sendPasswordResetEmail(user.email, resetUrl);

      response.status(200).json({ status: 'success', message: 'Correo de restablecimiento enviado' });
    } catch (error) {
      console.error('Error en forgotPassword:', error);
      response.status(500).json({ status: 'error', message: 'Error al procesar la solicitud' });
    }
  }

  renderResetPasswordForm = async (request, response) => {
    try {
      const { token } = request.params;
      const user = await this.userManager.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        return response.render('expiredToken', { token });
      }

      response.render('resetPassword', { token });
    } catch (error) {
      console.error('Error en renderResetPasswordForm:', error);
      response.status(500).render('error', { error: 'Error al cargar el formulario de restablecimiento' });
    }
  }

  resetPassword = async (request, response) => {
    try {
      const { token } = request.params;
      const { password, confirmPassword } = request.body;

      if (password !== confirmPassword) {
        return response.status(400).json({ status: 'error', message: 'Las contraseñas no coinciden' });
      }

      const user = await this.userManager.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        return response.status(400).json({ status: 'error', message: 'Token inválido o expirado' });
      }

      if (await user.comparePassword(password)) {
        return response.status(400).json({ status: 'error', message: 'No puedes usar la misma contraseña' });
      }

      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await this.userManager.updateOne({ _id: user._id }, user);

      response.status(200).json({ status: 'success', message: 'Contraseña restablecida con éxito' });
    } catch (error) {
      console.error('Error en resetPassword:', error);
      response.status(500).json({ status: 'error', message: 'Error al restablecer la contraseña' });
    }
  }
}

const sessionController = new SessionController();
await sessionController.initialize();
export default sessionController;
