"""
intervention_space.py
Intervention Space Specification & Policy for EduInsight AI Counterfactual Simulator (Phase 5).

Defines:
- Modifiable academic feature policies per checkpoint (W4, W8, W12)
- Strict non-modifiable (immutable) feature protections
- Forbidden outcome/leakage variable safeguards
- Realistic feature domain bounds (percentages 0-100, subject counts >= 0)
- Dynamic trajectory delta recalculation logic (e.g. marks_change, attendance_change)
"""

import numpy as np
import pandas as pd

# -------------------------------------------------------------
# 1. Feature Policies
# -------------------------------------------------------------

MODIFIABLE_FEATURES_BY_CHECKPOINT = {
    "W4": [
        "attendance_pct_w4",
        "internal_marks_avg_w4",
        "low_attendance_subjects_w4",
        "low_scoring_subjects_w4"
    ],
    "W8": [
        "attendance_pct_w8",
        "internal_marks_avg_w8",
        "low_attendance_subjects_w8",
        "low_scoring_subjects_w8"
    ],
    "W12": [
        "attendance_pct_w12",
        "internal_marks_avg_w12",
        "low_attendance_subjects_w12",
        "low_scoring_subjects_w12"
    ]
}

IMMUTABLE_FEATURES = {
    # Identity & Admissions
    "student_id", "cohort_entry_year", "dept_code", "course_code",
    "admission_category", "fee_payment_status", "entrance_rank_percentile",
    "total_registered_credits", "semester_no", "semester_id", "academic_year",
    # Historical Academic Track Record (Cannot be altered retroactively in-semester)
    "previous_sgpa", "cumulative_cgpa_prior",
    "previous_attendance_pct", "previous_backlogs_count",
    "historical_backlogs_cumulative"
}

FORBIDDEN_LEAKAGE_VARIABLES = {
    "final_sgpa", "final_cgpa", "final_marks_average",
    "final_backlogs_count", "final_backlog_bucket",
    "final_result_classification", "target_risk"
}

# -------------------------------------------------------------
# 2. Realistic Bounds & Step Specs
# -------------------------------------------------------------

FEATURE_BOUNDS = {
    "attendance_pct_w4": (0.0, 100.0),
    "attendance_pct_w8": (0.0, 100.0),
    "attendance_pct_w12": (0.0, 100.0),
    "internal_marks_avg_w4": (0.0, 100.0),
    "internal_marks_avg_w8": (0.0, 100.0),
    "internal_marks_avg_w12": (0.0, 100.0),
    "low_attendance_subjects_w4": (0, 6),
    "low_attendance_subjects_w8": (0, 6),
    "low_attendance_subjects_w12": (0, 6),
    "low_scoring_subjects_w4": (0, 6),
    "low_scoring_subjects_w8": (0, 6),
    "low_scoring_subjects_w12": (0, 6),
}

# Standard realistic intervention grid steps
ATTENDANCE_STEPS = [5.0, 10.0, 15.0, 20.0]  # Percentage points
MARKS_STEPS = [5.0, 10.0, 15.0, 20.0]       # Marks points
SUBJECT_CLEAR_STEPS = [1, 2, 3]             # Number of failing subjects remediated


def is_feature_modifiable(feature_name, checkpoint):
    """Checks if a feature is permissible for counterfactual perturbation at the given checkpoint."""
    cp_upper = checkpoint.upper()
    return feature_name in MODIFIABLE_FEATURES_BY_CHECKPOINT.get(cp_upper, [])


def validate_intervention_bounds(feature_name, current_val, proposed_val):
    """
    Validates whether a proposed counterfactual value is physically and semantically realistic.
    Returns (is_valid, reason).
    """
    if feature_name in IMMUTABLE_FEATURES:
        return False, f"Feature '{feature_name}' is immutable demographic/historical metadata and cannot be modified."
    if feature_name in FORBIDDEN_LEAKAGE_VARIABLES:
        return False, f"Feature '{feature_name}' is a forbidden downstream outcome variable."

    bounds = FEATURE_BOUNDS.get(feature_name)
    if bounds:
        min_b, max_b = bounds
        if proposed_val < min_b:
            return False, f"Proposed value {proposed_val} is below minimum physical bound {min_b}."
        if proposed_val > max_b:
            return False, f"Proposed value {proposed_val} exceeds maximum physical bound {max_b} (e.g. attendance > 100%)."

    # Monotonicity check: interventions are intended to improve academic performance
    if "low_scoring" in feature_name or "low_attendance" in feature_name:
        if proposed_val > current_val:
            return False, f"Intervention would unhelpfully increase low-scoring/low-attendance subject count ({current_val} -> {proposed_val})."
    elif "attendance_pct" in feature_name or "internal_marks_avg" in feature_name:
        if proposed_val < current_val:
            return False, f"Intervention would unhelpfully degrade attendance/marks ({current_val} -> {proposed_val})."

    return True, "Valid"


def update_dependent_temporal_features(row_dict, checkpoint):
    """
    Dynamically recalculates derived velocity and trend features when in-semester
    attendance or marks are modified in a counterfactual scenario.
    """
    cp = checkpoint.upper()
    updated = dict(row_dict)

    if cp == "W8":
        # Recalculate W4 -> W8 deltas
        if "internal_marks_avg_w8" in updated and "internal_marks_avg_w4" in updated:
            updated["marks_change_w4_w8"] = round(float(updated["internal_marks_avg_w8"]) - float(updated["internal_marks_avg_w4"]), 2)
        if "attendance_pct_w8" in updated and "attendance_pct_w4" in updated:
            updated["attendance_change_w4_w8"] = round(float(updated["attendance_pct_w8"]) - float(updated["attendance_pct_w4"]), 2)

    elif cp == "W12":
        # Recalculate W8 -> W12 deltas and overall performance trend
        if "internal_marks_avg_w12" in updated and "internal_marks_avg_w8" in updated:
            updated["marks_change_w8_w12"] = round(float(updated["internal_marks_avg_w12"]) - float(updated["internal_marks_avg_w8"]), 2)
        if "attendance_pct_w12" in updated and "attendance_pct_w8" in updated:
            updated["attendance_change_w8_w12"] = round(float(updated["attendance_pct_w12"]) - float(updated["attendance_pct_w8"]), 2)
        if "internal_marks_avg_w12" in updated and "internal_marks_avg_w4" in updated:
            updated["performance_trend"] = round(float(updated["internal_marks_avg_w12"]) - float(updated["internal_marks_avg_w4"]), 2)

    return updated
