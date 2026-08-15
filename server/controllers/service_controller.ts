import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { IService } from '../types.js';

export class ServiceController {
  /**
   * Get all active services for public/customers
   * GET /api/services
   */
  static async getAllServices(req: Request, res: Response): Promise<void> {
    try {
      const services = Array.from(db.services.values()).filter((s) => s.active);
      res.json({
        success: true,
        count: services.length,
        services,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'فشل في استرجاع قائمة الخدمات',
        error: error.message,
      });
    }
  }

  /**
   * Get single service by ID
   * GET /api/services/:id
   */
  static async getServiceById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const service = db.services.get(id);

      if (!service) {
        res.status(404).json({ success: false, message: 'الخدمة غير موجودة' });
        return;
      }

      res.json({
        success: true,
        service,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'فشل في جلب تفاصيل الخدمة',
        error: error.message,
      });
    }
  }

  /**
   * Create service (Admin only)
   * POST /api/services
   */
  static async createService(req: Request, res: Response): Promise<void> {
    try {
      const { name, nameEn, description, category, basePrice, pricePerKm, estimatedDeliveryHours, icon, features } = req.body;

      if (!name || !description || basePrice === undefined) {
        res.status(400).json({ success: false, message: 'يرجى تقديم بيانات الخدمة الأساسية' });
        return;
      }

      const id = 'srv_' + Date.now().toString().slice(-6);
      const newService: IService = {
        _id: id,
        name,
        nameEn: nameEn || name,
        description,
        category: category || 'express',
        basePrice: Number(basePrice) || 20,
        pricePerKm: Number(pricePerKm) || 1.5,
        estimatedDeliveryHours: Number(estimatedDeliveryHours) || 2,
        icon: icon || 'Package',
        features: Array.isArray(features) ? features : ['توصيل فوري', 'تتبع حي'],
        active: true,
        createdAt: new Date().toISOString(),
      };

      db.services.set(id, newService);

      res.status(201).json({
        success: true,
        message: 'تمت إضافة الخدمة بنجاح إلى منظومة مرسال',
        service: newService,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'فشل في إضافة الخدمة',
        error: error.message,
      });
    }
  }

  /**
   * Update service (Admin only)
   * PATCH /api/services/:id
   */
  static async updateService(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const service = db.services.get(id);

      if (!service) {
        res.status(404).json({ success: false, message: 'الخدمة غير موجودة' });
        return;
      }

      Object.assign(service, req.body);
      res.json({
        success: true,
        message: 'تم تحديث بيانات الخدمة بنجاح',
        service,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'فشل في تحديث الخدمة',
        error: error.message,
      });
    }
  }
}
