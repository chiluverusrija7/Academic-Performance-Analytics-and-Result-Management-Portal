"""
academic_risk_service.py
Centralized End-to-End Inference Orchestration Service for EduInsight AI (Phase 7).

Orchestrates:
1. Student Profile Retrieval & Provenance Tracking (Real PostgreSQL vs Synthetic ML Data)
2. Temporal Risk Prediction (Phase 2 Champion XGBoost Pipelines)
3. Explainable Feature Attributions (Phase 3 SHAP)
4. Uncertainty Quantification & Prediction Sets (Phase 4 Split Conformal Prediction)
5. Counterfactual What-If Simulation (Phase 5 Automated Minimum-Change & Interactive User Deltas)
6. Prescriptive Action Planning & Prioritization (Phase 6 Intervention Engine)
7. Longitudinal Trajectory Analysis (Sem 1 -> N, W4 -> W8 -> W12)
8. Aggregate Cohort Analytics
"""

import os
import sys
import json
import datetime
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from uncertainty.conformal_predictor import get_conformal_engine
from explainability.risk_explanation import generate_risk_explanation
from counterfactual.counterfactual_engine import get_simulator
from counterfactual.intervention_space import validate_intervention_bounds, update_dependent_temporal_features
from interventions.intervention_engine import get_intervention_engine, run_batch_intervention_generation

DATA_DIR = os.path.join(BASE_DIR, "ml_data")
RESULTS_DIR = os.path.join(BASE_DIR, "results")


class AcademicRiskOrchestrationService:
    """
    Unified application-level service coordinating all ML and decision-support modules.
    """

    def __init__(self):
        self.conformal_engine = get_conformal_engine()
        self.counterfactual_sim = get_simulator()
        self.intervention_engine = get_intervention_engine()
        self.datasets = {
            "W4": pd.read_csv(os.path.join(DATA_DIR, "checkpoint_w4.csv")),
            "W8": pd.read_csv(os.path.join(DATA_DIR, "checkpoint_w8.csv")),
            "W12": pd.read_csv(os.path.join(DATA_DIR, "checkpoint_w12.csv")),
        }
        self.history_df = pd.read_csv(os.path.join(DATA_DIR, "academic_history.csv"))

    def get_available_students(self, limit=100):
        """
        Returns a list of searchable students with basic academic context.
        """
        df_w12 = self.datasets["W12"]
        unique_students = []
        seen = set()

        for _, row in df_w12.iterrows():
            s_id = str(row["student_id"])
            if s_id not in seen:
                seen.add(s_id)
                unique_students.append({
                    "student_id": s_id,
                    "dept_code": row.get("dept_code", "CSE"),
                    "course_code": row.get("course_code", "BTECH"),
                    "current_semester": int(row.get("semester_no", 1)),
                    "cumulative_cgpa": round(float(row.get("cumulative_cgpa_prior", 7.5)), 2) if pd.notna(row.get("cumulative_cgpa_prior")) else "N/A (Sem 1)",
                    "data_source": "SYNTHETIC_ML_DATASET"
                })
            if len(unique_students) >= limit:
                break

        return unique_students

    def analyze_student(self, student_id, semester_no=None, checkpoint="W12", alpha=0.10):
        """
        Executes end-to-end multi-phase risk analysis for a student-semester-checkpoint query.
        """
        cp = checkpoint.upper()
        if cp not in self.datasets:
            raise ValueError(f"Invalid checkpoint '{checkpoint}'. Allowed: W4, W8, W12")

        df = self.datasets[cp]
        # Resolve student_id intelligently (STU0016, 16, 23CSE001, etc.)
        s_query = str(student_id).strip()
        s_matches = df[df["student_id"] == s_query]
        if s_matches.empty:
            s_matches = df[df["student_id"].str.upper() == s_query.upper()]
        if s_matches.empty and s_query.isdigit():
            padded_id = f"STU{int(s_query):04d}"
            s_matches = df[df["student_id"] == padded_id]
        if s_matches.empty and any(char.isdigit() for char in s_query):
            import re
            digits = re.findall(r'\d+', s_query)
            if digits:
                last_num = int(digits[-1])
                padded_id = f"STU{last_num:04d}"
                s_matches = df[df["student_id"] == padded_id]

        if s_matches.empty:
            raise LookupError(f"Student ID '{student_id}' not found in {cp} dataset.")

        if semester_no is not None:
            sem_matches = s_matches[s_matches["semester_no"] == int(semester_no)]
            if not sem_matches.empty:
                student_record = sem_matches.iloc[0].to_dict()
            else:
                student_record = s_matches.iloc[-1].to_dict()
        else:
            student_record = s_matches.iloc[-1].to_dict()

        sem_no = int(student_record["semester_no"])

        # 1. Provenance Information
        provenance = {
            "student_id": student_id,
            "semester_no": sem_no,
            "checkpoint": cp,
            "model_architecture": "XGBoost Classifier (Temporal Checkpoint Champion)",
            "explainability_engine": "SHAP (TreeExplainer)",
            "uncertainty_engine": "Split Conformal Prediction (Inductive Nonconformity)",
            "data_source": "SYNTHETIC_ML_VALIDATED_DATASET",
            "is_operational_db": False,
            "analysis_timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }

        # 2. Risk Prediction & Conformal Uncertainty (Phase 2 + 4)
        unc_res = self.conformal_engine.predict_with_uncertainty(student_record, checkpoint=cp, alpha=alpha)

        # 3. SHAP Explainability (Phase 3)
        shap_res = generate_risk_explanation(student_record, checkpoint=cp, top_k=4)

        # 4. Counterfactual Simulation (Phase 5)
        cf_res = self.counterfactual_sim.simulate_counterfactual(student_record, checkpoint=cp, alpha=alpha)

        # 5. Prescriptive Intervention Plan (Phase 6)
        plan_res = self.intervention_engine.generate_intervention_plan(student_record, checkpoint=cp, alpha=alpha)

        # 6. Semantic Academic Knowledge Retrieval via pgvector (Vector Layer)
        from vector.retrieval import retrieve_guidance_for_risk_profile
        top_driver_str = shap_res.get("risk_factors", [{}])[0].get("feature_name", "Academic Marks") if shap_res.get("risk_factors") else "Academic Performance"
        primary_action_type = plan_res.get("primary_intervention_action", {}).get("action_type", "ACADEMIC_SUPPORT")
        retrieved_policies = retrieve_guidance_for_risk_profile(
            top_driver=top_driver_str,
            checkpoint=cp,
            intervention_type=primary_action_type,
            risk_category=plan_res.get("risk_class", "HIGH")
        )

        # 7. Basic Academic Context
        academic_context = {
            "department": student_record.get("dept_code", "N/A"),
            "course": student_record.get("course_code", "N/A"),
            "cohort_entry_year": str(student_record.get("cohort_entry_year", "2022")),
            "current_attendance_pct": round(float(student_record.get(f"attendance_pct_{cp.lower()}", 75.0)), 2),
            "current_internal_marks_avg": round(float(student_record.get(f"internal_marks_avg_{cp.lower()}", 65.0)), 2),
            "low_scoring_subjects_count": int(student_record.get(f"low_scoring_subjects_{cp.lower()}", 0)),
            "low_attendance_subjects_count": int(student_record.get(f"low_attendance_subjects_{cp.lower()}", 0)),
            "prior_cumulative_cgpa": round(float(student_record.get("cumulative_cgpa_prior", 0.0)), 2) if pd.notna(student_record.get("cumulative_cgpa_prior")) else "None (Sem 1)",
            "historical_backlogs": int(student_record.get("historical_backlogs_cumulative", 0))
        }

        return {
            "provenance": provenance,
            "academic_context": academic_context,
            "prediction": {
                "risk_probability": unc_res["risk_probability"],
                "risk_percentage": unc_res["risk_percentage"],
                "risk_class": plan_res["risk_class"],
                "point_prediction": unc_res["point_prediction"],
                "model_description": f"Model-predicted early academic risk at Checkpoint {cp}."
            },
            "uncertainty": {
                "uncertainty_status": unc_res["uncertainty_status"],
                "conformal_prediction_set": unc_res["conformal_prediction_set"],
                "alpha": unc_res["alpha"],
                "coverage_target": unc_res["coverage_target"],
                "quantile_threshold": unc_res["conformal_quantile_threshold"]
            },
            "explainability": {
                "risk_factors": shap_res.get("risk_factors", []),
                "protective_factors": shap_res.get("protective_factors", []),
                "non_causal_disclaimer": "SHAP values describe statistical feature contributions toward the model prediction; they do not establish empirical causality."
            },
            "counterfactual": cf_res,
            "intervention_plan": plan_res,
            "retrieved_institutional_guidance": retrieved_policies
        }

    def simulate_custom_counterfactual(self, student_id, semester_no, checkpoint, custom_deltas):
        """
        Evaluates a user-defined interactive what-if scenario with strict validation.
        """
        cp = checkpoint.upper()
        df = self.datasets[cp]
        s_matches = df[(df["student_id"] == student_id) & (df["semester_no"] == int(semester_no))]
        if s_matches.empty:
            raise LookupError(f"Observation for {student_id} Sem {semester_no} in {cp} not found.")

        orig_record = s_matches.iloc[0].to_dict()
        pipeline = self.conformal_engine.models[cp]
        feature_cols = self.conformal_engine.feature_cols_map[cp]

        # Validate all proposed changes
        modified_dict = dict(orig_record)
        validation_errors = []

        for f_name, proposed_val in custom_deltas.items():
            curr_val = orig_record.get(f_name, 0.0)
            is_valid, reason = validate_intervention_bounds(f_name, curr_val, proposed_val)
            if not is_valid:
                validation_errors.append(f"{f_name}: {reason}")
            else:
                modified_dict[f_name] = proposed_val

        if validation_errors:
            return {
                "status": "VALIDATION_FAILED",
                "is_feasible": False,
                "errors": validation_errors,
                "recalculated_risk": None
            }

        # Update dependent deltas
        modified_dict = update_dependent_temporal_features(modified_dict, cp)

        # Re-predict using actual pipeline
        df_orig = pd.DataFrame([orig_record])
        df_cf = pd.DataFrame([modified_dict])
        X_orig = df_orig[[c for c in feature_cols if c in df_orig.columns]]
        X_cf = df_cf[[c for c in feature_cols if c in df_cf.columns]]

        orig_prob = float(pipeline.predict_proba(X_orig)[0, 1])
        cf_prob = float(pipeline.predict_proba(X_cf)[0, 1])

        cf_unc = self.conformal_engine.predict_with_uncertainty(modified_dict, checkpoint=cp)
        shap_cf = generate_risk_explanation(modified_dict, checkpoint=cp, top_k=3)

        return {
            "status": "SUCCESS",
            "is_feasible": True,
            "original_risk_probability": round(orig_prob, 4),
            "counterfactual_risk_probability": round(cf_prob, 4),
            "risk_reduction": round(orig_prob - cf_prob, 4),
            "point_prediction": "SAFE" if cf_prob < 0.50 else "RISK",
            "uncertainty_status": cf_unc["uncertainty_status"],
            "conformal_prediction_set": cf_unc["conformal_prediction_set"],
            "recalculated_top_risk_factors": shap_cf.get("risk_factors", [])
        }

    def get_student_longitudinal_trajectory(self, student_id):
        """
        Retrieves historical trajectory across Semesters 1..N and in-semester progression W4 -> W8 -> W12.
        """
        hist = self.history_df[self.history_df["student_id"] == student_id].sort_values(by="semester_no")
        semester_history = []
        for _, row in hist.iterrows():
            semester_history.append({
                "semester_no": int(row["semester_no"]),
                "attendance_pct": round(float(row["attendance_percentage"]), 2) if pd.notna(row.get("attendance_percentage")) else None,
                "sgpa": round(float(row["sgpa"]), 2) if pd.notna(row.get("sgpa")) else None,
                "cgpa": round(float(row["cgpa"]), 2) if pd.notna(row.get("cgpa")) else None,
                "backlogs_count": int(row.get("backlogs_count", 0)),
                "result_status": str(row.get("result_classification", "PASS")),
                "is_historical_outcome": True
            })

        # In-Semester Checkpoint Progression for the latest semester
        latest_sem = semester_history[-1]["semester_no"] if semester_history else 1
        in_sem_progression = []

        for cp in ["W4", "W8", "W12"]:
            df_cp = self.datasets[cp]
            match = df_cp[(df_cp["student_id"] == student_id) & (df_cp["semester_no"] == latest_sem)]
            if not match.empty:
                row = match.iloc[0].to_dict()
                pred = self.conformal_engine.predict_with_uncertainty(row, checkpoint=cp)
                in_sem_progression.append({
                    "checkpoint": cp,
                    "semester_no": latest_sem,
                    "attendance_pct": round(float(row.get(f"attendance_pct_{cp.lower()}", 75.0)), 2),
                    "internal_marks_avg": round(float(row.get(f"internal_marks_avg_{cp.lower()}", 65.0)), 2),
                    "low_scoring_subjects": int(row.get(f"low_scoring_subjects_{cp.lower()}", 0)),
                    "risk_probability": pred["risk_probability"],
                    "risk_class": "HIGH" if pred["risk_probability"] >= 0.65 else ("MEDIUM" if pred["risk_probability"] >= 0.35 else "LOW"),
                    "uncertainty_status": pred["uncertainty_status"]
                })

        return {
            "student_id": student_id,
            "semester_progression": semester_history,
            "current_semester_checkpoint_trajectory": in_sem_progression
        }

    def get_prioritized_intervention_queue(self, checkpoint="W12", limit=50):
        """
        Returns a sorted queue of students requiring institutional intervention.
        """
        df = self.datasets[checkpoint.upper()]
        queue = self.intervention_engine.rank_intervention_queue(df.head(100), checkpoint=checkpoint)
        return queue[:limit]

    def get_cohort_analytics_overview(self):
        """
        Aggregates risk distributions and uncertainty across checkpoints.
        """
        summary_csv = os.path.join(RESULTS_DIR, "conformal_summary.csv")
        conformal_summary = pd.read_csv(summary_csv).to_dict(orient="records") if os.path.exists(summary_csv) else []

        distribution = {}
        for cp in ["W4", "W8", "W12"]:
            df = self.datasets[cp]
            pipeline = self.conformal_engine.models[cp]
            feature_cols = self.conformal_engine.feature_cols_map[cp]
            probs = pipeline.predict_proba(df[feature_cols])[:, 1]

            high_count = int(np.sum(probs >= 0.65))
            med_count = int(np.sum((probs >= 0.35) & (probs < 0.65)))
            low_count = int(np.sum(probs < 0.35))

            distribution[cp] = {
                "total_observations": len(df),
                "high_risk_count": high_count,
                "medium_risk_count": med_count,
                "low_risk_count": low_count,
                "high_risk_percentage": round(high_count / len(df) * 100, 2),
                "medium_risk_percentage": round(med_count / len(df) * 100, 2),
                "low_risk_percentage": round(low_count / len(df) * 100, 2)
            }

        return {
            "data_provenance": "SYNTHETIC_ML_VALIDATED_DATASET",
            "checkpoint_risk_distributions": distribution,
            "conformal_calibration_summary": conformal_summary,
            "disclaimer": "Cohort analytics reflect the validated synthetic longitudinal dataset and are provided for system verification."
        }


# Global Singleton
_ORCHESTRATION_SERVICE = None

def get_orchestration_service():
    global _ORCHESTRATION_SERVICE
    if _ORCHESTRATION_SERVICE is None:
        _ORCHESTRATION_SERVICE = AcademicRiskOrchestrationService()
    return _ORCHESTRATION_SERVICE
