"""
risk_explanation.py
Local Instance-Level SHAP Explanation Module for EduInsight AI (Phase 3).

Provides:
- generate_risk_explanation(student_record, checkpoint, top_k)
- Automated extraction of representative student case studies (TP, TN, FP, FN, Recovery, Decline)
- Serialization of sample local explanations to results/sample_local_explanations.json
- Strict non-causal natural language interpretations derived directly from true SHAP signs.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
import shap

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "ml_data")
PIPELINES_DIR = os.path.join(BASE_DIR, "pipelines")
RESULTS_DIR = os.path.join(BASE_DIR, "results")

os.makedirs(RESULTS_DIR, exist_ok=True)

# Cache explainers and pipelines for high inference speed
_PIPELINES_CACHE = {}
_EXPLAINERS_CACHE = {}
_FEATURE_NAMES_CACHE = {}


def _get_pipeline_and_explainer(checkpoint="W12"):
    """Loads and caches the model pipeline, explainer, and feature names for a checkpoint."""
    cp_upper = checkpoint.upper()
    if cp_upper not in _PIPELINES_CACHE:
        pipe_path = os.path.join(PIPELINES_DIR, f"checkpoint_{cp_upper.lower()}_pipeline.joblib")
        if not os.path.exists(pipe_path):
            raise FileNotFoundError(f"Pipeline not found: {pipe_path}")

        pipeline = joblib.load(pipe_path)
        preprocessor = pipeline.named_steps["preprocessor"]
        classifier = pipeline.named_steps["classifier"]

        cat_cols = preprocessor.named_transformers_["cat"].named_steps["encoder"].get_feature_names_out().tolist()
        num_imp_cols = preprocessor.transformers_[1][2]
        num_std_cols = preprocessor.transformers_[2][2]
        all_feature_names = cat_cols + list(num_imp_cols) + list(num_std_cols)

        explainer = shap.TreeExplainer(classifier)

        _PIPELINES_CACHE[cp_upper] = pipeline
        _EXPLAINERS_CACHE[cp_upper] = explainer
        _FEATURE_NAMES_CACHE[cp_upper] = all_feature_names

    return _PIPELINES_CACHE[cp_upper], _EXPLAINERS_CACHE[cp_upper], _FEATURE_NAMES_CACHE[cp_upper]


def _format_human_readable_interpretation(feature_name, actual_value, shap_val, direction):
    """Generates strictly non-causal explanations grounded in empirical SHAP values."""
    sign_str = f"+{shap_val:.3f}" if shap_val > 0 else f"{shap_val:.3f}"

    if "low_scoring_subjects" in feature_name:
        if direction == "risk_increasing":
            return f"Having {actual_value} subject(s) below the 50% internal mark benchmark contributed positively ({sign_str}) toward higher predicted academic risk."
        else:
            return f"Having few/no failing internal assessment subjects ({actual_value}) served as an indicator ({sign_str}) reducing predicted risk."

    elif "internal_marks_avg" in feature_name:
        if direction == "risk_increasing":
            return f"An internal assessment average of {actual_value}% contributed positively ({sign_str}) to the model's elevated risk prediction."
        else:
            return f"A strong internal assessment average of {actual_value}% acted as a protective indicator ({sign_str}) reducing predicted risk."

    elif "attendance_pct" in feature_name:
        if direction == "risk_increasing":
            return f"Attendance standing of {actual_value}% contributed positively ({sign_str}) toward the model's risk score."
        else:
            return f"Consistently strong attendance of {actual_value}% acted as a protective indicator ({sign_str}) lowering predicted risk."

    elif "attendance_change" in feature_name or "marks_change" in feature_name or "performance_trend" in feature_name:
        if direction == "risk_increasing":
            return f"A downward trajectory delta ({actual_value}) contributed positively ({sign_str}) to the model's risk estimation."
        else:
            return f"A positive trajectory progression ({actual_value}) served as a protective signal ({sign_str}) lowering predicted risk."

    elif "previous_sgpa" in feature_name or "cumulative_cgpa_prior" in feature_name:
        if direction == "risk_increasing":
            return f"Prior academic performance ({actual_value} GPA) contributed positively ({sign_str}) toward predicted risk."
        else:
            return f"Strong prior cumulative academic standing ({actual_value} GPA) served as a protective factor ({sign_str})."

    elif "backlogs" in feature_name:
        if direction == "risk_increasing":
            return f"Accumulated prior backlog count ({actual_value}) contributed positively ({sign_str}) toward higher predicted risk."
        else:
            return f"Clean prior record with zero backlogs ({actual_value}) reduced predicted risk ({sign_str})."

    else:
        # Generic non-causal template
        if direction == "risk_increasing":
            return f"Feature '{feature_name}' (value: {actual_value}) contributed positively ({sign_str}) toward higher predicted risk."
        else:
            return f"Feature '{feature_name}' (value: {actual_value}) contributed negatively ({sign_str}) toward lower predicted risk."


def generate_risk_explanation(student_record, checkpoint="W12", top_k=5):
    """
    Generates a complete, verifiable local SHAP explanation for a single student observation.

    Parameters:
    - student_record: dict, pandas Series, or single-row DataFrame.
    - checkpoint: "W4", "W8", or "W12".
    - top_k: number of top risk and protective factors to return.

    Returns:
    - dict matching EduInsight explainability specifications.
    """
    pipeline, explainer, feature_names = _get_pipeline_and_explainer(checkpoint)
    preprocessor = pipeline.named_steps["preprocessor"]

    if isinstance(student_record, dict):
        df_row = pd.DataFrame([student_record])
    elif isinstance(student_record, pd.Series):
        df_row = pd.DataFrame([student_record.to_dict()])
    else:
        df_row = student_record.copy()

    student_id = str(df_row.get("student_id", ["UNKNOWN"]).values[0]) if "student_id" in df_row.columns else "UNKNOWN"
    semester_no = int(df_row.get("semester_no", [1]).values[0]) if "semester_no" in df_row.columns else 1

    # Extract raw feature columns expected by preprocessor
    meta_cols = ["student_id", "cohort_entry_year", "semester_id", "academic_year", "target_risk"]
    raw_feature_cols = [c for c in df_row.columns if c not in meta_cols]
    X_raw = df_row[raw_feature_cols]

    # Preprocessing
    X_trans = preprocessor.transform(X_raw)

    # Predict Risk Probability
    prob = float(pipeline.predict_proba(X_raw)[0, 1])

    # Assign Risk Category based on standard institutional thresholds
    if prob >= 0.65:
        risk_class = "HIGH"
    elif prob >= 0.35:
        risk_class = "MEDIUM"
    else:
        risk_class = "LOW"

    # Compute Local SHAP Explanation
    shap_res = explainer(X_trans)
    shap_vals = shap_res.values[0]
    base_val = float(explainer.expected_value)

    # Map raw / transformed values back to readable format
    factors = []
    for feat_name, s_val in zip(feature_names, shap_vals):
        # Try to find corresponding raw column value
        raw_val = None
        for col in raw_feature_cols:
            if col in feat_name:
                raw_val = df_row[col].values[0]
                break

        if raw_val is None:
            # For one-hot encoded flags
            raw_val = 1 if feat_name in df_row.values else 0

        # Handle NaN and numpy scalar types for display and JSON serialization
        if pd.isna(raw_val):
            val_display = "None (Sem 1)"
        elif isinstance(raw_val, (np.floating, float)):
            val_display = round(float(raw_val), 2)
        elif isinstance(raw_val, (np.integer, int)):
            val_display = int(raw_val)
        elif isinstance(raw_val, (np.bool_, bool)):
            val_display = bool(raw_val)
        else:
            val_display = str(raw_val)

        direction = "risk_increasing" if s_val > 0 else "risk_reducing"
        interp = _format_human_readable_interpretation(feat_name, val_display, s_val, direction)

        factors.append({
            "feature": feat_name,
            "actual_value": val_display,
            "shap_value": round(float(s_val), 4),
            "direction": direction,
            "interpretation": interp,
            "_abs_shap": abs(float(s_val))
        })

    # Sort and separate factors
    risk_factors = [f for f in sorted(factors, key=lambda x: x["shap_value"], reverse=True) if f["shap_value"] > 0][:top_k]
    protective_factors = [f for f in sorted(factors, key=lambda x: x["shap_value"], reverse=False) if f["shap_value"] < 0][:top_k]

    # Clean temporary sorting key
    for f in risk_factors + protective_factors:
        f.pop("_abs_shap", None)

    return {
        "student_id": student_id,
        "semester_no": semester_no,
        "checkpoint": checkpoint.upper(),
        "risk_probability": round(prob, 4),
        "risk_percentage": round(prob * 100, 2),
        "risk_class": risk_class,
        "base_value": round(base_val, 4),
        "risk_factors": risk_factors,
        "protective_factors": protective_factors
    }


def select_representative_cases(checkpoint="W12"):
    """
    Selects 6 representative empirical cases:
    1. True Positive (High Risk correctly predicted)
    2. True Negative (Low Risk correctly predicted)
    3. False Positive (Model flagged risk, student succeeded)
    4. False Negative (Model missed risk, student failed)
    5. Recovery Trajectory (Student struggled early, recovered, succeeded)
    6. Declining Trajectory (Student started strong, declined, suffered failure)
    """
    pipeline, explainer, feature_names = _get_pipeline_and_explainer(checkpoint)
    df = pd.read_csv(os.path.join(DATA_DIR, f"checkpoint_{checkpoint.lower()}.csv"))

    meta_cols = ["student_id", "cohort_entry_year", "semester_id", "academic_year", "target_risk"]
    raw_feature_cols = [c for c in df.columns if c not in meta_cols]
    X_raw = df[raw_feature_cols]
    y_true = df["target_risk"].values

    probs = pipeline.predict_proba(X_raw)[:, 1]
    preds = (probs >= 0.50).astype(int)

    df["pred_prob"] = probs
    df["pred_class"] = preds

    # 1. True Positive (Actual = 1, Pred = 1, High Prob)
    tp_cands = df[(df["target_risk"] == 1) & (df["pred_class"] == 1)].sort_values(by="pred_prob", ascending=False)
    tp_row = tp_cands.iloc[0]

    # 2. True Negative (Actual = 0, Pred = 0, Low Prob)
    tn_cands = df[(df["target_risk"] == 0) & (df["pred_class"] == 0)].sort_values(by="pred_prob", ascending=True)
    tn_row = tn_cands.iloc[0]

    # 3. False Positive (Actual = 0, Pred = 1)
    fp_cands = df[(df["target_risk"] == 0) & (df["pred_class"] == 1)].sort_values(by="pred_prob", ascending=False)
    fp_row = fp_cands.iloc[0] if len(fp_cands) > 0 else df[df["target_risk"] == 0].iloc[0]

    # 4. False Negative (Actual = 1, Pred = 0)
    fn_cands = df[(df["target_risk"] == 1) & (df["pred_class"] == 0)].sort_values(by="pred_prob", ascending=True)
    fn_row = fn_cands.iloc[0] if len(fn_cands) > 0 else df[df["target_risk"] == 1].iloc[0]

    # 5. Recovery Case (W4 attendance/marks lower, W12 higher, Target = 0)
    rec_cands = df[
        (df["target_risk"] == 0) & 
        (df["internal_marks_avg_w4"] < 60) & 
        (df["internal_marks_avg_w12"] > 70)
    ]
    rec_row = rec_cands.iloc[0] if len(rec_cands) > 0 else tn_row

    # 6. Declining Case (W4 marks higher, W12 marks lower, Target = 1)
    dec_cands = df[
        (df["target_risk"] == 1) & 
        (df["internal_marks_avg_w4"] > 70) & 
        (df["internal_marks_avg_w12"] < 55)
    ]
    dec_row = dec_cands.iloc[0] if len(dec_cands) > 0 else tp_row

    case_definitions = [
        ("True Positive (Correct High-Risk Flag)", tp_row, 1),
        ("True Negative (Correct Low-Risk Safe)", tn_row, 0),
        ("False Positive (Borderline Alert, Student Passed)", fp_row, 0),
        ("False Negative (Missed Risk Alert, Student Failed)", fn_row, 1),
        ("Recovery Trajectory (Early Struggle to Recovery)", rec_row, 0),
        ("Declining Trajectory (Early Strength to Disengagement)", dec_row, 1),
    ]

    sample_explanations = []
    for label, row_data, actual_target in case_definitions:
        exp = generate_risk_explanation(row_data, checkpoint=checkpoint, top_k=4)
        exp["case_type"] = label
        exp["actual_ground_truth_target"] = int(actual_target)
        sample_explanations.append(exp)

    # Save to results/sample_local_explanations.json
    out_path = os.path.join(RESULTS_DIR, "sample_local_explanations.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(sample_explanations, f, indent=2)

    return sample_explanations


if __name__ == "__main__":
    print("Testing local SHAP risk explanation...")
    df_sample = pd.read_csv(os.path.join(DATA_DIR, "checkpoint_w12.csv")).iloc[10]
    exp = generate_risk_explanation(df_sample, checkpoint="W12")
    print(json.dumps(exp, indent=2))

    print("\nGenerating representative case studies...")
    cases = select_representative_cases("W12")
    print(f"Generated {len(cases)} representative case explanations saved to results/sample_local_explanations.json")
