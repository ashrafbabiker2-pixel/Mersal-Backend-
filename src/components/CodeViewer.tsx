import React, { useState } from 'react';
import {
  FileCode,
  Folder,
  FolderOpen,
  Copy,
  Check,
  Server,
  Shield,
  Database,
  Layers,
  FileText,
} from 'lucide-react';

interface CodeFile {
  path: string;
  name: string;
  category: string;
  language: string;
  description: string;
  content: string;
}

const BACKEND_FILES: CodeFile[] = [
  {
    path: 'server.ts',
    name: 'server.ts',
    category: 'Core Entry',
    language: 'typescript',
    description: 'نقطة انطلاق الخادم المركزي (Node.js + Express) وربط المسارات والميدلوير',
    content: `import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { authRouter } from "./server/routes/auth_routes";
import { orderRouter } from "./server/routes/order_routes";
import { serviceRouter } from "./server/routes/service_routes";
import { employeeRouter } from "./server/routes/employee_routes";
import { adminRouter } from "./server/routes/admin_routes";
import { userRouter } from "./server/routes/user_routes";
import { loggerMiddleware } from "./server/middleware/logger_middleware";
import { db } from "./server/config/db";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Global Middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(loggerMiddleware);

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      service: "Mersal Logistics Core Backend",
      timestamp: new Date().toISOString(),
      database: "connected (MongoDB simulated store)",
    });
  });

  // REST API Routes
  app.use("/api/auth", authRouter);
  app.use("/api/orders", orderRouter);
  app.use("/api/services", serviceRouter);
  app.use("/api/employees", employeeRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/users", userRouter);

  // Vite middleware for SPA
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(\`Mersal Backend running on http://0.0.0.0:\${PORT}\`);
  });
}

startServer();`,
  },
  {
    path: 'server/middleware/auth_middleware.ts',
    name: 'auth_middleware.ts',
    category: 'Security & Auth',
    language: 'typescript',
    description: 'التحقق من توكن JWT واستخراج هوية المستخدم ومنع العبث بالهوية',
    content: `import { Request, Response, NextFunction } from 'express';
import { verifyJwtToken } from '../utils/jwt';
import { db } from '../config/db';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: 'admin' | 'employee' | 'customer';
    name: string;
  };
}

export const authenticateJwt = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'غير مصرح: يرجى تضمين توكن المصادقة Bearer JWT في الترويسة',
    });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyJwtToken(token);

  if (!payload) {
    return res.status(401).json({
      success: false,
      message: 'رمز المصادقة غير صالح أو منتهي الصلاحية',
    });
  }

  // Verify user still exists & active in DB
  const user = db.users.find((u) => u._id === payload.userId);
  if (!user || user.status === 'suspended') {
    return res.status(401).json({
      success: false,
      message: 'الحساب غير متاح أو تم تعليقه من قبل الإدارة',
    });
  }

  req.user = {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    name: user.name,
  };

  next();
};`,
  },
  {
    path: 'server/middleware/role_middleware.ts',
    name: 'role_middleware.ts',
    category: 'Security & Auth',
    language: 'typescript',
    description: 'التحقق من أدوار وصلاحيات المستخدمين (RBAC) وإرجاع كود 403 عند محاولة الوصول غير المصرح',
    content: `import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth_middleware';
import { UserRole } from '../types';

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح: يجب تسجيل الدخول أولاً',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: \`صلاحيات غير كافية: هذا الإجراء مخصص لأدوار [\${allowedRoles.join(', ')}] فقط. دورك الحالي: \${req.user.role}\`,
      });
    }

    next();
  };
};`,
  },
  {
    path: 'server/controllers/order_controller.ts',
    name: 'order_controller.ts',
    category: 'Business Logic',
    language: 'typescript',
    description: 'منطق إنشاء الشحنات مع استخراج customerId من JWT وحساب الأسعار والتتبع',
    content: `import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth_middleware';
import { db } from '../config/db';
import { IOrder, OrderTimelineEvent } from '../types';

export const orderController = {
  // POST /api/orders (Customer creates order)
  createOrder: (req: AuthenticatedRequest, res: Response) => {
    try {
      const customerId = req.user!.userId; // Extracted safely from JWT
      const {
        serviceId,
        sender,
        receiver,
        package: pkg,
        paymentMethod = 'cash_on_delivery',
        estimatedDistanceKm = 10,
      } = req.body;

      if (!serviceId || !sender?.name || !receiver?.name || !pkg?.title) {
        return res.status(400).json({
          success: false,
          message: 'يرجى إكمال الحقول الإلزامية لإنشاء الشحنة',
        });
      }

      const service = db.services.find((s) => s._id === serviceId);
      if (!service) {
        return res.status(404).json({ success: false, message: 'الخدمة المختارة غير موجودة' });
      }

      // Dynamic Pricing Calculation
      const basePrice = service.basePrice;
      const distancePrice = Math.round(estimatedDistanceKm * service.pricePerKm * 100) / 100;
      const fragileFee = pkg.isFragile ? 10 : 0;
      const subtotal = basePrice + distancePrice + fragileFee;
      const tax = Math.round(subtotal * 0.15 * 100) / 100;
      const totalAmount = Math.round((subtotal + tax) * 100) / 100;

      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const trackingNumber = \`MRS-\${new Date().getFullYear()}-\${randomDigits}\`;

      const initialTimeline: OrderTimelineEvent = {
        status: 'pending',
        title: 'تم إنشاء الطلب بنجاح',
        description: \`تم تسجيل الشحنة برقم تتبع \${trackingNumber} بواسطة العميل\`,
        timestamp: new Date().toISOString(),
        updatedBy: {
          id: customerId,
          name: req.user!.name,
          role: req.user!.role,
        },
        location: \`\${sender.city} - حي \${sender.district}\`,
      };

      const newOrder: IOrder = {
        _id: \`ord_\${Date.now()}\`,
        trackingNumber,
        customer: customerId,
        service: serviceId,
        sender,
        receiver,
        package: pkg,
        pricing: {
          basePrice,
          distancePrice,
          fragileFee,
          subtotal,
          tax,
          totalAmount,
        },
        paymentMethod,
        paymentStatus: paymentMethod === 'online' ? 'paid' : 'pending',
        status: 'pending',
        timeline: [initialTimeline],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.orders.unshift(newOrder);

      return res.status(201).json({
        success: true,
        message: 'تم إنشاء الشحنة بنجاح وحفظها في قاعدة البيانات',
        order: newOrder,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};`,
  },
  {
    path: 'server/controllers/employee_controller.ts',
    name: 'employee_controller.ts',
    category: 'Business Logic',
    language: 'typescript',
    description: 'منطق تطبيق الموظف: استلام المهام، تحديث المسار، وتوثيق POD',
    content: `import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth_middleware';
import { db } from '../config/db';
import { OrderTimelineEvent } from '../types';

export const employeeController = {
  // POST /api/employees/tasks/:id/complete (Submit POD)
  completeDelivery: (req: AuthenticatedRequest, res: Response) => {
    try {
      const employeeId = req.user!.userId;
      const { id } = req.params;
      const { recipientName, notes, signatureReceived } = req.body;

      const order = db.orders.find((o) => o._id === id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'الشحنة غير موجودة' });
      }

      const confirmationCode = \`POD-\${Math.random().toString(36).substring(2, 8).toUpperCase()}\`;

      order.status = 'delivered';
      order.proofOfDelivery = {
        deliveredAt: new Date().toISOString(),
        recipientName: recipientName || order.receiver.name,
        confirmationCode,
        notes: notes || 'تم التسليم بنجاح',
        signatureReceived: !!signatureReceived,
      };

      order.paymentStatus = 'paid';
      order.updatedAt = new Date().toISOString();

      const deliveredTimeline: OrderTimelineEvent = {
        status: 'delivered',
        title: 'تم التسليم بنجاح (Delivered)',
        description: \`تم تسليم الشحنة للمستلم [\${order.proofOfDelivery.recipientName}] وتوثيق كود الإثبات \${confirmationCode}\`,
        timestamp: new Date().toISOString(),
        updatedBy: {
          id: employeeId,
          name: req.user!.name,
          role: 'employee',
        },
        location: \`\${order.receiver.city} - حي \${order.receiver.district}\`,
      };

      order.timeline.push(deliveredTimeline);

      return res.json({
        success: true,
        message: 'تم توثيق إثبات التسليم وإغلاق الشحنة بنجاح',
        order,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },
};`,
  },
  {
    path: 'flutter_integration_guide.dart',
    name: 'flutter_service.dart',
    category: 'Flutter Clients',
    language: 'dart',
    description: 'نموذج كود كلاس خدمة Dart / Flutter للتواصل مع خادم مرسال المركزي بـ JWT',
    content: `import 'dart:convert';
import 'package:http/http.dart' as http;

class MersalApiService {
  static const String baseUrl = "https://your-domain.com/api";
  String? _jwtToken;

  void setToken(String token) {
    _jwtToken = token;
  }

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (_jwtToken != null) 'Authorization': 'Bearer $_jwtToken',
  };

  // 1. Customer Login
  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['success'] == true) {
      setToken(data['token']);
    }
    return data;
  }

  // 2. Customer Create Order (JWT identifies user)
  Future<Map<String, dynamic>> createOrder(Map<String, dynamic> payload) async {
    final response = await http.post(
      Uri.parse('$baseUrl/orders'),
      headers: _headers,
      body: jsonEncode(payload),
    );
    return jsonDecode(response.body);
  }

  // 3. Driver Complete Delivery with POD
  Future<Map<String, dynamic>> completeTask(String orderId, String recipient, String notes) async {
    final response = await http.post(
      Uri.parse('$baseUrl/employees/tasks/$orderId/complete'),
      headers: _headers,
      body: jsonEncode({
        'recipientName': recipient,
        'notes': notes,
        'signatureReceived': true,
      }),
    );
    return jsonDecode(response.body);
  }
}`,
  },
];

export const CodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(BACKEND_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              مستكشف الكود البرمجي للمنظومة (Mersal Backend Source Explorer)
            </h3>
            <p className="text-xs text-slate-400">
              استعراض الهيكلية المعمارية، الميدلوير، وحدات التحكم، ونماذج التكامل مع تطبيقات Flutter
            </p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'تم نسخ الملف' : 'نسخ كود الملف الحالي'}</span>
        </button>
      </div>

      {/* Code Browser Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Files List */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-bold text-slate-400 mb-2 px-1">
            ملفات بنية الخادم المفتوحة:
          </div>
          <div className="space-y-1.5">
            {BACKEND_FILES.map((file, i) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-right p-3 rounded-xl border transition cursor-pointer flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-purple-950/60 border-purple-500 text-white ring-1 ring-purple-500/30'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-purple-400" />
                      {file.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 font-mono">
                      {file.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{file.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Code Viewer */}
        <div className="lg:col-span-8 space-y-2">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 text-xs">
              <span className="text-purple-400 font-bold">{selectedFile.path}</span>
              <span className="text-slate-500 uppercase">{selectedFile.language}</span>
            </div>
            <pre className="text-xs text-emerald-300 overflow-x-auto max-h-[550px] leading-relaxed pr-2 font-mono">
              {selectedFile.content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
