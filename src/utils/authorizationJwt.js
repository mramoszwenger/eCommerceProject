export const authorization = (requiredRole) => {
    return async (request, response, next) => {
        // Verifica si el usuario está autenticado
        if (!request.user) {
            return response.status(401).send({ error: 'Unauthorized' });
        }

        // Verifica el rol del usuario
        if (request.user.role !== requiredRole) {
            return response.status(403).send({ error: 'Forbidden: Insufficient permissions' });
        }

        next();
    };
};
