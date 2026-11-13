import React from 'react';
import { Activity, ShieldCheck, User } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  return (
    <header className="bg-white border-b border-slate-200 text-slate-900 sticky top-0 z-40 px-6 py-3 shadow-xs">
      <div className="flex items-center justify-between">
        {/* Brand */}
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => onNavigate('dashboard')}
        >
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-black shadow-xs">
            <Activity className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                ONCOPROFILE AI
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full">
                Precision Oncology
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Multi-Omics Breast Cancer Treatment Strategy</p>
          </div>
        </div>

        {/* Global indicators */}
        <div className="hidden md:flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-700 font-medium">Inference Engine: Active</span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-700 font-medium">Cohort: 250 Profiles</span>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
            <User className="w-4 h-4 text-slate-500" />
          </div>
        </div>
      </div>
    </header>
  );
};
