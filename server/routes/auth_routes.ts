import { Router } from 'express';
import { AuthController } from '../controllers/auth_controller.js';
import { protect } from '../middleware/auth_middleware.js';

const router = Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);

// Protected route
router.get('/me', protect, AuthController.getMe);

export default router;
