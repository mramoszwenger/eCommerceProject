import { Router } from 'express';
import passport from 'passport';
import SessionsController from '../../controllers/sessions.controller.js';
import { authorization } from '../../utils/authorizationJwt.js';
import { isAuthenticated } from '../../middlewares/auth.middleware.js';

const sessionsRouter = Router();

// Registro del usuario
sessionsRouter.post('/register', SessionsController.registerUser);

// Inicio de sesión
sessionsRouter.post('/login', SessionsController.loginUser);

// Login con GitHub
sessionsRouter.get('/github', passport.authenticate('github', {scope: 'user:email'}));

sessionsRouter.get('/githubcallback', passport.authenticate('github', {failureRedirect: '/login'}), SessionsController.githubCallback);

// Ruta protegida de ejemplo
sessionsRouter.get('/current', isAuthenticated, authorization('admin'), SessionsController.getCurrentUser);

// Ruta para solicitar el enlace de recuperación de contraseña
sessionsRouter.post('/forgot-password', SessionsController.sendPasswordResetEmail);

// Ruta para formulario de reestablecer contraseña
sessionsRouter.get('/reset-password/:token', SessionsController.renderResetPasswordForm);

// Ruta para procesar el formulario para reestablecer contraseña
sessionsRouter.post('/reset-password/:token', SessionsController.resetPassword);

// Cerrar sesión
sessionsRouter.post('/logout', isAuthenticated, SessionsController.logoutUser);

// Verificar sesión
sessionsRouter.get('/check', isAuthenticated, SessionsController.checkSession);

export default sessionsRouter;
