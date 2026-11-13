import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { fetchMolecularAnalysis } from '../api';
import { MolecularAnalysisData } from '../types';

export const MolecularAnalysisPage: React.FC = () => {
  const [data, setData] = useState<MolecularAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMolecularAnalysis()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Loading Molecular Profiling &amp; Correlation Engines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
            Bioinformatics &amp; Expression Analysis
          </span>
          <span className="text-xs text-slate-400">Multi-Gene Comparative Transcriptomics &amp; Genomics</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Molecular Profiling &amp; Biomarker Correlation
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Comparative quantification of transcriptomic expression levels, somatic variant distribution, and feature weights.
        </p>
      </div>

      {/* Chart 1: Gene Expression by Subtype */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Normalized Transcriptomic Gene Expression Across Subtypes
            </h3>
            <p className="text-xs text-slate-500">Mean expression levels in log2(TPM + 1)</p>
          </div>
          <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">
            8-Gene Signature
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.expression_by_subtype} margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="gene" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} unit=" log2" domain={[0, 16]} />
              <Tooltip formatter={(val: any) => [`${val} log2 TPM`, 'Mean Expression']} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
              <Bar dataKey="Luminal A" fill="#0D9488" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Luminal B" fill="#0284C7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="HER2-enriched" fill="#E11D48" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Triple-Negative (TNBC)" fill="#7C3AED" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-200">
            <span className="font-bold text-teal-900 block mb-0.5">Luminal A:</span>
            <span className="text-slate-600">Peak ESR1 (11.8) and PGR (10.2); suppressed MKI67 (5.4) and ERBB2 (6.2).</span>
          </div>
          <div className="p-3 bg-sky-50/70 rounded-xl border border-sky-200">
            <span className="font-bold text-sky-900 block mb-0.5">Luminal B:</span>
            <span className="text-slate-600">Robust ESR1 (10.1); increased proliferative MKI67 (8.1) with variable ERBB2.</span>
          </div>
          <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200">
            <span className="font-bold text-rose-900 block mb-0.5">HER2-enriched:</span>
            <span className="text-slate-600">Profound ERBB2 elevation (13.6 log2) with minimal ESR1/PGR transcripts.</span>
          </div>
          <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200">
            <span className="font-bold text-purple-900 block mb-0.5">TNBC (Basal):</span>
            <span className="text-slate-600">Highest EGFR (9.6) and MKI67 (10.5); triple negative for hormone &amp; HER2.</span>
          </div>
        </div>
      </div>

      {/* Two columns: Feature Importances & Correlation Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ML Feature Importances */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Model Feature Importance Analysis
              </h3>
              <p className="text-xs text-slate-500">
                Gini importance weights from Random Forest Response Predictor
              </p>
            </div>
            <span className="text-xs font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg">
              Top 10 Drivers
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {data.feature_importances.slice(0, 10).map((item, idx) => (
              <div key={item.feature} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700 font-mono">
                    {idx + 1}. {item.feature}
                  </span>
                  <span className="font-bold text-slate-900 font-mono">
                    {item.percentage}% ({item.importance.toFixed(4)})
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-600 rounded-full"
                    style={{ width: `${Math.min(100, item.percentage * 4)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Analytical Insight:</span> Ki-67 proliferation fraction, ESR1 expression, and ERBB2 amplification represent the highest informational entropy reducers in predicting therapeutic response.
          </div>
        </div>

        {/* Correlation Matrix Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Molecular Biomarker Correlation Matrix
              </h3>
              <p className="text-xs text-slate-500">Pearson correlation coefficients (r)</p>
            </div>
            <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">
              Pairwise r
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold">
                  <th className="p-2 text-left font-mono">Marker</th>
                  <th className="p-2 font-mono">ESR1</th>
                  <th className="p-2 font-mono">PGR</th>
                  <th className="p-2 font-mono">ERBB2</th>
                  <th className="p-2 font-mono">MKI67</th>
                  <th className="p-2 font-mono">EGFR</th>
                  <th className="p-2 font-mono">Ki-67 %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {data.correlation_matrix.map((row) => (
                  <tr key={row.feature} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-left text-slate-800">{row.feature}</td>
                    {['ESR1', 'PGR', 'ERBB2', 'MKI67', 'EGFR', 'Ki-67 %'].map((col) => {
                      const val = row[col];
                      const isHighPos = val > 0.6;
                      const isHighNeg = val < -0.4;
                      return (
                        <td
                          key={col}
                          className={`p-2.5 font-semibold ${
                            val === 1
                              ? 'bg-slate-100 text-slate-500'
                              : isHighPos
                              ? 'bg-teal-50 text-teal-800 font-bold'
                              : isHighNeg
                              ? 'bg-rose-50 text-rose-800'
                              : 'text-slate-600'
                          }`}
                        >
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 bg-teal-100 border border-teal-300 rounded"></span>
              <span><strong>ESR1 vs PGR (r &ge; 0.75):</strong> Confirms preserved hormonal axis co-expression.</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 bg-teal-100 border border-teal-300 rounded"></span>
              <span><strong>MKI67 vs Ki-67 % (r &ge; 0.85):</strong> Concordance between mRNA and protein proliferation.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scientific Insights & Biological Heterogeneity in Pure Light Theme */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span>Biochemical Rationale for Breast Cancer Heterogeneity</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700 leading-relaxed">
          {data.biological_summary.map((summary, idx) => (
            <div key={idx} className="flex items-start space-x-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
              <span>{summary}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
