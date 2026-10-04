"""
test_explainability.py
Phase 3 Verification & Validation Test Suite for EduInsight AI Explainability Engine.
"""

import os
import json
import unittest
import pandas as pd
import numpy as np

import sys
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from explainability.shap_explainer import AcademicRiskSHAPExplainer
from explainability.risk_explanation import generate_risk_explanation, select_representative_cases


class TestExplainabilityEngine(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.explainer = AcademicRiskSHAPExplainer()
        cls.explainer.run_all_checkpoints()

    def test_global_shap_files_exist(self):
        for cp in ["w4", "w8", "w12"]:
            csv_path = os.path.join(BASE_DIR, "reports", f"shap_global_{cp}.csv")
            self.assertTrue(os.path.exists(csv_path), f"Missing CSV: {csv_path}")
            df = pd.read_csv(csv_path)
            self.assertGreater(len(df), 15, f"Too few features in {csv_path}")
            self.assertIn("feature", df.columns)
            self.assertIn("mean_abs_shap", df.columns)
            self.assertIn("rank", df.columns)
            self.assertTrue((df["mean_abs_shap"] >= 0).all(), "Negative mean absolute SHAP detected")

    def test_figures_exist_and_non_empty(self):
        figs = [
            "shap_w4_global_bar.png", "shap_w4_beeswarm.png",
            "shap_w8_global_bar.png", "shap_w8_beeswarm.png",
            "shap_w12_global_bar.png", "shap_w12_beeswarm.png"
        ]
        for fig in figs:
            p = os.path.join(BASE_DIR, "reports", "figures", fig)
            self.assertTrue(os.path.exists(p), f"Missing plot: {p}")
            self.assertGreater(os.path.getsize(p), 1000, f"Empty plot file: {p}")

    def test_temporal_feature_ranking_transition(self):
        comp_df = self.explainer.get_temporal_comparison_table()
        self.assertIn("feature", comp_df.columns)
        self.assertIn("W4 Rank", comp_df.columns)
        self.assertIn("W8 Rank", comp_df.columns)
        self.assertIn("W12 Rank", comp_df.columns)
        self.assertGreater(len(comp_df), 20)

    def test_local_explanation_structure_and_directionality(self):
        df_w12 = pd.read_csv(os.path.join(BASE_DIR, "ml_data", "checkpoint_w12.csv"))
        sample_record = df_w12.iloc[0]

        exp = generate_risk_explanation(sample_record, checkpoint="W12", top_k=5)

        # Check required fields
        self.assertIn("student_id", exp)
        self.assertIn("semester_no", exp)
        self.assertIn("checkpoint", exp)
        self.assertIn("risk_probability", exp)
        self.assertIn("risk_class", exp)
        self.assertIn("risk_factors", exp)
        self.assertIn("protective_factors", exp)

        # Direction checks
        for rf in exp["risk_factors"]:
            self.assertGreater(rf["shap_value"], 0, "Risk factor SHAP must be > 0")
            self.assertEqual(rf["direction"], "risk_increasing")
            self.assertIn("contributed positively", rf["interpretation"])

        for pf in exp["protective_factors"]:
            self.assertLess(pf["shap_value"], 0, "Protective factor SHAP must be < 0")
            self.assertEqual(pf["direction"], "risk_reducing")

        # JSON Serializability
        json_str = json.dumps(exp)
        self.assertIsInstance(json_str, str)

    def test_multi_checkpoint_local_explanations(self):
        for cp in ["W4", "W8", "W12"]:
            df_cp = pd.read_csv(os.path.join(BASE_DIR, "ml_data", f"checkpoint_{cp.lower()}.csv"))
            exp = generate_risk_explanation(df_cp.iloc[5], checkpoint=cp)
            self.assertEqual(exp["checkpoint"], cp)
            self.assertIn(exp["risk_class"], ["HIGH", "MEDIUM", "LOW"])

    def test_representative_cases_generation(self):
        cases = select_representative_cases("W12")
        self.assertEqual(len(cases), 6)
        out_path = os.path.join(BASE_DIR, "results", "sample_local_explanations.json")
        self.assertTrue(os.path.exists(out_path))
        with open(out_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        self.assertEqual(len(data), 6)

    def test_no_forbidden_target_leakage_in_features(self):
        forbidden = [
            "final_sgpa", "final_cgpa", "final_marks_average",
            "final_backlogs_count", "final_backlog_bucket", "final_result_classification"
        ]
        for cp, feats in self.explainer.feature_names.items():
            for feat in feats:
                self.assertNotIn(feat, forbidden, f"Forbidden leakage column {feat} in checkpoint {cp}")


if __name__ == "__main__":
    unittest.main()
