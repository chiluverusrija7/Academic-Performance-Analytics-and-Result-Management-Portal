"""
intervention_library.py
Prescriptive Academic Intervention Catalog, Action Templates, and Mapping Policy (Phase 6).

Defines:
- Finite library of structured academic intervention types
- Standard action descriptions, suggested workflows, expected model effects, and time horizons
- Demographic and immutable feature exclusion policy (Bias prevention)
- Mapping heuristics correlating SHAP drivers, raw features, and counterfactuals to interventions
"""

import numpy as np

# -------------------------------------------------------------
# 1. Finite Intervention Type Catalog
# -------------------------------------------------------------

TYPE_ATTENDANCE_SUPPORT = "ATTENDANCE_SUPPORT"
TYPE_SUBJECT_REMEDIATION = "SUBJECT_REMEDIATION"
TYPE_FACULTY_MENTORING = "FACULTY_MENTORING"
TYPE_STUDY_PLAN = "STUDY_PLAN"
TYPE_EARLY_COUNSELLING = "EARLY_ACADEMIC_COUNSELLING"
TYPE_PERFORMANCE_MONITORING = "PERFORMANCE_MONITORING"
TYPE_NO_INTERVENTION = "NO_INTERVENTION"

ALL_INTERVENTION_TYPES = [
    TYPE_ATTENDANCE_SUPPORT,
    TYPE_SUBJECT_REMEDIATION,
    TYPE_FACULTY_MENTORING,
    TYPE_STUDY_PLAN,
    TYPE_EARLY_COUNSELLING,
    TYPE_PERFORMANCE_MONITORING,
    TYPE_NO_INTERVENTION
]

# -------------------------------------------------------------
# 2. Detailed Action Templates
# -------------------------------------------------------------

INTERVENTION_TEMPLATES = {
    TYPE_ATTENDANCE_SUPPORT: {
        "title": "Attendance Recovery & Class Engagement Support",
        "suggested_action": "Establish an attendance recovery contract, conduct weekly check-ins with faculty advisor, and notify course instructors for lab/lecture participation monitoring.",
        "expected_model_effect": "Counterfactual simulations indicate that improving in-semester attendance by +5% to +10% substantially reduces predicted risk.",
        "default_time_horizon": "Immediate (Next 2-3 weeks)"
    },
    TYPE_SUBJECT_REMEDIATION: {
        "title": "Targeted Multi-Subject Academic Remediation",
        "suggested_action": "Enroll student in small-group tutorial sessions for high-risk subjects, assign dedicated peer tutors, and conduct remedial assessment drills.",
        "expected_model_effect": "Remediating 1 or more failing subjects below 50% internal mark benchmark is the primary driver for transitioning predictions to SAFE.",
        "default_time_horizon": "Short-term (Next 2-4 weeks)"
    },
    TYPE_FACULTY_MENTORING: {
        "title": "One-on-One Faculty Academic Mentoring",
        "suggested_action": "Schedule bi-weekly advisory sessions with departmental faculty mentor to review assignment bottlenecks, conceptual hurdles, and exam preparation strategies.",
        "expected_model_effect": "Addresses downward trajectory velocity and provides structured guidance to stabilize internal assessment scores.",
        "default_time_horizon": "Ongoing (Mid-to-Late semester)"
    },
    TYPE_STUDY_PLAN: {
        "title": "Structured Study Plan & Time-Management Framework",
        "suggested_action": "Provide guided coursework timetable, milestone-based assignment submission targets, and self-paced remedial module schedules.",
        "expected_model_effect": "Improves continuous internal marks trajectory and mitigates mid-semester performance decline.",
        "default_time_horizon": "Next 2-4 weeks"
    },
    TYPE_EARLY_COUNSELLING: {
        "title": "Comprehensive Academic Standing & Career Counselling",
        "suggested_action": "Conduct formal academic counselling session with Dean of Academics/HOD to review historical backlog clearing plans, credit load balancing, and stress management.",
        "expected_model_effect": "Mitigates cumulative historical backlog burden and prevents compounding academic disengagement.",
        "default_time_horizon": "Immediate (Within 1 week)"
    },
    TYPE_PERFORMANCE_MONITORING: {
        "title": "Low-Intensity Preventive Academic Monitoring",
        "suggested_action": "Place student on automated progress tracking watchlist without intrusive manual intervention; review internal marks at next temporal milestone.",
        "expected_model_effect": "Maintains vigilance for borderline/ambiguous trajectories while avoiding premature intervention overhead.",
        "default_time_horizon": "Until next checkpoint"
    },
    TYPE_NO_INTERVENTION: {
        "title": "No Remedial Intervention Warranted",
        "suggested_action": "Continue regular curriculum; student exhibits strong academic indicators and low predicted risk.",
        "expected_model_effect": "Baseline academic trajectory is secure.",
        "default_time_horizon": "Standard semester progression"
    }
}

# -------------------------------------------------------------
# 3. Demographic and Immutable Feature Exclusion Policy
# -------------------------------------------------------------
# These features must NEVER directly trigger an academic intervention.
EXCLUDED_INTERVENTION_TRIGGERS = {
    "admission_category", "dept_code", "course_code",
    "fee_payment_status", "entrance_rank_percentile",
    "semester_no", "semester_id", "academic_year", "cohort_entry_year",
    "final_sgpa", "final_cgpa", "final_marks_average",
    "final_backlogs_count", "final_backlog_bucket", "final_result_classification", "target_risk"
}


def is_actionable_feature(feature_name):
    """Verifies that a feature is an actionable behavioral or academic metric, not demographic."""
    for excluded in EXCLUDED_INTERVENTION_TRIGGERS:
        if excluded in feature_name:
            return False
    return True
