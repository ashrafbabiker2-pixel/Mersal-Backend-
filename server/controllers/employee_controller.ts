import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { OrderStatus, ITimelineEvent, IProofOfDelivery } from '../types.js';

export class EmployeeController {
  /**
   * Get all tasks assigned to the logged-in employee
   * GET /api/employees/my-tasks
   */
  static async getMyTasks(req: Request, res: Response): Promise<void> {
    try {
      const employeeId = req.user!._id;
      const { status } = req.query;

      let orders = Array.from(db.orders.values()).filter((o) => {
        const empId = typeof o.assignedEmployee === 'string' ? o.assignedEmployee : (o.assignedEmployee as any)?._id;
        return empId === employeeId;
      });

      if (status === 'active') {
        orders = orders.filter((o) => ['assigned', 'picked_up', 'in_transit'].includes(o.status));
      } else if (status === 'completed') {
        orders = orders.filter((o) => ['delivered', 'cancelled'].includes(o.status));
      } else if (status && status !== 'all') {
        orders = orders.filter((o) => o.status === status);
      }

      orders.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      const populated = orders.map((o) => db.populateOrder(o));

      res.json({
        success: true,
        count: populated.length,
        tasks: populated,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'فشل في استرجاع مهام المندوب',
        error: error.message,
      });
    }
  }

  /**
   * Get orders available in the pool (confirmed but not yet assigned to any driver)
   * GET /api/employees/available-pool
   */
  static async getAvailablePool(req: Request, res: Response): Promise<void> {
    try {
      const orders = Array.from(db.orders.values())
        .filter((o) => o.status === 'confirmed' && !o.assignedEmployee)
        .map((o) => db.populateOrder(o));

      res.json({
        success: true,
        count: orders.length,
        orders,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'فشل في استرجاع قائمة الشحنات المتاحة',
        error: error.message,
      });
    }
  }

  /**
   * Employee claims an available order
   * POST /api/employees/claim-order/:id
   */
  static async claimOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const employeeId = req.user!._id;
      const order = db.orders.get(id);

      if (!order) {
        res.status(404).json({ success: false, message: 'الطلب غير موجود' });
        return;
      }

      if (order.assignedEmployee && order.assignedEmployee !== employeeId) {
        res.status(400).json({
          success: false,
          message: 'تم إسناد هذا الطلب لمندوب آخر بالفعل',
        });
        return;
      }

      order.assignedEmployee = employeeId;
      order.status = 'assigned';
      order.updatedAt = new Date().toISOString();

      order.timeline.push({
        status: 'assigned',
        title: 'قبول المهمة من قبل المندوب',
        description: `قام المندوب (${req.user!.name}) بقبول استلام وتوصيل الشحنة.`,
        timestamp: new Date().toISOString(),
        updatedBy: {
          userId: employeeId,
          name: req.user!.name,
          role: req.user!.role,
        },
        location: `${order.sender.district}، ${order.sender.city}`,
      });

      res.json({
        success: true,
        message: 'تم قبول المهمة بنجاح، يمكنك التوجه لاستلام الشحنة من المرسل',
        order: db.populateOrder(order),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'فشل في قبول المهمة',
        error: error.message,
      });
    }
  }

  /**
   * Update task status (picked_up, in_transit)
   * PATCH /api/employees/tasks/:id/status
   */
  static async updateTaskStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, notes, location } = req.body;
      const employeeId = req.user!._id;

      const order = db.orders.get(id);
      if (!order) {
        res.status(404).json({ success: false, message: 'الطلب غير موجود' });
        return;
      }

      // Verify employee assignment
      const assignedEmpId = typeof order.assignedEmployee === 'string' ? order.assignedEmployee : (order.assignedEmployee as any)?._id;
      if (assignedEmpId !== employeeId && req.user!.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'هذه المهمة ليست مسندة إليك',
        });
        return;
      }

      const validTransitions: Record<OrderStatus, OrderStatus[]> = {
        pending: ['accepted', 'confirmed'],
        accepted: ['assigned'],
        confirmed: ['assigned'],
        assigned: ['picked_up', 'in_progress', 'cancelled'],
        picked_up: ['in_transit', 'delivered', 'completed', 'cancelled'],
        in_transit: ['delivered', 'completed', 'cancelled'],
        in_progress: ['completed', 'delivered', 'cancelled'],
        delivered: ['completed', 'archived'],
        completed: ['archived'],
        cancelled: ['archived'],
        archived: [],
      };

      const allowed = validTransitions[order.status] || [];
      if (!allowed.includes(status)) {
        res.status(400).json({
          success: false,
          message: `لا يمكن نقل حالة الطلب من (${order.status}) إلى (${status}) مباشرة`,
          allowedNextStatuses: allowed,
        });
        return;
      }

      const titles: Record<OrderStatus, string> = {
        pending: 'تم إنشاء الطلب',
        accepted: 'قبول الطلب',
        confirmed: 'تأكيد الطلب',
        assigned: 'تم تعيين المندوب/الفني',
        picked_up: 'تم استلام الشحنة من المرسل',
        in_transit: 'الشحنة في طريق التسليم',
        in_progress: 'جاري التنفيذ والمعاينة الميدانية',
        delivered: 'تم تسليم الشحنة بنجاح للمستلم',
        completed: 'اكتملت المهمة بنجاح',
        cancelled: 'تم إلغاء الشحنة',
        archived: 'تم أرشفة السجل',
      };

      order.status = status as OrderStatus;
      order.updatedAt = new Date().toISOString();

      const timelineEvent: ITimelineEvent = {
        status: status as OrderStatus,
        title: titles[status as OrderStatus] || `تحديث الحالة إلى ${status}`,
        description: notes || `تم تحديث حالة الشحنة من قبل المندوب (${req.user!.name}).`,
        timestamp: new Date().toISOString(),
        updatedBy: {
          userId: employeeId,
          name: req.user!.name,
          role: req.user!.role,
        },
        location: location || `${order.receiver.district}، ${order.receiver.city}`,
      };

      order.timeline.push(timelineEvent);

      res.json({
        success: true,
        message: `تم تحديث حالة الشحنة إلى: ${titles[status as OrderStatus]}`,
        order: db.populateOrder(order),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'فشل في تحديث حالة الشحنة',
        error: error.message,
      });
    }
  }

  /**
   * Submit Proof of Delivery (POD) to complete order
   * POST /api/employees/tasks/:id/complete
   */
  static async completeDeliveryWithPOD(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { recipientName, recipientPhone, notes, confirmationCode, signatureReceived = true } = req.body;
      const employeeId = req.user!._id;

      const order = db.orders.get(id);
      if (!order) {
        res.status(404).json({ success: false, message: 'الطلب غير موجود' });
        return;
      }

      const assignedEmpId = typeof order.assignedEmployee === 'string' ? order.assignedEmployee : (order.assignedEmployee as any)?._id;
      if (assignedEmpId !== employeeId && req.user!.role !== 'admin') {
        res.status(403).json({ success: false, message: 'هذه المهمة غير مسندة إليك' });
        return;
      }

      if (!recipientName) {
        res.status(400).json({
          success: false,
          message: 'يرجى إدخال اسم المستلم لإثبات التسليم (POD)',
        });
        return;
      }

      const pod: IProofOfDelivery = {
        recipientName: recipientName.trim(),
        recipientPhone: recipientPhone || order.receiver.phone,
        deliveredAt: new Date().toISOString(),
        notes: notes || 'تم التسليم والمطابقة بنجاح',
        confirmationCode: confirmationCode || `POD-${Math.floor(1000 + Math.random() * 9000)}`,
        signatureReceived: !!signatureReceived,
      };

      order.status = 'delivered';
      order.paymentStatus = 'paid';
      order.proofOfDelivery = pod;
      order.updatedAt = new Date().toISOString();

      order.timeline.push({
        status: 'delivered',
        title: 'تم تسليم الشحنة بنجاح (POD)',
        description: `تم تسليم الشحنة إلى (${pod.recipientName}) برقم إثبات [${pod.confirmationCode}].`,
        timestamp: new Date().toISOString(),
        updatedBy: {
          userId: employeeId,
          name: req.user!.name,
          role: req.user!.role,
        },
        location: `${order.receiver.district}، ${order.receiver.city}`,
      });

      res.json({
        success: true,
        message: 'تهانينا! تم إتمام عملية التسليم وتوثيق إثبات الاستلام بنجاح',
        order: db.populateOrder(order),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'فشل في إتمام عملية التسليم',
        error: error.message,
      });
    }
  }
}
