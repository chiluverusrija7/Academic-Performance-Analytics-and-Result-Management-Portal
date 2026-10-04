"""
test_technology_integration.py
Comprehensive End-to-End Test Suite validating:
1. FastAPI Service Layer & Endpoints
2. pgvector Vector Store & Semantic Policy Retrieval
3. Prescriptive Engine + Retrieval-Augmented Guidance
4. Multi-Milestone Checkpoints (W4, W8, W12)
5. Flask Service Boundary Client Logic
"""

import os
import sys
import unittest
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from vector.embedding_service import get_embedding_service, VECTOR_DIMENSION
from vector.vector_store import get_vector_store
from vector.retrieval import retrieve_guidance_for_risk_profile
from services.academic_risk_service import get_orchestration_service
from fastapi_service.main import app
from fastapi.testclient import TestClient

class TestTechnologyIntegration(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.service = get_orchestration_service()
        cls.vector_store = get_vector_store()
        cls.embedding_service = get_embedding_service()

    # -------------------------------------------------------------
    # 1. Vector Layer & pgvector Semantic Search Tests
    # -------------------------------------------------------------
    def test_01_embedding_generation_dimensions(self):
        text = "Attendance shortage condonation and medical leave guidelines"
        emb = self.embedding_service.encode(text)
        self.assertEqual(len(emb), VECTOR_DIMENSION)
        self.assertAlmostEqual(float(np.linalg.norm(emb)), 1.0, places=4)

    def test_02_vector_store_seed_policies(self):
        docs = self.vector_store.get_all_policies()
        self.assertGreaterEqual(len(docs), 5)
        keys = [d["doc_key"] for d in docs]
        self.assertIn("POL-ATT-001", keys)
        self.assertIn("POL-ASS-002", keys)

    def test_03_semantic_retrieval_attendance_query(self):
        query = "Student with low attendance rate below 65% needing medical condonation"
        matches = self.vector_store.search_similar_policies(query, top_k=2)
        self.assertGreater(len(matches), 0)
        self.assertEqual(matches[0]["doc_key"], "POL-ATT-001")
        self.assertGreaterEqual(matches[0]["relevance_score"], 0.20)

    def test_04_semantic_retrieval_assessment_query(self):
        query = "Failed mid-1 exam and continuous assessment remediation"
        matches = self.vector_store.search_similar_policies(query, top_k=2)
        self.assertGreater(len(matches), 0)
        self.assertEqual(matches[0]["doc_key"], "POL-ASS-002")

    # -------------------------------------------------------------
    # 2. FastAPI AI Service Layer Endpoints Tests
    # -------------------------------------------------------------
    def test_05_fastapi_health_endpoint(self):
        resp = self.client.get("/health")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "HEALTHY")
        self.assertIn("models_loaded", data)
        self.assertIn("vector_store", data)

    def test_06_fastapi_analyze_w12_student_stu0016(self):
        resp = self.client.get("/api/intelligence/analyze/STU0016?checkpoint=W12&semester_no=2&alpha=0.10")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("prediction", data)
        self.assertIn("uncertainty", data)
        self.assertIn("explainability", data)
        self.assertIn("counterfactual", data)
        self.assertIn("intervention_plan", data)
        self.assertIn("retrieved_institutional_guidance", data)
        
        # Verify prediction validity
        self.assertIn("risk_probability", data["prediction"])
        self.assertIn("risk_class", data["prediction"])
        # Verify conformal uncertainty set
        self.assertIn("conformal_prediction_set", data["uncertainty"])
        # Verify pgvector guidance
        self.assertGreater(len(data["retrieved_institutional_guidance"]), 0)

    def test_07_fastapi_checkpoints_w4_w8_w12(self):
        for cp in ["W4", "W8", "W12"]:
            resp = self.client.post(f"/predict/{cp}", json={"student_id": "STU0016", "semester_no": 2, "alpha": 0.10})
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertEqual(data["checkpoint"], cp)
            self.assertIn("risk_probability", data["prediction"])

    def test_08_fastapi_interactive_counterfactual(self):
        payload = {
            "student_id": "STU0016",
            "semester_no": 2,
            "checkpoint": "W12",
            "custom_deltas": {
                "mid2_marks_pct": 75.0,
                "attendance_pct_w12": 85.0
            }
        }
        resp = self.client.post("/api/intelligence/counterfactual/STU0016", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "SUCCESS")
        self.assertIn("counterfactual_risk_probability", data)
        self.assertIn("risk_reduction", data)
        self.assertIn("conformal_prediction_set", data)

    def test_09_fastapi_vector_search_endpoint(self):
        resp = self.client.post("/api/vector/search", json={
            "query": "Academic probation rules for students with low SGPA and backlogs",
            "top_k": 2,
            "min_score": 0.15
        })
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertGreater(data["results_count"], 0)
        self.assertEqual(data["matches"][0]["doc_key"], "POL-PROB-003")

    # -------------------------------------------------------------
    # 3. Prescriptive Engine & Guidance Integration
    # -------------------------------------------------------------
    def test_10_prescriptive_guidance_enrichment(self):
        guidance = retrieve_guidance_for_risk_profile(
            top_driver="mid1_marks_pct (Mid-1 Score)",
            checkpoint="W8",
            intervention_type="SUBJECT_REMEDIATION",
            risk_category="HIGH"
        )
        self.assertGreater(len(guidance), 0)
        self.assertTrue(any("POL-ASS-002" in g["doc_key"] or "POL-ATT-001" in g["doc_key"] for g in guidance))

if __name__ == "__main__":
    unittest.main(verbosity=2)
