# EduInsight AI — Academic Project Report Outline (15 Chapters)

---

## Chapter 1: Introduction
- 1.1 Context of Higher Education Analytics
- 1.2 The Problem of Retrospective Risk Identification
- 1.3 Objectives of EduInsight AI
- 1.4 Scope and Organization of the Report

## Chapter 2: Literature Review & Related Work
- 2.1 Student Performance Prediction & Early Warning Systems
- 2.2 Explainable AI (XAI) in Educational Data Mining
- 2.3 Uncertainty Quantification & Conformal Prediction
- 2.4 Counterfactual Explanations for Actionable Recourse
- 2.5 Research Gaps in Existing Decision Support Architectures

## Chapter 3: Existing Operational Foundation
- 3.1 16-Table PostgreSQL Relational Schema
- 3.2 Relational Entities: Students, Enrollments, Marks, Exams, Fees
- 3.3 Limitations of Conventional DBMS & SQL Aggregations

## Chapter 4: Proposed System Architecture
- 4.1 Multi-Tier Architectural Design
- 4.2 Decoupling Operational Records from Machine Learning Data
- 4.3 Data Flow Across the 5-Stage Decision Pipeline

## Chapter 5: Dataset & Temporal Feature Engineering
- 5.1 Synthetic Longitudinal Cohort Generation Methodology
- 5.2 Multi-Checkpoint Design (Week 4, Week 8, Week 12)
- 5.3 Velocity & Momentum Feature Engineering ($\Delta Marks$, $\Delta Att$, $Trend$)
- 5.4 Leakage Prevention Guardrails (Student, Temporal, and Target)

## Chapter 6: Predictive Modeling & Checkpoint Evaluation
- 6.1 Supervised Baseline: Logistic Regression with Balanced Class Weights
- 6.2 Ensemble Architectures: Random Forest & XGBoost Classifiers
- 6.3 5-Fold GroupKFold Cross-Validation Protocol
- 6.4 Model Comparison: PR-AUC, ROC-AUC, Brier Calibration, and F1 Metrics

## Chapter 7: Explainability Layer (SHAP)
- 7.1 TreeExplainer Mathematical Formulation
- 7.2 Global Institutional Feature Rankings Across Checkpoints
- 7.3 Local Instance Explanations: Risk Factors vs. Protective Offsets
- 7.4 Non-Causal Semantic Phrasing Protocol

## Chapter 8: Uncertainty Quantification Layer (Conformal Prediction)
- 8.1 Split Conformal Classification Formulation
- 8.2 Nonconformity Function ($s_i = 1 - \hat{p}(Y_i \mid X_i)$) & Finite-Sample Quantiles
- 8.3 Prediction Set Construction & Controlled Status Vocabulary
- 8.4 Empirical Coverage vs. Significance Levels ($\alpha \in \{0.10, 0.05\}$)

## Chapter 9: Counterfactual Academic Simulator
- 9.1 Modifiable vs. Immutable Feature Policy
- 9.2 Physical Bounds & Monotonicity Constraints
- 9.3 Minimum-Change Optimization Objective
- 9.4 Real-Pipeline Re-Evaluation Protocol & Feasibility Classification

## Chapter 10: Prescriptive Academic Intervention Engine
- 10.1 Finite Intervention Catalog (7 Types) & Suggested Actions
- 10.2 Multi-Signal Mapping Rules & Demographic Exclusion Policy
- 10.3 Uncertainty Gating & Priority Matrix (CRITICAL $\to$ NONE)
- 10.4 Multi-Criteria Urgency Score & Student Prioritization Queue

## Chapter 11: End-to-End System Implementation
- 11.1 Central Inference Orchestrator (`AcademicRiskOrchestrationService`)
- 11.2 Python FastAPI Microservice (`ml/api.py`)
- 11.3 Node.js / Express REST API Gateway (`backend/`)
- 11.4 React 18 Dashboard UI & Recharts Data Visualizations (`frontend/`)

## Chapter 12: Experimental Results & Analysis
- 12.1 Predictive Performance Progression Across Checkpoints
- 12.2 Temporal Feature Importance Shifts ($W_4 \to W_8 \to W_{12}$)
- 12.3 Conformal Coverage & Ambiguity Reduction Dynamics
- 12.4 Counterfactual Feasibility & Risk Reduction Statistics

## Chapter 13: System Validation & Testing
- 13.1 Automated Test Suite Verification (41 Tests, 100% Success Rate)
- 13.2 Case Study Evaluations (High Risk, Ambiguous, Safe, Recovery, Decline)
- 13.3 Performance Latency & Scalability Benchmarks
- 13.4 Security, Access Control, and Provenance Audit

## Chapter 14: Limitations & Ethical Governance
- 14.1 Synthetic Data Disclosures & Institutional Calibrations
- 14.2 Observational Association vs. Real-World Causal Mechanisms
- 14.3 Advisory Scope & Faculty Autonomy Safeguards

## Chapter 15: Conclusion & Future Scope
- 15.1 Summary of Contributions
- 15.2 Future Directions: Multi-Institutional Validation & Live LMS Streaming
