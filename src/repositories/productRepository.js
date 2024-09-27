import ProductDTO from '../dtos/productDTO.js';

const ProductRepository = (productsDAO) => {
	const repo = {};

	repo.getAllProducts = async (filters = {}, options = {}) => {
		console.log('Calling getAllProducts in ProductRepository...');
		console.log('Filters:', filters);
		console.log('Options:', options);
		try {
			const result = await productsDAO.getAllProducts(filters, options);
			return {
				...result,
				docs: result.docs.map(product => new ProductDTO(product))
			};
		} catch (error) {
			console.error('Error in ProductRepository.getAllProducts:', error);
			throw error;
		}
	};

	repo.getProductById = async (pid) => {
		const product = await productsDAO.getProductById(pid);
		return product ? new ProductDTO(product) : null;
	};

	repo.addProduct = async (product) => {
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

			const result = await productsDAO.addProduct(product);
			console.log('Producto agregado exitosamente:', result);
			return new ProductDTO(result);
		} catch (error) {
			console.error('Error en ProductRepository.addProduct:', error);
			throw error;
		}
	};

	repo.updateProduct = async (pid, product) => {
		console.log('Iniciando updateProduct en ProductRepository');
		console.log('ID del producto:', pid);
		console.log('Datos del producto recibidos:', product);

		try {
			if (!product || typeof product !== 'object') {
				throw new Error('Datos del producto inválidos');
			}
			const result = await productsDAO.updateProduct(pid, product);
			console.log('Producto actualizado exitosamente:', result);
			return new ProductDTO(result);
		} catch (error) {
			console.error('Error en ProductRepository.updateProduct:', error);
			throw error;
		}
	};

	repo.deleteProduct = async (pid) => {
		try {
			const deletedProduct = await productsDAO.deleteProduct(pid);
			return deletedProduct ? new ProductDTO(deletedProduct) : null;
		} catch (error) {
			console.error('Error en ProductRepository.deleteProduct:', error);
			throw error;
		}
	};

	return repo;
};

export default ProductRepository;