# EduInsight AI — Complete Route and Accessibility Directory

This document provides the definitive, code-verified audit of all accessible URLs, REST endpoints, UI routes, desktop interfaces, and database connection details across the EduInsight AI platform.

---

## 1. Local Application Port Map

| Component | Technology | Default Port | Base URL |
| :--- | :--- | :--- | :--- |
| **Frontend Web Application** | React 18 + Vite | `3000` (or `5173`) | `http://127.0.0.1:3000` |
| **Presentation Layer** | Flask 3.0 + Jinja2 | `5001` | `http://127.0.0.1:5001` |
| **Core API Gateway** | Express.js + Node.js | `5000` | `http://127.0.0.1:5000` |
| **AI & Vector Microservice** | FastAPI + Uvicorn | `8000` | `http://127.0.0.1:8000` |
| **Relational & Vector DB** | PostgreSQL 16 + pgvector | `5432` | `localhost:5432` |
| **Desktop Client** | Java 17 AWT / Swing | Standalone | Native Desktop App |

---

## 2. Flask Presentation Routes (`http://127.0.0.1:5001`)

Verified directly from [`flask_app/app.py`](file:///d:/EduInsight/flask_app/app.py):

| URL | Method | Page Name | Role | Purpose | Login Required |
| :--- | :---: | :--- | :--- | :--- | :---: |
| `http://127.0.0.1:5001/` | `GET` | Executive Dashboard | Faculty / Admin | Cohort risk distribution, health telemetry, and 5-stage innovation strip | No |
| `http://127.0.0.1:5001/students` | `GET` | Student 360° Profile | Student / Faculty | Deep dive into student profile, calibrated risk, TreeSHAP attributions, and conformal intervals | No |
| `http://127.0.0.1:5001/temporal` | `GET` | Temporal Progression | Faculty / Mentor | Milestone analysis tracking trajectory across $W_4$, $W_8$, and $W_{12}$ checkpoints | No |
| `http://127.0.0.1:5001/whatif` | `GET` | What-If Simulator | Student / Mentor | Interactive slider simulator for actionable feature counterfactuals | No |
| `http://127.0.0.1:5001/interventions` | `GET` | Prioritized Interventions | Faculty / HOD | Ranked queue of at-risk students sorted by multi-signal urgency score | No |
| `http://127.0.0.1:5001/model-lab` | `GET` | Model Lab & Calibration | Admin / ML Lead | Model performance comparison, ROC-AUC curves, and Conformal reliability diagrams | No |
| `http://127.0.0.1:5001/architecture` | `GET` | System Architecture | Public / Auditor | Interactive diagram of the 5-tier architecture and pgvector policy store | No |
| `http://127.0.0.1:5001/tech-stack` | `GET` | Tech Stack (Alias) | Public / Auditor | Alias route for the architecture and technology integration inspector | No |
| `http://127.0.0.1:5001/routes` | `GET` | Route Directory | Public / System | Centralized clickable index of all application URLs and endpoints | No |
| `http://127.0.0.1:5001/link-directory` | `GET` | Link Directory (Alias) | Public / System | Alias for the route directory navigation hub | No |
| `http://127.0.0.1:5001/api/proxy/analyze/<id>` | `GET` | AJAX Analyze Proxy | Internal / AJAX | JSON proxy to FastAPI `/api/intelligence/analyze/{id}` | No |
| `http://127.0.0.1:5001/api/proxy/counterfactual/<id>` | `POST` | AJAX What-If Proxy | Internal / AJAX | JSON proxy to FastAPI counterfactual simulation engine | No |
| `http://127.0.0.1:5001/api/proxy/vector/search` | `POST` | AJAX Vector Proxy | Internal / AJAX | JSON proxy to FastAPI `/api/vector/search` | No |

---

## 3. FastAPI AI & Vector Microservice Routes (`http://127.0.0.1:8000`)

Verified directly from [`fastapi_service/main.py`](file:///d:/EduInsight/fastapi_service/main.py):

| Endpoint | Method | Purpose | Auth Required |
| :--- | :---: | :--- | :---: |
| `http://127.0.0.1:8000/docs` | `GET` | Interactive OpenAPI Swagger UI documentation and testing interface | No |
| `http://127.0.0.1:8000/redoc` | `GET` | Formatted ReDoc interactive API reference | No |
| `http://127.0.0.1:8000/openapi.json` | `GET` | Raw OpenAPI 3.0 JSON schema | No |
| `http://127.0.0.1:8000/health` | `GET` | System health check (ML pipeline status, pgvector index state) | No |
| `http://127.0.0.1:8000/api/intelligence/students` | `GET` | List available cohort student records for AI analysis | No |
| `http://127.0.0.1:8000/predict/{checkpoint}` | `POST` | Checkpoint-specific risk prediction ($W_4, W_8, W_{12}$) | No |
| `http://127.0.0.1:8000/explain/{checkpoint}` | `POST` | Checkpoint-specific TreeSHAP feature attribution breakdown | No |
| `http://127.0.0.1:8000/uncertainty/{checkpoint}` | `POST` | Split-conformal prediction sets and ambiguity status | No |
| `http://127.0.0.1:8000/counterfactual/{checkpoint}` | `POST` | Automated minimum-perturbation counterfactual recommendation | No |
| `http://127.0.0.1:8000/intervention/{checkpoint}` | `POST` | Prescriptive action plan synthesized with pgvector policy retrieval | No |
| `http://127.0.0.1:8000/analyze/{checkpoint}` | `POST` | Unified analysis payload (Risk + SHAP + Conformal + What-If + Guidance) | No |
| `http://127.0.0.1:8000/api/intelligence/analyze/{student_id}` | `GET` | Unified 360° risk intelligence profile for a specific student | No |
| `http://127.0.0.1:8000/api/intelligence/counterfactual/{student_id}` | `POST` | Real-time interactive counterfactual simulation with custom slider deltas | No |
| `http://127.0.0.1:8000/api/intelligence/trajectory/{student_id}` | `GET` | Longitudinal multi-semester and intra-semester trajectory | No |
| `http://127.0.0.1:8000/api/intelligence/queue` | `GET` | Faculty prioritized interventions queue sorted by urgency score | No |
| `http://127.0.0.1:8000/api/intelligence/cohort-analytics` | `GET` | Cohort-level risk distribution, model calibration, and metrics | No |
| `http://127.0.0.1:8000/api/vector/search` | `POST` | Semantic cosine similarity retrieval against institutional policies in pgvector | No |
| `http://127.0.0.1:8000/api/vector/policies` | `GET` | List all indexed institutional policies and bylaws | No |

---

## 4. React 18 Frontend UI Routes (`http://127.0.0.1:3000`)

Verified directly from [`frontend/src/App.jsx`](file:///d:/EduInsight/frontend/src/App.jsx):

| Path | View Component | Role | Description |
| :--- | :--- | :--- | :--- |
| `http://127.0.0.1:3000/` | Landing Page | Public | Institutional hero showcase and system feature overview |
| `http://127.0.0.1:3000/login` | Login View | Public | Role-based authentication modal (Student, Faculty, Admin) |
| `http://127.0.0.1:3000/student/dashboard` | Student Dashboard | Student | Personal command center with attendance simulator, timetable, and embedded risk |
| `http://127.0.0.1:3000/student/attendance` | Student Attendance | Student | Granular subject-wise attendance analytics and missed class tracking |
| `http://127.0.0.1:3000/student/marks` | Student Marks | Student | Internal exam results, lab practicals, and assignment breakdown |
| `http://127.0.0.1:3000/student/results` | Student Results | Student | Semester grade cards, SGPA, and cumulative CGPA records |
| `http://127.0.0.1:3000/student/schedule` | Student Schedule | Student | Weekly class timetable, lecture venues, and faculty contacts |
| `http://127.0.0.1:3000/student/fees` | Student Fees | Student | Academic fee payment status and receipt history |
| `http://127.0.0.1:3000/faculty/dashboard` | Faculty Dashboard | Faculty | Mentee roster, class performance, and subject management |
| `http://127.0.0.1:3000/faculty/students` | Faculty Students | Faculty | Student cohort directory with academic filtering |
| `http://127.0.0.1:3000/faculty/interventions` | Prioritized Interventions | Faculty | Multi-signal urgency queue, 2D scatter matrix, and detail drawer |
| `http://127.0.0.1:3000/admin/dashboard` | Admin Dashboard | Admin | Institutional governance, department analytics, and faculty workloads |
| `http://127.0.0.1:3000/admin/departments` | Department Admin | Admin | Department management and resource allocation |
| `http://127.0.0.1:3000/admin/courses` | Course Management | Admin | Curriculum syllabus, credit definitions, and subject mapping |
| `http://127.0.0.1:3000/admin/analytics` | Admin Analytics | Admin | Campus-wide academic performance trends and pass-rate forecasts |

---

## 5. Role-Based Navigation & Access Requirements

### Student Role
- **Login Credentials**: Standard student registration number / email + password.
- **Accessible Links**:
  - `http://127.0.0.1:3000/student/dashboard`
  - `http://127.0.0.1:3000/student/attendance`
  - `http://127.0.0.1:3000/student/marks`
  - `http://127.0.0.1:3000/student/schedule`
  - `http://127.0.0.1:5001/students` (Flask View)
  - `http://127.0.0.1:5001/whatif` (Flask Simulator)

### Faculty & Mentor Role
- **Login Credentials**: Institutional faculty ID + password.
- **Accessible Links**:
  - `http://127.0.0.1:3000/faculty/dashboard`
  - `http://127.0.0.1:3000/faculty/interventions`
  - `http://127.0.0.1:5001/interventions` (Flask Prioritized Queue)
  - `http://127.0.0.1:5001/temporal` (Flask Milestone View)
  - Java AWT Desktop Client (`EduInsightAWT.java`)

### Administrator & Academic Leadership Role
- **Login Credentials**: Administrator credentials with institutional governance permissions.
- **Accessible Links**:
  - `http://127.0.0.1:3000/admin/dashboard`
  - `http://127.0.0.1:3000/admin/departments`
  - `http://127.0.0.1:3000/admin/analytics`
  - `http://127.0.0.1:5001/model-lab` (Model Governance & Calibration)
  - `http://127.0.0.1:5001/architecture` (Architecture Inspector)

---

## 6. Java AWT Desktop Client

- **Source File**: [`awt_client/EduInsightAWT.java`](file:///d:/EduInsight/awt_client/EduInsightAWT.java)
- **Compilation Command**:
  ```bash
  cd awt_client
  javac EduInsightAWT.java
  ```
- **Run Command**:
  ```bash
  java EduInsightAWT
  ```
- **FastAPI Endpoints Utilized**:
  - `GET http://localhost:8000/api/intelligence/analyze/{studentId}?checkpoint={cp}&semester_no={sem}&alpha=0.10`

---

## 7. Database Access Information

- **Database Engine**: PostgreSQL 16 with `pgvector` extension
- **Default Host**: `localhost`
- **Default Port**: `5432`
- **Database Name**: `EduInsight`
- **Key Tables**: `department`, `course`, `semester`, `student`, `faculty`, `subject`, `faculty_subject`, `enrollment`, `attendance`, `marks`, `results`, `users`, `student_mentor`, `timetable`, `intervention_status`, `academic_knowledge_vector`.
- **pgAdmin 4**: Connect using `localhost:5432` with your local PostgreSQL master credentials.

---

## 8. GitHub Repository & Synchronization Status

- **Repository URL**: [Academic-Performance-Analytics-and-Result-Management-Portal](https://github.com/chiluverusrija7/Academic-Performance-Analytics-and-Result-Management-Portal)
- **Active Branch**: `master` (synchronized with `main`)
- **Total Commits**: 38 commits
- **Push Status**: Fully synchronized (`origin/master` and `origin/main` up to date)
