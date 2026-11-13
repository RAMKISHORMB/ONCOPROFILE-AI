"""
ONCOPROFILE AI - Personalized Strategy Engine
Translates multidimensional genomic, transcriptomic, and clinical biomarker inputs
into scientifically explainable precision oncology treatment hypotheses.
All suggestions are decision-support pathways designed for specialist oncology evaluation.
"""

from typing import Dict, Any, List

def generate_personalized_strategy(patient_dict: dict, cluster_info: dict, prediction_info: dict) -> dict:
    subtype = patient_dict.get("molecular_subtype", "Unknown")
    er = patient_dict.get("er_status", "Negative")
    pr = patient_dict.get("pr_status", "Negative")
    her2 = patient_dict.get("her2_status", "Negative")
    ki67 = float(patient_dict.get("ki67_percent", 0.0))
    stage = patient_dict.get("disease_stage", "Stage II")
    
    # Genomic variants
    brca1 = int(patient_dict.get("brca1_mutation", 0))
    brca2 = int(patient_dict.get("brca2_mutation", 0))
    pik3ca = int(patient_dict.get("pik3ca_mutation", 0))
    tp53 = int(patient_dict.get("tp53_mutation", 0))
    esr1 = int(patient_dict.get("esr1_mutation", 0))
    her2_amp = int(patient_dict.get("her2_amplification", 0))
    
    # Expressions
    esr1_exp = float(patient_dict.get("esr1_expression", 0.0))
    pgr_exp = float(patient_dict.get("pgr_expression", 0.0))
    erbb2_exp = float(patient_dict.get("erbb2_expression", 0.0))
    mki67_exp = float(patient_dict.get("mki67_expression", 0.0))
    egfr_exp = float(patient_dict.get("egfr_expression", 0.0))
    
    # 1. Important mutations list
    important_mutations = []
    if brca1 == 1:
        important_mutations.append("BRCA1 Pathogenic Variant (c.68_69delAG / c.5266dupC equivalent - Homologous Recombination Deficiency risk)")
    if brca2 == 1:
        important_mutations.append("BRCA2 Pathogenic Variant (c.5946delT equivalent - Impaired double-strand break repair)")
    if pik3ca == 1:
        important_mutations.append("PIK3CA Activating Mutation (Helical E542K/E545K or Kinase Domain H1047R - Hyperactivation of PI3K/AKT pathway)")
    if tp53 == 1:
        important_mutations.append("TP53 Inactivating Alteration (Loss of DNA damage checkpoint & apoptosis regulation)")
    if esr1 == 1:
        important_mutations.append("ESR1 Ligand-Binding Domain Mutation (Y537S / D538G - Constitutive ligand-independent ERα activation)")
    if her2_amp == 1:
        important_mutations.append("ERBB2 (HER2) Copy Number Amplification (Receptor tyrosine kinase gene duplication)")
    if not important_mutations:
        important_mutations.append("No pathogenic driver variants detected across screened 6-gene panel (BRCA1, BRCA2, PIK3CA, TP53, ESR1, ERBB2).")

    # 2. Significant gene-expression findings
    significant_expressions = []
    if esr1_exp >= 10.0:
        significant_expressions.append(f"ESR1 Overexpression ({esr1_exp:.1f} log2 TPM): Robust estrogen receptor signaling dependency.")
    elif esr1_exp < 6.0:
        significant_expressions.append(f"ESR1 Transcriptional Downregulation ({esr1_exp:.1f} log2 TPM): Minimal estrogen receptor transcript abundance.")

    if pgr_exp >= 9.0:
        significant_expressions.append(f"PGR Robust Expression ({pgr_exp:.1f} log2 TPM): Intact ER-PR transcriptional co-activation cascade.")
    elif pgr_exp < 5.0 and er == "Positive":
        significant_expressions.append(f"PGR Transcriptional Loss/Attenuation ({pgr_exp:.1f} log2 TPM): May signify non-functional ER or growth factor cross-talk.")

    if erbb2_exp >= 11.0 or her2 == "Positive":
        significant_expressions.append(f"ERBB2 Transcript Hyper-enrichment ({erbb2_exp:.1f} log2 TPM): High dependency on HER2 homodimer/heterodimer signaling.")
    else:
        significant_expressions.append(f"ERBB2 Basal Transcript Level ({erbb2_exp:.1f} log2 TPM): Consistent with HER2 non-amplified status.")

    if mki67_exp >= 8.5 or ki67 >= 25.0:
        significant_expressions.append(f"MKI67 Proliferative Surge ({mki67_exp:.1f} log2 TPM, Ki-67 {ki67:.1f}%): Elevated cellular cycling and fraction in active mitosis.")
    else:
        significant_expressions.append(f"MKI67 Low Proliferative Signature ({mki67_exp:.1f} log2 TPM, Ki-67 {ki67:.1f}%): Indolent cell-cycle turnover.")

    if egfr_exp >= 7.5:
        significant_expressions.append(f"EGFR Elevation ({egfr_exp:.1f} log2 TPM): Characteristic basal/stem-like growth factor receptor activation.")

    # 3. Potential Pathways
    pathways: List[Dict[str, str]] = []
    
    # Hormone receptor positive pathways
    if er == "Positive":
        if esr1 == 1:
            pathways.append({
                "category": "Endocrine Resistance Pathway",
                "recommendation": "Evaluate Selective Estrogen Receptor Degraders (SERDs, e.g. Elacestrant) over standard Aromatase Inhibitors.",
                "evidence_level": "Level 1A (EMERALD Trial Benchmark)",
                "actionable_target": "ESR1 Ligand-Binding Domain (Y537S/D538G)",
                "rationale": "ESR1 LBD mutations induce constitutive ligand-independent transcriptional activity, conferring resistance to aromatase inhibitors while retaining sensitivity to oral SERDs."
            })
        else:
            pathways.append({
                "category": "Endocrine Backbone Therapy",
                "recommendation": "Consider standard Endocrine Therapy (Aromatase Inhibitors e.g., Letrozole/Anastrozole with LHRH agonist if premenopausal, or Tamoxifen).",
                "evidence_level": "Standard of Care (NCCN/ESMO Guidelines)",
                "actionable_target": "Estrogen Receptor Alpha (ERα / ESR1)",
                "rationale": "High ESR1/PGR expression indicates classical hormone sensitivity, predicting substantial clinical benefit from anti-estrogen signaling blockade."
            })

        # CDK4/6 inhibitor consideration
        if ki67 >= 20.0 or stage in ["Stage IIB", "Stage IIIA", "Stage IIIB", "Stage IV"] or subtype == "Luminal B":
            pathways.append({
                "category": "Cell-Cycle Checkpoint Inhibition",
                "recommendation": "Assess eligibility for CDK4/6 Inhibitor Combination (e.g., Abemaciclib, Palbociclib, or Ribociclib).",
                "evidence_level": "Level 1A (monarchE / MONALEESA Guidelines)",
                "actionable_target": "Cyclin D1 - CDK4/6 - Retinoblastoma (Rb) Pathway",
                "rationale": "Elevated proliferation (Ki-67 >= 20%) and stage advance indicate higher risk of recurrence; CDK4/6 inhibitors induce G1-phase cell cycle arrest."
            })

    # HER2 pathways
    if her2 == "Positive" or her2_amp == 1 or erbb2_exp >= 11.0:
        pathways.append({
            "category": "HER2-Targeted Dual Blockade",
            "recommendation": "Demonstrate consideration of Dual Anti-HER2 Monoclonal Antibodies (Trastuzumab + Pertuzumab) combined with taxane-based chemotherapy.",
            "evidence_level": "Level 1A (CLEOPATRA / APHINITY Trials)",
            "actionable_target": "ERBB2 / HER2 Extracellular Domains II and IV",
            "rationale": "Overexpression of ERBB2 drives spontaneous homodimerization and heterodimerization with HER3. Pertuzumab prevents dimerization while Trastuzumab promotes antibody-dependent cellular cytotoxicity (ADCC)."
        })
        if stage in ["Stage IIIA", "Stage IIIB", "Stage IV"]:
            pathways.append({
                "category": "Next-Generation Antibody-Drug Conjugate (ADC)",
                "recommendation": "Evaluate HER2-directed Antibody-Drug Conjugate (e.g., Trastuzumab Deruxtecan / T-DXd) for advanced or resistant disease.",
                "evidence_level": "Level 1A (DESTINY-Breast03)",
                "actionable_target": "HER2 Internalization & Topoisomerase I Payload",
                "rationale": "Delivers potent exatecan topoisomerase I inhibitor directly into ERBB2-overexpressing neoplastic cells with bystander antitumor effect."
            })

    # TNBC pathways
    if subtype == "Triple-Negative (TNBC)" or (er == "Negative" and pr == "Negative" and her2 == "Negative"):
        pathways.append({
            "category": "Cytotoxic Chemotherapy Regimen",
            "recommendation": "Consider Platinum-containing Chemotherapy Backbone (Carboplatin + Paclitaxel / Anthracycline-Cyclophosphamide).",
            "evidence_level": "Level 1A Standard Care (KEYNOTE-522)",
            "actionable_target": "DNA Replication Interstrand Crosslinks",
            "rationale": "High mitotic index and genomic instability render TNBC vulnerable to DNA-damaging cytotoxic agents."
        })
        pathways.append({
            "category": "Immune Checkpoint Blockade Evaluation",
            "recommendation": "Evaluate PD-L1 expression (CPS score) for Immune Checkpoint Inhibitor inclusion (Pembrolizumab).",
            "evidence_level": "Level 1A (KEYNOTE-522 / KEYNOTE-355)",
            "actionable_target": "PD-1 / PD-L1 Axis & Antitumor T-Cell Exhaustion",
            "rationale": "Basal-like TNBC frequently exhibits elevated tumor-infiltrating lymphocytes (TILs) and immune checkpoint expression."
        })

    # PIK3CA pathway
    if pik3ca == 1:
        pathways.append({
            "category": "PI3K/AKT/mTOR Targeted Pathway",
            "recommendation": "Evaluate PI3K-alpha specific inhibitor (e.g., Alpelisib) or pan-AKT inhibitor (Capivasertib) with endocrine partner upon progression.",
            "evidence_level": "Level 1A (SOLAR-1 / CAPItello-291 Trials)",
            "actionable_target": "Phosphatidylinositol 4,5-bisphosphate 3-kinase catalytic subunit alpha (p110α)",
            "rationale": "PIK3CA helical/kinase mutations produce constitutive hyperactivation of downstream survival signaling, bypassing upstream endocrine inhibition."
        })

    # BRCA1 / BRCA2 pathway
    if brca1 == 1 or brca2 == 1:
        pathways.append({
            "category": "PARP Inhibitor Synthetic Lethality",
            "recommendation": "Assess eligibility for Poly(ADP-ribose) Polymerase (PARP) Inhibitors (e.g., Olaparib, Talazoparib) & Hereditary Genetic Counseling.",
            "evidence_level": "Level 1A (OlympiA / OlympiAD Trials)",
            "actionable_target": "Base Excision Repair & Homologous Recombination Deficiency (HRD)",
            "rationale": "Inactivating BRCA1/2 variants impair homologous recombination repair of DNA double-strand breaks. Pharmacologic inhibition of PARP causes synthetic lethality via replication fork collapse."
        })

    # 4. Scientific Justifications
    justifications: List[Dict[str, str]] = []
    
    # ER/ESR1
    justifications.append({
        "biomarker": "ESR1 & Estrogen Receptor (ERα)",
        "finding": f"{er} (Expression: {esr1_exp:.1f} log2 TPM)",
        "biochemical_pathway": "Nuclear receptor transcription factor cascade; binds estrogen response elements (EREs) to transcribe cyclin D1, c-Myc, and anti-apoptotic BCL-2.",
        "clinical_rationale": "Provides the biological foundation for endocrine responsiveness vs endocrine resistance. High expression confirms functional dependence on estrogenic stimulation."
    })

    # HER2/ERBB2
    justifications.append({
        "biomarker": "ERBB2 / HER2",
        "finding": f"{her2} (Expression: {erbb2_exp:.1f} log2 TPM, Amplification: {'Yes' if her2_amp == 1 else 'No'})",
        "biochemical_pathway": "Receptor tyrosine kinase devoid of ligand-binding pocket; readily forms ligand-independent dimers to trigger MAPK/ERK and PI3K/AKT cascades.",
        "clinical_rationale": "Driver oncogene causing accelerated proliferation; predictive biomarker for high responsiveness to anti-HER2 targeted therapies."
    })

    # Proliferation Ki-67 / MKI67
    justifications.append({
        "biomarker": "Ki-67 Proliferation Index (MKI67)",
        "finding": f"{ki67:.1f}% (Expression: {mki67_exp:.1f} log2 TPM)",
        "biochemical_pathway": "Expressed exclusively during active cell-cycle phases (G1, S, G2, M); localized to perichromosomal layer during mitosis.",
        "clinical_rationale": "Critical discriminator between low-risk indolent Luminal A and aggressive Luminal B / TNBC subtypes; correlates with chemotherapy benefit and early recurrence."
    })

    # PIK3CA
    if pik3ca == 1:
        justifications.append({
            "biomarker": "PIK3CA Mutation",
            "finding": "Activating Mutation Detected",
            "biochemical_pathway": "Converts PIP2 to PIP3 at inner plasma membrane, recruiting PDK1 and AKT to stimulate protein synthesis, growth (mTORC1), and survival.",
            "clinical_rationale": "Mechanism of primary/acquired endocrine therapy insensitivity; actionable biomarker indicating eligibility for targeted alpha-selective PI3K inhibitors."
        })

    # TP53
    if tp53 == 1:
        justifications.append({
            "biomarker": "TP53 Inactivation",
            "finding": "Pathogenic Mutation Detected",
            "biochemical_pathway": "Disrupts p53-mediated p21 induction upon DNA damage, abolishing G1/S checkpoint arrest and intrinsic apoptosis induction.",
            "clinical_rationale": "Signifies genomic instability and aggressive biological phenotype; often associated with higher chemotherapy responsiveness but elevated relapse hazard."
        })

    # BRCA1/2
    if brca1 == 1 or brca2 == 1:
        gene_name = "BRCA1" if brca1 == 1 else "BRCA2"
        if brca1 == 1 and brca2 == 1:
            gene_name = "BRCA1 & BRCA2"
        justifications.append({
            "biomarker": f"{gene_name} Pathogenic Variant",
            "finding": "Deleterious Alteration Detected",
            "biochemical_pathway": "Abolishes RAD51-dependent homologous recombination double-strand break repair, forcing error-prone non-homologous end joining (NHEJ).",
            "clinical_rationale": "Confers synthetic lethality upon PARP inhibition and renders neoplastic cells hypersensitive to platinum DNA-crosslinking agents."
        })

    # 5. Molecular summary
    summary = (
        f"Simulated patient {patient_dict.get('patient_id', 'Unknown')} ({patient_dict.get('age')} yo) presents with "
        f"{stage} {subtype} breast cancer ({er} ER, {pr} PR, {her2} HER2, Ki-67 index {ki67:.1f}%). "
        f"Multi-omics profiling reveals {len(important_mutations)} key genomic feature(s) and distinct transcriptomic "
        f"activity aligned with computational {cluster_info.get('cluster_name', 'Cluster')}. "
        f"The supervised predictive ensemble classifies expected systemic therapeutic outcome as '{prediction_info.get('predicted_response', 'Intermediate response')}' "
        f"(confidence {prediction_info.get('response_confidence', 0)*100:.1f}%)."
    )

    # 6. Scientific Limitations & Clinical Guidance
    limitations = [
        "Clinical Validation Scope: Machine learning response classifications are derived from curated multi-omics cohort benchmarks and serve as decision-support hypotheses requiring specialist validation.",
        "Unsupervised Cluster Distinction: Computational K-Means clusters represent high-dimensional molecular proximity and must be interpreted alongside standard-of-care IHC and PAM50 intrinsic subtypes.",
        "Genomic Coverage: The current profiling panel assesses 6 high-penetrance somatic drivers and an 8-gene expression signature; comprehensive tumor mutational burden (TMB) and microsatellite instability (MSI) require expanded whole-exome sequencing.",
        "Multidisciplinary Decision-Making: Definitive treatment planning requires complete histological staging, patient performance status, cardiac ejection fraction screening, and multidisciplinary tumor board consensus."
    ]

    disclaimer = (
        "CLINICAL DECISION SUPPORT NOTICE: ONCOPROFILE AI is an advanced clinical bioinformatics platform for precision oncology research. "
        "Outputs do NOT constitute direct automated medical prescriptions or final clinical diagnoses. "
        "All suggested treatment pathways represent evidence-based hypotheses requiring specialist oncology verification."
    )

    return {
        "patient_id": patient_dict.get("patient_id", "Unknown"),
        "molecular_summary": summary,
        "identified_subtype": subtype,
        "important_mutations": important_mutations,
        "significant_expressions": significant_expressions,
        "cluster_profile": {
            "cluster_id": cluster_info.get("cluster_id"),
            "cluster_name": cluster_info.get("cluster_name"),
            "pca_x": cluster_info.get("pca_x"),
            "pca_y": cluster_info.get("pca_y")
        },
        "predicted_response": prediction_info.get("predicted_response"),
        "response_confidence": prediction_info.get("response_confidence"),
        "potential_pathways": pathways,
        "scientific_justifications": justifications,
        "limitations": limitations,
        "clinician_disclaimer": disclaimer
    }
