"""
test_counterfactual.py
Phase 5 Verification & Validation Test Suite for EduInsight AI Counterfactual Academic Simulator.
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

from counterfactual.counterfactual_engine import (
    CounterfactualAcademicSimulator,
    generate_counterfactual,
    generate_representative_case_studies
)
from counterfactual.intervention_space import (
    is_feature_modifiable,
    validate_intervention_bounds,
    IMMUTABLE_FEATURES,
    FORBIDDEN_LEAKAGE_VARIABLES
)


class TestCounterfactualSimulator(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.simulator = CounterfactualAcademicSimulator()
        cls.cases, cls.df_summary = generate_representative_case_studies()

    def test_immutable_and_forbidden_feature_protections(self):
        """Verify demographic, historical, and leakage variables can NEVER be modified."""
        for feat in IMMUTABLE_FEATURES:
            self.assertFalse(is_feature_modifiable(feat, "W4"), f"Immutable {feat} marked modifiable in W4")
            self.assertFalse(is_feature_modifiable(feat, "W8"), f"Immutable {feat} marked modifiable in W8")
            self.assertFalse(is_feature_modifiable(feat, "W12"), f"Immutable {feat} marked modifiable in W12")
            is_valid, reason = validate_intervention_bounds(feat, 50, 70)
            self.assertFalse(is_valid)

        for feat in FORBIDDEN_LEAKAGE_VARIABLES:
            self.assertFalse(is_feature_modifiable(feat, "W12"), f"Leakage {feat} marked modifiable")

    def test_physical_bounds_validation(self):
        """Verify realistic bounds checking (percentages in [0, 100], positive counts)."""
        # Attendance > 100% must be invalid
        is_valid, _ = validate_intervention_bounds("attendance_pct_w8", 92.0, 108.0)
        self.assertFalse(is_valid)

        # Marks > 100 must be invalid
        is_valid, _ = validate_intervention_bounds("internal_marks_avg_w12", 95.0, 105.0)
        self.assertFalse(is_valid)

        # Negative failing subject count must be invalid
        is_valid, _ = validate_intervention_bounds("low_scoring_subjects_w4", 0, -1)
        self.assertFalse(is_valid)

        # Realistic improvement must be valid
        is_valid, _ = validate_intervention_bounds("attendance_pct_w8", 65.0, 75.0)
        self.assertTrue(is_valid)

    def test_temporal_feature_policy_consistency(self):
        """Verify W4 only modifies W4 features, W8 only W8 features, W12 only W12 features."""
        w4_mods = ["attendance_pct_w4", "internal_marks_avg_w4", "low_attendance_subjects_w4", "low_scoring_subjects_w4"]
        for f in w4_mods:
            self.assertTrue(is_feature_modifiable(f, "W4"))
            self.assertFalse(is_feature_modifiable(f, "W8"))
            self.assertFalse(is_feature_modifiable(f, "W12"))

        w8_mods = ["attendance_pct_w8", "internal_marks_avg_w8", "low_attendance_subjects_w8", "low_scoring_subjects_w8"]
        for f in w8_mods:
            self.assertTrue(is_feature_modifiable(f, "W8"))
            self.assertFalse(is_feature_modifiable(f, "W4"))

    def test_counterfactual_risk_reduction_and_recalculation(self):
        """Verify counterfactual probability is calculated via real pipeline and strictly reduces risk."""
        df_w12 = pd.read_csv(os.path.join(BASE_DIR, "ml_data", "checkpoint_w12.csv"))
        at_risk_record = df_w12[(df_w12["target_risk"] == 1) & (df_w12["internal_marks_avg_w12"] < 60)].iloc[0]

        res = self.simulator.simulate_counterfactual(at_risk_record, checkpoint="W12")

        self.assertIn(res["feasibility_status"], ["FEASIBLE_THRESHOLD_CROSSED", "FEASIBLE_PARTIAL_REDUCTION"])
        self.assertGreater(res["counterfactual"]["probability_reduction"], 0.0)
        self.assertLess(res["counterfactual"]["risk_probability"], res["current"]["risk_probability"])

    def test_safe_student_filtering(self):
        """Verify safe students do not receive unnecessary remedial interventions."""
        df_w8 = pd.read_csv(os.path.join(BASE_DIR, "ml_data", "checkpoint_w8.csv"))
        safe_record = df_w8[df_w8["target_risk"] == 0].iloc[0]

        res = self.simulator.simulate_counterfactual(safe_record, checkpoint="W8")
        self.assertEqual(res["status"], "NO_INTERVENTION_NEEDED")
        self.assertIsNone(res["counterfactual"])

    def test_uncertainty_and_shap_integration_in_counterfactuals(self):
        """Verify counterfactuals report both conformal uncertainty and SHAP shifts."""
        df_w8 = pd.read_csv(os.path.join(BASE_DIR, "ml_data", "checkpoint_w8.csv"))
        at_risk_w8 = df_w8[df_w8["target_risk"] == 1].iloc[0]

        res = self.simulator.simulate_counterfactual(at_risk_w8, checkpoint="W8")

        if res.get("counterfactual"):
            self.assertIn("uncertainty_status", res["current"])
            self.assertIn("uncertainty_status", res["counterfactual"])
            self.assertIn("top_risk_factors", res["current"])
            self.assertIn("top_risk_factors", res["counterfactual"])
            self.assertIn("conformal_prediction_set", res["counterfactual"])

    def test_artifacts_saved_and_valid(self):
        """Verify results CSV and JSON artifacts exist and are non-empty."""
        json_path = os.path.join(BASE_DIR, "results", "sample_counterfactuals.json")
        csv_path = os.path.join(BASE_DIR, "results", "counterfactual_cases.csv")

        self.assertTrue(os.path.exists(json_path))
        self.assertTrue(os.path.exists(csv_path))

        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        self.assertEqual(len(data), 6)

        df = pd.read_csv(csv_path)
        self.assertEqual(len(df), 6)
        self.assertIn("feasibility_status", df.columns)
        self.assertIn("probability_reduction", df.columns)


if __name__ == "__main__":
    unittest.main()
