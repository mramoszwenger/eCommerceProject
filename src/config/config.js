import dotenv from 'dotenv';
import { getDataFilePath, getPublicPath, getUploadsPath } from '../utils/dirname.js';
import path from 'path';

dotenv.config();

export const config = {
  PORT: process.env.PORT || 8080,
  NODE_ENV: process.env.NODE_ENV || 'development',
  SESSION_SECRET: process.env.SESSION_SECRET,
  PUBLIC_PATH: getPublicPath(),
  UPLOAD_PATH: getUploadsPath(),
  DEFAULT_IMAGE_PATH: path.join(getUploadsPath(), 'products', 'default-product.jpg'),
  PRODUCTS_FILE_PATH: getDataFilePath('Products.json'),
  CARTS_FILE_PATH: getDataFilePath('Carts.json'),
  USERS_FILE_PATH: getDataFilePath('Users.json'),
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce_mrz',
  PERSISTENCE: process.env.PERSISTENCE || 'MONGODB' // 'MONGODB' o 'FILESYSTEM'
};