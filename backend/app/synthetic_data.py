"""
ONCOPROFILE AI - Synthetic Multi-Omics Breast Cancer Dataset Generator
Generates biologically plausible synthetic genomic, transcriptomic, and clinical data
for 250 simulated breast cancer patients across 4 major molecular subtypes.
NOTE: This dataset is purely synthetic and intended strictly for educational and academic research demonstration.
"""

import numpy as np
import pandas as pd
import os

RANDOM_SEED = 42

def generate_synthetic_dataset(num_patients=250, output_path=None):
    np.random.seed(RANDOM_SEED)
    
    # Subtype distribution roughly reflects clinical prevalence:
    # Luminal A ~ 40%, Luminal B ~ 25%, HER2-enriched ~ 15%, TNBC (Basal-like) ~ 20%
    subtypes = np.random.choice(
        ["Luminal A", "Luminal B", "HER2-enriched", "Triple-Negative (TNBC)"],
        size=num_patients,
        p=[0.40, 0.25, 0.15, 0.20]
    )
    
    records = []
    
    for i in range(num_patients):
        p_id = f"ONC-{i+1:03d}"
        
        # Baseline reference profile for ONC-001 validation
        if i == 0:
            st = "Luminal A"
            age = 54
            stage = "Stage IIA"
            er = "Positive"
            pr = "Positive"
            her2 = "Negative"
            ki67 = 12.0
            
            # Mutations
            brca1_mut = 0
            brca2_mut = 0
            pik3ca_mut = 1
            tp53_mut = 0
            esr1_mut = 0
            her2_amp = 0
            
            # Expressions (log2 normalized)
            esr1_exp = 12.4
            pgr_exp = 10.8
            erbb2_exp = 6.1
            mki67_exp = 5.2
            egfr_exp = 4.8
            brca1_exp = 7.8
            brca2_exp = 7.1
            pik3ca_exp = 8.6
            
            # Simulated Response Label
            response = "Likely responder"
            
            records.append({
                "patient_id": p_id,
                "age": age,
                "disease_stage": stage,
                "molecular_subtype": st,
                "er_status": er,
                "pr_status": pr,
                "her2_status": her2,
                "ki67_percent": round(ki67, 1),
                "brca1_mutation": brca1_mut,
                "brca2_mutation": brca2_mut,
                "pik3ca_mutation": pik3ca_mut,
                "tp53_mutation": tp53_mut,
                "esr1_mutation": esr1_mut,
                "her2_amplification": her2_amp,
                "esr1_expression": round(esr1_exp, 2),
                "pgr_expression": round(pgr_exp, 2),
                "erbb2_expression": round(erbb2_exp, 2),
                "mki67_expression": round(mki67_exp, 2),
                "egfr_expression": round(egfr_exp, 2),
                "brca1_expression": round(brca1_exp, 2),
                "brca2_expression": round(brca2_exp, 2),
                "pik3ca_expression": round(pik3ca_exp, 2),
                "treatment_response": response
            })
            continue

        st = subtypes[i]
        age = int(np.clip(np.random.normal(56, 11), 30, 82))
        
        stages = ["Stage I", "Stage IIA", "Stage IIB", "Stage IIIA", "Stage IIIB", "Stage IV"]
        stage_weights = [0.25, 0.30, 0.20, 0.12, 0.08, 0.05]
        stage = np.random.choice(stages, p=stage_weights)

        if st == "Luminal A":
            er = "Positive"
            pr = "Positive" if np.random.rand() > 0.10 else "Negative"
            her2 = "Negative"
            ki67 = np.clip(np.random.normal(12, 4), 4, 19.5)
            
            # Mutations: high PIK3CA (~45%), low TP53 (~12%), rare BRCA (~3%), ESR1 mut mostly in Stage IV
            pik3ca_mut = 1 if np.random.rand() < 0.45 else 0
            tp53_mut = 1 if np.random.rand() < 0.12 else 0
            brca1_mut = 1 if np.random.rand() < 0.03 else 0
            brca2_mut = 1 if np.random.rand() < 0.04 else 0
            esr1_mut = 1 if (stage == "Stage IV" and np.random.rand() < 0.25) else (1 if np.random.rand() < 0.04 else 0)
            her2_amp = 0
            
            # Expressions
            esr1_exp = np.random.normal(11.8, 0.8)
            pgr_exp = np.random.normal(10.2, 0.9)
            erbb2_exp = np.random.normal(6.2, 0.6)
            mki67_exp = np.random.normal(5.4, 0.6)
            egfr_exp = np.random.normal(4.9, 0.5)
            brca1_exp = np.random.normal(7.6, 0.5)
            brca2_exp = np.random.normal(7.2, 0.5)
            pik3ca_exp = np.random.normal(8.4, 0.6)
            
            # Response: usually Likely responder to endocrine; lower if ESR1 or TP53 mut
            if esr1_mut == 1:
                response = "Lower predicted response"
            elif tp53_mut == 1:
                response = "Intermediate response"
            else:
                response = "Likely responder" if np.random.rand() > 0.15 else "Intermediate response"

        elif st == "Luminal B":
            er = "Positive"
            pr = "Positive" if np.random.rand() > 0.35 else "Negative"
            # 30% HER2 positive in Luminal B
            her2 = "Positive" if np.random.rand() < 0.30 else "Negative"
            her2_amp = 1 if her2 == "Positive" else 0
            ki67 = np.clip(np.random.normal(32, 10), 21, 65)
            
            pik3ca_mut = 1 if np.random.rand() < 0.35 else 0
            tp53_mut = 1 if np.random.rand() < 0.32 else 0
            brca1_mut = 1 if np.random.rand() < 0.06 else 0
            brca2_mut = 1 if np.random.rand() < 0.08 else 0
            esr1_mut = 1 if np.random.rand() < 0.12 else 0
            
            esr1_exp = np.random.normal(10.1, 0.9)
            pgr_exp = np.random.normal(7.3, 1.4)
            erbb2_exp = np.random.normal(11.2, 1.1) if her2 == "Positive" else np.random.normal(6.8, 0.7)
            mki67_exp = np.random.normal(8.1, 0.8)
            egfr_exp = np.random.normal(5.5, 0.6)
            brca1_exp = np.random.normal(7.4, 0.6)
            brca2_exp = np.random.normal(7.0, 0.6)
            pik3ca_exp = np.random.normal(8.2, 0.7)
            
            if esr1_mut == 1 or (tp53_mut == 1 and ki67 > 45):
                response = "Lower predicted response"
            elif her2 == "Positive" or pik3ca_mut == 1:
                response = "Intermediate response" if np.random.rand() > 0.4 else "Likely responder"
            else:
                response = "Likely responder" if np.random.rand() > 0.45 else "Intermediate response"

        elif st == "HER2-enriched":
            er = "Negative" if np.random.rand() > 0.15 else "Positive"
            pr = "Negative"
            her2 = "Positive"
            her2_amp = 1
            ki67 = np.clip(np.random.normal(42, 12), 25, 75)
            
            pik3ca_mut = 1 if np.random.rand() < 0.40 else 0
            tp53_mut = 1 if np.random.rand() < 0.72 else 0
            brca1_mut = 1 if np.random.rand() < 0.08 else 0
            brca2_mut = 1 if np.random.rand() < 0.06 else 0
            esr1_mut = 0
            
            esr1_exp = np.random.normal(4.8, 0.8) if er == "Negative" else np.random.normal(8.2, 0.8)
            pgr_exp = np.random.normal(3.8, 0.6)
            erbb2_exp = np.random.normal(13.6, 1.2)
            mki67_exp = np.random.normal(9.0, 0.9)
            egfr_exp = np.random.normal(6.9, 0.8)
            brca1_exp = np.random.normal(7.2, 0.6)
            brca2_exp = np.random.normal(6.9, 0.6)
            pik3ca_exp = np.random.normal(8.5, 0.7)
            
            # Anti-HER2 targeted therapy yields high response; PIK3CA mutation causes partial trastuzumab resistance
            if pik3ca_mut == 1 and tp53_mut == 1:
                response = "Intermediate response" if np.random.rand() > 0.3 else "Lower predicted response"
            else:
                response = "Likely responder" if np.random.rand() > 0.25 else "Intermediate response"

        else: # Triple-Negative (TNBC / Basal-like)
            er = "Negative"
            pr = "Negative"
            her2 = "Negative"
            her2_amp = 0
            ki67 = np.clip(np.random.normal(65, 12), 40, 95)
            
            tp53_mut = 1 if np.random.rand() < 0.82 else 0
            brca1_mut = 1 if np.random.rand() < 0.26 else 0
            brca2_mut = 1 if np.random.rand() < 0.14 else 0
            pik3ca_mut = 1 if np.random.rand() < 0.12 else 0
            esr1_mut = 0
            
            esr1_exp = np.random.normal(4.2, 0.6)
            pgr_exp = np.random.normal(3.4, 0.5)
            erbb2_exp = np.random.normal(5.8, 0.6)
            mki67_exp = np.random.normal(10.5, 0.9)
            egfr_exp = np.random.normal(9.6, 1.1)
            brca1_exp = np.random.normal(5.4, 0.8) if brca1_mut == 1 else np.random.normal(7.1, 0.6)
            brca2_exp = np.random.normal(5.7, 0.7) if brca2_mut == 1 else np.random.normal(6.9, 0.6)
            pik3ca_exp = np.random.normal(7.3, 0.6)
            
            # If BRCA1/2 mut, platinum/PARP-i sensitive -> Likely/Intermediate responder
            if brca1_mut == 1 or brca2_mut == 1:
                response = "Likely responder" if np.random.rand() > 0.35 else "Intermediate response"
            elif stage in ["Stage IIIB", "Stage IV"]:
                response = "Lower predicted response" if np.random.rand() > 0.30 else "Intermediate response"
            else:
                response = "Intermediate response" if np.random.rand() > 0.35 else "Likely responder"

        records.append({
            "patient_id": p_id,
            "age": age,
            "disease_stage": stage,
            "molecular_subtype": st,
            "er_status": er,
            "pr_status": pr,
            "her2_status": her2,
            "ki67_percent": round(ki67, 1),
            "brca1_mutation": brca1_mut,
            "brca2_mutation": brca2_mut,
            "pik3ca_mutation": pik3ca_mut,
            "tp53_mutation": tp53_mut,
            "esr1_mutation": esr1_mut,
            "her2_amplification": her2_amp,
            "esr1_expression": round(float(esr1_exp), 2),
            "pgr_expression": round(float(pgr_exp), 2),
            "erbb2_expression": round(float(erbb2_exp), 2),
            "mki67_expression": round(float(mki67_exp), 2),
            "egfr_expression": round(float(egfr_exp), 2),
            "brca1_expression": round(float(brca1_exp), 2),
            "brca2_expression": round(float(brca2_exp), 2),
            "pik3ca_expression": round(float(pik3ca_exp), 2),
            "treatment_response": response
        })

    df = pd.DataFrame(records)
    
    if output_path:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        df.to_csv(output_path, index=False)
        print(f"Generated synthetic dataset with {len(df)} records at: {output_path}")
        
    return df

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(os.path.dirname(current_dir), "data")
    csv_file = os.path.join(data_dir, "synthetic_breast_cancer_omics.csv")
    generate_synthetic_dataset(250, csv_file)
