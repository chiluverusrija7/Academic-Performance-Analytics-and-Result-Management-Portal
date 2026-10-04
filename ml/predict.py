import os
import json
import joblib
import pandas as pd
import numpy as np

MODEL_DIR = 'd:/EduInsight/ml/models'
MODEL_PATH = os.path.join(MODEL_DIR, 'risk_model.joblib')
PREP_PATH = os.path.join(MODEL_DIR, 'preprocessing.joblib')
SCHEMA_PATH = os.path.join(MODEL_DIR, 'feature_schema.json')

class RiskPredictor:
    def __init__(self, model_path=MODEL_PATH, prep_path=PREP_PATH, schema_path=SCHEMA_PATH):
        if not os.path.exists(model_path) or not os.path.exists(prep_path):
            raise FileNotFoundError("Model artifacts not found. Please run train.py first.")
        
        self.model = joblib.load(model_path)
        self.preprocessor = joblib.load(prep_path)
        
        with open(schema_path, 'r') as f:
            self.schema = json.load(f)

    def predict_single_student(self, student_data):
        """
        Accepts a dictionary of mid-semester student features,
        runs the preprocessing pipeline, and predicts academic risk probability
        along with explainable risk factors.
        """
        df_input = pd.DataFrame([student_data])
        
        # Ensure all required features are present
        for col in self.schema['numeric_features']:
            if col not in df_input.columns:
                df_input[col] = np.nan
        for col in self.schema['categorical_features']:
            if col not in df_input.columns:
                df_input[col] = 'CSE'

        X_proc = self.preprocessor.transform(df_input)
        
        risk_prob = float(self.model.predict_proba(X_proc)[0, 1])
        risk_prob_pct = round(risk_prob * 100, 2)
        
        # Risk categorization
        if risk_prob >= 0.65:
            risk_category = 'HIGH'
        elif risk_prob >= 0.35:
            risk_category = 'MEDIUM'
        else:
            risk_category = 'LOW'

        # Generate Explainable Risk Factors
        explainable_reasons = []
        recommendations = []

        att = student_data.get('attendance_pct_to_date', 100)
        in_sem = student_data.get('in_sem_avg_pct', 100)
        low_subs = student_data.get('low_internal_subjects_count', 0)
        prev_sgpa = student_data.get('previous_sgpa', None)
        prev_backlogs = student_data.get('previous_backlogs', 0)

        if att < 75.0:
            explainable_reasons.append(f"Attendance is below eligibility threshold ({att:.1f}% vs 75% required)")
            recommendations.append("Issue attendance remediation warning and mandate class session recovery")

        if in_sem < 50.0:
            explainable_reasons.append(f"In-semester internal assessment average is critical ({in_sem:.1f}%)")
            recommendations.append("Assign mandatory peer tutoring and faculty office hour consultations")
        elif in_sem < 65.0:
            explainable_reasons.append(f"In-semester assessment performance is moderate ({in_sem:.1f}%)")

        if low_subs > 0:
            explainable_reasons.append(f"Student scored <50% internal marks in {low_subs} subject(s)")
            recommendations.append("Schedule subject-specific remedial problem sessions")

        if prev_backlogs is not None and prev_backlogs > 0:
            explainable_reasons.append(f"Carrying {int(prev_backlogs)} backlog subject(s) from prior semester")
            recommendations.append("Prioritize backlog examination preparation and credit clearance")

        if prev_sgpa is not None and prev_sgpa < 6.0:
            explainable_reasons.append(f"Historical semester standing is low (Previous SGPA: {prev_sgpa:.2f})")

        if not explainable_reasons:
            explainable_reasons.append("Consistently strong attendance, internal performance, and academic standing")
            recommendations.append("Maintain current academic course trajectory")

        return {
          'risk_probability': round(risk_prob, 4),
          'risk_percentage': risk_prob_pct,
          'risk_category': risk_category,
          'explainable_reasons': explainable_reasons,
          'recommendations': recommendations
        }

if __name__ == '__main__':
    # Test Prediction Run
    predictor = RiskPredictor()
    
    sample_high_risk = {
        'department': 'CSE',
        'course': 'B.Tech CSE',
        'current_semester': 3,
        'attendance_pct_to_date': 64.5,
        'in_sem_avg_pct': 42.0,
        'low_internal_subjects_count': 3,
        'subjects_below_internal_threshold': 2,
        'internal_assessment_count': 2,
        'previous_sgpa': 5.2,
        'previous_marks_average': 48.0,
        'previous_backlogs': 1,
        'previous_attendance_pct': 68.0,
        'performance_trend': -0.4,
        'subjects_attempted': 6
    }
    
    res = predictor.predict_single_student(sample_high_risk)
    print("\n--- SAMPLE HIGH RISK PREDICTION RESULT ---")
    print(json.dumps(res, indent=2))
