import { Product } from '../../models/productModel.js';

class ProductDaoMongo {
  getAllProducts = async (filters = {}, options = {}) => {
    console.log('Filters:', filters);
    console.log('Options:', options);
    const { limit = 10, page = 1, sort = null } = options;
    const mongoOptions = {
      limit: parseInt(limit),
      skip: (page - 1) * parseInt(limit),
      sort
    };
    console.log('MongoDB options:', mongoOptions);
    const docs = await Product.find(filters, null, mongoOptions).lean();
    console.log('Products found:', docs.length);
    if (docs.length > 0) {
      console.log('First product:', docs[0]);
    }
    const totalProducts = await Product.countDocuments(filters);
    console.log('Total products:', totalProducts);
    const totalPages = Math.ceil(totalProducts / parseInt(limit));
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;
    const prevPage = hasPrevPage ? page - 1 : null;
    const nextPage = hasNextPage ? page + 1 : null;

    return {
      docs,
      totalPages,
      hasPrevPage,
      hasNextPage,
      prevPage,
      nextPage
    };
  }

  getProductById = async (id) => {
    const product = await Product.findById(id);
    if (!product) {
      throw new Error('Producto no encontrado');
    }
    return product;
  }

  getProductsByUserId = async (userId) => {
    return await Product.find({ user: userId });
  }

  addProduct = async (productData) => {
    const newProduct = new Product(productData);
    return await newProduct.save();
  }

  updateProduct = async (id, updateData) => {
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedProduct) {
      throw new Error('Producto no encontrado');
    }
    return updatedProduct;
  }

  deleteProduct = async (id) => {
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      throw new Error('Producto no encontrado');
    }
    return deletedProduct;
  }
}

export default ProductDaoMongo;
