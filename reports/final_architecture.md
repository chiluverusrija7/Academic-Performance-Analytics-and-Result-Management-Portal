# EduInsight AI — Final Architecture Specification

---

## 1. Multi-Tiered System Architecture

EduInsight AI is organized into a clean, decoupled 7-tier pipeline:

```
[1. OPERATIONAL LAYER]
PostgreSQL 16-Table Relational Database
(STUDENT, ENROLLMENT, ATTENDANCE, EXAM, MARKS, GRADE, RESULT, FEE, etc.)
                   │
                   ▼
[2. DATA & FEATURE ENGINEERING LAYER]
Longitudinal Aggregations & Temporal Feature Sets
(Week 4, Week 8, and Week 12 Checkpoint Datasets)
                   │
                   ▼
[3. TEMPORAL PREDICTIVE LAYER]
Supervised Machine Learning Pipelines
(Logistic Regression Baseline, Random Forest, XGBoost Champion)
                   │
                   ▼
[4. EXPLAINABILITY LAYER]
shap.TreeExplainer Engine
(Ranked Risk-Increasing and Protective Factor Attributions)
                   │
                   ▼
[5. UNCERTAINTY QUANTIFICATION LAYER]
Split Conformal Classification Engine
(Probability Nonconformity Scores & Finite-Sample Prediction Sets)
                   │
                   ▼
[6. COUNTERFACTUAL SIMULATOR LAYER]
Real-Pipeline What-If Optimization
(Minimum-Effort Behavioral Feasibility Search)
                   │
                   ▼
[7. PRESCRIPTIVE INTERVENTION & DASHBOARD LAYER]
Academic Intervention Engine & Central Orchestration Service
(Multi-Criteria Prioritization Queue, Node.js Express Gateway, React 18 UI)
```

---

## 2. Layer-by-Layer Technical Specification

### Layer 1: Operational Database Layer
- **Technology**: PostgreSQL 14+ Relational DBMS.
- **Role**: Serves as the operational foundation for live student identity, admissions, course registrations, daily lecture attendances, and semester examination results.
- **Integrity Rule**: Real operational data remains strictly separated from synthetic ML training data. The database schema is 100% untouched.

### Layer 2: Longitudinal Feature Engineering Layer
- **Input**: Subject-level academic records and semester history.
- **Process**: Extracts temporal attendance percentages, continuous internal assessment averages, failing subject counts (`low_scoring_subjects`), attendance shortage counts (`low_attendance_subjects`), and multi-timepoint velocity gradients ($\Delta \text{Marks}_{W4 \to W8}$, $\Delta \text{Att}_{W4 \to W8}$, $\Delta \text{Marks}_{W8 \to W12}$, $\text{performance\_trend}$).
- **Output**: Clean, leakage-free checkpoint datasets (`checkpoint_w4.csv`, `checkpoint_w8.csv`, `checkpoint_w12.csv`).

### Layer 3: Temporal Predictive Layer
- **Models**: Baseline Logistic Regression (balanced weights), Random Forest Classifier, and XGBoost Classifier (Champion).
- **Process**: Encapsulated in scikit-learn `Pipeline` objects with `ColumnTransformer`, one-hot encoding for categoricals, median imputation for first-semester nulls, and standard feature scaling.
- **Output**: Calibrated risk probability $P(\text{Risk}) \in [0.0, 1.0]$ and point prediction (`RISK` / `SAFE`).

### Layer 4: Explainability Layer (SHAP)
- **Technology**: `shap.TreeExplainer`.
- **Process**: Decomposes the model log-odds output into individual additive feature contributions $f(x) = \phi_0 + \sum \phi_i$.
- **Output**: Top $K$ risk drivers ($\phi_i > 0$) and protective factors ($\phi_i < 0$) with semantic interpretations.

### Layer 5: Uncertainty Quantification Layer (Conformal Prediction)
- **Technology**: Split Conformal Prediction (Inductive Conformal Prediction).
- **Process**: Evaluates nonconformity scores $s_i = 1 - \hat{p}(Y_i \mid X_i)$ on a separate student-held calibration split to find finite-sample quantile cutoff $\hat{q}$.
- **Output**: Prediction set $C(x) = \{ y \in \{\text{SAFE}, \text{RISK}\} \mid \hat{p}(y \mid x) \ge 1 - \hat{q} \}$ and status (`CONFIDENT_RISK`, `CONFIDENT_SAFE`, `AMBIGUOUS`).

### Layer 6: Counterfactual Simulator Layer
- **Technology**: Model-agnostic optimization engine with bounds checking.
- **Process**: Evaluates candidate behavioral modifications ($\Delta \text{Att}$, $\Delta \text{Marks}$, subject clearing) by updating feature vectors and re-running `pipeline.predict_proba(X_cf)`.
- **Output**: Lowest-cost feasible modification that brings risk below $0.50$, or best partial risk reduction.

### Layer 7: Prescriptive Support & Application Layer
- **Backend Orchestrator**: `AcademicRiskOrchestrationService` in Python FastAPI microservice (`ml/api.py`).
- **Gateway**: Node.js / Express REST API proxy (`backend/server.js`, `backend/routes/intelligence.js`) enforcing JWT authentication and PostgreSQL student validation.
- **Frontend UI**: React 18, Tailwind CSS, Recharts, and Lucide icons providing interactive Student, Faculty, and Admin Intelligence Center dashboards.
