class ProductDTO {
  constructor(product) {
    this.id = product._id;
    this.title = product.title;
    this.description = product.description;
    this.price = product.price;
    this.image = product.image;
    this.thumbnail = product.thumbnail;
    this.code = product.code;
    this.stock = product.stock;
    this.category = product.category;
    this.status = product.status;
    this.user = product.user;
  }
}

export default ProductDTO;