# EduInsight AI — Future Scope & Research Directions

---

## 1. Multi-Institutional External Validation
- Evaluate the generalizability of the temporal risk architecture across multiple partner universities with differing academic calendars, grading distributions, and credit requirements.
- Assess transfer learning capabilities for newly established academic departments with sparse historical training data.

---

## 2. Fairness Auditing & Subgroup Conformal Calibration
- Implement group-conditional conformal prediction (e.g. Mondrian Conformal Prediction) to guarantee exact $\ge 95\%$ coverage across sensitive demographic sub-cohorts and quota categories.
- Perform formal algorithmic fairness audits (disparate impact, equalized odds) across all temporal checkpoints.

---

## 3. Real-Time LMS & Attendance IoT Streaming
- Integrate live event streaming (Kafka/RabbitMQ) with Learning Management Systems (Canvas, Moodle, Google Classroom) to capture real-time submission delays and portal engagement telemetry.
- Connect biometric and RFID classroom attendance logs for automated daily feature ingestion.

---

## 4. Longitudinal Intervention Outcome Tracking
- Establish a feedback loop recording whether students who received prescribed interventions (e.g. `SUBJECT_REMEDIATION`) successfully cleared semester backlogs.
- Use longitudinal outcome logs to dynamically optimize intervention cost weights and recommendation rules over multi-year horizons.
