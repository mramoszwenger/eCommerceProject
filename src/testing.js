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
import { config } from './config/config.js';
import { daoFactory } from './factories/factory.js';
import userController from './controllers/userController.js';
import sessionController from './controllers/sessionController.js';
import productController from './controllers/productController.js';
import cartController from './controllers/cartController.js';
import MongoStore from 'connect-mongo';

export async function startServer() {
	const app = express();
	const server = http.createServer(app);
	const io = initializeSocket(server);

	// No inicialices los DAOs aquí, ya deberían estar inicializados

	// Inicializa los loaders
	await loaders(app);

	// Middleware de logging para depuración
	app.use(config.UPLOAD_PATH, (req, res, next) => {
		console.log('Accediendo a:', req.url);
		next();
	});

	// Middleware para session
	app.use(session({
		secret: config.SESSION_SECRET,
		resave: false,
		saveUninitialized: false, // Cambiado a false
		store: MongoStore.create({
			mongoUrl: config.MONGO_URI,
			ttl: 60 * 60 // 1 hora
		}),
		cookie: { 
			maxAge: 1000 * 60 * 60, // 1 hora
			secure: config.NODE_ENV === 'production'
		}
	}));

	// Middleware para mensajes flash
	app.use(flash());

	// Middleware para establecer variables locales
	app.use((req, res, next) => {
		res.locals.isAuthenticated = req.session.userId != null;
		res.locals.user = req.session.user || null;
		res.locals.messages = req.flash();
		next();
	});

	// Rutas
	app.use('/', indexRouter);
	app.use('/api/products', productsRouter);
	app.use('/api/carts', cartsRouter);
	app.use('/api/users', usersRouter);
	app.use('/api/sessions', sessionRouter);

	// Middleware para rutas no encontradas
	app.use((req, res, next) => {
		console.log(`Ruta no encontrada: ${req.method} ${req.url}`);
		res.status(404).send('Página no encontrada');
	});

	// Middleware de manejo de errores
	app.use((err, req, res, next) => {
		console.error(err.stack);
		res.status(500).json({ error: 'Error interno del servidor' });
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

// Si necesitas ejecutar el servidor directamente desde app.js
if (require.main === module) {
	startServer().catch(error => {
		console.error('Error al iniciar el servidor:', error);
	});
}