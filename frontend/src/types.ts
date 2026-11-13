export interface GenomicProfile {
  brca1_mutation: number;
  brca2_mutation: number;
  pik3ca_mutation: number;
  tp53_mutation: number;
  esr1_mutation: number;
  her2_amplification: number;
}

export interface TranscriptomicProfile {
  esr1_expression: number;
  pgr_expression: number;
  erbb2_expression: number;
  mki67_expression: number;
  egfr_expression: number;
  brca1_expression: number;
  brca2_expression: number;
  pik3ca_expression: number;
}

export interface Patient {
  id: number;
  patient_id: string;
  age: number;
  disease_stage: string;
  molecular_subtype: string;
  er_status: string;
  pr_status: string;
  her2_status: string;
  ki67_percent: number;
  genomic?: GenomicProfile;
  transcriptomic?: TranscriptomicProfile;
  has_analysis?: boolean;
}

export interface AnalysisResult {
  patient_id: string;
  cluster_id: number;
  cluster_name: string;
  pca_x: number;
  pca_y: number;
  predicted_response: string;
  response_confidence: number;
  response_probabilities: Record<string, number>;
  analyzed_at?: string;
}

export interface TreatmentPathway {
  category: string;
  recommendation: string;
  evidence_level: string;
  actionable_target: string;
  rationale: string;
}

export interface ScientificJustification {
  biomarker: string;
  finding: string;
  biochemical_pathway: string;
  clinical_rationale: string;
}

export interface StrategyReport {
  patient_id: string;
  molecular_summary: string;
  identified_subtype: string;
  important_mutations: string[];
  significant_expressions: string[];
  cluster_profile: {
    cluster_id: number;
    cluster_name: string;
    pca_x: number;
    pca_y: number;
  };
  predicted_response: string;
  response_confidence: number;
  potential_pathways: TreatmentPathway[];
  scientific_justifications: ScientificJustification[];
  limitations: string[];
  clinician_disclaimer: string;
}

export interface ProcessingStage {
  step: number;
  name: string;
  status: string;
  details: string;
}

export interface FullPatientAnalysis {
  patient: Patient;
  analysis: AnalysisResult;
  strategy: StrategyReport;
  processing_stages: ProcessingStage[];
}

export interface DashboardStats {
  total_patients: number;
  subtype_distribution: Record<string, number>;
  stage_distribution: Record<string, number>;
  mutation_frequencies: Record<string, number>;
  response_prediction_stats: Record<string, number>;
  recent_analyses: Array<{
    patient_id: string;
    subtype: string;
    stage: string;
    cluster_name: string;
    predicted_response: string;
    confidence: number;
    analyzed_at: string;
  }>;
}

export interface ClusterSummary {
  cluster_id: number;
  cluster_name: string;
  patient_count: number;
  prevalent_subtype: string;
  key_characteristics: string[];
  mean_expressions: Record<string, number>;
  mutation_rates: Record<string, number>;
}

export interface ScatterPoint {
  patient_id: string;
  x: number;
  y: number;
  cluster_id: number;
  cluster_name: string;
  subtype: string;
  stage: string;
  predicted_response: string;
  ki67: number;
}

export interface ClusterResponse {
  clusters: ClusterSummary[];
  pca_variance_ratio: number[];
  scatter_points: ScatterPoint[];
  methodology_note: string;
}

export interface ModelPerformance {
  model_name: string;
  accuracy: number;
  precision_macro: number;
  recall_macro: number;
  f1_macro: number;
  f1_weighted: number;
  confusion_matrix: number[][];
  classes: string[];
  feature_importances: Array<{
    feature: string;
    importance: number;
    percentage: number;
  }>;
  disclaimer: string;
}

export interface MolecularAnalysisData {
  expression_by_subtype: Array<Record<string, any>>;
  mutation_frequencies: Array<Record<string, any>>;
  correlation_matrix: Array<Record<string, any>>;
  feature_importances: Array<{ feature: string; importance: number; percentage: number }>;
  biological_summary: string[];
}

export interface QualityReport {
  total_records: number;
  missing_values: Record<string, number>;
  total_missing_cells: number;
  duplicates_detected: number;
  valid_records: number;
  numerical_ranges: Record<string, { min: number; max: number; mean: number; std: number }>;
  data_integrity_score: number;
}
