import React from 'react';
import { Database, Activity } from 'lucide-react';

interface NavbarProps {
  isScraping: boolean;
  totalProducts: number;
}

export const Navbar: React.FC<NavbarProps> = ({ isScraping, totalProducts }) => {
  return (
    <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Database className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  ScrapeHub
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  v1.0
                </span>
              </div>
            </div>
          </div>

          {/* Right Status */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-800">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Database: <strong className="text-white font-medium">{totalProducts}</strong> items</span>
            </div>

            <div className="flex items-center space-x-2">
              {isScraping ? (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  <span>SCRAPING...</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>SYSTEM ONLINE</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
