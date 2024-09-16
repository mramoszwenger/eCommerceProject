class ProductDTO {
    constructor(newProduct) {
      this.id = newProduct._id;
      this.name = newProduct.name;
      this.price = newProduct.price;
    }
  }
  
  export default ProductDTO;