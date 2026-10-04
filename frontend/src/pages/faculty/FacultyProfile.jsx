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
import { User, Mail, Phone, Building, GraduationCap, Edit, RefreshCw, Briefcase, BookOpen, Layers } from 'lucide-react';

export function FacultyProfile() {
  const { user } = useAuth();
  const facultyId = user?.faculty_id || 1;
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [faculty, setFaculty] = useState(null);

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
      const res = await api.getFaculty(facultyId);
      if (res.success) {
        setFaculty(res.data);
      }
      if (isRefresh) {
        toast.success('Faculty profile refreshed from PostgreSQL', 'Synced');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch faculty profile');
      toast.error(err.message || 'Error loading profile', 'Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [facultyId]);

  const openEditModal = () => {
    if (!faculty) return;
    setEditFormData({
      first_name: faculty.first_name || '',
      last_name: faculty.last_name || '',
      email: faculty.email || '',
      phone_no: faculty.phone_no || '',
      designation: faculty.designation || '',
      qualification: faculty.qualification || '',
      specialization: faculty.specialization || '',
      office_room: faculty.office_room || '',
      employment_type: faculty.employment_type || 'Full-Time',
    });
    setEditError('');
    setIsEditOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setEditError('');

    try {
      const res = await api.updateFaculty(facultyId, editFormData);
      if (res.success) {
        setIsEditOpen(false);
        toast.success('Faculty profile updated successfully in PostgreSQL!', 'Profile Updated');
        await loadProfile();
      }
    } catch (err) {
      setEditError(err.message || 'Failed to update faculty profile');
      toast.error(err.message || 'Error updating profile', 'Update Failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ProfileSkeleton />;
  if (error) return <ErrorAlert message={error} onRetry={() => loadProfile(false)} />;
  if (!faculty) return null;

  return (
    <div className="space-y-6">
      {/* Profile Header Banner */}
      <div className="bg-navy-900 border border-white/5 rounded-2xl p-6 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-18 h-18 rounded-2xl bg-gradient-to-tr from-sky-600 via-blue-600 to-indigo-600 p-0.5 shadow-md shadow-sky-500/20 shrink-0">
            <div className="w-full h-full bg-navy-950 rounded-2xl flex items-center justify-center text-sky-300 font-bold text-2xl font-display">
              {faculty.first_name?.[0]?.toUpperCase() || 'F'}
            </div>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <Badge variant="sky" size="sm">
                {faculty.designation || 'Faculty'}
              </Badge>
              <Badge variant="primary" size="sm">
                {faculty.dept_name} ({faculty.dept_code})
              </Badge>
              <Badge variant="success" size="sm" dot>
                {faculty.status || 'Active'}
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-display">
              Prof. {faculty.first_name} {faculty.last_name}
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Employee Code: <span className="text-sky-300 font-semibold">{faculty.employee_code}</span> • Office: <span className="text-slate-200">{faculty.office_room || 'Room 303'}</span>
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

      {/* Grid of Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Academic & Department Info */}
        <Card title="Department &amp; Position" icon={Building}>
          <dl className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-xs">
            <div>
              <dt className="text-slate-400">Department</dt>
              <dd className="text-slate-200 font-semibold mt-0.5">{faculty.dept_name} ({faculty.dept_code})</dd>
            </div>
            <div>
              <dt className="text-slate-400">Designation</dt>
              <dd className="text-slate-200 font-semibold mt-0.5">{faculty.designation}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Employment Type</dt>
              <dd className="text-slate-200 font-semibold mt-0.5">{faculty.employment_type || 'Full-Time'}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Experience</dt>
              <dd className="text-slate-200 font-semibold mt-0.5">{faculty.experience_years || 0} Years</dd>
            </div>
            <div>
              <dt className="text-slate-400">Office Room</dt>
              <dd className="text-slate-200 font-semibold mt-0.5">{faculty.office_room || '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Joining Date</dt>
              <dd className="text-slate-200 font-semibold mt-0.5">
                {faculty.joining_date ? new Date(faculty.joining_date).toLocaleDateString() : '—'}
              </dd>
            </div>
          </dl>
        </Card>

        {/* Credentials & Expertise */}
        <Card title="Qualifications &amp; Expertise" icon={GraduationCap}>
          <dl className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-xs">
            <div>
              <dt className="text-slate-400">Highest Qualification</dt>
              <dd className="text-slate-200 font-semibold mt-0.5">{faculty.qualification || 'M.Tech / Ph.D'}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Specialization</dt>
              <dd className="text-slate-200 font-semibold mt-0.5">{faculty.specialization || 'Computer Science'}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-slate-400">Academic Status</dt>
              <dd className="mt-1">
                <Badge variant="success" dot>{faculty.status || 'Active'}</Badge>
              </dd>
            </div>
          </dl>
        </Card>

        {/* Contact Information */}
        <Card title="Contact Channels" icon={Mail} className="md:col-span-2">
          <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3.5 gap-x-4 text-xs">
            <div>
              <dt className="text-slate-400">Official Email</dt>
              <dd className="text-slate-200 font-semibold font-mono mt-0.5 truncate">{faculty.email || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Phone Number</dt>
              <dd className="text-slate-200 font-semibold font-mono mt-0.5">{faculty.phone_no || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Campus Location</dt>
              <dd className="text-slate-200 mt-0.5">{faculty.building || 'Engineering Block'}, {faculty.office_location || 'Floor 3'}</dd>
            </div>
          </dl>
        </Card>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Faculty Profile"
        subtitle="Update faculty record in PostgreSQL database"
        maxWidth="max-w-2xl"
        icon={Edit}
      >
        {editError && (
          <div className="mb-4">
            <ErrorAlert message={editError} />
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <label className="block font-medium text-slate-300 mb-1">Email Address *</label>
              <input
                type="email"
                required
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
              <label className="block font-medium text-slate-300 mb-1">Designation</label>
              <input
                type="text"
                value={editFormData.designation || ''}
                onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
                className="w-full bg-navy-950 border border-white/10 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Qualification</label>
              <input
                type="text"
                value={editFormData.qualification || ''}
                onChange={(e) => setEditFormData({ ...editFormData, qualification: e.target.value })}
                className="w-full bg-navy-950 border border-white/10 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Office Room</label>
              <input
                type="text"
                value={editFormData.office_room || ''}
                onChange={(e) => setEditFormData({ ...editFormData, office_room: e.target.value })}
                className="w-full bg-navy-950 border border-white/10 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
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
