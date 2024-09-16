import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/config.js';

// Generar Token JWT
export const generateToken = (user = {}, expiresIn = '24h') => {

    const userToken = jwt.sign(user, JWT_SECRET, { expiresIn });
    return userToken;
};

// Verificar Token JWT
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        console.error('Token inválido o expirado', error);
        return null;
    }
};
