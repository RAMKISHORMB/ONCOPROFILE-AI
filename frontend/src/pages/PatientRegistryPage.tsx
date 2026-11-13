import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Dna,
  X,
  AlertCircle
} from 'lucide-react';
import { fetchPatients, createPatient } from '../api';
import { Patient } from '../types';

interface PatientRegistryProps {
  onNavigate: (tab: string, patientId?: string) => void;
  onSelectPatient: (patientId: string) => void;
}

const SUBTYPE_OPTIONS = ['All', 'Luminal A', 'Luminal B', 'HER2-enriched', 'Triple-Negative (TNBC)'];
const STAGE_OPTIONS = ['All', 'Stage I', 'Stage IIA', 'Stage IIB', 'Stage IIIA', 'Stage IIIB', 'Stage IV'];

export const PatientRegistryPage: React.FC<PatientRegistryProps> = ({
  onNavigate,
  onSelectPatient
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subtype, setSubtype] = useState('All');
  const [stage, setStage] = useState('All');
  
  // Modal state for adding a patient profile
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPatient, setNewPatient] = useState({
    patient_id: `ONC-${Math.floor(251 + Math.random() * 50)}`,
    age: 52,
    disease_stage: 'Stage IIA',
    molecular_subtype: 'Luminal A',
    er_status: 'Positive',
    pr_status: 'Positive',
    her2_status: 'Negative',
    ki67_percent: 14.0,
    genomic: {
      brca1_mutation: 0,
      brca2_mutation: 0,
      pik3ca_mutation: 1,
      tp53_mutation: 0,
      esr1_mutation: 0,
      her2_amplification: 0
    },
    transcriptomic: {
      esr1_expression: 12.1,
      pgr_expression: 10.4,
      erbb2_expression: 6.2,
      mki67_expression: 5.3,
      egfr_expression: 4.9,
      brca1_expression: 7.7,
      brca2_expression: 7.0,
      pik3ca_expression: 8.5
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    fetchPatients({ subtype, stage, search })
      .then((data) => {
        setPatients(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [subtype, stage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setCreateError(null);
    try {
      const created = await createPatient(newPatient);
      setShowAddModal(false);
      onSelectPatient(created.patient_id);
      loadData();
      onNavigate('strategy', created.patient_id);
    } catch (err: any) {
      setCreateError(err.message || 'Failed to register patient');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Patient Multi-Omics Registry</h1>
          <p className="text-xs text-slate-500">
            Query, inspect, and register breast cancer patient molecular profiles.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Patient Profile</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Patient ID (e.g., ONC-001)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-900"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600">Subtype:</span>
            <select
              value={subtype}
              onChange={(e) => setSubtype(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {SUBTYPE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-600">Stage:</span>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {STAGE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] bg-slate-50">
                <th className="py-3 px-4 font-bold">Patient ID</th>
                <th className="py-3 px-4 font-bold">Age</th>
                <th className="py-3 px-4 font-bold">Stage</th>
                <th className="py-3 px-4 font-bold">Molecular Subtype</th>
                <th className="py-3 px-4 font-bold">IHC Profile (ER/PR/HER2)</th>
                <th className="py-3 px-4 font-bold">Ki-67 %</th>
                <th className="py-3 px-4 font-bold">Key Mutations</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading cohort profiles...
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No patients match your query criteria.
                  </td>
                </tr>
              ) : (
                patients.map((p) => {
                  const gen = p.genomic;
                  const muts: string[] = [];
                  if (gen?.brca1_mutation) muts.push('BRCA1');
                  if (gen?.brca2_mutation) muts.push('BRCA2');
                  if (gen?.pik3ca_mutation) muts.push('PIK3CA');
                  if (gen?.tp53_mutation) muts.push('TP53');
                  if (gen?.esr1_mutation) muts.push('ESR1');
                  if (gen?.her2_amplification) muts.push('HER2-amp');

                  return (
                    <tr key={p.patient_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {p.patient_id}
                        {p.patient_id === 'ONC-001' && (
                          <span className="ml-1.5 text-[9px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.5 rounded">
                            Reference Case
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{p.age} y</td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{p.disease_stage}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                          {p.molecular_subtype}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700">
                        ER {p.er_status[0]} | PR {p.pr_status[0]} | HER2 {p.her2_status[0]}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                        {p.ki67_percent}%
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {muts.length > 0 ? (
                            muts.map((m) => (
                              <span
                                key={m}
                                className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200"
                              >
                                {m}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">None detected</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => {
                            onSelectPatient(p.patient_id);
                            onNavigate('strategy', p.patient_id);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition"
                        >
                          Analyse
                        </button>
                        <button
                          onClick={() => {
                            onSelectPatient(p.patient_id);
                            onNavigate('reports', p.patient_id);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                        >
                          Report
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
          <span>Showing {patients.length} loaded records</span>
          <span className="text-[11px] text-slate-400">Multi-Omics Patient Cohort</span>
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
                  <Dna className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Add New Patient Molecular Profile</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreatePatient} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Patient ID</label>
                  <input
                    type="text"
                    required
                    value={newPatient.patient_id}
                    onChange={(e) => setNewPatient({ ...newPatient, patient_id: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Age</label>
                  <input
                    type="number"
                    required
                    min={25}
                    max={90}
                    value={newPatient.age}
                    onChange={(e) => setNewPatient({ ...newPatient, age: parseInt(e.target.value) || 50 })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Disease Stage</label>
                  <select
                    value={newPatient.disease_stage}
                    onChange={(e) => setNewPatient({ ...newPatient, disease_stage: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    {STAGE_OPTIONS.filter((s) => s !== 'All').map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Subtype</label>
                  <select
                    value={newPatient.molecular_subtype}
                    onChange={(e) => setNewPatient({ ...newPatient, molecular_subtype: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    {SUBTYPE_OPTIONS.filter((s) => s !== 'All').map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Biomarkers */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">ER Status</label>
                  <select
                    value={newPatient.er_status}
                    onChange={(e) => setNewPatient({ ...newPatient, er_status: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                  >
                    <option value="Positive">Positive</option>
                    <option value="Negative">Negative</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">PR Status</label>
                  <select
                    value={newPatient.pr_status}
                    onChange={(e) => setNewPatient({ ...newPatient, pr_status: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                  >
                    <option value="Positive">Positive</option>
                    <option value="Negative">Negative</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">HER2 Status</label>
                  <select
                    value={newPatient.her2_status}
                    onChange={(e) => setNewPatient({ ...newPatient, her2_status: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                  >
                    <option value="Negative">Negative</option>
                    <option value="Positive">Positive</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Ki-67 Index (%)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={newPatient.ki67_percent}
                    onChange={(e) => setNewPatient({ ...newPatient, ki67_percent: parseFloat(e.target.value) || 10 })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* Somatic Mutations */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-700 mb-2">Screened Genomic Driver Variants (1 = Mutated, 0 = Wild-type):</p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {Object.keys(newPatient.genomic).map((k) => (
                    <label key={k} className="flex items-center space-x-1.5 cursor-pointer bg-white p-2 rounded-lg border border-slate-200">
                      <input
                        type="checkbox"
                        checked={(newPatient.genomic as any)[k] === 1}
                        onChange={(e) =>
                          setNewPatient({
                            ...newPatient,
                            genomic: {
                              ...newPatient.genomic,
                              [k]: e.target.checked ? 1 : 0
                            }
                          })
                        }
                        className="rounded text-teal-600 focus:ring-teal-500"
                      />
                      <span className="font-mono text-[10px] font-bold text-slate-700 truncate">
                        {k.replace('_mutation', '').replace('_amplification', '')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Transcriptomics */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-700 mb-2">Transcriptomic Expressions (log2 TPM normalized):</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.keys(newPatient.transcriptomic).map((k) => (
                    <div key={k}>
                      <span className="text-[10px] font-mono text-slate-500 block">{k.replace('_expression', '').toUpperCase()}</span>
                      <input
                        type="number"
                        step="0.1"
                        value={(newPatient.transcriptomic as any)[k]}
                        onChange={(e) =>
                          setNewPatient({
                            ...newPatient,
                            transcriptomic: {
                              ...newPatient.transcriptomic,
                              [k]: parseFloat(e.target.value) || 0
                            }
                          })
                        }
                        className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs font-mono"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs transition"
                >
                  {isSubmitting ? 'Registering...' : 'Save & Analyze Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
