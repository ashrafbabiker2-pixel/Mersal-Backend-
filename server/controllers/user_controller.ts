import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';

export class UserController {
  /**
   * Update profile of current authenticated user
   * PATCH /api/users/profile
   */
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = db.users.get(req.user!._id);
      if (!user) {
        res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
        return;
      }

      const { name, phone, city, address, avatar, vehicleType, vehiclePlate } = req.body;

      if (name) user.name = name.trim();
      if (phone) user.phone = phone.trim();
      if (city) user.city = city.trim();
      if (address !== undefined) user.address = address;
      if (avatar) user.avatar = avatar;

      if (user.role === 'employee') {
        if (vehicleType) user.vehicleType = vehicleType;
        if (vehiclePlate !== undefined) user.vehiclePlate = vehiclePlate;
      }

      user.updatedAt = new Date().toISOString();

      const { password, ...safeUser } = user;

      res.json({
        success: true,
        message: 'تم تحديث الملف الشخصي بنجاح',
        user: safeUser,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'فشل في تحديث الملف الشخصي',
        error: error.message,
      });
    }
  }

  /**
   * Change password
   * POST /api/users/change-password
   */
  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = db.users.get(req.user!._id);

      if (!user) {
        res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
        return;
      }

      if (!currentPassword || !newPassword) {
        res.status(400).json({ success: false, message: 'يرجى تقديم كلمة المرور الحالية والجديدة' });
        return;
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password || '');
      if (!isMatch) {
        res.status(400).json({ success: false, message: 'كلمة المرور الحالية غير صحيحة' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      user.updatedAt = new Date().toISOString();

      res.json({
        success: true,
        message: 'تم تغيير كلمة المرور بنجاح',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'فشل في تغيير كلمة المرور',
        error: error.message,
      });
    }
  }
}
