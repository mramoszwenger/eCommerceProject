class CartRepository {
  constructor(cartDAO) {
    this.cartDAO = cartDAO;
  }

  async getCartById(id) {
    return this.cartDAO.getCartById(id);
  }
}

export default CartRepository;