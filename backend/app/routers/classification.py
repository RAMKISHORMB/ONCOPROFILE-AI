from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Patient, AnalysisResult
from ..ml_pipeline import pipeline

router = APIRouter(prefix="/api/clusters", tags=["Patient Classification"])

@router.get("")
def get_clusters_and_pca(db: Session = Depends(get_db)):
    patients = db.query(Patient).all()
    if not patients:
        return {"error": "No patients available"}

    # Fetch PCA scatter coordinates for each patient
    scatter_points = []
    for p in patients:
        an = p.analysis_result
        if an:
            scatter_points.append({
                "patient_id": p.patient_id,
                "x": an.pca_x,
                "y": an.pca_y,
                "cluster_id": an.cluster_id,
                "cluster_name": an.cluster_name,
                "subtype": p.molecular_subtype,
                "stage": p.disease_stage,
                "predicted_response": an.predicted_response,
                "ki67": p.ki67_percent
            })
        else:
            # If not yet saved in analysis_results, compute dynamically
            gen = p.genomic_profile
            tran = p.transcriptomic_profile
            if gen and tran and pipeline.is_fitted:
                pt_dict = {
                    "esr1_expression": tran.esr1_expression,
                    "pgr_expression": tran.pgr_expression,
                    "erbb2_expression": tran.erbb2_expression,
                    "mki67_expression": tran.mki67_expression,
                    "egfr_expression": tran.egfr_expression,
                    "brca1_expression": tran.brca1_expression,
                    "brca2_expression": tran.brca2_expression,
                    "pik3ca_expression": tran.pik3ca_expression,
                    "pik3ca_mutation": gen.pik3ca_mutation,
                    "tp53_mutation": gen.tp53_mutation,
                    "her2_amplification": gen.her2_amplification,
                }
                c_info = pipeline.assign_cluster(pt_dict)
                scatter_points.append({
                    "patient_id": p.patient_id,
                    "x": c_info["pca_x"],
                    "y": c_info["pca_y"],
                    "cluster_id": c_info["cluster_id"],
                    "cluster_name": c_info["cluster_name"],
                    "subtype": p.molecular_subtype,
                    "stage": p.disease_stage,
                    "predicted_response": "Pending analysis",
                    "ki67": p.ki67_percent
                })

    return {
        "clusters": pipeline.cluster_summaries_,
        "pca_variance_ratio": pipeline.pca_variance_ratio_,
        "scatter_points": scatter_points,
        "methodology_note": "K-Means (k=4) unsupervised clustering across 11 standardized molecular features (8 transcriptomic + 3 genomic alterations). 2D PCA visualizes latent topological separation. Note: Unsupervised computational clusters are exploratory and differ from clinical immunohistochemical subtypes."
    }
