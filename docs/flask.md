# Flask Web Presentation Application

The Flask application (`flask_app/app.py`) operates on port 5001 as a standalone visual presentation and decision-support web application.

## Key Features

- **Decoupled Architecture:** Acts strictly as the Presentation & Decision-Support UI Layer. Communicates over HTTP with the FastAPI AI/ML microservice (`:8000`) without duplicating ML logic.
- **Interactive Dashboards:**
  - Executive Overview (`/`)
  - Student 360° Profile (`/students?id=STU0016`)
  - Temporal Trajectory Analysis (`/temporal`)
  - What-If Counterfactual Simulator (`/whatif?id=STU0016`)
  - Prioritized Interventions (`/interventions`)
  - Model Governance Lab (`/model-lab`)
  - System Transparency & Architecture (`/architecture`)
- **Visual Analytics:** Chart.js visualizations for temporal comparisons, risk compositions, and feature attributions.
