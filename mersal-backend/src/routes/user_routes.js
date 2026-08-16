const express = require('express');

const userController = require('../controllers/user_controller');

const authMiddleware = require('../middleware/auth_middleware');
const authorizeRoles = require('../middleware/role_middleware');

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Current User
|--------------------------------------------------------------------------
*/

router.get(
  '/me',
  authMiddleware,
  userController.getProfile
);

router.patch(
  '/me',
  authMiddleware,
  userController.updateProfile
);

router.patch(
  '/me/password',
  authMiddleware,
  userController.changePassword
);

/*
|--------------------------------------------------------------------------
| User Management
|--------------------------------------------------------------------------
*/

router.get(
  '/',
  authMiddleware,
  authorizeRoles(
    'manager',
    'admin'
  ),
  userController.getUsers
);

router.get(
  '/:userId',
  authMiddleware,
  authorizeRoles(
    'manager',
    'admin'
  ),
  userController.getUserById
);

/*
|--------------------------------------------------------------------------
| Staff Management
|--------------------------------------------------------------------------
*/

router.post(
  '/staff',
  authMiddleware,
  authorizeRoles(
    'manager',
    'admin'
  ),
  userController.createStaffUser
);

router.patch(
  '/:userId/role',
  authMiddleware,
  authorizeRoles(
    'manager',
    'admin'
  ),
  userController.updateUserRole
);

router.patch(
  '/:userId/activate',
  authMiddleware,
  authorizeRoles(
    'manager',
    'admin'
  ),
  userController.activateUser
);

router.patch(
  '/:userId/deactivate',
  authMiddleware,
  authorizeRoles(
    'manager',
    'admin'
  ),
  userController.deactivateUser
);

module.exports = router;
