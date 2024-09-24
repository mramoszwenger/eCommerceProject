import { Router } from 'express';
import productController from '../../controllers/productController.js';
import { uploadMiddleware } from '../../middlewares/uploadMiddleware.js';

const router = Router();

// Obtener todos los productos
router.get('/', productController.getAllProducts);

// Obtener un producto por ID
router.get('/:pid', productController.getProductById);

// Agregar un nuevo producto
router.post('/', uploadMiddleware, productController.addProduct);

// Actualizar un producto
router.put('/:pid', uploadMiddleware, productController.updateProduct);

// Eliminar un producto
router.delete('/:pid', productController.deleteProduct);

export default router;