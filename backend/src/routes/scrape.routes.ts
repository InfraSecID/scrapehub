import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { scrapeTokopedia } from '../services/scraper/tokopedia.js';
import { scrapeAmazon } from '../services/scraper/amazon.js';

const router = Router();

// POST /api/scrape
// Trigger scraping manual (Tokopedia + Amazon)
// Return { success, count, platform }
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const rawPlatform = req.body?.platform || req.query?.platform;
    let requestedPlatform: string | undefined = undefined;

    if (rawPlatform !== undefined && rawPlatform !== null && String(rawPlatform).trim() !== '') {
      requestedPlatform = String(rawPlatform).trim().toUpperCase();
      const validPlatforms = ['TOKOPEDIA', 'AMAZON', 'ALL'];
      if (!validPlatforms.includes(requestedPlatform)) {
        res.status(400).json({
          success: false,
          error: `Invalid platform "${rawPlatform}". Allowed values are "TOKOPEDIA", "AMAZON", or "ALL".`,
        });
        return;
      }
    }

    // If Amazon was specifically requested and key is missing, return 503 per requirement
    if (requestedPlatform === 'AMAZON') {
      const apiKey = process.env.BRIGHTDATA_API_KEY;
      if (!apiKey || apiKey.trim() === '') {
        await prisma.scrapeLog.create({
          data: {
            platform: 'AMAZON',
            count: 0,
            status: 'FAILED',
            message: 'Bright Data API key is not configured. Please set BRIGHTDATA_API_KEY in .env.',
          },
        });
        res.status(503).json({
          success: false,
          error: 'Bright Data API key is not configured. Please set BRIGHTDATA_API_KEY in .env.',
        });
        return;
      }
      const amazonResult = await scrapeAmazon();
      res.json({
        success: true,
        count: amazonResult.count,
        platform: 'AMAZON',
        data: {
          count: amazonResult.count,
          platform: 'AMAZON',
          details: { amazon: amazonResult.count },
        },
        details: { amazon: amazonResult.count },
      });
      return;
    }

    if (requestedPlatform === 'TOKOPEDIA') {
      const tokopediaResult = await scrapeTokopedia();
      res.json({
        success: true,
        count: tokopediaResult.count,
        platform: 'TOKOPEDIA',
        data: {
          count: tokopediaResult.count,
          platform: 'TOKOPEDIA',
          details: { tokopedia: tokopediaResult.count },
        },
        details: { tokopedia: tokopediaResult.count },
      });
      return;
    }

    // Default or ALL: Scrape both platforms (Tokopedia + Amazon)
    console.log('[Scrape Routes] Manual scrape triggered for Tokopedia + Amazon');
    const [tokopediaResult, amazonResult] = await Promise.all([
      scrapeTokopedia(),
      scrapeAmazon(),
    ]);

    const totalCount = (tokopediaResult.count || 0) + (amazonResult.count || 0);
    const activePlatforms = ['TOKOPEDIA'];
    if (!amazonResult.skipped) {
      activePlatforms.push('AMAZON');
    }

    const platformPayload = activePlatforms.length === 2 ? ['TOKOPEDIA', 'AMAZON'] : activePlatforms;
    const detailsPayload = {
      tokopedia: tokopediaResult.count,
      amazon: amazonResult.skipped ? 'skipped (BRIGHTDATA_API_KEY missing)' : amazonResult.count,
    };

    res.json({
      success: true,
      count: totalCount,
      platform: platformPayload,
      data: {
        count: totalCount,
        platform: platformPayload,
        details: detailsPayload,
      },
      details: detailsPayload,
    });
  } catch (err: any) {
    console.error('[Scrape Routes] Scraping error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Scraping process encountered an error',
      details: err.message,
    });
  }
});

export default router;
