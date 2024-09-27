import UserDTO from '../dtos/userDTO.js';
import { daoFactory } from '../factories/factory.js';

let cartManager;

const initializeCartManager = async () => {
  const { CartDao } = await daoFactory.initializeDaos();
  cartManager = CartDao;
};

initializeCartManager();

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

export const getCurrentUser = async (request, response, next) => {
  if (request.session && request.session.user) {
    const currentUser = new UserDTO(request.session.user);
    response.locals.currentUser = currentUser;
    response.locals.isAuthenticated = true;

    try {
      const activeCart = await cartManager.getActiveCartByUserId(request.session.user.id);
      response.locals.activeCart = activeCart;
    } catch (error) {
      console.error('Error al obtener el carrito activo:', error);
      response.locals.activeCart = null;
    }
  } else {
    response.locals.currentUser = null;
    response.locals.isAuthenticated = false;
    response.locals.activeCart = null;
  }
  response.locals.user = response.locals.currentUser;
  next();
};
