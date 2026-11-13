import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: 'teal' | 'blue' | 'rose' | 'amber' | 'emerald';
  trend?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeColor = 'teal',
  trend,
}) => {
  const badgeClasses = {
    teal: 'bg-teal-50 text-teal-700 border-teal-200',
    blue: 'bg-sky-50 text-sky-700 border-sky-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  }[badgeColor];

  const iconBgClasses = {
    teal: 'bg-teal-50 text-teal-700 border border-teal-100',
    blue: 'bg-sky-50 text-sky-700 border border-sky-100',
    rose: 'bg-rose-50 text-rose-700 border border-rose-100',
    amber: 'bg-amber-50 text-amber-700 border border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  }[badgeColor];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBgClasses}`}>
          <Icon className="w-4 h-4 stroke-[2.2]" />
        </div>
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-black text-slate-900 tracking-tight">{value}</span>
        {badge && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClasses}`}>
            {badge}
          </span>
        )}
      </div>
      {(subtitle || trend) && (
        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
          {subtitle && <span>{subtitle}</span>}
          {trend && <span className="font-semibold text-slate-700">{trend}</span>}
        </div>
      )}
    </div>
  );
};
