# EduInsight AI — Technology Architecture & Integration Report

## 1. Multi-Tier Technology Topology

| Component | Technology | Primary Role | Port |
|---|---|---|---|
| **Core Database** | PostgreSQL 16 | Relational academic record storage | 5432 |
| **Vector Store** | pgvector extension | Semantic policy retrieval | 5432 |
| **REST API Server** | Node.js / Express | Operational database CRUD & auth | 5000 |
| **AI Microservice** | FastAPI / Python 3.13 | ML prediction, SHAP, Conformal, Counterfactuals | 8000 |
| **Web Presentation** | Flask / Jinja2 / Chart.js | Visual decision-support analytics | 5001 |
| **Web App UI** | React 18 / Vite / TailwindCSS | Student Command Center & Faculty Portal | 3000 |
| **Desktop Monitor** | Java AWT / Swing | Native desktop risk assessment monitor | — |

---

## 2. End-to-End Workflow Verification

### Student Journey
1. Student logs in (`23CSE001` / `password`) $\to$ JWT generated $\to$ Redirected to `/student/dashboard`.
2. Attendance Recovery Simulator calculates exact lectures needed to reach $\ge 75\%$.
3. Timetable timeline displays current class, upcoming lectures, and classroom room numbers.
4. Embedded AI Risk card shows risk status, student-friendly explanation, and "What-If" simulator.

### Faculty Journey
1. Faculty logs in (`faculty01` / `password`) $\to$ Opens Prioritized Interventions.
2. High-priority students identified via composite urgency score.
3. Clicking a student opens the 360° Decision Drawer with TreeSHAP attributions and What-If simulator.
4. Faculty updates status to `ASSIGNED` or `IN_PROGRESS` $\to$ Persisted to PostgreSQL.

### Desktop Journey
1. Launch `EduInsightAWT`.
2. Enter Student ID (`STU0016`), select checkpoint `W12`, click `Analyze`.
3. Displays live risk probability, conformal uncertainty, SHAP drivers, and recommended intervention via FastAPI.
