# EduInsight AI — Live Demonstration Backup & Contingency Plan

This contingency plan ensures seamless presentation delivery during a live examination, viva, or demo under unexpected environment failures.

---

## 1. Contingency Matrix & Recovery Actions

| Failure Scenario | Immediate Symptoms | Recovery Action / Workaround |
|---|---|---|
| **Scenario A: PostgreSQL Database Offline** | Express reports database connection timeout; student search fails. | The Python FastAPI microservice operates independently on `ml_data/`. Direct browser to `http://localhost:8000/docs` or query `/api/intelligence/analyze/STU0016` to demonstrate the complete 5-stage ML pipeline without database dependency. |
| **Scenario B: Frontend UI Port Conflict** | Port 5173 is busy or fails to launch. | Run `npm run dev -- --port 5174` in `frontend/`, OR present directly via FastAPI interactive Swagger UI at `http://localhost:8000/docs`. |
| **Scenario C: Python FastAPI Microservice Crash** | Network error on risk inference requests. | Restart microservice via `python -m uvicorn api:app --port 8000 --reload=False`. All model pipelines are cached in `pipelines/` and reload in $<7$ seconds. |
| **Scenario D: Selected Student Unavailable** | Selected student ID returns 404. | Switch immediately to verified backup demo students documented in [`results/demo_cases.json`](file:///d:/EduInsight/results/demo_cases.json):<br/>• High Risk: **`STU0017`** (Semester 2, W8)<br/>• Ambiguous: **`STU0250`** (Semester 3, W4)<br/>• Confident Safe: **`STU0001`** (Semester 1, W12) |
| **Scenario E: Total Host Network / Server Outage** | Cannot launch background servers. | Open pre-generated verified JSON payloads and reports:<br/>1. Complete demo output: [`results/final_demo_outputs.json`](file:///d:/EduInsight/results/final_demo_outputs.json)<br/>2. Prioritized queue: [`results/intervention_plans.csv`](file:///d:/EduInsight/results/intervention_plans.csv)<br/>3. Validation cases: [`results/final_validation_cases.json`](file:///d:/EduInsight/results/final_validation_cases.json) |

---

## 2. Offline / Self-Contained Execution Verification
- **Zero External API Dependency**: EduInsight AI uses local Python ML algorithms (`xgboost`, `shap`, `scikit-learn`, `numpy`). It requires no cloud API keys, external LLM endpoints, or internet connectivity.
- **Local Artifact Cache**: All 3 trained checkpoint pipelines, datasets, SHAP plots, and evaluation CSVs are stored locally in `pipelines/`, `models/`, `ml_data/`, and `reports/`.
