import { Router } from 'express';
import productController from '../../controllers/products.controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';

const router = Router();

// console.log('productController:', productController);

router.get('/', productController.getAllProducts);
// console.log('Route GET /api/products called');
router.get('/:pid', productController.getProductById);
router.post('/', authMiddleware, productController.addProduct);
// console.log('Route POST /api/products called');
router.put('/:pid', authMiddleware(['admin']), productController.updateProduct);
// console.log('Route PUT /api/products/:pid called');
router.delete('/:pid', authMiddleware(['admin']), productController.deleteProduct);
// console.log('Route DELETE /api/products/:pid called');

export default router;