import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';

const router = Router();

// GET /api/products?platform=TOKOPEDIA&minPrice=0&maxPrice=10000000&minRating=0&limit=50
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { platform, minPrice, maxPrice, minRating, limit } = req.query;

    const whereClause: any = {};

    if (platform && typeof platform === 'string' && platform.trim() !== '') {
      const upperPlatform = platform.trim().toUpperCase();
      if (upperPlatform !== 'ALL') {
        if (!['TOKOPEDIA', 'AMAZON'].includes(upperPlatform)) {
          res.status(400).json({
            success: false,
            error: `Invalid platform "${platform}". Allowed values are "TOKOPEDIA", "AMAZON", or "ALL".`,
          });
          return;
        }
        whereClause.platform = upperPlatform;
      }
    }

    let parsedMin: number | undefined;
    let parsedMax: number | undefined;

    if (minPrice !== undefined) {
      parsedMin = parseFloat(String(minPrice));
      if (isNaN(parsedMin) || parsedMin < 0) {
        res.status(400).json({
          success: false,
          error: 'Parameter "minPrice" must be a non-negative number.',
        });
        return;
      }
    }

    if (maxPrice !== undefined) {
      parsedMax = parseFloat(String(maxPrice));
      if (isNaN(parsedMax) || parsedMax < 0) {
        res.status(400).json({
          success: false,
          error: 'Parameter "maxPrice" must be a non-negative number.',
        });
        return;
      }
    }

    if (parsedMin !== undefined && parsedMax !== undefined && parsedMin > parsedMax) {
      res.status(400).json({
        success: false,
        error: 'Parameter "minPrice" cannot be greater than "maxPrice".',
      });
      return;
    }

    if (parsedMin !== undefined || parsedMax !== undefined) {
      whereClause.price = {};
      if (parsedMin !== undefined) whereClause.price.gte = parsedMin;
      if (parsedMax !== undefined) whereClause.price.lte = parsedMax;
    }

    if (minRating !== undefined) {
      const parsedRating = parseFloat(String(minRating));
      if (isNaN(parsedRating) || parsedRating < 0 || parsedRating > 5) {
        res.status(400).json({
          success: false,
          error: 'Parameter "minRating" must be a number between 0 and 5.',
        });
        return;
      }
      whereClause.rating = { gte: parsedRating };
    }

    let takeLimit = 50;
    if (limit !== undefined) {
      const parsedLimit = parseInt(String(limit), 10);
      if (isNaN(parsedLimit) || parsedLimit <= 0) {
        res.status(400).json({
          success: false,
          error: 'Parameter "limit" must be a positive integer.',
        });
        return;
      }
      takeLimit = Math.min(parsedLimit, 200);
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      take: takeLimit,
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (err: any) {
    console.error('[Product Routes] Error fetching products:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve products',
      details: err.message,
    });
  }
});

// GET /api/products/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id || typeof id !== 'string' || !id.trim()) {
      res.status(400).json({
        success: false,
        error: 'Product ID parameter is required.',
      });
      return;
    }

    const product = await prisma.product.findUnique({
      where: { id: id.trim() },
    });

    if (!product) {
      res.status(404).json({
        success: false,
        error: `Product with ID "${id}" not found`,
      });
      return;
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (err: any) {
    console.error(`[Product Routes] Error fetching product ${req.params.id}:`, err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve product details',
      details: err.message,
    });
  }
});

// POST /api/products
// Create a new product with input validation
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, price, platform, url, rating, imageUrl } = req.body || {};

    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({
        success: false,
        error: 'Field "title" is required and must be a non-empty string.',
      });
      return;
    }

    if (price === undefined || typeof price !== 'number' || isNaN(price) || price < 0) {
      res.status(400).json({
        success: false,
        error: 'Field "price" is required and must be a non-negative number.',
      });
      return;
    }

    if (
      !platform ||
      typeof platform !== 'string' ||
      !['TOKOPEDIA', 'AMAZON'].includes(platform.trim().toUpperCase())
    ) {
      res.status(400).json({
        success: false,
        error: 'Field "platform" is required and must be either "TOKOPEDIA" or "AMAZON".',
      });
      return;
    }

    if (!url || typeof url !== 'string' || !url.trim()) {
      res.status(400).json({
        success: false,
        error: 'Field "url" is required and must be a valid non-empty string.',
      });
      return;
    }

    let parsedRating: number | null = null;
    if (rating !== undefined && rating !== null) {
      if (typeof rating !== 'number' || isNaN(rating) || rating < 0 || rating > 5) {
        res.status(400).json({
          success: false,
          error: 'Field "rating" must be a number between 0 and 5.',
        });
        return;
      }
      parsedRating = rating;
    }

    const created = await prisma.product.create({
      data: {
        title: title.trim(),
        price,
        platform: platform.trim().toUpperCase(),
        url: url.trim(),
        rating: parsedRating,
        imageUrl: typeof imageUrl === 'string' && imageUrl.trim() ? imageUrl.trim() : null,
      },
    });

    res.status(201).json({
      success: true,
      data: created,
    });
  } catch (err: any) {
    console.error('[Product Routes] Error creating product:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to create product',
      details: err.message,
    });
  }
});

// PUT /api/products/:id
// Update product by ID with input validation
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
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

    const { title, price, platform, url, rating, imageUrl } = req.body || {};
    const updateData: any = {};

    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        res.status(400).json({
          success: false,
          error: 'Field "title" must be a non-empty string.',
        });
        return;
      }
      updateData.title = title.trim();
    }

    if (price !== undefined) {
      if (typeof price !== 'number' || isNaN(price) || price < 0) {
        res.status(400).json({
          success: false,
          error: 'Field "price" must be a non-negative number.',
        });
        return;
      }
      updateData.price = price;
    }

    if (platform !== undefined) {
      if (typeof platform !== 'string' || !['TOKOPEDIA', 'AMAZON'].includes(platform.trim().toUpperCase())) {
        res.status(400).json({
          success: false,
          error: 'Field "platform" must be either "TOKOPEDIA" or "AMAZON".',
        });
        return;
      }
      updateData.platform = platform.trim().toUpperCase();
    }

    if (url !== undefined) {
      if (typeof url !== 'string' || !url.trim()) {
        res.status(400).json({
          success: false,
          error: 'Field "url" must be a non-empty string.',
        });
        return;
      }
      updateData.url = url.trim();
    }

    if (rating !== undefined) {
      if (rating !== null && (typeof rating !== 'number' || isNaN(rating) || rating < 0 || rating > 5)) {
        res.status(400).json({
          success: false,
          error: 'Field "rating" must be null or a number between 0 and 5.',
        });
        return;
      }
      updateData.rating = rating;
    }

    if (imageUrl !== undefined) {
      updateData.imageUrl = typeof imageUrl === 'string' && imageUrl.trim() ? imageUrl.trim() : null;
    }

    const updated = await prisma.product.update({
      where: { id: id.trim() },
      data: updateData,
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (err: any) {
    console.error(`[Product Routes] Error updating product ${req.params.id}:`, err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to update product',
      details: err.message,
    });
  }
});

export default router;
