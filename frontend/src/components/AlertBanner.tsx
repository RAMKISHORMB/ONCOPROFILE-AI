import React from 'react';
import { ShieldAlert, AlertTriangle, Info } from 'lucide-react';

interface AlertBannerProps {
  type?: 'disclaimer' | 'info' | 'warning';
  title?: string;
  message?: string;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  type = 'disclaimer',
  title,
  message,
}) => {
  if (type === 'disclaimer') {
    return (
      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3.5 shadow-xs text-amber-950">
        <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-700 mt-0.5">
          <ShieldAlert className="w-4 h-4" />
        </div>
        <div className="text-xs leading-relaxed">
          <p className="font-bold text-amber-950 mb-0.5">
            {title || 'Clinical Decision Support & Investigation Notice'}
          </p>
          <p className="text-amber-900/90">
            {message ||
              'ONCOPROFILE AI is an advanced clinical bioinformatics platform for precision oncology research. Multi-omics predictive outputs and treatment pathways represent evidence-guided decision-support hypotheses to assist multidisciplinary oncology evaluation. All therapeutic considerations require specialist physician verification.'}
          </p>
        </div>
      </div>
    );
  }

  if (type === 'warning') {
    return (
      <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 flex items-start space-x-3.5 shadow-xs text-rose-950">
        <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0 text-rose-700 mt-0.5">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="text-xs leading-relaxed">
          <p className="font-bold text-rose-950 mb-0.5">{title || 'Attention Required'}</p>
          <p className="text-rose-900/90">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-4 flex items-start space-x-3.5 shadow-xs text-sky-950">
      <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center flex-shrink-0 text-sky-700 mt-0.5">
        <Info className="w-4 h-4" />
      </div>
      <div className="text-xs leading-relaxed">
        <p className="font-bold text-sky-950 mb-0.5">{title || 'Platform Methodology'}</p>
        <p className="text-sky-900/90">{message}</p>
      </div>
    </div>
  );
};
