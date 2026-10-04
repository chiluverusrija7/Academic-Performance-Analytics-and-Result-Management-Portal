const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/fees/:studentId - Get fee history and dues for a student
router.get('/:studentId', async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId, 10);
    if (isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID',
      });
    }

    // Verify student exists
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

    const feesRes = await db.query(
      `SELECT 
        f.fee_id,
        f.student_id,
        f.semester_id,
        f.fee_type,
        f.amount,
        f.due_date,
        f.paid_amount,
        f.payment_date,
        f.payment_mode,
        f.transaction_reference,
        f.payment_status,
        f.created_at,
        f.updated_at,
        sem.semester_no,
        sem.academic_year
       FROM fee f
       JOIN semester sem ON f.semester_id = sem.semester_id
       WHERE f.student_id = $1
       ORDER BY f.fee_id ASC;`,
      [studentId]
    );

    // Calculate totals
    let totalFee = 0;
    let totalPaid = 0;
    feesRes.rows.forEach(r => {
      totalFee += parseFloat(r.amount || 0);
      totalPaid += parseFloat(r.paid_amount || 0);
    });

    res.json({
      success: true,
      student: studentCheck.rows[0],
      summary: {
        total_fee: totalFee,
        total_paid: totalPaid,
        total_due: totalFee - totalPaid,
      },
      count: feesRes.rows.length,
      data: feesRes.rows,
    });
  } catch (error) {
    console.error('Error fetching fees:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fee details',
      error: error.message,
    });
  }
});

module.exports = router;
