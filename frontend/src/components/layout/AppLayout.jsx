import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { useAuth } from '../../context/AuthContext';

export function AppLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#070B12] text-slate-100 selection:bg-purple-500/30 selection:text-white flex flex-col font-sans relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-purple-900/10 blur-[140px] rounded-full" />
        <div className="absolute top-1/3 -left-40 w-[600px] h-[600px] bg-blue-900/5 blur-[160px] rounded-full" />
        <div className="absolute bottom-10 right-0 w-[500px] h-[500px] bg-indigo-900/5 blur-[140px] rounded-full" />
      </div>

      {/* Top Glass Navigation Bar */}
      <Navbar />

      {/* Main Content Area (Full width container with responsive margins) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10 animate-fade-in">
        <Outlet />
      </main>

      {/* Futuristic subtle footer bar */}
      <footer className="w-full border-t border-white/5 py-4 px-6 text-center text-[11px] text-slate-500 font-mono relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>EduInsight AI • Operational Multi-Milestone Risk System</span>
        </div>
        <div>
          <span>TreeSHAP Attributions • Split Conformal Prediction • Prescriptive Triage</span>
        </div>
      </footer>
    </div>
  );
}
