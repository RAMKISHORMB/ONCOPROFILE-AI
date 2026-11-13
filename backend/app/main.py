import os
import json
import pandas as pd
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import engine, Base, get_db
from .models import Patient, GenomicProfile, TranscriptomicProfile, AnalysisResult, StrategyReport
from .schemas import DashboardStats
from .ml_pipeline import pipeline
from .routers import patients, omics, analysis, classification, prediction, strategy, reports
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ONCOPROFILE AI API",
    description="Multi-Omics Based Personalized Breast Cancer Treatment Strategy Platform",
    version="1.0.0"
)

# Enable CORS for frontend development and local hosting
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(patients.router)
app.include_router(omics.router)
app.include_router(analysis.router)
app.include_router(classification.router)
app.include_router(prediction.router)
app.include_router(strategy.router)
app.include_router(reports.router)

@app.on_event("startup")
def startup_event():
    # Load synthetic dataset and fit ML models if dataset exists
    data_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "synthetic_breast_cancer_omics.csv")
    if os.path.exists(data_path):
        df = pd.read_csv(data_path)
        pipeline.fit(df)
        print(f"[ONCOPROFILE AI] ML Pipeline fitted successfully on {len(df)} synthetic records.")

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "ONCOPROFILE AI Precision Oncology Engine",
        "version": "1.0.0",
        "dataset_loaded": pipeline.is_fitted,
        "platform_status": "Active Operational"
    }

@app.get("/api/dashboard", response_model=DashboardStats)
def get_dashboard_data(db: Session = Depends(get_db)):
    patients_list = db.query(Patient).all()
    total_patients = len(patients_list)

    subtype_counts = {}
    stage_counts = {}
    
    # Genomic counts
    brca1_cnt = 0
    brca2_cnt = 0
    pik3ca_cnt = 0
    tp53_cnt = 0
    esr1_cnt = 0
    her2_amp_cnt = 0

    response_counts = {
        "Likely responder": 0,
        "Intermediate response": 0,
        "Lower predicted response": 0,
        "Pending analysis": 0
    }

    for p in patients_list:
        subtype_counts[p.molecular_subtype] = subtype_counts.get(p.molecular_subtype, 0) + 1
        stage_counts[p.disease_stage] = stage_counts.get(p.disease_stage, 0) + 1
        
        gen = p.genomic_profile
        if gen:
            if gen.brca1_mutation == 1: brca1_cnt += 1
            if gen.brca2_mutation == 1: brca2_cnt += 1
            if gen.pik3ca_mutation == 1: pik3ca_cnt += 1
            if gen.tp53_mutation == 1: tp53_cnt += 1
            if gen.esr1_mutation == 1: esr1_cnt += 1
            if gen.her2_amplification == 1: her2_amp_cnt += 1

        an = p.analysis_result
        if an and an.predicted_response:
            response_counts[an.predicted_response] = response_counts.get(an.predicted_response, 0) + 1
        else:
            response_counts["Pending analysis"] += 1

    denom = max(1, total_patients)
    mut_freqs = {
        "BRCA1": round(brca1_cnt / denom * 100, 1),
        "BRCA2": round(brca2_cnt / denom * 100, 1),
        "PIK3CA": round(pik3ca_cnt / denom * 100, 1),
        "TP53": round(tp53_cnt / denom * 100, 1),
        "ESR1": round(esr1_cnt / denom * 100, 1),
        "HER2 (ERBB2) Amp": round(her2_amp_cnt / denom * 100, 1),
    }

    recent_an = db.query(AnalysisResult).order_by(AnalysisResult.id.desc()).limit(8).all()
    recent_list = []
    for ra in recent_an:
        pt = db.query(Patient).filter(Patient.patient_id == ra.patient_id).first()
        recent_list.append({
            "patient_id": ra.patient_id,
            "subtype": pt.molecular_subtype if pt else "Unknown",
            "stage": pt.disease_stage if pt else "Unknown",
            "cluster_name": ra.cluster_name,
            "predicted_response": ra.predicted_response,
            "confidence": round(ra.response_confidence * 100, 1),
            "analyzed_at": str(ra.analyzed_at)[:19] if ra.analyzed_at else "Recently"
        })

    return DashboardStats(
        total_patients=total_patients,
        subtype_distribution=subtype_counts,
        stage_distribution=stage_counts,
        mutation_frequencies=mut_freqs,
        response_prediction_stats=response_counts,
        recent_analyses=recent_list
    )

# Static file serving for single-port deployment
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "frontend", "dist")
if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        if full_path.startswith("api"):
            return {"error": "API route not found"}
        target_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(target_path) and os.path.isfile(target_path):
            return FileResponse(target_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
