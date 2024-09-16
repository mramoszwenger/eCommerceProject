import UserRepository from '../repositories/userRepository.js';
import ProductRepository from '../repositories/productRepository.js';
import CartRepository from '../repositories/cartRepository.js';
import { daoFactory } from '../factories/factory.js';

let userService, productService, cartService;
let isInitialized = false;

const initializeServices = async () => {
  console.log('Iniciando servicios...');
  try {
    const { ProductsDao, CartsDao, UsersDao } = await daoFactory.initializeDaos();

    if (!UsersDao || !ProductsDao || !CartsDao) {
      throw new Error('DAOs no han sido inicializados correctamente.');
    }

    userService = new UserRepository(UsersDao);
    productService = new ProductRepository(ProductsDao);
    cartService = new CartRepository(CartsDao);

    isInitialized = true;
    console.log('Servicios inicializados correctamente.');
  } catch (error) {
    console.error('Error al inicializar servicios:', error);
    throw error;
  }
};

// Función para obtener los servicios inicializados
const getServices = () => {
  if (!isInitialized) {
    throw new Error('Servicios no han sido inicializados. Llama a initializeServices primero.');
  }
  return { userService, productService, cartService };
};

// Función para verificar si los servicios están inicializados
const areServicesInitialized = () => isInitialized;

export { initializeServices, getServices, areServicesInitialized };