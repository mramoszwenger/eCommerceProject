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
    console.log('Iniciando addProduct en ProductRepository');
    console.log('Datos del producto recibidos:', product);

    try {
      if (!product || typeof product !== 'object') {
        throw new Error('Datos del producto inválidos');
      }

      const requiredFields = ['title', 'description', 'category', 'price', 'stock', 'code'];
      for (const field of requiredFields) {
        if (!(field in product)) {
          throw new Error(`El campo '${field}' es requerido`);
        }
      }

      const result = await this.productsDAO.addProduct(product);
      console.log('Producto agregado exitosamente:', result);
      return result;
    } catch (error) {
      console.error('Error en ProductRepository.addProduct:', error);
      throw error; // Propaga el error para que el llamador pueda manejarlo
    }
  };

  updateProduct = async (pid, product) => {
    console.log('Iniciando updateProduct en ProductRepository');
    console.log('ID del producto:', pid);
    console.log('Datos del producto recibidos:', product);

    try {
      if (!product || typeof product !== 'object') {
        throw new Error('Datos del producto inválidos');
      }
      // Aquí deberías agregar la lógica para actualizar el producto
      const result = await this.productsDAO.updateProduct(pid, product);
      console.log('Producto actualizado exitosamente:', result);
      return result;
    } catch (error) {
      console.error('Error en ProductRepository.updateProduct:', error);
      throw error;
    }
  };
}

export default ProductRepository;
