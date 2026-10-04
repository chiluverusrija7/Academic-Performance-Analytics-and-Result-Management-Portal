# System Architecture & Multi-Tier Topology

EduInsight AI integrates 10 distinct architectural subsystems into a cohesive institutional intelligence platform.

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

## Subsystem Roles

1. **Flask Presentation Layer (`:5001`):** Serves presentation dashboards and decision support views with Chart.js analytics.
2. **FastAPI AI Layer (`:8000`):** High-throughput asynchronous service serving XGBoost predictions, TreeSHAP values, conformal prediction sets, counterfactuals, and semantic searches.
3. **PostgreSQL Relational Core (`:5432`):** Primary relational data store with 16 academic operational tables + `timetable` + `intervention_status`.
4. **pgvector Knowledge Base:** Stores 384-dimensional policy embeddings with cosine similarity indexing.
5. **Java AWT Client:** Standalone desktop client communicating over HTTP with FastAPI.
