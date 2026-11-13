import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Patient, AnalysisResult, StrategyReport
from ..schemas import FullPatientAnalysisResponse, PatientDetail, AnalysisResultSchema, StrategyReportSchema
from ..ml_pipeline import pipeline
from ..strategy_engine import generate_personalized_strategy
from ..data_processor import DataProcessor

router = APIRouter(prefix="/api/analyze", tags=["Patient Analysis Workflow"])

@router.post("/{patient_id}", response_model=FullPatientAnalysisResponse)
def analyze_patient(patient_id: str, db: Session = Depends(get_db)):
    p = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not p:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

    gen = p.genomic_profile
    tran = p.transcriptomic_profile
    if not gen or not tran:
        raise HTTPException(status_code=400, detail="Incomplete genomic or transcriptomic data for patient")

    patient_dict = {
        "patient_id": p.patient_id,
        "age": p.age,
        "disease_stage": p.disease_stage,
        "molecular_subtype": p.molecular_subtype,
        "er_status": p.er_status,
        "pr_status": p.pr_status,
        "her2_status": p.her2_status,
        "ki67_percent": p.ki67_percent,
        "brca1_mutation": gen.brca1_mutation,
        "brca2_mutation": gen.brca2_mutation,
        "pik3ca_mutation": gen.pik3ca_mutation,
        "tp53_mutation": gen.tp53_mutation,
        "esr1_mutation": gen.esr1_mutation,
        "her2_amplification": gen.her2_amplification,
        "esr1_expression": tran.esr1_expression,
        "pgr_expression": tran.pgr_expression,
        "erbb2_expression": tran.erbb2_expression,
        "mki67_expression": tran.mki67_expression,
        "egfr_expression": tran.egfr_expression,
        "brca1_expression": tran.brca1_expression,
        "brca2_expression": tran.brca2_expression,
        "pik3ca_expression": tran.pik3ca_expression,
    }

    # Step 1-4: Processing stages
    stages = DataProcessor.get_pipeline_stages(patient_dict)

    # Step 5: Assign computational cluster
    cluster_info = pipeline.assign_cluster(patient_dict)

    # Step 6: Predict illustrative treatment response
    prediction_info = pipeline.predict_response(patient_dict)

    # Step 7: Generate personalized strategy
    strategy_info = generate_personalized_strategy(patient_dict, cluster_info, prediction_info)

    # Save / Update in Database
    existing_analysis = db.query(AnalysisResult).filter(AnalysisResult.patient_id == patient_id).first()
    if existing_analysis:
        existing_analysis.cluster_id = cluster_info["cluster_id"]
        existing_analysis.cluster_name = cluster_info["cluster_name"]
        existing_analysis.pca_x = cluster_info["pca_x"]
        existing_analysis.pca_y = cluster_info["pca_y"]
        existing_analysis.predicted_response = prediction_info["predicted_response"]
        existing_analysis.response_confidence = prediction_info["response_confidence"]
        existing_analysis.response_probabilities = json.dumps(prediction_info["response_probabilities"])
        an_record = existing_analysis
    else:
        an_record = AnalysisResult(
            patient_id=patient_id,
            cluster_id=cluster_info["cluster_id"],
            cluster_name=cluster_info["cluster_name"],
            pca_x=cluster_info["pca_x"],
            pca_y=cluster_info["pca_y"],
            predicted_response=prediction_info["predicted_response"],
            response_confidence=prediction_info["response_confidence"],
            response_probabilities=json.dumps(prediction_info["response_probabilities"])
        )
        db.add(an_record)

    existing_report = db.query(StrategyReport).filter(StrategyReport.patient_id == patient_id).first()
    if existing_report:
        existing_report.molecular_summary = strategy_info["molecular_summary"]
        existing_report.potential_pathways = json.dumps(strategy_info["potential_pathways"])
        existing_report.scientific_justifications = json.dumps(strategy_info["scientific_justifications"])
        existing_report.limitations = json.dumps(strategy_info["limitations"])
    else:
        rep_record = StrategyReport(
            patient_id=patient_id,
            molecular_summary=strategy_info["molecular_summary"],
            potential_pathways=json.dumps(strategy_info["potential_pathways"]),
            scientific_justifications=json.dumps(strategy_info["scientific_justifications"]),
            limitations=json.dumps(strategy_info["limitations"])
        )
        db.add(rep_record)

    db.commit()

    patient_detail = PatientDetail(
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
    )

    analysis_schema = AnalysisResultSchema(
        patient_id=patient_id,
        cluster_id=cluster_info["cluster_id"],
        cluster_name=cluster_info["cluster_name"],
        pca_x=cluster_info["pca_x"],
        pca_y=cluster_info["pca_y"],
        predicted_response=prediction_info["predicted_response"],
        response_confidence=prediction_info["response_confidence"],
        response_probabilities=prediction_info["response_probabilities"],
        analyzed_at=str(an_record.analyzed_at) if hasattr(an_record, "analyzed_at") else None
    )

    strategy_schema = StrategyReportSchema(
        patient_id=patient_id,
        molecular_summary=strategy_info["molecular_summary"],
        identified_subtype=strategy_info["identified_subtype"],
        important_mutations=strategy_info["important_mutations"],
        significant_expressions=strategy_info["significant_expressions"],
        cluster_profile=strategy_info["cluster_profile"],
        predicted_response=strategy_info["predicted_response"],
        response_confidence=strategy_info["response_confidence"],
        potential_pathways=strategy_info["potential_pathways"],
        scientific_justifications=strategy_info["scientific_justifications"],
        limitations=strategy_info["limitations"],
        clinician_disclaimer=strategy_info["clinician_disclaimer"]
    )

    return FullPatientAnalysisResponse(
        patient=patient_detail,
        analysis=analysis_schema,
        strategy=strategy_schema,
        processing_stages=stages
    )
