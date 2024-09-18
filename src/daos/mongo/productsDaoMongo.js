import {productModel} from './models/products.model.js'

class ProductManagerMongo {
    constructor() {
        this.productModel = productModel;
    }

    addProduct = async (product) => {
        console.log('Iniciando addProduct en ProductManagerMongo');
        console.log('Datos del producto recibidos:', JSON.stringify(product, null, 2));

        // Validación de campos requeridos
        const requiredFields = ['title', 'description', 'category', 'price', 'stock', 'code'];
        for (const field of requiredFields) {
            if (!product[field]) {
                console.error(`Campo requerido faltante: ${field}`);
                throw new Error(`El campo ${field} es requerido`);
            }
        }

        try {
            const newProduct = await this.productModel.create(product);
            console.log('Producto creado exitosamente:', JSON.stringify(newProduct, null, 2));
            return newProduct;
        } catch (error) {
            console.error('Error al crear el producto en ProductManagerMongo:', error);
            console.error('Error detallado:', JSON.stringify(error, null, 2));
            if (error.code === 11000) {
                throw new Error('Ya existe un producto con ese código');
            }
            throw error; // Propaga el error para que pueda ser manejado en capas superiores
        }
    }

    getAllProducts = async (filters = {}, options = {}) => {
        console.log('Iniciando getAllProducts en productsDaoMongo');
        console.log('Filtros:', JSON.stringify(filters));
        console.log('Opciones:', JSON.stringify(options));
    
        if (typeof filters !== 'object' || typeof options !== 'object') {
            console.error('Filtros u opciones inválidos');
            throw new Error('Parámetros inválidos para getAllProducts');
        }
    
        try {
            console.log('Intentando paginar productos...');
            const result = await this.productModel.paginate(filters, options);
            console.log('Paginación completada');
    
            if (!result?.docs) {
                console.error('No se encontraron documentos en el resultado');
                throw new Error('Error en los datos de productos');
            }
    
            console.log(`Se encontraron ${result.docs.length} productos`);
            return result;
        } catch (error) {
            console.error('Error al obtener los productos:', error);
            throw error;
        }
    }

    getProductById = async (pid) => {
        try {
            return await this.productModel.findOne({ _id: pid });
        } catch (error) {
            console.error('Error al obtener el producto por ID:', error);
            return null;
        }
    }

    updateProduct = async (pid, productToUpdate) => {
        try {
            return await this.productModel.findOneAndUpdate({ _id: pid }, productToUpdate, { new: true });
        } catch (error) {
            console.error('Error al actualizar el producto:', error);
            return null;
        }
    }

    deleteProduct = async (pid) => {
        try {
            return await this.productModel.findOneAndDelete({ _id: pid });
        } catch (error) {
            console.error('Error al eliminar el producto:', error);
            return null;
        }
    }
}

export default ProductManagerMongo;