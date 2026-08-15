import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import { config } from './server/config/environment.js';
import { apiLogger } from './server/middleware/logger_middleware.js';
import { securityHeadersMiddleware } from './server/middleware/security_middleware.js';
import { globalErrorHandler } from './server/middleware/error_middleware.js';
import { v1Router } from './server/routes/v1/index.js';
import { healthRouter } from './server/routes/v1/health_routes.js';
import authRoutes from './server/routes/auth_routes.js';
import orderRoutes from './server/routes/order_routes.js';
import serviceRoutes from './server/routes/service_routes.js';
import employeeRoutes from './server/routes/employee_routes.js';
import adminRoutes from './server/routes/admin_routes.js';
import userRoutes from './server/routes/user_routes.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security & Cross-Origin Middlewares
  app.use(cors({ origin: config.cors.origin, credentials: true }));
  app.use(securityHeadersMiddleware);

  // Body Parsing Middlewares
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Real-time API Logger middleware for live telemetry
  app.use(apiLogger);

  // Mount API Version 1 Routes
  app.use('/api/v1', v1Router);

  // Legacy / Direct API Routes (Backward Compatibility)
  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/services', serviceRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/employees', employeeRoutes);
  app.use('/api/admin', adminRoutes);

  // API 404 handler
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      message: `نقطة النهاية المطلوبة غير موجودة في واجهة برمجة تطبيقات مرسال: [${req.method}] ${req.originalUrl}`,
      apiVersion: 'v1',
      availableRoutes: [
        '/api/v1/health',
        '/api/v1/auth/login',
        '/api/v1/auth/register',
        '/api/v1/auth/me',
        '/api/v1/services',
        '/api/v1/orders',
        '/api/v1/orders/my-orders',
        '/api/v1/employees/my-tasks',
        '/api/v1/admin/stats',
      ],
    });
  });

  // Global Error Handling Middleware
  app.use(globalErrorHandler);

  // Vite middleware for development vs Static file serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=========================================`);
    console.log(`🚀 MERSAL BACKEND CORE SERVER (UNIT 1)`);
    console.log(`🌐 URL: http://0.0.0.0:${PORT}`);
    console.log(`📦 MongoDB Engine: Ready & Seeded with 3 Core Services`);
    console.log(`🔐 Security: Active (CORS, Strict Headers, JWT RBAC)`);
    console.log(`🩺 Health check: http://0.0.0.0:${PORT}/api/v1/health`);
    console.log(`=========================================`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Mersal server:', err);
});
