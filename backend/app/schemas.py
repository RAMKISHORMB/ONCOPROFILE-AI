from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class GenomicProfileSchema(BaseModel):
    brca1_mutation: int = Field(0, description="0=Wild-Type, 1=Pathogenic variant")
    brca2_mutation: int = Field(0, description="0=Wild-Type, 1=Pathogenic variant")
    pik3ca_mutation: int = Field(0, description="0=Wild-Type, 1=Pathogenic variant")
    tp53_mutation: int = Field(0, description="0=Wild-Type, 1=Pathogenic variant")
    esr1_mutation: int = Field(0, description="0=Wild-Type, 1=Pathogenic variant")
    her2_amplification: int = Field(0, description="0=Normal, 1=Amplified")

    class Config:
        from_attributes = True

class TranscriptomicProfileSchema(BaseModel):
    esr1_expression: float = Field(..., description="log2 normalized ESR1 expression")
    pgr_expression: float = Field(..., description="log2 normalized PGR expression")
    erbb2_expression: float = Field(..., description="log2 normalized ERBB2 expression")
    mki67_expression: float = Field(..., description="log2 normalized MKI67 expression")
    egfr_expression: float = Field(..., description="log2 normalized EGFR expression")
    brca1_expression: float = Field(..., description="log2 normalized BRCA1 expression")
    brca2_expression: float = Field(..., description="log2 normalized BRCA2 expression")
    pik3ca_expression: float = Field(..., description="log2 normalized PIK3CA expression")

    class Config:
        from_attributes = True

class PatientBase(BaseModel):
    patient_id: str
    age: int
    disease_stage: str
    molecular_subtype: str
    er_status: str
    pr_status: str
    her2_status: str
    ki67_percent: float

class PatientCreate(PatientBase):
    genomic: GenomicProfileSchema
    transcriptomic: TranscriptomicProfileSchema

class PatientDetail(PatientBase):
    id: int
    genomic: Optional[GenomicProfileSchema] = None
    transcriptomic: Optional[TranscriptomicProfileSchema] = None
    has_analysis: bool = False

    class Config:
        from_attributes = True

class AnalysisResultSchema(BaseModel):
    patient_id: str
    cluster_id: int
    cluster_name: str
    pca_x: float
    pca_y: float
    predicted_response: str
    response_confidence: float
    response_probabilities: Dict[str, float]
    analyzed_at: Optional[str] = None

class TreatmentPathway(BaseModel):
    category: str # e.g. "Endocrine Backbone", "Targeted Therapy", "Chemotherapy & Immunotherapy"
    recommendation: str
    evidence_level: str
    actionable_target: str
    rationale: str

class ScientificJustification(BaseModel):
    biomarker: str
    finding: str
    biochemical_pathway: str
    clinical_rationale: str

class StrategyReportSchema(BaseModel):
    patient_id: str
    molecular_summary: str
    identified_subtype: str
    important_mutations: List[str]
    significant_expressions: List[str]
    cluster_profile: Dict[str, Any]
    predicted_response: str
    response_confidence: float
    potential_pathways: List[TreatmentPathway]
    scientific_justifications: List[ScientificJustification]
    limitations: List[str]
    clinician_disclaimer: str

class FullPatientAnalysisResponse(BaseModel):
    patient: PatientDetail
    analysis: AnalysisResultSchema
    strategy: StrategyReportSchema
    processing_stages: List[Dict[str, Any]]

class DashboardStats(BaseModel):
    total_patients: int
    subtype_distribution: Dict[str, int]
    stage_distribution: Dict[str, int]
    mutation_frequencies: Dict[str, float]
    response_prediction_stats: Dict[str, int]
    recent_analyses: List[Dict[str, Any]]

class ClusterSummary(BaseModel):
    cluster_id: int
    cluster_name: str
    patient_count: int
    prevalent_subtype: str
    key_characteristics: List[str]
    mean_expressions: Dict[str, float]
    mutation_rates: Dict[str, float]

class ModelPerformanceMetrics(BaseModel):
    model_name: str
    accuracy: float
    precision_macro: float
    recall_macro: float
    f1_macro: float
    f1_weighted: float
    confusion_matrix: List[List[int]]
    classes: List[str]
    feature_importances: List[Dict[str, Any]]
    disclaimer: str

class DataQualityReport(BaseModel):
    total_records: int
    missing_values: Dict[str, int]
    duplicates_detected: int
    valid_records: int
    numerical_ranges: Dict[str, Dict[str, float]]
    data_integrity_score: float
