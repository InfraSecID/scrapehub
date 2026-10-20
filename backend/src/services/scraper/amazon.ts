import axios from 'axios';
import { prisma } from '../../prisma.js';

const KEYWORDS = ['laptop', 'shoes', 'phone'];

export async function scrapeAmazon(): Promise<{
  success: boolean;
  skipped?: boolean;
  count: number;
  reason?: string;
  products: any[];
}> {
  const apiKey = process.env.BRIGHTDATA_API_KEY;
  const datasetId = process.env.BRIGHTDATA_AMAZON_DATASET_ID || 'gd_l7q7dkf244hwjntr0';

  if (!apiKey || apiKey.trim() === '') {
    console.warn('[Amazon Scraper] Warning: BRIGHTDATA_API_KEY is not set or empty. Skipping Amazon scraping.');
    await prisma.scrapeLog.create({
      data: {
        platform: 'AMAZON',
        count: 0,
        status: 'FAILED',
        message: 'BRIGHTDATA_API_KEY is missing or empty',
      },
    });
    return {
      success: false,
      skipped: true,
      count: 0,
      reason: 'BRIGHTDATA_API_KEY is missing or empty',
      products: [],
    };
  }

  console.log('[Amazon Scraper] Starting Amazon scraping via Bright Data API for keywords:', KEYWORDS.join(', '));
  const savedProducts: any[] = [];

  try {
    for (const keyword of KEYWORDS) {
      try {
        console.log(`[Amazon Scraper] Requesting Bright Data dataset for keyword: "${keyword}"...`);
        const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`;

        // Try triggering Bright Data Dataset Scraper API
        const response = await axios.post(
          `https://api.brightdata.com/datasets/v3/scrape?dataset_id=${datasetId}&format=json`,
          [{ url: searchUrl }],
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 30000,
          }
        );

        let items: any[] = [];
        if (Array.isArray(response.data)) {
          items = response.data;
        } else if (response.data && Array.isArray(response.data.items)) {
          items = response.data.items;
        }

        console.log(`[Amazon Scraper] Received ${items.length} items from Bright Data for "${keyword}"`);

        for (const item of items) {
          const title = item.title || item.name || item.product_name;
          const url = item.url || item.link;
          if (!title || !url) continue;

          let price = 0;
          if (typeof item.final_price === 'number') {
            price = item.final_price;
          } else if (typeof item.price === 'number') {
            price = item.price;
          } else if (typeof item.price === 'string') {
            const match = item.price.replace(/,/g, '').match(/[\d.]+/);
            if (match) price = parseFloat(match[0]);
          }

          let rating: number | null = null;
          if (item.rating) {
            const parsed = parseFloat(String(item.rating));
            if (!isNaN(parsed)) rating = parsed;
          } else if (item.reviews_rating) {
            const parsed = parseFloat(String(item.reviews_rating));
            if (!isNaN(parsed)) rating = parsed;
          }

          const imageUrl = item.image || item.main_image || item.image_url || null;

          const existing = await prisma.product.findFirst({
            where: { url },
          });

          if (existing) {
            const updated = await prisma.product.update({
              where: { id: existing.id },
              data: {
                title,
                price,
                rating,
                imageUrl,
                scrapedAt: new Date(),
              },
            });
            savedProducts.push(updated);
          } else {
            const created = await prisma.product.create({
              data: {
                title,
                price,
                rating,
                platform: 'AMAZON',
                url,
                imageUrl,
                scrapedAt: new Date(),
              },
            });
            savedProducts.push(created);
          }
        }
      } catch (err: any) {
        console.warn(`[Amazon Scraper] Warning during scraping keyword "${keyword}":`, err.response?.data || err.message);
      }
    }

    const isSuccess = savedProducts.length > 0;
    const status = isSuccess ? 'SUCCESS' : 'FAILED';
    const message = isSuccess
      ? `Successfully scraped ${savedProducts.length} products from Amazon.`
      : 'Amazon scraping completed but no products were retrieved.';

    await prisma.scrapeLog.create({
      data: {
        platform: 'AMAZON',
        count: savedProducts.length,
        status,
        message,
      },
    });

    console.log(`[Amazon Scraper] Completed. Total processed: ${savedProducts.length} products.`);
    return {
      success: isSuccess,
      count: savedProducts.length,
      products: savedProducts,
    };
  } catch (err: any) {
    console.error('[Amazon Scraper] Fatal error during scraping:', err.message);
    await prisma.scrapeLog.create({
      data: {
        platform: 'AMAZON',
        count: savedProducts.length,
        status: 'FAILED',
        message: err.message || 'Fatal error during Amazon scraping',
      },
    });
    throw err;
  }
}
