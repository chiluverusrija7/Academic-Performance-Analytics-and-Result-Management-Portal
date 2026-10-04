const fs = require('fs');
const path = require('path');

const outputDir = 'd:/EduInsight/ml_data';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function randGaussian(mean = 0, stdev = 1) {
  let u = 1 - Math.random();
  let v = Math.random();
  let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + z * stdev;
}

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

const depts = [
  { code: 'CSE', course: 'B.Tech CSE', weight: 0.30 },
  { code: 'ECE', course: 'B.Tech ECE', weight: 0.25 },
  { code: 'AIML', course: 'B.Tech AIML', weight: 0.25 },
  { code: 'DS', course: 'B.Tech DS', weight: 0.20 },
];

function pickDept() {
  const r = Math.random();
  let cumulative = 0;
  for (let d of depts) {
    cumulative += d.weight;
    if (r <= cumulative) return d;
  }
  return depts[0];
}

const NUM_STUDENTS = 400;
const records = [];
let globalStudentCounter = 1;

for (let i = 0; i < NUM_STUDENTS; i++) {
  const studentId = `STU_${String(globalStudentCounter++).padStart(4, '0')}`;
  const deptObj = pickDept();
  const department = deptObj.code;
  const course = deptObj.course;

  // Student base latent academic ability (mean 70, stdev 13)
  const baseAbility = clamp(randGaussian(70, 13), 30, 96);
  
  // Student trajectory archetype:
  // 0: Stable (60%), 1: Improving (15%), 2: Declining (15%), 3: Fluctuating (10%)
  const archRoll = Math.random();
  let archetype = 'Stable';
  if (archRoll < 0.15) archetype = 'Improving';
  else if (archRoll < 0.30) archetype = 'Declining';
  else if (archRoll < 0.40) archetype = 'Fluctuating';

  // Number of semesters for this student (4 to 5)
  const numSemesters = Math.random() < 0.5 ? 4 : 5;
  const startYear = Math.random() < 0.5 ? 2024 : 2025;

  let prevSgpa = null;
  let prevMarksAvg = null;
  let prevBacklogs = null;
  let prevAttendance = null;
  let sgpaHistory = [];

  for (let semNo = 1; semNo <= numSemesters; semNo++) {
    const acadYear = `${startYear + Math.floor((semNo - 1) / 2)}-${String(startYear + Math.floor((semNo - 1) / 2) + 1).slice(-2)}`;
    
    // Trajectory adjustment for this semester
    let trajectoryEffect = 0;
    if (archetype === 'Improving') trajectoryEffect = (semNo - 1) * 3.5;
    else if (archetype === 'Declining') trajectoryEffect = -(semNo - 1) * 4.2;
    else if (archetype === 'Fluctuating') trajectoryEffect = (semNo % 2 === 0 ? 5.5 : -5.5);

    const currentAbility = clamp(baseAbility + trajectoryEffect + randGaussian(0, 3.5), 25, 99);

    // 1. Attendance % to date (correlated with ability + random noise)
    const attMean = clamp(currentAbility * 0.88 + 12, 40, 98);
    const attendancePctToDate = parseFloat(clamp(randGaussian(attMean, 7.5), 35, 100).toFixed(2));

    // 2. In-Semester Average % (Internal 40-mark exams scaled to 100)
    const internalMean = clamp(currentAbility * 0.75 + (attendancePctToDate * 0.20), 28, 96);
    const inSemAvgPct = parseFloat(clamp(randGaussian(internalMean, 6.5), 24, 99).toFixed(2));

    // 3. Subject-level internals (6 subjects)
    const subjectsCount = 6;
    let lowInternalSubjectsCount = 0;
    let subjectsBelowThreshold = 0;

    for (let sub = 0; sub < subjectsCount; sub++) {
      const subAbility = clamp(inSemAvgPct + randGaussian(0, 8.5), 20, 100);
      const internal40 = clamp((subAbility / 100) * 40 + randGaussian(0, 2), 10, 40);

      if (internal40 < 20) lowInternalSubjectsCount++; // < 50%
      if (internal40 < 16) subjectsBelowThreshold++;  // < 40% (Pass mark)
    }

    const internalAssessmentCount = 2; // Midterm 1 & Midterm 2 completed

    // Performance Trend (difference from previous SGPA or 0.0)
    let performanceTrend = 0.0;
    if (prevSgpa !== null && sgpaHistory.length > 0) {
      const lastSgpa = sgpaHistory[sgpaHistory.length - 1];
      const estCurrentGpa = parseFloat((currentAbility / 10.0).toFixed(2));
      performanceTrend = parseFloat((estCurrentGpa - lastSgpa).toFixed(2));
    }

    // --- FINAL OUTCOME GENERATION (UNOBSERVED AT MID-SEMESTER PREDICTION TIME) ---
    // Final External Finals (60 marks scaled to 100)
    const extMean = clamp(currentAbility * 0.68 + (attendancePctToDate * 0.26) + randGaussian(0, 5), 18, 98);
    let subjectFinalScores = [];
    let backlogs = 0;

    for (let sub = 0; sub < subjectsCount; sub++) {
      const subExtPct = clamp(extMean + randGaussian(0, 9.5), 15, 100);
      const subExt60 = (subExtPct / 100) * 60;
      const subInt40 = clamp((inSemAvgPct / 100) * 40 + randGaussian(0, 3), 10, 40);
      const total100 = clamp(Math.round(subInt40 + subExt60), 0, 100);
      
      subjectFinalScores.push(total100);
      if (total100 < 40) backlogs++;
    }

    const finalTotalPct = parseFloat((subjectFinalScores.reduce((a, b) => a + b, 0) / subjectsCount).toFixed(2));
    const finalExternalAvgPct = parseFloat(((finalTotalPct * 100 - inSemAvgPct * 40) / 60).toFixed(2));

    // Calculate final SGPA based on 10-point scale
    let gradePointSum = 0;
    subjectFinalScores.forEach(score => {
      let gp = 0;
      if (score >= 90) gp = 10;
      else if (score >= 80) gp = 9;
      else if (score >= 70) gp = 8;
      else if (score >= 60) gp = 7;
      else if (score >= 50) gp = 6;
      else if (score >= 40) gp = 5;
      else gp = 0;
      gradePointSum += gp;
    });

    const finalSgpa = parseFloat((gradePointSum / subjectsCount).toFixed(2));

    // Final Result Classification
    let finalClassification = 'First Class with Distinction';
    if (backlogs > 0) finalClassification = 'Fail / Backlog';
    else if (finalSgpa < 6.5 && finalSgpa >= 5.5) finalClassification = 'Second Class';
    else if (finalSgpa < 5.5) finalClassification = 'Pass Class';
    else if (finalSgpa < 7.5) finalClassification = 'First Class';

    // TARGET RISK DEFINITION (Binary):
    // 1 (At Risk) if backlogs > 0 OR finalSgpa < 6.0 OR finalTotalPct < 50.0
    const targetRisk = (backlogs > 0 || finalSgpa < 6.0 || finalTotalPct < 50.0) ? 1 : 0;

    records.push({
      student_id: studentId,
      academic_year: acadYear,
      department: department,
      course: course,
      current_semester: semNo,
      subjects_attempted: subjectsCount,

      // MID-SEMESTER EARLY PREDICTION FEATURES
      attendance_pct_to_date: attendancePctToDate,
      in_sem_avg_pct: inSemAvgPct,
      low_internal_subjects_count: lowInternalSubjectsCount,
      subjects_below_internal_threshold: subjectsBelowThreshold,
      internal_assessment_count: internalAssessmentCount,
      
      // Longitudinal History Features
      previous_sgpa: prevSgpa,
      previous_marks_average: prevMarksAvg,
      previous_backlogs: prevBacklogs,
      previous_attendance_pct: prevAttendance,
      performance_trend: performanceTrend,

      // FINAL OUTCOME / TARGET COLUMNS
      final_external_avg_pct: finalExternalAvgPct,
      final_total_pct: finalTotalPct,
      final_sgpa: finalSgpa,
      final_backlogs: backlogs,
      final_result_classification: finalClassification,
      target_risk: targetRisk
    });

    prevSgpa = finalSgpa;
    prevMarksAvg = finalTotalPct;
    prevBacklogs = backlogs;
    prevAttendance = attendancePctToDate;
    sgpaHistory.push(finalSgpa);
  }
}

console.log(`Generated ${records.length} synthetic observations across ${NUM_STUDENTS} students.`);

const csvHeaders = [
  'student_id', 'academic_year', 'department', 'course', 'current_semester', 'subjects_attempted',
  'attendance_pct_to_date', 'in_sem_avg_pct', 'low_internal_subjects_count', 'subjects_below_internal_threshold',
  'internal_assessment_count', 'previous_sgpa', 'previous_marks_average', 'previous_backlogs',
  'previous_attendance_pct', 'performance_trend', 'final_external_avg_pct', 'final_total_pct',
  'final_sgpa', 'final_backlogs', 'final_result_classification', 'target_risk'
];

const csvRows = [csvHeaders.join(',')];
for (let r of records) {
  const row = csvHeaders.map(h => {
    const val = r[h];
    return val === null ? '' : val;
  });
  csvRows.push(row.join(','));
}

const csvPath = path.join(outputDir, 'academic_history.csv');
fs.writeFileSync(csvPath, csvRows.join('\n'));
console.log(`CSV dataset saved to: ${csvPath}`);
