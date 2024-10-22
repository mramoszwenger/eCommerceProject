import express from 'express';
import userController from '../../controllers/userController.js';
import { isAuthenticated } from '../../middlewares/auth.js';

const router = express.Router();

// Obtener todos los usuarios
router.get('/', userController.getAllUsers);

// Obtener un usuario por ID
router.get('/:uid', userController.getUserById);

// Agregar un nuevo usuario
router.post('/', userController.addUser);

// Actualizar un usuario
router.put('/:uid', userController.updateUser);

// Eliminar un usuario
router.delete('/:uid', userController.deleteUser);

// Login de usuario
router.post('/login', userController.loginUser);

// Perfil de usuario
router.get('/profile', isAuthenticated, userController.renderUserProfile);

// Cierre de sesión
router.post('/logout', userController.logoutUser);

// Cambiar rol de usuario a premium o viceversa
router.put('/premium/:uid', isAuthenticated, userController.toggleUserRole);

export default router;
