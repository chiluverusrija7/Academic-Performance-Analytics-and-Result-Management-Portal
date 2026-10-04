"""
intervention_engine.py
Prescriptive Academic Intervention Engine for EduInsight AI (Phase 6).

Implements:
- Multi-signal decision synthesis: Risk Probability + SHAP Drivers + Conformal Uncertainty + Counterfactuals + Checkpoint.
- Objective priority assignment (CRITICAL, HIGH, MEDIUM, LOW, NONE) with uncertainty gating.
- Recommendation confidence calibration (HIGH, MEDIUM, LOW).
- Temporal adaptation (W4 -> W8 -> W12).
- Strict exclusion of non-actionable demographic features.
- Structured action plans with trigger evidence, suggested actions, and expected model effects.
- Multi-criteria student prioritization queue.
- CSV and JSON serialization for downstream API and UI dashboards.
"""

import os
import sys
import json
import datetime
import numpy as np
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from interventions.intervention_library import (
    TYPE_ATTENDANCE_SUPPORT,
    TYPE_SUBJECT_REMEDIATION,
    TYPE_FACULTY_MENTORING,
    TYPE_STUDY_PLAN,
    TYPE_EARLY_COUNSELLING,
    TYPE_PERFORMANCE_MONITORING,
    TYPE_NO_INTERVENTION,
    INTERVENTION_TEMPLATES,
    is_actionable_feature
)
from uncertainty.conformal_predictor import get_conformal_engine, STATUS_CONFIDENT_RISK, STATUS_AMBIGUOUS, STATUS_CONFIDENT_SAFE
from counterfactual.counterfactual_engine import get_simulator
from explainability.risk_explanation import generate_risk_explanation

DATA_DIR = os.path.join(BASE_DIR, "ml_data")
RESULTS_DIR = os.path.join(BASE_DIR, "results")
REPORTS_DIR = os.path.join(BASE_DIR, "reports")

os.makedirs(RESULTS_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)

# Priority Levels
PRIORITY_CRITICAL = "CRITICAL"
PRIORITY_HIGH = "HIGH"
PRIORITY_MEDIUM = "MEDIUM"
PRIORITY_LOW = "LOW"
PRIORITY_NONE = "NONE"

# Recommendation Confidence
CONFIDENCE_HIGH = "HIGH"
CONFIDENCE_MEDIUM = "MEDIUM"
CONFIDENCE_LOW = "LOW"


class AcademicInterventionEngine:
    """
    Synthesizes predictions, SHAP attributions, conformal uncertainty, and counterfactuals
    into prioritized, actionable, non-causal academic intervention plans.
    """

    def __init__(self):
        self.conformal_engine = get_conformal_engine()
        self.counterfactual_simulator = get_simulator()

    def generate_intervention_plan(self, student_record, checkpoint="W12", alpha=0.10):
        """
        Generates a complete, structured prescriptive academic intervention plan for a single student.
        """
        cp = checkpoint.upper()
        if isinstance(student_record, dict):
            row_dict = dict(student_record)
        elif isinstance(student_record, pd.Series):
            row_dict = student_record.to_dict()
        else:
            row_dict = student_record.iloc[0].to_dict()

        student_id = str(row_dict.get("student_id", "UNKNOWN"))
        semester_no = int(row_dict.get("semester_no", 1))

        # 1. Multi-Phase Evidence Ingestion
        # Phase 2 & 4: Probability and Conformal Uncertainty
        pred_res = self.conformal_engine.predict_with_uncertainty(row_dict, checkpoint=cp, alpha=alpha)
        prob = pred_res["risk_probability"]
        point_pred = pred_res["point_prediction"]
        unc_status = pred_res["uncertainty_status"]
        conf_set = pred_res["conformal_prediction_set"]

        # Phase 3: SHAP Attributions (Filtered for actionable features)
        shap_res = generate_risk_explanation(row_dict, checkpoint=cp, top_k=5)
        raw_risk_factors = shap_res.get("risk_factors", [])
        actionable_risk_factors = [f for f in raw_risk_factors if is_actionable_feature(f["feature"])]

        # Phase 5: Counterfactual Feasibility
        cf_res = self.counterfactual_simulator.simulate_counterfactual(row_dict, checkpoint=cp, alpha=alpha)

        # 2. Case: Safe / Low Risk (No Intervention Needed)
        if prob < 0.25 and point_pred == "SAFE" and unc_status == STATUS_CONFIDENT_SAFE:
            return self._build_no_intervention_response(student_id, semester_no, cp, prob, point_pred, unc_status)

        # 3. Determine Intervention Type & Triggers
        primary_type, secondary_type, reasons, trigger_details = self._map_evidence_to_interventions(
            row_dict, cp, prob, unc_status, actionable_risk_factors, cf_res
        )

        # 4. Determine Priority (with Uncertainty Gating)
        priority = self._assign_priority(prob, unc_status, primary_type, row_dict, cp)

        # 5. Determine Recommendation Confidence
        confidence = self._assign_recommendation_confidence(prob, unc_status, cf_res, actionable_risk_factors)

        # 6. Extract Counterfactual Evidence
        cf_evidence = None
        if cf_res and cf_res.get("counterfactual"):
            cf_info = cf_res["counterfactual"]
            cf_evidence = {
                "scenario_name": cf_res.get("scenario_name"),
                "modified_features": cf_info.get("modified_features"),
                "predicted_risk_reduction": cf_info.get("probability_reduction"),
                "new_risk_probability": cf_info.get("risk_probability"),
                "new_point_prediction": cf_info.get("point_prediction"),
                "feasibility": cf_res.get("feasibility_status")
            }

        # 7. Assemble Structured Action Plan
        template = INTERVENTION_TEMPLATES.get(primary_type, INTERVENTION_TEMPLATES[TYPE_PERFORMANCE_MONITORING])
        sec_template = INTERVENTION_TEMPLATES.get(secondary_type, {}) if secondary_type else None

        primary_plan = {
            "type": primary_type,
            "title": template["title"],
            "priority": priority,
            "confidence": confidence,
            "reason": reasons[0] if reasons else "Elevated risk indicators detected.",
            "trigger_evidence": trigger_details,
            "suggested_action": template["suggested_action"],
            "expected_model_effect": template["expected_model_effect"],
            "time_horizon": template["default_time_horizon"]
        }

        secondary_plan = None
        if secondary_type and secondary_type != TYPE_NO_INTERVENTION:
            sec_priority = PRIORITY_LOW if priority == PRIORITY_MEDIUM else (PRIORITY_MEDIUM if priority in [PRIORITY_HIGH, PRIORITY_CRITICAL] else PRIORITY_LOW)
            secondary_plan = {
                "type": secondary_type,
                "title": sec_template["title"],
                "priority": sec_priority,
                "reason": reasons[1] if len(reasons) > 1 else "Complementary academic support recommendation.",
                "suggested_action": sec_template["suggested_action"]
            }

        return {
            "student_id": student_id,
            "semester_no": semester_no,
            "checkpoint": cp,
            "risk_probability": prob,
            "risk_class": "HIGH" if prob >= 0.65 else ("MEDIUM" if prob >= 0.35 else "LOW"),
            "uncertainty_status": unc_status,
            "conformal_prediction_set": conf_set,
            "priority": priority,
            "recommendation_confidence": confidence,
            "primary_intervention": primary_plan,
            "secondary_intervention": secondary_plan,
            "counterfactual_evidence": cf_evidence,
            "non_causal_statement": (
                "Intervention recommendations are model-based academic decision support suggestions "
                "derived from empirical feature attributions and counterfactual simulations. "
                "They do not guarantee individual student outcomes."
            )
        }

    def _map_evidence_to_interventions(self, row_dict, cp, prob, unc_status, actionable_risk_factors, cf_res):
        """Maps multi-phase evidence to primary and secondary intervention types."""
        cp_lower = cp.lower()
        att_col = f"attendance_pct_{cp_lower}"
        marks_col = f"internal_marks_avg_{cp_lower}"
        low_marks_col = f"low_scoring_subjects_{cp_lower}"
        low_att_col = f"low_attendance_subjects_{cp_lower}"

        curr_att = float(row_dict.get(att_col, 80.0))
        curr_marks = float(row_dict.get(marks_col, 65.0))
        curr_low_marks = int(row_dict.get(low_marks_col, 0))
        curr_low_att = int(row_dict.get(low_att_col, 0))
        backlogs = int(row_dict.get("historical_backlogs_cumulative", row_dict.get("previous_backlogs_count", 0)))

        reasons = []
        trigger_details = []

        # Find top actionable SHAP feature names
        top_shap_names = [f["feature"] for f in actionable_risk_factors[:3]]

        for f in actionable_risk_factors[:3]:
            trigger_details.append(f"{f['feature']} (value: {f['actual_value']}, SHAP: +{f['shap_value']:.3f})")

        # Uncertainty Gating: If AMBIGUOUS and risk is moderate, prioritize low-intensity monitoring
        if unc_status == STATUS_AMBIGUOUS and prob < 0.65:
            reasons.append(f"Model prediction is ambiguous (conformal set: [SAFE, RISK]); monitoring is warranted to observe trajectory.")
            return TYPE_PERFORMANCE_MONITORING, (TYPE_STUDY_PLAN if curr_marks < 60 else TYPE_ATTENDANCE_SUPPORT), reasons, trigger_details

        # Checkpoint-specific multi-signal rules
        if curr_low_marks >= 2 or any("low_scoring_subjects" in name for name in top_shap_names):
            reasons.append(f"Student has {curr_low_marks} subject(s) below internal benchmarks, identified as a primary risk driver.")
            primary = TYPE_SUBJECT_REMEDIATION
            secondary = TYPE_FACULTY_MENTORING if curr_marks < 55 else TYPE_STUDY_PLAN

        elif curr_att < 75.0 or curr_low_att >= 1 or any("attendance" in name for name in top_shap_names):
            reasons.append(f"Attendance standing of {curr_att:.1f}% ({curr_low_att} short-attendance subjects) contributed positively to predicted risk.")
            primary = TYPE_ATTENDANCE_SUPPORT
            secondary = TYPE_STUDY_PLAN if curr_marks < 60 else TYPE_FACULTY_MENTORING

        elif curr_marks < 55.0 or any("internal_marks" in name for name in top_shap_names):
            if cp == "W4":
                reasons.append(f"Early-term internal assessment average ({curr_marks:.1f}%) indicates initial conceptual difficulties.")
                primary = TYPE_STUDY_PLAN
                secondary = TYPE_FACULTY_MENTORING
            elif cp == "W8":
                reasons.append(f"Midterm assessment average ({curr_marks:.1f}%) requires structured faculty advisory intervention.")
                primary = TYPE_FACULTY_MENTORING
                secondary = TYPE_SUBJECT_REMEDIATION
            else:
                reasons.append(f"Late-semester continuous assessment score ({curr_marks:.1f}%) necessitates urgent subject remediation.")
                primary = TYPE_SUBJECT_REMEDIATION
                secondary = TYPE_FACULTY_MENTORING

        elif backlogs >= 2:
            reasons.append(f"Cumulative historical backlog count ({backlogs}) compounds in-semester academic vulnerability.")
            primary = TYPE_EARLY_COUNSELLING
            secondary = TYPE_STUDY_PLAN

        else:
            reasons.append("General borderline academic standing observed across continuous evaluation metrics.")
            primary = TYPE_PERFORMANCE_MONITORING
            secondary = TYPE_STUDY_PLAN

        return primary, secondary, reasons, trigger_details

    def _assign_priority(self, prob, unc_status, primary_type, row_dict, cp):
        """Assigns priority with uncertainty guardrails."""
        # Ambiguity Gate: AMBIGUOUS predictions are capped at MEDIUM priority
        if unc_status == STATUS_AMBIGUOUS:
            return PRIORITY_MEDIUM if prob >= 0.40 else PRIORITY_LOW

        if prob >= 0.85 and unc_status == STATUS_CONFIDENT_RISK:
            return PRIORITY_CRITICAL
        elif prob >= 0.65 and unc_status == STATUS_CONFIDENT_RISK:
            return PRIORITY_HIGH
        elif prob >= 0.40:
            return PRIORITY_MEDIUM
        elif prob >= 0.25:
            return PRIORITY_LOW
        else:
            return PRIORITY_NONE

    def _assign_recommendation_confidence(self, prob, unc_status, cf_res, actionable_risk_factors):
        """Assigns recommendation confidence based on evidence alignment."""
        if unc_status == STATUS_AMBIGUOUS:
            return CONFIDENCE_LOW

        has_feasible_cf = cf_res and cf_res.get("counterfactual") and cf_res.get("feasibility_status") == "FEASIBLE_THRESHOLD_CROSSED"
        has_strong_shap = len(actionable_risk_factors) >= 2

        if (prob >= 0.75 or prob <= 0.20) and has_feasible_cf and has_strong_shap:
            return CONFIDENCE_HIGH
        elif prob >= 0.50 or has_feasible_cf:
            return CONFIDENCE_MEDIUM
        else:
            return CONFIDENCE_LOW

    def _build_no_intervention_response(self, student_id, semester_no, cp, prob, point_pred, unc_status):
        """Standardized NO_INTERVENTION payload for safe students."""
        template = INTERVENTION_TEMPLATES[TYPE_NO_INTERVENTION]
        return {
            "student_id": student_id,
            "semester_no": semester_no,
            "checkpoint": cp,
            "risk_probability": prob,
            "risk_class": "LOW",
            "uncertainty_status": unc_status,
            "conformal_prediction_set": ["SAFE"],
            "priority": PRIORITY_NONE,
            "recommendation_confidence": CONFIDENCE_HIGH,
            "primary_intervention": {
                "type": TYPE_NO_INTERVENTION,
                "title": template["title"],
                "priority": PRIORITY_NONE,
                "confidence": CONFIDENCE_HIGH,
                "reason": "Student exhibits low predicted risk with strong protective academic indicators.",
                "suggested_action": template["suggested_action"],
                "time_horizon": template["default_time_horizon"]
            },
            "secondary_intervention": None,
            "counterfactual_evidence": None,
            "non_causal_statement": "Student is currently classified as SAFE. No remedial intervention recommended."
        }

    def rank_intervention_queue(self, records_or_df, checkpoint="W12", alpha=0.10):
        """
        Generates a prioritized intervention queue for administrative and faculty decision workflows.
        Ranks by composite urgency score: 0.40 * Risk + 0.25 * Certainty + 0.20 * Checkpoint Urgency + 0.15 * Actionability.
        """
        cp = checkpoint.upper()
        if isinstance(records_or_df, pd.DataFrame):
            rows = records_or_df.to_dict(orient="records")
        elif isinstance(records_or_df, list):
            rows = records_or_df
        else:
            rows = [records_or_df]

        queue = []
        cp_weights = {"W4": 0.10, "W8": 0.20, "W12": 0.30}

        for r in rows:
            plan = self.generate_intervention_plan(r, checkpoint=cp, alpha=alpha)
            prob = plan["risk_probability"]
            unc = plan["uncertainty_status"]
            priority = plan["priority"]

            if priority == PRIORITY_NONE:
                continue

            certainty_weight = 0.30 if unc == STATUS_CONFIDENT_RISK else (0.15 if unc == STATUS_AMBIGUOUS else 0.0)
            priority_weight = {"CRITICAL": 0.40, "HIGH": 0.30, "MEDIUM": 0.20, "LOW": 0.10}.get(priority, 0.0)
            cf_available = 0.10 if plan.get("counterfactual_evidence") else 0.0

            urgency_score = (0.35 * prob) + (0.25 * certainty_weight) + (0.25 * priority_weight) + (0.10 * cp_weights.get(cp, 0.20)) + (0.05 * cf_available)

            queue.append({
                "student_id": plan["student_id"],
                "semester_no": plan["semester_no"],
                "checkpoint": plan["checkpoint"],
                "risk_probability": round(prob, 4),
                "risk_class": plan["risk_class"],
                "uncertainty_status": unc,
                "priority": priority,
                "recommendation_confidence": plan["recommendation_confidence"],
                "primary_intervention": plan["primary_intervention"]["type"],
                "secondary_intervention": plan["secondary_intervention"]["type"] if plan.get("secondary_intervention") else "None",
                "primary_reason": plan["primary_intervention"]["reason"],
                "counterfactual_available": bool(plan.get("counterfactual_evidence")),
                "estimated_risk_reduction": plan["counterfactual_evidence"]["predicted_risk_reduction"] if plan.get("counterfactual_evidence") else 0.0,
                "urgency_score": round(urgency_score, 4),
                "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
            })

        # Sort descending by composite urgency score
        queue.sort(key=lambda x: x["urgency_score"], reverse=True)
        for idx, item in enumerate(queue):
            item["rank"] = idx + 1

        return queue


# Global Singleton
_INTERVENTION_ENGINE = None

def get_intervention_engine():
    global _INTERVENTION_ENGINE
    if _INTERVENTION_ENGINE is None:
        _INTERVENTION_ENGINE = AcademicInterventionEngine()
    return _INTERVENTION_ENGINE


def generate_intervention_plan(student_record, checkpoint="W12", alpha=0.10):
    """Module-level convenience function."""
    engine = get_intervention_engine()
    return engine.generate_intervention_plan(student_record, checkpoint=checkpoint, alpha=alpha)


def run_batch_intervention_generation():
    """Generates structured intervention dashboard outputs across all checkpoints."""
    engine = get_intervention_engine()
    all_queue_items = []
    all_json_plans = []

    for cp in ["W4", "W8", "W12"]:
        df = pd.read_csv(os.path.join(DATA_DIR, f"checkpoint_{cp.lower()}.csv"))
        # Sample representative cohort of students across risk spectrum
        at_risk_sample = df[df["target_risk"] == 1].head(15)
        safe_sample = df[df["target_risk"] == 0].head(10)
        eval_sample = pd.concat([at_risk_sample, safe_sample])

        for _, row in eval_sample.iterrows():
            plan = engine.generate_intervention_plan(row, checkpoint=cp)
            all_json_plans.append(plan)

        cp_queue = engine.rank_intervention_queue(eval_sample, checkpoint=cp)
        all_queue_items.extend(cp_queue)

    # Save to results/intervention_plans.csv
    df_queue = pd.DataFrame(all_queue_items)
    cols = [
        "rank", "student_id", "semester_no", "checkpoint", "risk_probability", "risk_class",
        "uncertainty_status", "priority", "recommendation_confidence",
        "primary_intervention", "secondary_intervention", "primary_reason",
        "counterfactual_available", "estimated_risk_reduction", "urgency_score", "generated_at"
    ]
    df_queue = df_queue[[c for c in cols if c in df_queue.columns]]
    csv_path = os.path.join(RESULTS_DIR, "intervention_plans.csv")
    df_queue.to_csv(csv_path, index=False)

    # Save to results/intervention_plans.json
    json_path = os.path.join(RESULTS_DIR, "intervention_plans.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(all_json_plans, f, indent=2)

    return df_queue, all_json_plans


if __name__ == "__main__":
    print("Executing Phase 6 Batch Intervention Generation...")
    df_q, json_p = run_batch_intervention_generation()
    print(f"\nGenerated {len(df_q)} queued intervention items saved to results/intervention_plans.csv")
    print(f"Generated {len(json_p)} detailed intervention plans saved to results/intervention_plans.json")
    print("\n--- Top 10 High Priority Interventions ---")
    print(df_q.head(10)[["rank", "student_id", "checkpoint", "risk_probability", "priority", "primary_intervention", "urgency_score"]].to_string(index=False))
