from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Patient
from ..ml_pipeline import pipeline

router = APIRouter(prefix="/api/model", tags=["Treatment Prediction & Performance"])

@router.get("/performance")
def get_model_performance():
    if not pipeline.is_fitted:
        raise HTTPException(status_code=500, detail="ML Pipeline is not fitted yet.")
    return pipeline.metrics_

@router.post("/predict/{patient_id}")
def predict_patient_response(patient_id: str, db: Session = Depends(get_db)):
    p = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not p:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

    gen = p.genomic_profile
    tran = p.transcriptomic_profile
    if not gen or not tran:
        raise HTTPException(status_code=400, detail="Patient omics data incomplete")

    pt_dict = {
        "age": p.age,
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

    pred_res = pipeline.predict_response(pt_dict)
    return {
        "patient_id": patient_id,
        "molecular_subtype": p.molecular_subtype,
        "disease_stage": p.disease_stage,
        **pred_res
    }
