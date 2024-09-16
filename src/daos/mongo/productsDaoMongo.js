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

    getAllProducts = async (filters, options) => {
        try {
            const result = await this.productModel.paginate(filters, options);
            if (!result?.docs) {
                throw new Error('Error en los datos de productos');
            }
            return result;
        } catch (error) {
            console.error('Error al obtener los productos:', error);
            return {};
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