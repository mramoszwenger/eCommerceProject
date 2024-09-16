import { Router } from 'express';
import passport from 'passport';
import userController from '../../controllers/users.controller.js';
import { passportCall } from '../../utils/passportCall.js';
import { authorization } from '../../utils/authorizationJwt.js';
import { generateToken } from '../../utils/jwt.js';

const sessionsRouter = Router();

// registro del usuario
sessionsRouter.post('/register', userController.registerUser);

// inicio de sesión

sessionsRouter.post('/login', (request, response, next) => {
    passport.authenticate('login', (error, user, info) => {
      if (error) {
        return next(error);
      }
      if (!user) {
        return response.status(401).json({ status: 'error', message: 'Credenciales incorrectas' });
      }
  
      // Login exitoso, generar el token JWT
      request.logIn(user, (error) => {
        if (error) {
          return next(error);
        }
  
        const token = generateToken({ id: user._id, role: user.role });
        console.log('JWT generado:', token);
  
        return response.json({ status: 'success', message: 'Login exitoso', token });
      });
    })(request, response, next);
  });

// login con github
sessionsRouter.get('/github', passport.authenticate('github', {scope: 'user:email'}), async (request, response) => {})

sessionsRouter.get('/githubcallback', passport.authenticate('github', {failureRedirect: '/login'}), (request,response) => {
    request.session.user = request.user
    response.redirect('/')
})

sessionsRouter.get('/current', passportCall('jwt'), authorization('admin'), (request, response) => {
    logger.info(request.user)
    response.send('datos sensibles')
})

// ruta para solicitar el enlace de recuperación de contraseña
sessionsRouter.post('/forgot-password', userController.sendPasswordResetEmail);

// ruta para formulario de reestablecer contraseña
sessionsRouter.get('/reset-password/:token', (request, response) => {
    const { token } = request.params;
    response.render('reset-password', { token });
});

// ruta para procesar el formulario para reestablecer contraseña
sessionsRouter.post('/reset-password', userController.resetPassword);

// cerrar sesión
sessionsRouter.get('/logout', (request, response) => {
    request.logout(error => {
        if(error) return response.send({status: 'error', error: error})
        response.redirect('/login')
    })
})

export default sessionsRouter;
