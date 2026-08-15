/**
 * MERSAL BACKEND - Environment Configuration
 * Centralized config with runtime defaults and validation
 */

export interface AppConfig {
  env: string;
  port: number;
  mongoUri: string;
  jwt: {
    secret: string;
    expiresIn: string;
  };
  cors: {
    origin: string | string[];
  };
  bcryptSaltRounds: number;
  apiPrefix: string;
}

export const config: AppConfig = {
  env: process.env.NODE_ENV || 'development',
  port: 3000,
  mongoUri:
    process.env.MONGODB_URI ||
    'mongodb://127.0.0.1:27017/mersal_backend_production',
  jwt: {
    secret: process.env.JWT_SECRET || 'mersal_secret_key_production_secure_jwt_2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  bcryptSaltRounds: 10,
  apiPrefix: '/api/v1',
};
