import UserManagerMongo from '../daos/mongo/usersDaoMongo.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/config.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const userManager = new UserManagerMongo();

class SessionsController {
  registerUser = async (request, response) => {
    const { first_name, last_name, age, email, password } = request.body;

    try {
      const user = await userManager.createUser({ first_name, last_name, age, email, password });
      response.json({ status: 'success', message: 'Usuario registrado', user });
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      response.status(500).json({ status: 'error', message: error.message });
    }
  }

  loginUser = async (request, response) => {
    const { email, password } = request.body;

    console.log('Login attempt with email:', email, 'and password:', password);

    try {
      const user = await userManager.authenticateUser(email, password);

      console.log('Authenticated user:', user);

      if (!user) {
        response.status(401).json({ status: 'error', message: 'Las credenciales son incorrectas' });
      } else {
        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

        console.log('Generated JWT:', token);

        response.cookie('jwt', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax' });

        console.log('Cookie set with token');

        response.json({ status: 'success', message: 'Usuario logueado', token });
      }
    } catch (error) {
      console.error('Error in loginUser:', error);
      response.status(500).json({ status: 'error', message: error.message });
    }
  }

  resetPassword = async (request, response) => {
    const { token } = request.params;
    const { newPassword } = request.body;

    try {
      const user = await userManager.getUserBy({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        return response.status(400).send('El token de recuperación de contraseña es inválido o ha expirado');
      }

      if (await userManager.comparePassword(newPassword, user.password)) {
        return response.status(400).send('La nueva contraseña no puede ser igual a la anterior');
      }

      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await userManager.updateUser(user._id, user);

      response.send('Contraseña restablecida correctamente');
    } catch (error) {
      response.status(500).send('Error al restablecer la contraseña');
    }
  }

  // Otros métodos aquí, como uploadDocuments, getAllUsers, getUserById, updateUser, etc.
}

export default new SessionsController();
