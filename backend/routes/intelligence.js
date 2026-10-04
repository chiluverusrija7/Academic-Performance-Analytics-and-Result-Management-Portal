const express = require('express');
const router = express.Router();
const db = require('../config/db');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

/**
 * GET /api/intelligence/risk/:studentId
 * Proxies request to Python FastAPI ML Microservice to fetch Early Academic Risk predictions.
 */
router.get('/risk/:studentId', async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId, 10);
    if (isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID parameter',
      });
    }

    // Verify student existence in PostgreSQL first
    const studentCheck = await db.query(
      `SELECT s.student_id, s.roll_no, s.first_name, s.last_name, s.current_semester, d.dept_name, c.course_name
       FROM student s
       LEFT JOIN department d ON s.dept_id = d.dept_id
       LEFT JOIN course c ON s.course_id = c.course_id
       WHERE s.student_id = $1`,
      [studentId]
    );

    if (studentCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Student with ID ${studentId} not found in database`,
      });
    }

    const studentInfo = studentCheck.rows[0];

    // Query Python ML Inference Microservice
    try {
      const mlResponse = await fetch(`${ML_SERVICE_URL}/api/predict/risk/${studentId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!mlResponse.ok) {
        const errorData = await mlResponse.json().catch(() => ({ detail: mlResponse.statusText }));
        return res.status(mlResponse.status).json({
          success: false,
          message: 'Error returned from ML Risk Microservice',
          error: errorData,
        });
      }

      const mlData = await mlResponse.json();

      return res.json({
        success: true,
        student: {
          student_id: studentInfo.student_id,
          roll_no: studentInfo.roll_no,
          full_name: `${studentInfo.first_name} ${studentInfo.last_name || ''}`.trim(),
          department: studentInfo.dept_name,
          course: studentInfo.course_name,
          semester: studentInfo.current_semester,
        },
        prediction: mlData,
      });

    } catch (mlErr) {
      console.error(`[Express Intelligence Proxy] Failed to reach Python ML Microservice: ${mlErr.message}`);
      return res.status(503).json({
        success: false,
        status: 'service_unavailable',
        message: 'EduInsight ML Risk Microservice is currently unreachable. Ensure Python FastAPI service is running on port 8000.',
        error: mlErr.message,
      });
    }

  } catch (error) {
    console.error('Error handling risk prediction proxy request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process intelligence risk request',
      error: error.message,
    });
  }
});

/**
 * GET /api/intelligence/students
 * Lists available ML cohort students.
 */
router.get('/students', async (req, res) => {
  try {
    const mlResponse = await fetch(`${ML_SERVICE_URL}/api/intelligence/students?limit=${req.query.limit || 100}`);
    if (!mlResponse.ok) {
      return res.status(mlResponse.status).json(await mlResponse.json());
    }
    const data = await mlResponse.json();
    res.json({ success: true, students: data });
  } catch (err) {
    res.status(503).json({ success: false, message: 'ML service unreachable', error: err.message });
  }
});

/**
 * GET /api/intelligence/analyze/:studentId
 * Unified 360-degree risk analysis endpoint (Prediction + SHAP + Conformal + Counterfactual + Interventions).
 */
router.get('/analyze/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { checkpoint = 'W12', semester, alpha = 0.10 } = req.query;

    const url = `${ML_SERVICE_URL}/api/intelligence/analyze/${studentId}?checkpoint=${checkpoint}&alpha=${alpha}${semester ? `&semester_no=${semester}` : ''}`;
    const mlResponse = await fetch(url);
    if (!mlResponse.ok) {
      const errData = await mlResponse.json().catch(() => ({ detail: mlResponse.statusText }));
      return res.status(mlResponse.status).json({ success: false, error: errData });
    }
    const data = await mlResponse.json();
    res.json({ success: true, analysis: data });
  } catch (err) {
    res.status(503).json({ success: false, message: 'ML service unreachable', error: err.message });
  }
});

/**
 * POST /api/intelligence/counterfactual/:studentId
 * Interactive user-defined what-if counterfactual simulation.
 */
router.post('/counterfactual/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const mlResponse = await fetch(`${ML_SERVICE_URL}/api/intelligence/counterfactual/${studentId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    if (!mlResponse.ok) {
      return res.status(mlResponse.status).json(await mlResponse.json());
    }
    const data = await mlResponse.json();
    res.json({ success: true, result: data });
  } catch (err) {
    res.status(503).json({ success: false, message: 'ML service unreachable', error: err.message });
  }
});

/**
 * GET /api/intelligence/trajectory/:studentId
 * Longitudinal trajectory across historical semesters and in-semester milestones.
 */
router.get('/trajectory/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const mlResponse = await fetch(`${ML_SERVICE_URL}/api/intelligence/trajectory/${studentId}`);
    if (!mlResponse.ok) {
      return res.status(mlResponse.status).json(await mlResponse.json());
    }
    const data = await mlResponse.json();
    res.json({ success: true, trajectory: data });
  } catch (err) {
    res.status(503).json({ success: false, message: 'ML service unreachable', error: err.message });
  }
});

/**
 * GET /api/intelligence/queue
 * Faculty prioritized intervention queue.
 */
router.get('/queue', async (req, res) => {
  try {
    const { checkpoint = 'W12', limit = 50 } = req.query;
    const mlResponse = await fetch(`${ML_SERVICE_URL}/api/intelligence/queue?checkpoint=${checkpoint}&limit=${limit}`);
    if (!mlResponse.ok) {
      return res.status(mlResponse.status).json(await mlResponse.json());
    }
    const data = await mlResponse.json();
    res.json({ success: true, queue: data });
  } catch (err) {
    res.status(503).json({ success: false, message: 'ML service unreachable', error: err.message });
  }
});

/**
 * GET /api/intelligence/interventions
 * Fetches all persistent faculty intervention records from PostgreSQL.
 */
router.get('/interventions', async (req, res) => {
  try {
    const { checkpoint = 'W12' } = req.query;
    const dbRes = await db.query(
      `SELECT * FROM intervention_status WHERE checkpoint = $1 ORDER BY updated_at DESC`,
      [checkpoint]
    );
    res.json({ success: true, interventions: dbRes.rows });
  } catch (err) {
    console.error('Error fetching intervention statuses:', err);
    res.status(500).json({ success: false, message: 'Database query error', error: err.message });
  }
});

/**
 * POST /api/intelligence/interventions
 * Creates or updates an intervention status, faculty assignment, and review notes.
 */
router.post('/interventions', async (req, res) => {
  try {
    const {
      student_id,
      checkpoint = 'W12',
      status = 'ASSIGNED',
      priority = 'HIGH',
      intervention_type,
      assigned_faculty_id,
      assigned_faculty_name,
      next_review_date,
      notes
    } = req.body;

    if (!student_id) {
      return res.status(400).json({ success: false, message: 'student_id is required' });
    }

    const dbRes = await db.query(
      `INSERT INTO intervention_status 
         (student_id, checkpoint, status, priority, intervention_type, assigned_faculty_id, assigned_faculty_name, next_review_date, notes, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       ON CONFLICT (student_id, checkpoint) DO UPDATE
       SET status = EXCLUDED.status,
           priority = EXCLUDED.priority,
           intervention_type = COALESCE(EXCLUDED.intervention_type, intervention_status.intervention_type),
           assigned_faculty_id = COALESCE(EXCLUDED.assigned_faculty_id, intervention_status.assigned_faculty_id),
           assigned_faculty_name = COALESCE(EXCLUDED.assigned_faculty_name, intervention_status.assigned_faculty_name),
           next_review_date = COALESCE(EXCLUDED.next_review_date, intervention_status.next_review_date),
           notes = COALESCE(EXCLUDED.notes, intervention_status.notes),
           updated_at = NOW()
       RETURNING *;`,
      [student_id, checkpoint, status, priority, intervention_type, assigned_faculty_id, assigned_faculty_name, next_review_date, notes]
    );

    res.json({ success: true, message: 'Intervention status updated successfully', record: dbRes.rows[0] });
  } catch (err) {
    console.error('Error updating intervention status:', err);
    res.status(500).json({ success: false, message: 'Failed to update intervention status', error: err.message });
  }
});

module.exports = router;
