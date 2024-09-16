class ProductRepository {
  constructor(productsDAO) {
    this.productsDAO = productsDAO;
    console.log('ProductRepository initialized with DAO:', productsDAO);
  }

  getAllProducts = async (filters = {}, options = {}) => {
    console.log('Calling getAllProducts in ProductRepository...');
    console.log('Filters:', filters);
    console.log('Options:', options);
    try {
        const result = await this.productsDAO.getAllProducts(filters, options);
        return result;
    } catch (error) {
        console.error('Error in ProductRepository.getAllProducts:', error);
        throw error;
    }
};

  getProductById = async pid => await this.productsDAO.getProductById({_id: pid});

  addProduct = async (product) => {
    try {
      const result = await this.productsDAO.addProduct(product);
      return result;
    } catch (error) {
      console.error('Error in addProduct:', error);
      throw error; // Propaga el error para que el llamador pueda manejarlo
    }
  };
}

export default ProductRepository;
