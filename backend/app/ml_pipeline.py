import numpy as np
import pandas as pd
from scipy.cluster.vq import kmeans2, vq
from sklearn.decomposition import PCA
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix

class KMeansClusterer:
    """
    Robust K-Means clustering implementation utilizing SciPy vector quantization.
    Avoids restricted DLL issues in enterprise/Windows Application Control environments.
    """
    def __init__(self, n_clusters=4, random_state=42, iter=30):
        self.n_clusters = n_clusters
        self.random_state = random_state
        self.iter = iter
        self.cluster_centers_ = None

    def fit_predict(self, X: np.ndarray) -> np.ndarray:
        np.random.seed(self.random_state)
        self.cluster_centers_, labels = kmeans2(X, self.n_clusters, iter=self.iter, minit="points")
        return labels

    def predict(self, X: np.ndarray) -> np.ndarray:
        labels, _ = vq(X, self.cluster_centers_)
        return labels

FEATURE_COLS_CLUSTER = [
    "esr1_expression",
    "pgr_expression",
    "erbb2_expression",
    "mki67_expression",
    "egfr_expression",
    "brca1_expression",
    "brca2_expression",
    "pik3ca_expression",
    "pik3ca_mutation",
    "tp53_mutation",
    "her2_amplification",
]

FEATURE_COLS_PREDICT = [
    "age",
    "ki67_percent",
    "brca1_mutation",
    "brca2_mutation",
    "pik3ca_mutation",
    "tp53_mutation",
    "esr1_mutation",
    "her2_amplification",
    "esr1_expression",
    "pgr_expression",
    "erbb2_expression",
    "mki67_expression",
    "egfr_expression",
    "brca1_expression",
    "brca2_expression",
    "pik3ca_expression",
]

CLUSTER_NAMES = {
    0: "Cluster 1: Luminal-Low Proliferation Profile",
    1: "Cluster 2: HER2-Driven Oncogenic Profile",
    2: "Cluster 3: Basal-like / Genomic Instability Profile",
    3: "Cluster 4: Luminal Proliferative / Intermediate Profile"
}

CLUSTER_DESCRIPTIONS = {
    0: "Enriched for ESR1/PGR overexpression, low MKI67 proliferation index, and moderate PIK3CA activating variants.",
    1: "Characterized by high ERBB2 (HER2) transcript levels and amplification, elevated TP53 alterations, and distinct receptor tyrosine kinase activation.",
    2: "Basal-like expression pattern with elevated EGFR and MKI67, suppressed hormone receptors, and high frequency of TP53 and BRCA1/2 variants.",
    3: "Hormone receptor positive with moderate-to-high proliferation (Ki-67 >= 20%), heterogeneous PGR expression, and variable genomic alterations."
}

class MLPipeline:
    def __init__(self):
        self.scaler_cluster = StandardScaler()
        self.kmeans = KMeansClusterer(n_clusters=4, random_state=42)
        self.pca = PCA(n_components=2, random_state=42)
        
        self.scaler_predict = StandardScaler()
        self.rf_classifier = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42, class_weight="balanced")
        
        self.classes_ = ["Likely responder", "Intermediate response", "Lower predicted response"]
        self.metrics_ = {}
        self.cluster_summaries_ = []
        self.cluster_mapping_ = {}
        self.is_fitted = False
        self.pca_variance_ratio_ = [0.0, 0.0]

    def fit(self, df: pd.DataFrame):
        # 1. Cluster fitting
        X_clust = df[FEATURE_COLS_CLUSTER].copy()
        X_clust_scaled = self.scaler_cluster.fit_transform(X_clust)
        cluster_labels = self.kmeans.fit_predict(X_clust_scaled)
        
        # PCA projection
        pca_coords = self.pca.fit_transform(X_clust_scaled)
        self.pca_variance_ratio_ = [round(float(v) * 100, 1) for v in self.pca.explained_variance_ratio_]
        
        df_clustered = df.copy()
        df_clustered["cluster"] = cluster_labels
        df_clustered["pca_x"] = pca_coords[:, 0]
        df_clustered["pca_y"] = pca_coords[:, 1]
        
        # Map clusters to biologically interpretable names
        c_means = df_clustered.groupby("cluster")[["esr1_expression", "erbb2_expression", "mki67_expression"]].mean()
        
        cluster_map = {}
        used = set()
        
        # Her2 cluster: highest erbb2
        her2_c = int(c_means["erbb2_expression"].idxmax())
        cluster_map[her2_c] = (1, CLUSTER_NAMES[1])
        used.add(her2_c)
        
        # Basal cluster: highest mki67 among remaining
        rem_indices = [i for i in c_means.index if i not in used]
        basal_c = int(c_means.loc[rem_indices, "mki67_expression"].idxmax())
        cluster_map[basal_c] = (2, CLUSTER_NAMES[2])
        used.add(basal_c)
        
        # Luminal low vs high proliferation
        rem = [c for c in range(4) if c not in used]
        if len(rem) == 2:
            if c_means.loc[rem[0], "mki67_expression"] < c_means.loc[rem[1], "mki67_expression"]:
                lum_low, lum_high = rem[0], rem[1]
            else:
                lum_low, lum_high = rem[1], rem[0]
            cluster_map[lum_low] = (0, CLUSTER_NAMES[0])
            cluster_map[lum_high] = (3, CLUSTER_NAMES[3])
        else:
            for i in range(4):
                if i not in cluster_map:
                    cluster_map[i] = (i, CLUSTER_NAMES[i])
        
        self.cluster_mapping_ = cluster_map
        
        # Compute cluster summaries
        self.cluster_summaries_ = []
        for orig_c, (std_id, name) in sorted(self.cluster_mapping_.items(), key=lambda x: x[1][0]):
            subset = df_clustered[df_clustered["cluster"] == orig_c]
            prevalent = subset["molecular_subtype"].mode()[0] if len(subset) > 0 else "Mixed"
            mean_exprs = {col: round(float(subset[col].mean()), 2) for col in FEATURE_COLS_CLUSTER if "expression" in col}
            mut_rates = {col: round(float(subset[col].mean() * 100), 1) for col in FEATURE_COLS_CLUSTER if "mutation" in col or "amplification" in col}
            
            self.cluster_summaries_.append({
                "cluster_id": std_id + 1,
                "cluster_name": name,
                "patient_count": int(len(subset)),
                "prevalent_subtype": prevalent,
                "key_characteristics": [
                    CLUSTER_DESCRIPTIONS[std_id],
                    f"Dominant IHC subtype alignment: {prevalent} ({len(subset[subset['molecular_subtype'] == prevalent])}/{len(subset)} patients)",
                    f"Mean Ki-67 index: {subset['ki67_percent'].mean():.1f}%",
                    f"TP53 variant prevalence: {subset['tp53_mutation'].mean()*100:.1f}%"
                ],
                "mean_expressions": mean_exprs,
                "mutation_rates": mut_rates
            })

        # 2. Random Forest Response Predictor
        X_pred = df[FEATURE_COLS_PREDICT].copy()
        y_pred = df["treatment_response"].values
        
        X_train, X_test, y_train, y_test = train_test_split(
            X_pred, y_pred, test_size=0.20, random_state=42, stratify=y_pred
        )
        
        X_train_scaled = self.scaler_predict.fit_transform(X_train)
        X_test_scaled = self.scaler_predict.transform(X_test)
        
        self.rf_classifier.fit(X_train_scaled, y_train)
        
        y_test_pred = self.rf_classifier.predict(X_test_scaled)
        
        acc = float(accuracy_score(y_test, y_test_pred))
        p_mac, r_mac, f1_mac, _ = precision_recall_fscore_support(y_test, y_test_pred, average="macro", zero_division=0)
        p_wgt, r_wgt, f1_wgt, _ = precision_recall_fscore_support(y_test, y_test_pred, average="weighted", zero_division=0)
        
        unique_labels = ["Likely responder", "Intermediate response", "Lower predicted response"]
        self.classes_ = unique_labels
        cm = confusion_matrix(y_test, y_test_pred, labels=unique_labels).tolist()
        
        importances = self.rf_classifier.feature_importances_
        feat_imp_list = [
            {"feature": f, "importance": round(float(imp), 4), "percentage": round(float(imp * 100), 2)}
            for f, imp in sorted(zip(FEATURE_COLS_PREDICT, importances), key=lambda x: x[1], reverse=True)
        ]
        
        self.metrics_ = {
            "model_name": "Random Forest Multi-Omics Response Classifier (Precision Oncology Benchmark)",
            "accuracy": round(acc, 4),
            "precision_macro": round(float(p_mac), 4),
            "recall_macro": round(float(r_mac), 4),
            "f1_macro": round(float(f1_mac), 4),
            "f1_weighted": round(float(f1_wgt), 4),
            "confusion_matrix": cm,
            "classes": unique_labels,
            "feature_importances": feat_imp_list,
            "disclaimer": "Metrics evaluated on a stratified 20% hold-out test set of multi-omics cohort data. Demonstrates internal classification consistency across validated biomarker profiles."
        }
        
        self.is_fitted = True
        return df_clustered

    def assign_cluster(self, patient_data: dict) -> dict:
        row_df = pd.DataFrame([patient_data])[FEATURE_COLS_CLUSTER]
        scaled = self.scaler_cluster.transform(row_df)
        raw_cluster = int(self.kmeans.predict(scaled)[0])
        pca_coords = self.pca.transform(scaled)[0]
        
        std_id, name = self.cluster_mapping_.get(raw_cluster, (raw_cluster, CLUSTER_NAMES.get(raw_cluster, f"Cluster {raw_cluster+1}")))
        
        return {
            "cluster_id": std_id + 1,
            "cluster_name": name,
            "pca_x": round(float(pca_coords[0]), 3),
            "pca_y": round(float(pca_coords[1]), 3)
        }

    def predict_response(self, patient_data: dict) -> dict:
        row_df = pd.DataFrame([patient_data])[FEATURE_COLS_PREDICT]
        scaled = self.scaler_predict.transform(row_df)
        pred_label = self.rf_classifier.predict(scaled)[0]
        probs = self.rf_classifier.predict_proba(scaled)[0]
        
        prob_dict = {
            cls_name: round(float(prob), 4)
            for cls_name, prob in zip(self.rf_classifier.classes_, probs)
        }
        
        confidence = float(max(probs))
        
        return {
            "predicted_response": str(pred_label),
            "response_confidence": round(confidence, 4),
            "response_probabilities": prob_dict
        }

pipeline = MLPipeline()
