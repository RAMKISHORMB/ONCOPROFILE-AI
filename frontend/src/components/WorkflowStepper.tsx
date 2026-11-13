import React from 'react';
import { CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { ProcessingStage } from '../types';

interface WorkflowStepperProps {
  stages: ProcessingStage[];
  currentStep: number;
  isRunning: boolean;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  stages,
  currentStep,
  isRunning,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>7-Stage Precision Oncology Processing Pipeline</span>
            {isRunning && (
              <span className="flex items-center text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" /> In Progress
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-500">
            Automated verification, molecular extraction, spatial clustering, and strategy synthesis.
          </p>
        </div>
        <div className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
          Step {Math.min(currentStep, 7)} / 7
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {stages.map((stage) => {
          const isDone = stage.step < currentStep || (!isRunning && currentStep >= 7);
          const isCurrent = stage.step === currentStep && isRunning;

          return (
            <div
              key={stage.step}
              className={`rounded-xl p-3 border transition-all text-left flex flex-col justify-between ${
                isDone
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                  : isCurrent
                  ? 'bg-teal-50 border-teal-400 text-teal-950 shadow-xs ring-1 ring-teal-500/20'
                  : 'bg-slate-50/80 border-slate-200 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                    isDone
                      ? 'bg-emerald-100 text-emerald-800'
                      : isCurrent
                      ? 'bg-teal-700 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  0{stage.step}
                </span>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-teal-600 animate-spin" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
              <div>
                <p className={`text-xs font-bold leading-tight mb-1 ${isCurrent ? 'text-teal-950' : isDone ? 'text-emerald-950' : 'text-slate-700'}`}>
                  {stage.name}
                </p>
                <p className="text-[10px] line-clamp-2 leading-relaxed opacity-80">
                  {stage.details}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
