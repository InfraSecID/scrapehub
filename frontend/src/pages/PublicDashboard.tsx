import React, { useEffect, useState, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import { StatCard } from '../components/StatCard';
import { FilterBar } from '../components/FilterBar';
import { ProductGrid } from '../components/ProductGrid';
import { TrendSummary } from '../components/TrendSummary';
import {
  getProducts,
  triggerScrape,
  getLatestTrend,
  analyzeTrend,
} from '../services/api';
import { Product, ProductFilterParams, TrendSummaryData } from '../types';
import {
  Boxes,
  Layers,
  Clock,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export function PublicDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allProductsCount, setAllProductsCount] = useState<number>(0);
  const [trendSummary, setTrendSummary] = useState<TrendSummaryData | null>(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [scrapeNotification, setScrapeNotification] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductFilterParams>({});

  // Helper to compute relative time from ISO date string
  const getRelativeTime = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Find latest scraped date
  const latestScrapeDate = React.useMemo(() => {
    if (products.length === 0) return undefined;
    const sorted = [...products].sort(
      (a, b) => new Date(b.scrapedAt).getTime() - new Date(a.scrapedAt).getTime()
    );
    return sorted[0]?.scrapedAt;
  }, [products]);

  // Load products list
  const loadProducts = useCallback(async (customFilters?: ProductFilterParams) => {
    setIsLoadingProducts(true);
    try {
      const activeFilters = customFilters !== undefined ? customFilters : filters;
      const data = await getProducts(activeFilters);
      setProducts(data);

      // If unfiltered, also update total count
      if (!customFilters || Object.keys(customFilters).length === 0) {
        setAllProductsCount(data.length);
      }
    } catch (err: any) {
      console.error('Failed to load products:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [filters]);

  // Load latest AI trend
  const loadLatestTrend = useCallback(async () => {
    try {
      const trend = await getLatestTrend();
      setTrendSummary(trend);
    } catch (err) {
      console.warn('Could not fetch latest trend summary:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadProducts();
    loadLatestTrend();
  }, [loadProducts, loadLatestTrend]);

  // Handle Trigger Manual Scrape
  const handleScrapeNow = async () => {
    if (isScraping) return;
    setIsScraping(true);
    setScrapeNotification(null);

    try {
      const result = await triggerScrape();
      setScrapeNotification(
        `Scraped ${result.count} products successfully! (${Array.isArray(result.platform) ? result.platform.join(', ') : result.platform})`
      );
      // Reload products
      await loadProducts();
    } catch (err: any) {
      console.error('Scraping error:', err);
      setScrapeNotification(`Scraping failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsScraping(false);
      // Auto clear notification after 8 seconds
      setTimeout(() => setScrapeNotification(null), 8000);
    }
  };

  // Handle AI Analyze Trend
  const handleAnalyzeTrend = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setAiError(null);

    try {
      const result = await analyzeTrend();
      setTrendSummary(result);
    } catch (err: any) {
      console.error('AI Analysis error:', err);
      const errMsg =
        err.response?.data?.error ||
        err.response?.data?.details ||
        err.message ||
        'AI trend analysis failed';
      setAiError(errMsg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle Filter Application
  const handleApplyFilters = (newFilters: ProductFilterParams) => {
    setFilters(newFilters);
    loadProducts(newFilters);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Navbar */}
      <Navbar isScraping={isScraping} totalProducts={allProductsCount || products.length} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* 1. Hero Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-slate-800/80">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Ecommerce Market Intelligence</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white">
              Scrape<span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Hub</span>
            </h1>
            <p className="text-slate-400 text-base sm:text-lg mt-2 font-normal max-w-xl">
              Real-time product trends from Tokopedia & Amazon
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleScrapeNow}
              disabled={isScraping}
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isScraping ? 'animate-spin' : ''}`} />
              <span>{isScraping ? 'Scraping Live...' : 'Scrape Now'}</span>
            </button>
          </div>
        </div>

        {/* Scrape Notification Banner */}
        {scrapeNotification && (
          <div className="mb-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between animate-fadeIn">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{scrapeNotification}</span>
            </div>
            <button
              onClick={() => setScrapeNotification(null)}
              className="text-xs text-emerald-400 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 2. Counter Row (3 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <StatCard
            label="Total Products"
            value={allProductsCount || products.length}
            subtitle="Products stored in SQLite"
            icon={Boxes}
            accentColor="emerald"
            badge="Live Database"
          />

          <StatCard
            label="Platforms"
            value="2"
            subtitle="Tokopedia + Amazon"
            icon={Layers}
            accentColor="cyan"
            badge="Multi-source"
          />

          <StatCard
            label="Last Scrape"
            value={getRelativeTime(latestScrapeDate)}
            subtitle={latestScrapeDate ? new Date(latestScrapeDate).toLocaleTimeString('id-ID') : 'No scraping yet'}
            icon={Clock}
            accentColor="amber"
            badge="Auto 6-Hour Cron"
          />
        </div>

        {/* 3. AI Trend Analysis Section */}
        <TrendSummary
          summary={trendSummary}
          onAnalyze={handleAnalyzeTrend}
          isAnalyzing={isAnalyzing}
          error={aiError}
          products={products}
        />

        {/* 4. Products Header & FilterBar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
              <span>Catalog Products</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
                {products.length} showing
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Browse scraped products, compare prices, or filter by platform and rating
            </p>
          </div>
        </div>

        {/* FilterBar */}
        <FilterBar onApplyFilters={handleApplyFilters} isLoading={isLoadingProducts} />

        {/* 5. ProductGrid */}
        <ProductGrid
          products={products}
          isLoading={isLoadingProducts}
          onScrapeNow={handleScrapeNow}
          isScraping={isScraping}
        />
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} ScrapeHub — Tokopedia & Amazon E-commerce Intelligence.</span>
          <span className="text-slate-600">Built with Express, Prisma, React, Tailwind & Groq.</span>
        </div>
      </footer>
    </div>
  );
}

export default PublicDashboard;
