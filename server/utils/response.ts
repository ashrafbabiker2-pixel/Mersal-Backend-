/**
 * MERSAL BACKEND - Standardized Response Helpers
 */

import { Response } from 'express';

export interface ApiResponseOptions<T = any> {
  res: Response;
  statusCode?: number;
  message?: string;
  data?: T;
  meta?: Record<string, any>;
}

export const sendResponse = <T>({
  res,
  statusCode = 200,
  message = 'تمت العملية بنجاح',
  data,
  meta,
}: ApiResponseOptions<T>) => {
  return res.status(statusCode).json({
    success: statusCode >= 200 && statusCode < 300,
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      apiVersion: 'v1',
      ...meta,
    },
  });
};

export const sendError = (
  res: Response,
  statusCode: number = 400,
  message: string = 'حدث خطأ أثناء معالجة الطلب',
  errors?: any[]
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    meta: {
      timestamp: new Date().toISOString(),
      apiVersion: 'v1',
    },
  });
};
