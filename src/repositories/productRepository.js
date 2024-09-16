class ProductRepository {
  constructor(productDAO) {
    this.productDAO = productDAO;
  }

  getAllProducts = async () => await this.productDAO.getAllProducts();
  getProductById = async pid => await this.productDAO.getProductById({_id: pid});

}

export default ProductRepository;