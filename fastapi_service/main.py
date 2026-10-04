"""
fastapi_service/main.py
EduInsight AI — Dedicated AI/ML & Vector Service Layer (FastAPI)

Exposes RESTful endpoints for:
- Temporal Academic Risk Prediction (Phase 2 Champion XGBoost Pipelines)
- Explainable Attributions (Phase 3 SHAP)
- Uncertainty-Aware Prediction Sets (Phase 4 Split Conformal Prediction)
- Counterfactual Simulation (Phase 5 Minimum-Change Optimizer)
- Prescriptive Interventions (Phase 6 Priority Playbooks)
- Semantic Academic Policy Retrieval (PostgreSQL / pgvector)
"""

import os
import sys
import logging
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Ensure project root is in sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from services.academic_risk_service import get_orchestration_service
from vector.vector_store import get_vector_store
from vector.retrieval import retrieve_guidance_for_risk_profile

logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s: %(message)s')
logger = logging.getLogger("EduInsight_FastAPI_Service")

app = FastAPI(
    title="EduInsight AI — Institutional Risk & Vector Microservice",
    description="FastAPI service for early risk prediction, TreeSHAP, conformal uncertainty, what-if counterfactuals, and pgvector retrieval.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------
# Request / Response Pydantic Models
# -------------------------------------------------------------
class StudentQueryRequest(BaseModel):
    student_id: str = Field(..., example="STU0016")
    semester_no: Optional[int] = Field(None, example=2)
    alpha: Optional[float] = Field(0.10, ge=0.01, le=0.50, description="Significance level for Conformal Coverage")

class CounterfactualSimulationRequest(BaseModel):
    student_id: str = Field(..., example="STU0016")
    semester_no: int = Field(2, example=2)
    checkpoint: str = Field("W12", example="W12")
    custom_deltas: Dict[str, float] = Field(..., example={"mid2_marks_pct": 15.0, "attendance_pct": 10.0})

class VectorSearchRequest(BaseModel):
    query: str = Field(..., example="Low lecture attendance condonation rules and medical leave")
    top_k: int = Field(2, ge=1, le=10)
    min_score: float = Field(0.15, ge=0.0, le=1.0)


# -------------------------------------------------------------
# 1. Health Check
# -------------------------------------------------------------
@app.get("/health")
def health_check():
    """System health check verifying ML models, DB, and pgvector readiness."""
    try:
        service = get_orchestration_service()
        v_store = get_vector_store()
        return {
            "status": "HEALTHY",
            "service": "EduInsight FastAPI AI & Vector Layer",
            "models_loaded": {
                "W4": "XGBoost Champion Pipeline (ROC-AUC 0.812)",
                "W8": "XGBoost Champion Pipeline (ROC-AUC 0.914)",
                "W12": "XGBoost Champion Pipeline (ROC-AUC 0.971)"
            },
            "vector_store": {
                "status": "READY",
                "indexed_documents": len(v_store.documents),
                "embedding_dimension": 128
            }
        }
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return {"status": "DEGRADED", "error": str(e)}


# -------------------------------------------------------------
# 2. Student Cohort & Navigation
# -------------------------------------------------------------
@app.get("/api/intelligence/students")
def list_students(limit: int = 100):
    """Lists available ML cohort students."""
    service = get_orchestration_service()
    return service.get_available_students(limit=limit)


# -------------------------------------------------------------
# 3. Dedicated Checkpoint Specific POST Endpoints
# -------------------------------------------------------------
@app.post("/predict/{checkpoint}")
@app.post("/api/predict/{checkpoint}")
def predict_risk(checkpoint: str, req: StudentQueryRequest):
    """Point risk prediction for a specified checkpoint (W4, W8, W12)."""
    service = get_orchestration_service()
    try:
        res = service.analyze_student(req.student_id, semester_no=req.semester_no, checkpoint=checkpoint, alpha=req.alpha or 0.10)
        return {
            "student_id": req.student_id,
            "checkpoint": checkpoint.upper(),
            "prediction": res["prediction"],
            "academic_context": res["academic_context"]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/explain/{checkpoint}")
@app.post("/api/explain/{checkpoint}")
def explain_risk(checkpoint: str, req: StudentQueryRequest):
    """TreeSHAP feature attributions decomposing risk drivers vs protective factors."""
    service = get_orchestration_service()
    try:
        res = service.analyze_student(req.student_id, semester_no=req.semester_no, checkpoint=checkpoint, alpha=req.alpha or 0.10)
        return {
            "student_id": req.student_id,
            "checkpoint": checkpoint.upper(),
            "explainability": res["explainability"]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/uncertainty/{checkpoint}")
@app.post("/api/uncertainty/{checkpoint}")
def quantify_uncertainty(checkpoint: str, req: StudentQueryRequest):
    """Conformal prediction sets with distribution-free coverage guarantee."""
    service = get_orchestration_service()
    try:
        res = service.analyze_student(req.student_id, semester_no=req.semester_no, checkpoint=checkpoint, alpha=req.alpha or 0.10)
        return {
            "student_id": req.student_id,
            "checkpoint": checkpoint.upper(),
            "uncertainty": res["uncertainty"]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/counterfactual/{checkpoint}")
@app.post("/api/counterfactual/{checkpoint}")
def simulate_counterfactual(checkpoint: str, req: StudentQueryRequest):
    """Automated minimum-change counterfactual optimization."""
    service = get_orchestration_service()
    try:
        res = service.analyze_student(req.student_id, semester_no=req.semester_no, checkpoint=checkpoint, alpha=req.alpha or 0.10)
        return {
            "student_id": req.student_id,
            "checkpoint": checkpoint.upper(),
            "counterfactual": res["counterfactual"]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/intervention/{checkpoint}")
@app.post("/api/intervention/{checkpoint}")
def generate_interventions(checkpoint: str, req: StudentQueryRequest):
    """Prescriptive action plan enriched with pgvector institutional policy guidance."""
    service = get_orchestration_service()
    try:
        res = service.analyze_student(req.student_id, semester_no=req.semester_no, checkpoint=checkpoint, alpha=req.alpha or 0.10)
        return {
            "student_id": req.student_id,
            "checkpoint": checkpoint.upper(),
            "intervention_plan": res["intervention_plan"],
            "retrieved_institutional_guidance": res.get("retrieved_institutional_guidance", [])
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/analyze/{checkpoint}")
@app.post("/api/analyze/{checkpoint}")
@app.get("/api/intelligence/analyze/{student_id}")
def analyze_student_unified(
    student_id: Optional[str] = None,
    checkpoint: str = "W12",
    semester_no: Optional[int] = None,
    alpha: float = 0.10,
    req: Optional[StudentQueryRequest] = None
):
    """
    Unified 360-degree Risk Intelligence Endpoint:
    Prediction + Conformal Uncertainty + TreeSHAP + What-If + Prescriptive Triage + pgvector Guidance.
    """
    s_id = req.student_id if req else student_id
    sem = req.semester_no if req else semester_no
    a_val = req.alpha if req else alpha
    
    if not s_id:
        raise HTTPException(status_code=400, detail="Missing required 'student_id'")

    service = get_orchestration_service()
    try:
        return service.analyze_student(student_id=s_id, semester_no=sem, checkpoint=checkpoint, alpha=a_val)
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Analysis pipeline error for {s_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Pipeline error: {str(e)}")


# -------------------------------------------------------------
# 4. Interactive What-If Simulator Endpoint
# -------------------------------------------------------------
@app.post("/api/intelligence/counterfactual/{student_id}")
def run_interactive_counterfactual(student_id: str, payload: CounterfactualSimulationRequest):
    """Re-evaluates XGBoost inference with custom slider deltas in real-time."""
    service = get_orchestration_service()
    try:
        return service.simulate_custom_counterfactual(
            student_id=student_id,
            semester_no=payload.semester_no,
            checkpoint=payload.checkpoint,
            custom_deltas=payload.custom_deltas
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------------------------------------------------------------
# 5. Longitudinal Trajectory & Prioritization Queue
# -------------------------------------------------------------
@app.get("/api/intelligence/trajectory/{student_id}")
def get_trajectory(student_id: str):
    """Multi-semester historical trend and in-semester W4->W8->W12 progression."""
    service = get_orchestration_service()
    return service.get_student_longitudinal_trajectory(student_id=student_id)

@app.get("/api/intelligence/queue")
def get_queue(checkpoint: str = "W12", limit: int = 50):
    """Faculty priority queue sorted by multi-factor urgency score."""
    service = get_orchestration_service()
    return service.get_prioritized_intervention_queue(checkpoint=checkpoint, limit=limit)

@app.get("/api/intelligence/cohort-analytics")
def get_cohort_analytics():
    """Aggregate risk distribution and calibration metrics across all checkpoints."""
    service = get_orchestration_service()
    return service.get_cohort_analytics_overview()


# -------------------------------------------------------------
# 6. pgvector Semantic Retrieval Endpoints
# -------------------------------------------------------------
@app.post("/api/vector/search")
def search_vector_knowledge(req: VectorSearchRequest):
    """Performs semantic cosine similarity search against institutional policies in pgvector."""
    v_store = get_vector_store()
    results = v_store.search_similar_policies(query=req.query, top_k=req.top_k, min_score=req.min_score)
    return {
        "query": req.query,
        "results_count": len(results),
        "matches": results
    }

@app.get("/api/vector/policies")
def list_all_vector_policies():
    """Lists all indexed institutional knowledge policies."""
    v_store = get_vector_store()
    return {
        "total_documents": len(v_store.documents),
        "documents": v_store.get_all_policies()
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("fastapi_service.main:app", host="0.0.0.0", port=8000, reload=False)
