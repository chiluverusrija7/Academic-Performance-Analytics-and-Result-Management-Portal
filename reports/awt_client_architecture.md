# JAVA AWT DESKTOP CLIENT ARCHITECTURE

## 1. Desktop Client Purpose & Role

The Java AWT Client (`awt_client/EduInsightAWT.java`) serves as an independent, standalone desktop monitor for departmental faculty advisors and academic counselors.

It provides a lightweight native desktop workflow allowing faculty to:
1. Enter or select any student roll number / ID (e.g. `STU0016`, `STU0001`, `STU0042`).
2. Select target temporal checkpoint (`W4`, `W8`, `W12`) and semester number.
3. Query the centralized FastAPI AI microservice over HTTP (`http://localhost:8000`).
4. Display the multi-stage academic risk diagnostic:
   - **Current Risk Probability % & Classification Badge** (`HIGH`, `MEDIUM`, `LOW`).
   - **Conformal Uncertainty Set** $C(X) = \{\text{"RISK"}\}$ with coverage guarantee ($90\%$).
   - **Primary SHAP Risk Drivers** (exact feature attributions).
   - **Prescriptive Intervention & pgvector Institutional Policy Articles**.

---

## 2. Compilation & Run Instructions

```bash
# Navigate to awt_client directory
cd d:\EduInsight\awt_client

# Compile standalone Java AWT client
javac EduInsightAWT.java

# Run Java AWT client
java EduInsightAWT
```

---

## 3. Communication Protocol

- **Transport:** Standard HTTP/1.1 `GET` via `java.net.HttpURLConnection`.
- **Target:** `http://localhost:8000/api/intelligence/analyze/{student_id}?checkpoint={checkpoint}&semester_no={sem}&alpha=0.10`
- **Fallback / Offline Mode:** Built-in fallback resilience when FastAPI is temporarily unreachable, allowing smooth demonstration during academic defenses.
