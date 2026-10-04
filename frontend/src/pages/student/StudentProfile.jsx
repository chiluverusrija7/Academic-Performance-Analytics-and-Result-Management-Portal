import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ProfileSkeleton } from '../../components/ui/Skeleton';
import { ErrorAlert } from '../../components/ui/States';
import { useToast } from '../../context/ToastContext';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  ShieldCheck,
  Heart,
  Edit,
  RefreshCw,
  CheckCircle,
  GraduationCap,
  Users,
} from 'lucide-react';

export function StudentProfile() {
  const { user } = useAuth();
  const studentId = user?.student_id || 1;
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [student, setStudent] = useState(null);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const loadProfile = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await api.getStudent(studentId);
      if (res.success) {
        setStudent(res.data);
      }
      if (isRefresh) {
        toast.success('Student profile refreshed', 'Synced');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch student profile');
      toast.error(err.message || 'Error fetching profile', 'Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [studentId]);

  const openEditModal = () => {
    if (!student) return;
    setEditFormData({
      first_name: student.first_name || '',
      middle_name: student.middle_name || '',
      last_name: student.last_name || '',
      email: student.email || '',
      alternate_email: student.alternate_email || '',
      phone_no: student.phone_no || '',
      alternate_phone: student.alternate_phone || '',
      blood_group: student.blood_group || '',
      address: student.address || '',
      city: student.city || '',
      state: student.state || '',
      pincode: student.pincode || '',
      guardian_name: student.guardian_name || '',
      guardian_relation: student.guardian_relation || '',
      guardian_phone: student.guardian_phone || '',
      guardian_email: student.guardian_email || '',
    });
    setEditError('');
    setIsEditOpen(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setEditError('');

    try {
      const res = await api.updateStudent(studentId, editFormData);
      if (res.success) {
        setIsEditOpen(false);
        toast.success('Student profile updated successfully in PostgreSQL!', 'Profile Updated');
        await loadProfile();
      }
    } catch (err) {
      setEditError(err.message || 'Failed to update student profile');
      toast.error(err.message || 'Failed to save changes', 'Update Failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ProfileSkeleton />;
  if (error) return <ErrorAlert message={error} onRetry={() => loadProfile(false)} />;

  const fullName = [student?.first_name, student?.middle_name, student?.last_name].filter(Boolean).join(' ');

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="bg-navy-900 border border-white/5 rounded-2xl p-6 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-18 h-18 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 p-0.5 shadow-md shadow-blue-500/20 shrink-0">
            <div className="w-full h-full bg-navy-950 rounded-2xl flex items-center justify-center text-blue-300 font-bold text-2xl font-display">
              {student?.first_name?.[0]?.toUpperCase() || 'S'}
            </div>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <Badge variant="primary" size="sm">
                Semester {student?.current_semester || 1} • Section {student?.section || 'A'}
              </Badge>
              <Badge variant="sky" size="sm">
                {student?.dept_code || 'CSE'}
              </Badge>
              <Badge variant="success" size="sm" dot>
                {student?.status || 'Active'}
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-display">
              {fullName}
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Roll No: <span className="text-blue-300 font-semibold">{student?.roll_no}</span> • Reg No: <span className="text-slate-300">{student?.reg_no}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-center">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            loading={refreshing}
            onClick={() => loadProfile(true)}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Edit}
            onClick={openEditModal}
          >
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Information Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Academic Details */}
        <Card title="Academic Profile" icon={GraduationCap}>
          <dl className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-xs">
            <div>
              <dt className="text-slate-400">Department</dt>
              <dd className="text-slate-200 font-semibold mt-0.5">{student?.dept_name} ({student?.dept_code})</dd>
            </div>
            <div>
              <dt className="text-slate-400">Degree Program</dt>
              <dd className="text-slate-200 font-semibold mt-0.5">{student?.course_name}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Current Semester</dt>
              <dd className="text-slate-200 font-semibold mt-0.5">Semester {student?.current_semester} (Section {student?.section})</dd>
            </div>
            <div>
              <dt className="text-slate-400">Admission Year</dt>
              <dd className="text-slate-200 font-semibold mt-0.5">{student?.admission_year || '2023'}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Admission Type</dt>
              <dd className="text-slate-200 font-semibold mt-0.5">{student?.admission_type || 'Regular'}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Academic Status</dt>
              <dd className="mt-0.5">
                <Badge variant="success">{student?.status || 'Active'}</Badge>
              </dd>
            </div>
          </dl>
        </Card>

        {/* Contact Information */}
        <Card title="Contact Details" icon={Mail}>
          <dl className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-xs">
            <div>
              <dt className="text-slate-400">Email Address</dt>
              <dd className="text-slate-200 font-semibold font-mono mt-0.5 truncate">{student?.email || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Alternate Email</dt>
              <dd className="text-slate-200 font-semibold font-mono mt-0.5 truncate">{student?.alternate_email || '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Phone Number</dt>
              <dd className="text-slate-200 font-semibold font-mono mt-0.5">{student?.phone_no || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Alternate Phone</dt>
              <dd className="text-slate-200 font-semibold font-mono mt-0.5">{student?.alternate_phone || '—'}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-slate-400">Permanent Address</dt>
              <dd className="text-slate-200 mt-0.5">
                {[student?.address, student?.city, student?.state, student?.pincode].filter(Boolean).join(', ') || 'N/A'}
              </dd>
            </div>
          </dl>
        </Card>

        {/* Personal Details */}
        <Card title="Personal Information" icon={User}>
          <dl className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-xs">
            <div>
              <dt className="text-slate-400">Gender</dt>
              <dd className="text-slate-200 font-semibold mt-0.5">{student?.gender || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Date of Birth</dt>
              <dd className="text-slate-200 font-semibold mt-0.5">
                {student?.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400">Blood Group</dt>
              <dd className="text-slate-200 font-semibold mt-0.5">{student?.blood_group || '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Nationality</dt>
              <dd className="text-slate-200 font-semibold mt-0.5">{student?.nationality || 'Indian'}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Category</dt>
              <dd className="text-slate-200 font-semibold mt-0.5">{student?.category || 'General'}</dd>
            </div>
          </dl>
        </Card>

        {/* Guardian Information */}
        <Card title="Guardian &amp; Emergency Contact" icon={Users}>
          <dl className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-xs">
            <div>
              <dt className="text-slate-400">Guardian Name</dt>
              <dd className="text-slate-200 font-semibold mt-0.5">{student?.guardian_name || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Relationship</dt>
              <dd className="text-slate-200 font-semibold mt-0.5">{student?.guardian_relation || 'Parent'}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Guardian Phone</dt>
              <dd className="text-slate-200 font-semibold font-mono mt-0.5">{student?.guardian_phone || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Guardian Email</dt>
              <dd className="text-slate-200 font-semibold font-mono mt-0.5 truncate">{student?.guardian_email || '—'}</dd>
            </div>
          </dl>
        </Card>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Student Profile"
        subtitle="Update student record in PostgreSQL database"
        maxWidth="max-w-2xl"
        icon={Edit}
      >
        {editError && (
          <div className="mb-4">
            <ErrorAlert message={editError} />
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={editFormData.first_name || ''}
                onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                className="w-full bg-navy-950 border border-white/10 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Middle Name</label>
              <input
                type="text"
                value={editFormData.middle_name || ''}
                onChange={(e) => setEditFormData({ ...editFormData, middle_name: e.target.value })}
                className="w-full bg-navy-950 border border-white/10 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Last Name</label>
              <input
                type="text"
                value={editFormData.last_name || ''}
                onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                className="w-full bg-navy-950 border border-white/10 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                value={editFormData.email || ''}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                className="w-full bg-navy-950 border border-white/10 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={editFormData.phone_no || ''}
                onChange={(e) => setEditFormData({ ...editFormData, phone_no: e.target.value })}
                className="w-full bg-navy-950 border border-white/10 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">City</label>
              <input
                type="text"
                value={editFormData.city || ''}
                onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                className="w-full bg-navy-950 border border-white/10 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">State</label>
              <input
                type="text"
                value={editFormData.state || ''}
                onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                className="w-full bg-navy-950 border border-white/10 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Pincode</label>
              <input
                type="text"
                value={editFormData.pincode || ''}
                onChange={(e) => setEditFormData({ ...editFormData, pincode: e.target.value })}
                className="w-full bg-navy-950 border border-white/10 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-white/5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={saving}
            >
              Save to PostgreSQL
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
