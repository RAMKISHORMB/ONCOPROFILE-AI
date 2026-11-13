import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  Download,
  ShieldCheck
} from 'lucide-react';
import { uploadOmicsCSV, fetchQualityReport } from '../api';
import { QualityReport } from '../types';

interface OmicsUploadPageProps {
  onNavigate: (tab: string) => void;
}

export const OmicsUploadPage: React.FC<OmicsUploadPageProps> = ({ onNavigate }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qualityReport, setQualityReport] = useState<QualityReport | null>(null);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);

  useEffect(() => {
    fetchQualityReport()
      .then((rep) => setQualityReport(rep))
      .catch((err) => console.warn(err));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setError(null);
      setResult(null);

      // Parse preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter((l) => l.trim().length > 0).slice(0, 6);
        const rows = lines.map((l) => l.split(',').map((c) => c.trim()));
        setPreviewRows(rows);
      };
      reader.readAsText(selected);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const res = await uploadOmicsCSV(file);
      setResult(res);
      setQualityReport(res.quality_report);
      setUploading(false);
    } catch (err: any) {
      setError(err.message || 'Error processing uploaded file');
      setUploading(false);
    }
  };

  const handleDownloadSample = () => {
    window.open('/api/export/csv', '_blank');
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Omics Data Ingestion &amp; Quality Control</h1>
          <p className="text-xs text-slate-500">
            Batch upload patient cohorts in standard multi-omics CSV format with automated schema validation.
          </p>
        </div>
        <button
          onClick={handleDownloadSample}
          className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-2"
        >
          <Download className="w-4 h-4 text-teal-600" />
          <span>Export Current Cohort CSV</span>
        </button>
      </div>

      {/* Upload Zone & Ingestion Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Upload Patient Omics Matrix (.csv)</h3>
          
          <label className="border-2 border-dashed border-slate-200 hover:border-teal-500 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-teal-50/20 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 group-hover:bg-teal-100 flex items-center justify-center text-teal-600 mb-3 transition">
              <UploadCloud className="w-6 h-6 stroke-[2.2]" />
            </div>
            <p className="text-xs font-bold text-slate-800 mb-1">
              {file ? file.name : 'Click to browse or drag and drop cohort CSV file'}
            </p>
            <p className="text-[11px] text-slate-400">
              Supports 22 columns (Clinical IHC, 6-gene somatic mutations, 8-gene transcriptomic expressions)
            </p>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {file && (
            <div className="flex items-center justify-between p-3 bg-teal-50/70 border border-teal-200 rounded-xl">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-4 h-4 text-teal-700" />
                <span className="text-xs font-bold text-teal-950">{file.name}</span>
                <span className="text-[10px] text-teal-700 font-mono">({Math.round(file.size / 1024)} KB)</span>
              </div>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow-xs transition"
              >
                {uploading ? 'Processing Data Pipeline...' : 'Run Pipeline & Ingest'}
              </button>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-bold">{result.message}</span>
              </div>
              <div className="flex items-center space-x-4 text-[11px] text-emerald-800 pt-1">
                <span>Imported: <strong>{result.imported_records}</strong></span>
                <span>Updated: <strong>{result.updated_records}</strong></span>
                <span>Integrity Score: <strong>{result.quality_report?.data_integrity_score}%</strong></span>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('registry')}
                  className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg transition"
                >
                  View in Patient Registry &rarr;
                </button>
              </div>
            </div>
          )}

          {/* CSV Preview snippet */}
          {previewRows.length > 0 && (
            <div className="pt-2">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">CSV Structure Preview (Top 5 rows)</p>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-[10px] font-mono text-left">
                  <tbody>
                    {previewRows.map((row, idx) => (
                      <tr key={idx} className={idx === 0 ? 'bg-slate-100 font-bold text-slate-700' : 'hover:bg-slate-50'}>
                        {row.slice(0, 8).map((cell, cIdx) => (
                          <td key={cIdx} className="p-2 border-r border-slate-200 truncate max-w-[120px]">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Quality Audit Report Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Data Quality Assurance Report</span>
            </h3>
            <span className="text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full">
              Automated Audit
            </span>
          </div>

          {qualityReport ? (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-500">Cohort Integrity Score</p>
                  <p className="text-2xl font-black text-teal-900">{qualityReport.data_integrity_score} / 100</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">
                  PASS
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Total Valid Records:</span>
                  <span className="font-mono font-bold text-slate-800">{qualityReport.valid_records}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Missing Values Found:</span>
                  <span className="font-mono font-bold text-emerald-600">{qualityReport.total_missing_cells || 0}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Duplicates Detected:</span>
                  <span className="font-mono font-bold text-slate-800">{qualityReport.duplicates_detected || 0}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Normalization Scale:</span>
                  <span className="font-mono font-bold text-slate-800">log2(TPM + 1)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Feature Standardization:</span>
                  <span className="font-mono font-bold text-slate-800">Z-score (Mean=0, Std=1)</span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                <strong className="text-slate-700">Imputation Rule:</strong> Missing numerical values undergo median imputation based on molecular subtype. Categorical values default to mode. Duplicate Patient IDs are resolved by retaining primary baseline assays.
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No dataset currently loaded for audit.</p>
          )}
        </div>
      </div>
    </div>
  );
};
