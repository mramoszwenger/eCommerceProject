import { Router } from 'express';
import productController from '../../controllers/productController.js';
import { uploadMiddleware } from '../../middlewares/uploadMiddleware.js';

const router = Router();

router.get('/', productController.getAllProducts);
router.get('/:pid', productController.getProductById);
router.post('/', uploadMiddleware, productController.addProduct);
router.put('/:pid', uploadMiddleware, productController.updateProduct);
router.delete('/:pid', productController.deleteProduct);

export default router;