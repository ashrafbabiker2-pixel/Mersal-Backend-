const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const mongoose = require('mongoose');

const User = require('../models/user_model');
const Session = require('../models/session_model');
const { generateToken } = require('../utils/jwt');

/*
|--------------------------------------------------------------------------
| Helper: Create Session
|--------------------------------------------------------------------------
*/

const createSession = async (user, req) => {
  const sessionId = new mongoose.Types.ObjectId();

  const expiresInDays = Number(
    process.env.SESSION_EXPIRES_DAYS || 7
  );

  const expiresAt = new Date(
    Date.now() + expiresInDays * 24 * 60 * 60 * 1000
  );

  const tokenData = generateToken(
    user,
    sessionId.toString()
  );

  const session = await Session.create({
    _id: sessionId,
    user: user._id,
    tokenId: tokenData.tokenId,

    deviceName:
      req.body.deviceName ||
      'Unknown Device',

    platform:
      req.body.platform ||
      'unknown',

    ipAddress:
      req.ip || null,

    userAgent:
      req.headers['user-agent'] ||
      null,

    expiresAt
  });

  return {
    token: tokenData.token,
    sessionId: session._id.toString()
  };
};

/*
|--------------------------------------------------------------------------
| Register
|--------------------------------------------------------------------------
*/

const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      password
    } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'الاسم والبريد ورقم الهاتف وكلمة المرور مطلوبة'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور يجب ألا تقل عن 6 أحرف'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();

    const existingEmail = await User.findOne({
      email: normalizedEmail
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'البريد الإلكتروني مستخدم بالفعل'
      });
    }

    const existingPhone = await User.findOne({
      phone: normalizedPhone
    });

    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: 'رقم الهاتف مستخدم بالفعل'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      password: hashedPassword,

      // التسجيل العام ينشئ Customer فقط.
      role: 'customer',

      isActive: true
    });

    const session = await createSession(user, req);

    return res.status(201).json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح',

      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt
        },

        token: session.token,
        sessionId: session.sessionId
      }
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/

const login = async (req, res, next) => {
  try {
    const {
      email,
      password
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني وكلمة المرور مطلوبان'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'الحساب غير مفعل'
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
      });
    }

    user.lastLoginAt = new Date();

    await user.save();

    const session = await createSession(user, req);

    return res.status(200).json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',

      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
          lastLoginAt: user.lastLoginAt
        },

        token: session.token,
        sessionId: session.sessionId
      }
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Current User
|--------------------------------------------------------------------------
*/

const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/

const logout = async (req, res, next) => {
  try {
    if (req.session) {
      req.session.isRevoked = true;
      req.session.revokedAt = new Date();
      await req.session.save();
    }

    return res.status(200).json({
      success: true,
      message: 'تم تسجيل الخروج بنجاح'
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Request Password Reset
|--------------------------------------------------------------------------
*/

const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني مطلوب'
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    /*
    |--------------------------------------------------------------------------
    | لا نكشف وجود الحساب
    |--------------------------------------------------------------------------
    */

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'إذا كان الحساب موجوداً فسيتم إنشاء طلب استعادة كلمة المرور'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.passwordResetExpires = new Date(
      Date.now() + 15 * 60 * 1000
    );

    await user.save();

    /*
    |--------------------------------------------------------------------------
    | في الإنتاج سيتم إرسال الرابط عبر
    | قناة الاستعادة المعتمدة.
    |--------------------------------------------------------------------------
    */

    res.status(200).json({
      success: true,
      message: 'تم إنشاء طلب استعادة كلمة المرور',

      data: {
        resetToken
      }
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Reset Password
|--------------------------------------------------------------------------
*/

const resetPassword = async (req, res, next) => {
  try {
    const {
      token,
      newPassword
    } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'رمز الاستعادة وكلمة المرور الجديدة مطلوبان'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور يجب ألا تقل عن 6 أحرف'
      });
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,

      passwordResetExpires: {
        $gt: new Date()
      }
    }).select('+password');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'رمز الاستعادة غير صالح أو منتهي الصلاحية'
      });
    }

    user.password = await bcrypt.hash(
      newPassword,
      12
    );

    user.passwordResetToken = null;

    user.passwordResetExpires = null;

    await user.save();

    /*
    |--------------------------------------------------------------------------
    | إبطال جميع الجلسات القديمة
    |--------------------------------------------------------------------------
    */

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

    res.status(200).json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح. يجب تسجيل الدخول من جديد.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout,
  requestPasswordReset,
  resetPassword
};
