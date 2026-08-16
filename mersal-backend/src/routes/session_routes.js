const express =
  require('express');

const sessionController =
  require('../controllers/session_controller');

const authMiddleware =
  require('../middleware/auth_middleware');

const router =
  express.Router();

/*
|--------------------------------------------------------------------------
| Session Management
|--------------------------------------------------------------------------
*/

router.get(
  '/',
  authMiddleware,
  sessionController.getMySessions
);

router.post(
  '/logout',
  authMiddleware,
  sessionController.logoutCurrentSession
);

router.post(
  '/logout-all',
  authMiddleware,
  sessionController.logoutAllSessions
);

router.delete(
  '/:sessionId',
  authMiddleware,
  sessionController.revokeSession
);

module.exports =
  router;
