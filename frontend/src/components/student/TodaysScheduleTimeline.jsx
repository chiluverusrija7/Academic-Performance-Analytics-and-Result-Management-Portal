import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Calendar,
  MapPin,
  User,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { api } from '../../services/api';

export function TodaysScheduleTimeline({ studentId }) {
  const [viewMode, setViewMode] = useState('day'); // 'day' | 'week'
  const [timetableData, setTimetableData] = useState(null);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSchedule() {
      if (!studentId) return;
      try {
        const [ttRes, todayRes, upRes] = await Promise.all([
          api.getTimetable(studentId),
          api.getTodaySchedule(studentId),
          api.getUpcomingClasses(studentId),
        ]);

        if (ttRes.success) setTimetableData(ttRes);
        if (todayRes.success) setTodaySchedule(todayRes.classes || []);
        if (upRes.success) setUpcomingClasses(upRes.upcoming || []);
      } catch (err) {
        console.warn('Schedule fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSchedule();
  }, [studentId]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = dayNames[new Date().getDay()];
  const currentTime = new Date().toTimeString().substring(0, 5);

  const nextClass = upcomingClasses.length > 0 ? upcomingClasses[0] : null;

  return (
    <div className="bg-[#0B0F17]/90 border border-purple-500/20 rounded-2xl p-5 md:p-6 backdrop-blur-xl shadow-2xl space-y-5">
      {/* Header with Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Clock size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-white tracking-tight">
              Class Schedule &amp; Timetable
            </h3>
            <p className="text-xs text-slate-400">
              Today is <strong>{todayName}</strong> • Real-time classroom and lecture timings
            </p>
          </div>
        </div>

        {/* Day / Week Switcher */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 text-xs font-mono">
          <button
            onClick={() => setViewMode('day')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              viewMode === 'day'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Today's Schedule
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              viewMode === 'week'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Weekly Grid
          </button>
        </div>
      </div>

      {/* Next Class Quick Action Banner */}
      {nextClass && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-black/50 border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase font-bold text-purple-300 px-2 py-0.5 rounded bg-purple-500/20">
                  {nextClass.timing_label || 'Next Up'}
                </span>
                <span className="text-xs font-bold text-white">
                  {nextClass.start_time?.substring(0, 5)} - {nextClass.end_time?.substring(0, 5)}
                </span>
              </div>
              <h4 className="text-sm font-black text-white mt-0.5">
                {nextClass.subject_code} — {nextClass.subject_name}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
            <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
              <MapPin size={13} className="text-cyan-400" />
              Room: <strong className="text-white">{nextClass.room_number || 'A-101'}</strong>
            </span>
            <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
              <User size={13} className="text-purple-400" />
              Prof. <strong className="text-white">{nextClass.faculty_last_name || 'Faculty'}</strong>
            </span>
          </div>
        </div>
      )}

      {/* View Mode: Day View (Timeline) */}
      {viewMode === 'day' && (
        <div className="space-y-3">
          {todaySchedule.length === 0 ? (
            <div className="p-8 rounded-xl bg-black/30 border border-white/5 text-center space-y-2">
              <Calendar size={24} className="text-slate-500 mx-auto" />
              <p className="text-xs font-bold text-slate-300">No more lectures scheduled for today ({todayName}).</p>
              <p className="text-[11px] text-slate-500">Check the Weekly Grid tab for your upcoming semester timetable.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todaySchedule.map((cls, idx) => {
                const isCompleted = cls.end_time < currentTime;
                const isCurrent = cls.start_time <= currentTime && cls.end_time >= currentTime;

                return (
                  <div
                    key={cls.timetable_id || idx}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isCurrent
                        ? 'bg-purple-950/40 border-purple-500/50 shadow-lg shadow-purple-500/10'
                        : isCompleted
                        ? 'bg-black/20 border-white/5 opacity-60'
                        : 'bg-black/40 border-white/5 hover:border-purple-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-center font-mono w-20 shrink-0">
                        <span className="text-xs font-black text-white block">
                          {cls.start_time?.substring(0, 5)}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {cls.end_time?.substring(0, 5)}
                        </span>
                      </div>

                      <div className="w-px h-8 bg-white/10 shrink-0 hidden sm:block" />

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white font-mono">
                            {cls.subject_code}
                          </span>
                          <span className="text-xs font-semibold text-slate-200">
                            {cls.subject_name}
                          </span>
                          {cls.is_lab && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">
                              LAB
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <MapPin size={11} className="text-cyan-400" />
                            {cls.room_number || 'Room TBD'}
                          </span>
                          <span className="flex items-center gap-1">
                            <User size={11} className="text-purple-400" />
                            {cls.faculty_first_name} {cls.faculty_last_name}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      {isCurrent ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                          CURRENT CLASS
                        </span>
                      ) : isCompleted ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono text-slate-500 bg-white/5">
                          COMPLETED
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono text-purple-300 bg-purple-500/10 border border-purple-500/20">
                          UPCOMING
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* View Mode: Week View (Grid) */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {daysOfWeek.map((day) => {
            const dayClasses = timetableData?.by_day?.[day] || [];
            const isToday = day === todayName;

            return (
              <div
                key={day}
                className={`p-3.5 rounded-xl border ${
                  isToday
                    ? 'bg-purple-950/20 border-purple-500/40 shadow-sm'
                    : 'bg-black/40 border-white/5'
                }`}
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
                  <h5 className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                    {day}
                    {isToday && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-300">
                        Today
                      </span>
                    )}
                  </h5>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {dayClasses.length} {dayClasses.length === 1 ? 'Slot' : 'Slots'}
                  </span>
                </div>

                {dayClasses.length === 0 ? (
                  <p className="text-[11px] text-slate-600 py-3 text-center">No classes scheduled</p>
                ) : (
                  <div className="space-y-2">
                    {dayClasses.map((cls) => (
                      <div key={cls.timetable_id} className="p-2 rounded-lg bg-white/[0.02] border border-white/5 text-xs">
                        <div className="flex justify-between font-mono font-bold text-white">
                          <span>{cls.subject_code}</span>
                          <span className="text-cyan-400 text-[10px]">{cls.start_time?.substring(0, 5)}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{cls.subject_name}</p>
                        <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                          <span>{cls.room_number || 'Room TBD'}</span>
                          <span>Prof. {cls.faculty_last_name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
