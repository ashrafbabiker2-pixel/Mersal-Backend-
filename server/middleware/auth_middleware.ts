import { Request, Response, NextFunction } from 'express';
import { verifyToken, IJwtPayload } from '../utils/jwt.js';
import { db } from '../config/db.js';
import { IUser } from '../types.js';

// Extend Express Request interface to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      tokenPayload?: IJwtPayload;
    }
  }
}

/**
 * Protect middleware: Verifies JWT token from Authorization header (Bearer <token>)
 * Extracts user identity securely. Customer ID is ALWAYS obtained from req.user._id,
 * never trusted from client payload.
 */
export function protect(req: Request, res: Response, next: NextFunction): void {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'غير مصرح: يرجى تسجيل الدخول وإرفاق رمز الوصول JWT في الترويسة (Authorization: Bearer <token>)',
    });
    return;
  }

  try {
    const decoded = verifyToken(token);
    const user = db.users.get(decoded.id);

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'رمز الوصول غير صالح: المستخدم المرتبط بهذا الرمز لم يعد موجوداً في النظام',
      });
      return;
    }

    if (user.status === 'suspended') {
      res.status(403).json({
        success: false,
        message: 'الحساب معلق: تم إيقاف حسابك مؤقتاً، يرجى التواصل مع إدارة مرسال',
      });
      return;
    }

    // Attach safe user without password
    const { password, ...safeUser } = user;
    req.user = safeUser as IUser;
    req.tokenPayload = decoded;

    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: 'فشلت المصادقة: رمز JWT منتهي الصلاحية أو غير صحيح',
      error: error.message,
    });
    return;
  }
}
