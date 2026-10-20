import React from 'react';
import { ProductCard } from './ProductCard';
import { Product } from '../types';
import { RefreshCw, ShoppingCart } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  onScrapeNow: () => void;
  isScraping: boolean;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading,
  onScrapeNow,
  isScraping,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4 animate-pulse"
          >
            <div className="aspect-video w-full bg-slate-800/60 rounded-lg"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-800/80 rounded w-3/4"></div>
              <div className="h-4 bg-slate-800/50 rounded w-1/2"></div>
            </div>
            <div className="h-6 bg-slate-800/80 rounded w-1/3"></div>
            <div className="h-10 bg-slate-800 rounded-lg w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-12 text-center max-w-xl mx-auto my-8">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-5">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No products yet</h3>
        <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
          No products match your current filters, or the database is empty. Click Scrape Now to start fetching live products.
        </p>
        <button
          onClick={onScrapeNow}
          disabled={isScraping}
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${isScraping ? 'animate-spin' : ''}`} />
          <span>{isScraping ? 'Scraping in progress...' : 'Scrape Now'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
