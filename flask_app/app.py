"""
flask_app/app.py
EduInsight AI — Main User-Facing Web Application (Flask Presentation Layer)

Acts strictly as the Presentation & Decision-Support UI Layer.
Communicates over HTTP with the FastAPI AI/ML microservice (port 8000)
without duplicating any machine learning, explainability, or vector retrieval logic.
"""

import os
import sys
import logging
import requests
from flask import Flask, render_template, request, jsonify, redirect, url_for

logging.basicConfig(level=logging.INFO, format='[%(asctime)s] [Flask] %(levelname)s: %(message)s')
logger = logging.getLogger("EduInsight_Flask_App")

app = Flask(
    __name__,
    template_folder="templates",
    static_folder="static"
)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "eduinsight-flask-secret-key-2026")

FASTAPI_URL = os.getenv("FASTAPI_SERVICE_URL", "http://localhost:8000")
REQUEST_TIMEOUT = 8.0  # seconds


# -------------------------------------------------------------
# Internal Helper: Safe HTTP Request to FastAPI
# -------------------------------------------------------------
def call_fastapi(endpoint: str, method: str = "GET", data: dict = None, params: dict = None) -> dict:
    url = f"{FASTAPI_URL}{endpoint}"
    try:
        if method == "POST":
            resp = requests.post(url, json=data, params=params, timeout=REQUEST_TIMEOUT)
        else:
            resp = requests.get(url, params=params, timeout=REQUEST_TIMEOUT)
            
        if resp.status_code == 200:
            return {"success": True, "data": resp.json()}
        else:
            err_detail = resp.json().get("detail", resp.text) if resp.headers.get("content-type") == "application/json" else resp.text
            return {"success": False, "status_code": resp.status_code, "error": f"FastAPI Error ({resp.status_code}): {err_detail}"}
    except requests.exceptions.ConnectionError:
        return {
            "success": False,
            "status_code": 503,
            "error": f"FastAPI AI Microservice is currently offline at {FASTAPI_URL}. Please ensure the service is running."
        }
    except requests.exceptions.Timeout:
        return {
            "success": False,
            "status_code": 504,
            "error": "FastAPI request timed out while generating risk predictions."
        }
    except Exception as e:
        return {"success": False, "status_code": 500, "error": f"Unexpected communication error: {str(e)}"}


# -------------------------------------------------------------
# Web Presentation Routes
# -------------------------------------------------------------
@app.route("/")
def index():
    """Main Executive Dashboard & 5-Stage Innovation Strip."""
    health = call_fastapi("/health")
    cohort = call_fastapi("/api/intelligence/cohort-analytics")
    return render_template(
        "index.html",
        active_tab="overview",
        health=health.get("data", {}),
        cohort=cohort.get("data", {}),
        error_msg=None if health.get("success") else health.get("error")
    )

@app.route("/students")
def students_view():
    """Student 360° Intelligence Profile & Inspector."""
    student_id = request.args.get("id", "STU0016")
    checkpoint = request.args.get("checkpoint", "W12")
    alpha = float(request.args.get("alpha", "0.10"))
    
    analysis_res = call_fastapi(f"/api/intelligence/analyze/{student_id}", params={"checkpoint": checkpoint, "alpha": alpha})
    student_list = call_fastapi("/api/intelligence/students", params={"limit": 50})
    
    return render_template(
        "index.html",
        active_tab="students",
        selected_student=student_id,
        checkpoint=checkpoint,
        alpha=alpha,
        analysis=analysis_res.get("data") if analysis_res.get("success") else None,
        students=student_list.get("data", []),
        error_msg=None if analysis_res.get("success") else analysis_res.get("error")
    )

@app.route("/temporal")
def temporal_view():
    """W4, W8, W12 Multi-Milestone Progression Analysis."""
    cohort = call_fastapi("/api/intelligence/cohort-analytics")
    return render_template(
        "index.html",
        active_tab="temporal",
        cohort=cohort.get("data", {})
    )

@app.route("/whatif")
def whatif_view():
    """Interactive What-If Counterfactual Simulator."""
    student_id = request.args.get("id", "STU0016")
    checkpoint = request.args.get("checkpoint", "W12")
    analysis_res = call_fastapi(f"/api/intelligence/analyze/{student_id}", params={"checkpoint": checkpoint})
    
    return render_template(
        "index.html",
        active_tab="whatif",
        selected_student=student_id,
        checkpoint=checkpoint,
        analysis=analysis_res.get("data") if analysis_res.get("success") else None
    )

@app.route("/interventions")
def interventions_view():
    """Prescriptive Faculty Priority Queue & Playbooks."""
    checkpoint = request.args.get("checkpoint", "W12")
    queue_res = call_fastapi("/api/intelligence/queue", params={"checkpoint": checkpoint, "limit": 50})
    
    return render_template(
        "index.html",
        active_tab="interventions",
        checkpoint=checkpoint,
        queue=queue_res.get("data", []) if queue_res.get("success") else []
    )

@app.route("/model-lab")
def model_lab_view():
    """Model Comparison, Conformal Calibration & Governance."""
    return render_template("index.html", active_tab="lab")

@app.route("/architecture")
@app.route("/tech-stack")
def tech_stack_view():
    """Interactive Technology Architecture & System Stack Diagram."""
    health = call_fastapi("/health")
    policies = call_fastapi("/api/vector/policies")
    return render_template(
        "index.html",
        active_tab="architecture",
        health=health.get("data", {}),
        policies=policies.get("data", {})
    )

@app.route("/routes")
@app.route("/link-directory")
def link_directory_view():
    """System Route & Accessibility Directory Page."""
    return render_template("routes.html")



# -------------------------------------------------------------
# REST Proxy Endpoints for Interactive Client-Side AJAX
# -------------------------------------------------------------
@app.route("/api/proxy/analyze/<student_id>")
def proxy_analyze(student_id):
    checkpoint = request.args.get("checkpoint", "W12")
    alpha = request.args.get("alpha", "0.10")
    res = call_fastapi(f"/api/intelligence/analyze/{student_id}", params={"checkpoint": checkpoint, "alpha": alpha})
    return jsonify(res), (200 if res["success"] else res.get("status_code", 500))

@app.route("/api/proxy/counterfactual/<student_id>", methods=["POST"])
def proxy_counterfactual(student_id):
    body = request.get_json() or {}
    res = call_fastapi(f"/api/intelligence/counterfactual/{student_id}", method="POST", data=body)
    return jsonify(res), (200 if res["success"] else res.get("status_code", 500))

@app.route("/api/proxy/vector/search", methods=["POST"])
def proxy_vector_search():
    body = request.get_json() or {}
    res = call_fastapi("/api/vector/search", method="POST", data=body)
    return jsonify(res), (200 if res["success"] else res.get("status_code", 500))


if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", 5001))
    logger.info(f"Starting EduInsight Flask Web UI on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=False)
