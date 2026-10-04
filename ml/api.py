"""
ml/api.py
Direct entry point forwarding to the canonical FastAPI service in fastapi_service.main.
"""

from fastapi_service.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("ml.api:app", host="0.0.0.0", port=8000, reload=False)
