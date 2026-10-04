import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Brain,
  Database,
  Cpu,
  Layers,
  Sparkles,
  ChevronRight,
  User,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '../ui/Badge';

export function Navbar({ setMobileOpen }) {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);

  const isAdmin = ['ADMIN', 'HOD', 'EXAM_CELL'].includes(role);
  const isFaculty = role === 'FACULTY';
  const isStudent = role === 'STUDENT';

  return (
    <header className="h-16 bg-[#0B0F17]/90 backdrop-blur-xl border-b border-purple-500/20 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-40 select-none shadow-2xl">
      {/* Left: Brand & Primary Navigation Tabs */}
      <div className="flex items-center gap-6">
        {/* Brand Logo */}
        <Link to="/intelligence" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform">
            <Brain size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm text-white tracking-tight">
                EduInsight<span className="text-purple-400">.AI</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                PRO
              </span>
            </div>
            <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400">
              Institutional Risk Platform
            </p>
          </div>
        </Link>

        {/* Global Primary Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-white/10 text-xs font-semibold">
          <Link
            to="/intelligence"
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              location.pathname.startsWith('/intelligence')
                ? 'bg-purple-500/15 text-purple-200 border border-purple-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
            }`}
          >
            <Sparkles size={13} className="text-purple-400" />
            <span>Risk Intelligence</span>
          </Link>

          {isAdmin && (
            <Link
              to="/admin/dashboard"
              className={`px-3 py-1.5 rounded-lg transition-all ${
                location.pathname.startsWith('/admin')
                  ? 'bg-blue-500/15 text-blue-200 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
              }`}
            >
              Admin Console
            </Link>
          )}

          {isFaculty && (
            <Link
              to="/faculty/dashboard"
              className={`px-3 py-1.5 rounded-lg transition-all ${
                location.pathname.startsWith('/faculty')
                  ? 'bg-blue-500/15 text-blue-200 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
              }`}
            >
              Faculty Portal
            </Link>
          )}

          {isStudent && (
            <Link
              to="/student/dashboard"
              className={`px-3 py-1.5 rounded-lg transition-all ${
                location.pathname.startsWith('/student')
                  ? 'bg-blue-500/15 text-blue-200 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
              }`}
            >
              Student Portal
            </Link>
          )}
        </nav>
      </div>

      {/* Right: Real-Time Status Indicators & User Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Status Indicators (Desktop) */}
        <div className="hidden lg:flex items-center gap-2">
          {/* PostgreSQL Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono">
            <Database size={11} />
            <span>PostgreSQL: Live</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* FastAPI ML Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-mono">
            <Cpu size={11} />
            <span>FastAPI ML: Connected</span>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          </div>

          {/* Active Semester Pill */}
          <div className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-slate-300 font-bold">
            Sem 2
          </div>
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-white/5 transition-colors focus:outline-none"
            aria-expanded={profileOpen}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
              {(user?.name || user?.username || 'U')[0].toUpperCase()}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-slate-200 leading-tight">
                {user?.name || user?.username}
              </p>
              <p className="text-[10px] text-purple-300 font-mono">
                {role}
              </p>
            </div>
          </button>

          {/* Dropdown Menu */}
          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setProfileOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-60 bg-[#0B0F17] border border-purple-500/20 rounded-2xl shadow-2xl z-50 py-2 animate-fade-in backdrop-blur-2xl">
                <div className="px-4 py-2.5 border-b border-white/5">
                  <p className="text-xs font-bold text-white truncate">
                    {user?.name || user?.username}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                    {user?.email || user?.roll_no || role}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {role}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      EduInsight Authorized
                    </span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    className="w-full px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors font-semibold"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
