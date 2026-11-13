import React from 'react';
import {
  LayoutDashboard,
  Users,
  UploadCloud,
  Dna,
  Network,
  Sparkles,
  Target,
  FileText,
  Info
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  selectedPatientId?: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, selectedPatientId }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'registry', label: 'Patient Registry', icon: Users, badge: '250' },
    { id: 'upload', label: 'Omics Data', icon: UploadCloud, badge: null },
    { id: 'analysis', label: 'Molecular Analysis', icon: Dna, badge: null },
    { id: 'classification', label: 'Patient Classification', icon: Network, badge: 'K-Means' },
    { id: 'prediction', label: 'Treatment Prediction', icon: Sparkles, badge: 'RF' },
    { id: 'strategy', label: 'Personalized Strategy', icon: Target, badge: selectedPatientId || null },
    { id: 'reports', label: 'Reports', icon: FileText, badge: 'PDF' },
    { id: 'about', label: 'About', icon: Info, badge: null },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 text-slate-700 flex flex-col flex-shrink-0 min-h-[calc(100vh-61px)] shadow-xs">
      {/* Patient quick badge if selected */}
      {selectedPatientId && (
        <div className="mx-4 my-3 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-teal-600"></span>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Selected Patient</p>
              <p className="text-xs font-mono font-bold text-slate-900">{selectedPatientId}</p>
            </div>
          </div>
          <button
            onClick={() => onSelectTab('strategy')}
            className="text-[10px] bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 font-bold px-2 py-1 rounded transition"
          >
            Strategy
          </button>
        </div>
      )}

      {/* Main navigation */}
      <div className="px-3 py-3 flex-1 space-y-1">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Navigation</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-teal-50 text-teal-800 border border-teal-200 font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-teal-700' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                    isActive
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Platform footer info */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 space-y-1">
        <div className="flex items-center justify-between text-slate-700">
          <span className="font-bold">ONCOPROFILE AI</span>
          <span className="text-[10px] text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono">
            v1.0.0
          </span>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Clinical Multi-Omics Decision Support
        </p>
      </div>
    </aside>
  );
};
