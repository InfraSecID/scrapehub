import { prisma } from '../../prisma.js';

const KEYWORDS = ['laptop', 'sepatu', 'handphone'];
const TOKOPEDIA_GQL = 'https://gql.tokopedia.com/graphql/SearchProductV5Query';

const SEARCH_QUERY = `
query SearchProductV5Query($params: String!) {
  searchProductV5(params: $params) {
    header {
      totalData
      responseCode
      keywordProcess
    }
    data {
      products {
        id
        name
        url
        mediaURL {
          image
          image300
        }
        price {
          text
          number
        }
        rating
      }
    }
  }
}
`;

interface TokopediaProductItem {
  id: string | number;
  name: string;
  url: string;
  mediaURL?: {
    image?: string;
    image300?: string;
  };
  price?: {
    text?: string;
    number?: number;
  };
  rating?: string | number | null;
}

/**
 * Perform GraphQL request using @bintangtimurlangit/tokopedia-mcp client or direct fallback
 */
async function fetchTokopediaProducts(keyword: string, rows: number = 20): Promise<TokopediaProductItem[]> {
  const params = new URLSearchParams({
    device: 'desktop',
    enter_method: 'normal_search',
    ob: '23',
    page: '1',
    q: keyword,
    rows: String(rows),
    safe_search: 'false',
    scheme: 'https',
    show_adult: 'false',
    source: 'search',
    srp_component_id: '02.01.00.00',
    st: 'product',
    start: '0',
    topads_bucket: 'true',
    unique_id: Math.random().toString(36).slice(2),
  }).toString();

  try {
    // Try importing gqlRequest from @bintangtimurlangit/tokopedia-mcp
    // @ts-ignore
    const { gqlRequest } = await import('@bintangtimurlangit/tokopedia-mcp/build/api/client.js');
    const response: any = await gqlRequest('SearchProductV5Query', SEARCH_QUERY, { params });
    const products: TokopediaProductItem[] = response?.data?.searchProductV5?.data?.products || [];
    return products;
  } catch (mcpError) {
    console.warn(`[Tokopedia Scraper] MCP client error (${keyword}), falling back to direct HTTP:`, (mcpError as Error).message);

    // Fallback direct GraphQL request
    const response = await fetch(TOKOPEDIA_GQL, {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'Origin': 'https://www.tokopedia.com',
        'Referer': 'https://www.tokopedia.com/',
        'X-Source': 'tokopedia-lite',
        'X-Version': '1.0',
      },
      body: JSON.stringify({
        operationName: 'SearchProductV5Query',
        query: SEARCH_QUERY,
        variables: { params },
      }),
    });

    if (!response.ok) {
      throw new Error(`Tokopedia GraphQL HTTP error: ${response.status} ${response.statusText}`);
    }

    const json = (await response.json()) as any;
    return json?.data?.searchProductV5?.data?.products || [];
  }
}

export async function scrapeTokopedia(): Promise<{ success: boolean; count: number; products: any[] }> {
  console.log('[Tokopedia Scraper] Starting Tokopedia scraping for keywords:', KEYWORDS.join(', '));
  const savedProducts: any[] = [];

  try {
    for (const keyword of KEYWORDS) {
      try {
        console.log(`[Tokopedia Scraper] Scraping keyword: "${keyword}"...`);
        // Scrape at least 20 products
        const items = await fetchTokopediaProducts(keyword, 20);
        console.log(`[Tokopedia Scraper] Found ${items.length} products for "${keyword}"`);

        for (const item of items) {
          if (!item.name || !item.url) continue;

          const price = Number(item.price?.number) || 0;
          let rating: number | null = null;
          if (item.rating) {
            const parsed = parseFloat(String(item.rating));
            if (!isNaN(parsed)) rating = parsed;
          }

          const imageUrl = item.mediaURL?.image || item.mediaURL?.image300 || null;

          // Check if product already exists by url to avoid duplicates
          const existing = await prisma.product.findFirst({
            where: { url: item.url },
          });

          if (existing) {
            const updated = await prisma.product.update({
              where: { id: existing.id },
              data: {
                title: item.name,
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
                title: item.name,
                price,
                rating,
                platform: 'TOKOPEDIA',
                url: item.url,
                imageUrl,
                scrapedAt: new Date(),
              },
            });
            savedProducts.push(created);
          }
        }
      } catch (err) {
        console.error(`[Tokopedia Scraper] Error scraping keyword "${keyword}":`, (err as Error).message);
      }
    }

    const isSuccess = savedProducts.length > 0;
    const status = isSuccess ? 'SUCCESS' : 'FAILED';
    const message = isSuccess
      ? `Successfully scraped ${savedProducts.length} products from Tokopedia.`
      : 'Tokopedia scraping completed but no products were retrieved.';

    await prisma.scrapeLog.create({
      data: {
        platform: 'TOKOPEDIA',
        count: savedProducts.length,
        status,
        message,
      },
    });

    console.log(`[Tokopedia Scraper] Completed. Total processed: ${savedProducts.length} products.`);
    return {
      success: isSuccess,
      count: savedProducts.length,
      products: savedProducts,
    };
  } catch (err: any) {
    console.error('[Tokopedia Scraper] Fatal error during scraping:', err.message);
    await prisma.scrapeLog.create({
      data: {
        platform: 'TOKOPEDIA',
        count: savedProducts.length,
        status: 'FAILED',
        message: err.message || 'Fatal error during Tokopedia scraping',
      },
    });
    throw err;
  }
}
