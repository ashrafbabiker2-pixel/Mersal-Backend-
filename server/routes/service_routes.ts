import { Router } from 'express';
import { ServiceController } from '../controllers/service_controller.js';
import { protect } from '../middleware/auth_middleware.js';
import { authorizeRoles } from '../middleware/role_middleware.js';

const router = Router();

// Public: Browse available services & pricing
router.get('/', ServiceController.getAllServices);
router.get('/:id', ServiceController.getServiceById);

// Admin only: manage services
router.post('/', protect, authorizeRoles('admin'), ServiceController.createService);
router.patch('/:id', protect, authorizeRoles('admin'), ServiceController.updateService);

export default router;
