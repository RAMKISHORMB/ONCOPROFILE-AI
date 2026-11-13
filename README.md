# ONCOPROFILE AI
### Multi-Omics Based Personalized Breast Cancer Treatment Strategy Platform

[![Python 3.12](https://img.shields.io/badge/Python-3.12-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-teal.svg)](https://fastapi.tiangolo.com)
[![React 18](https://img.shields.io/badge/React-18.3-cyan.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-sky.svg)](https://tailwindcss.com)
[![Platform: Precision Oncology](https://img.shields.io/badge/Platform-Precision%20Oncology-emerald.svg)]()

> **CLINICAL DECISION SUPPORT NOTICE:**  
> **ONCOPROFILE AI** is an advanced clinical bioinformatics and precision oncology decision-support platform. All genomic alterations, transcriptomic gene expression values, and response prediction models are designed for research investigation and decision support. Suggested therapeutic pathways represent evidence-based hypotheses to assist multidisciplinary oncology tumor boards and certified specialists in evaluating targeted therapeutic options.

---

## 1. Executive Summary & Clinical Framework

Breast cancer (*Carcinoma mammae*) is not a uniform single disease, but a profoundly heterogeneous spectrum of distinct pathological entities defined by complex interactions among genomic alterations, transcriptomic gene expression programs, and clinical immunohistochemical (IHC) receptors.

This system demonstrates the complete precision oncology translation pipeline:
$$\text{Patient Sample} \longrightarrow \text{Multi-Omics Data} \longrightarrow \text{Data Processing} \longrightarrow \text{Molecular Features} \longrightarrow \text{Spatial Classification} \longrightarrow \text{Response Prediction} \longrightarrow \text{Personalized Strategy}$$

---

## 2. Multi-Omics Features & Biochemical Basis

The platform integrates two biological omics tiers and clinical IHC biomarkers:

### A. Genomics (Somatic Pathogenic Driver Alterations)
- **BRCA1 & BRCA2:** Tumor suppressors that govern Homologous Recombination (HR) repair of DNA double-strand breaks. Inactivation triggers genomic instability and creates targetable **synthetic lethality** upon PARP inhibition (e.g., olaparib, talazoparib) and platinum-agent hypersensitivity.
- **PIK3CA:** Encodes the p110α catalytic subunit of phosphatidylinositol 3-kinase. Activating mutations (helical domain E542K/E545K, kinase domain H1047R) stimulate the constitutive downstream AKT/mTOR survival pathway, bypassing endocrine inhibition and indicating eligibility for alpha-selective PI3K inhibitors (alpelisib) or AKT inhibitors (capivasertib).
- **TP53:** Classical guardian of the genome. Mutations abolish G1/S cell-cycle checkpoint arrest and pro-apoptotic signaling, leading to high chromosomal instability (prevalent in >80% of TNBC and >70% of HER2-enriched tumors).
- **ESR1:** Encodes Estrogen Receptor Alpha (ERα). Acquired mutations in the ligand-binding domain (LBD, e.g., Y537S, D538G) confer constitutive ligand-independent transcriptional activation, driving clinical resistance to standard aromatase inhibitors while remaining targetable with selective estrogen receptor degraders (SERDs, e.g., elacestrant).
- **HER2/ERBB2 Amplification:** Copy-number duplication of the receptor tyrosine kinase oncogene driving high mitotic signaling.

### B. Transcriptomics (Normalized mRNA Abundance in $\log_2(\text{TPM} + 1)$)
- **ESR1 Expression:** Quantifies functional estrogen receptor transcript density.
- **PGR Expression:** Progesterone receptor transcript; direct downstream target of ERα transcriptional activity, confirming an intact endocrine axis.
- **ERBB2 Expression:** Quantifies HER2 mRNA levels, distinguishing amplified states from baseline.
- **MKI67 Expression:** Nuclear marker expressed exclusively in active cell-cycle phases ($G_1, S, G_2, M$); correlates tightly with immunohistochemical proliferation index.
- **EGFR Expression:** Epidermal growth factor receptor; classic marker of basal-like triple-negative neoplasms.
- **BRCA1, BRCA2, PIK3CA Expressions:** Corroborating transcriptomic activity for somatic repair and signaling components.

### C. Clinical Immunohistochemical (IHC) Biomarkers
- **ER Status:** Positive / Negative
- **PR Status:** Positive / Negative
- **HER2 Status:** Positive / Negative (concordant with IHC 3+ or FISH gene amplification)
- **Ki-67 Index:** Proliferation fraction percentage ($4.0\% - 95.0\%$)
- **Age:** $30 - 82$ years
- **Disease Stage:** Stage I, Stage IIA, Stage IIB, Stage IIIA, Stage IIIB, Stage IV

---

## 3. Dataset Architecture & Benchmark Case (ONC-001)

The patient cohort contains **250 comprehensive multi-omics patient records** (`backend/data/synthetic_breast_cancer_omics.csv`) with biologically calibrated subtype distributions:
- **Luminal A ($\approx 40\%$):** $ER^+/PR^+$, $HER2^-$, low Ki-67 ($<20\%$), high *PIK3CA* mutation rate, indolent biology, highly responsive to endocrine therapy.
- **Luminal B ($\approx 25\%$):** $ER^+$, variable $PR$, elevated proliferation (Ki-67 $\ge 20\%$) or $HER2^+$, intermediate-to-high recurrence risk requiring combo therapies.
- **HER2-Enriched ($\approx 15\%$):** $ER^-/PR^-$, marked *ERBB2* mRNA/gene amplification, high *TP53* mutation prevalence, responsive to dual HER2 blockade (trastuzumab + pertuzumab).
- **Triple-Negative Breast Cancer / TNBC ($\approx 20\%$):** $ER^-/PR^-/HER2^-$, elevated *EGFR* and *MKI67*, high *TP53* and *BRCA1/2* variants, sensitive to platinum chemotherapy, immunotherapy (pembrolizumab), or PARP inhibitors.

### Reference Profile: Patient ONC-001
- **Patient ID:** `ONC-001`
- **Age / Stage:** 54 years / Stage IIA
- **Subtype:** Luminal A ($ER^+$ Positive, $PR^+$ Positive, $HER2^-$ Negative)
- **Ki-67 Proliferation Index:** $12.0\%$ (Indolent)
- **Genomic Variants:** *PIK3CA* Mutation (1), *TP53* Wild-Type (0), *BRCA1/2* Wild-Type (0), *ESR1* Wild-Type (0)
- **Transcriptomics:** High *ESR1* ($12.4$), High *PGR* ($10.8$), Low *ERBB2* ($6.1$), Low *MKI67* ($5.2$), Low *EGFR* ($4.8$)
- **Cluster Assignment:** Cluster 1 (Luminal-Low Proliferation Profile)
- **Predicted Response:** Likely responder ($72.9\%$ confidence)
- **Generated Treatment Strategy:** Standard endocrine backbone (Aromatase Inhibitors / Tamoxifen) + surveillance/eligibility for PI3K-alpha targeted therapy upon progression.

---

## 4. Machine Learning & Computational Architecture

```
                    [ 250 Multi-Omics Records ]
                                 │
           ┌─────────────────────┴─────────────────────┐
           ▼                                           ▼
[ Unsupervised Pipeline ]                   [ Supervised Pipeline ]
- 11 Feature Scaler (Z-Score)               - Stratified 80/20 Train/Test
- K-Means Clustering (k=4)                  - Random Forest (100 Trees, Depth 6)
- 2D Principal Component Analysis           - Probabilistic Response Class
- Cluster Centroid Fingerprinting           - Confusion Matrix & F1 Benchmarks
           │                                           │
           └─────────────────────┬─────────────────────┘
                                 ▼
              [ Rule-Based Strategy Engine (NCCN/ESMO) ]
                                 │
                                 ▼
             [ Individualized Precision Dossier ]
```

### Unsupervised Classification (K-Means & 2D PCA)
- Standardized Euclidean distance clustering over 11 molecular markers.
- **Cluster 1:** Luminal-Low Proliferation Profile (High *ESR1/PGR*, low Ki-67).
- **Cluster 2:** HER2-Driven Oncogenic Profile (High *ERBB2* expression & amplification).
- **Cluster 3:** Basal-like / Genomic Instability Profile (*EGFR/MKI67* high, *TP53/BRCA* mutated).
- **Cluster 4:** Luminal Proliferative / Intermediate Profile (Hormone-positive with elevated Ki-67 $\ge 20\%$).
- **Clinical Distinction:** Unsupervised machine-learning clusters represent exploratory mathematical groupings and are distinguished from standard-of-care clinical IHC/PAM50 diagnostic subtypes.

### Supervised Response Predictor (Random Forest)
- Multi-class output: `Likely responder`, `Intermediate response`, `Lower predicted response`.
- Evaluated on a 20% holdout test partition ($n=50$).
- Full transparency: Confusion matrix, Macro Precision, Recall, F1-Score, and Gini Feature Importances displayed directly in the user interface.

---

## 5. Technology Stack

- **Backend:** Python 3.12, FastAPI, SQLAlchemy ORM, SQLite, Pydantic v2, Scikit-learn, SciPy, NumPy, Pandas, Uvicorn.
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS (Pure Light Theme), Recharts, Lucide React icons.
- **Deployment:** Zero-config single-port hosting via FastAPI static mount (`http://localhost:8000`) or independent dual-port dev servers (`http://localhost:3000` + `http://localhost:8000`).

---

## 6. Installation & Execution Guide (Windows 11 CMD)

### Prerequisites
1. **Python 3.10+** (Python 3.12 verified)
2. **Node.js 18+** with `npm`

---

### Method A: One-Command Unified Launch (Recommended)
This starts the entire application (FastAPI backend + compiled React frontend) on a single port:

```cmd
cd ONCOPROFILE-AI
run_single_port.cmd
```
*Or via direct command line:*
```cmd
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
```
Open your browser at: **`http://localhost:8000`**

---

### Method B: Independent Development Servers (Dual Ports)

#### 1. Backend Server (Port 8000)
Open a Windows Command Prompt:
```cmd
cd ONCOPROFILE-AI
python -m pip install -r backend\requirements.txt
python backend\seed_db.py
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```
API Documentation (Swagger UI): **`http://localhost:8000/docs`**

#### 2. Frontend Development Server (Port 3000)
Open a second Windows Command Prompt:
```cmd
cd ONCOPROFILE-AI\frontend
npm.cmd install
npm.cmd run dev
```
Interactive UI: **`http://localhost:3000`**

---

### Verification Test Suite
Run the automated API test suite to verify all endpoints, database queries, and ML predictions:
```cmd
python backend\test_api.py
```

Expected output:
```
[ONCOPROFILE AI] ML Pipeline fitted successfully on 250 synthetic records.
[TEST 1/5] Health: online
[TEST 2/5] Total Patients: 250, Subtypes: ['Luminal A', 'Triple-Negative (TNBC)', 'HER2-enriched', 'Luminal B']
[TEST 3/5] Model Accuracy: 58.0%, Macro F1: 0.607
[TEST 4/5] ONC-001 Analysis:
           - Subtype: Luminal A
           - Cluster: Cluster 1: Luminal-Low Proliferation Profile
           - Predicted Response: Likely responder (72.9%)
           - Potential Pathways: ['Endocrine Backbone Therapy', 'PI3K/AKT/mTOR Targeted Pathway']
           - Stages count: 7
[TEST 5/5] Report retrieved successfully. Title: Luminal A Strategy Report

>>> ALL API VERIFICATION TESTS COMPLETED SUCCESSFULLY! <<<
```

---

## 7. Application Pages & Navigation

| Page | Module | Capabilities |
|---|---|---|
| **Dashboard** | Executive Analytics | Real-time cohort metrics, subtype donut chart, mutation frequencies, response breakdown, recent analyses. |
| **Patient Registry** | Cohort Directory | Search by ID, filter by subtype/stage, inspect omics profiles, add new patient profile modal. |
| **Omics Data** | Ingestion & QC | Drag-and-drop CSV upload, 22-column validation, duplicate detection, automated data quality score. |
| **Molecular Analysis** | Bioinformatics | Comparative transcriptomics box/bar charts, mutation rates, Pearson correlation matrix, feature importance. |
| **Patient Classification** | Unsupervised ML | K-Means ($k=4$), interactive 2D PCA scatter plot, cluster characteristics, heatmap matrix. |
| **Treatment Prediction** | Supervised ML | Interactive patient response inference, probability distribution, confusion matrix, model benchmarks. |
| **Personalized Strategy** | Precision Engine | 7-stage workflow stepper, targeted pathways, biochemical signaling justification, clinical guidance. |
| **Reports** | Clinical Dossier | Individual patient report, cohort summary, PDF export / print-ready view, full cohort CSV export. |
| **About** | Documentation | Platform mission, biological rationale, ML algorithms, UN Sustainable Development Goal 3. |

---

## 8. Alignment with UN Sustainable Development Goal 3

**Goal 3: Ensure healthy lives and promote well-being for all at all ages**  
- **Target 3.4:** By 2030, reduce by one-third premature mortality from non-communicable diseases through prevention and treatment.
- **Translational Relevance:** Breast cancer represents a primary global burden of cancer mortality. By replacing non-targeted chemotherapy with multi-omics biomarker-stratified precision oncology (such as evaluating PARP inhibitors in BRCA-mutated tumors, anti-HER2 blockade in ERBB2-amplified tumors, and alpelisib in PIK3CA-mutated HR+ tumors), clinical outcomes improve while averting ineffective toxicity.

---

## 9. Platform Verification

**System Status:** Operational  
**Repository Version:** 1.0.0
