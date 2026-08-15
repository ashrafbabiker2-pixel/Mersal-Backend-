import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { IOrder, ILocationInfo, IPackageDetails, ITimelineEvent } from '../types.js';

export class OrderController {
  /**
   * Create a new order
   * POST /api/orders
   * CRITICAL SECURITY RULE: customer identity is ALWAYS extracted from req.user._id (JWT)
   * The customerId sent in body (if any) is completely ignored.
   */
  static async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const customerId = req.user!._id; // Extracted strictly from JWT
      const {
        serviceId,
        sender,
        receiver,
        package: packageInfo,
        paymentMethod = 'cash_on_delivery',
        codAmount = 0,
        estimatedDistanceKm = 12,
      } = req.body;

      if (!serviceId || !sender || !receiver || !packageInfo) {
        res.status(400).json({
          success: false,
          message: 'يرجى تقديم كافة بيانات الشحنة: نوع الخدمة، بيانات المرسل، بيانات المستلم، وتفاصيل الطرد',
        });
        return;
      }

      // Check service
      const service = db.services.get(serviceId);
      if (!service || !service.active) {
        res.status(400).json({
          success: false,
          message: 'الخدمة المطلوبة غير متوفرة أو غير نشطة حالياً',
        });
        return;
      }

      // Validate sender & receiver minimums
      if (!sender.name || !sender.phone || !sender.city || !sender.district) {
        res.status(400).json({
          success: false,
          message: 'يرجى إكمال بيانات المرسل (الاسم، رقم الجوال، المدينة، والحي)',
        });
        return;
      }

      if (!receiver.name || !receiver.phone || !receiver.city || !receiver.district) {
        res.status(400).json({
          success: false,
          message: 'يرجى إكمال بيانات المستلم (الاسم، رقم الجوال، المدينة، والحي)',
        });
        return;
      }

      // Calculate price
      const distance = Number(estimatedDistanceKm) || 10;
      const weight = Number(packageInfo.weightKg) || 1;
      const basePrice = service.basePrice;
      const distancePrice = Math.round(distance * service.pricePerKm * 10) / 10;
      const extraWeightPrice = weight > 5 ? (weight - 5) * 4 : 0;
      const fragileFee = packageInfo.isFragile ? 10 : 0;
      const subtotal = basePrice + distancePrice + extraWeightPrice + fragileFee;
      const tax = Math.round(subtotal * 0.15 * 100) / 100; // 15% VAT
      const discount = 0;
      const totalAmount = Math.round((subtotal + tax - discount) * 100) / 100;

      // Generate random unique tracking number
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const trackingNumber = `MRS-${new Date().getFullYear()}-${randomNum}`;
      const orderId = 'ord_' + Date.now().toString().slice(-6);

      const initialTimeline: ITimelineEvent = {
        status: 'pending',
        title: 'تم إنشاء الطلب بنجاح',
        description: `تم تسجيل الطلب من قبل العميل (${req.user!.name}) عبر البوابة المركزية.`,
        timestamp: new Date().toISOString(),
        updatedBy: {
          userId: customerId,
          name: req.user!.name,
          role: req.user!.role,
        },
        location: `${sender.district}، ${sender.city}`,
      };

      const newOrder: IOrder = {
        _id: orderId,
        trackingNumber,
        customer: customerId, // Securely bound to JWT user
        service: serviceId,
        status: 'pending',
        sender: {
          name: sender.name,
          phone: sender.phone,
          city: sender.city,
          district: sender.district,
          addressDetails: sender.addressDetails || '',
          notes: sender.notes || '',
        },
        receiver: {
          name: receiver.name,
          phone: receiver.phone,
          city: receiver.city,
          district: receiver.district,
          addressDetails: receiver.addressDetails || '',
          notes: receiver.notes || '',
        },
        package: {
          title: packageInfo.title || 'طرد مرسال',
          category: packageInfo.category || 'عام',
          weightKg: weight,
          isFragile: !!packageInfo.isFragile,
          requiresCooling: !!packageInfo.requiresCooling,
          declaredValue: Number(packageInfo.declaredValue) || 0,
          instructions: packageInfo.instructions || '',
        },
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === 'online' ? 'paid' : 'pending',
        codAmount: Number(codAmount) || 0,
        pricing: {
          basePrice,
          distancePrice,
          extraWeightPrice,
          fragileFee,
          subtotal: basePrice + distancePrice + extraWeightPrice + fragileFee,
          tax,
          discount,
          totalAmount,
          estimatedDistanceKm: distance,
        },
        timeline: [initialTimeline],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.orders.set(orderId, newOrder);

      const populatedOrder = db.populateOrder(newOrder);

      res.status(201).json({
        success: true,
        message: `تم إنشاء الطلب بنجاح برقم تتبع ${trackingNumber}`,
        order: populatedOrder,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'فشل في إنشاء الطلب',
        error: error.message,
      });
    }
  }

  /**
   * Get orders of the currently authenticated customer
   * GET /api/orders/my-orders
   */
  static async getMyOrders(req: Request, res: Response): Promise<void> {
    try {
      const customerId = req.user!._id;
      const { status, search } = req.query;

      let orders = Array.from(db.orders.values()).filter((o) => {
        const cId = typeof o.customer === 'string' ? o.customer : (o.customer as any)._id;
        return cId === customerId;
      });

      if (status && status !== 'all') {
        orders = orders.filter((o) => o.status === status);
      }

      if (search && typeof search === 'string') {
        const q = search.toLowerCase();
        orders = orders.filter(
          (o) =>
            o.trackingNumber.toLowerCase().includes(q) ||
            o.receiver.name.toLowerCase().includes(q) ||
            o.package.title.toLowerCase().includes(q)
        );
      }

      // Sort newest first
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
        message: 'فشل في استرجاع طلبات العميل',
        error: error.message,
      });
    }
  }

  /**
   * Track order by tracking number (MRS-2026-XXXX)
   * GET /api/orders/track/:trackingNumber
   */
  static async trackOrderByNumber(req: Request, res: Response): Promise<void> {
    try {
      const { trackingNumber } = req.params;

      const order = Array.from(db.orders.values()).find(
        (o) => o.trackingNumber.toUpperCase() === trackingNumber.trim().toUpperCase()
      );

      if (!order) {
        res.status(404).json({
          success: false,
          message: `عذراً، لم يتم العثور على شحنة برقم التتبع: ${trackingNumber}`,
        });
        return;
      }

      const populated = db.populateOrder(order);

      // Sanitize sensitive internal notes if requester is not admin
      res.json({
        success: true,
        tracking: {
          trackingNumber: populated.trackingNumber,
          status: populated.status,
          service: populated.service,
          sender: {
            city: populated.sender.city,
            district: populated.sender.district,
          },
          receiver: {
            city: populated.receiver.city,
            district: populated.receiver.district,
            name: populated.receiver.name,
          },
          package: {
            title: populated.package.title,
            category: populated.package.category,
            isFragile: populated.package.isFragile,
          },
          assignedEmployee: populated.assignedEmployee
            ? {
                name: (populated.assignedEmployee as any).name,
                phone: (populated.assignedEmployee as any).phone,
                vehicleType: (populated.assignedEmployee as any).vehicleType,
              }
            : null,
          pricing: {
            totalAmount: populated.pricing.totalAmount,
            paymentStatus: populated.paymentStatus,
            paymentMethod: populated.paymentMethod,
          },
          timeline: populated.timeline,
          proofOfDelivery: populated.proofOfDelivery,
          createdAt: populated.createdAt,
          updatedAt: populated.updatedAt,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'خطأ في تتبع الشحنة',
        error: error.message,
      });
    }
  }

  /**
   * Get single order by ID with role check
   * GET /api/orders/:id
   */
  static async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = db.orders.get(id);

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'الطلب غير موجود',
        });
        return;
      }

      // Check ownership if role is customer
      const customerId = typeof order.customer === 'string' ? order.customer : (order.customer as any)._id;
      if (req.user!.role === 'customer' && customerId !== req.user!._id) {
        res.status(403).json({
          success: false,
          message: 'ليس لديك صلاحية لعرض هذا الطلب',
        });
        return;
      }

      const populated = db.populateOrder(order);

      res.json({
        success: true,
        order: populated,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'فشل في استرجاع بيانات الطلب',
        error: error.message,
      });
    }
  }

  /**
   * Cancel an order by customer
   * POST /api/orders/:id/cancel
   */
  static async cancelOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason = 'تم الإلغاء بطلب من العميل' } = req.body;
      const order = db.orders.get(id);

      if (!order) {
        res.status(404).json({ success: false, message: 'الطلب غير موجود' });
        return;
      }

      const customerId = typeof order.customer === 'string' ? order.customer : (order.customer as any)._id;
      if (req.user!.role === 'customer' && customerId !== req.user!._id) {
        res.status(403).json({ success: false, message: 'لا يمكنك إلغاء طلب لا يخصك' });
        return;
      }

      if (['picked_up', 'in_transit', 'delivered'].includes(order.status)) {
        res.status(400).json({
          success: false,
          message: 'لا يمكن إلغاء الطلب بعد أن تم استلامه من قبل المندوب أو تسليمه',
        });
        return;
      }

      order.status = 'cancelled';
      order.cancelReason = reason;
      order.updatedAt = new Date().toISOString();

      order.timeline.push({
        status: 'cancelled',
        title: 'تم إلغاء الطلب',
        description: `سبب الإلغاء: ${reason}`,
        timestamp: new Date().toISOString(),
        updatedBy: {
          userId: req.user!._id,
          name: req.user!.name,
          role: req.user!.role,
        },
      });

      res.json({
        success: true,
        message: 'تم إلغاء الطلب بنجاح',
        order: db.populateOrder(order),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'فشل في إلغاء الطلب',
        error: error.message,
      });
    }
  }
}
