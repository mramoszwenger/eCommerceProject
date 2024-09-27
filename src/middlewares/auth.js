import UserDTO from '../dtos/userDTO.js';

export const isAuthenticated = (request, response, next) => {
  if (request.session && request.session.user && request.session.user.id) {
    return next();
  }
  response.redirect('/login');
};

export const isNotAuthenticated = (request, response, next) => {
  if (request.session && request.session.user) {
    return response.redirect('/profile');
  }
  next();
};

export const requireRole = (role) => {
  return (request, response, next) => {
    if (request.session && request.session.user && request.session.user.role === role) {
      return next();
    }
    response.status(403).json({ error: 'Acceso denegado' });
  };
};

// Middleware actualizado para la estrategia "current"
export const getCurrentUser = (request, response, next) => {
  if (request.session && request.session.user) {
    const currentUser = new UserDTO(request.session.user);
    response.locals.currentUser = currentUser;
    response.locals.isAuthenticated = true;
  } else {
    response.locals.currentUser = null;
    response.locals.isAuthenticated = false;
  }
  response.locals.user = response.locals.currentUser; // Para mantener compatibilidad
  next();
};
