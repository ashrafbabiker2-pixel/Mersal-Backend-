import { Router } from 'express';
import { AdminController } from '../controllers/admin_controller.js';
import { protect } from '../middleware/auth_middleware.js';
import { authorizeRoles } from '../middleware/role_middleware.js';

const router = Router();

// Admin routes require admin role
router.use(protect);
router.use(authorizeRoles('admin'));

// Metrics
router.get('/stats', AdminController.getDashboardStats);

// Orders management
router.get('/orders', AdminController.getAllOrders);
router.patch('/orders/:id/assign', AdminController.assignEmployeeToOrder);
router.patch('/orders/:id/status', AdminController.overrideOrderStatus);

// Users management
router.get('/users', AdminController.getAllUsers);
router.post('/create-employee', AdminController.createEmployee);
router.patch('/users/:id/toggle-status', AdminController.toggleUserStatus);

// System Logs
router.get('/logs', AdminController.getSystemLogs);

export default router;
