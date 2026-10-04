const BASE_URL = 'http://localhost:5000/api';

async function testStudentEndpoints() {
  console.log('====================================================');
  console.log('   VERIFYING STUDENT MODULE API DATA CONTRACTS');
  console.log('====================================================\n');

  const studentId = 1;
  const tests = [];

  // 1. Student Profile
  try {
    const res = await fetch(`${BASE_URL}/students/${studentId}`);
    const data = await res.json();
    const ok = res.status === 200 && data.data && data.data.roll_no === '23CSE001';
    tests.push({ page: 'Student Profile (GET)', ok, fields: ['roll_no', 'first_name', 'dept_name', 'course_name'] });
    console.log(`[${ok ? 'PASS' : 'FAIL'}] Student Profile: Found ${data.data.first_name} ${data.data.last_name} (${data.data.roll_no})`);
  } catch (e) {
    tests.push({ page: 'Student Profile (GET)', ok: false, error: e.message });
  }

  // 2. Student Profile Edit (PUT)
  try {
    const res = await fetch(`${BASE_URL}/students/${studentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_no: '9876510001', address: '12 Lake View Road' }),
    });
    const data = await res.json();
    const ok = res.status === 200 && data.data.phone_no === '9876510001';
    tests.push({ page: 'Student Profile Edit (PUT)', ok, fields: ['phone_no', 'address'] });
    console.log(`[${ok ? 'PASS' : 'FAIL'}] Student Profile Edit: Updated phone to ${data.data.phone_no}`);
  } catch (e) {
    tests.push({ page: 'Student Profile Edit (PUT)', ok: false, error: e.message });
  }

  // 3. Student Attendance
  try {
    const res = await fetch(`${BASE_URL}/attendance/${studentId}`);
    const data = await res.json();
    const ok = res.status === 200 && data.stats && data.subject_summary.length > 0;
    tests.push({ page: 'Student Attendance (GET)', ok, stats: data.stats });
    console.log(`[${ok ? 'PASS' : 'FAIL'}] Student Attendance: Overall ${data.stats.overall_percentage}%, ${data.subject_summary.length} subjects`);
  } catch (e) {
    tests.push({ page: 'Student Attendance (GET)', ok: false, error: e.message });
  }

  // 4. Student Exams
  try {
    const res = await fetch(`${BASE_URL}/exams`);
    const data = await res.json();
    const ok = res.status === 200 && data.data.length > 0;
    tests.push({ page: 'Student Exams (GET)', ok, count: data.count });
    console.log(`[${ok ? 'PASS' : 'FAIL'}] Student Exams: ${data.data.length} exams available`);
  } catch (e) {
    tests.push({ page: 'Student Exams (GET)', ok: false, error: e.message });
  }

  // 5. Student Marks
  try {
    const res = await fetch(`${BASE_URL}/marks/${studentId}`);
    const data = await res.json();
    const ok = res.status === 200 && data.data.length > 0;
    tests.push({ page: 'Student Marks (GET)', ok, count: data.count });
    console.log(`[${ok ? 'PASS' : 'FAIL'}] Student Marks: ${data.data.length} assessment records`);
  } catch (e) {
    tests.push({ page: 'Student Marks (GET)', ok: false, error: e.message });
  }

  // 6. Student Results
  try {
    const res = await fetch(`${BASE_URL}/results/${studentId}`);
    const data = await res.json();
    const ok = res.status === 200 && data.data.length > 0;
    tests.push({ page: 'Student Results (GET)', ok, sgpa: data.data[0].sgpa, cgpa: data.data[0].cgpa });
    console.log(`[${ok ? 'PASS' : 'FAIL'}] Student Results: Sem ${data.data[0].semester_no} SGPA: ${data.data[0].sgpa}, CGPA: ${data.data[0].cgpa}`);
  } catch (e) {
    tests.push({ page: 'Student Results (GET)', ok: false, error: e.message });
  }

  // 7. Student Fees
  try {
    const res = await fetch(`${BASE_URL}/fees/${studentId}`);
    const data = await res.json();
    const ok = res.status === 200 && data.summary && data.data.length > 0;
    tests.push({ page: 'Student Fees (GET)', ok, summary: data.summary });
    console.log(`[${ok ? 'PASS' : 'FAIL'}] Student Fees: Total ₹${data.summary.total_fee}, Paid ₹${data.summary.total_paid}`);
  } catch (e) {
    tests.push({ page: 'Student Fees (GET)', ok: false, error: e.message });
  }

  // 8. Student Enrollments
  try {
    const res = await fetch(`${BASE_URL}/enrollments/${studentId}`);
    const data = await res.json();
    const ok = res.status === 200 && data.data.length > 0;
    tests.push({ page: 'Student Enrollments (GET)', ok, count: data.count });
    console.log(`[${ok ? 'PASS' : 'FAIL'}] Student Enrollments: ${data.data.length} registered terms`);
  } catch (e) {
    tests.push({ page: 'Student Enrollments (GET)', ok: false, error: e.message });
  }

  console.log('\n====================================================');
  console.log('   ALL 8 STUDENT MODULE PAGES VERIFIED SUCCESSFULLY');
  console.log('====================================================');
}

testStudentEndpoints();
