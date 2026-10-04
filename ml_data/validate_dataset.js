const fs = require('fs');
const path = require('path');

const csvPath = 'd:/EduInsight/ml_data/academic_history.csv';
const fileContent = fs.readFileSync(csvPath, 'utf8');
const lines = fileContent.trim().split('\n');

const headers = lines[0].split(',');
const rows = lines.slice(1).map(line => {
  const values = line.split(',');
  const rowObj = {};
  headers.forEach((h, i) => {
    const val = values[i];
    if (val === '') {
      rowObj[h] = null;
    } else if (!isNaN(val) && h !== 'student_id') {
      rowObj[h] = parseFloat(val);
    } else {
      rowObj[h] = val;
    }
  });
  return rowObj;
});

console.log('====================================================');
console.log('       SYNTHETIC ML DATASET VALIDATION REPORT       ');
console.log('====================================================\n');

console.log(`Total Observations (Rows): ${rows.length}`);

// Unique Students
const studentIds = new Set(rows.map(r => r.student_id));
console.log(`Unique Student IDs        : ${studentIds.size}`);

// Semesters Breakdown
const semDist = {};
rows.forEach(r => {
  semDist[r.current_semester] = (semDist[r.current_semester] || 0) + 1;
});
console.log('\nCurrent Semester Distribution:', semDist);

// Academic Years Breakdown
const yearDist = {};
rows.forEach(r => {
  yearDist[r.academic_year] = (yearDist[r.academic_year] || 0) + 1;
});
console.log('Academic Year Distribution:', yearDist);

// Department Distribution
const deptDist = {};
rows.forEach(r => {
  deptDist[r.department] = (deptDist[r.department] || 0) + 1;
});
console.log('Department Distribution:', deptDist);

// Target Class Distribution
const targetDist = { 0: 0, 1: 0 };
rows.forEach(r => {
  targetDist[r.target_risk]++;
});
const total = rows.length;
const riskPct = ((targetDist[1] / total) * 100).toFixed(2);
const normalPct = ((targetDist[0] / total) * 100).toFixed(2);

console.log('\nTarget Risk Distribution (0 = Normal, 1 = Academic Risk):');
console.log(`  0 (Normal / Success) : ${targetDist[0]} (${normalPct}%)`);
console.log(`  1 (Academic Risk)   : ${targetDist[1]} (${riskPct}%)`);

// Missing Values Audit
console.log('\nMissing Values Audit (NULL Counts):');
headers.forEach(h => {
  const nullCount = rows.filter(r => r[h] === null).length;
  if (nullCount > 0) {
    console.log(`  ${h.padEnd(35)}: ${nullCount} NULLs (${((nullCount / total) * 100).toFixed(1)}% - expected for Semester 1)`);
  }
});

// Out-of-bounds sanity check
console.log('\nOut-of-Bounds & Sanity Checks:');
const invalidAtt = rows.filter(r => r.attendance_pct_to_date < 0 || r.attendance_pct_to_date > 100).length;
const invalidInSem = rows.filter(r => r.in_sem_avg_pct < 0 || r.in_sem_avg_pct > 100).length;
const invalidSgpa = rows.filter(r => r.final_sgpa < 0 || r.final_sgpa > 10).length;

console.log(`  Attendance out-of-bounds (<0 or >100): ${invalidAtt}`);
console.log(`  In-Sem Avg out-of-bounds (<0 or >100)  : ${invalidInSem}`);
console.log(`  Final SGPA out-of-bounds (<0 or >10)  : ${invalidSgpa}`);

// Feature-Target Correlation Calculation
function computeCorrelation(featureName) {
  const validRows = rows.filter(r => r[featureName] !== null);
  const n = validRows.length;
  const sumX = validRows.reduce((acc, r) => acc + r[featureName], 0);
  const sumY = validRows.reduce((acc, r) => acc + r.target_risk, 0);
  const sumXY = validRows.reduce((acc, r) => acc + r[featureName] * r.target_risk, 0);
  const sumX2 = validRows.reduce((acc, r) => acc + Math.pow(r[featureName], 2), 0);
  const sumY2 = validRows.reduce((acc, r) => acc + Math.pow(r.target_risk, 2), 0);

  const num = (n * sumXY) - (sumX * sumY);
  const den = Math.sqrt(((n * sumX2) - Math.pow(sumX, 2)) * ((n * sumY2) - Math.pow(sumY, 2)));
  return den === 0 ? 0 : (num / den).toFixed(3);
}

console.log('\nCorrelation with Target (target_risk):');
[
  'attendance_pct_to_date',
  'in_sem_avg_pct',
  'low_internal_subjects_count',
  'subjects_below_internal_threshold',
  'previous_sgpa',
  'previous_marks_average',
  'previous_backlogs',
  'previous_attendance_pct',
  'performance_trend'
].forEach(f => {
  console.log(`  ${f.padEnd(35)} : ${computeCorrelation(f)}`);
});
