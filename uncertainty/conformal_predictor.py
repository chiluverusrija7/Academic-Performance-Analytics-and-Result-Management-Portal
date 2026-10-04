"""
conformal_predictor.py
Split Conformal Prediction Engine for Temporal Academic Risk in EduInsight AI (Phase 4).

Implements:
- Split Conformal Classification using Probability-based Nonconformity Scores: s_i = 1 - P(y_i | x_i)
- Student-group-aware Train / Calibration / Test splitting (GroupShuffleSplit on student_id)
- Multi-checkpoint support (W4, W8, W12)
- Multi-significance levels (alpha = 0.10 -> 90% coverage, alpha = 0.05 -> 95% coverage)
- Finite-sample corrected empirical quantile calculation
- Structured uncertainty classification: CONFIDENT_RISK, CONFIDENT_SAFE, AMBIGUOUS
- Seamless integration with Phase 3 SHAP explainability
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import GroupShuffleSplit
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
import xgboost as xgb

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from uncertainty.uncertainty_metrics import compute_conformal_metrics, format_conformal_summary_table

DATA_DIR = os.path.join(BASE_DIR, "ml_data")
MODELS_DIR = os.path.join(BASE_DIR, "models")
PIPELINES_DIR = os.path.join(BASE_DIR, "pipelines")
RESULTS_DIR = os.path.join(BASE_DIR, "results")
REPORTS_DIR = os.path.join(BASE_DIR, "reports")

os.makedirs(RESULTS_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)

# Controlled vocabulary for uncertainty
STATUS_CONFIDENT_RISK = "CONFIDENT_RISK"
STATUS_CONFIDENT_SAFE = "CONFIDENT_SAFE"
STATUS_AMBIGUOUS = "AMBIGUOUS"


def build_preprocessing_pipeline(feature_cols):
    """Reconstructs the standard Phase 2 preprocessing pipeline."""
    categorical_cols = ["dept_code", "course_code", "admission_category", "fee_payment_status"]
    imputed_numerical_cols = [
        "previous_sgpa", "cumulative_cgpa_prior",
        "previous_attendance_pct", "previous_backlogs_count"
    ]
    standard_numerical_cols = [
        c for c in feature_cols 
        if c not in categorical_cols 
        and c not in imputed_numerical_cols 
        and c not in ["student_id", "cohort_entry_year", "semester_id", "academic_year", "target_risk"]
    ]

    cat_pipeline = Pipeline([
        ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])

    imputed_num_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    std_num_pipeline = Pipeline([
        ("scaler", StandardScaler())
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", cat_pipeline, [c for c in categorical_cols if c in feature_cols]),
            ("num_impute", imputed_num_pipeline, [c for c in imputed_numerical_cols if c in feature_cols]),
            ("num_std", std_num_pipeline, [c for c in standard_numerical_cols if c in feature_cols]),
        ],
        remainder="drop"
    )

    return preprocessor


class ConformalRiskPredictor:
    """
    Split Conformal Classifier for Early Academic Risk Prediction.
    """

    def __init__(self, checkpoints=("W4", "W8", "W12"), random_seed=42):
        self.checkpoints = [cp.upper() for cp in checkpoints]
        self.random_seed = random_seed
        self.models = {}
        self.calibration_scores = {}
        self.conformal_quantiles = {}  # {cp: {alpha: q_hat}}
        self.feature_cols_map = {}
        self.split_info = {}
        self.evaluation_results = []
        self.test_datasets = {}

    def _split_students(self, df):
        """
        Performs strict 3-way student-level group splitting:
        Total Students (300) -> 60% Train (180), 20% Calibration (60), 20% Test (60).
        """
        groups = df["student_id"].values
        y = df["target_risk"].values
        X = df.drop(columns=["target_risk"])

        # Outer split: 80% train+calib (240 students), 20% test (60 students)
        gss_outer = GroupShuffleSplit(n_splits=1, test_size=0.20, random_state=self.random_seed)
        train_calib_idx, test_idx = next(gss_outer.split(X, y, groups=groups))

        X_train_calib = X.iloc[train_calib_idx]
        y_train_calib = y[train_calib_idx]
        groups_train_calib = groups[train_calib_idx]

        # Inner split on train_calib: 75% train (180 students), 25% calib (60 students)
        gss_inner = GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=self.random_seed)
        train_sub_idx, calib_sub_idx = next(gss_inner.split(X_train_calib, y_train_calib, groups=groups_train_calib))

        train_idx = train_calib_idx[train_sub_idx]
        calib_idx = train_calib_idx[calib_sub_idx]

        train_students = set(groups[train_idx])
        calib_students = set(groups[calib_idx])
        test_students = set(groups[test_idx])

        # Verify zero student leakage across splits
        assert len(train_students.intersection(calib_students)) == 0, "Train-Calibration student overlap detected!"
        assert len(train_students.intersection(test_students)) == 0, "Train-Test student overlap detected!"
        assert len(calib_students.intersection(test_students)) == 0, "Calibration-Test student overlap detected!"

        return train_idx, calib_idx, test_idx, train_students, calib_students, test_students

    def fit_and_calibrate(self, alphas=(0.10, 0.05)):
        """
        Fits base XGBoost pipeline on training partition, computes nonconformity
        scores on calibration partition, and calculates conformal quantiles.
        """
        self.alphas = alphas
        all_metrics_rows = []

        for cp in self.checkpoints:
            data_path = os.path.join(DATA_DIR, f"checkpoint_{cp.lower()}.csv")
            if not os.path.exists(data_path):
                raise FileNotFoundError(f"Checkpoint data not found: {data_path}")

            df = pd.read_csv(data_path)
            meta_cols = ["student_id", "cohort_entry_year", "semester_id", "academic_year", "target_risk"]
            feature_cols = [c for c in df.columns if c not in meta_cols]
            self.feature_cols_map[cp] = feature_cols

            train_idx, calib_idx, test_idx, tr_stu, cal_stu, te_stu = self._split_students(df)

            self.split_info[cp] = {
                "train_rows": len(train_idx), "train_students": len(tr_stu),
                "calib_rows": len(calib_idx), "calib_students": len(cal_stu),
                "test_rows": len(test_idx), "test_students": len(te_stu)
            }

            X_tr, y_tr = df.iloc[train_idx][feature_cols], df.iloc[train_idx]["target_risk"].values
            X_cal, y_cal = df.iloc[calib_idx][feature_cols], df.iloc[calib_idx]["target_risk"].values
            X_te, y_te = df.iloc[test_idx][feature_cols], df.iloc[test_idx]["target_risk"].values

            # Save full test set metadata for evaluation exports
            df_test = df.iloc[test_idx].copy()

            # Build and train XGBoost pipeline
            preprocessor = build_preprocessing_pipeline(feature_cols)
            num_neg = (y_tr == 0).sum()
            num_pos = (y_tr == 1).sum()
            scale_pos_weight = num_neg / max(1, num_pos)

            model = xgb.XGBClassifier(
                n_estimators=150,
                max_depth=4,
                learning_rate=0.05,
                scale_pos_weight=scale_pos_weight,
                eval_metric="logloss",
                random_state=self.random_seed
            )

            pipeline = Pipeline([
                ("preprocessor", preprocessor),
                ("classifier", model)
            ])

            pipeline.fit(X_tr, y_tr)
            self.models[cp] = pipeline

            # -------------------------------------------------------------
            # Compute Nonconformity Scores on Calibration Set
            # Nonconformity score for binary classification: s_i = 1 - P(y_i | x_i)
            # -------------------------------------------------------------
            cal_probs = pipeline.predict_proba(X_cal)  # shape (n_cal, 2)
            n_cal = len(y_cal)

            # Extract probability assigned to the TRUE class y_i
            # P(y_i | x_i) = cal_probs[i, y_cal[i]]
            p_true = cal_probs[np.arange(n_cal), y_cal]
            nonconformity_scores = 1.0 - p_true
            self.calibration_scores[cp] = nonconformity_scores

            # -------------------------------------------------------------
            # Calculate Conformal Quantile with Finite-Sample Correction
            # q_hat = ceil((n_cal + 1) * (1 - alpha)) / n_cal quantile
            # -------------------------------------------------------------
            self.conformal_quantiles[cp] = {}
            for alpha in alphas:
                # Finite sample corrected quantile level
                q_level = np.clip(np.ceil((n_cal + 1) * (1.0 - alpha)) / n_cal, 0.0, 1.0)
                # Compute empirical quantile (method='higher' gives exact finite-sample coverage guarantee)
                q_hat = float(np.quantile(nonconformity_scores, q_level, method="higher"))
                self.conformal_quantiles[cp][alpha] = q_hat

            # -------------------------------------------------------------
            # Evaluate on Held-out Test Set
            # -------------------------------------------------------------
            test_probs = pipeline.predict_proba(X_te)  # shape (n_te, 2)
            prob_risk_te = test_probs[:, 1]
            prob_safe_te = test_probs[:, 0]

            df_test["predicted_risk_prob"] = np.round(prob_risk_te, 4)
            df_test["point_prediction"] = np.where(prob_risk_te >= 0.50, "RISK", "SAFE")

            for alpha in alphas:
                q_hat = self.conformal_quantiles[cp][alpha]
                threshold_prob = 1.0 - q_hat

                prediction_sets = []
                uncertainty_statuses = []

                for i in range(len(y_te)):
                    p_safe = prob_safe_te[i]
                    p_risk = prob_risk_te[i]

                    # Candidate label included if 1 - P(y | x) <= q_hat <=> P(y | x) >= 1 - q_hat
                    cand_set = []
                    if p_safe >= threshold_prob:
                        cand_set.append("SAFE")
                    if p_risk >= threshold_prob:
                        cand_set.append("RISK")

                    # Handle rare empty set fallback to argmax class
                    if len(cand_set) == 0:
                        cand_set = ["RISK"] if p_risk >= p_safe else ["SAFE"]
                        status = STATUS_AMBIGUOUS
                    elif len(cand_set) == 2:
                        status = STATUS_AMBIGUOUS
                    elif cand_set == ["RISK"]:
                        status = STATUS_CONFIDENT_RISK
                    elif cand_set == ["SAFE"]:
                        status = STATUS_CONFIDENT_SAFE
                    else:
                        status = STATUS_AMBIGUOUS

                    prediction_sets.append(cand_set)
                    uncertainty_statuses.append(status)

                # Store column in df_test for exports
                col_prefix = f"alpha_{int(alpha*100)}"
                df_test[f"pred_set_{col_prefix}"] = [",".join(s) for s in prediction_sets]
                df_test[f"status_{col_prefix}"] = uncertainty_statuses

                # Compute metrics
                metrics = compute_conformal_metrics(y_te, prediction_sets, probs=prob_risk_te, alpha=alpha)
                metrics["checkpoint"] = cp
                metrics["conformal_quantile_q_hat"] = round(q_hat, 4)
                metrics["probability_inclusion_threshold"] = round(threshold_prob, 4)
                all_metrics_rows.append(metrics)

            # Save detailed test predictions CSV for this checkpoint
            self.test_datasets[cp] = df_test
            csv_out = os.path.join(RESULTS_DIR, f"conformal_{cp.lower()}_results.csv")
            export_cols = [
                "student_id", "semester_no", "target_risk", "predicted_risk_prob", "point_prediction",
                "pred_set_alpha_10", "status_alpha_10",
                "pred_set_alpha_5", "status_alpha_5"
            ]
            df_test[export_cols].to_csv(csv_out, index=False)

        # Save summary metrics table to results/conformal_summary.csv
        df_summary = format_conformal_summary_table(all_metrics_rows)
        # Reorder columns for readability
        col_order = [
            "checkpoint", "alpha", "target_coverage", "empirical_coverage", "coverage_gap",
            "risk_class_coverage", "safe_class_coverage", "avg_set_size",
            "ambiguity_rate_pct", "singleton_rate_pct", "empty_rate_pct",
            "conformal_quantile_q_hat", "probability_inclusion_threshold",
            "total_test_samples", "singleton_safe_count", "singleton_risk_count", "ambiguous_count"
        ]
        df_summary = df_summary[[c for c in col_order if c in df_summary.columns]]
        df_summary.to_csv(os.path.join(RESULTS_DIR, "conformal_summary.csv"), index=False)
        self.evaluation_results = all_metrics_rows

        return df_summary

    def predict_with_uncertainty(self, student_record, checkpoint="W12", alpha=0.10):
        """
        Generates point prediction, calibrated conformal prediction set,
        and controlled uncertainty status for a single student-semester observation.

        Parameters:
        - student_record: dict, Series, or DataFrame row
        - checkpoint: "W4", "W8", or "W12"
        - alpha: significance level (default 0.10 for nominal 90% coverage)

        Returns:
        - structured dict with prediction and uncertainty information
        """
        cp = checkpoint.upper()
        if cp not in self.models:
            # Auto-fit if not fitted yet
            self.fit_and_calibrate()

        pipeline = self.models[cp]
        feature_cols = self.feature_cols_map[cp]

        if isinstance(student_record, dict):
            df_row = pd.DataFrame([student_record])
        elif isinstance(student_record, pd.Series):
            df_row = pd.DataFrame([student_record.to_dict()])
        else:
            df_row = student_record.copy()

        student_id = str(df_row.get("student_id", ["UNKNOWN"]).values[0]) if "student_id" in df_row.columns else "UNKNOWN"
        semester_no = int(df_row.get("semester_no", [1]).values[0]) if "semester_no" in df_row.columns else 1

        # Extract features
        X_input = df_row[[c for c in feature_cols if c in df_row.columns]]

        # Predict probability
        probs = pipeline.predict_proba(X_input)[0]
        p_safe = float(probs[0])
        p_risk = float(probs[1])

        point_pred = "RISK" if p_risk >= 0.50 else "SAFE"

        # Conformal Threshold
        if alpha not in self.conformal_quantiles.get(cp, {}):
            # Recalculate quantile for custom alpha if needed
            n_cal = len(self.calibration_scores[cp])
            q_level = np.clip(np.ceil((n_cal + 1) * (1.0 - alpha)) / n_cal, 0.0, 1.0)
            q_hat = float(np.quantile(self.calibration_scores[cp], q_level, method="higher"))
        else:
            q_hat = self.conformal_quantiles[cp][alpha]

        threshold_prob = 1.0 - q_hat

        # Build prediction set
        prediction_set = []
        if p_safe >= threshold_prob:
            prediction_set.append("SAFE")
        if p_risk >= threshold_prob:
            prediction_set.append("RISK")

        # Fallback for empty set
        if len(prediction_set) == 0:
            prediction_set = ["RISK"] if p_risk >= p_safe else ["SAFE"]
            status = STATUS_AMBIGUOUS
        elif len(prediction_set) == 2:
            status = STATUS_AMBIGUOUS
        elif prediction_set == ["RISK"]:
            status = STATUS_CONFIDENT_RISK
        elif prediction_set == ["SAFE"]:
            status = STATUS_CONFIDENT_SAFE
        else:
            status = STATUS_AMBIGUOUS

        return {
            "student_id": student_id,
            "semester_no": semester_no,
            "checkpoint": cp,
            "risk_probability": round(p_risk, 4),
            "risk_percentage": round(p_risk * 100, 2),
            "point_prediction": point_pred,
            "conformal_prediction_set": prediction_set,
            "uncertainty_status": status,
            "alpha": float(alpha),
            "coverage_target": round(1.0 - alpha, 2),
            "conformal_quantile_threshold": round(q_hat, 4),
            "inclusion_prob_threshold": round(threshold_prob, 4)
        }

    def predict_with_uncertainty_and_explanation(self, student_record, checkpoint="W12", alpha=0.10, top_k=4):
        """
        Combines point prediction, conformal uncertainty set, and SHAP explainability.
        """
        from explainability.risk_explanation import generate_risk_explanation

        unc_result = self.predict_with_uncertainty(student_record, checkpoint=checkpoint, alpha=alpha)
        shap_result = generate_risk_explanation(student_record, checkpoint=checkpoint, top_k=top_k)

        combined = {
            **unc_result,
            "base_value": shap_result.get("base_value"),
            "risk_factors": shap_result.get("risk_factors", []),
            "protective_factors": shap_result.get("protective_factors", [])
        }

        return combined


# Global Singleton Explainer / Predictor
_CONFORMAL_ENGINE = None

def get_conformal_engine():
    global _CONFORMAL_ENGINE
    if _CONFORMAL_ENGINE is None:
        _CONFORMAL_ENGINE = ConformalRiskPredictor()
        _CONFORMAL_ENGINE.fit_and_calibrate()
    return _CONFORMAL_ENGINE


def predict_with_uncertainty(student_record, checkpoint="W12", alpha=0.10):
    """Module-level convenience function."""
    engine = get_conformal_engine()
    return engine.predict_with_uncertainty(student_record, checkpoint=checkpoint, alpha=alpha)


if __name__ == "__main__":
    print("Executing Phase 4 Conformal Prediction calibration & evaluation...")
    predictor = ConformalRiskPredictor()
    summary_df = predictor.fit_and_calibrate(alphas=(0.10, 0.05))
    print("\n--- Conformal Prediction Summary Table ---")
    print(summary_df.to_string(index=False))

    # Test single prediction
    df_sample = pd.read_csv(os.path.join(DATA_DIR, "checkpoint_w12.csv")).iloc[5]
    res = predictor.predict_with_uncertainty_and_explanation(df_sample, checkpoint="W12", alpha=0.10)
    print("\n--- Sample Uncertainty + SHAP Prediction ---")
    print(json.dumps(res, indent=2))
