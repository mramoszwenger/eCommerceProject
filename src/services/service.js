import UserRepository from '../repositories/userRepository.js';
import ProductRepository from '../repositories/productRepository.js';
import CartRepository from '../repositories/cartRepository.js';
import { daoFactory } from '../factories/factory.js';

let userService, productService, cartService;

const initializeServices = async () => {
  const { ProductsDao, CartsDao, UsersDao } = await daoFactory.initializeDaos();

  if (!UsersDao || !ProductsDao || !CartsDao) {
    throw new Error('DAOs no han sido inicializados correctamente.');
  }

  userService = new UserRepository(UsersDao);
  productService = new ProductRepository(ProductsDao);
  cartService = new CartRepository(CartsDao);
};

// Función para obtener los servicios inicializados
const getServices = () => {
  if (!userService || !productService || !cartService) {
    throw new Error('Servicios no han sido inicializados. Llama a initializeServices primero.');
  }
  return { userService, productService, cartService };
};

export { initializeServices, getServices };