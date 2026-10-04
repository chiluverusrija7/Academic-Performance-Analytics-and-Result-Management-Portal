# FLASK ↔ FASTAPI SERVICE BOUNDARY SPECIFICATION

## 1. Architectural Separation

EduInsight AI adopts a strict separation of concerns between presentation and computation:
- **Flask (Presentation Layer):**
  - Manages HTML/Jinja2 template rendering, static styling, client-side AJAX interactions, and URL routing.
  - Zero ML or statistical modeling logic resides inside Flask.
  - Interacts with FastAPI through `call_fastapi()` with timeout protection (8.0s) and non-stacktrace error handling.
- **FastAPI (AI/ML & Vector Service Layer):**
  - Runs on port 8000 using asynchronous ASGI architecture (`uvicorn`).
  - Coordinates Phase 2–6 machine learning pipelines (XGBoost, TreeSHAP, Conformal Sets, What-If Optimization).
  - Exposes dedicated checkpoint endpoints (`/predict/{cp}`, `/explain/{cp}`, `/uncertainty/{cp}`, `/counterfactual/{cp}`, `/intervention/{cp}`) and unified 360° endpoint (`/api/intelligence/analyze/{student_id}`).

---

## 2. API Endpoint Mapping

| HTTP Verb | FastAPI Endpoint | Purpose | Return Schema |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Liveness and model/vector store readiness | `status`, `models_loaded`, `vector_store` |
| `GET` | `/api/intelligence/students` | Searchable cohort directory | Array of student summaries |
| `GET / POST`| `/api/intelligence/analyze/{id}` | Unified 360° Risk Analysis | Prediction, Conformal, SHAP, Counterfactual, Interventions, pgvector guidance |
| `POST` | `/api/intelligence/counterfactual/{id}` | Real-time interactive slider re-evaluation | Original vs New probability, Delta, Feasibility |
| `POST` | `/api/vector/search` | Semantic cosine similarity search | Ranked matching institutional policies |
| `GET` | `/api/intelligence/queue` | Faculty priority triage queue | Urgency-ranked list of students |
