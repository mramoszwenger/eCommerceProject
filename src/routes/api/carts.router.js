import { Router } from "express";
import cartController from '../../controllers/carts.controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';

const router = Router();

router.get('/:cid', cartController.getCart);
router.post('/', cartController.createCart);
router.post('/:cid/products/:pid', authMiddleware(['user']), cartController.addProductToCart);
router.delete('/:cid/products/:pid', authMiddleware(['user']), cartController.removeProductFromCart);
router.put('/:cid', cartController.updateCart);
router.put('/:cid/products/:pid', cartController.updateProductQuantity);
router.delete('/:cid', cartController.clearCart);
router.post('/:cid/purchase', authMiddleware(['user']), cartController.purchaseCart);

export default router;