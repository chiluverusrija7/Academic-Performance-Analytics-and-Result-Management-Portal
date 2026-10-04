import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Check, GraduationCap, X } from 'lucide-react';
import { Badge } from './Badge';

export function StudentCombobox({
  students = [],
  value,
  onChange,
  label = 'Select Student',
  placeholder = 'Search by name, roll no, or department...',
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedStudent = students.find((s) => String(s.student_id) === String(value));

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus search input when opening
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const filteredStudents = students.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const fullName = `${s.first_name || ''} ${s.middle_name || ''} ${s.last_name || ''}`.toLowerCase();
    const rollNo = (s.roll_no || '').toLowerCase();
    const regNo = (s.reg_no || '').toLowerCase();
    const dept = (s.dept_code || s.dept_name || '').toLowerCase();
    const course = (s.course_name || s.course_code || '').toLowerCase();
    return (
      fullName.includes(q) ||
      rollNo.includes(q) ||
      regNo.includes(q) ||
      dept.includes(q) ||
      course.includes(q)
    );
  });

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 bg-[#0b121e] hover:bg-[#0f172a] text-slate-100 border border-slate-700/80 hover:border-blue-500/60 rounded-xl text-left shadow-inner transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {selectedStudent ? (
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-300 font-bold text-xs shrink-0 font-mono">
              {selectedStudent.first_name?.[0]?.toUpperCase() || 'S'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-blue-400 text-xs sm:text-sm">
                  {selectedStudent.roll_no}
                </span>
                <span className="text-slate-100 font-semibold text-xs sm:text-sm truncate">
                  {selectedStudent.first_name} {selectedStudent.last_name}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                Sem {selectedStudent.current_semester || 1} (Sec {selectedStudent.section || 'A'}) • {selectedStudent.dept_code || 'CSE'}
              </p>
            </div>
          </div>
        ) : (
          <span className="text-slate-400 text-xs sm:text-sm">{placeholder}</span>
        )}

        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-400' : ''}`}
        />
      </button>

      {/* Combobox Dropdown Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-50 left-0 right-0 mt-2 bg-[#0c1424] border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden p-2 flex flex-col max-h-80"
          >
            {/* Search Input Box */}
            <div className="relative mb-2 shrink-0">
              <Search size={14} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-9 pr-8 py-2 bg-[#070c16] border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* List of Students */}
            <div className="overflow-y-auto space-y-1 pr-1 flex-1 scrollbar-thin scrollbar-thumb-blue-600/40">
              {filteredStudents.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 italic">
                  No matching student records found.
                </div>
              ) : (
                filteredStudents.map((stu) => {
                  const isSelected = String(stu.student_id) === String(value);
                  return (
                    <button
                      key={stu.student_id}
                      type="button"
                      onClick={() => {
                        onChange(stu.student_id);
                        setIsOpen(false);
                        setSearch('');
                      }}
                      className={`w-full flex items-center justify-between gap-3 p-2.5 rounded-xl text-left transition-all border ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500/40 shadow-sm'
                          : 'bg-[#0a101d]/60 hover:bg-[#111c30] border-transparent hover:border-slate-700/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {stu.first_name?.[0]?.toUpperCase() || 'S'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-blue-400 text-xs">
                              {stu.roll_no}
                            </span>
                            <span className="text-slate-100 font-semibold text-xs truncate">
                              {stu.first_name} {stu.middle_name || ''} {stu.last_name || ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400 truncate">
                            <span>Sem {stu.current_semester || 1} (Sec {stu.section || 'A'})</span>
                            <span>•</span>
                            <span className="text-slate-300">{stu.dept_code || stu.course_code || 'CSE'}</span>
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="shrink-0 p-1 rounded-full bg-blue-500 text-white">
                          <Check size={12} />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
