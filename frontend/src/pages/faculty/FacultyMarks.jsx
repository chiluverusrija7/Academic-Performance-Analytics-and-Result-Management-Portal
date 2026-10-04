import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { ErrorAlert, EmptyState } from '../../components/ui/States';
import { StudentCombobox } from '../../components/ui/StudentCombobox';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { useToast } from '../../context/ToastContext';
import { FileSpreadsheet, Plus, RefreshCw, CheckCircle, Edit, Award } from 'lucide-react';

export function FacultyMarks() {
  const { user } = useAuth();
  const facultyId = user?.faculty_id || 1;
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState(null);
  const [exams, setExams] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('1');
  const [marks, setMarks] = useState([]);

  // Enter Marks Modal State
  const [isEntryOpen, setIsEntryOpen] = useState(false);
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [activeMarkId, setActiveMarkId] = useState(null);
  const [markForm, setMarkForm] = useState({
    subject_id: '1',
    exam_id: '1',
    internal_marks: '35',
    external_marks: '50',
    exam_type: 'Internal Assessment 1',
    remarks: 'Satisfactory',
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    Promise.all([
      api.getStudents(),
      api.getFaculty(facultyId),
      api.getExams(),
    ]).then(([stuRes, facRes, examRes]) => {
      if (stuRes.success && stuRes.data.length > 0) setStudents(stuRes.data);
      if (facRes.success) setFaculty(facRes.data);
      if (examRes.success) setExams(examRes.data);
    });
  }, [facultyId]);

  const loadMarks = async (sId, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await api.getMarks(sId);
      if (res.success) {
        setMarks(res.data);
      }
      if (isRefresh) {
        toast.success('Marks records refreshed from PostgreSQL', 'Synced');
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
    if (selectedStudentId) {
      loadMarks(selectedStudentId);
    }
  }, [selectedStudentId]);

  const openNewEntry = () => {
    setIsEditingExisting(false);
    setActiveMarkId(null);
    setMarkForm({
      subject_id: faculty?.assigned_subjects?.[0]?.subject_id || '1',
      exam_id: exams[0]?.exam_id || '1',
      internal_marks: '',
      external_marks: '',
      exam_type: 'Internal',
      remarks: '',
    });
    setFormError('');
    setIsEntryOpen(true);
  };

  const openEditEntry = (row) => {
    setIsEditingExisting(true);
    setActiveMarkId(row.mark_id);
    setMarkForm({
      subject_id: row.subject_id,
      exam_id: row.exam_id,
      internal_marks: row.internal_marks || '',
      external_marks: row.external_marks || '',
      exam_type: row.exam_type || 'Internal',
      remarks: row.remarks || '',
    });
    setFormError('');
    setIsEntryOpen(true);
  };

  const handleSaveMarks = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');

    try {
      if (isEditingExisting && activeMarkId) {
        const payload = {
          internal_marks: parseFloat(markForm.internal_marks || 0),
          external_marks: parseFloat(markForm.external_marks || 0),
          remarks: markForm.remarks || null,
        };
        const res = await api.updateMarks(activeMarkId, payload);
        if (res.success) {
          setIsEntryOpen(false);
          toast.success('Marks updated successfully in PostgreSQL!', 'Updated');
          await loadMarks(selectedStudentId);
        }
      } else {
        const payload = {
          enrollment_id: parseInt(selectedStudentId, 10),
          subject_id: parseInt(markForm.subject_id, 10),
          exam_id: parseInt(markForm.exam_id, 10),
          faculty_id: facultyId,
          internal_marks: parseFloat(markForm.internal_marks || 0),
          external_marks: parseFloat(markForm.external_marks || 0),
          exam_type: markForm.exam_type,
          remarks: markForm.remarks || null,
        };
        const res = await api.saveMarks(payload);
        if (res.success) {
          setIsEntryOpen(false);
          toast.success('Marks recorded successfully in PostgreSQL!', 'Recorded');
          await loadMarks(selectedStudentId);
        }
      }
    } catch (err) {
      setFormError(err.message || 'Failed to save marks');
      toast.error(err.message || 'Error saving marks', 'Save Failed');
    } finally {
      setSaving(false);
    }
  };

  const selectedStudent = students.find((s) => String(s.student_id) === String(selectedStudentId));
  const assignedSubjects = faculty?.assigned_subjects || [];

  const subjectOptions = assignedSubjects.length > 0
    ? assignedSubjects.map((sub) => ({
        value: String(sub.subject_id),
        label: `${sub.subject_code} - ${sub.subject_name}`,
      }))
    : [{ value: '1', label: 'CS301 - Database Management Systems' }];

  const examOptions = exams.map((ex) => ({
    value: String(ex.exam_id),
    label: `${ex.exam_name} (${ex.exam_type}) - Sem ${ex.semester_no}`,
  }));

  const columns = [
    { header: 'Subject Code', accessor: 'subject_code', cellClassName: 'font-mono font-bold text-blue-400' },
    { header: 'Subject Title', accessor: 'subject_name' },
    { header: 'Examination', accessor: 'exam_name' },
    {
      header: 'Internal (40)',
      accessor: 'internal_marks',
      align: 'right',
      render: (val) => <span className="font-mono font-semibold">{val || '0.00'}</span>,
    },
    {
      header: 'External (60)',
      accessor: 'external_marks',
      align: 'right',
      render: (val) => <span className="font-mono font-semibold">{val || '0.00'}</span>,
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
    { header: 'Status', accessor: 'result_status', align: 'center', render: (val) => <Badge variant={val === 'Published' ? 'success' : 'warning'}>{val}</Badge> },
    {
      header: 'Actions',
      accessor: 'mark_id',
      align: 'center',
      render: (val, row) => (
        <Button variant="secondary" size="xs" icon={Edit} onClick={() => openEditEntry(row)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Searchable Student Selector Bar */}
      <div className="bg-[#0b121e] border border-slate-800 rounded-2xl p-5 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="w-full md:w-96">
          <StudentCombobox
            students={students}
            value={selectedStudentId}
            onChange={(newId) => setSelectedStudentId(String(newId))}
            label="Select Student for Evaluation"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end self-end md:self-center pt-2 md:pt-0">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            loading={refreshing}
            onClick={() => loadMarks(selectedStudentId, true)}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={openNewEntry}
          >
            Enter Marks
          </Button>
        </div>
      </div>

      {/* Marks Table */}
      <Card
        title={`Evaluation Scores: ${selectedStudent?.first_name || ''} ${selectedStudent?.last_name || ''} (${selectedStudent?.roll_no || ''})`}
        icon={FileSpreadsheet}
        subtitle="Continuous internal evaluations and semester exam grades recorded in PostgreSQL"
      >
        {loading ? (
          <TableSkeleton rows={6} cols={7} />
        ) : error ? (
          <ErrorAlert message={error} onRetry={() => loadMarks(selectedStudentId, false)} />
        ) : marks.length === 0 ? (
          <EmptyState
            title="No Marks Entered Yet"
            description="No assessment marks found for this student. Use 'Enter Marks' to submit evaluation scores."
            icon={FileSpreadsheet}
          />
        ) : (
          <Table columns={columns} data={marks} keyField="mark_id" />
        )}
      </Card>

      {/* Enter / Edit Marks Modal */}
      <Modal
        isOpen={isEntryOpen}
        onClose={() => setIsEntryOpen(false)}
        title={isEditingExisting ? 'Edit Assessment Marks' : 'Enter Student Marks'}
        subtitle={`Student: ${selectedStudent?.first_name} ${selectedStudent?.last_name} (${selectedStudent?.roll_no})`}
        icon={FileSpreadsheet}
      >
        {formError && (
          <div className="mb-4">
            <ErrorAlert message={formError} />
          </div>
        )}

        <form onSubmit={handleSaveMarks} className="space-y-4 text-xs">
          {!isEditingExisting && (
            <>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Subject Module *</label>
                <CustomSelect
                  options={subjectOptions}
                  value={markForm.subject_id}
                  onChange={(e) => setMarkForm({ ...markForm, subject_id: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Examination Session *</label>
                <CustomSelect
                  options={examOptions}
                  value={markForm.exam_id}
                  onChange={(e) => setMarkForm({ ...markForm, exam_id: e.target.value })}
                />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Internal Score (Max 40) *</label>
              <input
                type="number"
                min="0"
                max="40"
                step="0.5"
                required
                value={markForm.internal_marks}
                onChange={(e) => setMarkForm({ ...markForm, internal_marks: e.target.value })}
                className="w-full bg-[#0b121e] border border-slate-700/80 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 font-mono font-medium"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">External Score (Max 60) *</label>
              <input
                type="number"
                min="0"
                max="60"
                step="0.5"
                required
                value={markForm.external_marks}
                onChange={(e) => setMarkForm({ ...markForm, external_marks: e.target.value })}
                className="w-full bg-[#0b121e] border border-slate-700/80 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 font-mono font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Remarks (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Excellent practical performance"
              value={markForm.remarks}
              onChange={(e) => setMarkForm({ ...markForm, remarks: e.target.value })}
              className="w-full bg-[#0b121e] border border-slate-700/80 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-white/5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEntryOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={saving}
            >
              {isEditingExisting ? 'Update in PostgreSQL' : 'Submit Marks'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
