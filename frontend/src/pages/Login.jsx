import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { ErrorAlert } from '../components/ui/States';
import { useToast } from '../context/ToastContext';
import { LoginSphere3D } from '../components/3d/LoginSphere3D';
import {
  ShieldCheck,
  UserCheck,
  GraduationCap,
  Lock,
  ArrowRight,
  Database,
  Eye,
  EyeOff,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Award,
  Calendar,
  Layers,
  Users,
} from 'lucide-react';
import { motion } from 'framer-motion';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!username.trim() || !password.trim()) {
      setLocalError('Please enter both username and password.');
      triggerShake();
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await login(username, password);
      if (res.success) {
        setLoginSuccess(true);
        toast.success(`Welcome back, ${res.user.name || res.user.username}!`, 'Authentication Verified');

        // Smooth delay for successful transition
        setTimeout(() => {
          const userRole = res.user.role;
          if (userRole === 'STUDENT') {
            navigate('/student/dashboard');
          } else if (userRole === 'FACULTY') {
            navigate('/faculty/dashboard');
          } else {
            navigate('/admin/dashboard');
          }
        }, 600);
      } else {
        setIsSubmitting(false);
        setLocalError(res.message || 'Authentication failed. Please verify credentials in PostgreSQL.');
        triggerShake();
        toast.error(res.message || 'Invalid credentials provided', 'Authentication Error');
      }
    } catch (err) {
      setIsSubmitting(false);
      setLocalError('Server connection error. Ensure Express API is online.');
      triggerShake();
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const fillCredentials = (u, p) => {
    setUsername(u);
    setPassword(p);
    setLocalError('');
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-between selection:bg-blue-600/30 font-sans relative overflow-hidden">
      {/* Ambient background depth lights */}
      <div className="fixed inset-0 pointer-events-none -z-20">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-10 w-[550px] h-[550px] bg-indigo-600/10 rounded-full blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Header Bar */}
      <header className="p-4 sm:p-6 flex items-center justify-between max-w-7xl mx-auto w-full z-10">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
              <GraduationCap className="text-cyan-400" size={18} />
            </div>
          </div>
          <span className="font-extrabold text-base text-slate-100 tracking-tight">
            EduInsight
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-navy-900/60 border border-white/10 text-slate-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">PostgreSQL 16 Connected</span>
            <span className="sm:hidden">DB Online</span>
          </div>

          <Link
            to="/landing"
            className="text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
          >
            Overview
          </Link>
        </div>
      </header>

      {/* Main Split-Screen Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 z-10">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: 3D Academic Intelligence Sphere & Product Highlights */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="lg:col-span-6 hidden lg:flex flex-col items-center justify-center space-y-6 text-center"
          >
            {/* 3D Sphere Scene */}
            <div className="w-full relative flex items-center justify-center">
              <LoginSphere3D />
              
              {/* Floating Translucent Metrics Badge */}
              <div className="absolute -bottom-2 left-6 p-3 rounded-2xl bg-navy-900/80 backdrop-blur-xl border border-white/10 shadow-xl shadow-blue-950/60 flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-200">Role-Based Access Control</p>
                  <p className="text-[9px] text-slate-400">PostgreSQL Session Auth</p>
                </div>
              </div>

              <div className="absolute -top-2 right-6 p-3 rounded-2xl bg-navy-900/80 backdrop-blur-xl border border-white/10 shadow-xl shadow-indigo-950/60 flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Sparkles size={16} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-200">Continuous Assessment</p>
                  <p className="text-[9px] text-slate-400">Real-time Telemetry</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 max-w-md">
              <h2 className="text-xl font-bold text-white">
                Next-Generation Academic Infrastructure
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect seamlessly to your institutional records, continuous assessment evaluations, attendance indices, and degree milestones.
              </p>
            </div>
          </motion.div>

          {/* Right Column: Premium SaaS Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
              x: shake ? [0, -10, 10, -8, 8, -4, 4, 0] : 0,
            }}
            transition={{
              duration: shake ? 0.4 : 0.6,
              ease: 'easeOut',
            }}
            className="lg:col-span-6 w-full max-w-md mx-auto"
          >
            <div className="p-8 sm:p-10 rounded-3xl bg-navy-900/80 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-blue-950/50 relative overflow-hidden">
              {/* Inner ambient glow */}
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Card Header */}
              <div className="mb-6 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Lock size={15} />
                  </div>
                  <h1 className="text-2xl font-black text-white tracking-tight">
                    Welcome back.
                  </h1>
                </div>
                <p className="text-xs text-slate-400">
                  Continue to your academic workspace with institutional credentials.
                </p>
              </div>

              {/* Error Alert with subtle shake */}
              {localError && (
                <div className="mb-4">
                  <ErrorAlert message={localError} />
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username / Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Username / Academic ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserCheck size={16} />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 101 or 999"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isSubmitting || loginSuccess}
                      className="w-full pl-10 pr-4 py-2.5 bg-navy-950/80 border border-white/10 rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isSubmitting || loginSuccess}
                      className="w-full pl-10 pr-11 py-2.5 bg-navy-950/80 border border-white/10 rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Sign In CTA Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    loading={isSubmitting}
                    disabled={loginSuccess}
                    icon={loginSuccess ? CheckCircle2 : ArrowRight}
                    className="w-full py-3 shadow-lg shadow-blue-600/30 font-bold text-sm"
                  >
                    {loginSuccess ? 'Verified — Opening Workspace...' : 'Sign In to Workspace'}
                  </Button>
                </div>
              </form>

              {/* Quick Role Demonstration Access */}
              <div className="mt-6 pt-5 border-t border-white/10">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
                  Quick Demo Credentials
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => fillCredentials('23CSE001', 'password')}
                    className="p-2 rounded-xl bg-navy-950/80 border border-white/5 hover:border-blue-500/40 hover:bg-navy-950 transition-all text-center group"
                  >
                    <div className="text-[11px] font-bold text-slate-200 group-hover:text-cyan-400 flex items-center justify-center gap-1">
                      <GraduationCap size={12} /> Student
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">23CSE001</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillCredentials('faculty01', 'password')}
                    className="p-2 rounded-xl bg-navy-950/80 border border-white/5 hover:border-indigo-500/40 hover:bg-navy-950 transition-all text-center group"
                  >
                    <div className="text-[11px] font-bold text-slate-200 group-hover:text-indigo-400 flex items-center justify-center gap-1">
                      <Users size={12} /> Faculty
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">faculty01</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillCredentials('admin', 'admin123')}
                    className="p-2 rounded-xl bg-navy-950/80 border border-white/5 hover:border-emerald-500/40 hover:bg-navy-950 transition-all text-center group"
                  >
                    <div className="text-[11px] font-bold text-slate-200 group-hover:text-emerald-400 flex items-center justify-center gap-1">
                      <ShieldCheck size={12} /> Admin
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">admin</div>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 sm:p-6 text-center text-xs text-slate-400 z-10 border-t border-white/5">
        <p>
          EduInsight University Intelligence Platform • Relational PostgreSQL Database Engine
        </p>
      </footer>
    </div>
  );
}
