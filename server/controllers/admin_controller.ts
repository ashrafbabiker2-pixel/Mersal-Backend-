import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';
import { OrderStatus, IUser } from '../types.js';

export class AdminController {
  /**
   * Get comprehensive dashboard metrics
   * GET /api/admin/stats
   */
  static async getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
      const orders = Array.from(db.orders.values());
      const users = Array.from(db.users.values());
      const services = Array.from(db.services.values());

      const totalOrders = orders.length;
      const pendingOrders = orders.filter((o) => o.status === 'pending').length;
      const activeDeliveries = orders.filter((o) => ['confirmed', 'assigned', 'picked_up', 'in_transit'].includes(o.status)).length;
      const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
      const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length;

      const totalRevenue = orders
        .filter((o) => o.status === 'delivered')
        .reduce((sum, o) => sum + (o.pricing.totalAmount || 0), 0);

      const activeEmployees = users.filter((u) => u.role === 'employee' && u.status === 'active').length;
      const activeCustomers = users.filter((u) => u.role === 'customer' && u.status === 'active').length;

      const statusBreakdown = {
        pending: pendingOrders,
        confirmed: orders.filter((o) => o.status === 'confirmed').length,
        assigned: orders.filter((o) => o.status === 'assigned').length,
        picked_up: orders.filter((o) => o.status === 'picked_up').length,
        in_transit: orders.filter((o) => o.status === 'in_transit').length,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      };

      res.json({
        success: true,
        stats: {
          totalOrders,
          pendingOrders,
          activeDeliveries,
          deliveredOrders,
          cancelledOrders,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          activeEmployees,
          activeCustomers,
          totalServices: services.length,
          statusBreakdown,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'فشل في جلب إحصائيات لوحة التحكم',
        error: error.message,
      });
    }
  }

  /**
   * Get all orders across the entire Mersal platform with filters
   * GET /api/admin/orders
   */
  static async getAllOrders(req: Request, res: Response): Promise<void> {
    try {
      const { status, serviceId, employeeId, customerId, search } = req.query;

      let orders = Array.from(db.orders.values());

      if (status && status !== 'all') {
        orders = orders.filter((o) => o.status === status);
      }

      if (serviceId && serviceId !== 'all') {
        orders = orders.filter((o) => {
          const sId = typeof o.service === 'string' ? o.service : (o.service as any)._id;
          return sId === serviceId;
        });
      }

      if (employeeId && employeeId !== 'all') {
        orders = orders.filter((o) => {
          const empId = typeof o.assignedEmployee === 'string' ? o.assignedEmployee : (o.assignedEmployee as any)?._id;
          return empId === employeeId;
        });
      }

      if (customerId && customerId !== 'all') {
        orders = orders.filter((o) => {
          const cId = typeof o.customer === 'string' ? o.customer : (o.customer as any)._id;
          return cId === customerId;
        });
      }

      if (search && typeof search === 'string') {
        const q = search.toLowerCase();
        orders = orders.filter(
          (o) =>
            o.trackingNumber.toLowerCase().includes(q) ||
            o.sender.name.toLowerCase().includes(q) ||
            o.receiver.name.toLowerCase().includes(q) ||
            o.package.title.toLowerCase().includes(q)
        );
      }

      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const populated = orders.map((o) => db.populateOrder(o));

      res.json({
        success: true,
        count: populated.length,
        orders: populated,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'فشل في استرجاع قائمة الطلبات',
        error: error.message,
      });
    }
  }

  /**
   * Assign employee/driver to order
   * PATCH /api/admin/orders/:id/assign
   */
  static async assignEmployeeToOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { employeeId } = req.body;

      if (!employeeId) {
        res.status(400).json({ success: false, message: 'يرجى تحديد الموظف/المندوب' });
        return;
      }

      const order = db.orders.get(id);
      if (!order) {
        res.status(404).json({ success: false, message: 'الطلب غير موجود' });
        return;
      }

      const employee = db.users.get(employeeId);
      if (!employee || employee.role !== 'employee') {
        res.status(400).json({ success: false, message: 'المستخدم المحدد ليس موظفاً/مندوباً صالحاً' });
        return;
      }

      order.assignedEmployee = employeeId;
      if (order.status === 'pending' || order.status === 'confirmed') {
        order.status = 'assigned';
      }
      order.updatedAt = new Date().toISOString();

      order.timeline.push({
        status: order.status,
        title: 'تعيين مندوب التوصيل',
        description: `تم إسناد الشحنة رسمياً للمندوب (${employee.name}) من قبل الإدارة.`,
        timestamp: new Date().toISOString(),
        updatedBy: {
          userId: req.user!._id,
          name: req.user!.name,
          role: req.user!.role,
        },
      });

      res.json({
        success: true,
        message: `تم إسناد الطلب بنجاح إلى المندوب: ${employee.name}`,
        order: db.populateOrder(order),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'فشل في إسناد المندوب للطلب',
        error: error.message,
      });
    }
  }

  /**
   * Override order status by admin
   * PATCH /api/admin/orders/:id/status
   */
  static async overrideOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, notes = '' } = req.body;

      const validStatuses: OrderStatus[] = ['pending', 'confirmed', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({ success: false, message: 'حالة الطلب غير صالحة' });
        return;
      }

      const order = db.orders.get(id);
      if (!order) {
        res.status(404).json({ success: false, message: 'الطلب غير موجود' });
        return;
      }

      order.status = status;
      order.updatedAt = new Date().toISOString();

      const titles: Record<OrderStatus, string> = {
        pending: 'إعادة الطلب إلى قائمة الانتظار',
        accepted: 'قبول الطلب من قبل الإدارة',
        confirmed: 'تأكيد الطلب من قبل الإدارة',
        assigned: 'تعيين الطلب للمندوب أو الفني',
        picked_up: 'تأكيد استلام الشحنة',
        in_transit: 'تحديث الشحنة كـ في الطريق',
        in_progress: 'جاري التنفيذ والمعاينة الميدانية',
        delivered: 'إغلاق الشحنة كـ تم التسليم',
        completed: 'اكتمال الطلب بنجاح',
        cancelled: 'إلغاء الطلب من قبل الإدارة',
        archived: 'أرشفة الطلب',
      };

      order.timeline.push({
        status,
        title: titles[status] || `تحديث إداري: ${status}`,
        description: notes || `قام المشرف (${req.user!.name}) بتغيير حالة الطلب.`,
        timestamp: new Date().toISOString(),
        updatedBy: {
          userId: req.user!._id,
          name: req.user!.name,
          role: req.user!.role,
        },
      });

      res.json({
        success: true,
        message: `تم تحديث حالة الطلب إلى (${status}) بنجاح`,
        order: db.populateOrder(order),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'فشل في تحديث حالة الطلب',
        error: error.message,
      });
    }
  }

  /**
   * Get all registered users (customers, employees, admins)
   * GET /api/admin/users
   */
  static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const { role, status, search } = req.query;

      let users = Array.from(db.users.values()).map((u) => {
        const { password, ...safe } = u;
        return safe;
      });

      if (role && role !== 'all') {
        users = users.filter((u) => u.role === role);
      }

      if (status && status !== 'all') {
        users = users.filter((u) => u.status === status);
      }

      if (search && typeof search === 'string') {
        const q = search.toLowerCase();
        users = users.filter(
          (u) =>
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.phone.includes(q)
        );
      }

      res.json({
        success: true,
        count: users.length,
        users,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'فشل في جلب المستخدمين',
        error: error.message,
      });
    }
  }

  /**
   * Create a new employee / driver from Admin Dashboard
   * POST /api/admin/create-employee
   */
  static async createEmployee(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, phone, password, vehicleType, vehiclePlate, nationalId, city, address } = req.body;

      if (!name || !email || !password || !phone) {
        res.status(400).json({
          success: false,
          message: 'يرجى تعبئة الحقول الأساسية: الاسم، البريد، الجوال، وكلمة المرور',
        });
        return;
      }

      const existingUser = Array.from(db.users.values()).find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );
      if (existingUser) {
        res.status(400).json({ success: false, message: 'البريد الإلكتروني مسجل مسبقاً' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newId = 'usr_emp_' + Date.now().toString().slice(-6);

      const newEmp: IUser = {
        _id: newId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        password: hashedPassword,
        role: 'employee',
        vehicleType: vehicleType || 'motorcycle',
        vehiclePlate: vehiclePlate || '',
        nationalId: nationalId || '',
        status: 'active',
        city: city || 'الرياض',
        address: address || '',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.users.set(newId, newEmp);

      const { password: _, ...safeEmp } = newEmp;

      res.status(201).json({
        success: true,
        message: `تم إضافة الموظف/المندوب (${newEmp.name}) بنجاح`,
        employee: safeEmp,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'فشل في إضافة الموظف',
        error: error.message,
      });
    }
  }

  /**
   * Toggle user account status (active / suspended)
   * PATCH /api/admin/users/:id/toggle-status
   */
  static async toggleUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = db.users.get(id);

      if (!user) {
        res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
        return;
      }

      if (user._id === req.user!._id) {
        res.status(400).json({ success: false, message: 'لا يمكنك تعليق حسابك الإداري الحالي' });
        return;
      }

      user.status = user.status === 'active' ? 'suspended' : 'active';
      user.updatedAt = new Date().toISOString();

      const { password, ...safe } = user;

      res.json({
        success: true,
        message: `تم تحديث حالة المستخدم (${user.name}) إلى: ${user.status === 'active' ? 'نشط' : 'معلق'}`,
        user: safe,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'فشل في تحديث حالة الحساب',
        error: error.message,
      });
    }
  }

  /**
   * Get real-time system & API logs
   * GET /api/admin/logs
   */
  static async getSystemLogs(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 100 } = req.query;
      const logs = db.logs.slice(0, Number(limit));

      res.json({
        success: true,
        count: logs.length,
        logs,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'فشل في جلب سجلات النظام',
        error: error.message,
      });
    }
  }
}
