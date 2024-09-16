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
import { initChatSocket, initProductsSocket } from './utils/socket.js';
import { PORT } from './config/config.js';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import cors from 'cors';
import { initializePassport } from './config/passport.config.js';
import { daoFactory } from './factories/factory.js';  // Importar la instancia de DaoFactory

const app = express();

const startServer = async () => {
  try {
    const { ProductsDao, CartsDao, UsersDao } = await daoFactory.initializeDaos(); // Usar la instancia para inicializar DAOs

    // Verifica que los DAOs se hayan inicializado correctamente
    console.log('ProductsDao:', ProductsDao);
    console.log('CartsDao:', CartsDao);
    console.log('UsersDao:', UsersDao);

    const httpServer = app.listen(PORT || 8080, () => {
      console.log(`Server escuchando en el puerto ${PORT}`);
    });

    // Iniciar socket server
    const socketServer = new Server(httpServer);
    initChatSocket(socketServer);  // Inicializar chat socket
    initProductsSocket(socketServer);  // Inicializar productos socket

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
