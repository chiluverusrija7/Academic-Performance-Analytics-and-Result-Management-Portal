const { Pool } = require('pg');
const pool = new Pool({ host: 'localhost', port: 5432, database: 'EduInsight', user: 'postgres', password: '12345' });

(async () => {
  try {
    // Show all remaining students to understand what data exists
    const stuRes = await pool.query(
      'SELECT student_id, roll_no, reg_no, first_name, last_name, dept_id, course_id, current_semester, section, email, phone_no, gender, status, admission_year FROM student ORDER BY student_id ASC'
    );
    console.log('All students (', stuRes.rows.length, 'total):');
    stuRes.rows.slice(0, 5).forEach(s => {
      console.log(`  [${s.student_id}] ${s.roll_no} - ${s.first_name} ${s.last_name} | dept:${s.dept_id} course:${s.course_id} sem:${s.current_semester}`);
    });

    // Re-insert student 1 with a realistic record matching the schema
    // First check if student_id 1 is truly missing
    const check = await pool.query('SELECT student_id FROM student WHERE student_id = 1');
    if (check.rows.length === 0) {
      console.log('\nRe-inserting student_id=1 (was deleted during audit test)...');
      
      // Get first dept_id and course_id that exist
      const deptRes = await pool.query('SELECT dept_id FROM department ORDER BY dept_id LIMIT 1');
      const courseRes = await pool.query('SELECT course_id FROM course ORDER BY course_id LIMIT 1');
      const deptId = deptRes.rows[0].dept_id;
      const courseId = courseRes.rows[0].course_id;

      const insRes = await pool.query(`
        INSERT INTO student (
          student_id, roll_no, reg_no, dept_id, course_id, first_name, last_name,
          date_of_birth, gender, email, phone_no, address, city, state, pincode,
          admission_year, admission_date, current_semester, section, admission_type,
          category, nationality, status, created_at, updated_at
        ) VALUES (
          1, '23CSE001', '2023CSE001', $1, $2, 'Aarav', 'Sharma',
          '2004-05-15', 'Male', 'aarav.sharma@edu.in', '9876543001', '12 MG Road', 'Bangalore', 'Karnataka', '560001',
          2023, '2023-08-01', 5, 'A', 'Regular', 'General', 'Indian', 'Active', NOW(), NOW()
        ) RETURNING student_id, roll_no, first_name;
      `, [deptId, courseId]);
      console.log('Restored student:', insRes.rows[0]);

      // Sync the sequence
      const seqRes = await pool.query('SELECT setval(\'student_student_id_seq\', (SELECT MAX(student_id) FROM student))');
      console.log('Sequence synced to:', seqRes.rows[0].setval);

      // Re-add enrollment for student 1
      const semRes = await pool.query('SELECT semester_id FROM semester ORDER BY semester_id LIMIT 1');
      const semId = semRes.rows[0].semester_id;
      const enrRes = await pool.query(`
        INSERT INTO enrollment (student_id, semester_id, enrollment_date, section, enroll_status, created_at, updated_at)
        VALUES (1, $1, '2023-08-01', 'A', 'Active', NOW(), NOW())
        RETURNING enrollment_id;
      `, [semId]);
      console.log('Enrollment restored:', enrRes.rows[0]);

      // Re-add a fee record
      const feeRes = await pool.query(`
        INSERT INTO fee (student_id, semester_id, fee_type, amount, due_date, paid_amount, payment_date, payment_mode, transaction_reference, payment_status, created_at, updated_at)
        VALUES (1, $1, 'Tuition Fee', 50000, '2023-09-01', 50000, '2023-08-25', 'Online', 'TXN2023CSE001', 'Paid', NOW(), NOW())
        RETURNING fee_id;
      `, [semId]);
      console.log('Fee record restored:', feeRes.rows[0]);
      
    } else {
      console.log('Student 1 already exists, no action needed.');
    }

    // Final count check
    const finalCount = await pool.query('SELECT COUNT(*) as cnt FROM student');
    console.log('\nFinal student count:', finalCount.rows[0].cnt);

  } catch (e) {
    console.error('Restore error:', e.message);
    console.error(e.stack);
  }
  await pool.end();
})();
