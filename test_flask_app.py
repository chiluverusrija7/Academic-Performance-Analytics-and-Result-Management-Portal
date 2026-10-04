"""
test_flask_app.py
Unit tests for the Flask presentation layer web application.
"""

import os
import sys
import unittest

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from flask_app.app import app

class TestFlaskApp(unittest.TestCase):

    def setUp(self):
        self.client = app.test_client()
        app.config['TESTING'] = True

    def test_01_index_route(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"EduInsight", response.data)
        self.assertIn(b"5-Stage", response.data)

    def test_02_students_route(self):
        response = self.client.get('/students?id=STU0016&checkpoint=W12')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"STU0016", response.data)

    def test_03_temporal_route(self):
        response = self.client.get('/temporal')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Temporal Model Accuracy", response.data)

    def test_04_whatif_route(self):
        response = self.client.get('/whatif?id=STU0016')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Counterfactual Simulator", response.data)

    def test_05_interventions_route(self):
        response = self.client.get('/interventions')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Student Prioritization", response.data)

    def test_06_tech_stack_route(self):
        response = self.client.get('/architecture')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"FLASK", response.data)
        self.assertIn(b"FASTAPI", response.data)
        self.assertIn(b"PGVECTOR", response.data)
        self.assertIn(b"JAVA AWT", response.data)

if __name__ == "__main__":
    unittest.main(verbosity=2)
