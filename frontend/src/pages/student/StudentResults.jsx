import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Card, MetricCard } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { ErrorAlert, EmptyState } from '../../components/ui/States';
import { useToast } from '../../context/ToastContext';
import { Award, BookOpen, CheckCircle, GraduationCap, RefreshCw, Eye, FileText, Printer } from 'lucide-react';

export function StudentResults() {
  const { user } = useAuth();
  const studentId = user?.student_id || 1;
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [student, setStudent] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [isMemoOpen, setIsMemoOpen] = useState(false);

  const loadResults = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [resRes, stuRes] = await Promise.all([
        api.getResults(studentId),
        api.getStudent(studentId),
      ]);

      if (resRes.success) setResults(resRes.data);
      if (stuRes.success) setStudent(stuRes.data);
      if (isRefresh) {
        toast.success('Semester results refreshed', 'Synced');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch semester results');
      toast.error(err.message || 'Error loading results', 'Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, [studentId]);

  const openMemo = (r) => {
    setSelectedResult(r);
    setIsMemoOpen(true);
  };

  if (loading) return <TableSkeleton rows={4} cols={7} />;
  if (error) return <ErrorAlert message={error} onRetry={() => loadResults(false)} />;

  const latestResult = results[0] || {};

  const columns = [
    { header: 'Semester', accessor: 'semester_no', align: 'center', render: (val) => <span className="font-bold text-white">Sem {val}</span> },
    { header: 'Academic Year', accessor: 'academic_year' },
    { header: 'Earned / Total Credits', accessor: 'earned_credits', align: 'center', render: (val, row) => `${val} / ${row.total_credits}` },
    { header: 'Total Marks', accessor: 'total_marks', align: 'right', cellClassName: 'font-mono text-slate-200' },
    { header: 'Percentage', accessor: 'percentage', align: 'right', render: (val) => <span className="font-semibold">{val}%</span> },
    { header: 'SGPA', accessor: 'sgpa', align: 'right', render: (val) => <span className="font-bold text-blue-400 font-mono">{val}</span> },
    { header: 'CGPA', accessor: 'cgpa', align: 'right', render: (val) => <span className="font-bold text-emerald-400 font-mono">{val}</span> },
    {
      header: 'Backlogs',
      accessor: 'backlogs',
      align: 'center',
      render: (val) => (val === 0 ? <Badge variant="success">0 Clear</Badge> : <Badge variant="danger">{val} Backlog(s)</Badge>),
    },
    { header: 'Classification', accessor: 'result_classification', align: 'center', render: (val) => <Badge variant="primary">{val || 'Distinction'}</Badge> },
    { header: 'Status', accessor: 'result_status', align: 'center', render: (val) => <Badge variant={val === 'Published' ? 'success' : 'warning'} dot>{val}</Badge> },
    {
      header: 'Actions',
      accessor: 'result_id',
      align: 'center',
      render: (val, row) => (
        <Button
          variant="secondary"
          size="xs"
          icon={Eye}
          onClick={() => openMemo(row)}
        >
          Memo
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Current CGPA"
          value={latestResult.cgpa || '8.83'}
          subtitle="Cumulative grade point average"
          icon={Award}
          color="emerald"
        />
        <MetricCard
          title="Semester SGPA"
          value={latestResult.sgpa || '8.83'}
          subtitle="Semester grade point average"
          icon={GraduationCap}
          color="blue"
        />
        <MetricCard
          title="Total Credits Earned"
          value={`${latestResult.earned_credits || 24}`}
          subtitle={`Program total: ${latestResult.total_credits || 24}`}
          icon={BookOpen}
          color="sky"
        />
        <MetricCard
          title="Academic Backlogs"
          value={`${latestResult.backlogs || 0}`}
          subtitle="All subjects cleared"
          icon={CheckCircle}
          color="emerald"
        />
      </div>

      {/* Official Results Table */}
      <Card
        title="Official Semester Grade Cards &amp; Performance History"
        icon={Award}
        subtitle="Final verified semester results published by University Examination Cell"
        action={
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            loading={refreshing}
            onClick={() => loadResults(true)}
          >
            Refresh
          </Button>
        }
      >
        {results.length === 0 ? (
          <EmptyState
            title="No Results Published"
            description="Semester evaluation results are currently being compiled."
            icon={Award}
          />
        ) : (
          <Table columns={columns} data={results} keyField="result_id" />
        )}
      </Card>

      {/* Official Grade Memo Modal */}
      <Modal
        isOpen={isMemoOpen}
        onClose={() => setIsMemoOpen(false)}
        title="Official Grade Memo &amp; Transcript"
        maxWidth="max-w-xl"
        icon={Award}
      >
        {selectedResult && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-navy-950 border border-white/5 text-center relative overflow-hidden">
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                <GraduationCap size={20} />
              </div>
              <h3 className="text-sm font-bold text-white tracking-tight">EduInsight Institute of Technology</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Official Semester Grade Sheet • Academic Transcript</p>
            </div>

            <div className="bg-navy-950/80 p-3 rounded-lg border border-white/5 grid grid-cols-2 gap-2 font-mono">
              <div>
                <span className="text-slate-400">Student:</span> <strong className="text-white">{student?.first_name} {student?.last_name}</strong>
              </div>
              <div>
                <span className="text-slate-400">Roll No:</span> <strong className="text-blue-400">{student?.roll_no}</strong>
              </div>
              <div>
                <span className="text-slate-400">Program:</span> <strong className="text-slate-200">{student?.course_code}</strong>
              </div>
              <div>
                <span className="text-slate-400">Semester:</span> <strong className="text-slate-200">Semester {selectedResult.semester_no}</strong>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
              <div>
                <dt className="text-slate-400 font-medium">Earned Credits / Total</dt>
                <dd className="text-slate-200 font-bold mt-0.5">{selectedResult.earned_credits} / {selectedResult.total_credits}</dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Total Marks Obtained</dt>
                <dd className="text-emerald-400 font-mono font-bold mt-0.5">{selectedResult.total_marks}</dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Percentage Aggregate</dt>
                <dd className="text-slate-200 font-semibold mt-0.5">{selectedResult.percentage}%</dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Classification</dt>
                <dd className="mt-0.5"><Badge variant="primary">{selectedResult.result_classification || 'Distinction'}</Badge></dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Semester SGPA</dt>
                <dd className="text-blue-400 font-mono font-bold text-sm mt-0.5">{selectedResult.sgpa} / 10.0</dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Cumulative CGPA</dt>
                <dd className="text-emerald-400 font-mono font-bold text-sm mt-0.5">{selectedResult.cgpa} / 10.0</dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Publication Date</dt>
                <dd className="text-slate-200 font-semibold mt-0.5">
                  {selectedResult.published_date ? new Date(selectedResult.published_date).toLocaleDateString() : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Authorized Controller</dt>
                <dd className="text-slate-200 font-semibold mt-0.5">{selectedResult.published_by_name || 'Controller of Examinations'}</dd>
              </div>
            </dl>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-white/5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsMemoOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
