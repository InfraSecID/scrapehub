import React, { useState } from 'react';
import { ExternalLink, Star, Package, ShoppingBag } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [imageError, setImageError] = useState(false);

  // Format price
  const formatPrice = (price: number, platform: string) => {
    if (platform === 'AMAZON') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
      }).format(price);
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const isTokopedia = product.platform === 'TOKOPEDIA';

  return (
    <div className="group flex flex-col justify-between bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300">
      <div>
        {/* Thumbnail Image Container */}
        <div className="relative aspect-video w-full bg-slate-950/70 border-b border-slate-800/80 overflow-hidden flex items-center justify-center">
          {product.imageUrl && !imageError ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              onError={() => setImageError(true)}
              className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-600 space-y-2">
              <Package className="w-10 h-10 stroke-[1.5]" />
              <span className="text-xs font-mono">No Image Available</span>
            </div>
          )}

          {/* Platform Badge */}
          <div className="absolute top-3 left-3">
            {isTokopedia ? (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                <ShoppingBag className="w-3 h-3" />
                <span>TOKOPEDIA</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 backdrop-blur-md">
                <Package className="w-3 h-3" />
                <span>AMAZON</span>
              </span>
            )}
          </div>

          {/* Rating Badge */}
          {product.rating !== null && product.rating !== undefined && (
            <div className="absolute top-3 right-3 flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-semibold bg-slate-900/90 text-amber-400 border border-slate-700/60 backdrop-blur-md">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{Number(product.rating).toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          {/* Title with 2 lines clamp */}
          <h3
            className="text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-emerald-400 transition-colors"
            title={product.title}
          >
            {product.title}
          </h3>

          {/* Price */}
          <div className="pt-1">
            <span className="text-xs text-slate-400 font-medium block">Price</span>
            <div className="text-xl font-extrabold text-white tracking-tight">
              {formatPrice(product.price, product.platform)}
            </div>
          </div>
        </div>
      </div>

      {/* Footer with View button */}
      <div className="p-5 pt-0">
        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 border border-slate-700/60 hover:border-emerald-400 transition-all duration-200 group/btn"
        >
          <span>View on {isTokopedia ? 'Tokopedia' : 'Amazon'}</span>
          <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
        </a>
      </div>
    </div>
  );
};
