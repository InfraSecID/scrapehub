import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthUserPayload {
  id: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

export const COOKIE_NAME = 'token';

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export function getJwtSecret(): string {
  return process.env.JWT_SECRET || 'scrapehub-admin-secret-jwt-key-2026-very-secure!';
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const token =
    req.cookies?.[COOKIE_NAME] ||
    req.cookies?.token ||
    req.cookies?.auth_token ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : undefined);

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Authentication required. No token provided.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as AuthUserPayload;
    req.user = decoded;
    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired authentication token.',
      details: err.message,
    });
    return;
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403).json({
      success: false,
      error: 'Forbidden: Admin access required.',
    });
    return;
  }
  next();
}
