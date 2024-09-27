import UserRepository from '../repositories/userRepository.js';
import { daoFactory } from '../factories/factory.js';

class UserController {
  constructor() {
    this.userRepository = null;
    this.productManager = null;
    this.cartManager = null;
    this.ticketManager = null;
  }

  async initialize() {
    const { UserDao, ProductDao, CartDao, TicketDao } = await daoFactory.initializeDaos();
    this.userRepository = UserRepository(UserDao);
    this.productManager = ProductDao;
    this.cartManager = CartDao;
    this.ticketManager = TicketDao;
  }

  getAllUsers = async (request, response) => {
    try {
      const users = await this.userRepository.getAllUsers();
      response.json(users);
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
      response.status(500).json({ error: 'Error al obtener los usuarios' });
    }
  }

  getUserById = async (request, response) => {
    const uid = request.params.uid;
    try {
      const user = await this.userRepository.getUserById(uid);
      response.json(user);
    } catch (error) {
      console.error('Error al obtener usuario por UID:', error);
      if (error.message === 'Usuario no encontrado') {
        response.status(404).json({ error: 'Usuario no encontrado' });
      } else {
        response.status(500).json({ error: 'Error al obtener usuario por UID' });
      }
    }
  }

  addUser = async (request, response) => {
    try {
      const newUser = await this.userRepository.addUser(request.body);
      response.status(201).json(newUser);
    } catch (error) {
      console.error('Error al agregar el usuario:', error);
      response.status(400).json({ error: error.message });
    }
  }

  updateUser = async (request, response) => {
    const uid = request.params.uid;
    try {
      const updatedUser = await this.userRepository.updateUser(uid, request.body);
      response.json(updatedUser);
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
      if (error.message === 'Usuario no encontrado') {
        response.status(404).json({ error: 'Usuario no encontrado' });
      } else {
        response.status(500).json({ error: 'Error al actualizar el usuario' });
      }
    }
  }

  deleteUser = async (request, response) => {
    const uid = request.params.uid;
    try {
      const deletedUser = await this.userRepository.deleteUser(uid);
      response.json(deletedUser);
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      if (error.message === 'Usuario no encontrado') {
        response.status(404).json({ error: 'Usuario no encontrado' });
      } else {
        response.status(500).json({ error: 'Error al eliminar el usuario' });
      }
    }
  }

  loginUser = async (request, response) => {
    try {
      const { email, password } = request.body;
      console.log('Intento de login:', { email, password: '****' });
      
      const user = await this.userRepository.validateUser(email, password);
      if (!user) {
        throw new Error('Credenciales inválidas');
      }
      console.log('Usuario autenticado:', user);
      
      request.session.user = {
        id: user.id,
        email: user.email,
        role: user.role
      };
      console.log('Session user establecido:', request.session.user);
      
      console.log('Redirigiendo a /profile');
      return response.redirect('/profile');
    } catch (error) {
      console.error('Error en el login:', error);
      response.status(401).render('login', { error: error.message });
    }
  }

  logoutUser = (request, response) => {
    request.session.destroy((err) => {
      if (err) {
        console.error('Error al cerrar sesión:', err);
        return response.status(500).json({ error: 'Error al cerrar sesión' });
      }
      response.json({ message: 'Sesión cerrada exitosamente' });
    });
  }

  renderUserProfile = async (request, response) => {
    try {
      console.log('Session en renderUserProfile:', request.session);
      const userId = request.session.user?.id;
      console.log('User ID:', userId);
      
      if (!userId) {
        console.log('No se encontró user id en la sesión');
        return response.status(401).redirect('/login');
      }

      const user = await this.userRepository.getUserById(userId);
      const userProducts = await this.productManager.getProductsByUserId(userId);
      
      // Obtener tickets finalizados
      const userTickets = await this.ticketManager.getTicketsByUserId(userId);
      
      // Obtener el carrito activo
      const activeCart = await this.cartManager.getActiveCartByUserId(userId);
      
      if (!user) {
        console.log('Usuario no encontrado para el ID:', userId);
        return response.status(404).render('error', { error: 'Usuario no encontrado' });
      }

      console.log('User Tickets:', userTickets);
      console.log('Active Cart:', activeCart);

      response.render('userProfile', { 
        title: 'Mi Perfil', 
        user,
        userProducts,
        userTickets,
        activeCart,
        isAuthenticated: true
      });
    } catch (error) {
      console.error('Error al cargar el perfil de usuario:', error);
      response.status(500).render('error', { error: 'Error al cargar el perfil de usuario' });
    }
  }
}

const userController = new UserController();
await userController.initialize();
export default userController;
