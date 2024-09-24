import { daoFactory } from '../factories/factory.js';

class UserController {
  constructor() {
    this.userManager = null;
    this.productManager = null;
    this.cartManager = null;
  }

  async initialize() {
    const { UserDao, ProductDao, CartDao } = await daoFactory.initializeDaos();
    this.userManager = UserDao;
    this.productManager = ProductDao;
    this.cartManager = CartDao;
  }

  getAllUsers = async (request, response) => {
    try {
      const users = await this.userManager.getAllUsers();
      response.json(users);
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
      response.status(500).json({ error: 'Error al obtener los usuarios' });
    }
  }

  getUserById = async (request, response) => {
    const uid = request.params.uid;
    try {
      const user = await this.userManager.getUserById(uid);
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
      const newUser = await this.userManager.addUser(request.body);
      response.status(201).json(newUser);
    } catch (error) {
      console.error('Error al agregar el usuario:', error);
      response.status(400).json({ error: error.message });
    }
  }

  updateUser = async (request, response) => {
    const uid = request.params.uid;
    try {
      const updatedUser = await this.userManager.updateUser(uid, request.body);
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
      const deletedUser = await this.userManager.deleteUser(uid);
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
      
      const user = await this.userManager.validateUser(email, password);
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

      const user = await this.userManager.getUserById(userId);
      const userProducts = await this.productManager.getProductsByUserId(userId);
      const userCarts = await this.cartManager.getCartsByUserId(userId);
      
      if (!user) {
        console.log('Usuario no encontrado para el ID:', userId);
        return response.status(404).render('error', { error: 'Usuario no encontrado' });
      }

      response.render('userProfile', { 
        title: 'Mi Perfil', 
        user: {
          id: user._id.toString(),
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email,
          role: user.role
        },
        userProducts,
        userCarts
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
