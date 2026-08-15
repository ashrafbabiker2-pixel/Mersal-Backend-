import { Router } from 'express';
import { UserController } from '../controllers/user_controller.js';
import { protect } from '../middleware/auth_middleware.js';

const router = Router();

// Protected user routes
router.use(protect);

router.patch('/profile', UserController.updateProfile);
router.post('/change-password', UserController.changePassword);

export default router;
