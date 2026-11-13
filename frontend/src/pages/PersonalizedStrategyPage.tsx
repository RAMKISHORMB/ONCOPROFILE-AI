import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Dna,
  Printer,
  FlaskConical
} from 'lucide-react';
import { fetchPatients, fetchPatientReport, analyzePatient } from '../api';
import { FullPatientAnalysis, Patient } from '../types';
import { WorkflowStepper } from '../components/WorkflowStepper';
import { AlertBanner } from '../components/AlertBanner';

interface PersonalizedStrategyPageProps {
  selectedPatientId?: string | null;
  onSelectPatient: (patientId: string) => void;
  onNavigate: (tab: string, patientId?: string) => void;
}

export const PersonalizedStrategyPage: React.FC<PersonalizedStrategyPageProps> = ({
  selectedPatientId,
  onSelectPatient,
  onNavigate
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activePatientId, setActivePatientId] = useState<string>(selectedPatientId || 'ONC-001');
  const [report, setReport] = useState<FullPatientAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeStep, setActiveStep] = useState(7);
  const [activeTab, setActiveTab] = useState<'pathways' | 'justifications' | 'cluster' | 'limitations'>('pathways');

  const loadReport = (pId: string) => {
    setLoading(true);
    fetchPatientReport(pId)
      .then((data) => {
        setReport(data);
        setActiveStep(7);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPatients().then((pts) => {
      setPatients(pts);
    });
    loadReport(activePatientId);
  }, []);

  const handlePatientSelectChange = (newId: string) => {
    setActivePatientId(newId);
    onSelectPatient(newId);
    loadReport(newId);
  };

  // Stepped analysis execution
  const handleRunFullAnalysis = async () => {
    setAnalyzing(true);
    setActiveStep(1);

    const stepInterval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < 6) return prev + 1;
        clearInterval(stepInterval);
        return 6;
      });
    }, 350);

    try {
      const freshAnalysis = await analyzePatient(activePatientId);
      setTimeout(() => {
        clearInterval(stepInterval);
        setActiveStep(7);
        setReport(freshAnalysis);
        setAnalyzing(false);
      }, 2200);
    } catch (err) {
      console.error(err);
      clearInterval(stepInterval);
      setAnalyzing(false);
    }
  };

  if (loading && !report) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Synthesizing Precision Oncology Strategy...</p>
        </div>
      </div>
    );
  }

  const patient = report?.patient;
  const analysis = report?.analysis;
  const strategy = report?.strategy;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Bar with Patient Selector and Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
              Precision Strategy Engine
            </span>
            <span className="text-xs text-slate-400">Rule-Based Explainable Clinical Pathways</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Personalized Breast Cancer Treatment Strategy
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Individualized molecular rationale translating somatic mutations and expression signatures into targeted therapy options.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-slate-600">Patient:</label>
            <select
              value={activePatientId}
              onChange={(e) => handlePatientSelectChange(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
            >
              {patients.slice(0, 30).map((p) => (
                <option key={p.patient_id} value={p.patient_id}>
                  {p.patient_id} ({p.molecular_subtype})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleRunFullAnalysis}
            disabled={analyzing}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{analyzing ? 'Executing 7-Step Pipeline...' : 'ANALYSE PATIENT'}</span>
          </button>

          <button
            onClick={() => onNavigate('reports', activePatientId)}
            className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center space-x-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      <AlertBanner />

      {/* 7-Step Pipeline Stepper */}
      {report?.processing_stages && (
        <WorkflowStepper
          stages={report.processing_stages}
          currentStep={activeStep}
          isRunning={analyzing}
        />
      )}

      {/* Patient Header Card in Clean Premium Light Theme */}
      {patient && (
        <div className="bg-white rounded-2xl p-6 text-slate-900 shadow-xs border border-slate-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-black font-mono tracking-tight text-slate-900">
                  {patient.patient_id}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                  {patient.molecular_subtype}
                </span>
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 font-medium">
                  {patient.disease_stage}
                </span>
                <span className="text-xs text-slate-500 font-medium">{patient.age} Years Old</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed max-w-3xl">
                {strategy?.molecular_summary}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 flex-shrink-0">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">IHC Profile</span>
                <span className="font-mono font-bold text-slate-800">
                  {patient.er_status[0]}+ | {patient.pr_status[0]}+ | {patient.her2_status[0]}-
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Ki-67 Index</span>
                <span className="font-mono font-bold text-slate-800">{patient.ki67_percent}%</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">ML Cluster</span>
                <span className="font-mono font-bold text-teal-700 truncate block max-w-[120px]">
                  {analysis?.cluster_name.split(':')[0]}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-3 pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500">Predicted Response</span>
                <span className="font-bold text-emerald-700 font-mono">
                  {analysis?.predicted_response} ({(analysis?.response_confidence || 0) * 100}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Molecular Profiling Findings Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Important Genomic Mutations */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Dna className="w-4 h-4 text-teal-600" />
            <span>Important Genomic Driver Variants</span>
          </div>
          <div className="space-y-1.5 pt-1">
            {strategy?.important_mutations.map((mut, idx) => (
              <div key={idx} className="flex items-start space-x-2 text-xs text-slate-800 font-medium">
                <span className="w-2 h-2 rounded-full bg-teal-600 mt-1 flex-shrink-0"></span>
                <span>{mut}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Significant Transcriptomic Findings */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <FlaskConical className="w-4 h-4 text-sky-600" />
            <span>Significant Gene Expression Findings</span>
          </div>
          <div className="space-y-1.5 pt-1">
            {strategy?.significant_expressions.map((exp, idx) => (
              <div key={idx} className="flex items-start space-x-2 text-xs text-slate-800 font-medium">
                <span className="w-2 h-2 rounded-full bg-sky-600 mt-1 flex-shrink-0"></span>
                <span>{exp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs for Detailed Strategy Report */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/60 px-6 pt-3 text-xs font-bold space-x-6">
          {[
            { id: 'pathways', label: 'Potential Treatment Pathways', count: strategy?.potential_pathways.length },
            { id: 'justifications', label: 'Biochemical Justifications', count: strategy?.scientific_justifications.length },
            { id: 'cluster', label: 'Computational Cluster Alignment', count: null },
            { id: 'limitations', label: 'Clinical Limitations & Guidance', count: strategy?.limitations.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 border-b-2 flex items-center space-x-2 transition ${
                activeTab === tab.id
                  ? 'border-teal-600 text-teal-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab 1: Pathways */}
        {activeTab === 'pathways' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Identified Molecular Therapeutic Pathways
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                Decision Support — Requires Oncologist Verification
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {strategy?.potential_pathways.map((pw, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200 space-y-3 hover:border-teal-300 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                      {pw.category}
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {pw.evidence_level}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900 mb-1">{pw.recommendation}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{pw.rationale}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-xs flex items-center space-x-2">
                    <span className="text-slate-400 font-semibold">Actionable Target:</span>
                    <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {pw.actionable_target}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Scientific Justifications */}
        {activeTab === 'justifications' && (
          <div className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Biochemical Signaling Pathways &amp; Mechanistic Rationale
            </h3>
            <div className="space-y-3">
              {strategy?.scientific_justifications.map((j, idx) => (
                <div key={idx} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{j.biomarker}</span>
                    <span className="font-mono text-[11px] font-bold bg-white text-teal-700 border border-teal-200 px-2.5 py-0.5 rounded">
                      Finding: {j.finding}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 block mb-0.5">Biochemical Pathway:</span>
                    <p className="text-slate-600 leading-relaxed">{j.biochemical_pathway}</p>
                  </div>
                  <div className="pt-1.5 border-t border-slate-200">
                    <span className="font-semibold text-slate-700 block mb-0.5">Translational Clinical Rationale:</span>
                    <p className="text-slate-600 leading-relaxed">{j.clinical_rationale}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Cluster Profile */}
        {activeTab === 'cluster' && (
          <div className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Computational Multi-Omics Space Coordinates
            </h3>
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Assigned Cluster</span>
                  <span className="font-bold text-slate-900 text-sm">{analysis?.cluster_name}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">PCA PC1 Coordinate</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{analysis?.pca_x}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">PCA PC2 Coordinate</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{analysis?.pca_y}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Prediction Confidence</span>
                  <span className="font-mono font-bold text-emerald-700 text-sm">
                    {(analysis?.response_confidence || 0) * 100}%
                  </span>
                </div>
              </div>

              <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-teal-950 text-xs leading-relaxed">
                <strong className="block mb-1">Algorithmic Interpretation:</strong>
                Patient {patient?.patient_id} maps closely to the centroid of {analysis?.cluster_name}. The high transcript abundance of ESR1 and PGR pulls the sample along the negative/positive axis of Principal Component 1, reflecting strong hormone-receptor driven transcription.
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Limitations */}
        {activeTab === 'limitations' && (
          <div className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Clinical Constraints &amp; Model Guidance
            </h3>
            <div className="space-y-2.5">
              {strategy?.limitations.map((lim, idx) => (
                <div key={idx} className="flex items-start space-x-3 p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-950">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 flex-shrink-0"></span>
                  <span className="leading-relaxed">{lim}</span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl text-xs leading-relaxed">
              <strong className="text-slate-900 block mb-1">Clinical Verification Disclaimer:</strong>
              {strategy?.clinician_disclaimer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
