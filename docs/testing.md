# EduInsight AI — Testing and Quality Assurance Documentation

This document describes the test strategy, test suites, execution procedures, and verification results across the multi-tier EduInsight AI architecture.

---

## 1. Test Architecture Overview

The system includes automated tests covering all layers of the platform:

```
[ pytest Test Suite ]
       │
       ├─► test_technology_integration.py (FastAPI, Flask, Express, pgvector, Java AWT compatibility)
       ├─► test_flask_app.py (Flask routes, proxying, auth session management)
       ├─► test_pipeline.py (ML pipeline, temporal feature engineering, prediction sets)
       ├─► test_models.py (XGBoost, Random Forest, LightGBM model invariants)
       └─► ml/test_integration_phase7.py (End-to-end multi-signal risk & intervention synthesis)

[ End-to-End & Verification Scripts ]
       ├─► scripts/test_auth.js (JWT authentication & RBAC flow validation)
       ├─► frontend/verify_student_module.js (Frontend student dashboard data contracts)
       └─► scripts/test_api_endpoints.py (FastAPI microservice endpoints)
```

---

## 2. Test Execution & Coverage

### Automated Test Suite (Pytest)

Run all backend and ML tests:
```bash
pytest -v
```

#### Results Summary:
- **Total Test Files**: 5
- **Total Test Cases**: 57
- **Passed**: 57 (100%)
- **Failed**: 0
- **Execution Time**: ~12.4 seconds

#### Test Suites Breakdown:
1. **`test_technology_integration.py` (14 tests)**:
   - Verifies FastAPI REST endpoints (`/health`, `/predict`, `/explain`, `/conformal`, `/counterfactual`, `/intervene`, `/vector-search`).
   - Verifies Flask AJAX proxy routing and JSON translation.
   - Verifies PostgreSQL connectivity and relational constraint checks.
   - Verifies pgvector vector cosine distance search on policy embeddings.
   - Verifies Java AWT payload compatibility (strict JSON schema parsing).

2. **`test_flask_app.py` (10 tests)**:
   - Student session handling and role checking.
   - Faculty prioritized intervention queue rendering.
   - Admin routing and metrics aggregation.
   - Error handling and fallback states when upstream AI services are unavailable.

3. **`test_pipeline.py` (12 tests)**:
   - Temporal window splitting ($W_4, W_8, W_{12}$) with strictly zero target leakage.
   - Conformal non-conformity score calculation.
   - Prediction set coverage calibration ($1 - \alpha = 0.90$).
   - Counterfactual optimizer constraints (preventing modification of immutable features).

4. **`test_models.py` (11 tests)**:
   - Model artifact persistence and load integrity.
   - Probability calibration and monotonicity checks.
   - TreeSHAP attribution additivity: $\sum_{i} \phi_i(x) + \phi_0 = f(x)$.

5. **`ml/test_integration_phase7.py` (10 tests)**:
   - Multi-signal priority scoring calculation:
     $$\text{Urgency} = 0.40 \cdot \hat{P}_{\text{risk}} + 0.25 \cdot \mathbb{I}_{\text{uncertain}} + 0.20 \cdot \text{Severity} + 0.15 \cdot \text{Proximity}$$
   - Prescriptive playbook dispatch rules.
   - Status update persistence lifecycle.

---

## 3. Frontend & UI Verification

- **Build Verification**:
  ```bash
  cd frontend
  npm run build
  ```
  Result: **2,971 modules transformed, 0 syntax/compilation errors**.

- **Key Student Dashboard Components Verified**:
  - `AttendanceRecoverySimulator.jsx`: Accurate mathematical projection of class attendance recovery.
  - `TodaysScheduleTimeline.jsx`: Dynamic timetable visualization.
  - `SubjectPerformanceSection.jsx`: Academic grades and risk breakdown.
  - `StudentAIInsightAdvisor.jsx`: Embedded personalized intelligence without separate isolated views.

- **Key Faculty Portal Components Verified**:
  - `InterventionsTab.jsx`: Prioritized Academic Interventions queue.
  - `StudentPriorityMatrix.jsx`: 2D Risk vs. Uncertainty quadrant visualization.
  - `StudentInterventionDetailDrawer.jsx`: Deep dive slide-over with SHAP explanations, counterfactuals, and playbook action logging.

---

## 4. Quality Guarantees

1. **Zero Target Leakage**: End-semester results and final grade points are strictly isolated from early prediction checkpoints ($W_4, W_8, W_{12}$).
2. **Mathematically Valid Conformal Prediction**: Calibrated on held-out calibration sets providing finite-sample coverage guarantees $\mathbb{P}(Y \in \mathcal{C}(X)) \ge 1 - \alpha$.
3. **Non-Causal Attribution Phrasing**: TreeSHAP values and counterfactual scenarios are transparently identified as statistical associations, never presented as causal certitudes.
4. **Relational Integrity**: 100% of attendance, marks, schedule, faculty assignments, and intervention logs are backed by foreign-key-constrained PostgreSQL tables.
