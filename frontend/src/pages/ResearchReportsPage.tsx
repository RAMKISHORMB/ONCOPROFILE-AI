import React, { useState, useEffect } from 'react';
import {
  Printer,
  Download
} from 'lucide-react';
import { fetchPatients, fetchPatientReport, fetchDashboard } from '../api';
import { FullPatientAnalysis, Patient, DashboardStats } from '../types';

interface ResearchReportsPageProps {
  selectedPatientId?: string | null;
  onNavigate: (tab: string, patientId?: string) => void;
}

export const ResearchReportsPage: React.FC<ResearchReportsPageProps> = ({
  selectedPatientId
}) => {
  const [reportType, setReportType] = useState<'individual' | 'cohort'>('individual');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activePatientId, setActivePatientId] = useState<string>(selectedPatientId || 'ONC-001');
  const [patientReport, setPatientReport] = useState<FullPatientAnalysis | null>(null);
  const [cohortStats, setCohortStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchPatients(), fetchDashboard(), fetchPatientReport(activePatientId)])
      .then(([pts, dash, rep]) => {
        setPatients(pts);
        setCohortStats(dash);
        setPatientReport(rep);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [activePatientId]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    window.open('/api/export/csv', '_blank');
  };

  if (loading || !patientReport || !cohortStats) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Compiling Clinical Oncology Dossier...</p>
        </div>
      </div>
    );
  }

  const p = patientReport.patient;
  const s = patientReport.strategy;
  const a = patientReport.analysis;

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      {/* Top Toolbar (Hidden when printing) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Clinical &amp; Research Dossier Reports</h1>
          <p className="text-xs text-slate-500">
            Generate and export standardized multi-omics patient laboratory dossiers and cohort analysis summaries.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setReportType('individual')}
              className={`px-3 py-1.5 rounded-lg transition ${
                reportType === 'individual' ? 'bg-white shadow-xs text-teal-700' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Patient Dossier
            </button>
            <button
              onClick={() => setReportType('cohort')}
              className={`px-3 py-1.5 rounded-lg transition ${
                reportType === 'cohort' ? 'bg-white shadow-xs text-teal-700' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cohort Summary
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4 text-teal-600" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* Patient Picker when in individual mode */}
      {reportType === 'individual' && (
        <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <label className="text-xs font-bold text-slate-700">Select Target Patient:</label>
            <select
              value={activePatientId}
              onChange={(e) => setActivePatientId(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {patients.slice(0, 30).map((pt) => (
                <option key={pt.patient_id} value={pt.patient_id}>
                  {pt.patient_id} — {pt.molecular_subtype} ({pt.disease_stage})
                </option>
              ))}
            </select>
          </div>
          <span className="text-xs text-slate-400">Previewing clinical laboratory layout</span>
        </div>
      )}

      {/* ================= Printable Document Container ================= */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs text-slate-900 space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-5">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-teal-600 rounded-xs"></span>
                <span className="text-lg font-black tracking-tight uppercase text-slate-900">
                  ONCOPROFILE AI PRECISION ONCOLOGY
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Comprehensive Multi-Omics Treatment Strategy Dossier
              </p>
            </div>
            <div className="text-right text-xs text-slate-500 font-mono">
              <p>Report Date: {new Date().toLocaleDateString()}</p>
              <p>Protocol: ONCO-ST-2026</p>
            </div>
          </div>
        </div>

        {/* Individual Report View */}
        {reportType === 'individual' ? (
          <div className="space-y-6 text-xs">
            {/* Patient Demographics & Baseline Table */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-3">
                1. Patient Demographics &amp; Immunohistochemistry Profile
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Patient ID</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{p.patient_id}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Age / Stage</span>
                  <span className="font-bold text-slate-800">{p.age} yrs / {p.disease_stage}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Molecular Subtype</span>
                  <span className="font-bold text-teal-800">{p.molecular_subtype}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Receptor Status</span>
                  <span className="font-mono font-bold text-slate-800">
                    ER {p.er_status} | PR {p.pr_status} | HER2 {p.her2_status}
                  </span>
                </div>
              </div>
            </div>

            {/* Molecular Profile Findings */}
            <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                2. Multi-Omics Profiling Summary
              </h3>
              <p className="text-slate-700 leading-relaxed bg-teal-50/60 p-3 rounded-xl border border-teal-100">
                {s.molecular_summary}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Pathogenic Genomic Alterations:</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    {s.important_mutations.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Significant Gene Expression Findings:</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    {s.significant_expressions.map((e, idx) => (
                      <li key={idx}>{e}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Computational Classification & Predicted Response */}
            <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                3. Computational Classification &amp; Response Inference
              </h3>
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-semibold">Assigned Cluster</span>
                  <span className="font-bold text-slate-900">{a.cluster_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-semibold">Predicted Response</span>
                  <span className="font-bold text-emerald-700">{a.predicted_response}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-semibold">Ensemble Confidence</span>
                  <span className="font-mono font-bold text-slate-900">{(a.response_confidence * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Personalized Treatment Pathways */}
            <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                4. Proposed Precision Oncology Treatment Pathways
              </h3>
              <div className="space-y-2.5">
                {s.potential_pathways.map((pw, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 text-xs">
                        {pw.category}: {pw.recommendation}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {pw.evidence_level}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{pw.rationale}</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Targeted Receptor/Enzyme: <strong>{pw.actionable_target}</strong>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Signatures & Clinical Disclaimer Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-[10px] text-slate-600 leading-relaxed">
              <p className="font-bold text-slate-800 uppercase">
                Clinical Decision Support Notice:
              </p>
              <p>{s.clinician_disclaimer}</p>
            </div>

            <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-xs text-slate-600">
              <div>
                <p className="text-[10px] text-slate-400">Electronic Verification Hash: 9f8a-onco-val-2026</p>
              </div>
              <div className="text-right">
                <div className="w-48 border-b border-slate-300 mb-1"></div>
                <p className="text-[10px] text-slate-400">Authorized Signature &amp; Date</p>
              </div>
            </div>
          </div>
        ) : (
          /* Cohort Summary View */
          <div className="space-y-6 text-xs">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                1. Cohort Broad Epidemiology
              </h3>
              <p className="text-slate-600 mb-3">
                Total Multi-Omics Profiles: <strong>{cohortStats.total_patients}</strong>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(cohortStats.subtype_distribution).map(([sub, count]) => (
                  <div key={sub} className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-400 text-[10px] block font-semibold">{sub}</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {count} ({Math.round((count / cohortStats.total_patients) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                2. Somatic Driver Genomic Frequencies
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(cohortStats.mutation_frequencies).map(([gene, freq]) => (
                  <div key={gene} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                    <span className="font-mono font-bold text-slate-700">{gene}</span>
                    <span className="font-bold text-teal-800">{freq}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                3. Supervised Model Response Cohort Outcomes
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(cohortStats.response_prediction_stats).map(([resp, count]) => (
                  <div key={resp} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[10px] block font-semibold">{resp}</span>
                    <span className="font-bold text-slate-900 text-base">{count} patients</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
