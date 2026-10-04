import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  Award,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api';

export function UpcomingAssessmentsSection() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExams() {
      try {
        const res = await api.getExams();
        if (res.success && res.data) {
          setExams(res.data);
        }
      } catch (err) {
        console.warn('Exams fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadExams();
  }, []);

  const sampleAssessments = exams.length > 0 ? exams.slice(0, 4) : [
    {
      exam_id: 1,
      exam_name: 'Mid-2 Continuous Internal Assessment',
      exam_type: 'INTERNAL',
      subject_name: 'Database Management Systems',
      exam_start_date: '2026-10-18',
      room_number: 'Hall C-105',
      time: '10:00 AM - 12:00 PM',
      days_left: 14,
    },
    {
      exam_id: 2,
      exam_name: 'Lab Practical Evaluation & Viva',
      exam_type: 'PRACTICAL',
      subject_name: 'Computer Networks Lab',
      exam_start_date: '2026-10-24',
      room_number: 'Lab 2',
      time: '02:00 PM - 05:00 PM',
      days_left: 20,
    },
    {
      exam_id: 3,
      exam_name: 'End-Semester Theory Examination',
      exam_type: 'SEMESTER_END',
      subject_name: 'Operating Systems & System Architecture',
      exam_start_date: '2026-11-12',
      room_number: 'Exam Center Hall 1',
      time: '09:30 AM - 12:30 PM',
      days_left: 39,
    },
  ];

  return (
    <div className="bg-[#0B0F17]/90 border border-purple-500/20 rounded-2xl p-5 md:p-6 backdrop-blur-xl shadow-2xl space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Calendar size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-white tracking-tight">
              Upcoming Assessments &amp; Exam Schedule
            </h3>
            <p className="text-xs text-slate-400">
              Institutional academic calendar and examination countdowns
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {sampleAssessments.map((ex) => (
          <div
            key={ex.exam_id}
            className="p-4 rounded-xl bg-black/40 border border-white/5 hover:border-amber-500/30 transition-all space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                {ex.exam_type || 'Internal'}
              </span>
              <span className="text-xs font-mono font-bold text-cyan-400">
                {ex.days_left ? `${ex.days_left} Days Left` : 'Scheduled'}
              </span>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white">{ex.exam_name}</h4>
              <p className="text-[11px] text-purple-300 font-mono mt-0.5">{ex.subject_name || 'All Enrolled Subjects'}</p>
            </div>

            <div className="pt-2 border-t border-white/5 space-y-1 text-[11px] text-slate-400 font-mono">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {ex.time || '10:00 AM'}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={11} className="text-cyan-400" />
                  {ex.room_number || 'Room TBD'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
