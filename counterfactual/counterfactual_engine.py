"""
counterfactual_engine.py
Counterfactual Academic Simulator Engine for EduInsight AI (Phase 5).

Implements:
- Model-agnostic, pipeline-re-evaluated counterfactual generation for academic risk mitigation.
- Minimum-change optimization objective subject to realistic bounds and physical feasibility.
- Strict protection of immutable demographic and historical variables.
- Temporal consistency across W4, W8, and W12 checkpoints.
- Integration with Phase 3 SHAP feature attributions and Phase 4 Conformal Uncertainty.
- Strict non-causal explanation phrasing.
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from counterfactual.intervention_space import (
    MODIFIABLE_FEATURES_BY_CHECKPOINT,
    IMMUTABLE_FEATURES,
    FORBIDDEN_LEAKAGE_VARIABLES,
    FEATURE_BOUNDS,
    ATTENDANCE_STEPS,
    MARKS_STEPS,
    SUBJECT_CLEAR_STEPS,
    is_feature_modifiable,
    validate_intervention_bounds,
    update_dependent_temporal_features
)
from uncertainty.conformal_predictor import get_conformal_engine
from explainability.risk_explanation import generate_risk_explanation, _get_pipeline_and_explainer

DATA_DIR = os.path.join(BASE_DIR, "ml_data")
PIPELINES_DIR = os.path.join(BASE_DIR, "pipelines")
RESULTS_DIR = os.path.join(BASE_DIR, "results")
REPORTS_DIR = os.path.join(BASE_DIR, "reports")

os.makedirs(RESULTS_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)


class CounterfactualAcademicSimulator:
    """
    Simulates actionable counterfactual interventions on student academic trajectories.
    """

    def __init__(self, checkpoints=("W4", "W8", "W12")):
        self.checkpoints = [cp.upper() for cp in checkpoints]
        self.conformal_engine = get_conformal_engine()

    def _generate_candidate_interventions(self, row_dict, checkpoint):
        """
        Generates a structured grid of plausible candidate interventions for the checkpoint.
        """
        cp = checkpoint.upper()
        candidates = []

        # Identify checkpoint specific variable names
        att_col = f"attendance_pct_{cp.lower()}"
        marks_col = f"internal_marks_avg_{cp.lower()}"
        low_att_col = f"low_attendance_subjects_{cp.lower()}"
        low_marks_col = f"low_scoring_subjects_{cp.lower()}"

        curr_att = float(row_dict.get(att_col, 75.0))
        curr_marks = float(row_dict.get(marks_col, 60.0))
        curr_low_att = int(row_dict.get(low_att_col, 0))
        curr_low_marks = int(row_dict.get(low_marks_col, 0))

        # -------------------------------------------------------------
        # Scenario 1: Attendance Improvement Alone
        # -------------------------------------------------------------
        for step in ATTENDANCE_STEPS:
            new_att = curr_att + step
            is_valid, reason = validate_intervention_bounds(att_col, curr_att, new_att)
            candidates.append({
                "scenario_name": f"Attendance Improvement (+{step:.0f}%)",
                "changes": {att_col: new_att},
                "is_feasible": is_valid,
                "infeasibility_reason": reason if not is_valid else None,
                "cost": step / 20.0
            })

        # -------------------------------------------------------------
        # Scenario 2: Internal Assessment Improvement Alone
        # -------------------------------------------------------------
        for step in MARKS_STEPS:
            new_marks = curr_marks + step
            is_valid, reason = validate_intervention_bounds(marks_col, curr_marks, new_marks)
            candidates.append({
                "scenario_name": f"Internal Marks Improvement (+{step:.0f} pts)",
                "changes": {marks_col: new_marks},
                "is_feasible": is_valid,
                "infeasibility_reason": reason if not is_valid else None,
                "cost": step / 20.0
            })

        # -------------------------------------------------------------
        # Scenario 3: Remedial Subject Clearance
        # -------------------------------------------------------------
        if curr_low_marks > 0:
            for c_step in SUBJECT_CLEAR_STEPS:
                if c_step <= curr_low_marks:
                    new_low_marks = curr_low_marks - c_step
                    # Target marks bump corresponding to clearing low marks
                    new_marks = min(100.0, curr_marks + (c_step * 4.0))
                    candidates.append({
                        "scenario_name": f"Remediate {c_step} Failing Subject(s)",
                        "changes": {low_marks_col: new_low_marks, marks_col: new_marks},
                        "is_feasible": True,
                        "infeasibility_reason": None,
                        "cost": (c_step * 0.8) + (c_step * 4.0 / 20.0)
                    })

        if curr_low_att > 0:
            new_low_att = max(0, curr_low_att - 1)
            new_att = min(100.0, curr_att + 6.0)
            candidates.append({
                "scenario_name": "Resolve Attendance Shortage in 1 Subject",
                "changes": {low_att_col: new_low_att, att_col: new_att},
                "is_feasible": True,
                "infeasibility_reason": None,
                "cost": 0.8 + (6.0 / 20.0)
            })

        # -------------------------------------------------------------
        # Scenario 4: Combined Multi-Faceted Intervention
        # -------------------------------------------------------------
        for att_step in [5.0, 10.0]:
            for marks_step in [5.0, 10.0]:
                new_att = curr_att + att_step
                new_marks = curr_marks + marks_step
                new_low_marks = max(0, curr_low_marks - 1) if curr_low_marks > 0 else 0

                att_valid, att_reason = validate_intervention_bounds(att_col, curr_att, new_att)
                marks_valid, marks_reason = validate_intervention_bounds(marks_col, curr_marks, new_marks)

                feasible = att_valid and marks_valid
                reason = att_reason if not att_valid else (marks_reason if not marks_valid else None)

                changes = {att_col: new_att, marks_col: new_marks}
                cost = (att_step / 20.0) + (marks_step / 20.0)
                if curr_low_marks > 0:
                    changes[low_marks_col] = new_low_marks
                    cost += 0.5

                candidates.append({
                    "scenario_name": f"Combined Intervention (+{att_step:.0f}% Att, +{marks_step:.0f} Marks)",
                    "changes": changes,
                    "is_feasible": feasible,
                    "infeasibility_reason": reason,
                    "cost": cost
                })

        return candidates

    def simulate_counterfactual(self, student_record, checkpoint="W12", alpha=0.10, target_threshold=0.50):
        """
        Executes counterfactual search for a student observation.
        """
        cp = checkpoint.upper()
        if isinstance(student_record, dict):
            orig_dict = dict(student_record)
        elif isinstance(student_record, pd.Series):
            orig_dict = student_record.to_dict()
        else:
            orig_dict = student_record.iloc[0].to_dict()

        student_id = str(orig_dict.get("student_id", "UNKNOWN"))
        semester_no = int(orig_dict.get("semester_no", 1))

        # 1. Baseline Evaluation (Phase 2 Model + Phase 4 Conformal + Phase 3 SHAP)
        curr_pred_res = self.conformal_engine.predict_with_uncertainty(orig_dict, checkpoint=cp, alpha=alpha)
        curr_prob = curr_pred_res["risk_probability"]
        curr_point_pred = curr_pred_res["point_prediction"]
        curr_uncertainty = curr_pred_res["uncertainty_status"]
        curr_conformal_set = curr_pred_res["conformal_prediction_set"]

        # If student is already low risk and confident safe, no intervention needed
        if curr_point_pred == "SAFE" and curr_prob < 0.35:
            return {
                "student_id": student_id,
                "semester_no": semester_no,
                "checkpoint": cp,
                "status": "NO_INTERVENTION_NEEDED",
                "message": "Student is currently classified as SAFE with low risk probability. No remedial intervention required.",
                "current": {
                    "risk_probability": curr_prob,
                    "point_prediction": curr_point_pred,
                    "uncertainty_status": curr_uncertainty,
                    "conformal_prediction_set": curr_conformal_set
                },
                "counterfactual": None
            }

        # 2. Candidate Generation and Re-evaluation
        candidates = self._generate_candidate_interventions(orig_dict, cp)
        evaluated_candidates = []

        pipeline = self.conformal_engine.models[cp]
        feature_cols = self.conformal_engine.feature_cols_map[cp]

        for cand in candidates:
            if not cand["is_feasible"]:
                evaluated_candidates.append({
                    **cand,
                    "cf_prob": None,
                    "cf_pred": None,
                    "prob_reduction": 0.0,
                    "crosses_threshold": False,
                    "cf_uncertainty": None
                })
                continue

            # Create modified feature dictionary
            cf_dict = dict(orig_dict)
            for f_name, f_val in cand["changes"].items():
                cf_dict[f_name] = f_val

            # Dynamically recalculate dependent features (e.g. deltas, trends)
            cf_dict = update_dependent_temporal_features(cf_dict, cp)

            # Re-predict using actual pipeline
            df_cf = pd.DataFrame([cf_dict])
            X_cf = df_cf[[c for c in feature_cols if c in df_cf.columns]]

            cf_prob = float(pipeline.predict_proba(X_cf)[0, 1])
            cf_point_pred = "RISK" if cf_prob >= 0.50 else "SAFE"
            prob_red = round(curr_prob - cf_prob, 4)

            # Re-evaluate conformal uncertainty
            cf_unc_res = self.conformal_engine.predict_with_uncertainty(cf_dict, checkpoint=cp, alpha=alpha)

            evaluated_candidates.append({
                **cand,
                "cf_dict": cf_dict,
                "cf_prob": round(cf_prob, 4),
                "cf_point_pred": cf_point_pred,
                "prob_reduction": prob_red,
                "crosses_threshold": (cf_prob < target_threshold),
                "cf_uncertainty": cf_unc_res["uncertainty_status"],
                "cf_conformal_set": cf_unc_res["conformal_prediction_set"]
            })

        # 3. Minimum-Change Optimization Selection
        # Filter for feasible candidates that actually reduce risk
        feasible_reducing = [c for c in evaluated_candidates if c["is_feasible"] and c["prob_reduction"] > 0]

        if not feasible_reducing:
            # Check if all interventions were physically impossible
            infeasible_reasons = [c["infeasibility_reason"] for c in evaluated_candidates if not c["is_feasible"]]
            return {
                "student_id": student_id,
                "semester_no": semester_no,
                "checkpoint": cp,
                "status": "INFEASIBLE_NO_REDUCTION",
                "message": "No feasible intervention within realistic bounds reduced predicted risk.",
                "current": {
                    "risk_probability": curr_prob,
                    "point_prediction": curr_point_pred,
                    "uncertainty_status": curr_uncertainty,
                    "conformal_prediction_set": curr_conformal_set
                },
                "infeasible_reasons": list(set(filter(None, infeasible_reasons))),
                "counterfactual": None
            }

        # Priority 1: Crosses operational threshold (risk < 0.50) with minimum cost
        crossing = [c for c in feasible_reducing if c["crosses_threshold"]]
        if crossing:
            # Sort by minimum cost, then largest probability reduction
            crossing.sort(key=lambda x: (x["cost"], -x["prob_reduction"]))
            best_candidate = crossing[0]
            feasibility_status = "FEASIBLE_THRESHOLD_CROSSED"
        else:
            # Priority 2: Best feasible partial reduction
            feasible_reducing.sort(key=lambda x: (-x["prob_reduction"], x["cost"]))
            best_candidate = feasible_reducing[0]
            feasibility_status = "FEASIBLE_PARTIAL_REDUCTION"

        # 4. SHAP Comparison (Before vs After)
        shap_before = generate_risk_explanation(orig_dict, checkpoint=cp, top_k=3)
        shap_after = generate_risk_explanation(best_candidate["cf_dict"], checkpoint=cp, top_k=3)

        # 5. Non-Causal Natural Language Explanation
        changes_desc = []
        for k, v in best_candidate["changes"].items():
            orig_v = orig_dict.get(k, "N/A")
            delta = v - orig_v if isinstance(orig_v, (int, float)) else 0
            sign = f"+{delta:.1f}" if delta > 0 else f"{delta:.1f}"
            changes_desc.append(f"{k} from {orig_v} to {v} ({sign})")

        changes_summary_str = ", ".join(changes_desc)

        if best_candidate["crosses_threshold"]:
            explanation_str = (
                f"Under the model, modifying {changes_summary_str} is associated with reducing "
                f"predicted risk from {curr_prob:.4f} to {best_candidate['cf_prob']:.4f} "
                f"(a reduction of {best_candidate['prob_reduction']:.4f}), shifting the point prediction "
                f"from {curr_point_pred} to {best_candidate['cf_point_pred']} and uncertainty from "
                f"{curr_uncertainty} to {best_candidate['cf_uncertainty']}."
            )
        else:
            explanation_str = (
                f"Under the model, modifying {changes_summary_str} is associated with reducing "
                f"predicted risk from {curr_prob:.4f} to {best_candidate['cf_prob']:.4f} "
                f"(a reduction of {best_candidate['prob_reduction']:.4f}), but the prediction remains "
                f"{best_candidate['cf_point_pred']}."
            )

        return {
            "student_id": student_id,
            "semester_no": semester_no,
            "checkpoint": cp,
            "feasibility_status": feasibility_status,
            "scenario_name": best_candidate["scenario_name"],
            "intervention_cost": round(best_candidate["cost"], 2),
            "explanation": explanation_str,
            "current": {
                "risk_probability": curr_prob,
                "point_prediction": curr_point_pred,
                "uncertainty_status": curr_uncertainty,
                "conformal_prediction_set": curr_conformal_set,
                "top_risk_factors": shap_before.get("risk_factors", [])
            },
            "counterfactual": {
                "modified_features": best_candidate["changes"],
                "risk_probability": best_candidate["cf_prob"],
                "point_prediction": best_candidate["cf_point_pred"],
                "uncertainty_status": best_candidate["cf_uncertainty"],
                "conformal_prediction_set": best_candidate["cf_conformal_set"],
                "probability_reduction": best_candidate["prob_reduction"],
                "top_risk_factors": shap_after.get("risk_factors", [])
            },
            "all_evaluated_scenarios_count": len(evaluated_candidates),
            "feasible_scenarios_count": len(feasible_reducing)
        }


# Global Singleton
_SIMULATOR = None

def get_simulator():
    global _SIMULATOR
    if _SIMULATOR is None:
        _SIMULATOR = CounterfactualAcademicSimulator()
    return _SIMULATOR


def generate_counterfactual(student_record, checkpoint="W12", alpha=0.10):
    """Module-level convenience function."""
    sim = get_simulator()
    return sim.simulate_counterfactual(student_record, checkpoint=checkpoint, alpha=alpha)


def generate_representative_case_studies():
    """
    Evaluates 6 diverse real student cases across checkpoints to validate
    successful transitions, partial reductions, single-variable vs combined interventions,
    infeasible edge cases, and safe students.
    """
    sim = get_simulator()
    cases = []
    cases_summary_rows = []

    # Case 1: W12 High Risk -> Successfully Crossed Threshold via Combined Action
    df_w12 = pd.read_csv(os.path.join(DATA_DIR, "checkpoint_w12.csv"))
    high_risk_w12 = df_w12[(df_w12["target_risk"] == 1) & (df_w12["internal_marks_avg_w12"] < 58)].iloc[0]
    res1 = sim.simulate_counterfactual(high_risk_w12, checkpoint="W12")
    res1["case_description"] = "Case 1: W12 High-Risk Trajectory — Combined Remedial Intervention"
    cases.append(res1)

    # Case 2: W8 Moderate Risk -> Successfully Crossed via Attendance Alone
    df_w8 = pd.read_csv(os.path.join(DATA_DIR, "checkpoint_w8.csv"))
    mod_risk_w8 = df_w8[(df_w8["target_risk"] == 1) & (df_w8["attendance_pct_w8"] < 70)].iloc[0]
    res2 = sim.simulate_counterfactual(mod_risk_w8, checkpoint="W8")
    res2["case_description"] = "Case 2: W8 Moderate Risk — Attendance Improvement Scenario"
    cases.append(res2)

    # Case 3: W4 Early Ambiguous Risk -> Crossed Threshold via Early Marks Boost
    df_w4 = pd.read_csv(os.path.join(DATA_DIR, "checkpoint_w4.csv"))
    w4_cand = df_w4[(df_w4["target_risk"] == 1) & (df_w4["internal_marks_avg_w4"] < 60)].iloc[0]
    res3 = sim.simulate_counterfactual(w4_cand, checkpoint="W4")
    res3["case_description"] = "Case 3: W4 Early-Term Vulnerability — Early Assessment Intervention"
    cases.append(res3)

    # Case 4: W12 Severe Chronic Failure -> Partial Reduction (Remains in Risk)
    severe_w12 = df_w12[(df_w12["target_risk"] == 1) & (df_w12["internal_marks_avg_w12"] < 45) & (df_w12["low_scoring_subjects_w12"] >= 4)].iloc[0]
    res4 = sim.simulate_counterfactual(severe_w12, checkpoint="W12")
    res4["case_description"] = "Case 4: W12 Severe Chronic Failure — Partial Reduction (High Residual Risk)"
    cases.append(res4)

    # Case 5: W12 Infeasible Bounds Test (Already Near Maximum Ceiling)
    maxed_stu = df_w12.iloc[2].copy()
    maxed_stu["attendance_pct_w12"] = 99.5
    maxed_stu["internal_marks_avg_w12"] = 98.0
    maxed_stu["low_scoring_subjects_w12"] = 0
    maxed_stu["low_attendance_subjects_w12"] = 0
    res5 = sim.simulate_counterfactual(maxed_stu, checkpoint="W12")
    res5["case_description"] = "Case 5: High-Performing Baseline — No Intervention Warranted"
    cases.append(res5)

    # Case 6: W8 Safe Student (Low Risk)
    safe_w8 = df_w8[df_w8["target_risk"] == 0].iloc[5]
    res6 = sim.simulate_counterfactual(safe_w8, checkpoint="W8")
    res6["case_description"] = "Case 6: Confident Safe Student — Filtered from Unnecessary Remediation"
    cases.append(res6)

    # Save to JSON
    json_path = os.path.join(RESULTS_DIR, "sample_counterfactuals.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(cases, f, indent=2)

    # Prepare summary CSV
    for c in cases:
        curr_dict = c.get("current", {})
        cf_dict = c.get("counterfactual") or {}
        cases_summary_rows.append({
            "case_description": c.get("case_description"),
            "student_id": c.get("student_id"),
            "checkpoint": c.get("checkpoint"),
            "feasibility_status": c.get("feasibility_status", c.get("status")),
            "scenario_name": c.get("scenario_name", "N/A"),
            "current_risk_prob": curr_dict.get("risk_probability"),
            "current_point_pred": curr_dict.get("point_prediction"),
            "current_uncertainty": curr_dict.get("uncertainty_status"),
            "cf_risk_prob": cf_dict.get("risk_probability", "N/A"),
            "cf_point_pred": cf_dict.get("point_prediction", "N/A"),
            "cf_uncertainty": cf_dict.get("uncertainty_status", "N/A"),
            "probability_reduction": cf_dict.get("probability_reduction", 0.0),
            "intervention_cost": c.get("intervention_cost", 0.0)
        })

    df_cases = pd.DataFrame(cases_summary_rows)
    csv_path = os.path.join(RESULTS_DIR, "counterfactual_cases.csv")
    df_cases.to_csv(csv_path, index=False)

    return cases, df_cases


if __name__ == "__main__":
    print("Executing Phase 5 Counterfactual Simulation Case Studies...")
    cases, df_summary = generate_representative_case_studies()
    print("\n--- Counterfactual Representative Case Studies Summary ---")
    print(df_summary.to_string(index=False))
