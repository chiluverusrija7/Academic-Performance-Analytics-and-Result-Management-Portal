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
import { useToast } from '../../context/ToastContext';
import { BookOpen, RefreshCw, Eye, Calendar, Layers, CheckCircle } from 'lucide-react';

export function StudentEnrollments() {
  const { user } = useAuth();
  const studentId = user?.student_id || 1;
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const loadEnrollments = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await api.getEnrollments(studentId);
      if (res.success) {
        setEnrollments(res.data);
      }
      if (isRefresh) {
        toast.success('Enrollment records refreshed', 'Synced');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch enrollment records');
      toast.error(err.message || 'Error loading enrollments', 'Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEnrollments();
  }, [studentId]);

  const viewDetails = (enr) => {
    setSelectedEnrollment(enr);
    setIsDetailsOpen(true);
  };

  if (loading) return <TableSkeleton rows={4} cols={7} />;
  if (error) return <ErrorAlert message={error} onRetry={() => loadEnrollments(false)} />;

  const columns = [
    { header: 'Registration No', accessor: 'registration_number', cellClassName: 'font-mono font-bold text-blue-400' },
    { header: 'Degree Course', accessor: 'course_name' },
    { header: 'Semester', accessor: 'semester_no', align: 'center', render: (val) => `Semester ${val}` },
    { header: 'Section', accessor: 'section', align: 'center' },
    { header: 'Academic Year', accessor: 'academic_year' },
    {
      header: 'Enrollment Date',
      accessor: 'enrollment_date',
      render: (val) => (val ? new Date(val).toLocaleDateString() : 'N/A'),
    },
    { header: 'Fee Status', accessor: 'fee_status', align: 'center', render: (val) => <Badge variant={val === 'Paid' ? 'success' : 'warning'} dot>{val || 'Active'}</Badge> },
    { header: 'Attendance', accessor: 'attendance_status', align: 'center', render: (val) => <Badge variant="primary">{val || 'Regular'}</Badge> },
    { header: 'Status', accessor: 'enroll_status', align: 'center', render: (val) => <Badge variant="success" dot>{val || 'Active'}</Badge> },
    {
      header: 'Actions',
      accessor: 'enrollment_id',
      align: 'center',
      render: (val, row) => (
        <Button
          variant="secondary"
          size="xs"
          icon={Eye}
          onClick={() => viewDetails(row)}
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card
        title="Semester Enrollments &amp; Term Registrations"
        icon={BookOpen}
        subtitle="Academic curriculum registration history recorded in PostgreSQL"
        action={
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            loading={refreshing}
            onClick={() => loadEnrollments(true)}
          >
            Refresh
          </Button>
        }
      >
        {enrollments.length === 0 ? (
          <EmptyState
            title="No Enrollments Found"
            description="No academic term enrollments recorded for this student ID."
            icon={BookOpen}
          />
        ) : (
          <Table columns={columns} data={enrollments} keyField="enrollment_id" />
        )}
      </Card>

      {/* Enrollment Details Modal */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title="Enrollment Registration Dossier"
        subtitle={selectedEnrollment?.registration_number}
        icon={BookOpen}
      >
        {selectedEnrollment && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-navy-950 border border-white/5">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-white text-sm">Semester {selectedEnrollment.semester_no} ({selectedEnrollment.academic_year})</span>
                <Badge variant="success" dot>{selectedEnrollment.enroll_status || 'Active'}</Badge>
              </div>
              <p className="text-blue-400 font-medium">{selectedEnrollment.course_name} ({selectedEnrollment.course_code})</p>
            </div>

            <dl className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
              <div>
                <dt className="text-slate-400">Registration Number</dt>
                <dd className="text-slate-200 font-semibold font-mono mt-0.5">{selectedEnrollment.registration_number}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Assigned Section</dt>
                <dd className="text-slate-200 font-semibold mt-0.5">Section {selectedEnrollment.section}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Fee Status</dt>
                <dd className="mt-0.5"><Badge variant={selectedEnrollment.fee_status === 'Paid' ? 'success' : 'warning'}>{selectedEnrollment.fee_status || 'Regular'}</Badge></dd>
              </div>
              <div>
                <dt className="text-slate-400">Attendance Standing</dt>
                <dd className="mt-0.5"><Badge variant="primary">{selectedEnrollment.attendance_status || 'Eligible'}</Badge></dd>
              </div>
              <div>
                <dt className="text-slate-400">Semester Start Date</dt>
                <dd className="text-slate-200 font-semibold mt-0.5">{selectedEnrollment.semester_start_date ? new Date(selectedEnrollment.semester_start_date).toLocaleDateString() : 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Semester End Date</dt>
                <dd className="text-slate-200 font-semibold mt-0.5">{selectedEnrollment.semester_end_date ? new Date(selectedEnrollment.semester_end_date).toLocaleDateString() : 'N/A'}</dd>
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
