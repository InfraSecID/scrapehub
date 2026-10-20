import { Router, Request, Response } from 'express';
import {
  analyzeProductTrends,
  getLatestTrendSummary,
  GroqApiKeyMissingError,
} from '../services/ai.service.js';

const router = Router();

// GET /api/trends/latest
// Return trend summary terakhir dari AI
router.get('/trends/latest', async (req: Request, res: Response): Promise<void> => {
  try {
    const latest = await getLatestTrendSummary();

    if (!latest) {
      res.status(404).json({
        success: false,
        error: 'No trend summary available yet. Please trigger an analysis first using POST /api/ai/analyze.',
      });
      return;
    }

    res.json({
      success: true,
      data: latest,
    });
  } catch (err: any) {
    console.error('[AI Routes] Error fetching latest trend:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve latest trend summary',
      details: err.message,
    });
  }
});

// POST /api/ai/analyze
// Ambil 10 produk teratas, kirim ke Groq, simpan hasil ke TrendSummary, return summary
router.post('/ai/analyze', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await analyzeProductTrends();
    res.json({
      success: true,
      data: result,
      summary: result.summary,
    });
  } catch (err: any) {
    if (err instanceof GroqApiKeyMissingError) {
      res.status(503).json({
        success: false,
        error: 'Groq API key is not configured. Please set GROQ_API_KEY in the .env file.',
        details: err.message,
      });
      return;
    }

    if (err.message && err.message.includes('No products found')) {
      res.status(400).json({
        success: false,
        error: err.message,
      });
      return;
    }

    console.error('[AI Routes] Error analyzing products:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to run AI analysis',
      details: err.message,
    });
  }
});

export default router;
