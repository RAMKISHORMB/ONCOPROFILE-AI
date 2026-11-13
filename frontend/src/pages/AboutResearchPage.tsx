import React from 'react';
import {
  Dna,
  Cpu,
  Heart,
  AlertTriangle,
  Award
} from 'lucide-react';

export const AboutResearchPage: React.FC = () => {
  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      {/* Title Header */}
      <div>
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
            Platform Documentation
          </span>
          <span className="text-xs text-slate-400">Precision Oncology Decision-Support Architecture</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          About ONCOPROFILE AI &amp; Scientific Methodology
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Theoretical architecture, biochemical rationale, machine-learning formulations, and global healthcare alignment.
        </p>
      </div>

      {/* 1. Project Objective */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
        <div className="flex items-center space-x-2.5 text-teal-700 font-bold text-sm">
          <Award className="w-5 h-5" />
          <span>1. Platform Mission &amp; Translational Framework</span>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed">
          <strong>ONCOPROFILE AI</strong> is an advanced clinical bioinformatics platform designed to analyze multidimensional patient molecular profiles, identify discrete molecular profiles, and propose personalized treatment pathways based on biomarker guidelines.
        </p>
        <div className="p-4 bg-slate-50 border-l-4 border-teal-600 rounded-r-xl text-xs text-slate-800 leading-relaxed font-medium">
          The system operationalizes an end-to-end translational precision oncology continuum:
          <br />
          <span className="font-semibold text-slate-900">
            Patient Sample &rarr; Multi-Omics Data Ingestion &rarr; Data Preprocessing &rarr; Molecular Feature Extraction &rarr; Spatial Classification (K-Means/PCA) &rarr; Response Inference (Random Forest) &rarr; Targeted Treatment Strategy.
          </span>
        </div>
      </div>

      {/* 2. Multi-Omics Methodology */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center space-x-2.5 text-teal-700 font-bold text-sm">
          <Dna className="w-5 h-5" />
          <span>2. Dual Multi-Omics Approaches &amp; Biological Features</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Breast cancer (*Carcinoma mammae*) exhibits marked molecular heterogeneity driven by genomic sequence alterations and transcriptomic dysregulation. ONCOPROFILE AI integrates two biological omics tiers and clinical IHC biomarkers:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 text-xs block">Genomic Alteration Layer (DNA Sequencing):</span>
            <ul className="space-y-1.5 text-slate-600">
              <li><strong>BRCA1 &amp; BRCA2:</strong> Tumor suppressor genes mediating homologous recombination double-strand break repair. Deleterious variants confer synthetic lethality upon PARP inhibition.</li>
              <li><strong>PIK3CA:</strong> Encodes p110α catalytic subunit of PI3K. Activating mutations (E542K, E545K, H1047R) stimulate AKT/mTOR survival cascades.</li>
              <li><strong>TP53:</strong> Guardian of the genome; inactivating missense mutations trigger widespread chromosomal instability.</li>
              <li><strong>ESR1:</strong> Encodes ERα; ligand-binding domain mutations (Y537S, D538G) cause constitutive ligand-independent resistance to aromatase inhibitors.</li>
              <li><strong>HER2 (ERBB2):</strong> Receptor tyrosine kinase oncogenic gene copy number amplification.</li>
            </ul>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 text-xs block">Transcriptomic Expression Layer (mRNA TPM):</span>
            <ul className="space-y-1.5 text-slate-600">
              <li><strong>ESR1 expression:</strong> Quantifies estrogen receptor signaling dependency.</li>
              <li><strong>PGR expression:</strong> Progesterone receptor; downstream indicator of functional ER signaling.</li>
              <li><strong>ERBB2 expression:</strong> Quantitative transcript abundance of HER2 receptor.</li>
              <li><strong>MKI67 expression:</strong> Cellular proliferation index; fraction in active cell cycle.</li>
              <li><strong>EGFR expression:</strong> Biomarker for basal-like/triple-negative phenotypes.</li>
              <li><strong>BRCA1, BRCA2 &amp; PIK3CA expressions:</strong> Transcript abundance profiles across metabolic cascades.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Machine Learning Methodology */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center space-x-2.5 text-teal-700 font-bold text-sm">
          <Cpu className="w-5 h-5" />
          <span>3. Machine Learning Architectures &amp; Mathematical Formulations</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200 space-y-2">
            <span className="font-bold text-teal-950 text-xs block">Unsupervised K-Means Spatial Clustering:</span>
            <p className="text-slate-700 leading-relaxed">
              Standardized Euclidean feature vectors across 11 normalized molecular dimensions are clustered into k=4 centroids using Lloyd's algorithm:
            </p>
            <p className="font-mono text-[11px] bg-white p-2 rounded border border-teal-200 text-teal-900">
              argmin Σ ||x_i - μ_j||² for j in (1..4)
            </p>
            <p className="text-slate-600 text-[11px]">
              Principal Component Analysis (PCA) maps the high-dimensional space into 2 orthogonal eigenvectors explaining &gt;60% of total cohort variance.
            </p>
          </div>

          <div className="p-4 bg-sky-50/60 rounded-xl border border-sky-200 space-y-2">
            <span className="font-bold text-sky-950 text-xs block">Supervised Random Forest Classifier:</span>
            <p className="text-slate-700 leading-relaxed">
              An ensemble of 100 decorrelated decision trees (max depth 6) trained on stratified 80/20 train/test partitions predicting therapeutic response:
            </p>
            <p className="font-mono text-[11px] bg-white p-2 rounded border border-sky-200 text-sky-900">
              P(c|x) = (1/B) Σ I(T_b(x) = c)
            </p>
            <p className="text-slate-600 text-[11px]">
              Class weight balancing prevents bias across response labels while evaluating Gini feature importances.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Sustainable Development Goal 3 */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6 shadow-xs space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-emerald-950 tracking-tight">
              UN Sustainable Development Goal 3: Good Health and Well-Being
            </h3>
            <p className="text-xs text-emerald-800 font-medium">Target 3.4: Reduce premature mortality from non-communicable diseases</p>
          </div>
        </div>
        <p className="text-xs text-emerald-900/90 leading-relaxed">
          Breast cancer is the most frequently diagnosed malignant neoplasm globally. Standardized non-targeted chemotherapy regimens often inflict severe systemic toxicity with suboptimal response rates in discordant subtypes. By integrating genomic and transcriptomic signatures, precision oncology decision support tools like <strong>ONCOPROFILE AI</strong> advance <strong>SDG Target 3.4</strong> by matching high-risk profiles to actionable targeted therapies, mitigating overtreatment, and maximizing durable therapeutic efficacy.
        </p>
      </div>

      {/* 5. Scientific Limitations */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3 text-xs">
        <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>5. Clinical Governance &amp; Model Limitations</span>
        </div>
        <ul className="space-y-2 text-slate-700 leading-relaxed">
          <li className="flex items-start space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0"></span>
            <span><strong>Decision Support Framework:</strong> Machine learning response classifications and potential treatment pathways are designed as decision-support hypotheses to assist specialized clinicians.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0"></span>
            <span><strong>Unsupervised Clusters vs. Clinical Subtypes:</strong> K-Means clusters reflect exploratory topological clustering, whereas IHC/PAM50 subtypes represent established standard-of-care criteria.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0"></span>
            <span><strong>Multidisciplinary Verification:</strong> All therapeutic suggestions require verification by certified medical oncologists and multidisciplinary tumor boards based on full histological staging.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
