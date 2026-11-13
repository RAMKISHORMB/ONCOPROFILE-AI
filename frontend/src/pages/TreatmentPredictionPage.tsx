import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Sliders
} from 'lucide-react';
import { fetchModelPerformance, fetchPatients } from '../api';
import { ModelPerformance, Patient } from '../types';
import { AlertBanner } from '../components/AlertBanner';

interface TreatmentPredictionPageProps {
  selectedPatientId?: string | null;
  onNavigate: (tab: string, patientId?: string) => void;
  onSelectPatient: (patientId: string) => void;
}

export const TreatmentPredictionPage: React.FC<TreatmentPredictionPageProps> = ({
  selectedPatientId,
  onNavigate,
  onSelectPatient
}) => {
  const [metrics, setMetrics] = useState<ModelPerformance | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activePatientId, setActivePatientId] = useState<string>(selectedPatientId || 'ONC-001');
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<any | null>(null);

  useEffect(() => {
    Promise.all([fetchModelPerformance(), fetchPatients()])
      .then(([m, pts]) => {
        setMetrics(m);
        setPatients(pts);
        setLoading(false);

        // Pre-fetch active patient prediction
        const targetId = selectedPatientId || 'ONC-001';
        fetch(`/api/model/predict/${targetId}`, { method: 'POST' })
          .then((r) => r.json())
          .then((pred) => setPredictionResult(pred))
          .catch((e) => console.error(e));
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedPatientId]);

  const handleRunPrediction = async () => {
    setPredicting(true);
    try {
      const res = await fetch(`/api/model/predict/${activePatientId}`, { method: 'POST' });
      const data = await res.json();
      setPredictionResult(data);
      onSelectPatient(activePatientId);
      setPredicting(false);
    } catch (e) {
      console.error(e);
      setPredicting(false);
    }
  };

  if (loading || !metrics) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Evaluating Random Forest Hold-Out Confusion Matrix...</p>
        </div>
      </div>
    );
  }

  const selectedPatient = patients.find((p) => p.patient_id === activePatientId);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
            Supervised Response Modeling
          </span>
          <span className="text-xs text-slate-400">Random Forest Classifier (100 Decision Trees)</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Treatment-Response Prediction &amp; Model Evaluation
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Stratified 80/20 train/test evaluation of therapeutic response outcomes across multi-omics biomarker vectors.
        </p>
      </div>

      <AlertBanner
        type="disclaimer"
        title="Model Validation Notice"
        message="Model performance metrics reflect hold-out test set accuracy on validated multi-omics benchmark cohorts. Outputs provide clinical decision support and require specialist physician verification."
      />

      {/* Model Benchmark Performance Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">Test Accuracy</span>
          <span className="text-2xl font-black text-teal-700 font-mono">{(metrics.accuracy * 100).toFixed(1)}%</span>
          <span className="text-[10px] text-slate-400 block mt-1">20% holdout test set (n=50)</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">Macro Precision</span>
          <span className="text-2xl font-black text-slate-900 font-mono">{(metrics.precision_macro * 100).toFixed(1)}%</span>
          <span className="text-[10px] text-slate-400 block mt-1">Unweighted class average</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">Macro Recall</span>
          <span className="text-2xl font-black text-slate-900 font-mono">{(metrics.recall_macro * 100).toFixed(1)}%</span>
          <span className="text-[10px] text-slate-400 block mt-1">True positive rate</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">Macro F1-Score</span>
          <span className="text-2xl font-black text-emerald-700 font-mono">{metrics.f1_macro.toFixed(3)}</span>
          <span className="text-[10px] text-slate-400 block mt-1">Harmonic mean precision-recall</span>
        </div>
      </div>

      {/* Interactive Patient Predictor Console */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-teal-600" />
              <span>Interactive Patient Response Inference</span>
            </h3>
            <p className="text-xs text-slate-500">Select any patient profile and execute multi-omics response probability modeling.</p>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={activePatientId}
              onChange={(e) => setActivePatientId(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {patients.slice(0, 30).map((p) => (
                <option key={p.patient_id} value={p.patient_id}>
                  {p.patient_id} ({p.molecular_subtype})
                </option>
              ))}
            </select>
            <button
              onClick={handleRunPrediction}
              disabled={predicting}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{predicting ? 'Classifying...' : 'Predict Response'}</span>
            </button>
          </div>
        </div>

        {/* Selected Patient Details & Result Output */}
        {selectedPatient && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Input Feature Vector Summary */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-900 text-sm">{selectedPatient.patient_id} Profile</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                  {selectedPatient.molecular_subtype}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>Age: <strong>{selectedPatient.age} yrs</strong></div>
                <div>Stage: <strong>{selectedPatient.disease_stage}</strong></div>
                <div>IHC Status: <strong>{selectedPatient.er_status} ER / {selectedPatient.pr_status} PR / {selectedPatient.her2_status} HER2</strong></div>
                <div>Ki-67 Index: <strong>{selectedPatient.ki67_percent}%</strong></div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <p className="font-bold text-slate-700 mb-1">Key Molecular Coordinates:</p>
                <div className="grid grid-cols-4 gap-1.5 font-mono text-[10px]">
                  <div className="bg-white p-1.5 rounded border border-slate-200">ESR1: {selectedPatient.transcriptomic?.esr1_expression}</div>
                  <div className="bg-white p-1.5 rounded border border-slate-200">PGR: {selectedPatient.transcriptomic?.pgr_expression}</div>
                  <div className="bg-white p-1.5 rounded border border-slate-200">ERBB2: {selectedPatient.transcriptomic?.erbb2_expression}</div>
                  <div className="bg-white p-1.5 rounded border border-slate-200">MKI67: {selectedPatient.transcriptomic?.mki67_expression}</div>
                  <div className="bg-white p-1.5 rounded border border-slate-200">PIK3CA mut: {selectedPatient.genomic?.pik3ca_mutation}</div>
                  <div className="bg-white p-1.5 rounded border border-slate-200">TP53 mut: {selectedPatient.genomic?.tp53_mutation}</div>
                  <div className="bg-white p-1.5 rounded border border-slate-200">BRCA1 mut: {selectedPatient.genomic?.brca1_mutation}</div>
                  <div className="bg-white p-1.5 rounded border border-slate-200">ESR1 mut: {selectedPatient.genomic?.esr1_mutation}</div>
                </div>
              </div>
            </div>

            {/* Prediction Output & Probabilities */}
            {predictionResult ? (
              <div className="bg-teal-50/60 rounded-2xl p-5 border border-teal-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                    Predicted Outcome Label
                  </span>
                  <span className="text-xs font-mono font-bold bg-teal-600 text-white px-2.5 py-0.5 rounded-full">
                    Confidence: {(predictionResult.response_confidence * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="p-4 bg-white rounded-xl border border-teal-100 shadow-xs">
                  <p className="text-xl font-black text-slate-900 tracking-tight">
                    {predictionResult.predicted_response}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Random Forest ensemble probability vector across multi-class response categories.
                  </p>
                </div>

                {/* Probabilities Bars */}
                <div className="space-y-2 pt-1">
                  {Object.entries(predictionResult.response_probabilities || {}).map(([cls, prob]: any) => (
                    <div key={cls} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-700">{cls}</span>
                        <span className="font-mono font-bold text-slate-900">{(prob * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            cls === 'Likely responder'
                              ? 'bg-emerald-500'
                              : cls === 'Intermediate response'
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${prob * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      onSelectPatient(activePatientId);
                      onNavigate('strategy', activePatientId);
                    }}
                    className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center space-x-1"
                  >
                    <span>Proceed to Personalized Strategy &rarr;</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Confusion Matrix & Error Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix Visual Grid */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Hold-Out Test Set Confusion Matrix (n=50)
              </h3>
              <p className="text-xs text-slate-500">True Class (Rows) vs. Predicted Class (Columns)</p>
            </div>
            <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">
              3x3 Grid
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200">
                  <th className="p-3 text-left">True \ Pred</th>
                  {metrics.classes.map((c) => (
                    <th key={c} className="p-3 font-mono">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                {metrics.confusion_matrix.map((row, i) => (
                  <tr key={metrics.classes[i]}>
                    <td className="p-3 text-left font-bold text-slate-800 bg-slate-50/50">
                      {metrics.classes[i]}
                    </td>
                    {row.map((val, j) => {
                      const isDiagonal = i === j;
                      return (
                        <td
                          key={j}
                          className={`p-3 font-bold ${
                            isDiagonal
                              ? 'bg-emerald-50 text-emerald-800 text-sm'
                              : val > 0
                              ? 'bg-rose-50 text-rose-800'
                              : 'text-slate-300'
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

          <p className="text-[11px] text-slate-500 mt-3">
            Diagonal cells represent concordant classifications. Off-diagonal elements depict misclassifications across adjacent response categories.
          </p>
        </div>

        {/* Feature Weights & Methodology */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-2">
              Supervised Training Configuration &amp; Validation
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Calibrated hyperparameter configuration preventing data leakage across multi-omics modalities.
            </p>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500">Estimators / Trees:</span>
                <span className="font-mono font-bold">100 Trees</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500">Max Tree Depth:</span>
                <span className="font-mono font-bold">6 (Regularized against overfitting)</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500">Split Method:</span>
                <span className="font-mono font-bold">Gini Impurity with balanced class weights</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500">Holdout Partition:</span>
                <span className="font-mono font-bold">Stratified 80% Train (n=200), 20% Test (n=50)</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500">Data Normalization:</span>
                <span className="font-mono font-bold">StandardScaler fitted solely on train split</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center space-x-2 text-xs text-slate-500">
            <span>Strict data leakage guard: Scaling parameters were fitted exclusively on train partitions.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
