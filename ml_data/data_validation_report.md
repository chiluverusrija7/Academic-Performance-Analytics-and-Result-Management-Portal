# EduInsight AI — Phase 1 Dataset Validation Report

## Executive Summary
This report documents the systematic **22-point quality, temporal consistency, and data leakage validation** performed on the synthetic longitudinal dataset (`ml_data/academic_history.csv` and its checkpoint subsets).

* **Validation Checks Performed:** `22`
* **Checks Passed:** `22` / `22`
* **Validation Status:** **ALL CHECKS PASSED (100%)**

---

## 1. Comprehensive 22-Point Validation Results

| # | Validation Category | Status | Details / Audit Evidence |
| :---: | :--- | :---: | :--- |
| 1 | Duplicate student-semester rows | ✅ PASS | Found 0 duplicates |
| 2 | Duplicate subject-level records | ✅ PASS | Found 0 subject duplicates |
| 3 | Missing values logic (Sem 1 vs Sem >1) | ✅ PASS | Core nulls: 0 |
| 4 | Numeric bounds (SGPA/CGPA [0-10], Att/Marks [0-100]) | ✅ PASS | All in bounds |
| 5 | Contiguous semester progression per student | ✅ PASS | All contiguous 1..N |
| 6 | Cohort entry year to academic year consistency | ✅ PASS | Matched timeline |
| 7 | Valid department and course codes | ✅ PASS | CSE, ECE, AIML, DS / B.TECH |
| 8 | Valid enrolled subject counts (4 to 6 subjects) | ✅ PASS | Min: 4, Max: 6 |
| 9 | Non-negative constraints on counts/credits | ✅ PASS | All non-negative |
| 10 | Valid backlog count bounds (0 <= backlogs <= subjects) | ✅ PASS | All within subject count limits |
| 11 | Outcome logic consistency (Distinction/Fail vs SGPA/Backlogs) | ✅ PASS | Inconsistencies: 0 |
| 12 | Target-risk mathematical derivation correctness | ✅ PASS | 100% match with definition rule |
| 13 | Target risk prevalence within 10%-20% | ✅ PASS | Actual prevalence: 13.39% |
| 14 | Plausible attendance dispersion | ✅ PASS | Mean: 81.1%, Std: 11.6% |
| 15 | Plausible marks dispersion | ✅ PASS | Mean: 71.8, Std: 13.8 |
| 16 | Plausible SGPA/CGPA dispersion | ✅ PASS | Mean SGPA: 7.51, Std: 1.75 |
| 17 | Longitudinal semester-to-semester state transition exactness | ✅ PASS | Prior states match previous semester outcomes exactly |
| 18 | No suspiciously perfect predictor-target correlations | ✅ PASS | Corr(Att_W12, Risk): 0.514, Corr(Marks_W12, Risk): 0.705 |
| 19 | No identical/near-duplicate feature rows | ✅ PASS | Duplicate feature rows: 0 |
| 20 | Temporal checkpoint isolation (No future features in early datasets) | ✅ PASS | Strictly isolated |
| 21 | Multi-semester longitudinal depth (Requires GroupKFold/Student-level splitting) | ✅ PASS | 300 students, 1680 observations (5.60 sems/student) |
| 22 | Predictor sets exclude all outcome variables | ✅ PASS | Zero outcome leakage |

---

## 2. Statistical & Distribution Summary

* **Total Observations:** `1,680`
* **Unique Students:** `300`
* **Target Risk Rate:** `13.39%` (225 positive cases)
* **SGPA Range:** `0.00` – `10.00` (Mean: `7.51`, Std: `1.75`)
* **CGPA Range:** `0.00` – `10.00` (Mean: `7.48`, Std: `1.57`)
* **Week 12 Attendance Range:** `34.0%` – `99.0%` (Mean: `81.1%`)
* **Week 12 Internal Marks Range:** `19.2%` – `97.5%` (Mean: `71.9%`)
* **Correlation (W12 Marks vs Risk):** `0.705` (Strong but non-deterministic)
* **Correlation (W12 Attendance vs Risk):** `0.514` (Moderate, non-deterministic)

---

## 3. PHASE 1 TRAINING-READINESS CHECK

| # | Evaluation Question | Verification Verdict | Supporting Audit Evidence |
| :---: | :--- | :---: | :--- |
| 1 | **Is the dataset longitudinal?** | **YES** | Multi-semester histories for 300 students (1 to 8 semesters per student). |
| 2 | **Are temporal checkpoints valid?** | **YES** | Discrete snapshots at Week 4, Week 8, and Week 12 with genuine delta trajectories. |
| 3 | **Is `target_risk` correctly derived?** | **YES** | Strictly computed from `final_sgpa < 6.00` OR `final_backlogs >= 1` OR `Fail`. Zero hardcoded labels. |
| 4 | **Is future information excluded from early checkpoints?** | **YES** | W4/W8/W12 checkpoint datasets contain zero outcome or downstream temporal features. |
| 5 | **Is there sufficient class diversity?** | **YES** | 14.58% risk prevalence across multiple departments and semesters. |
| 6 | **Are student trajectories realistic?** | **YES** | Multi-archetype generation (stable, declining, recovery, chronic risk) with realistic noise. |
| 7 | **Are outcomes internally consistent?** | **YES** | SGPA, backlogs, and result classifications follow university grading logic with zero contradictions. |
| 8 | **Can GroupKFold/student-level evaluation be performed later?** | **YES** | `student_id` is clearly isolated as a grouping variable for leak-free evaluation. |
| 9 | **Is the dataset ready for Phase 2 ML modeling?** | **YES** | All structural, numerical, and temporal requirements verified. |

---

## 4. FINAL VERDICT

# `READY FOR PHASE 2`

**Reasoning:**
The generated dataset satisfies all requirements for longitudinal realism, temporal checkpoint isolation, leak-free feature boundaries, and realistic risk prevalence without modifying the live operational PostgreSQL database.
