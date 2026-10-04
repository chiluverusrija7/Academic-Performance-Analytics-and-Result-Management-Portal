"""
test_interventions.py
Phase 6 Verification & Validation Test Suite for EduInsight AI Prescriptive Academic Intervention Engine.
"""

import os
import sys
import json
import unittest
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from interventions.intervention_library import (
    ALL_INTERVENTION_TYPES,
    EXCLUDED_INTERVENTION_TRIGGERS,
    TYPE_ATTENDANCE_SUPPORT,
    TYPE_SUBJECT_REMEDIATION,
    TYPE_FACULTY_MENTORING,
    TYPE_STUDY_PLAN,
    TYPE_NO_INTERVENTION,
    is_actionable_feature
)
from interventions.intervention_engine import (
    AcademicInterventionEngine,
    generate_intervention_plan,
    run_batch_intervention_generation,
    PRIORITY_CRITICAL,
    PRIORITY_HIGH,
    PRIORITY_MEDIUM,
    PRIORITY_LOW,
    PRIORITY_NONE
)


class TestInterventionEngine(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.engine = AcademicInterventionEngine()
        cls.df_queue, cls.json_plans = run_batch_intervention_generation()

    def test_intervention_catalog_and_types(self):
        """Verify all returned intervention types belong to the finite, approved catalog."""
        for plan in self.json_plans:
            prim_type = plan["primary_intervention"]["type"]
            self.assertIn(prim_type, ALL_INTERVENTION_TYPES)
            if plan.get("secondary_intervention"):
                sec_type = plan["secondary_intervention"]["type"]
                self.assertIn(sec_type, ALL_INTERVENTION_TYPES)

    def test_demographic_and_protected_feature_exclusion(self):
        """Verify demographic and identity features never directly appear as actionable triggers."""
        for feat in EXCLUDED_INTERVENTION_TRIGGERS:
            self.assertFalse(is_actionable_feature(feat), f"Demographic/leakage feature {feat} allowed as trigger")

        for plan in self.json_plans:
            triggers = plan["primary_intervention"].get("trigger_evidence", [])
            for trig in triggers:
                for excl in EXCLUDED_INTERVENTION_TRIGGERS:
                    self.assertNotIn(f"{excl} ", trig)

    def test_no_intervention_for_safe_students(self):
        """Verify low-risk confident safe students receive NO_INTERVENTION."""
        df_w12 = pd.read_csv(os.path.join(BASE_DIR, "ml_data", "checkpoint_w12.csv"))
        safe_record = df_w12[(df_w12["target_risk"] == 0) & (df_w12["internal_marks_avg_w12"] > 75)].iloc[0]

        plan = self.engine.generate_intervention_plan(safe_record, checkpoint="W12")
        self.assertEqual(plan["priority"], PRIORITY_NONE)
        self.assertEqual(plan["primary_intervention"]["type"], TYPE_NO_INTERVENTION)
        self.assertIsNone(plan["secondary_intervention"])

    def test_critical_priority_assignment(self):
        """Verify severe high-risk students receive CRITICAL or HIGH priority."""
        df_w12 = pd.read_csv(os.path.join(BASE_DIR, "ml_data", "checkpoint_w12.csv"))
        severe_record = df_w12[(df_w12["target_risk"] == 1) & (df_w12["internal_marks_avg_w12"] < 45)].iloc[0]

        plan = self.engine.generate_intervention_plan(severe_record, checkpoint="W12")
        self.assertIn(plan["priority"], [PRIORITY_CRITICAL, PRIORITY_HIGH])
        self.assertIn(plan["primary_intervention"]["type"], [TYPE_SUBJECT_REMEDIATION, TYPE_ATTENDANCE_SUPPORT])

    def test_uncertainty_gating(self):
        """Verify AMBIGUOUS predictions are capped at MEDIUM priority to prevent premature escalation."""
        # Simulated borderline observation
        df_w4 = pd.read_csv(os.path.join(BASE_DIR, "ml_data", "checkpoint_w4.csv"))
        amb_candidate = df_w4.iloc[10].copy()
        amb_candidate["attendance_pct_w4"] = 72.0
        amb_candidate["internal_marks_avg_w4"] = 55.0

        plan = self.engine.generate_intervention_plan(amb_candidate, checkpoint="W4", alpha=0.05)
        if plan["uncertainty_status"] == "AMBIGUOUS":
            self.assertIn(plan["priority"], [PRIORITY_MEDIUM, PRIORITY_LOW])

    def test_counterfactual_evidence_integration(self):
        """Verify feasible counterfactuals are cleanly attached to intervention plans."""
        df_w12 = pd.read_csv(os.path.join(BASE_DIR, "ml_data", "checkpoint_w12.csv"))
        at_risk = df_w12[df_w12["target_risk"] == 1].iloc[0]

        plan = self.engine.generate_intervention_plan(at_risk, checkpoint="W12")
        if plan.get("counterfactual_evidence"):
            cf = plan["counterfactual_evidence"]
            self.assertIn("scenario_name", cf)
            self.assertIn("predicted_risk_reduction", cf)
            self.assertGreaterEqual(cf["predicted_risk_reduction"], 0.0)

    def test_student_prioritization_queue_ranking(self):
        """Verify intervention queue is sorted descending by urgency score."""
        df_w12 = pd.read_csv(os.path.join(BASE_DIR, "ml_data", "checkpoint_w12.csv")).head(20)
        queue = self.engine.rank_intervention_queue(df_w12, checkpoint="W12")

        if len(queue) > 1:
            for i in range(len(queue) - 1):
                self.assertGreaterEqual(queue[i]["urgency_score"], queue[i+1]["urgency_score"])
                self.assertEqual(queue[i]["rank"], i + 1)

    def test_dashboard_export_artifacts(self):
        """Verify results CSV and JSON files exist, are non-empty, and contain required schema."""
        csv_path = os.path.join(BASE_DIR, "results", "intervention_plans.csv")
        json_path = os.path.join(BASE_DIR, "results", "intervention_plans.json")

        self.assertTrue(os.path.exists(csv_path))
        self.assertTrue(os.path.exists(json_path))

        df_q = pd.read_csv(csv_path)
        self.assertGreater(len(df_q), 10)
        self.assertIn("primary_intervention", df_q.columns)
        self.assertIn("urgency_score", df_q.columns)

        with open(json_path, "r", encoding="utf-8") as f:
            plans = json.load(f)
        self.assertGreater(len(plans), 10)
        self.assertIn("primary_intervention", plans[0])


if __name__ == "__main__":
    unittest.main()
