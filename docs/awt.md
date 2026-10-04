# Java AWT Desktop Client Documentation

`awt_client/EduInsightAWT.java` provides a standalone native Java desktop client for faculty mentors.

## Architecture

```
Java AWT Client (Desktop)
        ↓ HTTP JSON
FastAPI Service (:8000)
        ↓
EduInsight AI Microservices
```

## Compilation & Execution

```bash
# Navigate to awt_client directory
cd awt_client

# Compile the standalone Java client
javac EduInsightAWT.java

# Run the desktop client
java EduInsightAWT
```

## User Interface Elements

1. **Student ID Selector:** Input field for student roll number or ID.
2. **Checkpoint Selector:** Dropdown for temporal milestones (`W4`, `W8`, `W12`).
3. **Analyze Action Button:** Triggers asynchronous HTTP query to FastAPI `/api/intelligence/analyze/{id}`.
4. **Results Display Panel:** Displays Predicted Risk, Risk Probability, Uncertainty Status, Primary Contributing Factor, and Recommended Intervention.
