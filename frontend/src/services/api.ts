import axios from 'axios';
import {
  Product,
  ProductFilterParams,
  TrendSummaryData,
  ScrapeResponse,
  User,
  ScrapeLog,
  ConfigStatus,
  AuthResponse,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 45000,
});


/**
 * Fetch products list with optional filters
 */
export async function getProducts(filters?: ProductFilterParams): Promise<Product[]> {
  const params: Record<string, any> = {};

  if (filters?.platform && filters.platform !== 'ALL') {
    params.platform = filters.platform;
  }
  if (filters?.minPrice !== undefined && !isNaN(filters.minPrice)) {
    params.minPrice = filters.minPrice;
  }
  if (filters?.maxPrice !== undefined && !isNaN(filters.maxPrice)) {
    params.maxPrice = filters.maxPrice;
  }
  if (filters?.minRating !== undefined && !isNaN(filters.minRating)) {
    params.minRating = filters.minRating;
  }
  if (filters?.limit) {
    params.limit = filters.limit;
  }

  const response = await apiClient.get('/api/products', { params });
  return response.data?.data || [];
}

/**
 * Fetch product details by ID
 */
export async function getProduct(id: string): Promise<Product> {
  const response = await apiClient.get(`/api/products/${id}`);
  return response.data?.data;
}

/**
 * Trigger manual scraping (Tokopedia + Amazon)
 */
export async function triggerScrape(platform?: string): Promise<ScrapeResponse> {
  const response = await apiClient.post('/api/scrape', { platform });
  return response.data;
}

/**
 * Get latest AI trend summary
 */
export async function getLatestTrend(): Promise<TrendSummaryData | null> {
  try {
    const response = await apiClient.get('/api/trends/latest');
    return response.data?.data || null;
  } catch (err: any) {
    if (err.response?.status === 404) {
      return null;
    }
    throw err;
  }
}

/**
 * Run AI trend analysis on latest products
 */
export async function analyzeTrend(): Promise<TrendSummaryData> {
  const response = await apiClient.post('/api/ai/analyze');
  return response.data?.data;
}

/**
 * Auth: Submit login
 * POST /api/auth/login
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>(
    '/api/auth/login',
    { email, password },
    { withCredentials: true }
  );
  return response.data;
}

/**
 * Auth: Logout current session
 * POST /api/auth/logout
 */
export async function logout(): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    '/api/auth/logout',
    {},
    { withCredentials: true }
  );
  return response.data;
}

/**
 * Auth: Get current authenticated user
 * GET /api/auth/me
 */
export async function getMe(): Promise<User> {
  const response = await apiClient.get<{ success: boolean; user: User }>(
    '/api/auth/me',
    { withCredentials: true }
  );
  return response.data.user;
}

/**
 * Admin: List products
 * GET /api/admin/products
 */
export async function getAdminProducts(params?: { platform?: string; limit?: number }): Promise<Product[]> {
  const response = await apiClient.get<{ success: boolean; count: number; data: Product[] }>(
    '/api/admin/products',
    { params, withCredentials: true }
  );
  return response.data?.data || [];
}

/**
 * Admin: Delete product by ID
 * DELETE /api/admin/products/:id
 */
export async function deleteProduct(id: string): Promise<{ success: boolean; message: string; id: string }> {
  const response = await apiClient.delete<{ success: boolean; message: string; id: string }>(
    `/api/admin/products/${id}`,
    { withCredentials: true }
  );
  return response.data;
}

/**
 * Admin: Fetch scrape logs
 * GET /api/admin/logs
 */
export async function getAdminLogs(): Promise<ScrapeLog[]> {
  const response = await apiClient.get<{ success: boolean; count: number; data: ScrapeLog[] }>(
    '/api/admin/logs',
    { withCredentials: true }
  );
  return response.data?.data || [];
}

/**
 * Admin: Fetch API key configuration status
 * GET /api/admin/config-status
 */
export async function getAdminConfigStatus(): Promise<ConfigStatus> {
  const response = await apiClient.get<ConfigStatus>(
    '/api/admin/config-status',
    { withCredentials: true }
  );
  return response.data;
}

