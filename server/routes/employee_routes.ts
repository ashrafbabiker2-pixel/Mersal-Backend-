import { Router } from 'express';
import { EmployeeController } from '../controllers/employee_controller.js';
import { protect } from '../middleware/auth_middleware.js';
import { authorizeRoles } from '../middleware/role_middleware.js';

const router = Router();

// All employee routes require authentication and employee or admin role
router.use(protect);
router.use(authorizeRoles('employee', 'admin'));

// Get my tasks
router.get('/my-tasks', EmployeeController.getMyTasks);

// Get available orders to claim
router.get('/available-pool', EmployeeController.getAvailablePool);

// Claim order
router.post('/claim-order/:id', EmployeeController.claimOrder);

// Update status (picked_up, in_transit)
router.patch('/tasks/:id/status', EmployeeController.updateTaskStatus);

// Complete delivery with Proof of Delivery (POD)
router.post('/tasks/:id/complete', EmployeeController.completeDeliveryWithPOD);

export default router;
