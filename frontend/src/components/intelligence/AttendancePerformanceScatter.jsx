import React from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { Activity, Info } from 'lucide-react';

export function AttendancePerformanceScatter({
  currentStudentAttendance = 68.0,
  currentStudentMarks = 52.0,
  studentId = 'STU0016',
}) {
  // Representative cohort distribution from ML training dataset
  const cohortData = [
    { attendance: 88, marks: 82, risk: 'LOW', id: 'STU0001' },
    { attendance: 92, marks: 88, risk: 'LOW', id: 'STU0003' },
    { attendance: 78, marks: 74, risk: 'LOW', id: 'STU0005' },
    { attendance: 85, marks: 79, risk: 'LOW', id: 'STU0008' },
    { attendance: 82, marks: 71, risk: 'LOW', id: 'STU0011' },
    { attendance: 76, marks: 68, risk: 'MEDIUM', id: 'STU0014' },
    { attendance: 72, marks: 62, risk: 'MEDIUM', id: 'STU0019' },
    { attendance: 65, marks: 58, risk: 'MEDIUM', id: 'STU0023' },
    { attendance: 70, marks: 60, risk: 'MEDIUM', id: 'STU0028' },
    { attendance: 64, marks: 44, risk: 'HIGH', id: 'STU0032' },
    { attendance: 58, marks: 48, risk: 'HIGH', id: 'STU0036' },
    { attendance: 62, marks: 40, risk: 'HIGH', id: 'STU0040' },
    { attendance: 55, marks: 38, risk: 'HIGH', id: 'STU0045' },
    { attendance: 68, marks: 46, risk: 'HIGH', id: 'STU0052' },
    { attendance: 80, marks: 85, risk: 'LOW', id: 'STU0060' },
    { attendance: 86, marks: 90, risk: 'LOW', id: 'STU0065' },
    { attendance: 74, marks: 66, risk: 'MEDIUM', id: 'STU0070' },
    { attendance: 60, marks: 42, risk: 'HIGH', id: 'STU0080' },
  ];

  // Active student point
  const activePoint = {
    attendance: currentStudentAttendance,
    marks: currentStudentMarks,
    risk: 'ACTIVE',
    id: studentId,
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isActive = data.id === studentId;
      return (
        <div className="bg-[#0B0F17] border border-purple-500/30 rounded-xl p-3 shadow-2xl text-xs font-mono">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-bold text-white">{data.id}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                isActive
                  ? 'bg-purple-500/30 text-purple-200 border border-purple-500/50'
                  : data.risk === 'HIGH'
                  ? 'bg-red-500/20 text-red-300'
                  : data.risk === 'MEDIUM'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              {isActive ? 'SELECTED STUDENT' : `${data.risk} RISK`}
            </span>
          </div>
          <p className="text-slate-300">Attendance: <strong className="text-sky-300">{data.attendance}%</strong></p>
          <p className="text-slate-300">Internal Marks: <strong className="text-purple-300">{data.marks}%</strong></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl border border-purple-500/20 bg-[#0B0F17]/90 p-5 backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-sky-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Attendance vs Internal Performance (Observed Relationship)
          </h3>
        </div>
        <span className="text-[10px] font-mono text-purple-300 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
          Cohort Scatter Map
        </span>
      </div>

      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: -10 }}>
            <XAxis
              type="number"
              dataKey="attendance"
              name="Attendance"
              unit="%"
              domain={[50, 100]}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="number"
              dataKey="marks"
              name="Internal Marks"
              unit="%"
              domain={[30, 100]}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <ZAxis range={[60, 200]} />
            <Tooltip content={<CustomTooltip />} />

            {/* Cohort points */}
            <Scatter name="Cohort Students" data={cohortData}>
              {cohortData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.risk === 'HIGH'
                      ? '#ef4444'
                      : entry.risk === 'MEDIUM'
                      ? '#f59e0b'
                      : '#10b981'
                  }
                  opacity={0.65}
                />
              ))}
            </Scatter>

            {/* Selected Student Pulsing Point */}
            <Scatter name="Selected Student" data={[activePoint]}>
              <Cell fill="#a855f7" stroke="#ffffff" strokeWidth={2} />
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <Info size={13} className="text-slate-500" />
          <span>Observed relationship in model training data. Does not establish strict causality.</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> High Risk</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Medium Risk</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Safe</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 ring-2 ring-white"></span> Selected</span>
        </div>
      </div>
    </div>
  );
}
