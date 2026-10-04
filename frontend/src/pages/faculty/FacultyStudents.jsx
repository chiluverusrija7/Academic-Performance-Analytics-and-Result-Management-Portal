import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { ErrorAlert, EmptyState } from '../../components/ui/States';
import { useToast } from '../../context/ToastContext';
import { GraduationCap, Search, Eye, RefreshCw } from 'lucide-react';

export function FacultyStudents() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const toast = useToast();

  const loadStudents = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await api.getStudents({ search });
      if (res.success) {
        setStudents(res.data);
      }
      if (isRefresh) {
        toast.success('Student roster refreshed from PostgreSQL', 'Synced');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch students');
      toast.error(err.message || 'Error loading students', 'Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [search]);

  const openViewModal = (stu) => {
    setSelectedStudent(stu);
    setIsViewOpen(true);
  };

  const columns = [
    { header: 'Roll No', accessor: 'roll_no', cellClassName: 'font-mono font-bold text-blue-400' },
    {
      header: 'Student Name',
      accessor: 'first_name',
      render: (val, row) => `${val} ${row.middle_name || ''} ${row.last_name || ''}`,
    },
    { header: 'Department', accessor: 'dept_code', align: 'center', render: (val) => <Badge variant="sky">{val}</Badge> },
    { header: 'Course Program', accessor: 'course_name' },
    { header: 'Semester', accessor: 'current_semester', align: 'center', render: (val) => `Sem ${val}` },
    { header: 'Section', accessor: 'section', align: 'center' },
    { header: 'Email', accessor: 'email', cellClassName: 'font-mono text-xs text-slate-300' },
    { header: 'Status', accessor: 'status', align: 'center', render: (val) => <Badge variant="success" dot>{val || 'Active'}</Badge> },
    {
      header: 'Actions',
      accessor: 'student_id',
      align: 'center',
      render: (val, row) => (
        <Button variant="secondary" size="xs" icon={Eye} onClick={() => openViewModal(row)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card
        title="Department Student Directory"
        icon={GraduationCap}
        subtitle="Enrolled students registered across department programs in PostgreSQL"
        action={
          <div className="flex items-center gap-2.5">
            <div className="relative w-48 sm:w-64">
              <Search size={14} className="text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by name, roll no..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-navy-950 border border-white/10 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              loading={refreshing}
              onClick={() => loadStudents(true)}
            >
              Refresh
            </Button>
          </div>
        }
      >
        {loading ? (
          <TableSkeleton rows={8} cols={7} />
        ) : error ? (
          <ErrorAlert message={error} onRetry={() => loadStudents(false)} />
        ) : students.length === 0 ? (
          <EmptyState title="No Students Found" description="No students match your query." icon={GraduationCap} />
        ) : (
          <Table columns={columns} data={students} keyField="student_id" />
        )}
      </Card>

      {/* View Student Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Student Record Dossier"
        subtitle={selectedStudent?.roll_no}
        icon={GraduationCap}
      >
        {selectedStudent && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-navy-950 border border-white/5">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-white text-sm">{selectedStudent.first_name} {selectedStudent.last_name}</span>
                <Badge variant="success" dot>{selectedStudent.status}</Badge>
              </div>
              <p className="text-slate-400 font-mono">
                {selectedStudent.roll_no} • {selectedStudent.reg_no}
              </p>
              <p className="text-blue-400 font-medium mt-0.5">{selectedStudent.course_name} ({selectedStudent.dept_name})</p>
            </div>

            <dl className="grid grid-cols-2 gap-y-3 text-xs">
              <div><dt className="text-slate-400">Current Semester</dt><dd className="text-slate-200 font-semibold">Semester {selectedStudent.current_semester} (Sec {selectedStudent.section})</dd></div>
              <div><dt className="text-slate-400">Gender</dt><dd className="text-slate-200 font-semibold">{selectedStudent.gender || 'N/A'}</dd></div>
              <div><dt className="text-slate-400">Email</dt><dd className="text-slate-200 font-semibold font-mono truncate">{selectedStudent.email || 'N/A'}</dd></div>
              <div><dt className="text-slate-400">Phone</dt><dd className="text-slate-200 font-semibold font-mono">{selectedStudent.phone_no || 'N/A'}</dd></div>
            </dl>

            <div className="flex justify-end pt-3 border-t border-white/5">
              <Button variant="secondary" size="sm" onClick={() => setIsViewOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
