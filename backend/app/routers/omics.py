import io
import pandas as pd
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Patient, GenomicProfile, TranscriptomicProfile
from ..data_processor import DataProcessor, REQUIRED_COLUMNS

router = APIRouter(prefix="/api/omics", tags=["Omics Data"])

@router.post("/upload")
async def upload_omics_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith((".csv", ".txt")):
        raise HTTPException(status_code=400, detail="Only CSV files (.csv) are supported")
        
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing CSV file: {str(e)}")

    try:
        cleaned_df, quality_report = DataProcessor.audit_and_clean_dataframe(df)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    imported_count = 0
    updated_count = 0

    for _, row in cleaned_df.iterrows():
        p_id = str(row["patient_id"])
        existing_p = db.query(Patient).filter(Patient.patient_id == p_id).first()
        
        if existing_p:
            existing_p.age = int(row["age"])
            existing_p.disease_stage = str(row["disease_stage"])
            existing_p.molecular_subtype = str(row["molecular_subtype"])
            existing_p.er_status = str(row["er_status"])
            existing_p.pr_status = str(row["pr_status"])
            existing_p.her2_status = str(row["her2_status"])
            existing_p.ki67_percent = float(row["ki67_percent"])
            
            # update genomic
            if existing_p.genomic_profile:
                existing_p.genomic_profile.brca1_mutation = int(row["brca1_mutation"])
                existing_p.genomic_profile.brca2_mutation = int(row["brca2_mutation"])
                existing_p.genomic_profile.pik3ca_mutation = int(row["pik3ca_mutation"])
                existing_p.genomic_profile.tp53_mutation = int(row["tp53_mutation"])
                existing_p.genomic_profile.esr1_mutation = int(row["esr1_mutation"])
                existing_p.genomic_profile.her2_amplification = int(row["her2_amplification"])
            
            # update transcriptomic
            if existing_p.transcriptomic_profile:
                existing_p.transcriptomic_profile.esr1_expression = float(row["esr1_expression"])
                existing_p.transcriptomic_profile.pgr_expression = float(row["pgr_expression"])
                existing_p.transcriptomic_profile.erbb2_expression = float(row["erbb2_expression"])
                existing_p.transcriptomic_profile.mki67_expression = float(row["mki67_expression"])
                existing_p.transcriptomic_profile.egfr_expression = float(row["egfr_expression"])
                existing_p.transcriptomic_profile.brca1_expression = float(row["brca1_expression"])
                existing_p.transcriptomic_profile.brca2_expression = float(row["brca2_expression"])
                existing_p.transcriptomic_profile.pik3ca_expression = float(row["pik3ca_expression"])

            updated_count += 1
        else:
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
            imported_count += 1

    db.commit()

    return {
        "status": "success",
        "message": f"Successfully processed {len(cleaned_df)} records ({imported_count} imported, {updated_count} updated).",
        "imported_records": imported_count,
        "updated_records": updated_count,
        "quality_report": quality_report
    }

@router.get("/quality-report")
def get_dataset_quality(db: Session = Depends(get_db)):
    patients = db.query(Patient).all()
    if not patients:
        return {"message": "No patients currently loaded"}
        
    data = []
    for p in patients:
        gen = p.genomic_profile
        tran = p.transcriptomic_profile
        data.append({
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
        })
    df = pd.DataFrame(data)
    _, quality_report = DataProcessor.audit_and_clean_dataframe(df)
    return quality_report
