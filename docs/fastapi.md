# FastAPI AI Microservice Documentation

The FastAPI service (`fastapi_service/main.py`) operates on port 8000.

## Endpoints

1. `GET /health` — Service health check & connection verification.
2. `POST /api/auth/login` — JWT authentication and role-based token generation.
3. `POST /api/intelligence/predict/{checkpoint}` — W4 / W8 / W12 risk inference with XGBoost.
4. `POST /api/intelligence/explain/{checkpoint}` — TreeSHAP additive feature attributions.
5. `POST /api/intelligence/uncertainty/{checkpoint}` — Split-conformal prediction sets and confidence calibration.
6. `POST /api/intelligence/counterfactual/{student_id}` — Constrained what-if risk simulations.
7. `GET /api/intelligence/analyze/{student_id}` — Unified 360° student intelligence payload.
8. `GET /api/intelligence/queue` — Multi-factor prioritized intervention queue.
9. `POST /api/vector/search` — Semantic similarity search over pgvector academic policies.
10. `GET /api/vector/policies` — Lists all indexed institutional policy documents.
