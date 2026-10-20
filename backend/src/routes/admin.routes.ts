import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Protect all admin routes with authentication and requireAdmin
router.use(authenticate, requireAdmin);

// GET /api/admin/products?platform=&limit=
// List products for admin table
router.get('/products', async (req: Request, res: Response): Promise<void> => {
  try {
    const { platform, limit } = req.query;

    const whereClause: any = {};
    if (platform && typeof platform === 'string' && platform.trim() !== '') {
      whereClause.platform = platform.trim().toUpperCase();
    }

    const takeLimit = limit !== undefined ? parseInt(String(limit), 10) : 50;

    const products = await prisma.product.findMany({
      where: whereClause,
      take: !isNaN(takeLimit) && takeLimit > 0 ? takeLimit : 50,
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (err: any) {
    console.error('[Admin Routes] Error fetching products:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve products for admin',
      details: err.message,
    });
  }
});

// DELETE /api/admin/products/:id
// Delete a product by ID
router.delete('/products/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id || typeof id !== 'string' || !id.trim()) {
      res.status(400).json({
        success: false,
        error: 'Product ID parameter is required.',
      });
      return;
    }

    const existing = await prisma.product.findUnique({
      where: { id: id.trim() },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: `Product with ID "${id}" not found`,
      });
      return;
    }

    await prisma.product.delete({
      where: { id: id.trim() },
    });

    res.json({
      success: true,
      message: 'Product deleted successfully',
      id: id.trim(),
      data: { id: id.trim() },
    });
  } catch (err: any) {
    console.error(`[Admin Routes] Error deleting product ${req.params.id}:`, err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product',
      details: err.message,
    });
  }
});

// GET /api/admin/logs
// List ScrapeLog (newest first, limit 50)
router.get('/logs', async (req: Request, res: Response): Promise<void> => {
  try {
    const logs = await prisma.scrapeLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (err: any) {
    console.error('[Admin Routes] Error fetching scrape logs:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve scrape logs',
      details: err.message,
    });
  }
});

// GET /api/admin/config-status
// Return { groq: boolean, brightdata: boolean }
router.get('/config-status', (req: Request, res: Response): void => {
  const groq = Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== '');
  const brightdata = Boolean(
    process.env.BRIGHTDATA_API_KEY && process.env.BRIGHTDATA_API_KEY.trim() !== ''
  );

  res.json({
    success: true,
    data: {
      groq,
      brightdata,
    },
    groq,
    brightdata,
  });
});

export default router;
