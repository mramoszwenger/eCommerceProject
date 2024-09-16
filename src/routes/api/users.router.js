import { Router } from 'express';
import userController from '../../controllers/users.controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';
import { uploader } from '../../utils/multer.js';

const router = Router();

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/reset-password/:token', userController.sendPasswordResetEmail);
router.post('/reset/:token', userController.resetPassword);
router.post('/:uid/documents', authMiddleware(['user', 'premium', 'admin']), uploader.array('documents', 5), userController.uploadDocuments);
router.get('/', authMiddleware(['admin']), userController.getAllUsers);
router.get('/:uid', authMiddleware(['admin']), userController.getUserById);
router.put('/:uid', authMiddleware(['admin']), userController.updateUser);
router.put('/premium/:uid', authMiddleware(['admin']), userController.changeUserRoleToPremium);
router.delete('/:uid', authMiddleware(['admin']), userController.deleteUser);
router.delete('/inactive', authMiddleware(['admin']), userController.deleteInactiveUsers);

export default router;