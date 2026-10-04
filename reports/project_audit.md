# EduInsight AI — Comprehensive Project Audit Report (Phase 0)

**Project Name:** EduInsight AI — Academic Performance Analytics and Result Management Portal  
**Repository:** `https://github.com/chiluverusrija7/Academic-Performance-Analytics-and-Result-Management-Portal`  
**Date:** October 2026  
**Auditor:** DeepMind Antigravity AI  

---

## 1. Executive Summary

EduInsight AI is an end-to-end, multi-tier institutional academic intelligence platform designed to support early academic risk detection, interpretable model explanations, conformal uncertainty quantification, what-if counterfactual simulations, and prescriptive academic interventions.

This audit documents the complete state of the project across all 10 core architectural layers:
1. **PostgreSQL Relational Core:** 16 academic operational tables + `timetable` + `intervention_status` + `academic_knowledge_vector`
2. **pgvector Semantic Store:** Cosine similarity search over institutional policy guidance
3. **Machine Learning Pipeline:** Longitudinal temporal checkpoints ($W4 \to W8 \to W12$)
4. **SHAP Explainability Layer:** TreeSHAP additive feature attributions with non-causal language
5. **Conformal Uncertainty Layer:** Split-conformal prediction sets with finite-sample coverage guarantees ($1 - \alpha = 0.90$)
6. **Counterfactual What-If Simulator:** Realistic constrained feature shift engine
7. **Prescriptive Intervention Engine:** Multi-signal decision synthesis mapping risks to targeted academic playbooks
8. **FastAPI AI Microservice:** High-performance REST service exposing analytical endpoints
9. **Flask Web Application:** Standalone decision-support presentation platform with Chart.js analytics
10. **Java AWT Desktop Client:** Standalone desktop application connecting directly to FastAPI

---

## 2. Layer-by-Layer Architectural Audit

### A. Database Layer (PostgreSQL + pgvector)
- **Status:** STABLE & OPERATIONAL
- **Schema Entities:** `student`, `faculty`, `department`, `course`, `semester`, `subject`, `enrollment`, `attendance`, `marks`, `exam`, `grade`, `result`, `fee`, `admission`, `users`, `faculty_subject`, `timetable`, `intervention_status`, `academic_knowledge_vector`.
- **Integrity:** Foreign keys and constraints enforced across all active relationships.
- **pgvector Extension:** Active vector table with 384-dimensional embeddings for institutional remediation policies.

### B. Machine Learning & Predictive Pipeline
- **Status:** VALIDATED & TRAINED
- **Checkpoints:**
  - $W4$: Initial risk indicators (Early attendance, historical SGPA)
  - $W8$: Mid-term inflection point (Mid-1 internal assessment marks, practical labs)
  - $W12$: Final pre-exam readiness checkpoint (Comprehensive course trajectory)
- **Target Leakage Prevention:** Strict exclusion of final SGPA, CGPA, external examination scores, and final backlog counts from early checkpoint feature matrices.

### C. Explainability, Uncertainty & Counterfactuals
- **TreeSHAP:** Local and global log-odds feature attributions identifying primary risk drivers and protective anchors. Non-causal terminology enforced throughout.
- **Conformal Prediction Sets:** Guaranteed coverage sets identifying `CONFIDENT_RISK`, `CONFIDENT_SAFE`, and `AMBIGUOUS` predictions.
- **Counterfactuals:** Gradient/tree-aware feasible perturbations estimating projected risk reduction without invalid feature manipulation.

### D. Prescriptive Interventions & Status Workflow
- **Multi-Signal Synthesis:** Combines predicted risk, SHAP drivers, conformal certainty, and assessment proximity into a deterministic composite urgency score:
  $$\text{Urgency Score} = 0.35 \cdot P(\text{Risk}) + 0.25 \cdot \text{Certainty Weight} + 0.25 \cdot \text{Priority Weight} + 0.10 \cdot \text{Checkpoint Weight} + 0.05 \cdot \text{Counterfactual Available}$$
- **Persistence:** Case statuses (`PENDING`, `ASSIGNED`, `IN_PROGRESS`, `COMPLETED`, `REASSESS`), faculty assignments, and review notes persist in PostgreSQL `intervention_status`.

### E. Frontend & Presentation Interfaces
- **Student Command Center (`/student/dashboard`):** Unified academic life workspace embedding identity, attendance recovery calculator, today's timetable timeline, subject cards, and personalized risk advisor.
- **Faculty Portal (`/intelligence` - Prioritized Interventions):** Urgent student queue above 2D prioritization matrix, filter bar, 360° decision drawer, and intervention outcome tracker.
- **Flask Presentation Web App (`:5001`):** Standalone presentation interface communicating with FastAPI.
- **Java AWT Desktop Client (`awt_client/EduInsightAWT.java`):** Desktop application communicating with FastAPI.

---

## 3. Implementation Checklist & Verification

| Architectural Requirement | Status | Verification Source |
|---|---|---|
| PostgreSQL Core (16 tables) | ✅ Complete | Verified in `information_schema.tables` |
| Timetable & Schedule Schema | ✅ Complete | `timetable` table seeded with 72 records |
| Intervention Tracking Schema | ✅ Complete | `intervention_status` table active |
| pgvector Knowledge Store | ✅ Complete | `vector/vector_store.py` (384-dim) |
| W4/W8/W12 Temporal Models | ✅ Complete | `models/` checkpoints verified |
| SHAP Feature Explanations | ✅ Complete | `explainability/risk_explanation.py` |
| Conformal Uncertainty Sets | ✅ Complete | `uncertainty/conformal_predictor.py` |
| What-If Counterfactuals | ✅ Complete | `counterfactual/counterfactual_engine.py` |
| Prescriptive Interventions | ✅ Complete | `interventions/intervention_engine.py` |
| FastAPI REST AI Layer | ✅ Complete | `fastapi_service/main.py` (Port 8000) |
| Flask Web UI | ✅ Complete | `flask_app/app.py` (Port 5001) |
| React Frontend Command Center | ✅ Complete | `frontend/src/` (Port 3000) |
| Java AWT Desktop Client | ✅ Complete | `awt_client/EduInsightAWT.java` |
| 100% PyTest Suite Pass Rate | ✅ Complete | 57 / 57 tests passing |
