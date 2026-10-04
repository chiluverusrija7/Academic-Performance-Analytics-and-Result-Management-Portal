"""
test_integration_phase7.py
Phase 7 End-to-End Verification & Integration Test Suite for EduInsight AI Decision Support System.
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

from services.academic_risk_service import AcademicRiskOrchestrationService, get_orchestration_service


class TestEndToEndIntegrationPhase7(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.service = get_orchestration_service()

    def test_student_listing_and_provenance(self):
        """Verify student search/listing returns expected metadata and explicit data provenance."""
        students = self.service.get_available_students(limit=25)
        self.assertGreaterEqual(len(students), 10)
        for s in students:
            self.assertIn("student_id", s)
            self.assertIn("dept_code", s)
            self.assertIn("current_semester", s)
            self.assertEqual(s["data_source"], "SYNTHETIC_ML_DATASET")

    def test_end_to_end_analysis_w4(self):
        """Verify complete W4 analysis chain: Provenance + Prediction + SHAP + Conformal + CF + Interventions."""
        res = self.service.analyze_student(student_id="STU0016", semester_no=2, checkpoint="W4")

        # Provenance
        self.assertEqual(res["provenance"]["checkpoint"], "W4")
        self.assertFalse(res["provenance"]["is_operational_db"])
        self.assertIn("analysis_timestamp", res["provenance"])

        # Prediction
        self.assertIn("risk_probability", res["prediction"])
        self.assertIn(res["prediction"]["point_prediction"], ["RISK", "SAFE"])

        # Conformal Uncertainty
        self.assertIn("uncertainty_status", res["uncertainty"])
        self.assertIn("conformal_prediction_set", res["uncertainty"])

        # SHAP Explainability
        self.assertIn("risk_factors", res["explainability"])
        self.assertIn("non_causal_disclaimer", res["explainability"])

        # Counterfactual Simulation
        self.assertIn("counterfactual", res)

        # Intervention Plan
        self.assertIn("primary_intervention", res["intervention_plan"])
        self.assertIn("priority", res["intervention_plan"])

    def test_end_to_end_analysis_w8(self):
        """Verify complete W8 analysis chain."""
        res = self.service.analyze_student(student_id="STU0017", semester_no=2, checkpoint="W8")
        self.assertEqual(res["provenance"]["checkpoint"], "W8")
        self.assertIn("risk_probability", res["prediction"])
        self.assertIn("primary_intervention", res["intervention_plan"])

    def test_end_to_end_analysis_w12(self):
        """Verify complete W12 analysis chain."""
        res = self.service.analyze_student(student_id="STU0016", semester_no=2, checkpoint="W12")
        self.assertEqual(res["provenance"]["checkpoint"], "W12")
        self.assertIn("risk_probability", res["prediction"])
        self.assertIn("uncertainty_status", res["uncertainty"])

    def test_interactive_custom_counterfactual_valid(self):
        """Verify user-defined what-if simulation with valid feature improvements."""
        deltas = {
            "attendance_pct_w12": 88.0,
            "internal_marks_avg_w12": 62.0
        }
        res = self.service.simulate_custom_counterfactual(
            student_id="STU0016",
            semester_no=2,
            checkpoint="W12",
            custom_deltas=deltas
        )

        self.assertEqual(res["status"], "SUCCESS")
        self.assertTrue(res["is_feasible"])
        self.assertLess(res["counterfactual_risk_probability"], res["original_risk_probability"])
        self.assertGreater(res["risk_reduction"], 0.0)
        self.assertIn(res["point_prediction"], ["RISK", "SAFE"])

    def test_interactive_custom_counterfactual_bounds_rejection(self):
        """Verify out-of-bounds what-if simulation is rejected (e.g. attendance > 100%)."""
        invalid_deltas = {
            "attendance_pct_w12": 115.0  # Impossible bound
        }
        res = self.service.simulate_custom_counterfactual(
            student_id="STU0016",
            semester_no=2,
            checkpoint="W12",
            custom_deltas=invalid_deltas
        )

        self.assertEqual(res["status"], "VALIDATION_FAILED")
        self.assertFalse(res["is_feasible"])
        self.assertGreater(len(res["errors"]), 0)
        self.assertIn("exceeds maximum physical bound", res["errors"][0])

    def test_longitudinal_trajectory_retrieval(self):
        """Verify longitudinal trajectory across historical semesters and in-semester milestones."""
        traj = self.service.get_student_longitudinal_trajectory(student_id="STU0001")
        self.assertEqual(traj["student_id"], "STU0001")
        self.assertGreaterEqual(len(traj["semester_progression"]), 1)
        self.assertTrue(all(s["is_historical_outcome"] for s in traj["semester_progression"]))

        # In-semester progression
        in_sem = traj["current_semester_checkpoint_trajectory"]
        self.assertGreaterEqual(len(in_sem), 1)
        checkpoints_present = [item["checkpoint"] for item in in_sem]
        self.assertTrue(set(checkpoints_present).issubset({"W4", "W8", "W12"}))

    def test_prioritized_intervention_queue(self):
        """Verify faculty prioritized intervention queue ordering."""
        queue = self.service.get_prioritized_intervention_queue(checkpoint="W12", limit=20)
        self.assertGreater(len(queue), 0)
        for i in range(len(queue) - 1):
            self.assertGreaterEqual(queue[i]["urgency_score"], queue[i+1]["urgency_score"])
            self.assertEqual(queue[i]["rank"], i + 1)

    def test_cohort_analytics_overview(self):
        """Verify aggregate analytics returns distribution across all checkpoints."""
        analytics = self.service.get_cohort_analytics_overview()
        self.assertIn("checkpoint_risk_distributions", analytics)
        for cp in ["W4", "W8", "W12"]:
            self.assertIn(cp, analytics["checkpoint_risk_distributions"])
            dist = analytics["checkpoint_risk_distributions"][cp]
            self.assertIn("high_risk_count", dist)
            self.assertIn("medium_risk_count", dist)
            self.assertIn("low_risk_count", dist)

    def test_error_handling_nonexistent_student(self):
        """Verify graceful error handling for missing student ID."""
        with self.assertRaises(LookupError):
            self.service.analyze_student(student_id="NON_EXISTENT_STU_9999", checkpoint="W12")

    def test_error_handling_invalid_checkpoint(self):
        """Verify graceful error handling for invalid checkpoint."""
        with self.assertRaises(ValueError):
            self.service.analyze_student(student_id="STU0001", checkpoint="W16_INVALID")

    def test_complete_demo_workflow_execution(self):
        """Complete end-to-end integration scenario execution."""
        # Step 1: Search & select student
        students = self.service.get_available_students(limit=5)
        target_student = students[0]["student_id"]

        # Step 2: Query multi-checkpoint predictions
        w4_res = self.service.analyze_student(student_id=target_student, checkpoint="W4")
        w8_res = self.service.analyze_student(student_id=target_student, checkpoint="W8")
        w12_res = self.service.analyze_student(student_id=target_student, checkpoint="W12")

        # Step 3: Verify consistency
        self.assertIsNotNone(w4_res["prediction"]["risk_probability"])
        self.assertIsNotNone(w8_res["prediction"]["risk_probability"])
        self.assertIsNotNone(w12_res["prediction"]["risk_probability"])

        # Step 4: Verify full JSON serializability of all outputs
        for res_obj in [w4_res, w8_res, w12_res]:
            serialized = json.dumps(res_obj)
            self.assertIsInstance(serialized, str)


if __name__ == "__main__":
    unittest.main()
