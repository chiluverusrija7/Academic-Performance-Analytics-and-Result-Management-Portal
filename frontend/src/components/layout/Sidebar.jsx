import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  User,
  CheckSquare,
  FileText,
  Award,
  CreditCard,
  BookOpen,
  Users,
  GraduationCap,
  Building,
  Calendar,
  Layers,
  FileSpreadsheet,
  LogOut,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Brain,
} from 'lucide-react';

export function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { user, role, logout } = useAuth();

  // Define navigation based on role
  const getNavItems = () => {
    if (role === 'STUDENT') {
      return [
        { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
        { label: 'Profile', path: '/student/profile', icon: User },
        { label: 'Attendance', path: '/student/attendance', icon: CheckSquare },
        { label: 'Exams', path: '/student/exams', icon: Calendar },
        { label: 'Marks', path: '/student/marks', icon: FileSpreadsheet },
        { label: 'Results', path: '/student/results', icon: Award },
        { label: 'Fees & Dues', path: '/student/fees', icon: CreditCard },
        { label: 'Enrollments', path: '/student/enrollments', icon: BookOpen },
        { label: 'My Intelligence', path: '/student/intelligence', icon: Brain, accent: true },
      ];
    }

    if (role === 'FACULTY') {
      return [
        { label: 'Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
        { label: 'Profile', path: '/faculty/profile', icon: User },
        { label: 'Subjects', path: '/faculty/subjects', icon: BookOpen },
        { label: 'Students', path: '/faculty/students', icon: GraduationCap },
        { label: 'Attendance', path: '/faculty/attendance', icon: CheckSquare },
        { label: 'Marks Entry', path: '/faculty/marks', icon: FileSpreadsheet },
        { label: 'AI Intelligence', path: '/faculty/intelligence', icon: Brain, accent: true },
      ];
    }

    // Default / Admin / HOD / Exam Cell navigation
    return [
      { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Students', path: '/admin/students', icon: GraduationCap },
      { label: 'Faculty', path: '/admin/faculty', icon: Users },
      { label: 'Departments', path: '/admin/departments', icon: Building },
      { label: 'Courses', path: '/admin/courses', icon: Layers },
      { label: 'Semesters', path: '/admin/semesters', icon: Calendar },
      { label: 'Subjects', path: '/admin/subjects', icon: BookOpen },
      { label: 'Exams', path: '/admin/exams', icon: FileText },
      { label: 'Enrollments', path: '/admin/enrollments', icon: CheckSquare },
      { label: 'Fees & Ledger', path: '/admin/fees', icon: CreditCard },
      { label: 'AI Intelligence', path: '/intelligence', icon: Brain, accent: true },
    ];
  };

  const navItems = getNavItems();

  const roleLabels = {
    STUDENT: { label: 'Student Portal', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    FACULTY: { label: 'Faculty Portal', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
    ADMIN: { label: 'Administrator', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    HOD: { label: 'Dept Head', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    EXAM_CELL: { label: 'Exam Cell', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  };

  const currentRoleInfo = roleLabels[role] || { label: role || 'Member', color: 'text-slate-400 bg-white/5 border-white/10' };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 md:sticky md:top-0 h-screen
        bg-navy-900 border-r border-white/5 shadow-sidebar
        flex flex-col shrink-0 sidebar-transition select-none
        ${mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
        ${collapsed ? 'md:w-[68px]' : 'md:w-64'}
      `}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/5 gap-2">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-black text-lg shrink-0">
            E
          </div>
          {!collapsed && (
            <div className="min-w-0 transition-opacity duration-200">
              <h1 className="font-bold text-white text-sm tracking-tight leading-none truncate">
                EduInsight
              </h1>
              <p className="text-[10px] text-blue-400 font-semibold tracking-wider mt-0.5 uppercase truncate">
                Enterprise Academic
              </p>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors shrink-0"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Role Badge Indicator */}
      {!collapsed && (
        <div className="px-4 py-2.5 border-b border-white/5 bg-navy-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${currentRoleInfo.color}`}>
                {currentRoleInfo.label}
              </span>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  isActive
                    ? item.accent
                      ? 'nav-link-active bg-cyan-500/10 text-cyan-300 font-semibold border border-cyan-500/20'
                      : 'nav-link-active bg-blue-500/10 text-blue-300 font-semibold'
                    : item.accent
                    ? 'text-cyan-400/80 hover:text-cyan-300 hover:bg-cyan-500/5 border border-cyan-500/10 hover:border-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                } ${collapsed ? 'justify-center px-2' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.accent && (
                <span className="ml-auto text-[8px] font-bold text-cyan-400/60 uppercase tracking-wider">AI</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info & Logout Footer */}
      <div className="p-3 border-t border-white/5 bg-navy-950/50">
        {!collapsed && (
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-300 font-bold text-xs shrink-0">
              {(user?.name || user?.username || 'U')[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-200 truncate">
                {user?.name || user?.username}
              </p>
              <p className="text-[10px] text-slate-500 font-mono truncate">
                {user?.roll_no || user?.email || user?.username}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-red-300 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 rounded-btn transition-colors ${
            collapsed ? 'p-2 justify-center' : ''
          }`}
          title="Sign Out"
        >
          <LogOut size={14} className="shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
