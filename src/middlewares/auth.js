export const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.id) {
    return next();
  }
  res.redirect('/login');
};

export const isNotAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return res.redirect('/profile');
  }
  next();
};

export const setUserInLocals = (req, res, next) => {
  res.locals.isAuthenticated = !!(req.session && req.session.user);
  res.locals.user = req.session.user || null;
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
