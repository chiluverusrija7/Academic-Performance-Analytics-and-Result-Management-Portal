# EduInsight AI — Architecture Diagram Specification

This document provides exact instructions, node labels, inputs, outputs, technologies, and data-flow arrows for rendering the official system architecture diagram.

---

## 1. Mermaid Architecture Diagram

```mermaid
flowchart TD
    subgraph Operational_Storage["1. Operational Storage Layer"]
        PG["PostgreSQL Database (16 Tables)<br/>• student, attendance, marks, exam<br/>• grade, result, fee, enrollment<br/><i>(Live Academic Records)</i>"]
    end

    subgraph Data_Engineering["2. Longitudinal Feature Layer"]
        DATA["Longitudinal Feature Engineering<br/>• Subject Aggregations<br/>• Multi-Timepoint Velocity (ΔMarks, ΔAtt)<br/>• Checkpoints: W4, W8, W12"]
    end

    subgraph Predictive_Core["3. Temporal Predictive Layer"]
        XGB["XGBoost Checkpoint Classifiers<br/>• Week 4 Pipeline (PR-AUC: 0.820)<br/>• Week 8 Pipeline (PR-AUC: 0.914)<br/>• Week 12 Pipeline (PR-AUC: 0.955)"]
    end

    subgraph Explainability_Layer["4. Explainability Layer"]
        SHAP["SHAP TreeExplainer<br/>• Local Feature Attributions<br/>• Risk Drivers (+SHAP)<br/>• Protective Factors (-SHAP)"]
    end

    subgraph Uncertainty_Layer["5. Uncertainty Quantification Layer"]
        CONF["Split Conformal Prediction<br/>• Nonconformity: s = 1 - P(y|x)<br/>• Prediction Sets: {SAFE}, {RISK}, {SAFE, RISK}<br/>• Status: CONFIDENT vs AMBIGUOUS (≥95% Coverage)"]
    end

    subgraph Counterfactual_Layer["6. Counterfactual Simulator"]
        CF["Counterfactual Optimization<br/>• Feasible Bounded Search ([0, 100]%)<br/>• Pipeline Re-evaluation<br/>• Minimum-Effort Risk Reduction"]
    end

    subgraph Prescriptive_Layer["7. Prescriptive Support & Application"]
        INT["Academic Intervention Engine<br/>• 7 Action Types (Remediation, Mentoring, etc.)<br/>• Uncertainty Priority Gating<br/>• Multi-Criteria Prioritized Student Queue"]
        SVC["Academic Risk Orchestrator<br/>(Python FastAPI Microservice - Port 8000)"]
        EXP["Express REST Gateway<br/>(JWT Auth, RBAC, DB Proxy - Port 5000)"]
        UI["React 18 Dashboard UI<br/>• Student, Faculty & Admin Intelligence"]
    end

    %% Data Flow Connections
    PG -.->|Historical Logs| DATA
    DATA -->|W4, W8, W12 Feature Matrices| XGB
    XGB -->|Model Log-Odds & Trees| SHAP
    XGB -->|Predicted Probabilities| CONF
    XGB -->|Pipeline Scoring API| CF
    
    XGB -->|Probability & Class| SVC
    SHAP -->|Attribution Vectors| SVC
    CONF -->|Prediction Set & Status| SVC
    CF -->|Feasible Scenarios| SVC
    INT -->|Action Plans & Priority| SVC

    SVC -->|Unified Analysis Payload| EXP
    PG <-->|Operational Verification| EXP
    EXP <-->|JSON REST APIs| UI
```

---

## 2. Block-by-Block Specification Table

| Block ID | Box Name | Input | Output | Technology Used |
|---|---|---|---|---|
| **1** | PostgreSQL Operational DB | Daily university transactions | Relational student tables | PostgreSQL 14+ Relational DBMS |
| **2** | Longitudinal Feature Layer | Historical attendance & internal marks | $W_4, W_8, W_{12}$ Feature CSVs | Python, `pandas`, `scipy` |
| **3** | Temporal Predictive Layer | In-semester feature vectors | Continuous risk probability $P(\text{Risk})$ | Python 3.13, `xgboost`, `scikit-learn` |
| **4** | SHAP Explainability Layer | Model tree ensembles & feature rows | Ranked additive Shapley attributions | `shap` (v0.52.0), `TreeExplainer` |
| **5** | Conformal Uncertainty Layer | Calibration nonconformity scores | Finite-sample prediction sets & status | Split Conformal Classification |
| **6** | Counterfactual Simulator | At-risk feature vector & bounds | Minimum-change feasible modification | Real-Pipeline Optimization Algorithm |
| **7** | Prescriptive Intervention Engine | Multi-signal evidence vector | Prioritized action plans & student queue | Rule-based Multi-Signal Engine |
| **8** | Central Orchestration Service | Student ID, Semester, Checkpoint | Unified 360° decision-support JSON | FastAPI, Uvicorn, Pydantic |
| **9** | Express Gateway & REST API | Authenticated client requests | Verified REST JSON responses | Node.js, Express, `pg`, JWT |
| **10** | Frontend Dashboard UI | User interaction & queries | Interactive Intelligence Centers | React 18, Tailwind CSS, Recharts |
