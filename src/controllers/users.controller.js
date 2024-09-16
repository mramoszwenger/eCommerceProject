import UserManagerMongo from '../daos/mongo/usersDaoMongo.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/config.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const userManager = new UserManagerMongo();

class UserController {
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

      // Comprobar si el usuario se autenticado correctamente
      console.log('Authenticated user:', user);

      if (!user) {
        response.status(401).json({ status: 'error', message: 'Las credenciales son incorrectas' });
      } else {
      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

      // Mostrar el token generado
      console.log('Generated JWT:', token);

      response.cookie('jwt', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax' });

      // Verificar si la cookie se está configurando correctamente
      console.log('Cookie set with token');

      response.json({ status: 'success', message: 'Usuario loguedo', token });
      }
    } catch (error) {
      console.error('Error in loginUser:', error);
      response.status(500).json({ status: 'error', message: error.message });
    }
  }

  getUserById = async (request, response) => {
    const { uid } = request.params;

    try {
      const user = await userManager.getUserBy({ _id: uid });
      if (!user) {
        response.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
      } else {
        response.json({ status: 'success', user });
      }
    } catch (error) {
      response.status(500).json({ status: 'error', message: error.message });
    }
  }

  getAllUsers = async (request, response) => {

    try {
      const users = await userManager.getAllUsers();

      const filteredUsers = users.map(user => ({
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        role: user.role
      }));

      response.json({ status: 'success', filteredUsers });
    } catch (error) {
      response.status(500).json({ status: 'error', message: error.message });
    }
  }

  updateUser = async (request, response) => {
    const { uid } = request.params;
    const userUpdates = request.body;

    try {
      const user = await userManager.updateUser(uid, userUpdates);
      if (!user) {
        response.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
      } else {
        response.json({ status: 'success', message: 'Usuario actualizado', user });
      }
    } catch (error) {
      response.status(500).json({ status: 'error', message: error.message });
    }
  }

  // Método para subir documentos y actualizar el estado del usuario
  uploadDocuments = async (request, response) => {
    const { uid } = request.params;
  
    try {
      const user = await userManager.getUserBy({ _id: uid });
      if (!user) {
        return response.status(404).json({ message: 'Usuario no encontrado' });
      }
  
      if (!request.files || request.files.length === 0) {
        return response.status(400).json({ message: 'No se subieron archivos' });
      }
  
      const uploadedDocuments = request.files.map(file => ({
        name: file.originalname,
        reference: `/uploads/${file.filename}`
      }));
  
      user.documents = [...user.documents, ...uploadedDocuments];
      await userManager.updateUser(user._id, { documents: user.documents });
  
      response.status(200).json({ message: 'Documentos subidos exitosamente', documents: user.documents });
    } catch (error) {
      response.status(500).json({ message: 'Error al subir los documentos', error: error.message });
    }
  }

  changeUserRoleToPremium = async (request, response) => {
    const { uid } = request.params;

    try {
      const user = await userManager.getUserBy({ _id: uid });
      if (!user) {
        return response.status(404).json({ message: 'Usuario no encontrado' });
      }
   
      if (user.role === 'user' && request.body.role === 'premium') {
        // Verificar que el usuario haya subido los documentos requeridos
        const requiredDocuments = ['Identificación', 'Comprobante de domicilio', 'Comprobante de estado de cuenta'];
        const userDocuments = user.documents.map(doc => doc.name);

        const missingDocuments = requiredDocuments.filter(doc => !userDocuments.includes(doc));

        if (missingDocuments.length > 0) {
          return response.status(400).json({
            status: 'error',
            message: 'Faltan documentos requeridos para la actualización a premium',
            missingDocuments,
          });
        }

        user.role = 'premium';
      } else if (user.role === 'premium' && request.body.role === 'user') {
        user.role = 'user';
      } else {
        return response.status(400).json({
          status: 'error',
          message: 'No se puede cambiar el rol al mismo o no válido',
        });
      }

      await userManager.updateUser(uid, { role: user.role });

      response.json({
        status: 'success',
        message: `Rol cambiado a ${user.role}`,
        user
      });
    } catch (error) {
      response.status(500).json({ message: 'Error al cambiar el rol del usuario', error: error.message });
    }
  }

  deleteUser = async (request, response) => {
    const { uid } = request.params;

    try {
      const result = await userManager.deleteUser(uid);
      if (!result) {
        response.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
      } else {
        response.json({ status: 'success', message: 'Usuario eliminado' });
      }
    } catch (error) {
      response.status(500).json({ status: 'error', message: error.message });
    }
  }

  // Eliminar usuarios inactivos por más de 30 minutos
  deleteInactiveUsers = async (request, response) => {
    const THIRTY_MINUTES_AGO = new Date(Date.now() - 30 * 60 * 1000); // 30 minutos

    try {
      const inactiveUsers = await userManager.getUsersInactiveSince(THIRTY_MINUTES_AGO);

      if (inactiveUsers.length === 0) {
        return response.json({ status: 'success', message: 'No hay usuarios inactivos para eliminar' });
      }
      
      // Enviar correos de notificación y eliminar usuarios
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const deletePromises = inactiveUsers.map(async (user) => {
        const mailOptions = {
          to: user.email,
          from: process.env.EMAIL_USERNAME,
          subject: 'Cuenta eliminada por inactividad',
          text: `Hola ${user.first_name}, tu cuenta ha sido eliminada por inactividad.`,
        };

        await transporter.sendMail(mailOptions);
        return userManager.deleteUser(user._id);
      });

      await Promise.all(deletePromises);

      response.json({ status: 'success', message: 'Usuarios inactivos eliminados y correos enviados' });
    } catch (error) {
      response.status(500).json({ status: 'error', message: error.message });
    }
  }

  sendPasswordResetEmail = async (request, response) => {
    const { email } = request.body;

    try {
      const user = await userManager.getUserBy({ email });
      if (!user) {
        return response.status(404).send('Usuario no encontrado');
      }

      const token = crypto.randomBytes(20).toString('hex');
      const expirationTime = Date.now() + 3600000; // 1 hora

      user.resetPasswordToken = token;
      user.resetPasswordExpires = expirationTime;
      await user.save();

      const resetURL = `http://${request.headers.host}/reset/${token}`;

      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        to: user.email,
        from: process.env.EMAIL_USERNAME,
        subject: 'Reestablecer Contraseña',
        text: `Haz click en el siguiente link para reestablecer tu clave: ${resetURL}`,
      };

      await transporter.sendMail(mailOptions);
      response.send('Correo de recuperación de contraseña enviado');
    } catch (error) {
      response.status(500).send('Error al enviar el correo de recuperación de contraseña');
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
 
};

export default new UserController();