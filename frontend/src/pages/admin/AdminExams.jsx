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
import { Calendar, Plus, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';

export function AdminExams() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [exams, setExams] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [filterSem, setFilterSem] = useState('');
  const toast = useToast();

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);

  const [examForm, setExamForm] = useState({
    semester_id: '1',
    exam_name: '',
    exam_type: 'Midterm',
    academic_year: '2026-27',
    exam_start_date: '',
    exam_end_date: '',
    status: 'Scheduled',
  });

  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const params = {};
      if (filterType) params.exam_type = filterType;
      if (filterSem) params.semester_id = filterSem;

      const [examRes, semRes] = await Promise.all([
        api.getExams(params),
        api.getSemesters(),
      ]);

      if (examRes.success) setExams(examRes.data);
      if (semRes.success) setSemesters(semRes.data);

      if (isRefresh) {
        toast.success('Exam timetables updated from PostgreSQL', 'Synced');
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
    loadData();
  }, [filterType, filterSem]);

  const openAddModal = () => {
    setExamForm({
      semester_id: semesters[0]?.semester_id || '1',
      exam_name: '',
      exam_type: 'Midterm',
      academic_year: '2026-27',
      exam_start_date: new Date().toISOString().split('T')[0],
      exam_end_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: 'Scheduled',
    });
    setModalError('');
    setIsAddOpen(true);
  };

  const openDeleteModal = (ex) => {
    setSelectedExam(ex);
    setModalError('');
    setIsDeleteOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setModalError('');
    try {
      const payload = {
        ...examForm,
        semester_id: parseInt(examForm.semester_id, 10),
      };
      const res = await api.createExam(payload);
      if (res.success) {
        setIsAddOpen(false);
        toast.success(`Exam "${examForm.exam_name}" scheduled in PostgreSQL!`, 'Exam Created');
        await loadData();
      }
    } catch (err) {
      setModalError(err.message || 'Failed to schedule exam');
      toast.error(err.message || 'Failed to create exam', 'Create Error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    setModalError('');
    try {
      const res = await api.deleteExam(selectedExam.exam_id);
      if (res.success) {
        setIsDeleteOpen(false);
        toast.success(`Exam schedule removed from PostgreSQL!`, 'Exam Deleted');
        await loadData();
      }
    } catch (err) {
      setModalError(err.message || 'Failed to delete exam');
      toast.error(err.message || 'Failed to delete exam', 'Delete Error');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { header: 'Exam Title', accessor: 'exam_name', cellClassName: 'font-semibold text-white' },
    {
      header: 'Category',
      accessor: 'exam_type',
      align: 'center',
      render: (val) => <Badge variant={val === 'End Semester' ? 'purple' : 'primary'}>{val}</Badge>,
    },
    { header: 'Semester', accessor: 'semester_no', align: 'center', render: (val) => `Sem ${val}` },
    { header: 'Degree Program', accessor: 'course_code', align: 'center', render: (val) => <Badge variant="sky">{val}</Badge> },
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
    { header: 'Marks Logged', accessor: 'marks_entered_count', align: 'center', cellClassName: 'font-bold text-blue-400' },
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
        <Button variant="ghost" size="xs" icon={Trash2} className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => openDeleteModal(row)} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card
        title="Examinations &amp; Assessment Schedules"
        icon={Calendar}
        subtitle="Manage university examination sessions, internal assessments, and schedules in PostgreSQL"
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-40">
              <CustomSelect
                value={filterType}
                onChange={(val) => setFilterType(val)}
                options={[
                  { value: '', label: 'All Categories' },
                  { value: 'Internal', label: 'Internal Assessment' },
                  { value: 'End Semester', label: 'End Semester' },
                  { value: 'Midterm', label: 'Midterm' },
                ]}
                placeholder="Category"
              />
            </div>

            <div className="w-44">
              <CustomSelect
                value={filterSem}
                onChange={(val) => setFilterSem(val)}
                options={[
                  { value: '', label: 'All Semesters' },
                  ...semesters.map((s) => ({
                    value: s.semester_id,
                    label: `${s.course_code} - Sem ${s.semester_no}`,
                  })),
                ]}
                placeholder="Semester"
              />
            </div>

            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              loading={refreshing}
              onClick={() => loadData(true)}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={openAddModal}
            >
              Schedule Exam
            </Button>
          </div>
        }
      >
        {loading ? (
          <TableSkeleton rows={6} cols={9} />
        ) : error ? (
          <ErrorAlert message={error} onRetry={() => loadData(false)} />
        ) : exams.length === 0 ? (
          <EmptyState title="No Exams Found" description="No examination schedules match your filters." icon={Calendar} />
        ) : (
          <Table columns={columns} data={exams} keyField="exam_id" />
        )}
      </Card>

      {/* Schedule Exam Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Schedule Examination Session" subtitle="Create new exam timetable record in PostgreSQL" icon={Calendar}>
        {modalError && <div className="mb-4"><ErrorAlert message={modalError} /></div>}
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1">Academic Term / Semester *</label>
            <CustomSelect
              value={examForm.semester_id}
              onChange={(val) => setExamForm({ ...examForm, semester_id: val })}
              options={semesters.map((s) => ({
                value: s.semester_id,
                label: `${s.course_name} (Sem ${s.semester_no} - ${s.academic_year})`,
              }))}
            />
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Examination Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Midterm Assessment I"
              value={examForm.exam_name}
              onChange={(e) => setExamForm({ ...examForm, exam_name: e.target.value })}
              className="w-full bg-navy-950 border border-white/10 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Assessment Category *</label>
              <CustomSelect
                value={examForm.exam_type}
                onChange={(val) => setExamForm({ ...examForm, exam_type: val })}
                options={[
                  { value: 'Internal', label: 'Internal Assessment' },
                  { value: 'Midterm', label: 'Midterm Examination' },
                  { value: 'End Semester', label: 'End Semester Final' },
                  { value: 'Lab Practical', label: 'Lab Practical' },
                ]}
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Academic Year</label>
              <input
                type="text"
                value={examForm.academic_year}
                onChange={(e) => setExamForm({ ...examForm, academic_year: e.target.value })}
                className="w-full bg-navy-950 border border-white/10 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Start Date</label>
              <input
                type="date"
                value={examForm.exam_start_date}
                onChange={(e) => setExamForm({ ...examForm, exam_start_date: e.target.value })}
                className="w-full bg-navy-950 border border-white/10 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">End Date</label>
              <input
                type="date"
                value={examForm.exam_end_date}
                onChange={(e) => setExamForm({ ...examForm, exam_end_date: e.target.value })}
                className="w-full bg-navy-950 border border-white/10 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-white/5">
            <Button variant="secondary" size="sm" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm" loading={saving}>Schedule in PostgreSQL</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Confirm Exam Deletion" icon={Trash2} iconColor="text-red-400" iconBg="bg-red-500/10 border-red-500/20">
        {modalError && <div className="mb-4"><ErrorAlert message={modalError} /></div>}
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 flex items-start gap-3">
            <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-100">Permanent Database Deletion</p>
              <p className="mt-1 leading-relaxed">
                Are you sure you want to delete exam schedule <strong>{selectedExam?.exam_name} ({selectedExam?.academic_year})</strong>?
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2.5 pt-4 border-t border-white/5">
            <Button variant="secondary" size="sm" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="danger" size="sm" loading={saving} onClick={handleDelete}>Confirm Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
