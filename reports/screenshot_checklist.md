# EduInsight AI — Capstone Report & Presentation Screenshot Checklist

This checklist specifies the 12 key visual captures required for the academic project report and slide deck, along with exact visibility, highlight, and privacy guidelines.

---

| # | View / Screen | Target URL / Component | What Should Be Visible | What Should Be Highlighted | What Must Be Hidden / Masked |
|---|---|---|---|---|---|
| **1** | Landing Page & Hero Section | `http://localhost:5173/` | Hero banner, 3D Intelligence Core animation, feature overview | Core value proposition & 5-stage pipeline summary | Developer debug logs |
| **2** | Login & Role-Based Gateway | `http://localhost:5173/login` | Clean institutional login portal with role selection | JWT Auth & Role-Based Access Control | Passwords or plain-text credentials |
| **3** | Intelligence Center Dashboard | `/intelligence` | Checkpoint tabs (W4, W8, W12), KPI cards, cohort distribution | Checkpoint selection & multi-stage status overview | Raw database connection strings |
| **4** | Student Risk Analysis Header | `/intelligence/analyze/STU0016` | Student context card, risk percentage ($99.91\%$), `HIGH RISK` badge | Temporal checkpoint milestone & risk classification | Unredacted personally identifiable data |
| **5** | Conformal Uncertainty Card | `/intelligence` (Uncertainty Card) | Prediction set ($C(x) = \{\text{RISK}\}$), `CONFIDENT_RISK` status, $95\%$ target | Finite-sample mathematical coverage bounds | Internal math formulas that confuse UI |
| **6** | SHAP Explainability Breakdown | `/intelligence` (SHAP Card) | Top risk-increasing factors ($SHAP > 0$) & protective offsets | Failing subject count & internal mark average impact | Unreadable feature tokens like `x13` |
| **7** | Counterfactual What-If Tool | `/intelligence` (What-If Card) | Input sliders/boxes, original risk vs. re-evaluated risk ($46.28\%$) | Risk reduction delta ($\Delta = -53.63\%$) and transition to `SAFE` | Disallowed demographic modification options |
| **8** | Prescriptive Action Plan | `/intelligence` (Intervention Card) | Primary action (`SUBJECT_REMEDIATION`), priority `CRITICAL`, suggested timeline | Concrete suggested action & expected model effect | Unsupported deterministic outcome claims |
| **9** | Faculty Prioritization Queue | `/faculty/intelligence` | Ranked watchlist table with student ID, risk prob, urgency score | Multi-criteria Urgency Score ranking & filters | Private personal phone/address fields |
| **10** | Student Longitudinal Trajectory | `/student/dashboard` | Multi-semester GPA/Attendance evolution & in-semester W4 $\to$ W12 curve | Performance velocity recovery / decline curves | Unreleased future semester exam outcomes |
| **11** | Cohort Risk Analytics View | `/admin/dashboard` | Recharts risk distribution charts across W4, W8, and W12 | Temporal precision progression & uncertainty drop | Raw SQL tables or server debug ports |
| **12** | Database & Terminal Verification | VS Code / Shell | 16 PostgreSQL tables listed & 41 automated tests passing (`OK`) | 100% test pass rate (41/41) & clean DBMS schema | Database superuser passwords |
