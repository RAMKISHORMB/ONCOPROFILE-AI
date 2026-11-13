import React, { useEffect, useState } from 'react';
import {
  Info
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { fetchClusters } from '../api';
import { ClusterResponse } from '../types';

interface PatientClassificationPageProps {
  onNavigate: (tab: string, patientId?: string) => void;
}

const CLUSTER_COLORS = ['#0D9488', '#E11D48', '#7C3AED', '#0284C7'];

export const PatientClassificationPage: React.FC<PatientClassificationPageProps> = () => {
  const [data, setData] = useState<ClusterResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClusters()
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
          <p className="text-xs font-semibold text-slate-500">Executing Multi-Omics PCA Projection &amp; Cluster Centroids...</p>
        </div>
      </div>
    );
  }

  // Partition scatter points by cluster for distinct chart series colors
  const seriesByCluster = [1, 2, 3, 4].map((cId) => ({
    clusterId: cId,
    name: data.clusters.find((c) => c.cluster_id === cId)?.cluster_name || `Cluster ${cId}`,
    color: CLUSTER_COLORS[cId - 1],
    points: data.scatter_points.filter((pt) => pt.cluster_id === cId)
  }));

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
            Unsupervised Molecular Classification
          </span>
          <span className="text-xs text-slate-400">K-Means (k=4) &amp; Latent Dimensionality Reduction</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Patient Classification &amp; PCA Projection
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Computational grouping of 250 multi-omics profiles across 11 standardized molecular coordinates.
        </p>
      </div>

      {/* Critical Scientific Distinction Banner in Pure Light Theme */}
      <div className="p-4 bg-sky-50/70 text-sky-950 rounded-2xl border border-sky-200 shadow-xs flex items-start space-x-3.5">
        <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center flex-shrink-0 mt-0.5 border border-sky-200">
          <Info className="w-4 h-4" />
        </div>
        <div className="text-xs leading-relaxed space-y-1">
          <p className="font-bold text-sky-950 flex items-center space-x-1.5">
            <span>Clinical Distinction: IHC Subtypes vs. Unsupervised Clusters</span>
          </p>
          <p className="text-sky-900/90">
            Standard breast cancer subtypes (Luminal A, Luminal B, HER2-enriched, TNBC) are established based on validated immunohistochemistry and gene expression panels (PAM50). In contrast, the 4 machine-learning clusters below represent <strong>exploratory multi-dimensional mathematical groupings</strong> in transcriptomic/genomic space. While they strongly align with intrinsic biology, unsupervised clusters are investigative research constructs.
          </p>
        </div>
      </div>

      {/* PCA 2D Scatter Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Two-Dimensional Principal Component Analysis (PCA) Projection
            </h3>
            <p className="text-xs text-slate-500">
              PC1 ({data.pca_variance_ratio[0]}% variance) vs. PC2 ({data.pca_variance_ratio[1]}% variance)
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500">Explained Variance:</span>
            <span className="font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              {(data.pca_variance_ratio[0] + data.pca_variance_ratio[1]).toFixed(1)}% Total
            </span>
          </div>
        </div>

        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                type="number"
                dataKey="x"
                name="Principal Component 1"
                unit=""
                tick={{ fontSize: 11 }}
                label={{ value: 'PC1 (ESR1 / Proliferation Axis)', position: 'insideBottom', offset: -10, fontSize: 11 }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Principal Component 2"
                unit=""
                tick={{ fontSize: 11 }}
                label={{ value: 'PC2 (HER2 / EGFR Axis)', angle: -90, position: 'insideLeft', fontSize: 11 }}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const pt = payload[0].payload;
                    return (
                      <div className="bg-white text-slate-900 p-3 rounded-xl shadow-md border border-slate-200 text-xs space-y-1">
                        <p className="font-mono font-bold text-teal-700">{pt.patient_id}</p>
                        <p className="text-slate-700">Subtype: <strong>{pt.subtype}</strong></p>
                        <p className="text-slate-700">Cluster: <strong>{pt.cluster_name}</strong></p>
                        <p className="text-slate-600">Stage: {pt.stage} | Ki-67: {pt.ki67}%</p>
                        <p className="text-slate-400 font-mono text-[10px]">
                          Coordinates: ({pt.x.toFixed(2)}, {pt.y.toFixed(2)})
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
              {seriesByCluster.map((series) => (
                <Scatter
                  key={series.clusterId}
                  name={series.name}
                  data={series.points}
                  fill={series.color}
                  shape="circle"
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4 Clusters Profile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.clusters.map((c) => {
          const color = CLUSTER_COLORS[c.cluster_id - 1];
          return (
            <div
              key={c.cluster_id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${color}15`, color: color, border: `1px solid ${color}30` }}
                  >
                    Cluster {c.cluster_id}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {c.patient_count} pts ({Math.round((c.patient_count / 250) * 100)}%)
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-900 leading-snug mb-2">{c.cluster_name}</h4>
                <div className="space-y-1.5 text-[11px] text-slate-600 mb-4">
                  {c.key_characteristics.map((char, idx) => (
                    <div key={idx} className="flex items-start space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: color }}></span>
                      <span>{char}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mean Expression Signature snippet */}
              <div className="pt-3 border-t border-slate-100 text-[10px] font-mono space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">ESR1 expr:</span>
                  <span className="font-bold text-slate-800">{c.mean_expressions.esr1_expression}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ERBB2 expr:</span>
                  <span className="font-bold text-slate-800">{c.mean_expressions.erbb2_expression}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">MKI67 expr:</span>
                  <span className="font-bold text-slate-800">{c.mean_expressions.mki67_expression}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">TP53 mut rate:</span>
                  <span className="font-bold text-slate-800">{c.mutation_rates.tp53_mutation}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gene Expression Heatmap Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Cluster Gene Expression Heatmap Signature
            </h3>
            <p className="text-xs text-slate-500">
              Normalized log2 transcript levels across the 4 computational clusters
            </p>
          </div>
          <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">
            Heatmap Matrix
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold border-b border-slate-200">
                <th className="p-3 text-left font-mono">Cluster Identifier</th>
                <th className="p-3 font-mono">ESR1</th>
                <th className="p-3 font-mono">PGR</th>
                <th className="p-3 font-mono">ERBB2</th>
                <th className="p-3 font-mono">MKI67</th>
                <th className="p-3 font-mono">EGFR</th>
                <th className="p-3 font-mono">BRCA1</th>
                <th className="p-3 font-mono">BRCA2</th>
                <th className="p-3 font-mono">PIK3CA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {data.clusters.map((c) => {
                const expr = c.mean_expressions;
                const getHeatBg = (val: number, maxVal = 14) => {
                  const ratio = Math.min(1, Math.max(0, val / maxVal));
                  if (ratio > 0.7) return 'bg-teal-600 text-white font-bold';
                  if (ratio > 0.5) return 'bg-teal-100 text-teal-950 font-semibold';
                  if (ratio > 0.35) return 'bg-teal-50 text-teal-900';
                  return 'bg-slate-50 text-slate-600';
                };

                return (
                  <tr key={c.cluster_id} className="hover:bg-slate-50/80">
                    <td className="p-3 text-left font-bold text-slate-900">
                      Cluster {c.cluster_id} ({c.prevalent_subtype})
                    </td>
                    <td className={`p-3 ${getHeatBg(expr.esr1_expression)}`}>{expr.esr1_expression}</td>
                    <td className={`p-3 ${getHeatBg(expr.pgr_expression)}`}>{expr.pgr_expression}</td>
                    <td className={`p-3 ${getHeatBg(expr.erbb2_expression)}`}>{expr.erbb2_expression}</td>
                    <td className={`p-3 ${getHeatBg(expr.mki67_expression)}`}>{expr.mki67_expression}</td>
                    <td className={`p-3 ${getHeatBg(expr.egfr_expression)}`}>{expr.egfr_expression}</td>
                    <td className={`p-3 ${getHeatBg(expr.brca1_expression)}`}>{expr.brca1_expression}</td>
                    <td className={`p-3 ${getHeatBg(expr.brca2_expression)}`}>{expr.brca2_expression}</td>
                    <td className={`p-3 ${getHeatBg(expr.pik3ca_expression)}`}>{expr.pik3ca_expression}</td>
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
