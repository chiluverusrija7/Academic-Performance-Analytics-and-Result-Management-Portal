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
import { StudentCombobox } from '../../components/ui/StudentCombobox';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { useToast } from '../../context/ToastContext';
import { CheckSquare, Plus, RefreshCw, CheckCircle, UserCheck, Calendar } from 'lucide-react';

export function FacultyAttendance() {
  const { user } = useAuth();
  const facultyId = user?.faculty_id || 1;
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState('1');
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [stats, setStats] = useState(null);

  // Record Attendance Modal State
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [recordForm, setRecordForm] = useState({
    enrollment_id: '1',
    subject_id: '1',
    class_date: new Date().toISOString().split('T')[0],
    period_no: '1',
    is_present: true,
    remarks: '',
  });
  const [recording, setRecording] = useState(false);
  const [recordError, setRecordError] = useState('');

  useEffect(() => {
    Promise.all([
      api.getStudents(),
      api.getFaculty(facultyId),
    ]).then(([stuRes, facRes]) => {
      if (stuRes.success && stuRes.data.length > 0) {
        setStudents(stuRes.data);
      }
      if (facRes.success) {
        setFaculty(facRes.data);
      }
    });
  }, [facultyId]);

  const loadAttendance = async (sId, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await api.getAttendance(sId);
      if (res.success) {
        setAttendanceLogs(res.records);
        setStats(res.stats);
      }
      if (isRefresh) {
        toast.success('Attendance records refreshed from PostgreSQL', 'Synced');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch attendance records');
      toast.error(err.message || 'Error loading attendance', 'Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (selectedStudentId) {
      loadAttendance(selectedStudentId);
    }
  }, [selectedStudentId]);

  const handleRecordAttendance = async (e) => {
    e.preventDefault();
    setRecording(true);
    setRecordError('');

    try {
      const payload = {
        enrollment_id: parseInt(selectedStudentId, 10),
        subject_id: parseInt(recordForm.subject_id, 10),
        faculty_id: facultyId,
        class_date: recordForm.class_date,
        period_no: parseInt(recordForm.period_no, 10),
        is_present: recordForm.is_present === true || recordForm.is_present === 'true',
        remarks: recordForm.remarks || null,
      };

      const res = await api.recordAttendance(payload);
      if (res.success) {
        setIsRecordOpen(false);
        toast.success('Attendance session marked successfully in PostgreSQL!', 'Recorded');
        await loadAttendance(selectedStudentId);
      }
    } catch (err) {
      setRecordError(err.message || 'Failed to record attendance');
      toast.error(err.message || 'Error saving attendance', 'Record Failed');
    } finally {
      setRecording(false);
    }
  };

  const selectedStudent = students.find((s) => String(s.student_id) === String(selectedStudentId));
  const assignedSubjects = faculty?.assigned_subjects || [];

  const subjectOptions = assignedSubjects.length > 0
    ? assignedSubjects.map((sub) => ({
        value: String(sub.subject_id),
        label: `${sub.subject_code} - ${sub.subject_name} (Sem ${sub.semester_no})`,
      }))
    : [{ value: '1', label: 'CS301 - Database Systems' }];

  const periodOptions = [1, 2, 3, 4, 5, 6, 7, 8].map((p) => ({
    value: String(p),
    label: `Period ${p}`,
  }));

  const columns = [
    {
      header: 'Class Date',
      accessor: 'class_date',
      render: (val) => (val ? new Date(val).toLocaleDateString() : 'N/A'),
    },
    { header: 'Period', accessor: 'period_no', align: 'center', render: (val) => `Period ${val}` },
    { header: 'Subject Code', accessor: 'subject_code', cellClassName: 'font-mono font-bold text-blue-400' },
    { header: 'Subject Title', accessor: 'subject_name' },
    {
      header: 'Attendance Status',
      accessor: 'is_present',
      align: 'center',
      render: (val) => (
        <Badge variant={val ? 'success' : 'danger'} dot>
          {val ? 'Present' : 'Absent'}
        </Badge>
      ),
    },
    { header: 'Instructor', accessor: 'faculty_first_name', render: (val, row) => (val ? `Prof. ${val} ${row.faculty_last_name || ''}` : 'Faculty') },
    { header: 'Remarks', accessor: 'remarks', cellClassName: 'text-slate-400 italic text-xs', render: (val) => val || '—' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Searchable Student Selector Bar */}
      <div className="bg-[#0b121e] border border-slate-800 rounded-2xl p-5 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="w-full md:w-96">
          <StudentCombobox
            students={students}
            value={selectedStudentId}
            onChange={(newId) => setSelectedStudentId(String(newId))}
            label="Select Student for Attendance"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end self-end md:self-center pt-2 md:pt-0">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            loading={refreshing}
            onClick={() => loadAttendance(selectedStudentId, true)}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => {
              setRecordError('');
              setIsRecordOpen(true);
            }}
          >
            Mark Attendance
          </Button>
        </div>
      </div>

      {/* Metrics Row for Selected Student */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <MetricCard
            title="Overall Attendance"
            value={`${stats.overall_percentage ?? 0}%`}
            subtitle="Student semester average"
            icon={CheckSquare}
            color={stats.overall_percentage >= 75 ? 'emerald' : 'rose'}
          />
          <MetricCard
            title="Total Sessions"
            value={stats.total_classes || 0}
            subtitle="Conducted classes"
            icon={Calendar}
            color="blue"
          />
          <MetricCard
            title="Present Sessions"
            value={stats.attended_classes || 0}
            subtitle="Recorded in attendance"
            icon={CheckCircle}
            color="emerald"
          />
          <MetricCard
            title="Missed Sessions"
            value={stats.missed_classes || 0}
            subtitle="Marked absent"
            icon={UserCheck}
            color={stats.missed_classes > 0 ? 'amber' : 'emerald'}
          />
        </div>
      )}

      {/* Attendance History Table */}
      <Card
        title={`Attendance Sessions: ${selectedStudent?.first_name || ''} ${selectedStudent?.last_name || ''} (${selectedStudent?.roll_no || ''})`}
        icon={CheckSquare}
        subtitle="Individual classroom session records stored in PostgreSQL"
      >
        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : error ? (
          <ErrorAlert message={error} onRetry={() => loadAttendance(selectedStudentId, false)} />
        ) : attendanceLogs.length === 0 ? (
          <EmptyState
            title="No Attendance Sessions Recorded"
            description="There are no attendance records for this student yet. Use the 'Mark Attendance' button to record a session."
            icon={CheckSquare}
          />
        ) : (
          <Table columns={columns} data={attendanceLogs} keyField="attendance_id" />
        )}
      </Card>

      {/* Mark Attendance Modal */}
      <Modal
        isOpen={isRecordOpen}
        onClose={() => setIsRecordOpen(false)}
        title="Mark Session Attendance"
        subtitle={`Student: ${selectedStudent?.first_name} ${selectedStudent?.last_name} (${selectedStudent?.roll_no})`}
        icon={CheckSquare}
      >
        {recordError && (
          <div className="mb-4">
            <ErrorAlert message={recordError} />
          </div>
        )}

        <form onSubmit={handleRecordAttendance} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1">Subject / Module *</label>
            <CustomSelect
              options={subjectOptions}
              value={recordForm.subject_id}
              onChange={(e) => setRecordForm({ ...recordForm, subject_id: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Class Date *</label>
              <input
                type="date"
                required
                value={recordForm.class_date}
                onChange={(e) => setRecordForm({ ...recordForm, class_date: e.target.value })}
                className="w-full bg-[#0b121e] border border-slate-700/80 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Period Number *</label>
              <CustomSelect
                options={periodOptions}
                value={recordForm.period_no}
                onChange={(e) => setRecordForm({ ...recordForm, period_no: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Attendance Status *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRecordForm({ ...recordForm, is_present: true })}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  recordForm.is_present
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-[#0b121e] border-slate-700/80 text-slate-400 hover:bg-white/5'
                }`}
              >
                <CheckCircle size={14} />
                <span>Present</span>
              </button>

              <button
                type="button"
                onClick={() => setRecordForm({ ...recordForm, is_present: false })}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  !recordForm.is_present
                    ? 'bg-red-500/20 border-red-500/40 text-red-300'
                    : 'bg-[#0b121e] border-slate-700/80 text-slate-400 hover:bg-white/5'
                }`}
              >
                <span>Absent</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Remarks (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Participated in lab practical"
              value={recordForm.remarks}
              onChange={(e) => setRecordForm({ ...recordForm, remarks: e.target.value })}
              className="w-full bg-[#0b121e] border border-slate-700/80 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-white/5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsRecordOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={recording}
            >
              Save Attendance
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
