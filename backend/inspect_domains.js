const fs = require('fs');
const raw = JSON.parse(fs.readFileSync('schema_inspection_raw.json', 'utf8'));

// Check users
console.log('=== USERS TABLE DATA & ROLES ===');
console.log(raw.users.sampleRows);

// Check student & admission link
console.log('\n=== STUDENT & ADMISSION SAMPLES ===');
console.log('Student:', raw.student.sampleRows[0]);
console.log('Admission:', raw.admission.sampleRows[0]);

// Check enrollment & attendance
console.log('\n=== ENROLLMENT & ATTENDANCE SAMPLES ===');
console.log('Enrollment:', raw.enrollment.sampleRows[0]);
console.log('Attendance:', raw.attendance.sampleRows[0]);

// Check exam, marks, grade, result
console.log('\n=== EXAM, MARKS, GRADE, RESULT SAMPLES ===');
console.log('Exam:', raw.exam.sampleRows[0]);
console.log('Marks:', raw.marks.sampleRows[0]);
console.log('Grade:', raw.grade.sampleRows);
console.log('Result:', raw.result.sampleRows[0]);

// Check fee
console.log('\n=== FEE SAMPLE ===');
console.log('Fee:', raw.fee.sampleRows[0]);

// Check faculty & faculty_subject
console.log('\n=== FACULTY & FACULTY_SUBJECT SAMPLES ===');
console.log('Faculty:', raw.faculty.sampleRows[0]);
console.log('Faculty_Subject:', raw.faculty_subject.sampleRows[0]);
