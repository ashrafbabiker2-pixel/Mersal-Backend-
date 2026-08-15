/**
 * MERSAL BACKEND - Global Error Handling Middleware
 * Catches all unhandled promise rejections, MongoDB CastErrors, JWT errors, and validation errors
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app_error';
import { config } from '../config/environment';

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message || 'حدث خطأ داخلي في الخادم';
  error.statusCode = err.statusCode || 500;

  // MongoDB CastError (Invalid ObjectId)
  if (err.name === 'CastError') {
    const message = `معرّف غير صالح: ${err.value}`;
    error = new AppError(message, 400);
  }

  // MongoDB Duplicate Key Error (11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'حقل';
    const message = `القيمة المدخلة في ${field} مسجلة مسبقاً في النظام`;
    error = new AppError(message, 409);
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors || {}).map((val: any) => val.message);
    const message = `خطأ في التحقق من صحة البيانات: ${messages.join('. ')}`;
    error = new AppError(message, 400);
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('رمز المصادقة JWT غير صالح', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('انتهت صلاحية رمز المصادقة JWT، يرجى تسجيل الدخول مجدداً', 401);
  }

  const isDev = config.env === 'development';

  return res.status(error.statusCode || 500).json({
    success: false,
    status: error.status || 'error',
    message: error.message,
    ...(error.errors && { errors: error.errors }),
    meta: {
      timestamp: new Date().toISOString(),
      apiVersion: 'v1',
      path: req.originalUrl,
      method: req.method,
      ...(isDev && { stack: err.stack }),
    },
  });
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`نقطة النهاية المطلوبة غير موجودة على الخادم: ${req.method} ${req.originalUrl}`, 404));
};
