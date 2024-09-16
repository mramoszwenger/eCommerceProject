class CartDTO {
    constructor(newCart) {
      this.id = newCart._id;
      this.items = newCart.items;
    }
  }
  
  export default CartDTO;