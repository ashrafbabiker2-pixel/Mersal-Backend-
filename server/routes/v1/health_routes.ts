/**
 * MERSAL BACKEND - Health Check & System Status Endpoint (/api/v1/health)
 */

import { Router, Request, Response } from 'express';
import { db } from '../../config/db';
import { config } from '../../config/environment';

export const healthRouter = Router();

healthRouter.get('/', (req: Request, res: Response) => {
  const uptimeSeconds = Math.floor(process.uptime());
  const memoryUsage = process.memoryUsage();

  res.json({
    success: true,
    service: 'MERSAL Backend Core',
    version: '1.0.0',
    apiVersion: 'v1',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.env,
    database: {
      status: db.isConnected ? 'connected' : 'disconnected',
      type: 'MongoDB (Mongoose Schema Engine)',
      connectedSince: db.connectionTime,
      collections: {
        users: db.users.size,
        services: db.services.size,
        orders: db.orders.size,
        logs: db.logs.length,
      },
    },
    system: {
      uptimeSeconds,
      uptimeFormatted: `${Math.floor(uptimeSeconds / 60)}m ${uptimeSeconds % 60}s`,
      nodeVersion: process.version,
      memory: {
        rssMb: Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100,
        heapUsedMb: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
      },
    },
  });
});
