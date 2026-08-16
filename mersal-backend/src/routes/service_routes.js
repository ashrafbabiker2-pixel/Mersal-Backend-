const express = require('express');

const serviceController = require('../controllers/service_controller');

const authMiddleware = require('../middleware/auth_middleware');
const authorizeRoles = require('../middleware/role_middleware');

const {
  validateRequired
} = require('../middleware/validation_middleware');

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public / Customer
|--------------------------------------------------------------------------
*/

router.get(
  '/',
  serviceController.getServices
);

router.get(
  '/:serviceId',
  serviceController.getServiceById
);

/*
|--------------------------------------------------------------------------
| Management
|--------------------------------------------------------------------------
*/

router.post(
  '/',
  authMiddleware,
  authorizeRoles('manager', 'admin'),
  validateRequired([
    'name',
    'code',
    'type'
  ]),
  serviceController.createService
);

router.patch(
  '/:serviceId',
  authMiddleware,
  authorizeRoles('manager', 'admin'),
  serviceController.updateService
);

router.patch(
  '/:serviceId/deactivate',
  authMiddleware,
  authorizeRoles('manager', 'admin'),
  serviceController.deactivateService
);

module.exports = router;
