import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { ErrorAlert, EmptyState } from '../../components/ui/States';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { useToast } from '../../context/ToastContext';
import { Calendar, RefreshCw, Eye, Search, Filter, Clock, BookOpen, GraduationCap } from 'lucide-react';

export function StudentExams() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [exams, setExams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedExam, setSelectedExam] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const toast = useToast();

  const loadExams = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await api.getExams();
      if (res.success) {
        setExams(res.data);
      }
      if (isRefresh) {
        toast.success('Exam timetables refreshed', 'Synced');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch exam schedules');
      toast.error(err.message || 'Error loading exams', 'Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  const openDetails = (exam) => {
    setSelectedExam(exam);
    setIsDetailsOpen(true);
  };

  if (loading) return <TableSkeleton rows={6} cols={6} />;
  if (error) return <ErrorAlert message={error} onRetry={() => loadExams(false)} />;

  const filteredExams = exams.filter((e) => {
    const matchesSearch =
      e.exam_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.course_name && e.course_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'ALL' || e.exam_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const columns = [
    { header: 'Exam Title', accessor: 'exam_name', cellClassName: 'font-semibold text-white' },
    {
      header: 'Category',
      accessor: 'exam_type',
      align: 'center',
      render: (val) => <Badge variant={val === 'End Semester' ? 'purple' : 'primary'}>{val}</Badge>,
    },
    { header: 'Semester', accessor: 'semester_no', align: 'center', render: (val) => `Sem ${val}` },
    { header: 'Academic Year', accessor: 'academic_year' },
    {
      header: 'Start Date',
      accessor: 'exam_start_date',
      render: (val) => (val ? new Date(val).toLocaleDateString() : 'TBA'),
    },
    {
      header: 'End Date',
      accessor: 'exam_end_date',
      render: (val) => (val ? new Date(val).toLocaleDateString() : 'TBA'),
    },
    {
      header: 'Status',
      accessor: 'status',
      align: 'center',
      render: (val) => <Badge variant={val === 'Completed' ? 'success' : 'warning'} dot>{val}</Badge>,
    },
    {
      header: 'Actions',
      accessor: 'exam_id',
      align: 'center',
      render: (val, row) => (
        <Button
          variant="secondary"
          size="xs"
          icon={Eye}
          onClick={() => openDetails(row)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card
        title="Examination Timetable &amp; Assessments"
        icon={Calendar}
        subtitle="Official examination dates and schedules managed by the University Examination Cell"
        action={
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-48 sm:w-64">
              <Search size={14} className="text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search exams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-navy-950 border border-white/10 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="w-48">
              <CustomSelect
                value={typeFilter}
                onChange={(val) => setTypeFilter(val)}
                options={[
                  { value: 'ALL', label: 'All Categories' },
                  { value: 'Internal', label: 'Internal Assessment' },
                  { value: 'End Semester', label: 'End Semester University Exam' },
                ]}
                placeholder="Category"
              />
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              loading={refreshing}
              onClick={() => loadExams(true)}
            >
              Refresh
            </Button>
          </div>
        }
      >
        {filteredExams.length === 0 ? (
          <EmptyState
            title="No Examinations Found"
            description="No examination schedules match your search filters."
            icon={Calendar}
          />
        ) : (
          <Table columns={columns} data={filteredExams} keyField="exam_id" />
        )}
      </Card>

      {/* Details Modal */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title="Examination Information"
        subtitle={selectedExam?.exam_name}
        icon={Calendar}
      >
        {selectedExam && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-navy-950 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{selectedExam.exam_name}</span>
                <Badge variant={selectedExam.status === 'Completed' ? 'success' : 'warning'}>
                  {selectedExam.status}
                </Badge>
              </div>
              <p className="text-blue-400 font-medium">{selectedExam.course_name} ({selectedExam.course_code})</p>
            </div>

            <dl className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
              <div>
                <dt className="text-slate-400">Category</dt>
                <dd className="text-slate-200 font-semibold mt-0.5">{selectedExam.exam_type}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Academic Year</dt>
                <dd className="text-slate-200 font-semibold mt-0.5">{selectedExam.academic_year}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Semester</dt>
                <dd className="text-slate-200 font-semibold mt-0.5">Semester {selectedExam.semester_no}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Marks Entered</dt>
                <dd className="text-slate-200 font-semibold mt-0.5">{selectedExam.marks_entered_count || 0} Records</dd>
              </div>
              <div>
                <dt className="text-slate-400">Start Date</dt>
                <dd className="text-slate-200 font-semibold mt-0.5">
                  {selectedExam.exam_start_date ? new Date(selectedExam.exam_start_date).toLocaleDateString() : 'TBA'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">End Date</dt>
                <dd className="text-slate-200 font-semibold mt-0.5">
                  {selectedExam.exam_end_date ? new Date(selectedExam.exam_end_date).toLocaleDateString() : 'TBA'}
                </dd>
              </div>
            </dl>

            <div className="flex justify-end pt-3 border-t border-white/5">
              <Button variant="secondary" size="sm" onClick={() => setIsDetailsOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
