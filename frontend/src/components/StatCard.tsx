import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  accentColor?: 'emerald' | 'cyan' | 'amber';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  icon: Icon,
  badge,
  accentColor = 'emerald',
}) => {
  const accentClasses = {
    emerald: 'from-emerald-500/20 to-transparent text-emerald-400 group-hover:border-emerald-500/50',
    cyan: 'from-cyan-500/20 to-transparent text-cyan-400 group-hover:border-cyan-500/50',
    amber: 'from-amber-500/20 to-transparent text-amber-400 group-hover:border-amber-500/50',
  };

  return (
    <div className={`group relative bg-slate-900 border border-slate-800 rounded-xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5 ${accentClasses[accentColor]}`}>
      {/* Background subtle gradient glow */}
      <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-emerald-400">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-5xl sm:text-6xl font-bold tracking-tight text-white">
          {value}
        </div>
        {subtitle && (
          <p className="text-sm text-slate-400 font-medium pt-1">
            {subtitle}
          </p>
        )}
      </div>

      {badge && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300">
            {badge}
          </span>
        </div>
      )}
    </div>
  );
};
