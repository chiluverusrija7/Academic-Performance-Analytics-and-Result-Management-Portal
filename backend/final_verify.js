const http = require('http');
function get(path) {
  return new Promise(resolve => {
    const req = http.get('http://localhost:5000' + path, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ s: res.statusCode, b: JSON.parse(d) }); }
        catch (e) { resolve({ s: res.statusCode, b: {} }); }
      });
    });
    req.on('error', e => resolve({ s: 0, b: { message: e.message } }));
  });
}

(async () => {
  const checks = [
    ['/api/students/1', 'Student 1 (restored)'],
    ['/api/attendance/1', 'Attendance for student 1'],
    ['/api/marks/1', 'Marks for student 1'],
    ['/api/results/1', 'Results for student 1'],
    ['/api/fees/1', 'Fees for student 1'],
    ['/api/enrollments/1', 'Enrollments for student 1'],
    ['/api/faculty/1', 'Faculty 1 profile'],
    ['/api/departments', 'All departments (4 expected)'],
    ['/api/courses', 'All courses (4 expected)'],
    ['/api/semesters', 'All semesters'],
    ['/api/subjects', 'All subjects (24 expected)'],
    ['/api/exams', 'All exams (12 expected)'],
    ['/api/students', 'All students (24 expected)'],
    ['/api/faculty', 'All faculty (12 expected)'],
  ];
  let pass = 0;
  let fail = 0;
  for (const [path, label] of checks) {
    const r = await get(path);
    const ok = r.s === 200 && (r.b.success === true || r.b.status === 'UP');
    let detail = '';
    if (path === '/api/students/1' && r.b.data) {
      detail = ' => ' + r.b.data.roll_no + ' ' + r.b.data.first_name + ' ' + r.b.data.last_name;
    } else if (r.b.count !== undefined) {
      detail = ' => ' + r.b.count + ' records';
    } else if (r.b.data && Array.isArray(r.b.data)) {
      detail = ' => ' + r.b.data.length + ' records';
    }
    console.log((ok ? 'PASS' : 'FAIL') + ' [' + r.s + '] ' + label + detail);
    if (ok) pass++;
    else fail++;
  }
  console.log('\n=== ' + pass + '/' + (pass + fail) + ' PASSED ===');
})();
