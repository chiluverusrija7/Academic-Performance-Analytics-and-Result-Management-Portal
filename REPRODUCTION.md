# EduInsight AI — Reproduction & Setup Guide

This guide provides step-by-step instructions to reproduce the complete **EduInsight AI** academic decision-support pipeline, including dataset validation, predictive modeling, SHAP explainability, conformal uncertainty, counterfactual simulations, prescriptive interventions, and end-to-end service execution.

---

## 1. System Requirements & Environment

- **Operating System**: Windows 10/11, macOS, or Linux (Ubuntu 20.04+)
- **Python Version**: Python 3.10 to 3.13 (Evaluated on Python 3.13)
- **Node.js**: Node.js 18+ (for Express API Gateway and React Frontend)
- **Database**: PostgreSQL 14+ (16 Relational Operational Tables)

---

## 2. Python Environment & Dependency Installation

1. Create or activate your virtual/Conda environment:
```bash
conda create -n eduinsight python=3.13 -y
conda activate eduinsight
```

2. Install the required Python packages:
```bash
pip install -r ml/requirements.txt
```

*Key Packages Installed*:
- `scikit-learn` (v1.6+)
- `xgboost` (v3.4+)
- `shap` (v0.52+)
- `pandas`, `numpy`, `scipy`
- `fastapi`, `uvicorn`, `pydantic`
- `joblib`, `matplotlib`

---

## 3. Directory & Artifact Structure

```
EduInsight/
├── ml_data/                   # Validated Synthetic Datasets (W4, W8, W12, History)
├── models/                    # Serialized Machine Learning Models (.joblib)
├── pipelines/                 # Full Preprocessing + Classifier Pipelines (.joblib)
├── explainability/            # Phase 3 Global & Local SHAP Modules
├── uncertainty/               # Phase 4 Split Conformal Prediction Modules
├── counterfactual/            # Phase 5 Counterfactual Simulator Modules
├── interventions/             # Phase 6 Prescriptive Intervention Modules
├── services/                  # Phase 7 Central Inference Orchestration Layer
├── ml/                        # API & Comprehensive Test Suites
├── backend/                   # Node.js / Express REST API Gateway
├── frontend/                  # React 18 Tailwind/Lucide Dashboard UI
├── results/                   # Metric Summaries, CSV Queues, and JSON Cases
└── reports/                   # Technical Validation & Phase Reports
```

---

## 4. Running the Complete Automated Test Suite

To run all unit, explainability, uncertainty, counterfactual, intervention, and end-to-end integration tests:

```bash
python -m unittest ml/test_explainability.py ml/test_uncertainty.py ml/test_counterfactual.py ml/test_interventions.py ml/test_integration_phase7.py
```

**Expected Result**: `41 tests passed cleanly in ~65 seconds (100% PASS rate)`.

---

## 5. Starting the Backend Services

### A. Start the Python FastAPI ML Microservice (Port 8000)
```bash
cd ml
python -m uvicorn api:app --host 0.0.0.0 --port 8000
```
- API Documentation: `http://localhost:8000/docs`

### B. Start the Node.js / Express REST API Gateway (Port 5000)
```bash
cd backend
npm install
npm run start
```
- API Health Check: `http://localhost:5000/api/health`

### C. Start the React Frontend Dashboard (Port 5173)
```bash
cd frontend
npm install
npm run dev
```
- Application Portal: `http://localhost:5173`

---

## 6. End-to-End Decision Support Demo Procedure

1. **Open the Dashboard**: Navigate to `http://localhost:5173` and log in with faculty/advisor credentials.
2. **Access Intelligence Center**: Click on the **Intelligence Center** in the navigation bar.
3. **Select Student & Milestone**:
   - Choose student: `STU0016` (AIML, Semester 2).
   - Select Checkpoint: **Week 12**.
4. **Inspect Decision-Support Chain**:
   - **Risk Summary**: $99.91\%$ Predicted Academic Risk (`HIGH RISK`).
   - **Confidence**: `CONFIDENT_RISK` ($C(x) = \{\text{"RISK"}\}$ at $90\%$ confidence).
   - **SHAP Drivers**: `internal_marks_avg_w12` ($46.09\%$, $+4.30$), `low_scoring_subjects_w12` ($3$ failing subjects, $+2.82$).
   - **What-If Simulation**: Modifying attendance to $86.37\%$, marks to $56.09\%$, and clearing 1 failing subject drops predicted risk to **$46.28\%$** (`SAFE`).
   - **Prescriptive Recommendation**: Primary Action $\implies$ **`SUBJECT_REMEDIATION`** (Priority: `CRITICAL`, Confidence: `HIGH`, Urgency: `0.549`).
5. **View Prioritized Faculty Queue**: Open the Prioritized Intervention Queue to view ranked at-risk students ordered by multi-criteria urgency score.

---

## 7. Determinism & Reproducibility Guarantees

- **Random Seeds**: All dataset splitting (`GroupShuffleSplit`), cross-validation (`GroupKFold`), and model training (`XGBClassifier`, `RandomForestClassifier`) are pinned to `RANDOM_SEED = 42`.
- **Pre-Trained Artifacts**: Pre-trained pipelines are saved in `pipelines/` for immediate zero-training evaluation.
- **Finite-Sample Conformal Thresholds**: Conformal quantiles are calculated deterministically using the exact higher-order rank on the calibration split.
