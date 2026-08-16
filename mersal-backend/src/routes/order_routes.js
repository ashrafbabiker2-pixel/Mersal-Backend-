const express = require('express');

const orderController = require('../controllers/order_controller');

const authMiddleware = require('../middleware/auth_middleware');
const authorizeRoles = require('../middleware/role_middleware');

const {
  validateRequired
} = require('../middleware/validation_middleware');

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Customer
|--------------------------------------------------------------------------
*/

router.post(
  '/',
  authMiddleware,
  authorizeRoles('customer'),
  validateRequired([
    'serviceId'
  ]),
  orderController.createOrder
);

router.get(
  '/my',
  authMiddleware,
  authorizeRoles('customer'),
  orderController.getMyOrders
);

/*
|--------------------------------------------------------------------------
| Management / Staff
|--------------------------------------------------------------------------
*/

router.get(
  '/',
  authMiddleware,
  authorizeRoles(
    'employee',
    'supervisor',
    'manager',
    'admin'
  ),
  orderController.getOrders
);

router.get(
  '/:orderId',
  authMiddleware,
  orderController.getOrderById
);

router.patch(
  '/:orderId/assign',
  authMiddleware,
  authorizeRoles(
    'supervisor',
    'manager',
    'admin'
  ),
  validateRequired([
    'employeeId'
  ]),
  orderController.assignEmployee
);

router.patch(
  '/:orderId/status',
  authMiddleware,
  authorizeRoles(
    'employee',
    'supervisor',
    'manager',
    'admin'
  ),
  validateRequired([
    'status'
  ]),
  orderController.updateOrderStatus
);

module.exports = router;
