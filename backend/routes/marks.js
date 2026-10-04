const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/marks/:studentId - Get student marks records
router.get('/:studentId', async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId, 10);
    if (isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID',
      });
    }

    // Verify student
    const studentCheck = await db.query(
      `SELECT student_id, first_name, last_name, roll_no FROM student WHERE student_id = $1`,
      [studentId]
    );
    if (studentCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Student with ID ${studentId} not found`,
      });
    }

    const marksRes = await db.query(
      `SELECT 
        m.mark_id,
        m.enrollment_id,
        m.subject_id,
        m.exam_id,
        m.faculty_id,
        m.internal_marks,
        m.external_marks,
        m.total_marks,
        m.exam_type,
        m.exam_date,
        m.attempt_no,
        m.result_status,
        m.remarks,
        m.entered_at,
        s.subject_code,
        s.subject_name,
        s.credits,
        s.max_marks,
        s.pass_marks,
        ex.exam_name,
        ex.exam_type AS exam_category,
        ex.academic_year,
        f.first_name AS faculty_first_name,
        f.last_name AS faculty_last_name
       FROM marks m
       JOIN enrollment e ON m.enrollment_id = e.enrollment_id
       JOIN subject s ON m.subject_id = s.subject_id
       JOIN exam ex ON m.exam_id = ex.exam_id
       LEFT JOIN faculty f ON m.faculty_id = f.faculty_id
       WHERE e.student_id = $1
       ORDER BY ex.exam_id ASC, s.subject_code ASC;`,
      [studentId]
    );

    res.json({
      success: true,
      student: studentCheck.rows[0],
      count: marksRes.rows.length,
      data: marksRes.rows,
    });
  } catch (error) {
    console.error('Error fetching marks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch marks records',
      error: error.message,
    });
  }
});

// POST /api/marks - Enter marks
router.post('/', async (req, res) => {
  try {
    const {
      enrollment_id,
      subject_id,
      exam_id,
      faculty_id,
      internal_marks,
      external_marks,
      exam_type,
      remarks,
    } = req.body;

    if (!enrollment_id || !subject_id || !exam_id) {
      return res.status(400).json({
        success: false,
        message: 'enrollment_id, subject_id, and exam_id are mandatory',
      });
    }

    const intMarks = parseFloat(internal_marks || 0);
    const extMarks = parseFloat(external_marks || 0);
    const totalMarks = intMarks + extMarks;

    const insertQuery = `
      INSERT INTO marks (
        enrollment_id, subject_id, exam_id, faculty_id,
        internal_marks, external_marks, total_marks,
        exam_type, attempt_no, result_status, remarks,
        entered_at, updated_at
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7,
        $8, 1, 'Published', $9,
        NOW(), NOW()
      )
      ON CONFLICT (enrollment_id, subject_id, exam_id, attempt_no)
      DO UPDATE SET
        internal_marks = EXCLUDED.internal_marks,
        external_marks = EXCLUDED.external_marks,
        total_marks = EXCLUDED.total_marks,
        remarks = COALESCE(EXCLUDED.remarks, marks.remarks),
        updated_at = NOW()
      RETURNING *;
    `;

    const result = await db.query(insertQuery, [
      enrollment_id, subject_id, exam_id, faculty_id || null,
      intMarks, extMarks, totalMarks,
      exam_type || 'Internal', remarks || null
    ]);

    res.status(201).json({
      success: true,
      message: 'Marks recorded successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error saving marks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save marks record',
      error: error.message,
    });
  }
});

// PUT /api/marks/:id - Update marks
router.put('/:id', async (req, res) => {
  try {
    const markId = parseInt(req.params.id, 10);
    if (isNaN(markId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mark ID',
      });
    }

    const { internal_marks, external_marks, remarks } = req.body;
    const intMarks = parseFloat(internal_marks || 0);
    const extMarks = parseFloat(external_marks || 0);
    const totalMarks = intMarks + extMarks;

    const updateQuery = `
      UPDATE marks SET
        internal_marks = $1,
        external_marks = $2,
        total_marks = $3,
        remarks = COALESCE($4, remarks),
        updated_at = NOW()
      WHERE mark_id = $5
      RETURNING *;
    `;

    const result = await db.query(updateQuery, [intMarks, extMarks, totalMarks, remarks || null, markId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Mark record with ID ${markId} not found`,
      });
    }

    res.json({
      success: true,
      message: 'Marks updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating marks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update marks',
      error: error.message,
    });
  }
});

module.exports = router;
