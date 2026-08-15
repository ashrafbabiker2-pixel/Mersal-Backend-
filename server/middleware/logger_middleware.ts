import { Request, Response, NextFunction } from 'express';
import { db } from '../config/db.js';

/**
 * Logger Middleware: Intercepts all incoming API requests
 * Records HTTP method, route, response status, duration, user identity, and payload
 * for live telemetry and audit log stream in Mersal Central Console.
 */
export function apiLogger(req: Request, res: Response, next: NextFunction): void {
  // Only record API requests, not static assets or vite
  if (!req.path.startsWith('/api')) {
    return next();
  }

  const start = Date.now();
  const originalEnd = res.end;

  res.end = function (this: Response, ...args: any[]): Response {
    const durationMs = Date.now() - start;

    try {
      let requestBodyPreview = undefined;
      if (req.body && Object.keys(req.body).length > 0) {
        // Sanitize sensitive fields like passwords
        const bodyClone = { ...req.body };
        if (bodyClone.password) bodyClone.password = '***[REDACTED]***';
        if (bodyClone.currentPassword) bodyClone.currentPassword = '***[REDACTED]***';
        if (bodyClone.newPassword) bodyClone.newPassword = '***[REDACTED]***';
        requestBodyPreview = bodyClone;
      }

      db.addLog({
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.originalUrl || req.url,
        statusCode: res.statusCode,
        durationMs,
        ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
        userAgent: req.headers['user-agent'],
        user: req.user
          ? {
              id: req.user._id,
              name: req.user.name,
              email: req.user.email,
              role: req.user.role,
            }
          : undefined,
        requestBodyPreview,
      });
    } catch (e) {
      // Ignore logging errors
    }

    return originalEnd.apply(this, args as any);
  };

  next();
}
