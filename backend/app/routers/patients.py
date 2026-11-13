import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Patient, GenomicProfile, TranscriptomicProfile, AnalysisResult, StrategyReport
from ..schemas import PatientCreate, PatientDetail, PatientBase

router = APIRouter(prefix="/api/patients", tags=["Patients"])

@router.get("", response_model=List[PatientDetail])
def list_patients(
    subtype: Optional[str] = Query(None),
    stage: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Patient)
    
    if subtype and subtype != "All":
        query = query.filter(Patient.molecular_subtype == subtype)
    if stage and stage != "All":
        query = query.filter(Patient.disease_stage == stage)
    if search:
        s = f"%{search.strip().upper()}%"
        query = query.filter(Patient.patient_id.ilike(s))

    patients = query.order_by(Patient.id.asc()).all()
    
    result = []
    for p in patients:
        has_an = db.query(AnalysisResult).filter(AnalysisResult.patient_id == p.patient_id).first() is not None
        result.append(PatientDetail(
            id=p.id,
            patient_id=p.patient_id,
            age=p.age,
            disease_stage=p.disease_stage,
            molecular_subtype=p.molecular_subtype,
            er_status=p.er_status,
            pr_status=p.pr_status,
            her2_status=p.her2_status,
            ki67_percent=p.ki67_percent,
            genomic=p.genomic_profile,
            transcriptomic=p.transcriptomic_profile,
            has_analysis=has_an
        ))
    return result

@router.get("/{patient_id}", response_model=PatientDetail)
def get_patient(patient_id: str, db: Session = Depends(get_db)):
    p = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not p:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")
        
    has_an = db.query(AnalysisResult).filter(AnalysisResult.patient_id == p.patient_id).first() is not None
    return PatientDetail(
        id=p.id,
        patient_id=p.patient_id,
        age=p.age,
        disease_stage=p.disease_stage,
        molecular_subtype=p.molecular_subtype,
        er_status=p.er_status,
        pr_status=p.pr_status,
        her2_status=p.her2_status,
        ki67_percent=p.ki67_percent,
        genomic=p.genomic_profile,
        transcriptomic=p.transcriptomic_profile,
        has_analysis=has_an
    )

@router.post("", response_model=PatientDetail)
def create_patient(payload: PatientCreate, db: Session = Depends(get_db)):
    existing = db.query(Patient).filter(Patient.patient_id == payload.patient_id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Patient ID {payload.patient_id} already exists")
        
    p = Patient(
        patient_id=payload.patient_id,
        age=payload.age,
        disease_stage=payload.disease_stage,
        molecular_subtype=payload.molecular_subtype,
        er_status=payload.er_status,
        pr_status=payload.pr_status,
        her2_status=payload.her2_status,
        ki67_percent=payload.ki67_percent
    )
    db.add(p)
    db.flush()
    
    gen = GenomicProfile(
        patient_id=payload.patient_id,
        **payload.genomic.dict()
    )
    db.add(gen)
    
    tran = TranscriptomicProfile(
        patient_id=payload.patient_id,
        **payload.transcriptomic.dict()
    )
    db.add(tran)
    
    db.commit()
    db.refresh(p)
    
    return PatientDetail(
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
        has_analysis=False
    )
