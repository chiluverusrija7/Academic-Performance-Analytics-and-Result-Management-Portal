"""
shap_explainer.py
Global SHAP Explainer Module for EduInsight AI (Phase 3).

Integrates with Phase 2 XGBoost pipelines (W4, W8, W12) using shap.TreeExplainer.
Produces:
- Global feature rankings and mean absolute SHAP scores
- Global summary CSV reports: reports/shap_global_w{4,8,12}.csv
- Summary visualization plots: reports/figures/shap_w{4,8,12}_{global_bar,beeswarm}.png
- Temporal feature importance ranking transition analysis
"""

import os
import joblib
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend
import matplotlib.pyplot as plt
import shap

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "ml_data")
PIPELINES_DIR = os.path.join(BASE_DIR, "pipelines")
REPORTS_DIR = os.path.join(BASE_DIR, "reports")
FIGURES_DIR = os.path.join(REPORTS_DIR, "figures")

os.makedirs(FIGURES_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)


class AcademicRiskSHAPExplainer:
    """
    Manages SHAP TreeExplainer computations for EduInsight temporal risk pipelines.
    """

    def __init__(self, checkpoints=("W4", "W8", "W12")):
        self.checkpoints = checkpoints
        self.pipelines = {}
        self.explainers = {}
        self.feature_names = {}
        self.datasets = {}
        self.shap_values_dict = {}
        self.global_importance_dfs = {}

        self._load_pipelines_and_data()

    def _load_pipelines_and_data(self):
        """Loads serialized Phase 2 pipelines and corresponding checkpoint datasets."""
        for cp in self.checkpoints:
            pipe_path = os.path.join(PIPELINES_DIR, f"checkpoint_{cp.lower()}_pipeline.joblib")
            data_path = os.path.join(DATA_DIR, f"checkpoint_{cp.lower()}.csv")

            if not os.path.exists(pipe_path):
                raise FileNotFoundError(f"Serialized pipeline not found: {pipe_path}")
            if not os.path.exists(data_path):
                raise FileNotFoundError(f"Dataset not found: {data_path}")

            pipeline = joblib.load(pipe_path)
            df = pd.read_csv(data_path)

            self.pipelines[cp] = pipeline
            self.datasets[cp] = df

            # Extract transformed feature names
            preprocessor = pipeline.named_steps["preprocessor"]
            classifier = pipeline.named_steps["classifier"]

            meta_cols = ["student_id", "cohort_entry_year", "semester_id", "academic_year", "target_risk"]
            raw_feature_cols = [c for c in df.columns if c not in meta_cols]

            cat_cols = preprocessor.named_transformers_["cat"].named_steps["encoder"].get_feature_names_out().tolist()
            num_imp_cols = preprocessor.transformers_[1][2]
            num_std_cols = preprocessor.transformers_[2][2]
            all_feature_names = cat_cols + list(num_imp_cols) + list(num_std_cols)

            self.feature_names[cp] = all_feature_names
            self.explainers[cp] = shap.TreeExplainer(classifier)

    def compute_global_shap(self, checkpoint="W12"):
        """
        Computes SHAP values on the dataset for a specific checkpoint and saves CSV & figures.
        """
        if checkpoint not in self.checkpoints:
            raise ValueError(f"Checkpoint must be one of {self.checkpoints}")

        df = self.datasets[checkpoint]
        pipeline = self.pipelines[checkpoint]
        preprocessor = pipeline.named_steps["preprocessor"]
        explainer = self.explainers[checkpoint]
        feature_names = self.feature_names[checkpoint]

        meta_cols = ["student_id", "cohort_entry_year", "semester_id", "academic_year", "target_risk"]
        raw_feature_cols = [c for c in df.columns if c not in meta_cols]
        X_raw = df[raw_feature_cols]

        X_transformed = preprocessor.transform(X_raw)
        shap_explanation = explainer(X_transformed)

        # Store explanation
        self.shap_values_dict[checkpoint] = shap_explanation

        # Calculate Mean Absolute SHAP values
        shap_vals_matrix = shap_explanation.values
        mean_abs_shap = np.mean(np.abs(shap_vals_matrix), axis=0)

        df_global = pd.DataFrame({
            "feature": feature_names,
            "mean_abs_shap": mean_abs_shap
        }).sort_values(by="mean_abs_shap", ascending=False).reset_index(drop=True)

        df_global["rank"] = df_global.index + 1
        self.global_importance_dfs[checkpoint] = df_global

        # Save CSV
        csv_path = os.path.join(REPORTS_DIR, f"shap_global_{checkpoint.lower()}.csv")
        df_global.to_csv(csv_path, index=False)

        # Generate plots
        self._generate_plots(checkpoint, shap_explanation, X_transformed, feature_names, df_global)

        return df_global

    def _generate_plots(self, checkpoint, shap_explanation, X_transformed, feature_names, df_global):
        """Generates publication-quality SHAP global bar and beeswarm plots."""
        # 1. Global Bar Plot (Top 12 Features)
        top_k = min(12, len(df_global))
        top_df = df_global.head(top_k).iloc[::-1]  # Invert for horizontal bar

        plt.figure(figsize=(9, 6))
        bars = plt.barh(top_df["feature"], top_df["mean_abs_shap"], color="#0284c7", edgecolor="#0369a1", height=0.65)
        plt.xlabel("Mean Absolute SHAP Value (Average Impact on Model Risk Output)", fontsize=10, fontweight="bold")
        plt.title(f"EduInsight AI — Global Feature Importance ({checkpoint} Checkpoint)", fontsize=12, fontweight="bold", pad=12)
        plt.grid(axis="x", linestyle="--", alpha=0.3)
        plt.tight_layout()

        bar_path = os.path.join(FIGURES_DIR, f"shap_{checkpoint.lower()}_global_bar.png")
        plt.savefig(bar_path, dpi=200)
        plt.close()

        # 2. Beeswarm Plot
        plt.figure(figsize=(10, 6.5))
        # Create an Explanation object with clean feature names
        clean_exp = shap.Explanation(
            values=shap_explanation.values,
            base_values=shap_explanation.base_values,
            data=X_transformed,
            feature_names=feature_names
        )
        shap.plots.beeswarm(clean_exp, max_display=12, show=False)
        plt.title(f"EduInsight AI — SHAP Summary Beeswarm Plot ({checkpoint} Checkpoint)", fontsize=12, fontweight="bold", pad=12)
        plt.tight_layout()

        beeswarm_path = os.path.join(FIGURES_DIR, f"shap_{checkpoint.lower()}_beeswarm.png")
        plt.savefig(beeswarm_path, dpi=200)
        plt.close()

    def run_all_checkpoints(self):
        """Executes global SHAP computation across W4, W8, and W12."""
        for cp in self.checkpoints:
            self.compute_global_shap(cp)

    def get_temporal_comparison_table(self):
        """Builds a comparative ranking table across W4, W8, and W12."""
        if not all(cp in self.global_importance_dfs for cp in self.checkpoints):
            self.run_all_checkpoints()

        w4_df = self.global_importance_dfs["W4"].set_index("feature")
        w8_df = self.global_importance_dfs["W8"].set_index("feature")
        w12_df = self.global_importance_dfs["W12"].set_index("feature")

        all_features = sorted(list(set(w4_df.index).union(w8_df.index).union(w12_df.index)))
        rows = []
        for feat in all_features:
            r4 = w4_df.loc[feat, "rank"] if feat in w4_df.index else "N/A"
            r8 = w8_df.loc[feat, "rank"] if feat in w8_df.index else "N/A"
            r12 = w12_df.loc[feat, "rank"] if feat in w12_df.index else "N/A"

            # Use lowest valid rank as sort priority
            valid_ranks = [r for r in [r4, r8, r12] if isinstance(r, (int, float, np.integer, np.floating))]
            min_rank = min(valid_ranks) if valid_ranks else 999

            rows.append({
                "feature": feat,
                "W4 Rank": r4,
                "W8 Rank": r8,
                "W12 Rank": r12,
                "_min_rank": min_rank
            })

        comp_df = pd.DataFrame(rows).sort_values(by="_min_rank").drop(columns=["_min_rank"]).reset_index(drop=True)
        return comp_df


if __name__ == "__main__":
    print("Running Global SHAP Explainer across all checkpoints...")
    explainer = AcademicRiskSHAPExplainer()
    explainer.run_all_checkpoints()
    comp_df = explainer.get_temporal_comparison_table()
    print("\nTop 15 Temporal Feature Ranking Transition:")
    print(comp_df.head(15).to_string(index=False))
    print("\nGlobal SHAP Analysis complete!")
