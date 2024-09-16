import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import passport from 'passport';

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

router.get('/products', authMiddleware, (request, response) => {
  response.render('products');
});

router.get('/chat', (request, response) => {
  const { socketServer } = request

  socketServer.on('connection', socket => {
      logger.info('nuevo cliete conectado')
   
      const messages = []
    
      socket.on('mensaje_cliente', data => {
          logger.info(data)
          messages.push({id: socket.id, messge: data})       
          socketServer.emit('messages_server', messages)
      })
  })

  response.render('chat', {
      styles: 'chatStyles.css' })
})

export default router;