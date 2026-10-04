# EduInsight Early Academic Risk Model - Inference & Integration Guide

## 1. System Architecture Overview

The EduInsight Early Academic Risk Detection inference system connects live student records in PostgreSQL to a Random Forest ML model via a FastAPI Python microservice and an Express backend proxy route.

```
+-------------------+             +-----------------------+             +-------------------------+             +----------------------+
|  React Frontend   |  ========>  | Express API Gateway   |  ========>  | Python FastAPI Micro-   |  ========>  | Preprocessing +      |
|                   |  HTTP GET   | (Port 5000)           |  HTTP GET   | service (Port 8000)     |  Inference  | Random Forest Model  |
+-------------------+             +-----------------------+             +-------------------------+             +----------------------+
                                             |                                       |
                                             v                                       v
                                   +-------------------+                   +-------------------+
                                   | Student Meta      |                   | Feature Builder   |
                                   | Verification      |                   | (psycopg2)        |
                                   +-------------------+                   +-------------------+
                                                                                     |
                                                                                     v
                                                                           +-------------------+
                                                                           | PostgreSQL DB     |
                                                                           | (EduInsight)      |
                                                                           +-------------------+
```

---

## 2. Component Details

### A. Python Live Feature Builder (`d:/EduInsight/ml/feature_builder.py`)
- **Responsibility**: Connects to live PostgreSQL using `psycopg2` and aggregates mid-semester academic indicators.
- **Mid-Semester Features Extracted**:
  - `attendance_pct_to_date`: Student's attendance percentage across logged sessions.
  - `in_sem_avg_pct`: Score average across internal assessments (scaled to 100%).
  - `low_internal_subjects_count`: Count of subjects where internal score $< 50\%$.
  - `subjects_below_internal_threshold`: Subject count under warning threshold.
  - `internal_assessment_count`: Number of internal mark entries recorded.
  - `previous_sgpa`: Historical grade average across completed semesters (or `None` if missing).
  - `previous_marks_average`: Historical marks percentage (or `None` if missing).
  - `previous_backlogs`: Total backlog count accumulated to date.
  - `previous_attendance_pct`: Historical attendance percentage (`None` if unrecorded).
  - `performance_trend`: Trajectory differential between current in-sem average and historical average.
  - `subjects_attempted`: Number of subjects currently enrolled.
  - `department` & `course`: One-hot encoded categorical indicators (`CSE`, `ECE`, `AIML`, `DS`).

### B. FastAPI Inference Server (`d:/EduInsight/ml/api.py`)
- **Port**: `8000`
- **Model Artifacts Loaded**:
  - `risk_model.joblib`: Trained Random Forest Classifier (`max_depth=5`)
  - `preprocessing.joblib`: Pipeline with ColumnTransformer, SimpleImputer, StandardScaler, and OneHotEncoder
  - `feature_schema.json`: Strict schema defining input features and feature order
- **Endpoints**:
  - `GET /health`: Health status check
  - `GET /api/predict/risk/{student_id}`: Primary inference endpoint

### C. Express Gateway Proxy Route (`d:/EduInsight/backend/routes/intelligence.js`)
- **Port**: `5000`
- **Endpoint**: `GET /api/intelligence/risk/:studentId`
- **Proxy Behavior**: Validates `studentId`, fetches student metadata from PostgreSQL, forwards the request to `http://localhost:8000/api/predict/risk/:studentId`, and handles offline microservice errors gracefully.

---

## 3. Data Leakage Controls

To strictly enforce early risk detection, the following outcome columns are **never** queried or passed to the model input vector:
- `final_external_avg_pct`
- `final_total_pct`
- `final_sgpa`
- `final_backlogs`
- `final_result_classification`
- `target_risk`

---

## 4. Handling Edge Cases & Insufficient Data

If a student profile exists in PostgreSQL but has **no recorded attendance** AND **no recorded internal marks**:
- The microservice does NOT fail or throw an exception.
- It returns a structured `insufficient_data` payload:
  ```json
  {
    "status": "insufficient_data",
    "student_id": 1,
    "message": "Not enough current academic data is available to generate an early-risk prediction.",
    "risk_probability": null,
    "risk_percentage": null,
    "risk_category": "UNKNOWN",
    "explainable_reasons": ["No attendance or internal marks records exist for this student."],
    "recommendations": ["Ensure student attendance and internal assessment marks are logged in the portal."]
  }
  ```

---

## 5. Risk Classification & Decision Rules

| Risk Category | Risk Probability ($\hat{p}$) | Risk Percentage | Actionable Focus |
| :--- | :--- | :--- | :--- |
| **LOW** | $\hat{p} < 0.35$ | $0\% - 34.99\%$ | Maintain course trajectory |
| **MEDIUM** | $0.35 \le \hat{p} < 0.65$ | $35\% - 64.99\%$ | Attendance monitoring & targeted review |
| **HIGH** | $\hat{p} \ge 0.65$ | $65\% - 100\%$ | Mandatory remedial sessions & advisor warning |

---

## 6. How to Run & Verify Services

### Step 1: Start Python FastAPI Microservice
```powershell
cd d:/EduInsight/ml
& "C:\Users\Srija Ch\anaconda3\python.exe" -m uvicorn api:app --host 0.0.0.0 --port 8000
```

### Step 2: Start Express Backend API
```powershell
cd d:/EduInsight/backend
node server.js
```

### Step 3: Test Proxy API via HTTP
```bash
# Test Student with Insufficient Data (Student 1)
curl http://localhost:5000/api/intelligence/risk/1

# Test Medium Risk Student (Student 23)
curl http://localhost:5000/api/intelligence/risk/23

# Test Low Risk Student (Student 26)
curl http://localhost:5000/api/intelligence/risk/26
```
