class ProductRepository {
  constructor(productsDAO) {
    this.productsDAO = productsDAO;
    console.log('ProductRepository initialized with DAO:', productsDAO);
  }

  getAllProducts = async (config) => {
    console.log('Calling getAllProducts...');
    try {
      const result = await this.productsDAO.getAllProducts(config);
      return result; // Asegúrate de retornar el resultado
    } catch (error) {
      console.error('Error in getAllProducts:', error);
      throw error; // Propaga el error para que el llamador pueda manejarlo
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
