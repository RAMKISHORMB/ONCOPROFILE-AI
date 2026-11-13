"""
ONCOPROFILE AI - Database Seeding Script
Populates SQLite database with 250 synthetic patient records from synthetic_breast_cancer_omics.csv,
fits the ML pipeline, and pre-analyzes patients across diverse molecular subtypes.
"""

import os
import sys
import json
import pandas as pd

# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(backend_dir)

from app.database import engine, Base, SessionLocal
from app.models import Patient, GenomicProfile, TranscriptomicProfile, AnalysisResult, StrategyReport
from app.ml_pipeline import pipeline
from app.strategy_engine import generate_personalized_strategy
from app.synthetic_data import generate_synthetic_dataset

def seed_database():
    print("[1/5] Initializing SQLite database schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    csv_path = os.path.join(backend_dir, "data", "synthetic_breast_cancer_omics.csv")
    if not os.path.exists(csv_path):
        print("[1/5] CSV not found, generating 250 synthetic records...")
        df = generate_synthetic_dataset(250, csv_path)
    else:
        df = pd.read_csv(csv_path)

    print(f"[2/5] Training ML pipeline on {len(df)} synthetic records...")
    df_clustered = pipeline.fit(df)

    print("[3/5] Seeding Patient, Genomic, and Transcriptomic records...")
    # Clear existing data to allow clean re-seeding
    db.query(StrategyReport).delete()
    db.query(AnalysisResult).delete()
    db.query(TranscriptomicProfile).delete()
    db.query(GenomicProfile).delete()
    db.query(Patient).delete()
    db.commit()

    for _, row in df.iterrows():
        p_id = str(row["patient_id"])
        p = Patient(
            patient_id=p_id,
            age=int(row["age"]),
            disease_stage=str(row["disease_stage"]),
            molecular_subtype=str(row["molecular_subtype"]),
            er_status=str(row["er_status"]),
            pr_status=str(row["pr_status"]),
            her2_status=str(row["her2_status"]),
            ki67_percent=float(row["ki67_percent"])
        )
        db.add(p)
        db.flush()

        gen = GenomicProfile(
            patient_id=p_id,
            brca1_mutation=int(row["brca1_mutation"]),
            brca2_mutation=int(row["brca2_mutation"]),
            pik3ca_mutation=int(row["pik3ca_mutation"]),
            tp53_mutation=int(row["tp53_mutation"]),
            esr1_mutation=int(row["esr1_mutation"]),
            her2_amplification=int(row["her2_amplification"])
        )
        db.add(gen)

        tran = TranscriptomicProfile(
            patient_id=p_id,
            esr1_expression=float(row["esr1_expression"]),
            pgr_expression=float(row["pgr_expression"]),
            erbb2_expression=float(row["erbb2_expression"]),
            mki67_expression=float(row["mki67_expression"]),
            egfr_expression=float(row["egfr_expression"]),
            brca1_expression=float(row["brca1_expression"]),
            brca2_expression=float(row["brca2_expression"]),
            pik3ca_expression=float(row["pik3ca_expression"])
        )
        db.add(tran)

    db.commit()
    print(f"      Successfully inserted {len(df)} patients.")

    print("[4/5] Pre-computing analyses for benchmark cohort patients...")
    # We pre-compute the analysis for all 250 patients so dashboard, PCA scatter, and reports are fully populated!
    for _, row in df.iterrows():
        p_id = str(row["patient_id"])
        pt_dict = row.to_dict()
        
        c_info = pipeline.assign_cluster(pt_dict)
        pred_info = pipeline.predict_response(pt_dict)
        strat_info = generate_personalized_strategy(pt_dict, c_info, pred_info)

        an = AnalysisResult(
            patient_id=p_id,
            cluster_id=c_info["cluster_id"],
            cluster_name=c_info["cluster_name"],
            pca_x=c_info["pca_x"],
            pca_y=c_info["pca_y"],
            predicted_response=pred_info["predicted_response"],
            response_confidence=pred_info["response_confidence"],
            response_probabilities=json.dumps(pred_info["response_probabilities"])
        )
        db.add(an)

        rep = StrategyReport(
            patient_id=p_id,
            molecular_summary=strat_info["molecular_summary"],
            potential_pathways=json.dumps(strat_info["potential_pathways"]),
            scientific_justifications=json.dumps(strat_info["scientific_justifications"]),
            limitations=json.dumps(strat_info["limitations"])
        )
        db.add(rep)

    db.commit()
    print(f"      Pre-computed 250 patient multi-omics analyses and personalized strategies.")

    # Validate ONC-001 specifically
    onc001 = db.query(Patient).filter(Patient.patient_id == "ONC-001").first()
    if onc001:
        print(f"[5/5] Verification of ONC-001:")
        print(f"      Subtype: {onc001.molecular_subtype}, Age: {onc001.age}, Stage: {onc001.disease_stage}")
        print(f"      ER: {onc001.er_status}, PR: {onc001.pr_status}, HER2: {onc001.her2_status}, Ki-67: {onc001.ki67_percent}%")
        print(f"      PIK3CA mut: {onc001.genomic_profile.pik3ca_mutation}, ESR1 expr: {onc001.transcriptomic_profile.esr1_expression}")
        print(f"      Predicted Response: {onc001.analysis_result.predicted_response} ({onc001.analysis_result.response_confidence*100:.1f}%)")
        print(f"      Cluster: {onc001.analysis_result.cluster_name}")

    db.close()
    print("\n[SUCCESS] ONCOPROFILE AI SQLite database seeding complete!")

if __name__ == "__main__":
    seed_database()
