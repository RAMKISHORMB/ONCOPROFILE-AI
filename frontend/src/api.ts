import {
  Patient,
  FullPatientAnalysis,
  DashboardStats,
  ClusterResponse,
  ModelPerformance,
  MolecularAnalysisData,
  QualityReport
} from './types';

const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchDashboard(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE}/dashboard`);
  if (!res.ok) throw new Error('Failed to fetch dashboard data');
  return res.json();
}

export async function fetchPatients(params?: { subtype?: string; stage?: string; search?: string }): Promise<Patient[]> {
  const query = new URLSearchParams();
  if (params?.subtype && params.subtype !== 'All') query.append('subtype', params.subtype);
  if (params?.stage && params.stage !== 'All') query.append('stage', params.stage);
  if (params?.search) query.append('search', params.search);

  const res = await fetch(`${API_BASE}/patients?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch patients');
  return res.json();
}

export async function fetchPatient(patientId: string): Promise<Patient> {
  const res = await fetch(`${API_BASE}/patients/${patientId}`);
  if (!res.ok) throw new Error(`Failed to fetch patient ${patientId}`);
  return res.json();
}

export async function createPatient(payload: any): Promise<Patient> {
  const res = await fetch(`${API_BASE}/patients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to create patient');
  }
  return res.json();
}

export async function analyzePatient(patientId: string): Promise<FullPatientAnalysis> {
  const res = await fetch(`${API_BASE}/analyze/${patientId}`, {
    method: 'POST'
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || `Failed to analyze patient ${patientId}`);
  }
  return res.json();
}

export async function fetchPatientReport(patientId: string): Promise<FullPatientAnalysis> {
  const res = await fetch(`${API_BASE}/reports/${patientId}`);
  if (!res.ok) throw new Error(`Failed to fetch report for ${patientId}`);
  return res.json();
}

export async function fetchClusters(): Promise<ClusterResponse> {
  const res = await fetch(`${API_BASE}/clusters`);
  if (!res.ok) throw new Error('Failed to fetch cluster data');
  return res.json();
}

export async function fetchModelPerformance(): Promise<ModelPerformance> {
  const res = await fetch(`${API_BASE}/model/performance`);
  if (!res.ok) throw new Error('Failed to fetch model metrics');
  return res.json();
}

export async function fetchMolecularAnalysis(): Promise<MolecularAnalysisData> {
  const res = await fetch(`${API_BASE}/molecular/analysis`);
  if (!res.ok) throw new Error('Failed to fetch molecular analysis data');
  return res.json();
}

export async function fetchQualityReport(): Promise<QualityReport> {
  const res = await fetch(`${API_BASE}/omics/quality-report`);
  if (!res.ok) throw new Error('Failed to fetch data quality report');
  return res.json();
}

export async function uploadOmicsCSV(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/omics/upload`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'File upload failed');
  }
  return res.json();
}
