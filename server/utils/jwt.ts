import jwt from 'jsonwebtoken';
import { UserRole } from '../types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'mersal_super_jwt_secret_key_2026_x89';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface IJwtPayload {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  phone?: string;
}

export function generateToken(payload: IJwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as any,
  });
}

export function verifyToken(token: string): IJwtPayload {
  return jwt.verify(token, JWT_SECRET) as IJwtPayload;
}
