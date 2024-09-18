import dotenv from 'dotenv';
import { connect } from 'mongoose';

dotenv.config(); // Carga variables desde .env

// Variables de entorno
export const JWT_SECRET = process.env.JWT_SECRET || 'wh@tsA$3cr3T';
export const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce_mrz';
export const PORT = process.env.PORT || 8080;
export const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
export const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
export const SESSION_SECRET = process.env.SESSION_SECRET || '1t$@S3CR3T';
export const PERSISTENCE = process.env.PERSISTENCE || 'MONGO';
export const NODE_ENV = process.env.NODE_ENV || 'production';

// Conexión a la base de datos
export const connectDB = async () => {
    try {
        await connect(MONGO_URI);
        console.log('Conexión exitosa a la base de datos');
    } catch (error) {
        console.error('Error conectando a la base de datos:', error);
        throw error; // Propaga el error para que pueda ser manejado en el archivo principal
    }
};