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

export const setUserInLocals = (request, response, next) => {
  response.locals.isAuthenticated = !!(request.session && request.session.user);
  response.locals.user = request.session.user || null;
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
