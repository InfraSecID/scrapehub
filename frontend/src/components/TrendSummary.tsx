import React from 'react';
import { Sparkles, BrainCircuit, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { TrendSummaryData, Product } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface TrendSummaryProps {
  summary: TrendSummaryData | null;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  error?: string | null;
  products: Product[];
}

export const TrendSummary: React.FC<TrendSummaryProps> = ({
  summary,
  onAnalyze,
  isAnalyzing,
  error,
  products,
}) => {
  // Generate quick distribution chart from current products
  const chartData = React.useMemo(() => {
    if (!products || products.length === 0) return [];

    // Group products into price buckets (in thousands/millions IDR)
    const buckets: Record<string, number> = {
      '< 100k': 0,
      '100k - 500k': 0,
      '500k - 2M': 0,
      '2M - 10M': 0,
      '> 10M': 0,
    };

    products.forEach((p) => {
      const price = p.price;
      if (price < 100000) buckets['< 100k']++;
      else if (price <= 500000) buckets['100k - 500k']++;
      else if (price <= 2000000) buckets['500k - 2M']++;
      else if (price <= 10000000) buckets['2M - 10M']++;
      else buckets['> 10M']++;
    });

    return Object.entries(buckets).map(([range, count]) => ({
      range,
      count,
    }));
  }, [products]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 mb-10 shadow-2xl shadow-slate-950/80 transition-all hover:border-emerald-500/30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 text-emerald-400">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <span>AI Trend Analysis</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Llama 3.3 70B
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated multi-platform market sentiment and pricing pattern detection
            </p>
          </div>
        </div>

        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>{isAnalyzing ? 'Analyzing trends...' : 'Analyze Trend'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
        {/* Left 2 Cols: Summary Text */}
        <div className="lg:col-span-2 space-y-4">
          {error && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block mb-0.5">Analysis Notice</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          {summary ? (
            <div className="space-y-4">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 text-slate-200 leading-relaxed text-sm md:text-base whitespace-pre-line font-normal">
                {summary.summary}
              </div>

              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  Generated on {new Date(summary.createdAt).toLocaleString('id-ID')}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified by Groq</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950/40 border border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-400">
              <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Click Analyze to generate trend summary</p>
              <p className="text-xs text-slate-500 mt-1">
                Groq AI will inspect the top 10 products and identify emerging product categories, dominant platforms, and price boundaries.
              </p>
            </div>
          )}
        </div>

        {/* Right Col: Price Distribution Chart */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Price Distribution
            </span>
            <span className="text-xs text-slate-500">Live products by price tier</span>
          </div>

          <div className="h-44 w-full mt-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="range" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No product data for chart
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
