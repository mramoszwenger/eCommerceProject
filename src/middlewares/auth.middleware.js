import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/config.js';
import passport from 'passport';

const authMiddleware = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }
  return (request, response, next) => {
    console.log('Iniciando authMiddleware');
    console.log('Cookies:', request.cookies);
    
    const token = request.cookies.token; // Cambiado de coderProjectCookie a token
    if (!token) {
      console.log('Token no encontrado en las cookies');
      if (request.xhr || request.headers.accept.indexOf('json') > -1) {
        return response.status(401).json({ status: 'error', message: 'No se encontró token' });
      } else {
        return response.redirect('/login'); // Asume que tienes una ruta de login
      }
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('Token decodificado correctamente:', decoded);

      request.user = decoded;

      if (roles.length && !roles.includes(request.user.role)) {
        console.log('Acceso denegado: el rol del usuario no es válido');
        if (request.xhr || request.headers.accept.indexOf('json') > -1) {
          return response.status(403).json({ status: 'error', message: 'Acceso denegado' });
        } else {
          return response.status(403).render('error', { message: 'Acceso denegado' });
        }
      }

      console.log('Usuario autenticado y autorizado');
      next();
    } catch (error) {
      console.error('Error al verificar el token:', error.message);
      if (request.xhr || request.headers.accept.indexOf('json') > -1) {
        return response.status(401).json({ status: 'error', message: 'Token inválido' });
      } else {
        return response.redirect('/login');
      }
    }
  };
};

export default authMiddleware;

export const isAuthenticated = (req, res, next) => {
  console.log('Iniciando authMiddleware');
  console.log('Cookies:', req.cookies);

  const token = req.cookies.token;

  if (!token) {
    console.log('Token no encontrado en las cookies');
    return res.status(401).json({ message: 'No autorizado: No se proporcionó token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    console.log('Usuario autenticado:', req.user);
    next();
  } catch (error) {
    console.error('Error al verificar token:', error);
    return res.status(401).json({ message: 'No autorizado: Token inválido' });
  }
};