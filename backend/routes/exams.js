const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/exams - List all exams
router.get('/', async (req, res) => {
  try {
    const { semester_id, exam_type, academic_year, status } = req.query;
    let query = `
      SELECT 
        ex.exam_id,
        ex.semester_id,
        ex.exam_name,
        ex.exam_type,
        ex.academic_year,
        ex.exam_start_date,
        ex.exam_end_date,
        ex.status,
        ex.created_at,
        sem.semester_no,
        c.course_name,
        c.course_code,
        COUNT(DISTINCT m.mark_id) AS marks_entered_count
      FROM exam ex
      JOIN semester sem ON ex.semester_id = sem.semester_id
      JOIN course c ON sem.course_id = c.course_id
      LEFT JOIN marks m ON ex.exam_id = m.exam_id
      WHERE 1=1
    `;
    const params = [];

    if (semester_id) {
      params.push(parseInt(semester_id, 10));
      query += ` AND ex.semester_id = $${params.length}`;
    }
    if (exam_type) {
      params.push(exam_type);
      query += ` AND ex.exam_type = $${params.length}`;
    }
    if (academic_year) {
      params.push(academic_year);
      query += ` AND ex.academic_year = $${params.length}`;
    }
    if (status) {
      params.push(status);
      query += ` AND ex.status = $${params.length}`;
    }

    query += `
      GROUP BY ex.exam_id, sem.semester_no, c.course_name, c.course_code
      ORDER BY ex.exam_start_date DESC, ex.exam_id ASC;
    `;

    const result = await db.query(query, params);
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exams',
      error: error.message,
    });
  }
});

// POST /api/exams - Create new exam
router.post('/', async (req, res) => {
  try {
    const { semester_id, exam_name, exam_type, academic_year, exam_start_date, exam_end_date, status } = req.body;

    if (!semester_id || !exam_name || !exam_type) {
      return res.status(400).json({
        success: false,
        message: 'semester_id, exam_name, and exam_type are mandatory',
      });
    }

    const insertQuery = `
      INSERT INTO exam (
        semester_id, exam_name, exam_type, academic_year, exam_start_date, exam_end_date, status, created_at
      ) VALUES (
        $1, $2, $3, COALESCE($4, '2026-27'), $5, $6, COALESCE($7, 'Scheduled'), NOW()
      ) RETURNING *;
    `;

    const result = await db.query(insertQuery, [
      semester_id, exam_name, exam_type, academic_year, exam_start_date || null,
      exam_end_date || null, status || null
    ]);

    res.status(201).json({
      success: true,
      message: 'Exam schedule created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule exam',
      error: error.message,
    });
  }
});

// DELETE /api/exams/:id - Delete exam
router.delete('/:id', async (req, res) => {
  try {
    const examId = parseInt(req.params.id, 10);
    if (isNaN(examId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid exam ID',
      });
    }

    const result = await db.query(
      `DELETE FROM exam WHERE exam_id = $1 RETURNING *;`,
      [examId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Exam with ID ${examId} not found`,
      });
    }

    res.json({
      success: true,
      message: 'Exam deleted successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error deleting exam:', error);
    if (error.code === '23503') {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete exam because marks records are already entered.',
        error: error.detail,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to delete exam',
      error: error.message,
    });
  }
});

module.exports = router;
