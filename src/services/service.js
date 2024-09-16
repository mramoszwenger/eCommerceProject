import UserRepository from '../repositories/userRepository.js';
import ProductRepository from '../repositories/productRepository.js';
import CartRepository from '../repositories/cartRepository.js';
import { UsersDao, ProductsDao, CartsDao } from '../factories/factory.js';

export const userService = new UserRepository(UsersDao);
export const productService = new ProductRepository(ProductsDao);
export const cartService = new CartRepository(CartsDao);