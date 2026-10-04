# EduInsight AI — Project Pitches (30-Second, 60-Second, & 2-Minute)

---

## 1. The 30-Second Elevator Pitch

> *"Most university dashboards tell educators what went wrong after the semester is over. **EduInsight AI** is an explainable, uncertainty-aware decision-support system that predicts academic risk early at Weeks 4, 8, and 12. Beyond predicting risk with XGBoost, it uses SHAP to explain why, Conformal Prediction to establish confidence bounds, a Counterfactual Simulator to model realistic recovery paths, and an Intervention Engine to generate prioritized faculty action plans. It turns reactive failure records into proactive student graduation support."*

---

## 2. The 60-Second Capstone Pitch

> *"Higher education institutions face high attrition because academic failure is diagnosed post-hoc—after final grades are locked. **EduInsight AI** transforms institutional decision support by uniting five machine-learning disciplines into a single pipeline.*
> 
> *First, it uses supervised XGBoost models to predict early academic risk across Week 4, Week 8, and Week 12 milestones with a PR-AUC of 0.95.*  
> *Second, it integrates SHAP TreeExplainer to break down predictions into transparent, directional risk and protective factors.*  
> *Third, it applies Split Conformal Prediction to deliver mathematical 95% coverage guarantees, explicitly flagging ambiguous edge cases.*  
> *Fourth, its Counterfactual Simulator models the minimal feasible behavioral improvements needed to bring predicted risk below the danger threshold.*  
> *Finally, its Prescriptive Engine generates structured action plans and ranks students in an urgency-weighted queue for faculty mentors.*  
> 
> *EduInsight AI bridges the gap between predictive AI and actionable institutional pedagogy."*

---

## 3. The 2-Minute Academic & Investor Pitch

> *"Good morning. In higher education, timely intervention is the difference between a student graduating or dropping out. However, current university ERPs and DBMS systems offer only descriptive analytics—calculating GPAs and backlogs after the semester has ended. By then, it is too late.*
> 
> *To solve this, we built **EduInsight AI**, an explainable, uncertainty-aware academic decision-support platform designed around a complete 5-layer pipeline.*
> 
> *1. **Temporal Risk Modeling**: Using longitudinal academic histories across 1,680 student-semesters, we trained multi-checkpoint XGBoost pipelines for Weeks 4, 8, and 12, achieving an ROC-AUC of 0.9939 and PR-AUC of 0.9547 while eliminating demographic and temporal leakage.*  
> *2. **Explainability with SHAP**: Rather than delivering black-box scores, we use SHAP TreeExplainer to isolate exact feature attributions, showing faculty whether risk is driven by multi-subject failures, continuous assessment dips, or acute absenteeism.*  
> *3. **Uncertainty Quantification**: Using Split Conformal Prediction, we provide distribution-free finite-sample coverage guarantees exceeding 95%. When data is noisy at Week 4, the model produces two-class ambiguous sets, preventing premature over-intervention.*  
> *4. **Counterfactual Simulation**: Our simulator evaluates what-if scenarios by passing modified behavioral vectors through the actual trained pipeline, identifying the minimum realistic effort required to cross into academic safety while protecting immutable student identities.*  
> *5. **Prescriptive Action Planning**: Finally, our engine translates this evidence into 7 structured intervention workflows and generates an urgency-ranked queue for academic advisors.*
> 
> *EduInsight AI is fully validated with 41 passing automated tests, zero database corruption, and a production-grade FastAPI and React architecture. It transforms academic data into student success."*
