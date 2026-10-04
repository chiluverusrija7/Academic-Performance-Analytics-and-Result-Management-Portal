# EduInsight AI — Final Project Summary

**Capstone Project:** EduInsight AI  
**Subtitle:** An Explainable, Uncertainty-Aware Academic Decision Support System  
**Academic Year:** 2026  
**Final Status:** Validated, Verified & Capstone-Ready  

---

## 1. Project Overview & Problem Statement
Higher education institutions face systemic challenges in early academic risk intervention. Conventional institutional systems operate reactively—evaluating student standing only after semester-end final grades and SGPA are computed. By the time failure is recorded, remedial opportunities have passed, resulting in student backlogs, delayed graduation, and avoidable attrition.

**EduInsight AI** provides a multi-stage **Academic Decision Support System** that analyzes students longitudinally across three in-semester milestones (**Week 4**, **Week 8**, and **Week 12**). 

The system transitions higher-education analytics from:
$$\text{Descriptive (Post-Hoc Status)} \longrightarrow \text{Predictive (Temporal Risk)} \longrightarrow \text{Explainable (SHAP)} \longrightarrow \text{Uncertainty-Aware (Conformal)} \longrightarrow \text{Prescriptive (Interventions)}$$

---

## 2. Motivation & DBMS Foundation
EduInsight originated as a comprehensive **16-table PostgreSQL relational academic database** managing core operational entities (`STUDENT`, `ADMISSION`, `USERS`, `DEPARTMENT`, `COURSE`, `SEMESTER`, `SUBJECT`, `FACULTY`, `FACULTY_SUBJECT`, `ENROLLMENT`, `ATTENDANCE`, `EXAM`, `MARKS`, `GRADE`, `RESULT`, `FEE`).

### Why Conventional DBMS / Descriptive Analytics Was Insufficient:
- **SQL Aggregations are Retrospective**: Standard queries (`AVG(marks)`, `COUNT(backlogs)`) calculate what has *already happened*, offering no predictive trajectory or risk velocity signals.
- **Single-Threshold Pitfalls**: Simple static heuristics (e.g. `attendance < 75%`) fail to detect complex multi-subject interactions where a student maintains 80% aggregate attendance but experiences acute failure across 3 core technical subjects.
- **Black-Box AI Drawbacks**: Traditional predictive models output opaque probabilities without explaining *why* a student is flagged, providing no confidence bounds, and offering zero guidance on *how* to reverse the trajectory.

---

## 3. The 5-Layer AI Extension Introduced

EduInsight AI integrates 5 modular machine learning and decision-support layers:
1. **Temporal Predictive Layer (Phase 2)**: Supervised XGBoost pipelines evaluated under strict student-grouped cross-validation across Week 4, Week 8, and Week 12.
2. **Explainable AI Layer (Phase 3)**: `shap.TreeExplainer` decomposes risk into ranked **Risk Factors** ($SHAP > 0$) and **Protective Factors** ($SHAP < 0$) with non-causal statistical interpretations.
3. **Uncertainty Quantification Layer (Phase 4)**: Split Conformal Prediction constructs finite-sample prediction sets ($C(x) \subseteq \{\text{"SAFE"}, \text{"RISK"}\}$) delivering $\ge 95\%$ coverage guarantees and gating ambiguous boundary cases (`AMBIGUOUS`).
4. **Counterfactual What-If Simulator (Phase 5)**: Solves for the minimal realistic behavioral modification ($\Delta \text{Attendance}$, $\Delta \text{Marks}$, subject remediation) required to transition risk to `SAFE` by passing modified vectors through the actual trained pipeline.
5. **Prescriptive Intervention Engine (Phase 6)**: Maps multi-signal evidence into structured institutional action plans (`SUBJECT_REMEDIATION`, `ATTENDANCE_SUPPORT`, `FACULTY_MENTORING`, `STUDY_PLAN`, `EARLY_ACADEMIC_COUNSELLING`) and ranks at-risk students in an actionable **Prioritized Intervention Queue**.

---

## 4. Key Technical Contributions & Novelty
- **Zero-Leakage Longitudinal Design**: Strict student-group-aware partitioning (`GroupShuffleSplit`) ensures zero student overlap across Train (180), Calibration (60), and Test (60) partitions.
- **Uncertainty-Gated Institutional Policy**: Automatically caps priority at `MEDIUM` and prevents invasive remedial actions when model certainty is `AMBIGUOUS`.
- **Real-Model Counterfactual Actionability**: Re-evaluates what-if scenarios directly through the trained pipeline under strict physical bounds ($[0, 100]\%$, integer subject counts) while protecting immutable demographics.
- **Demographic Bias Protection**: Prohibits sensitive identity attributes (`admission_category`, `dept_code`, etc.) from directly triggering remedial interventions.

---

## 5. Dataset & Experimental Results Summary

- **Dataset Scale**: $300$ unique students, $1,680$ student-semester records, $9,120$ subject-level records, $13.39\%$ baseline positive risk rate ($225$ risk observations).
- **Predictive Performance (XGBoost Champion)**:
  - **Week 4**: PR-AUC $= 0.8201$, ROC-AUC $= 0.9538$, F1 $= 0.6824$, Brier Score $= 0.0535$.
  - **Week 8**: PR-AUC $= 0.9136$, ROC-AUC $= 0.9873$, F1 $= 0.7945$, Brier Score $= 0.0330$.
  - **Week 12**: PR-AUC $= 0.9547$, ROC-AUC $= 0.9939$, F1 $= 0.8235$, Brier Score $= 0.0215$.
- **Conformal Coverage ($\alpha = 0.05$, Target $95\%$)**:
  - Week 4: **$96.51\%$** empirical coverage (Ambiguity: $9.88\%$).
  - Week 8: **$96.51\%$** empirical coverage (Ambiguity: $2.62\%$).
  - Week 12: **$96.80\%$** empirical coverage (Ambiguity: **$0.00\%$**).
- **Test Suite Verification**: **41/41 automated unit & integration tests passing (100% success rate)**.

---

## 6. Limitations & Synthetic Data Disclosure

1. **Synthetic Data Context**: Predictive models and calibration thresholds were trained on the validated Phase 1 synthetic longitudinal dataset. Real-world institutional deployment requires continuous domain recalibration on live cohort data.
2. **Advisory Decision Support**: All predictions, attributions, and prescriptive plans serve as decision support for academic mentors and faculty, who retain full human-in-the-loop discretion.
3. **Non-Causal Statistical Grounding**: SHAP attributions and counterfactual simulations describe model-based associative relationships and do not establish unobserved real-world causal mechanisms.
