import {productModel} from './models/products.model.js'

class ProductManagerMongo {
    constructor() {
        this.productModel = productModel;
    }

    addProduct = async (product) => {
        try {
            // Validar que todos los campos sean completados
            if (!product.title || !product.description || !product.category || !product.thumbnail || !product.price || !product.stock || !product.code) {
                throw new Error('Todos los campos son obligatorios.');
            }

            // Asegurarse de que el usuario tenga el rol owner
            if (!product.owner) {
                product.owner = 'admin';
            }

            // Validar que el código del producto no exista en otro producto
            const existingProduct = await this.productModel.findOne({ code: product.code });
            if (existingProduct) {
                throw new Error('El código del producto ya existe.');
            }

            const newProduct = new this.productModel(product);
            await newProduct.save();
            return newProduct;
        } catch (error) {
            console.error('Error al agregar el producto:', error);
            throw error;
        }
    }

    getProducts = async (filters, options) => {
        try {
            const result = await this.productModel.paginate(filters, options);
            if (!result || !result.docs) {
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