# EduInsight AI — Complete Demo Setup & Execution Guide

This document provides the exact verified commands to set up, configure, start, and test **EduInsight AI** for a live demonstration or viva evaluation.

---

## 1. Prerequisites & Environment Activation

Ensure you have:
- **Python 3.10 – 3.13** (Tested on Python 3.13)
- **Node.js 18+** & `npm`
- **PostgreSQL 14+** running locally (Port 5432)

### Activate Python Environment
```bash
# Using Conda:
conda activate eduinsight

# OR using virtualenv:
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# macOS / Linux:
source venv/bin/activate
```

---

## 2. Dependency Installation

### A. Python ML & Microservice Dependencies
```bash
cd D:\EduInsight
pip install -r ml/requirements.txt
```

### B. Node.js Backend Gateway Dependencies
```bash
cd D:\EduInsight\backend
npm install
```

### C. React Frontend Dashboard Dependencies
```bash
cd D:\EduInsight\frontend
npm install
```

---

## 3. Environment Variable Configuration

### Backend Gateway (`backend/.env`)
```ini
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=eduinsight_db
JWT_SECRET=eduinsight_secure_jwt_secret_key_2026
ML_SERVICE_URL=http://localhost:8000
```

---

## 4. Starting the 3 Application Tiers

Open three terminal windows to launch the integrated stack:

### Terminal 1: Python FastAPI ML Microservice (Port 8000)
```bash
cd D:\EduInsight\ml
python -m uvicorn api:app --host 0.0.0.0 --port 8000
```
- *Health Verification*: Open `http://localhost:8000/health` (Should return `{"status": "UP"}`).

### Terminal 2: Node.js / Express REST API Gateway (Port 5000)
```bash
cd D:\EduInsight\backend
npm run start
```
- *Health Verification*: Open `http://localhost:5000/api/health` (Should return database connected status).

### Terminal 3: React 18 Frontend Dashboard (Port 5173)
```bash
cd D:\EduInsight\frontend
npm run dev
```
- *Portal URL*: Open `http://localhost:5173` in Google Chrome / Edge.

---

## 5. Automated Verification Test Suite

To verify all subsystems before a presentation:
```bash
cd D:\EduInsight
python -m unittest ml/test_explainability.py ml/test_uncertainty.py ml/test_counterfactual.py ml/test_interventions.py ml/test_integration_phase7.py
```
**Expected Output**: `Ran 41 tests in ~65s ... OK (100% Passing)`.
