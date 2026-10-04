const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/subjects - List all subjects
router.get('/', async (req, res) => {
  try {
    const { course_id, semester_no, is_elective, is_lab, search } = req.query;
    let query = `
      SELECT 
        s.subject_id,
        s.course_id,
        s.subject_code,
        s.subject_name,
        s.short_name,
        s.credits,
        s.lecture_hours,
        s.tutorial_hours,
        s.practical_hours,
        s.subject_type,
        s.semester_no,
        s.max_marks,
        s.pass_marks,
        s.internal_weightage,
        s.external_weightage,
        s.is_elective,
        s.is_lab,
        s.status,
        s.created_at,
        s.updated_at,
        c.course_name,
        c.course_code,
        d.dept_name,
        d.dept_code
      FROM subject s
      JOIN course c ON s.course_id = c.course_id
      LEFT JOIN department d ON c.dept_id = d.dept_id
      WHERE 1=1
    `;
    const params = [];

    if (course_id) {
      params.push(parseInt(course_id, 10));
      query += ` AND s.course_id = $${params.length}`;
    }
    if (semester_no) {
      params.push(parseInt(semester_no, 10));
      query += ` AND s.semester_no = $${params.length}`;
    }
    if (is_elective !== undefined) {
      params.push(is_elective === 'true');
      query += ` AND s.is_elective = $${params.length}`;
    }
    if (is_lab !== undefined) {
      params.push(is_lab === 'true');
      query += ` AND s.is_lab = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (s.subject_name ILIKE $${params.length} OR s.subject_code ILIKE $${params.length} OR s.short_name ILIKE $${params.length})`;
    }

    query += ` ORDER BY s.course_id ASC, s.semester_no ASC, s.subject_code ASC;`;

    const result = await db.query(query, params);
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subjects',
      error: error.message,
    });
  }
});

// GET /api/subjects/:id - Get single subject by ID
router.get('/:id', async (req, res) => {
  try {
    const subjectId = parseInt(req.params.id, 10);
    if (isNaN(subjectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subject ID',
      });
    }

    const subRes = await db.query(
      `SELECT 
        s.*,
        c.course_name,
        c.course_code,
        d.dept_name,
        d.dept_code
       FROM subject s
       JOIN course c ON s.course_id = c.course_id
       LEFT JOIN department d ON c.dept_id = d.dept_id
       WHERE s.subject_id = $1;`,
      [subjectId]
    );

    if (subRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Subject with ID ${subjectId} not found`,
      });
    }

    // Fetch assigned faculties
    const facRes = await db.query(
      `SELECT 
        fs.faculty_subject_id,
        fs.faculty_id,
        fs.semester_id,
        fs.section,
        fs.academic_year,
        f.employee_code,
        f.first_name,
        f.last_name,
        f.email,
        f.designation
       FROM faculty_subject fs
       JOIN faculty f ON fs.faculty_id = f.faculty_id
       WHERE fs.subject_id = $1 AND fs.status = 'Active';`,
      [subjectId]
    );

    const subject = subRes.rows[0];
    subject.assigned_faculty = facRes.rows;

    res.json({
      success: true,
      data: subject,
    });
  } catch (error) {
    console.error('Error fetching subject by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subject details',
      error: error.message,
    });
  }
});

module.exports = router;
