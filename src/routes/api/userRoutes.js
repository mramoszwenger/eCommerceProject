import express from 'express';
import userController from '../../controllers/userController.js';
import { isAuthenticated } from '../../middlewares/auth.js';

const router = express.Router();

router.get('/', userController.getAllUsers); // Obtener todos los usuarios
router.get('/:uid', userController.getUserById); // Obtener un usuario por ID
router.post('/', userController.addUser); // Crear un nuevo usuario
router.put('/:uid', userController.updateUser); // Actualizar un usuario
router.delete('/:uid', userController.deleteUser); // Eliminar un usuario
router.post('/login', userController.loginUser); // Login de usuario
router.get('/profile', isAuthenticated, userController.renderUserProfile); // Ver perfil de usuario
router.post('/logout', userController.logoutUser); // Logout de usuario

export default router;
