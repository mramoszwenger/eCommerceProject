import express from 'express';
import SessionController from '../../controllers/sessionController.js';
import { isAuthenticated, isNotAuthenticated } from '../../middlewares/auth.js';

const router = express.Router();

// Rutas de login de usuarios
router.post('/login', isNotAuthenticated, SessionController.login);

// Rutas de registro de usuarios
router.post('/register', isNotAuthenticated, SessionController.register);

// Rutas de cierre de sesión
router.post('/logout', isAuthenticated, SessionController.logout);

// Rutas de sesiones
router.get('/current', isAuthenticated, SessionController.getCurrentUser);

// Rutas de autenticación de GitHub
router.get('/github', isNotAuthenticated, SessionController.githubAuth);
router.get('/github/callback', isNotAuthenticated, SessionController.githubAuthCallback);

// Rutas para recuperación de contraseña
router.post('/forgot-password', isNotAuthenticated, SessionController.forgotPassword);
router.get('/reset-password/:token', isNotAuthenticated, SessionController.renderResetPasswordForm);
router.post('/reset-password/:token', isNotAuthenticated, SessionController.resetPassword);

export default router;
