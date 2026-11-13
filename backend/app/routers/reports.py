import json
import io
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Patient, AnalysisResult, StrategyReport
from ..schemas import FullPatientAnalysisResponse, PatientDetail, AnalysisResultSchema, StrategyReportSchema
from ..strategy_engine import generate_personalized_strategy
from ..data_processor import DataProcessor
from ..ml_pipeline import pipeline

router = APIRouter(prefix="/api/reports", tags=["Research Reports"])

@router.get("/{patient_id}", response_model=FullPatientAnalysisResponse)
def get_patient_report(patient_id: str, db: Session = Depends(get_db)):
    p = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not p:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

    gen = p.genomic_profile
    tran = p.transcriptomic_profile
    an = p.analysis_result
    rep = p.strategy_report

    if not an or not rep:
        # If not analyzed yet, run analysis dynamically
        from .strategy import analyze_patient
        return analyze_patient(patient_id, db)

    patient_dict = {
        "patient_id": p.patient_id,
        "age": p.age,
        "disease_stage": p.disease_stage,
        "molecular_subtype": p.molecular_subtype,
        "er_status": p.er_status,
        "pr_status": p.pr_status,
        "her2_status": p.her2_status,
        "ki67_percent": p.ki67_percent,
        "brca1_mutation": gen.brca1_mutation if gen else 0,
        "brca2_mutation": gen.brca2_mutation if gen else 0,
        "pik3ca_mutation": gen.pik3ca_mutation if gen else 0,
        "tp53_mutation": gen.tp53_mutation if gen else 0,
        "esr1_mutation": gen.esr1_mutation if gen else 0,
        "her2_amplification": gen.her2_amplification if gen else 0,
        "esr1_expression": tran.esr1_expression if tran else 0.0,
        "pgr_expression": tran.pgr_expression if tran else 0.0,
        "erbb2_expression": tran.erbb2_expression if tran else 0.0,
        "mki67_expression": tran.mki67_expression if tran else 0.0,
        "egfr_expression": tran.egfr_expression if tran else 0.0,
        "brca1_expression": tran.brca1_expression if tran else 0.0,
        "brca2_expression": tran.brca2_expression if tran else 0.0,
        "pik3ca_expression": tran.pik3ca_expression if tran else 0.0,
    }

    stages = DataProcessor.get_pipeline_stages(patient_dict)
    
    probs = json.loads(an.response_probabilities) if isinstance(an.response_probabilities, str) else an.response_probabilities
    pathways = json.loads(rep.potential_pathways) if isinstance(rep.potential_pathways, str) else rep.potential_pathways
    justifications = json.loads(rep.scientific_justifications) if isinstance(rep.scientific_justifications, str) else rep.scientific_justifications
    limitations = json.loads(rep.limitations) if isinstance(rep.limitations, str) else rep.limitations

    # Compute significant findings
    cluster_info = {"cluster_id": an.cluster_id, "cluster_name": an.cluster_name, "pca_x": an.pca_x, "pca_y": an.pca_y}
    pred_info = {"predicted_response": an.predicted_response, "response_confidence": an.response_confidence}
    dyn_strategy = generate_personalized_strategy(patient_dict, cluster_info, pred_info)

    return FullPatientAnalysisResponse(
        patient=PatientDetail(
            id=p.id,
            patient_id=p.patient_id,
            age=p.age,
            disease_stage=p.disease_stage,
            molecular_subtype=p.molecular_subtype,
            er_status=p.er_status,
            pr_status=p.pr_status,
            her2_status=p.her2_status,
            ki67_percent=p.ki67_percent,
            genomic=gen,
            transcriptomic=tran,
            has_analysis=True
        ),
        analysis=AnalysisResultSchema(
            patient_id=an.patient_id,
            cluster_id=an.cluster_id,
            cluster_name=an.cluster_name,
            pca_x=an.pca_x,
            pca_y=an.pca_y,
            predicted_response=an.predicted_response,
            response_confidence=an.response_confidence,
            response_probabilities=probs,
            analyzed_at=str(an.analyzed_at)
        ),
        strategy=StrategyReportSchema(
            patient_id=p.patient_id,
            molecular_summary=rep.molecular_summary,
            identified_subtype=p.molecular_subtype,
            important_mutations=dyn_strategy["important_mutations"],
            significant_expressions=dyn_strategy["significant_expressions"],
            cluster_profile=cluster_info,
            predicted_response=an.predicted_response,
            response_confidence=an.response_confidence,
            potential_pathways=pathways,
            scientific_justifications=justifications,
            limitations=limitations,
            clinician_disclaimer=dyn_strategy["clinician_disclaimer"]
        ),
        processing_stages=stages
    )

@router.get("/export/csv")
def export_dataset_csv(db: Session = Depends(get_db)):
    patients = db.query(Patient).all()
    records = []
    for p in patients:
        gen = p.genomic_profile
        tran = p.transcriptomic_profile
        an = p.analysis_result
        records.append({
            "patient_id": p.patient_id,
            "age": p.age,
            "disease_stage": p.disease_stage,
            "molecular_subtype": p.molecular_subtype,
            "er_status": p.er_status,
            "pr_status": p.pr_status,
            "her2_status": p.her2_status,
            "ki67_percent": p.ki67_percent,
            "brca1_mutation": gen.brca1_mutation if gen else 0,
            "brca2_mutation": gen.brca2_mutation if gen else 0,
            "pik3ca_mutation": gen.pik3ca_mutation if gen else 0,
            "tp53_mutation": gen.tp53_mutation if gen else 0,
            "esr1_mutation": gen.esr1_mutation if gen else 0,
            "her2_amplification": gen.her2_amplification if gen else 0,
            "esr1_expression": tran.esr1_expression if tran else 0.0,
            "pgr_expression": tran.pgr_expression if tran else 0.0,
            "erbb2_expression": tran.erbb2_expression if tran else 0.0,
            "mki67_expression": tran.mki67_expression if tran else 0.0,
            "egfr_expression": tran.egfr_expression if tran else 0.0,
            "brca1_expression": tran.brca1_expression if tran else 0.0,
            "brca2_expression": tran.brca2_expression if tran else 0.0,
            "pik3ca_expression": tran.pik3ca_expression if tran else 0.0,
            "computational_cluster": an.cluster_name if an else "Unassigned",
            "predicted_response": an.predicted_response if an else "Unpredicted"
        })
    df = pd.DataFrame(records)
    csv_str = df.to_csv(index=False)
    return Response(
        content=csv_str,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=oncoprofile_full_cohort_analysis.csv"}
    )
