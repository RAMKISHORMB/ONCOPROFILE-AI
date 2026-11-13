# ONCOPROFILE AI — Synthetic Multi-Omics Breast Cancer Dataset Documentation

> **DISCLAIMER:**  
> This dataset (`synthetic_breast_cancer_omics.csv`) contains **entirely synthetic, simulated research data** engineered for academic coursework (Medical Biochemistry CLA-2), prototype development, and computational pipeline testing.  
> **It does NOT represent real patients, actual clinical trials, or validated medical records.**  
> It must never be used to make clinical diagnosis or treatment decisions.

---

## 1. Overview & Biological Rationale

Breast cancer (*Carcinoma mammae*) is a heterogeneous disease defined by complex interplay among genomic mutations, transcriptomic expression levels, and clinical immunohistochemical (IHC) markers. This dataset models 250 synthetic patient profiles distributed across four classical molecular subtypes:

1. **Luminal A (Approx. 40%):**
   - **Receptor Status:** Estrogen receptor positive ($ER^+$), progesterone receptor positive ($PR^+$), HER2 negative ($HER2^-$).
   - **Proliferation:** Low Ki-67 proliferation index ($< 20\%$), low *MKI67* mRNA.
   - **Genomics:** High frequency of activating mutations in *PIK3CA* ($\approx 40-45\%$), low *TP53* mutation rates ($\approx 10-15\%$).
   - **Therapeutic Context:** High sensitivity to endocrine therapies (selective estrogen receptor modulators like tamoxifen, aromatase inhibitors). Lower sensitivity to standard cytotoxic chemotherapy.

2. **Luminal B (Approx. 25%):**
   - **Receptor Status:** $ER^+$, variable $PR$ ($PR^+$ or $PR^-$), either $HER2^-$ with high Ki-67 ($\ge 20\%$) or $HER2^+$.
   - **Genomics:** Moderate *TP53* ($\approx 30\%$) and *PIK3CA* ($\approx 35\%$) alterations.
   - **Therapeutic Context:** Frequently requires combined endocrine therapy plus cytotoxic chemotherapy and/or CDK4/6 inhibitors (e.g., palbociclib, ribociclib); dual anti-HER2 blockade if HER2-positive.

3. **HER2-Enriched (Approx. 15%):**
   - **Receptor Status:** Typically $ER^-$, $PR^-$, with high-level amplification and overexpression of the *ERBB2* (*HER2*) oncogene ($HER2^+$).
   - **Proliferation & Genomics:** High Ki-67 index, high *TP53* mutation prevalence ($\approx 70\%$).
   - **Therapeutic Context:** Highly responsive to targeted anti-HER2 agents (monoclonal antibodies trastuzumab and pertuzumab, antibody-drug conjugates like T-DXd) combined with chemotherapy.

4. **Triple-Negative Breast Cancer / Basal-like (TNBC, Approx. 20%):**
   - **Receptor Status:** $ER^-$, $PR^-$, $HER2^-$.
   - **Molecular Features:** High *EGFR* expression, elevated *MKI67* expression, frequent *TP53* mutations ($\approx 80\%$), enriched for germline/somatic *BRCA1* and *BRCA2* pathogenic variants ($\approx 20-30\%$).
   - **Therapeutic Context:** Resistant to endocrine and HER2-targeted therapies; standard management relies on cytotoxic chemotherapy (anthracyclines, taxanes, platinum agents), PARP inhibitors (olaparib/talazoparib for BRCA-mutated), and immune checkpoint inhibitors (pembrolizumab if PD-L1 positive).

---

## 2. Feature Dictionary

| Column Name | Type | Unit / Values | Description |
|---|---|---|---|
| `patient_id` | String | `ONC-001` .. `ONC-250` | Unique simulated patient identifier. |
| `age` | Integer | Years ($30 - 82$) | Age at simulated diagnosis. |
| `disease_stage` | Categorical | `Stage I`, `Stage IIA`, `Stage IIB`, `Stage IIIA`, `Stage IIIB`, `Stage IV` | AJCC TNM clinical disease stage. |
| `molecular_subtype` | Categorical | `Luminal A`, `Luminal B`, `HER2-enriched`, `Triple-Negative (TNBC)` | Reference molecular classification. |
| `er_status` | Categorical | `Positive`, `Negative` | Estrogen receptor IHC status. |
| `pr_status` | Categorical | `Positive`, `Negative` | Progesterone receptor IHC status. |
| `her2_status` | Categorical | `Positive`, `Negative` | HER2 status (IHC 3+ or FISH amplified). |
| `ki67_percent` | Float | Percentage ($\%$) | Immunohistochemical proliferation marker percentage. |
| `brca1_mutation` | Binary | `0` (Wild-Type), `1` (Pathogenic Variant) | Pathogenic variant in breast cancer susceptibility gene 1. |
| `brca2_mutation` | Binary | `0` (Wild-Type), `1` (Pathogenic Variant) | Pathogenic variant in breast cancer susceptibility gene 2. |
| `pik3ca_mutation` | Binary | `0` (Wild-Type), `1` (Pathogenic Variant) | Activating mutation in PI3K catalytic subunit alpha. |
| `tp53_mutation` | Binary | `0` (Wild-Type), `1` (Pathogenic Variant) | Missense/nonsense mutation in tumor suppressor TP53. |
| `esr1_mutation` | Binary | `0` (Wild-Type), `1` (Pathogenic Variant) | Activating mutation in ligand-binding domain of ESR1. |
| `her2_amplification`| Binary | `0` (Normal), `1` (Amplified) | High-level copy number amplification of ERBB2 locus. |
| `esr1_expression` | Float | $\log_2(\text{TPM} + 1)$ | Normalized transcriptomic expression of ESR1. |
| `pgr_expression` | Float | $\log_2(\text{TPM} + 1)$ | Normalized transcriptomic expression of PGR. |
| `erbb2_expression`| Float | $\log_2(\text{TPM} + 1)$ | Normalized transcriptomic expression of ERBB2. |
| `mki67_expression`| Float | $\log_2(\text{TPM} + 1)$ | Normalized transcriptomic expression of MKI67. |
| `egfr_expression` | Float | $\log_2(\text{TPM} + 1)$ | Normalized transcriptomic expression of EGFR. |
| `brca1_expression`| Float | $\log_2(\text{TPM} + 1)$ | Normalized transcriptomic expression of BRCA1. |
| `brca2_expression`| Float | $\log_2(\text{TPM} + 1)$ | Normalized transcriptomic expression of BRCA2. |
| `pik3ca_expression`| Float | $\log_2(\text{TPM} + 1)$ | Normalized transcriptomic expression of PIK3CA. |
| `treatment_response`| Categorical | `Likely responder`, `Intermediate response`, `Lower predicted response` | Simulated downstream therapeutic response outcome. |

---

## 3. Machine Learning Usage

- **Patient Classification:** Features `[esr1_expression, pgr_expression, erbb2_expression, mki67_expression, egfr_expression, pik3ca_expression, pik3ca_mutation, tp53_mutation, her2_amplification]` are normalized with `StandardScaler` and clustered using **K-Means ($k=4$)**, visualized through 2-component **Principal Component Analysis (PCA)**.
- **Treatment Response Prediction:** A **Random Forest Classifier** is trained using stratified 80/20 train/test splitting to predict the `treatment_response` category, producing out-of-fold confusion matrices, precision, recall, and Gini feature importances.
- **Rule-Based Precision Strategy:** Combines genomic indicators (e.g. *PIK3CA* $\to$ Alpelisib eligibility, *BRCA1/2* $\to$ PARP inhibitors, *ESR1* $\to$ SERDs like Elacestrant) with transcriptomic signatures to propose structured precision oncology pathways.
