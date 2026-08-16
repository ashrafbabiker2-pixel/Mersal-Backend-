const express = require('express');

const authController = require('../controllers/auth_controller');
const authMiddleware = require('../middleware/auth_middleware');

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

router.post(
  '/register',
  authController.register
);

router.post(
  '/login',
  authController.login
);

router.post(
  '/password-reset/request',
  authController.requestPasswordReset
);

router.post(
  '/password-reset/confirm',
  authController.resetPassword
);

/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
*/

router.get(
  '/me',
  authMiddleware,
  authController.getMe
);

router.post(
  '/logout',
  authMiddleware,
  authController.logout
);

module.exports = router;
