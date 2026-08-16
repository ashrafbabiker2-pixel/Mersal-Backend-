const Session =
  require('../models/session_model');

/*
|--------------------------------------------------------------------------
| Get Current Sessions
|--------------------------------------------------------------------------
*/

const getMySessions =
  async (req, res, next) => {
    try {
      const sessions =
        await Session.find({
          user: req.user._id,
          isRevoked: false,
          expiresAt: {
            $gt: new Date()
          }
        })
        .select(
          'deviceName platform ipAddress userAgent lastActivityAt createdAt expiresAt'
        )
        .sort({
          lastActivityAt: -1
        });

      res.status(200).json({
        success: true,
        count: sessions.length,
        data: sessions
      });
    } catch (error) {
      next(error);
    }
  };

/*
|--------------------------------------------------------------------------
| Logout Current Session
|--------------------------------------------------------------------------
*/

const logoutCurrentSession =
  async (req, res, next) => {
    try {
      req.session.isRevoked =
        true;

      req.session.revokedAt =
        new Date();

      await req.session.save();

      res.status(200).json({
        success: true,
        message:
          'تم تسجيل الخروج من الجلسة الحالية'
      });
    } catch (error) {
      next(error);
    }
  };

/*
|--------------------------------------------------------------------------
| Logout All Sessions
|--------------------------------------------------------------------------
*/

const logoutAllSessions =
  async (req, res, next) => {
    try {
      await Session.updateMany(
        {
          user: req.user._id,
          isRevoked: false
        },
        {
          isRevoked: true,
          revokedAt: new Date()
        }
      );

      res.status(200).json({
        success: true,
        message:
          'تم تسجيل الخروج من جميع الجلسات'
      });
    } catch (error) {
      next(error);
    }
  };

/*
|--------------------------------------------------------------------------
| Revoke Specific Session
|--------------------------------------------------------------------------
*/

const revokeSession =
  async (req, res, next) => {
    try {
      const session =
        await Session.findOne({
          _id: req.params.sessionId,
          user: req.user._id,
          isRevoked: false
        });

      if (!session) {
        return res.status(404).json({
          success: false,
          message:
            'الجلسة غير موجودة'
        });
      }

      session.isRevoked =
        true;

      session.revokedAt =
        new Date();

      await session.save();

      res.status(200).json({
        success: true,
        message:
          'تم إنهاء الجلسة بنجاح'
      });
    } catch (error) {
      next(error);
    }
  };

module.exports = {
  getMySessions,
  logoutCurrentSession,
  logoutAllSessions,
  revokeSession
};
