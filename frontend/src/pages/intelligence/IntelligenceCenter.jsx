import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Activity,
  Users,
  Building,
  BookOpen,
  Trophy,
  Zap,
  Sliders,
  CheckSquare,
  Cpu,
  RefreshCw,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { useIntelligenceData } from '../../hooks/useIntelligence';
import { OverviewTab } from '../../components/intelligence/OverviewTab';
import { StudentIntelligenceProfile } from '../../components/intelligence/StudentIntelligenceProfile';
import { TemporalAnalysisTab } from '../../components/intelligence/TemporalAnalysisTab';
import { WhatIfSimulator } from '../../components/intelligence/WhatIfSimulator';
import { InterventionsTab } from '../../components/intelligence/InterventionsTab';
import { ModelLabTab } from '../../components/intelligence/ModelLabTab';
import { Skeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';

export function IntelligenceCenter() {
  const {
    loading,
    error,
    overview,
    deptAnalytics,
    subjectAnalytics,
    topPerformers,
    marksDistribution,
    riskData,
    riskLoading,
    riskProgress,
    riskMetrics,
    refresh,
  } = useIntelligenceData();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'students' | 'temporal' | 'whatif' | 'interventions' | 'lab'
  const [targetStudentId, setTargetStudentId] = useState('STU0016');

  const navTabs = [
    { id: 'overview', label: 'Executive Overview', icon: Activity },
    { id: 'students', label: 'Student 360° Profile', icon: Users },
    { id: 'temporal', label: 'Temporal Analysis (W4-W12)', icon: Brain },
    { id: 'whatif', label: 'What-If Simulator', icon: Sliders },
    { id: 'interventions', label: 'Prioritized Interventions', icon: CheckSquare },
    { id: 'lab', label: 'Model Lab & Governance', icon: Cpu },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* ─── Top Global Tab Navigation Bar ──────────────────────────── */}
      <div className="bg-[#0B0F17]/90 border border-purple-500/20 rounded-2xl p-1.5 backdrop-blur-xl flex items-center justify-between gap-2 overflow-x-auto shadow-xl">
        <div className="flex items-center gap-1">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={refresh}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-colors shrink-0"
          title="Refresh Data"
        >
          <RefreshCw size={13} />
          <span className="hidden sm:inline">Sync</span>
        </button>
      </div>

      {/* ─── Active Tab Render ──────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <OverviewTab
              overview={overview}
              riskMetrics={riskMetrics}
              riskLoading={riskLoading}
              riskProgress={riskProgress}
              riskData={riskData}
              subjectAnalytics={subjectAnalytics}
              deptAnalytics={deptAnalytics}
              students={[]}
              marksDistribution={marksDistribution}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'students' && (
            <StudentIntelligenceProfile initialStudentId={targetStudentId} />
          )}

          {activeTab === 'temporal' && <TemporalAnalysisTab />}

          {activeTab === 'whatif' && (
            <div className="space-y-6">
              <div className="bg-[#0B0F17]/90 border border-purple-500/20 rounded-2xl p-4 backdrop-blur-xl flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Interactive What-If Simulation Sandbox</h3>
                  <p className="text-xs text-slate-400">
                    Testing counterfactual scenario for primary student: <strong className="text-purple-300 font-mono">{targetStudentId}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('students')}
                  className="px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-bold hover:bg-purple-600/30 transition-colors"
                >
                  Change Student
                </button>
              </div>
              <WhatIfSimulator
                studentId={targetStudentId}
                semesterNo={2}
                checkpoint="W12"
                baselineProbability={0.784}
                baselineCategory="HIGH"
              />
            </div>
          )}

          {activeTab === 'interventions' && (
            <InterventionsTab
              onSelectStudent={(sId) => {
                setTargetStudentId(sId);
                setActiveTab('students');
              }}
            />
          )}

          {activeTab === 'lab' && <ModelLabTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
export default IntelligenceCenter;
