import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Users,
  ShieldCheck,
  Award,
  CheckSquare,
  CreditCard,
  BookOpen,
  Layers,
  ArrowRight,
  Database,
  Server,
  Code2,
  Calendar,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Lock,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { TiltCard } from '../components/ui/TiltCard';
import { HeroIntelligenceCore3D } from '../components/3d/HeroIntelligenceCore3D';
import { FloatingDashboardPreview } from '../components/landing/FloatingDashboardPreview';
import { InteractiveWorkflowStory } from '../components/landing/InteractiveWorkflowStory';
import { FeatureShowcaseSection } from '../components/landing/FeatureShowcaseSection';

export function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  const handleEnterPlatform = () => {
    if (isAuthenticated) {
      if (role === 'STUDENT') navigate('/student/dashboard');
      else if (role === 'FACULTY') navigate('/faculty/dashboard');
      else navigate('/admin/dashboard');
    } else {
      navigate('/login');
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-blue-600/30 overflow-x-hidden font-sans relative">
      {/* Dynamic Background Depth Layers */}
      <div className="fixed inset-0 pointer-events-none -z-20">
        {/* Layer 1: Animated Radial Gradients */}
        <div className="absolute -top-40 left-1/4 w-[750px] h-[750px] bg-blue-600/10 rounded-full blur-[160px]" />
        <div className="absolute top-1/3 -right-20 w-[650px] h-[650px] bg-indigo-600/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 left-10 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[160px]" />

        {/* Layer 2: Subtle Architectural Grid Overlay */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
            backgroundSize: '36px 36px',
          }}
        />
      </div>

      {/* 1. TOP NAVIGATION HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-navy-950/70 border-b border-white/5 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
                <GraduationCap className="text-cyan-400" size={20} />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-lg text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 tracking-tight">
                EduInsight
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono uppercase tracking-widest text-cyan-400/80 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                Academic Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-300">
            <button
              onClick={() => scrollToSection('workflows')}
              className="hover:text-cyan-400 transition-colors"
            >
              Workflows
            </button>
            <button
              onClick={() => scrollToSection('capabilities')}
              className="hover:text-cyan-400 transition-colors"
            >
              Capabilities
            </button>
            <button
              onClick={() => scrollToSection('architecture')}
              className="hover:text-cyan-400 transition-colors"
            >
              Architecture
            </button>
            <button
              onClick={() => scrollToSection('schema')}
              className="hover:text-cyan-400 transition-colors"
            >
              DBMS Schema
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>PostgreSQL Active</span>
            </div>

            <Button
              onClick={handleEnterPlatform}
              variant="primary"
              size="sm"
              icon={ArrowRight}
            >
              {isAuthenticated ? 'Open Workspace' : 'Sign In'}
            </Button>
          </div>
        </div>
      </header>

      {/* 2. CINEMATIC HERO SECTION */}
      <section className="relative min-h-[calc(100vh-4.5rem)] flex items-center justify-center pt-8 pb-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Hero Column */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="lg:col-span-6 space-y-7 text-left z-10"
            >
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold tracking-wider uppercase">
                <Sparkles size={13} className="text-cyan-400 animate-pulse" />
                <span>INTELLIGENT ACADEMIC PLATFORM</span>
              </div>

              {/* Large Typographic Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                One intelligent platform.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300">
                  Every academic interaction.
                </span>
              </h1>

              {/* Supporting Narrative */}
              <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
                EduInsight unifies students, faculty, and administrators through a continuous relational engine — powering real-time attendance telemetry, examination schedules, continuous marks evaluation, automated transcripts, and verified institutional fee settlements.
              </p>

              {/* CTA Button Group */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  onClick={handleEnterPlatform}
                  variant="primary"
                  size="lg"
                  icon={ArrowRight}
                  className="shadow-xl shadow-blue-600/30 text-sm font-bold px-7"
                >
                  Enter EduInsight
                </Button>

                <Button
                  onClick={() => scrollToSection('workflows')}
                  variant="secondary"
                  size="lg"
                  className="text-sm font-semibold px-6 border-white/15 hover:bg-white/5"
                >
                  Explore Platform
                </Button>
              </div>

              {/* Trust Metrics Bar */}
              <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 max-w-lg text-left">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white font-mono">16</div>
                  <div className="text-[11px] text-slate-400 font-medium">PostgreSQL Tables</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">100%</div>
                  <div className="text-[11px] text-slate-400 font-medium">Real REST APIs</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">0.0</div>
                  <div className="text-[11px] text-slate-400 font-medium">Mock Data Reliance</div>
                </div>
              </div>
            </motion.div>

            {/* Right Hero Column: 3D Academic Intelligence Core & Floating Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="lg:col-span-6 relative flex items-center justify-center min-h-[480px] sm:min-h-[560px] lg:min-h-[620px]"
            >
              {/* Central 3D Canvas */}
              <HeroIntelligenceCore3D />

              {/* Layered Glass Floating Dashboard Mockup Panels */}
              <FloatingDashboardPreview />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. PLATFORM OVERVIEW: 3 LUXURY 3D TILT ROLE CARDS */}
      <section id="roles" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
              <Layers size={13} />
              <span>Multi-Role Academic Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Tailored workspaces for every stakeholder
            </h2>
            <p className="text-sm text-slate-400">
              Role-specific permissions with strict access control and real-time database synchronicity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Student Card */}
            <TiltCard className="p-7 bg-navy-900/60 backdrop-blur-xl border border-white/10 hover:border-blue-500/40 shadow-xl shadow-blue-950/40">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
                  <GraduationCap size={24} />
                </div>
                <Badge variant="blue">Student Portal</Badge>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">Student Workspace</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Personalized academic tracking with live attendance metrics, internal marks evaluations, semester grade memos, and digital fee ledgers.
              </p>

              <div className="space-y-2.5 pt-4 border-t border-white/5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckSquare size={14} className="text-cyan-400" />
                  <span>Session attendance with 75% threshold flags</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award size={14} className="text-blue-400" />
                  <span>Continuous assessment marks &amp; GPA stand</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard size={14} className="text-indigo-400" />
                  <span>Verified receipts &amp; semester fee clearance</span>
                </div>
              </div>
            </TiltCard>

            {/* Faculty Card */}
            <TiltCard className="p-7 bg-navy-900/60 backdrop-blur-xl border border-white/10 hover:border-indigo-500/40 shadow-xl shadow-indigo-950/40">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
                  <Users size={24} />
                </div>
                <Badge variant="purple">Faculty Portal</Badge>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">Faculty Workspace</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Instructional management with assigned teaching modules, classroom attendance recording, student rosters, and internal/external marks entry.
              </p>

              <div className="space-y-2.5 pt-4 border-t border-white/5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <BookOpen size={14} className="text-indigo-400" />
                  <span>Allocated subject syllabus &amp; teaching credits</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckSquare size={14} className="text-cyan-400" />
                  <span>Daily session recording with instant upsert</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award size={14} className="text-purple-400" />
                  <span>Marks evaluation entry &amp; grade assignments</span>
                </div>
              </div>
            </TiltCard>

            {/* Admin Card */}
            <TiltCard className="p-7 bg-navy-900/60 backdrop-blur-xl border border-white/10 hover:border-emerald-500/40 shadow-xl shadow-emerald-950/40">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
                  <ShieldCheck size={24} />
                </div>
                <Badge variant="green">Administrator</Badge>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">Institutional Admin</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Full-lifecycle governance across students, faculty, departments, degree catalogs, academic calendars, examination scheduling, and fee accounts.
              </p>

              <div className="space-y-2.5 pt-4 border-t border-white/5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <GraduationCap size={14} className="text-emerald-400" />
                  <span>Student &amp; faculty full CRUD lifecycle</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-teal-400" />
                  <span>University exam timetable management</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers size={14} className="text-cyan-400" />
                  <span>Degree courses, semesters &amp; curriculum setup</span>
                </div>
              </div>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* 4. PLATFORM STORY & CONNECTED WORKFLOW MESH */}
      <section id="workflows" className="py-20 relative bg-navy-950/40 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
              <Code2 size={13} />
              <span>Platform Story</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              One system. Every academic workflow.
            </h2>
            <p className="text-sm text-slate-400">
              Interactive visualization of data flow connecting all stakeholder roles to core relational academic engines.
            </p>
          </div>

          <InteractiveWorkflowStory />
        </div>
      </section>

      {/* 5. ALTERNATING FEATURE SHOWCASES */}
      <section id="capabilities" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
              <Sparkles size={13} />
              <span>Core Capabilities</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Engineered for academic precision
            </h2>
            <p className="text-sm text-slate-400">
              Explore the continuous assessment, session telemetry, and automated certification engines built into EduInsight.
            </p>
          </div>

          <FeatureShowcaseSection />
        </div>
      </section>

      {/* 6. RELATIONAL ARCHITECTURE & DBMS BLUEPRINT */}
      <section id="architecture" className="py-20 bg-navy-950/40 border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Server size={13} />
              <span>Full-Stack Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Built on strict 3-tier separation
            </h2>
            <p className="text-sm text-slate-400">
              Zero direct database queries from frontend. Pure REST API communication backed by PostgreSQL transaction safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-navy-900/60 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Code2 size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">React + Vite Frontend</h4>
                  <p className="text-[11px] text-slate-400">Port 3000 • Single-Page App</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Tailwind CSS, Three.js 3D intelligence core, Recharts data visualizers, Framer Motion transitions, and accessible custom form primitives.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-slate-300">Three.js</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-slate-300">Framer Motion</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-slate-300">Recharts</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-navy-900/60 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Server size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">Node.js Express API</h4>
                  <p className="text-[11px] text-slate-400">Port 5000 • 14 Endpoints</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                REST API router modules for Auth, Students, Faculty, Attendance, Marks, Results, Fees, Exams, Courses, and Semesters with error logging.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-slate-300">RESTful</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-slate-300">CORS</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-slate-300">pg Connection Pool</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-navy-900/60 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Database size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">PostgreSQL Database</h4>
                  <p className="text-[11px] text-slate-400">Port 5432 • EduInsight DB</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                16 relational tables with foreign key cascades, transaction isolation, mathematical checks, and automated grading boundaries.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-slate-300">ACID</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-slate-300">Foreign Keys</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-slate-300">Cascades</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. DBMS SCHEMA BLUEPRINT */}
      <section id="schema" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold">
              <Database size={13} />
              <span>Relational Integrity</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              16-Table Relational Schema Blueprint
            </h2>
            <p className="text-sm text-slate-400">
              Verified relational schema with exact constraints, cascades, and data types.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-navy-900/60 border border-white/10 backdrop-blur-xl">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: 'users', desc: 'Authentication credentials and RBAC roles' },
                { name: 'students', desc: 'Roll numbers, admissions and personal dossier' },
                { name: 'faculty', desc: 'Designations, qualifications and office records' },
                { name: 'departments', desc: 'Academic divisions and HOD allocations' },
                { name: 'courses', desc: 'Degree programs, credits and duration' },
                { name: 'semesters', desc: 'Term numbers, start/end dates and status' },
                { name: 'subjects', desc: 'LTP hours, credit points and syllabi' },
                { name: 'faculty_subjects', desc: 'Faculty teaching assignments by semester' },
                { name: 'enrollments', desc: 'Student semester course registration logs' },
                { name: 'attendance', desc: 'Session-wise attendance records' },
                { name: 'exams', desc: 'Assessment schedule and exam types' },
                { name: 'marks', desc: 'Internal (40) + External (60) evaluations' },
                { name: 'results', desc: 'SGPA/CGPA calculations and standing' },
                { name: 'fees', desc: 'Fee accounts, receipts and dues' },
                { name: 'audit_logs', desc: 'Security actions and administrative history' },
                { name: 'notifications', desc: 'Broadcast announcements and alerts' },
              ].map((table, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-navy-950/60 border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span className="font-mono text-xs font-bold text-slate-200">{table.name}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">{table.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. CINEMATIC CTA CALLOUT & FOOTER */}
      <section className="py-20 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <TiltCard className="p-10 sm:p-14 bg-gradient-to-tr from-blue-950/90 via-navy-900/90 to-indigo-950/90 border border-blue-500/30 rounded-3xl shadow-2xl shadow-blue-950/60 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold backdrop-blur-md">
                <Sparkles size={14} className="text-cyan-400" />
                <span>Next-Generation Academic Infrastructure</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Ready to experience modern academic intelligence?
              </h2>

              <p className="text-sm text-slate-300">
                Launch the workspace to interact with live PostgreSQL student records, real-time attendance telemetry, and continuous marks evaluations.
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
                <Button
                  onClick={handleEnterPlatform}
                  variant="primary"
                  size="lg"
                  icon={ArrowRight}
                  className="shadow-xl shadow-blue-600/40 text-sm font-bold px-8 py-3"
                >
                  Enter EduInsight Workspace
                </Button>
              </div>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-navy-950/90 py-10 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <GraduationCap className="text-cyan-400" size={18} />
            <span className="font-bold text-slate-200">EduInsight Academic Platform</span>
            <span className="text-slate-400">• PostgreSQL 16 Schema</span>
          </div>

          <p className="text-slate-400">
            Powered by React, Node.js Express &amp; PostgreSQL.
          </p>
        </div>
      </footer>
    </div>
  );
}
