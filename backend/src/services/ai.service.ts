import Groq from 'groq-sdk';
import { prisma } from '../prisma.js';

export class GroqApiKeyMissingError extends Error {
  constructor(message = 'GROQ_API_KEY is not configured or empty') {
    super(message);
    this.name = 'GroqApiKeyMissingError';
  }
}

export async function analyzeProductTrends(): Promise<{
  id: string;
  summary: string;
  createdAt: Date;
}> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    throw new GroqApiKeyMissingError('GROQ_API_KEY is missing or empty. Please set GROQ_API_KEY in the environment or .env file.');
  }

  // Fetch top 10 products
  const products = await prisma.product.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
  });

  if (products.length === 0) {
    throw new Error('No products found in database to analyze. Please scrape products first.');
  }

  const productListText = products
    .map(
      (p, index) =>
        `${index + 1}. [${p.platform}] "${p.title}" - Price: ${p.price} | Rating: ${p.rating ?? 'N/A'}`
    )
    .join('\n');

  const groq = new Groq({ apiKey });

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'Kamu adalah asisten analis tren pasar e-commerce yang profesional dan objektif.',
      },
      {
        role: 'user',
        content: `Analisis 10 produk berikut dan berikan ringkasan tren dalam 3-5 kalimat. Sebutkan kategori yang naik, kisaran harga, dan platform dominan.\n\n${productListText}`,
      },
    ],
    model: 'llama-3.3-70b-versatile',
  });

  const summary = completion.choices[0]?.message?.content?.trim() || 'No summary generated.';

  // Save to TrendSummary table
  const trendRecord = await prisma.trendSummary.create({
    data: {
      summary,
    },
  });

  return trendRecord;
}

export async function getLatestTrendSummary() {
  const latest = await prisma.trendSummary.findFirst({
    orderBy: { createdAt: 'desc' },
  });
  return latest;
}
