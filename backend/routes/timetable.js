const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/timetable/student/:studentId — full weekly timetable for a student
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    // Find student's current enrollment
    const studentRes = await db.query(
      `SELECT s.student_id, s.current_semester, s.section,
              d.dept_name, c.course_name, sem.semester_id, sem.academic_year
       FROM student s
       LEFT JOIN department d ON s.dept_id = d.dept_id
       LEFT JOIN course c ON s.course_id = c.course_id
       LEFT JOIN enrollment e ON e.student_id = s.student_id
       LEFT JOIN semester sem ON e.semester_id = sem.semester_id
       WHERE s.student_id = $1
       ORDER BY sem.semester_id DESC NULLS LAST LIMIT 1`,
      [studentId]
    );

    if (studentRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const student = studentRes.rows[0];
    const section = student.section || 'A';
    let semesterId = student.semester_id;

    // Fallback semesterId if enrollment is empty
    if (!semesterId) {
      const semFallback = await db.query(
        `SELECT semester_id FROM semester WHERE semester_no = $1 LIMIT 1`,
        [student.current_semester || 1]
      );
      if (semFallback.rows.length > 0) {
        semesterId = semFallback.rows[0].semester_id;
      }
    }

    if (!semesterId) {
      return res.json({ success: true, timetable: [], by_day: {}, student, days: [] });
    }

    // Get full timetable for this semester/section
    const ttRes = await db.query(
      `SELECT t.timetable_id, t.day_of_week, t.start_time, t.end_time, t.room_number, t.section,
              s.subject_id, s.subject_code, s.subject_name, s.short_name, s.subject_type, s.is_lab,
              f.faculty_id, f.first_name AS faculty_first_name, f.last_name AS faculty_last_name,
              f.email AS faculty_email, d.dept_name AS faculty_dept
       FROM timetable t
       JOIN subject s ON t.subject_id = s.subject_id
       LEFT JOIN faculty f ON t.faculty_id = f.faculty_id
       LEFT JOIN department d ON f.dept_id = d.dept_id
       WHERE t.semester_id = $1
         AND (t.section = $2 OR t.section = 'A')
       ORDER BY 
         CASE t.day_of_week
           WHEN 'Monday' THEN 1
           WHEN 'Tuesday' THEN 2
           WHEN 'Wednesday' THEN 3
           WHEN 'Thursday' THEN 4
           WHEN 'Friday' THEN 5
           WHEN 'Saturday' THEN 6
         END,
         t.start_time ASC`,
      [semesterId, section]
    );

    // Group by day
    const byDay = {};
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    days.forEach(d => { byDay[d] = []; });
    ttRes.rows.forEach(row => {
      if (byDay[row.day_of_week]) byDay[row.day_of_week].push(row);
    });

    res.json({ success: true, timetable: ttRes.rows, by_day: byDay, student, days });
  } catch (error) {
    console.error('Timetable error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch timetable', error: error.message });
  }
});

// GET /api/timetable/today/:studentId — today's classes
router.get('/today/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = dayNames[new Date().getDay()];

    const semRes = await db.query(
      `SELECT s.current_semester, s.section, e.semester_id FROM student s
       LEFT JOIN enrollment e ON e.student_id = s.student_id
       WHERE s.student_id = $1
       ORDER BY e.enrollment_id DESC NULLS LAST LIMIT 1`,
      [studentId]
    );

    if (semRes.rows.length === 0) {
      return res.json({ success: true, today: todayName, classes: [] });
    }

    let semester_id = semRes.rows[0].semester_id;
    const section = semRes.rows[0].section || 'A';

    if (!semester_id) {
      const semFallback = await db.query(
        `SELECT semester_id FROM semester WHERE semester_no = $1 LIMIT 1`,
        [semRes.rows[0].current_semester || 1]
      );
      if (semFallback.rows.length > 0) semester_id = semFallback.rows[0].semester_id;
    }

    if (!semester_id) {
      return res.json({ success: true, today: todayName, classes: [] });
    }

    const classRes = await db.query(
      `SELECT t.timetable_id, t.day_of_week, t.start_time, t.end_time, t.room_number,
              s.subject_code, s.subject_name, s.short_name, s.subject_type, s.is_lab,
              f.first_name AS faculty_first_name, f.last_name AS faculty_last_name,
              f.email AS faculty_email
       FROM timetable t
       JOIN subject s ON t.subject_id = s.subject_id
       LEFT JOIN faculty f ON t.faculty_id = f.faculty_id
       WHERE t.semester_id = $1
         AND t.day_of_week = $2
         AND (t.section = $3 OR t.section = 'A')
       ORDER BY t.start_time ASC`,
      [semester_id, todayName, section]
    );

    res.json({ success: true, today: todayName, classes: classRes.rows });
  } catch (error) {
    console.error('Today timetable error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch today schedule', error: error.message });
  }
});

// GET /api/timetable/upcoming/:studentId — next 3-5 upcoming classes
router.get('/upcoming/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const now = new Date();
    const todayIdx = now.getDay();
    const currentTime = now.toTimeString().substring(0, 8);

    const semRes = await db.query(
      `SELECT s.current_semester, s.section, e.semester_id FROM student s
       LEFT JOIN enrollment e ON e.student_id = s.student_id
       WHERE s.student_id = $1
       ORDER BY e.enrollment_id DESC NULLS LAST LIMIT 1`,
      [studentId]
    );

    if (semRes.rows.length === 0) {
      return res.json({ success: true, upcoming: [] });
    }

    let semester_id = semRes.rows[0].semester_id;
    const section = semRes.rows[0].section || 'A';

    if (!semester_id) {
      const semFallback = await db.query(
        `SELECT semester_id FROM semester WHERE semester_no = $1 LIMIT 1`,
        [semRes.rows[0].current_semester || 1]
      );
      if (semFallback.rows.length > 0) semester_id = semFallback.rows[0].semester_id;
    }

    if (!semester_id) {
      return res.json({ success: true, upcoming: [] });
    }

    // Get all classes for the week
    const allRes = await db.query(
      `SELECT t.timetable_id, t.day_of_week, t.start_time, t.end_time, t.room_number,
              s.subject_code, s.subject_name, s.short_name, s.subject_type,
              f.first_name AS faculty_first_name, f.last_name AS faculty_last_name,
              CASE t.day_of_week
                WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3
                WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 WHEN 'Saturday' THEN 6
                ELSE 7 END AS day_order
       FROM timetable t
       JOIN subject s ON t.subject_id = s.subject_id
       LEFT JOIN faculty f ON t.faculty_id = f.faculty_id
       WHERE t.semester_id = $1
         AND (t.section = $2 OR t.section = 'A')
       ORDER BY day_order, t.start_time`,
      [semester_id, section]
    );

    const upcoming = [];
    // First: today's remaining classes
    for (const cls of allRes.rows) {
      const clsDayIdx = ['Sunday', 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].indexOf(cls.day_of_week);
      if (clsDayIdx === todayIdx && cls.start_time > currentTime) {
        upcoming.push({ ...cls, timing_label: 'Today' });
      }
    }
    // Next: upcoming days
    for (const cls of allRes.rows) {
      const clsDayIdx = ['Sunday', 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].indexOf(cls.day_of_week);
      if (clsDayIdx > todayIdx) {
        upcoming.push({ ...cls, timing_label: cls.day_of_week });
        if (upcoming.length >= 5) break;
      }
    }
    // If empty (e.g. weekend or late evening), take from start of week
    if (upcoming.length === 0) {
      for (const cls of allRes.rows) {
        upcoming.push({ ...cls, timing_label: cls.day_of_week });
        if (upcoming.length >= 5) break;
      }
    }

    res.json({ success: true, upcoming: upcoming.slice(0, 5) });
  } catch (error) {
    console.error('Upcoming classes error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch upcoming classes', error: error.message });
  }
});

module.exports = router;
