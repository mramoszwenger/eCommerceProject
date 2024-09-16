import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/config.js';

const authMiddleware = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }
  return (request, response, next) => {

    // Verificar si hay cookie
    console.log('Cookies:', request.cookies);
    
    const token = request.cookies.coderProjectCookie;
    if (!token) {
      console.log('Token no encontrado en las cookies');
      console.log('Error al verificar el token:', error.message);
      return response.status(401).json({ status: 'error', message: 'No se encontró token' });
    }

    jwt.verify(token, JWT_SECRET, (error, decoded) => {
      if (error) {
        return response.status(401).json({ status: 'error', message: 'Token incorrecto' });
      }

      console.log('Token decodificado correctamente:', decoded);

      request.user = decoded;

      if (roles.length && !roles.includes(request.user.role)) {
        console.log('Acceso denegado: el rol del usuario no es válido');
        return response.status(403).json({ status: 'error', message: 'Acceso denegado' });
      }

      next();
    });
  };
};

export default authMiddleware;