const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const connectDatabase = require('./config/db');

const notFoundMiddleware = require('./middleware/not_found_middleware');
const errorMiddleware = require('./middleware/error_middleware');

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

/*
|--------------------------------------------------------------------------
| Database
|--------------------------------------------------------------------------
*/

connectDatabase();

/*
|--------------------------------------------------------------------------
| Global Middleware
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*'
  })
);

app.use(express.json({ limit: '10mb' }));

app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb'
  })
);

/*
|--------------------------------------------------------------------------
| Request Logger
|--------------------------------------------------------------------------
*/

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();

  console.log(
    `[${timestamp}] ${req.method} ${req.originalUrl}`
  );

  next();
});

/*
|--------------------------------------------------------------------------
| API Information
|--------------------------------------------------------------------------
*/

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    name: 'MERSAL Backend',
    message: 'MERSAL API Server is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    service: 'mersal-backend',
    timestamp: new Date().toISOString()
  });
});

/*
|--------------------------------------------------------------------------
| API Version
|--------------------------------------------------------------------------
*/

app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MERSAL API',
    version: 'v1',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      services: '/api/v1/services',
      orders: '/api/v1/orders',
      employees: '/api/v1/employees',
      admin: '/api/v1/admin'
    }
  });
});

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use(
  '/api/v1/auth',
  require('./routes/auth_routes')
);

app.use(
  '/api/v1/users',
  require('./routes/user_routes')
);

app.use(
  '/api/v1/sessions',
  require('./routes/session_routes')
);

app.use(
  '/api/v1/services',
  require('./routes/service_routes')
);

app.use(
  '/api/v1/orders',
  require('./routes/order_routes')
);

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use(notFoundMiddleware);

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use(errorMiddleware);

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

const server = app.listen(PORT, () => {
  console.log('');
  console.log('========================================');
  console.log('        MERSAL BACKEND SERVER');
  console.log('========================================');
  console.log(`Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`Port        : ${PORT}`);
  console.log(`API         : http://localhost:${PORT}/api`);
  console.log(`Health      : http://localhost:${PORT}/health`);
  console.log('========================================');
});

/*
|--------------------------------------------------------------------------
| Graceful Shutdown
|--------------------------------------------------------------------------
*/

const shutdown = async (signal) => {
  console.log('');
  console.log(`${signal} received. Shutting down MERSAL server...`);

  server.close(async () => {
    const mongoose = require('mongoose');

    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
      console.log('MERSAL server stopped successfully');
      process.exit(0);
    } catch (error) {
      console.error('Error while closing MongoDB:', error);
      process.exit(1);
    }
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
