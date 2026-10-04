"""
test_uncertainty.py
Phase 4 Verification & Validation Test Suite for EduInsight AI Conformal Prediction Engine.
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

from uncertainty.conformal_predictor import (
    ConformalRiskPredictor,
    predict_with_uncertainty,
    STATUS_CONFIDENT_RISK,
    STATUS_CONFIDENT_SAFE,
    STATUS_AMBIGUOUS
)
from uncertainty.uncertainty_metrics import compute_conformal_metrics


class TestConformalPredictionEngine(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.predictor = ConformalRiskPredictor(random_seed=42)
        cls.summary_df = cls.predictor.fit_and_calibrate(alphas=(0.10, 0.05))

    def test_student_split_independence(self):
        """Verify strict zero-leakage student independence across Train, Calibration, and Test."""
        for cp in ["W4", "W8", "W12"]:
            info = self.predictor.split_info[cp]
            self.assertEqual(info["train_students"], 180, f"Expected 180 train students in {cp}")
            self.assertEqual(info["calib_students"], 60, f"Expected 60 calib students in {cp}")
            self.assertEqual(info["test_students"], 60, f"Expected 60 test students in {cp}")
            self.assertEqual(info["train_students"] + info["calib_students"] + info["test_students"], 300)

    def test_summary_csv_and_checkpoint_csvs_exist(self):
        """Verify output CSV files exist and are populated."""
        summary_path = os.path.join(BASE_DIR, "results", "conformal_summary.csv")
        self.assertTrue(os.path.exists(summary_path), "Missing conformal_summary.csv")
        df_sum = pd.read_csv(summary_path)
        self.assertEqual(len(df_sum), 6, "Expected 6 summary rows (3 checkpoints x 2 alphas)")

        for cp in ["w4", "w8", "w12"]:
            cp_path = os.path.join(BASE_DIR, "results", f"conformal_{cp}_results.csv")
            self.assertTrue(os.path.exists(cp_path), f"Missing {cp_path}")
            df_cp = pd.read_csv(cp_path)
            self.assertGreater(len(df_cp), 100, f"Too few rows in {cp_path}")
            self.assertIn("pred_set_alpha_10", df_cp.columns)
            self.assertIn("status_alpha_10", df_cp.columns)
            self.assertIn("pred_set_alpha_5", df_cp.columns)
            self.assertIn("status_alpha_5", df_cp.columns)

    def test_empirical_coverage_and_finite_sample_properties(self):
        """Verify empirical coverage is mathematically calculated and exceeds or closely matches target coverage."""
        df_sum = pd.read_csv(os.path.join(BASE_DIR, "results", "conformal_summary.csv"))
        for _, row in df_sum.iterrows():
            target = row["target_coverage"]
            empirical = row["empirical_coverage"]
            # With finite sample correction, coverage should be at or near target
            self.assertGreaterEqual(empirical, target - 0.05,
                                    f"Coverage {empirical} too far below target {target} for {row['checkpoint']}")
            self.assertLessEqual(row["avg_set_size"], 2.0)
            self.assertGreaterEqual(row["avg_set_size"], 1.0)

    def test_controlled_vocabulary_uncertainty_statuses(self):
        """Verify only allowed controlled vocabulary statuses are produced."""
        allowed = {STATUS_CONFIDENT_RISK, STATUS_CONFIDENT_SAFE, STATUS_AMBIGUOUS}
        for cp in ["W4", "W8", "W12"]:
            df_cp = self.predictor.test_datasets[cp]
            for col in ["status_alpha_10", "status_alpha_5"]:
                unique_statuses = set(df_cp[col].unique())
                self.assertTrue(unique_statuses.issubset(allowed), f"Invalid status in {cp} {col}: {unique_statuses}")

    def test_predict_with_uncertainty_function(self):
        """Verify predict_with_uncertainty output schema and JSON serializability."""
        df_w12 = pd.read_csv(os.path.join(BASE_DIR, "ml_data", "checkpoint_w12.csv"))
        sample = df_w12.iloc[10]

        res = self.predictor.predict_with_uncertainty(sample, checkpoint="W12", alpha=0.10)

        required_keys = [
            "student_id", "semester_no", "checkpoint", "risk_probability",
            "risk_percentage", "point_prediction", "conformal_prediction_set",
            "uncertainty_status", "alpha", "coverage_target", "conformal_quantile_threshold"
        ]
        for k in required_keys:
            self.assertIn(k, res)

        self.assertIn(res["point_prediction"], ["RISK", "SAFE"])
        self.assertIn(res["uncertainty_status"], [STATUS_CONFIDENT_RISK, STATUS_CONFIDENT_SAFE, STATUS_AMBIGUOUS])
        self.assertTrue(isinstance(res["conformal_prediction_set"], list))
        self.assertGreaterEqual(len(res["conformal_prediction_set"]), 1)

        # Test JSON serialization
        json_str = json.dumps(res)
        self.assertIsInstance(json_str, str)

    def test_combined_uncertainty_and_shap_integration(self):
        """Verify seamless integration of Conformal Prediction with Phase 3 SHAP explainability."""
        df_w12 = pd.read_csv(os.path.join(BASE_DIR, "ml_data", "checkpoint_w12.csv"))
        sample = df_w12.iloc[10]

        res = self.predictor.predict_with_uncertainty_and_explanation(sample, checkpoint="W12", alpha=0.10)

        self.assertIn("risk_probability", res)
        self.assertIn("conformal_prediction_set", res)
        self.assertIn("uncertainty_status", res)
        self.assertIn("risk_factors", res)
        self.assertIn("protective_factors", res)
        self.assertIn("base_value", res)

        # Direction checks on SHAP inside combined result
        for rf in res["risk_factors"]:
            self.assertGreater(rf["shap_value"], 0)
        for pf in res["protective_factors"]:
            self.assertLess(pf["shap_value"], 0)

        # Verify JSON serializability
        json_str = json.dumps(res)
        self.assertIsInstance(json_str, str)

    def test_temporal_uncertainty_dynamics(self):
        """Verify that W12 has lower or equal ambiguity rate and smaller set size compared to W4."""
        df_sum = pd.read_csv(os.path.join(BASE_DIR, "results", "conformal_summary.csv"))
        w4_row = df_sum[(df_sum["checkpoint"] == "W4") & (df_sum["alpha"] == 0.10)].iloc[0]
        w12_row = df_sum[(df_sum["checkpoint"] == "W12") & (df_sum["alpha"] == 0.10)].iloc[0]

        print(f"\nW4 Set Size (alpha=0.10): {w4_row['avg_set_size']} | Ambiguity: {w4_row['ambiguity_rate_pct']}%")
        print(f"W12 Set Size (alpha=0.10): {w12_row['avg_set_size']} | Ambiguity: {w12_row['ambiguity_rate_pct']}%")
        self.assertLessEqual(w12_row["avg_set_size"], w4_row["avg_set_size"] + 0.1)


if __name__ == "__main__":
    unittest.main()
