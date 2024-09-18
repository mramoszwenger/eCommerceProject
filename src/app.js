import express from 'express';
import session from 'express-session';
import { connectDB, PORT, SESSION_SECRET } from './config/config.js';
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
import cookieParser from 'cookie-parser';
import passport from 'passport';
import cors from 'cors';
import { initializePassport } from './config/passport.config.js';
import { daoFactory } from './factories/factory.js';

const app = express();

// Configuraciones básicas de Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000', // O la URL de tu frontend
  credentials: true
}));

// Configuración de sesiones
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    name: 'coderProjectCookie'
  }
}));

// Inicialización de Passport
initializePassport();
app.use(passport.initialize());
app.use(passport.session());

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Usuario autenticado:', req.isAuthenticated ? req.isAuthenticated() : 'isAuthenticated no disponible');
  console.log('Usuario:', req.user);
  next();
});

// Configuración de Swagger
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

// Configuración de archivos estáticos
app.use('/virtual', express.static(path.join(__dirname, 'public')));

// Motor de plantillas
app.engine('hbs', handlebars.engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../views'));

handlebars.create({
  helpers: {
    multiply: function(a, b) {
      return a * b;
    },
    calculateTotal: function(products) {
      return products.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    }
  }
});

// Rutas
app.use('/', viewsRouter);
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/users', usersRouter);
app.use('/api/sessions', sessionsRouter);

// Manejo de errores
app.use((error, req, res, next) => {
  console.error('Error en el servidor:', error);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack
  });
});

const startServer = async () => {
  try {
    await connectDB();
    const { ProductsDao, CartsDao, UsersDao } = await daoFactory.initializeDaos();

    console.log('DAOs inicializados:');
    console.log('ProductsDao:', ProductsDao);
    console.log('CartsDao:', CartsDao);
    console.log('UsersDao:', UsersDao);

    const httpServer = app.listen(PORT, () => {
      console.log(`Server escuchando en el puerto ${PORT}`);
    });

    // Iniciar socket server
    const socketServer = new Server(httpServer);
    initChatSocket(socketServer);
    initProductsSocket(socketServer);

  } catch (error) {
    console.error('Error al iniciar la aplicación:', error);
    process.exit(1);
  }
};

startServer();
