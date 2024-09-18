import { Router } from 'express';
import productController from '../../controllers/products.controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';

const router = Router();

router.get('/', productController.getAllProducts);
router.get('/:pid', productController.getProductById);
router.post('/', authMiddleware(['admin', 'premium']), productController.addProduct);
router.put('/:pid', authMiddleware(['admin']), productController.updateProduct);
router.delete('/:pid', authMiddleware(['admin']), productController.deleteProduct);
router.get('/new', authMiddleware(['admin', 'premium']), productController.renderAddProductForm);
router.get('/:pid/edit', authMiddleware(['admin']), productController.renderEditProductForm);

export default router;