import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';
import {
  authenticate,
  getJwtSecret,
  COOKIE_NAME,
  COOKIE_OPTIONS,
} from '../middlewares/auth.middleware.js';

const router = Router();

// POST /api/auth/login
// Body: { email, password }
// Returns JWT in httpOnly cookie
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body || {};

    if (!email || typeof email !== 'string' || !email.trim()) {
      res.status(400).json({
        success: false,
        error: 'Email is required and must be a valid non-empty string.',
      });
      return;
    }

    if (!password || typeof password !== 'string' || !password.trim()) {
      res.status(400).json({
        success: false,
        error: 'Password is required and must be a non-empty string.',
      });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      res.status(400).json({
        success: false,
        error: 'Invalid email format provided.',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
      return;
    }

    const isValid = await bcrypt.compare(String(password), user.password);
    if (!isValid) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
      return;
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, getJwtSecret(), {
      expiresIn: '7d',
    });

    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

    res.json({
      success: true,
      message: 'Login successful.',
      data: payload,
      user: payload,
    });
  } catch (err: any) {
    console.error('[Auth Routes] Login error:', err.message);
    res.status(500).json({
      success: false,
      error: 'An error occurred during login.',
      details: err.message,
    });
  }
});

// POST /api/auth/logout
// Clears httpOnly cookie
router.post('/logout', (req: Request, res: Response): void => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
});

// GET /api/auth/me
// Returns current authenticated user information
router.get('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: User not found in session.',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found.',
      });
      return;
    }

    res.json({
      success: true,
      user,
    });
  } catch (err: any) {
    console.error('[Auth Routes] /me error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user information.',
      details: err.message,
    });
  }
});

export default router;
