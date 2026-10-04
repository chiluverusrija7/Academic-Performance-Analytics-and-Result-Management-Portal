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
  ReferenceLine,
} from 'recharts';
import { Grid, Eye, AlertOctagon, Info } from 'lucide-react';

export function StudentPriorityMatrix({ queueData = [], onSelectStudent, onFilterQuadrant }) {
  // Format scatter points from real queueData
  const scatterPoints = queueData.map((s) => {
    const riskPct = s.risk_percentage != null
      ? s.risk_percentage
      : (s.risk_probability != null ? s.risk_probability * 100 : 50);

    const urgencyScore = s.urgency_score != null
      ? (s.urgency_score <= 1 ? s.urgency_score * 100 : s.urgency_score)
      : (s.priority === 'CRITICAL' ? 90 : s.priority === 'HIGH' ? 75 : s.priority === 'MEDIUM' ? 55 : 20);

    return {
      id: s.student_id,
      name: s.full_name || s.name || `Student ${s.student_id}`,
      dept: s.department || 'AIML',
      risk: Number(riskPct.toFixed(1)),
      urgency: Number(urgencyScore.toFixed(1)),
      priority: s.priority || s.urgency_level || 'HIGH',
      driver: s.top_driver || s.primary_reason || 'Academic Indicators',
      raw: s,
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0B0F17] border border-purple-500/30 rounded-xl p-3 shadow-2xl text-xs font-mono z-50">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-bold text-white">{data.id} • {data.name}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                data.priority === 'CRITICAL'
                  ? 'bg-red-500/20 text-red-300'
                  : data.priority === 'HIGH'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-blue-500/20 text-blue-300'
              }`}
            >
              {data.priority}
            </span>
          </div>
          <p className="text-slate-300">
            Predicted Risk: <strong className="text-red-400">{data.risk}%</strong>
          </p>
          <p className="text-slate-300">
            Urgency Score: <strong className="text-amber-400">{data.urgency}/100</strong>
          </p>
          <p className="text-slate-400 text-[10px] mt-1 max-w-[200px] truncate">
            Driver: {data.driver}
          </p>
          <span className="text-[10px] text-purple-400 block mt-1">Click to open 360° decision drawer</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-purple-500/20 bg-[#0B0F17]/90 p-5 md:p-6 backdrop-blur-xl space-y-4 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Grid size={18} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Faculty Prioritization 2D Decision Matrix
            </h3>
            <p className="text-[11px] text-slate-400">
              Composite urgency score (Y-axis) versus predicted risk probability (X-axis)
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 self-start sm:self-auto">
          {scatterPoints.length} Students Mapped
        </span>
      </div>

      {/* 4 Quadrants Explanatory Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
        <button
          onClick={() => onFilterQuadrant && onFilterQuadrant('Q1')}
          className="p-2 rounded-lg bg-red-950/20 border border-red-500/30 text-left hover:border-red-500 transition-all"
        >
          <span className="text-red-400 font-bold block">QUADRANT I (Top Right)</span>
          <span className="text-slate-400">High Risk &amp; High Urgency → Immediate Action</span>
        </button>

        <button
          onClick={() => onFilterQuadrant && onFilterQuadrant('Q2')}
          className="p-2 rounded-lg bg-amber-950/20 border border-amber-500/30 text-left hover:border-amber-500 transition-all"
        >
          <span className="text-amber-400 font-bold block">QUADRANT II (Top Left)</span>
          <span className="text-slate-400">Lower Risk &amp; High Urgency → Contextual Review</span>
        </button>

        <button
          onClick={() => onFilterQuadrant && onFilterQuadrant('Q3')}
          className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-left hover:border-emerald-500 transition-all"
        >
          <span className="text-emerald-400 font-bold block">QUADRANT III (Bottom Left)</span>
          <span className="text-slate-400">Low Risk &amp; Low Urgency → Routine Monitoring</span>
        </button>

        <button
          onClick={() => onFilterQuadrant && onFilterQuadrant('Q4')}
          className="p-2 rounded-lg bg-purple-950/20 border border-purple-500/30 text-left hover:border-purple-500 transition-all"
        >
          <span className="text-purple-400 font-bold block">QUADRANT IV (Bottom Right)</span>
          <span className="text-slate-400">Higher Risk &amp; Lower Urgency → Review</span>
        </button>
      </div>

      {/* Scatter Chart */}
      <div className="h-72 w-full relative pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -10 }}>
            <XAxis
              type="number"
              dataKey="risk"
              name="Risk Probability"
              unit="%"
              domain={[0, 100]}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              label={{ value: 'Predicted Risk Probability (%)', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              type="number"
              dataKey="urgency"
              name="Urgency Score"
              domain={[0, 100]}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              label={{ value: 'Urgency Score (0-100)', angle: -90, position: 'insideLeft', offset: 15, fill: '#64748b', fontSize: 11 }}
            />
            <ZAxis range={[100, 260]} />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#ffffff20' }} />

            {/* Quadrant Dividers at 50% */}
            <ReferenceLine x={50} stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
            <ReferenceLine y={50} stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />

            <Scatter
              name="Students"
              data={scatterPoints}
              onClick={(data) => onSelectStudent && onSelectStudent(data.id, data.raw)}
              className="cursor-pointer"
            >
              {scatterPoints.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.priority === 'CRITICAL'
                      ? '#ef4444'
                      : entry.priority === 'HIGH'
                      ? '#f59e0b'
                      : entry.priority === 'MEDIUM'
                      ? '#38bdf8'
                      : '#10b981'
                  }
                  stroke="#ffffff"
                  strokeWidth={1}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
