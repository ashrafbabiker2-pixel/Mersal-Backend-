const User = require('../models/user_model');
const Session = require('../models/session_model');

const {
  verifyToken
} = require('../utils/jwt');

const authMiddleware =
  async (req, res, next) => {
    try {
      const authorization =
        req.headers.authorization;

      if (!authorization) {
        return res.status(401).json({
          success: false,
          message:
            'غير مصرح. يجب تسجيل الدخول أولاً'
        });
      }

      const parts =
        authorization.split(' ');

      if (
        parts.length !== 2 ||
        parts[0] !== 'Bearer' ||
        !parts[1]
      ) {
        return res.status(401).json({
          success: false,
          message:
            'صيغة Authorization غير صحيحة'
        });
      }

      const token =
        parts[1];

      let decoded;

      try {
        decoded =
          verifyToken(token);
      } catch (error) {
        return res.status(401).json({
          success: false,
          message:
            'رمز الدخول غير صالح أو منتهي الصلاحية'
        });
      }

      if (
        !decoded.sessionId ||
        !decoded.tokenId
      ) {
        return res.status(401).json({
          success: false,
          message:
            'جلسة الدخول غير صالحة'
        });
      }

      const session =
        await Session.findOne({
          _id: decoded.sessionId,
          tokenId: decoded.tokenId,
          user: decoded.userId,
          isRevoked: false,
          expiresAt: {
            $gt: new Date()
          }
        });

      if (!session) {
        return res.status(401).json({
          success: false,
          message:
            'جلسة الدخول منتهية أو تم تسجيل الخروج منها'
        });
      }

      const user =
        await User.findById(
          decoded.userId
        ).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message:
            'المستخدم غير موجود'
        });
      }

      if (!user.isActive) {
        await Session.updateMany(
          {
            user: user._id,
            isRevoked: false
          },
          {
            isRevoked: true,
            revokedAt: new Date()
          }
        );

        return res.status(403).json({
          success: false,
          message:
            'الحساب غير مفعل'
        });
      }

      session.lastActivityAt =
        new Date();

      await session.save();

      req.user = user;
      req.auth = decoded;
      req.session = session;

      next();
    } catch (error) {
      next(error);
    }
  };

module.exports =
  authMiddleware;
