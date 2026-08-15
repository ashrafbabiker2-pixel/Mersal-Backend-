import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types.js';

/**
 * Authorize middleware: Restricts access to specified roles
 * Usage: authorizeRoles('admin') or authorizeRoles('admin', 'employee')
 */
export function authorizeRoles(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'غير مصرح: يجب تسجيل الدخول أولاً',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      const roleArabic = {
        admin: 'الإدارة',
        employee: 'الموظفين / المناديب',
        customer: 'العملاء',
      };

      const allowedArabic = allowedRoles.map((r) => roleArabic[r] || r).join(' أو ');
      const userRoleArabic = roleArabic[req.user.role] || req.user.role;

      res.status(403).json({
        success: false,
        message: `تم رفض الوصول: هذه العملية مخصصة لـ (${allowedArabic}) فقط، ودورك الحالي هو (${userRoleArabic})`,
        requiredRoles: allowedRoles,
        currentRole: req.user.role,
      });
      return;
    }

    next();
  };
}
