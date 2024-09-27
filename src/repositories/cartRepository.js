import CartDTO from '../dtos/cartDTO.js';

const CartRepository = (cartDAO) => {
  const repo = {};

  repo.getCarts = async () => {
    const carts = await cartDAO.getCarts();
    return carts.map(cart => new CartDTO(cart));
  };

  repo.getCart = async (id) => {
    const cart = await cartDAO.getCart(id);
    return cart ? new CartDTO(cart) : null;
  };

  repo.getCartsByUserId = async (userId) => {
    const carts = await cartDAO.getCartsByUserId(userId);
    return carts.map(cart => new CartDTO(cart));
  };

  repo.createCart = async (cartData) => {
    const newCart = await cartDAO.createCart(cartData);
    return new CartDTO(newCart);
  };

  repo.addProductToCart = async (cartId, productId, quantity) => {
    console.log(`Repo: Agregando producto ${productId} al carrito ${cartId} con cantidad ${quantity}`);
    const updatedCart = await cartDAO.addProductToCart(cartId, productId, quantity);
    console.log('Repo: Carrito actualizado:', JSON.stringify(updatedCart, null, 2));
    return new CartDTO(updatedCart);
  };

  repo.removeProductFromCart = async (cartId, productId) => {
    const updatedCart = await cartDAO.removeProductFromCart(cartId, productId);
    return new CartDTO(updatedCart);
  };

  repo.updateCart = async (cartId, products) => {
    const updatedCart = await cartDAO.updateCart(cartId, products);
    return new CartDTO(updatedCart);
  };

  repo.updateProductQuantity = async (cartId, productId, quantity, isAdjustment) => {
    const updatedCart = await cartDAO.updateProductQuantity(cartId, productId, quantity, isAdjustment);
    return new CartDTO(updatedCart);
  };

  repo.clearCart = async (cartId) => {
    const clearedCart = await cartDAO.clearCart(cartId);
    return new CartDTO(clearedCart);
  };

  return repo;
};

export default CartRepository;