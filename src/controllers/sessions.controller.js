import UserManagerMongo from '../daos/mongo/usersDaoMongo.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/config.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const userManager = new UserManagerMongo();

class SessionsController {
  registerUser = async (req, res) => {
    const { first_name, last_name, age, email, password } = req.body;

    try {
      const user = await userManager.createUser({ first_name, last_name, age, email, password });
      res.json({ status: 'success', message: 'Usuario registrado', user });
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await userManager.authenticateUser(email, password);

      if (!user) {
        return res.status(401).json({ status: 'error', message: 'Credenciales incorrectas' });
      }

      const token = this.generateTokenForUser(user);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict', // Cambiado de 'Lax' a 'strict' para mayor seguridad
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
      });

      console.log('Token generado y enviado en cookie:', token);

      res.json({ 
        status: 'success', 
        message: 'Login exitoso', 
        user: { 
          id: user._id, 
          email: user.email, 
          role: user.role 
        }
      });
    } catch (error) {
      console.error('Error en loginUser:', error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  generateTokenForUser = (user) => {
    return jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  githubCallback = (req, res) => {
    const token = this.generateTokenForUser(req.user);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    });
    res.redirect('/');
  }

  getCurrentUser = (req, res) => {
    res.json({ user: req.user });
  }

  sendPasswordResetEmail = async (req, res) => {
    const { email } = req.body;
    try {
      const user = await userManager.getUserBy({ email });
      if (!user) {
        return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
      }

      const resetToken = crypto.randomBytes(20).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
      await userManager.updateUser(user._id, user);

      // Aquí deberías implementar el envío del email con el token
      // Por ahora, solo devolveremos el token en la respuesta
      res.json({ status: 'success', message: 'Email de recuperación enviado', resetToken });
    } catch (error) {
      console.error('Error al enviar email de recuperación:', error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  renderResetPasswordForm = (req, res) => {
    const { token } = req.params;
    res.render('reset-password', { token });
  }

  resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
      const user = await userManager.getUserBy({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({ status: 'error', message: 'El token de recuperación de contraseña es inválido o ha expirado' });
      }

      if (await userManager.comparePassword(newPassword, user.password)) {
        return res.status(400).json({ status: 'error', message: 'La nueva contraseña no puede ser igual a la anterior' });
      }

      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await userManager.updateUser(user._id, user);

      res.json({ status: 'success', message: 'Contraseña restablecida correctamente' });
    } catch (error) {
      console.error('Error al restablecer la contraseña:', error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  logoutUser = (req, res) => {
    res.clearCookie('token');
    res.json({ status: 'success', message: 'Sesión cerrada correctamente' });
  }

  checkSession = (req, res) => {
    if (req.user) {
      res.json({
        status: 'success',
        user: {
          id: req.user.id,
          email: req.user.email,
          role: req.user.role
        }
      });
    } else {
      res.status(401).json({ status: 'error', message: 'No hay sesión activa' });
    }
  }
}

export default new SessionsController();

