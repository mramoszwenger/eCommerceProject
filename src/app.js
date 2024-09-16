import express from 'express';
import session from 'express-session';

import productsRouter from './routes/api/product.router.js';
import cartsRouter from './routes/api/carts.router.js';
import viewsRouter from './routes/views.router.js';
import usersRouter from './routes/api/users.router.js';
import sessionsRouter from './routes/api/sessions.router.js';

import { __dirname } from './utils/dirname.js';
import path from 'path';

import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';
import handlebars from 'express-handlebars';

import { Server } from 'socket.io';
import { PORT, connectDB } from './config/config.js';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import cors from 'cors';
import { initializePassport } from './config/passport.config.js';
import initializeDaos from './factories/factory.js';

import productController from './controllers/products.controller.js';

const app = express();

const initializeSocket = (socketServer) => {
  socketServer.on('connection', (socket) => {
    console.log('Cliente conectado');

    // Envio lista de productos en tiempo real
    socket.on('getProducts', async () => {
      try {
        const products = await productController.getAllProducts();
        socket.emit('products', products);
      } catch (error) {
        console.error('Error obteniendo productos:', error);
        socket.emit('error', 'No se pudieron obtener los productos');
      }
    });

    // Notificar cuando se agrega un nuevo producto
    socket.on('newProductAdded', async () => {
      try {
        const products = await productController.getAllProducts();
        socketServer.emit('products', products);
      } catch (error) {
        console.error('Error actualizando productos:', error);
      }
    });
  });
};

const startServer = async () => {
  try {
    await initializeDaos();
    console.log('Conexión inicializada correctamente');

    const httpServer = app.listen(PORT || 8080, () => {
      console.log(`Server escuchando en el puerto ${PORT}`);
    });

    // Iniciar socket server
    const socketServer = new Server(httpServer);
    initializeSocket(socketServer);

  } catch (error) {
    console.error('Error al iniciar la aplicación:', error);
  }
};

startServer();

// Swagger para documentar
const swaggerOptions = {
  definition: {
    openapi: '3.0.1',
    info: {
      title: 'Documentación de eCommerce desarrollado con NodeJS + Express + MongoDB',
      description: 'API para documentar eCommerce'
    }
  },
  apis: [`${__dirname}/docs/**/*.yaml`]
};

const specs = swaggerJsDoc(swaggerOptions);
app.use('/apidocs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

// Lectura del JSON
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/virtual', express.static(__dirname + '/public'));
app.use(cookieParser());

// Middleware para sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || '1t$@S3CR3T',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true, // No permitir acceso a la cookie desde JavaScript
    secure: process.env.NODE_ENV === 'production', // solo seguro en producción
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // 'None' para producción y 'Lax' para desarrollo
    name: 'coderProjectCookie' // Nombre personalizado de cookie
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
initializePassport();

// Motor de plantillas
app.engine('hbs', handlebars.engine({ extname: '.hbs' }));

// Dirección de las vistas (plantillas)
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../views'));
// console.log('Current __dirname:', __dirname);

// Rutas
app.use('/', viewsRouter);
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/users', usersRouter);
app.use('/api/sessions', sessionsRouter);

// Manejo de errores
app.use((error, request, response, next) => {
  console.error(error);
  response.status(500).send('Error 500 en el server');
});
