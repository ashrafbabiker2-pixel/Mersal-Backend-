import { Router } from 'express';
import { OrderController } from '../controllers/order_controller.js';
import { protect } from '../middleware/auth_middleware.js';
import { authorizeRoles } from '../middleware/role_middleware.js';

const router = Router();

// Public order tracking
router.get('/track/:trackingNumber', OrderController.trackOrderByNumber);

// Customer protected routes (Customer identity strictly verified via JWT)
router.post('/', protect, authorizeRoles('customer', 'admin'), OrderController.createOrder);
router.get('/my-orders', protect, authorizeRoles('customer'), OrderController.getMyOrders);
router.get('/:id', protect, OrderController.getOrderById);
router.post('/:id/cancel', protect, authorizeRoles('customer', 'admin'), OrderController.cancelOrder);

export default router;
