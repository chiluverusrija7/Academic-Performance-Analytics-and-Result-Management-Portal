import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Mail,
  MapPin,
  BookOpen,
  GraduationCap,
  Clock,
  Send,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api';

export function MyFacultySection({ timetableData, marksData = [], enrolledSubjects = [] }) {
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function resolveFaculty() {
      const map = {};

      // 1. From Timetable
      if (timetableData?.timetable && Array.isArray(timetableData.timetable)) {
        timetableData.timetable.forEach((tt) => {
          if (tt.faculty_first_name || tt.faculty_id) {
            const name = `Prof. ${tt.faculty_first_name} ${tt.faculty_last_name || ''}`.trim();
            if (!map[name]) {
              map[name] = {
                name,
                email: tt.faculty_email || `${tt.faculty_first_name?.toLowerCase()}.${tt.faculty_last_name?.toLowerCase()}@eduinsight.edu`,
                department: tt.faculty_dept || 'Computer Science & AI',
                room: tt.room_number || 'Cabin B-204',
                subjects: [tt.subject_name || tt.subject_code],
              };
            } else {
              const subName = tt.subject_name || tt.subject_code;
              if (subName && !map[name].subjects.includes(subName)) {
                map[name].subjects.push(subName);
              }
            }
          }
        });
      }

      // 2. From Marks
      if (marksData && Array.isArray(marksData)) {
        marksData.forEach((m) => {
          if (m.faculty_first_name) {
            const name = `Prof. ${m.faculty_first_name} ${m.faculty_last_name || ''}`.trim();
            if (!map[name]) {
              map[name] = {
                name,
                email: `${m.faculty_first_name.toLowerCase()}.${(m.faculty_last_name || 'faculty').toLowerCase()}@eduinsight.edu`,
                department: 'Computer Science & AI',
                room: 'Cabin A-102',
                subjects: [m.subject_name || m.subject_code],
              };
            } else {
              const subName = m.subject_name || m.subject_code;
              if (subName && !map[name].subjects.includes(subName)) {
                map[name].subjects.push(subName);
              }
            }
          }
        });
      }

      // 3. Fallback: If map has < 3 faculty, query backend /api/faculty
      if (Object.keys(map).length < 3) {
        try {
          const facRes = await api.getFacultyList({ limit: 6 });
          if (facRes.success && Array.isArray(facRes.data)) {
            facRes.data.slice(0, 4).forEach((f) => {
              const name = `Prof. ${f.first_name} ${f.last_name || ''}`.trim();
              if (!map[name]) {
                map[name] = {
                  name,
                  email: f.email || `${f.first_name.toLowerCase()}@eduinsight.edu`,
                  department: f.dept_name || 'Computer Science & AI',
                  room: f.room_number || 'Academic Block B',
                  subjects: [f.specialization || 'Core Coursework'],
                };
              }
            });
          }
        } catch (e) {
          console.warn('Faculty list API fallback:', e);
        }
      }

      setFacultyList(Object.values(map));
      setLoading(false);
    }

    resolveFaculty();
  }, [timetableData, marksData, enrolledSubjects]);

  return (
    <div className="bg-[#0B0F17]/90 border border-purple-500/20 rounded-2xl p-5 md:p-6 backdrop-blur-xl shadow-2xl space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Users size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-white tracking-tight">
              My Course Instructors &amp; Mentors
            </h3>
            <p className="text-xs text-slate-400">
              Assigned faculty mentors and subject instructors for Semester 2
            </p>
          </div>
        </div>
        <span className="text-xs font-mono text-purple-300">
          {facultyList.length} Instructors Connected
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {facultyList.map((fac, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -2 }}
            className="p-4 rounded-xl bg-black/40 border border-white/5 hover:border-indigo-500/30 transition-all space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-md shrink-0">
                {fac.name.replace('Prof.', '').trim().split(' ').map((n) => n[0]).join('').substring(0, 2)}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white truncate">{fac.name}</h4>
                <p className="text-[11px] text-slate-400 truncate">{fac.department}</p>
              </div>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-300 font-mono pt-2 border-t border-white/5">
              <div className="flex items-center gap-2 text-slate-400">
                <BookOpen size={12} className="text-purple-400 shrink-0" />
                <span className="truncate text-white">{fac.subjects.join(', ')}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin size={12} className="text-cyan-400 shrink-0" />
                <span>{fac.room}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Mail size={12} className="text-indigo-400 shrink-0" />
                <a href={`mailto:${fac.email}`} className="text-purple-300 hover:underline truncate">
                  {fac.email}
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
