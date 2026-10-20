export type Platform = 'ALL' | 'TOKOPEDIA' | 'AMAZON';

export interface Product {
  id: string;
  title: string;
  price: number;
  rating: number | null;
  platform: 'TOKOPEDIA' | 'AMAZON';
  url: string;
  imageUrl: string | null;
  scrapedAt: string;
  createdAt: string;
}

export interface TrendSummaryData {
  id: string;
  summary: string;
  createdAt: string;
}

export interface ProductFilterParams {
  platform?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  limit?: number;
}

export interface ScrapeResponse {
  success: boolean;
  count: number;
  platform: string | string[];
  details?: Record<string, any>;
}

export interface User {
  id: string;
  email: string;
  role: string;
  createdAt?: string;
}

export interface ScrapeLog {
  id: string;
  platform: string;
  count: number;
  status: 'SUCCESS' | 'FAILED' | string;
  message?: string | null;
  createdAt: string;
}

export interface ConfigStatus {
  groq: boolean;
  brightdata: boolean;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  data?: User;
  error?: string;
  details?: string;
}

