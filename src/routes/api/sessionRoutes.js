import express from 'express';
import SessionController from '../../controllers/sessionController.js';
import { isAuthenticated, isNotAuthenticated } from '../../middlewares/auth.js';

const router = express.Router();

router.post('/login', isNotAuthenticated, SessionController.login);
router.post('/register', isNotAuthenticated, SessionController.register);
router.post('/logout', isAuthenticated, SessionController.logout);
router.get('/current', isAuthenticated, SessionController.getCurrentUser);

export default router;
