# EduInsight AI — Academic Performance Analytics & Result Management Portal

**An Explainable, Uncertainty-Aware, Multi-Tier Institutional Academic Intelligence Platform**

[![Python 3.13](https://img.shields.io/badge/Python-3.13-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green.svg)](https://fastapi.tiangolo.com/)
[![Flask](https://img.shields.io/badge/Flask-3.0+-teal.svg)](https://flask.palletsprojects.com/)
[![React 18](https://img.shields.io/badge/React-18.0-61dafb.svg)](https://react.dev/)
[![Node.js Express](https://img.shields.io/badge/Express-4.18-lightgrey.svg)](https://expressjs.com/)
[![PostgreSQL 16](https://img.shields.io/badge/PostgreSQL-16--Table--Schema-336791.svg)](https://www.postgresql.org/)
[![pgvector](https://img.shields.io/badge/pgvector-384--dim-blueviolet.svg)](https://github.com/pgvector/pgvector)
[![Java AWT](https://img.shields.io/badge/Java%20AWT-Desktop%20Client-orange.svg)]()
[![Status](https://img.shields.io/badge/Status-Capstone--Validated-brightgreen.svg)]()

---

## 1. Executive Summary & Problem Definition

Educational institutions face significant friction in identifying at-risk students before irreversible failure occurs. Conventional systems rely on post-hoc semester-end GPA calculations.

**EduInsight AI** provides a unified, multi-tier decision-support platform that tracks student trajectories longitudinally across three in-semester checkpoints:
- **Week 4 (Early Term):** Identifies initial disengagement and attendance drop-offs before midterm evaluations.
- **Week 8 (Midterm Inflection):** Detects trajectory velocity and conceptual difficulty following formal midterm assessments.
- **Week 12 (Pre-Final Comprehensive):** Pinpoints multi-subject failure risk and prioritizes urgent remedial tutorials prior to final examinations.

---

## 2. Integrated System Architecture

```
                    EDUINSIGHT AI
                         │
          ┌──────────────┴──────────────┐
          │                             │
     FLASK WEB APP                JAVA AWT CLIENT
  (Decision Support)            (Desktop Monitor)
          │                             │
          └──────────────┬──────────────┘
                         │
                      FASTAPI
                (Service / AI Layer)
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
   Prediction          SHAP           Uncertainty
   (W4/W8/W12)    (Explainability)    (Conformal)
       │                 │                 │
       └─────────────────┼─────────────────┘
                         │
                  Counterfactual
                 (What-If Engine)
                         │
                   Intervention
                     (Engine)
                         │
                 PostgreSQL Core
                        +
                     pgvector
                     /      \
            Academic Data   Semantic Policies
```

---

## 3. Core Technologies & Their Architectural Roles

| Technology | Role & Justification |
|---|---|
| **Flask (`:5001`)** | Standalone visual presentation & decision-support web application communicating via HTTP with FastAPI. |
| **FastAPI (`:8000`)** | Dedicated asynchronous microservice exposing RESTful endpoints for ML inference, SHAP, conformal sets, and counterfactuals. |
| **PostgreSQL 16 (`:5432`)** | 16-table relational academic database storing students, faculty, attendance, marks, exams, and results. |
| **pgvector** | Dense vector similarity retrieval over institutional academic policies and remediation guidelines. |
| **React 18 + Vite (`:3000`)** | Interactive student command center, faculty portal, and administrative intelligence center. |
| **Node.js Express (`:5000`)** | API gateway for operational PostgreSQL CRUD and JWT authentication. |
| **Java AWT Client** | Standalone desktop risk assessment monitor for faculty advisors communicating with FastAPI. |
| **XGBoost + SHAP** | Longitudinal temporal classifiers ($W4, W8, W12$) and TreeSHAP additive feature attributions. |
| **Split-Conformal Prediction** | Uncertainty quantification constructing prediction sets with finite-sample coverage guarantees ($1 - \alpha = 0.90$). |

---

## 4. Portals & Interfaces

### 🎓 Student Command Center (`/student/dashboard`)
- **Identity & Status:** Name, Roll No, Department, Course, Semester, Academic Year, and Status.
- **Attendance Intelligence & Recovery Simulator:** Interactive slider calculating exact lectures needed to reach $\ge 75\%$.
- **Class Schedule & Timetable:** Timeline highlighting `CURRENT CLASS`, `UPCOMING`, and `COMPLETED` lectures.
- **Subject Performance:** Enrolled course cards with marks vs. attendance comparison.
- **Embedded AI Advisor:** Student-friendly risk explanations + "What happens if I improve?" simulator.
- **My Faculty & Assessments:** Contact cards for instructors and exam countdowns.

### 👨‍🏫 Faculty Portal (`/intelligence` - Prioritized Interventions)
- **AI Triage Flow:** `DETECT → EXPLAIN → SIMULATE → ACT`.
- **Top Filterable KPIs:** High Priority, Medium Priority, On Track, Uncertain Predictions, and Assessments Soon.
- **Intervention Queue Table:** Urgent students ranked by deterministic composite urgency score.
- **Interactive 360° Decision Drawer:** TreeSHAP feature bars, What-If simulator, case notes, and PostgreSQL status updater.
- **2D Prioritization Matrix:** Risk Probability vs. Urgency score with quadrant filtering.

### 🖥️ Java AWT Desktop Client (`awt_client/EduInsightAWT.java`)
- Native desktop interface for rapid offline/kiosk student risk queries communicating directly with FastAPI.

---

## 5. Verification & Test Execution

```bash
# Run all 57 automated tests across FastAPI, Flask, and ML modules:
python -m pytest -q
```
**Result:** `57 passed in ~3m 19s (100% PASS rate)`.

---

## 6. Service Startup Commands

```bash
# One-click startup for all 4 background daemons:
./start_all_services.bat

# Or run individually:
node backend/server.js                                     # Express API (:5000)
python -m uvicorn fastapi_service.main:app --port 8000     # FastAPI AI (:8000)
python flask_app/app.py                                    # Flask Web App (:5001)
cd frontend && npm run dev                                 # React UI (:3000)
```

---

## 7. Local Application Links & Route Directory

| Interface / Service | Local URL | Description |
| :--- | :--- | :--- |
| **Route Directory** | `http://127.0.0.1:5001/routes` | Centralized clickable navigation index of all endpoints |
| **Flask Presentation Web App** | `http://127.0.0.1:5001` | Server-rendered visual analytics and decision support portal |
| **React 18 Frontend UI** | `http://127.0.0.1:3000` | Unified interactive SPA for Students, Faculty, and Administrators |
| **FastAPI Swagger Docs** | `http://127.0.0.1:8000/docs` | Interactive OpenAPI Swagger UI documentation |
| **FastAPI ReDoc** | `http://127.0.0.1:8000/redoc` | Formatted ReDoc interactive API specification |
| **FastAPI Health Status** | `http://127.0.0.1:8000/health` | AI microservice & pgvector index readiness endpoint |
| **Express Backend API** | `http://127.0.0.1:5000` | Core relational REST API gateway and JWT authentication |

### Key Web Routes
- **Student Profile View**: `http://127.0.0.1:5001/students?id=STU0016&checkpoint=W12`
- **Interactive What-If Simulator**: `http://127.0.0.1:5001/whatif?id=STU0016`
- **Prioritized Interventions Queue**: `http://127.0.0.1:5001/interventions`
- **Temporal Progression Tracker**: `http://127.0.0.1:5001/temporal`
- **Model Governance & Calibration Lab**: `http://127.0.0.1:5001/model-lab`
- **System Architecture Inspector**: `http://127.0.0.1:5001/architecture`

