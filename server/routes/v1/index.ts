/**
 * MERSAL BACKEND - API v1 Master Router
 * Aggregates all version 1 domain routers
 */

import { Router } from 'express';
import { healthRouter } from './health_routes.js';
import authRoutes from '../auth_routes.js';
import serviceRoutes from '../service_routes.js';
import orderRoutes from '../order_routes.js';
import employeeRoutes from '../employee_routes.js';
import adminRoutes from '../admin_routes.js';
import userRoutes from '../user_routes.js';

export const v1Router = Router();

v1Router.use('/health', healthRouter);
v1Router.use('/auth', authRoutes);
v1Router.use('/services', serviceRoutes);
v1Router.use('/orders', orderRoutes);
v1Router.use('/employees', employeeRoutes);
v1Router.use('/admin', adminRoutes);
v1Router.use('/users', userRoutes);
