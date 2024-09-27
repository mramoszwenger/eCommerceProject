import express from 'express';
import session from 'express-session';
import flash from 'connect-flash';
import http from 'http';
import loaders from './loaders/index.js';
import indexRouter from './routes/viewsRoutes.js';
import productsRouter from './routes/api/productRoutes.js';
import cartsRouter from './routes/api/cartRoutes.js';
import usersRouter from './routes/api/userRoutes.js';
import sessionRouter from './routes/api/sessionRoutes.js';
import { initializeSocket } from './services/websocket.js';
import passport from './config/passport.js';
import { config } from './config/config.js';
import { daoFactory } from './factories/factory.js';
import userController from './controllers/userController.js';
import sessionController from './controllers/sessionController.js';
import productController from './controllers/productController.js';
import cartController from './controllers/cartController.js';
import MongoStore from 'connect-mongo';
import { getCurrentUser } from './middlewares/auth.js';

async function startServer() {
	const app = express();
	const server = http.createServer(app);
	const io = initializeSocket(server);

	// Inicializar DAOs y conectar a MongoDB
	const { ProductDao, CartDao, UserDao } = await daoFactory.initializeDaos();

	// Inicializa los loaders
	await loaders(app);

	// Middleware de logging para depuración
	app.use(config.UPLOAD_PATH, (request, response, next) => {
		console.log('Accediendo a:', request.url);
		next();
	});

	// Middleware para session
	app.use(session({
		secret: config.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		store: MongoStore.create({
			mongoUrl: config.MONGO_URI,
			ttl: 60 * 60 // 1 hora
		}),
		cookie: { 
			maxAge: 1000 * 60 * 60, // 1 hora
			secure: config.NODE_ENV === 'production'
		}
	}));

	// Inicialización de Passport
	app.use(passport.initialize());
	app.use(passport.session());

	// Middleware para mensajes flash
	app.use(flash());

	// Middleware para establecer variables locales y obtener el usuario actual
	app.use(getCurrentUser);
	app.use((request, response, next) => {
		response.locals.messages = request.flash();
		next();
	});

	// Rutas
	app.use('/', indexRouter);
	app.use('/api/products', productsRouter);
	app.use('/api/carts', cartsRouter);
	app.use('/api/users', usersRouter);
	app.use('/api/sessions', sessionRouter);

	// Middleware para rutas no encontradas
	app.use((request, response, next) => {
		console.log(`Ruta no encontrada: ${request.method} ${request.url}`);
		response.status(404).send('Página no encontrada');
	});

	// Middleware de manejo de errores
	app.use((err, request, response, next) => {
		console.error(err.stack);
		response.status(500).json({ error: 'Error interno del servidor' });
	});

	// Inicializar controladores con los DAOs ya inicializados
	await userController.initialize(UserDao);
	await sessionController.initialize(UserDao);
	await productController.initialize(ProductDao);
	await cartController.initialize(CartDao);

	server.listen(config.PORT, () => {
		console.log(`Servidor escuchando en el puerto ${config.PORT}`);
		console.log(`Persistencia actual: ${config.PERSISTENCE}`);
	});

	return { app, server, io };
}

// Ejecutar el servidor
startServer().catch(error => {
	console.error('Error al iniciar el servidor:', error);
});