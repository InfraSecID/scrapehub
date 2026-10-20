import React, { useState } from 'react';
import { Filter, RotateCcw, Search, DollarSign, Star, Layers } from 'lucide-react';
import { ProductFilterParams, Platform } from '../types';

interface FilterBarProps {
  onApplyFilters: (filters: ProductFilterParams) => void;
  isLoading?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({ onApplyFilters, isLoading }) => {
  const [platform, setPlatform] = useState<Platform>('ALL');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minRating, setMinRating] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const filters: ProductFilterParams = {
      platform: platform === 'ALL' ? undefined : platform,
      minPrice: minPrice !== '' ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice !== '' ? parseFloat(maxPrice) : undefined,
      minRating: minRating !== '' ? parseFloat(minRating) : undefined,
    };

    onApplyFilters(filters);
  };

  const handleReset = () => {
    setPlatform('ALL');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    onApplyFilters({});
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 mb-8 shadow-xl shadow-slate-950/50 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center space-x-2 text-white font-semibold text-sm">
            <Filter className="w-4 h-4 text-emerald-400" />
            <span>Filter Products</span>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Platform Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Platform</span>
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            >
              <option value="ALL">All Platforms</option>
              <option value="TOKOPEDIA">Tokopedia</option>
              <option value="AMAZON">Amazon</option>
            </select>
          </div>

          {/* Min Price */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center space-x-1.5">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              <span>Min Price</span>
            </label>
            <input
              type="number"
              placeholder="e.g. 50000"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              min="0"
            />
          </div>

          {/* Max Price */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center space-x-1.5">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              <span>Max Price</span>
            </label>
            <input
              type="number"
              placeholder="e.g. 5000000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              min="0"
            />
          </div>

          {/* Min Rating */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center space-x-1.5">
              <Star className="w-3.5 h-3.5 text-slate-400" />
              <span>Min Rating</span>
            </label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            >
              <option value="">Any Rating</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4.0">4.0+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
              <option value="3.0">3.0+ Stars</option>
            </select>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center space-x-2 px-5 py-2 rounded-lg text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shadow-emerald-500/10 disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            <span>Apply Filter</span>
          </button>
        </div>
      </form>
    </div>
  );
};
