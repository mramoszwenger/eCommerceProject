import {productModel} from './models/products.model.js'

class ProductManagerMongo {
    constructor() {
        this.productModel = productModel;
    }

    addProduct = async (product) => {
        try {
            return await productModel.create(product)
        } catch (error) {
            console.error(error)
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