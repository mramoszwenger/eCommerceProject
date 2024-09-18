import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import productController from '../controllers/products.controller.js';

const router = Router();

router.get('/', (request, response) => {
  response.render('index');
});

router.get('/login', (request, response) => {
  response.render('login');
});

router.get('/register', (request, response) => {
  response.render('register');
});

router.get('/forgot-password', (request, response) => {
  response.render('forgot-password.hbs');
});

router.get('/products', (request, response) => {
  response.render('products');
});

router.get('/products/:pid', (request, response) => {
  response.render('product');
});

router.get('/chat', (request, response) => {
  const { socketServer } = request

  socketServer.on('connection', socket => {
      logger.info('nuevo cliente conectado')
   
      const messages = []
    
      socket.on('mensaje_cliente', data => {
          logger.info(data)
          messages.push({id: socket.id, message: data})       
          socketServer.emit('messages_server', messages)
      })
  })

  response.render('chat', {
      styles: 'chatStyles.css' })
})

export default router;