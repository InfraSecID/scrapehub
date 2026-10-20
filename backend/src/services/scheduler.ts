import cron from 'node-cron';
import { scrapeTokopedia } from './scraper/tokopedia.js';
import { scrapeAmazon } from './scraper/amazon.js';

export function initScheduler() {
  // Run scraping Tokopedia + Amazon every 6 hours: '0 */6 * * *'
  const schedulePattern = '0 */6 * * *';

  console.log(`[Scheduler] Initializing cron job: scraping every 6 hours (${schedulePattern})`);

  const job = cron.schedule(schedulePattern, async () => {
    const timestamp = new Date().toISOString();
    console.log(`[Scheduler] [${timestamp}] Starting scheduled scraping job for Tokopedia + Amazon...`);

    try {
      console.log(`[Scheduler] [${timestamp}] Running Tokopedia scraper...`);
      const tokopediaResult = await scrapeTokopedia();
      console.log(`[Scheduler] [${timestamp}] Tokopedia scraper finished. Scraped: ${tokopediaResult.count}`);
    } catch (err) {
      console.error(`[Scheduler] [${timestamp}] Tokopedia scraper error:`, (err as Error).message);
    }

    try {
      console.log(`[Scheduler] [${timestamp}] Running Amazon scraper...`);
      const amazonResult = await scrapeAmazon();
      console.log(`[Scheduler] [${timestamp}] Amazon scraper finished. Scraped: ${amazonResult.count}`);
    } catch (err) {
      console.error(`[Scheduler] [${timestamp}] Amazon scraper error:`, (err as Error).message);
    }

    console.log(`[Scheduler] [${timestamp}] Scheduled scraping job complete.`);
  });

  return job;
}
