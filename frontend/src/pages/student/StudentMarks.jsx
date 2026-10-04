import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { ErrorAlert, EmptyState } from '../../components/ui/States';
import { useToast } from '../../context/ToastContext';
import { FileSpreadsheet, RefreshCw, Search, Award, CheckCircle } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

export function StudentMarks() {
  const { user } = useAuth();
  const studentId = user?.student_id || 1;
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [marks, setMarks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const loadMarks = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await api.getMarks(studentId);
      if (res.success) {
        setMarks(res.data);
      }
      if (isRefresh) {
        toast.success('Assessment marks refreshed from PostgreSQL', 'Synced');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch student marks');
      toast.error(err.message || 'Error loading marks', 'Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMarks();
  }, [studentId]);

  if (loading) return <TableSkeleton rows={6} cols={6} />;
  if (error) return <ErrorAlert message={error} onRetry={() => loadMarks(false)} />;

  const filteredMarks = marks.filter((m) =>
    (m.subject_name && m.subject_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (m.subject_code && m.subject_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (m.exam_name && m.exam_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getCalculatedGrade = (total) => {
    const score = parseFloat(total || 0);
    if (score >= 90) return { letter: 'A+', pt: '10.0', variant: 'success' };
    if (score >= 80) return { letter: 'A', pt: '9.0', variant: 'success' };
    if (score >= 70) return { letter: 'B+', pt: '8.0', variant: 'primary' };
    if (score >= 60) return { letter: 'B', pt: '7.0', variant: 'primary' };
    if (score >= 50) return { letter: 'C', pt: '6.0', variant: 'warning' };
    return { letter: 'F', pt: '0.0', variant: 'danger' };
  };

  // Prepare chart dataset
  const chartData = marks.map((m) => ({
    code: m.subject_code,
    internal: parseFloat(m.internal_marks || 0),
    external: parseFloat(m.external_marks || 0),
    total: parseFloat(m.total_marks || 0),
    name: m.subject_name,
  }));

  const columns = [
    { header: 'Subject Code', accessor: 'subject_code', cellClassName: 'font-mono font-bold text-blue-400' },
    { header: 'Subject Title', accessor: 'subject_name' },
    { header: 'Exam Session', accessor: 'exam_name' },
    {
      header: 'Internal (40)',
      accessor: 'internal_marks',
      align: 'right',
      render: (val) => <span className="font-semibold text-slate-200 font-mono">{val || '0.00'}</span>,
    },
    {
      header: 'External (60)',
      accessor: 'external_marks',
      align: 'right',
      render: (val) => <span className="font-semibold text-slate-200 font-mono">{val || '0.00'}</span>,
    },
    {
      header: 'Total Marks (100)',
      accessor: 'total_marks',
      align: 'right',
      render: (val) => (
        <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded font-mono">
          {val || '0.00'}
        </span>
      ),
    },
    {
      header: 'Grade',
      accessor: 'total_marks',
      align: 'center',
      render: (val) => {
        const grade = getCalculatedGrade(val);
        return <Badge variant={grade.variant}>{grade.letter} ({grade.pt})</Badge>;
      },
    },
    {
      header: 'Status',
      accessor: 'result_status',
      align: 'center',
      render: (val) => <Badge variant={val === 'Published' ? 'success' : 'warning'}>{val}</Badge>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Chart View */}
      {chartData.length > 0 && (
        <Card title="Marks Breakdown by Subject" subtitle="Internal evaluation (40) vs End-semester external (60)" icon={FileSpreadsheet}>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="code"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f1824',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(val, name) => [val, name === 'internal' ? 'Internal (40)' : 'External (60)']}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  formatter={(val) => <span className="text-slate-300">{val === 'internal' ? 'Internal Marks' : 'External Marks'}</span>}
                />
                <Bar dataKey="internal" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="external" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <Card
        title="Assessment Marks &amp; Evaluations"
        icon={FileSpreadsheet}
        subtitle="Verified scores from continuous internal evaluation &amp; end-semester examinations"
        action={
          <div className="flex items-center gap-3">
            <div className="relative w-48 sm:w-64">
              <Search size={14} className="text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search subject or exam..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-navy-950 border border-white/10 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              loading={refreshing}
              onClick={() => loadMarks(true)}
            >
              Refresh
            </Button>
          </div>
        }
      >
        {filteredMarks.length === 0 ? (
          <EmptyState
            title="No Marks Found"
            description="No assessment marks match your query."
            icon={FileSpreadsheet}
          />
        ) : (
          <Table columns={columns} data={filteredMarks} keyField="mark_id" />
        )}
      </Card>

      {/* University Grading Scheme Reference Card */}
      <Card title="Institutional Grading Scale &amp; Reference" icon={Award}>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs text-center">
          <div className="p-3 rounded-xl bg-navy-950 border border-emerald-500/20">
            <div className="text-lg font-bold text-emerald-400">A+</div>
            <div className="text-slate-300 font-semibold mt-0.5">10.0 Points</div>
            <div className="text-[10px] text-slate-500 mt-0.5">90% - 100%</div>
          </div>
          <div className="p-3 rounded-xl bg-navy-950 border border-emerald-500/15">
            <div className="text-lg font-bold text-emerald-400">A</div>
            <div className="text-slate-300 font-semibold mt-0.5">9.0 Points</div>
            <div className="text-[10px] text-slate-500 mt-0.5">80% - 89%</div>
          </div>
          <div className="p-3 rounded-xl bg-navy-950 border border-blue-500/20">
            <div className="text-lg font-bold text-blue-400">B+</div>
            <div className="text-slate-300 font-semibold mt-0.5">8.0 Points</div>
            <div className="text-[10px] text-slate-500 mt-0.5">70% - 79%</div>
          </div>
          <div className="p-3 rounded-xl bg-navy-950 border border-blue-500/15">
            <div className="text-lg font-bold text-blue-400">B</div>
            <div className="text-slate-300 font-semibold mt-0.5">7.0 Points</div>
            <div className="text-[10px] text-slate-500 mt-0.5">60% - 69%</div>
          </div>
          <div className="p-3 rounded-xl bg-navy-950 border border-amber-500/20">
            <div className="text-lg font-bold text-amber-400">C</div>
            <div className="text-slate-300 font-semibold mt-0.5">6.0 Points</div>
            <div className="text-[10px] text-slate-500 mt-0.5">50% - 59%</div>
          </div>
          <div className="p-3 rounded-xl bg-navy-950 border border-red-500/20">
            <div className="text-lg font-bold text-red-400">F</div>
            <div className="text-slate-300 font-semibold mt-0.5">0.0 Points</div>
            <div className="text-[10px] text-slate-500 mt-0.5">&lt; 50% (Fail)</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
