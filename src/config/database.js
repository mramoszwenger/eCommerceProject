import mongoose from 'mongoose';
import { config } from './config.js';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    console.log('MongoDB ya está conectado');
    return;
  }

  try {
    await mongoose.connect(config.MONGO_URI);
    isConnected = true;
    console.log('Conexión exitosa a MongoDB');
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('Desconexión de MongoDB');
  isConnected = false;
});

process.on('SIGINT', async () => {
  if (isConnected) {
    await mongoose.connection.close();
    console.log('Conexión a MongoDB cerrada debido a la terminación de la aplicación');
  }
  process.exit(0);
});
