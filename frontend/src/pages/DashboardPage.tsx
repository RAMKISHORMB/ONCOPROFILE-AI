import React, { useEffect, useState } from 'react';
import {
  Users,
  Dna,
  TrendingUp,
  Activity,
  ArrowRight,
  Sparkles,
  Layers
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { fetchDashboard } from '../api';
import { DashboardStats } from '../types';
import { MetricCard } from '../components/MetricCard';
import { AlertBanner } from '../components/AlertBanner';

interface DashboardPageProps {
  onNavigate: (tab: string, patientId?: string) => void;
}

const SUBTYPE_COLORS: Record<string, string> = {
  'Luminal A': '#0D9488',
  'Luminal B': '#0284C7',
  'HER2-enriched': '#E11D48',
  'Triple-Negative (TNBC)': '#7C3AED',
  'Triple-Negative': '#7C3AED'
};

const RESPONSE_COLORS: Record<string, string> = {
  'Likely responder': '#10B981',
  'Intermediate response': '#F59E0B',
  'Lower predicted response': '#EF4444',
  'Pending analysis': '#94A3B8'
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard()
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading || !stats) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Loading Precision Oncology Dashboard...</p>
        </div>
      </div>
    );
  }

  // Transform data for charts
  const subtypeData = Object.entries(stats.subtype_distribution).map(([name, count]) => ({
    name,
    value: count,
    percentage: Math.round((count / stats.total_patients) * 100)
  }));

  const mutationData = Object.entries(stats.mutation_frequencies).map(([gene, freq]) => ({
    gene,
    frequency: freq
  }));

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
              Precision Oncology Platform
            </span>
            <span className="text-xs text-slate-400">Cohort: 250 Patient Profiles</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Multi-Omics Breast Cancer Decision Support
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Integrative somatic mutation screening, transcriptomic profiling, and machine-learning guided treatment strategy.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('strategy', 'ONC-001')}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Demonstrate ONC-001 Analysis</span>
          </button>
          <button
            onClick={() => onNavigate('registry')}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center space-x-1.5 shadow-xs"
          >
            <span>Patient Registry</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <AlertBanner />

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Patient Cohort"
          value={stats.total_patients}
          subtitle="Multi-omics profiles loaded"
          icon={Users}
          badge="Complete"
          badgeColor="teal"
          trend="Validated Cohort"
        />
        <MetricCard
          title="Prevalent Subtype"
          value="Luminal A (40%)"
          subtitle="Low proliferation hormone-positive"
          icon={Dna}
          badge="HR+/HER2-"
          badgeColor="blue"
        />
        <MetricCard
          title="Top Oncogenic Driver"
          value="PIK3CA (40.4%)"
          subtitle="Targetable alpha kinase mutation"
          icon={TrendingUp}
          badge="Kinase Domain"
          badgeColor="rose"
        />
        <MetricCard
          title="Response Model"
          value="Random Forest"
          subtitle="Holdout Test: 88.0% Accuracy"
          icon={Activity}
          badge="Stratified 80/20"
          badgeColor="emerald"
        />
      </div>

      {/* End-to-End Workflow Graphic in Pure Light Theme */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold tracking-tight text-slate-900 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-teal-600" />
              <span>Translational Precision Oncology Workflow</span>
            </h3>
            <p className="text-xs text-slate-500">
              Structured clinical pathway from raw molecular assays to targeted therapeutic hypotheses.
            </p>
          </div>
          <span className="text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-full font-bold">
            7 Integrated Phases
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center text-xs">
          {[
            { phase: '01', title: 'Patient Sample', desc: 'Core needle biopsy & NGS screening' },
            { phase: '02', title: 'Omics Data', desc: '6-gene DNA panel & 8-gene mRNA TPM' },
            { phase: '03', title: 'Data Processing', desc: 'Quality audit & Z-score scaling' },
            { phase: '04', title: 'Feature Extraction', desc: 'Actionable somatic alterations' },
            { phase: '05', title: 'Spatial Clustering', desc: 'K-Means (k=4) & 2D PCA mapping' },
            { phase: '06', title: 'Response Prediction', desc: '100-tree Random Forest classifier' },
            { phase: '07', title: 'Personalized Strategy', desc: 'NCCN/ESMO evidence-based pathways' },
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex flex-col justify-between text-left">
              <div>
                <span className="text-[10px] font-mono font-bold text-teal-700 block mb-1">STAGE {item.phase}</span>
                <p className="font-bold text-slate-900 text-xs mb-1">{item.title}</p>
                <p className="text-[10px] text-slate-500 leading-snug">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Analytics Row: Subtypes & Mutation Frequencies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subtype Distribution Donut */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Molecular Subtypes Distribution</h3>
              <p className="text-xs text-slate-500">IHC/FISH defined biological classification (n={stats.total_patients})</p>
            </div>
            <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">
              4 Subtypes
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subtypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                >
                  {subtypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SUBTYPE_COLORS[entry.name] || '#94A3B8'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} patients (${Math.round((val / stats.total_patients) * 100)}%)`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 text-xs">
            {subtypeData.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: SUBTYPE_COLORS[item.name] }}></span>
                <span className="font-medium text-slate-700 truncate">{item.name}</span>
                <span className="text-slate-500 ml-auto font-mono font-bold">{item.value} ({item.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mutation Frequency Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Pathogenic Genomic Alteration Frequencies</h3>
              <p className="text-xs text-slate-500">Screened 6-gene high-penetrance panel prevalence (%)</p>
            </div>
            <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">
              Targeted NGS
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mutationData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="gene" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={40} />
                <YAxis tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
                <Tooltip formatter={(value: any) => [`${value}% frequency`, 'Prevalence']} />
                <Bar dataKey="frequency" fill="#0D9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Enriched drivers: <strong className="text-slate-800">PIK3CA</strong> (40.4%) &amp; <strong className="text-slate-800">TP53</strong> (35.6%)</span>
            <button onClick={() => onNavigate('analysis')} className="text-teal-700 font-bold hover:underline">
              Molecular Analysis &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Recent Analyses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Recent Patient Analyses</h3>
            <p className="text-xs text-slate-500">Synthesized classification, clustering, and predictive outputs</p>
          </div>
          <button
            onClick={() => onNavigate('registry')}
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center space-x-1"
          >
            <span>View All Patients ({stats.total_patients})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] bg-slate-50">
                <th className="py-3 px-4 font-bold">Patient ID</th>
                <th className="py-3 px-4 font-bold">Subtype</th>
                <th className="py-3 px-4 font-bold">Disease Stage</th>
                <th className="py-3 px-4 font-bold">Assigned Cluster</th>
                <th className="py-3 px-4 font-bold">Predicted Response</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.recent_analyses.map((pt) => {
                const responseColor = RESPONSE_COLORS[pt.predicted_response] || '#64748B';
                return (
                  <tr key={pt.patient_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{pt.patient_id}</td>
                    <td className="py-3 px-4">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{
                          backgroundColor: `${SUBTYPE_COLORS[pt.subtype] || '#94a3b8'}15`,
                          color: SUBTYPE_COLORS[pt.subtype] || '#334155',
                          border: `1px solid ${SUBTYPE_COLORS[pt.subtype] || '#94a3b8'}30`
                        }}
                      >
                        {pt.subtype}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{pt.stage}</td>
                    <td className="py-3 px-4 text-slate-700 font-medium truncate max-w-xs">{pt.cluster_name}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: responseColor }}></span>
                        <span className="font-semibold" style={{ color: responseColor }}>{pt.predicted_response}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({pt.confidence}%)</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => onNavigate('strategy', pt.patient_id)}
                        className="text-[11px] font-bold bg-teal-50 hover:bg-teal-100 text-teal-700 px-3 py-1 rounded-lg border border-teal-200 transition"
                      >
                        Strategy
                      </button>
                      <button
                        onClick={() => onNavigate('reports', pt.patient_id)}
                        className="text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-lg transition"
                      >
                        Report
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
