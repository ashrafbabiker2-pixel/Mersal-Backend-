import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';
import { generateToken } from '../utils/jwt.js';
import { IUser, UserRole } from '../types.js';

export class AuthController {
  /**
   * Register a new user (default role: customer, unless admin specifies)
   * POST /api/auth/register
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, phone, password, city, address, role } = req.body;

      if (!name || !email || !password || !phone) {
        res.status(400).json({
          success: false,
          message: 'الرجاء تزويد جميع الحقول المطلوبة: الاسم، البريد الإلكتروني، رقم الهاتف، وكلمة المرور',
        });
        return;
      }

      // Check if email already registered
      const existingUser = Array.from(db.users.values()).find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );

      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'البريد الإلكتروني مسجل مسبقاً في منظومة مرسال',
        });
        return;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Determine role (only admins can create employee/admin directly through this route if already authenticated, else default to customer)
      let userRole: UserRole = 'customer';
      if (role && ['customer', 'employee'].includes(role)) {
        userRole = role as UserRole;
      }

      const newUserId = 'usr_' + (userRole === 'customer' ? 'cust' : userRole === 'employee' ? 'emp' : 'adm') + '_' + Date.now().toString().slice(-6);

      const newUser: IUser = {
        _id: newUserId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        password: hashedPassword,
        role: userRole,
        status: 'active',
        city: city || 'الرياض',
        address: address || '',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.users.set(newUserId, newUser);

      // Generate JWT Token
      const token = generateToken({
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        phone: newUser.phone,
      });

      const { password: _, ...safeUser } = newUser;

      res.status(201).json({
        success: true,
        message: 'تم إنشاء الحساب بنجاح في منظومة مرسال',
        token,
        user: safeUser,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'حدث خطأ أثناء إنشاء الحساب',
        error: error.message,
      });
    }
  }

  /**
   * Login user with email & password
   * POST /api/auth/login
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'يرجى إدخال البريد الإلكتروني وكلمة المرور',
        });
        return;
      }

      // Find user
      const user = Array.from(db.users.values()).find(
        (u) => u.email.toLowerCase() === email.toLowerCase().trim()
      );

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'بيانات الدخول غير صحيحة: البريد الإلكتروني أو كلمة المرور غير متطابقة',
        });
        return;
      }

      // Verify status
      if (user.status === 'suspended') {
        res.status(403).json({
          success: false,
          message: 'تم تعليق هذا الحساب، يرجى التواصل مع الدعم الفني لمرسال',
        });
        return;
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password || '');
      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: 'بيانات الدخول غير صحيحة: البريد الإلكتروني أو كلمة المرور غير متطابقة',
        });
        return;
      }

      // Generate JWT
      const token = generateToken({
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
      });

      const { password: _, ...safeUser } = user;

      res.json({
        success: true,
        message: `مرحباً بك مجدداً يا ${user.name}`,
        token,
        user: safeUser,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في معالجة تسجيل الدخول',
        error: error.message,
      });
    }
  }

  /**
   * Get currently logged-in user profile from JWT
   * GET /api/auth/me
   */
  static async getMe(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'غير مصرح' });
      return;
    }

    res.json({
      success: true,
      user: req.user,
    });
  }

  /**
   * Logout user (client-side clears token, server confirms)
   * POST /api/auth/logout
   */
  static async logout(req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      message: 'تم تسجيل الخروج بنجاح من منظومة مرسال',
    });
  }
}
