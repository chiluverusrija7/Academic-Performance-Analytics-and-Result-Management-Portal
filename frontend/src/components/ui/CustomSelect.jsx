import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Select an option...',
  className = '',
  buttonClassName = '',
  disabled = false,
  name,
  id,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      const currentIndex = options.findIndex((opt) => String(opt.value) === String(value));
      if (currentIndex < options.length - 1) {
        onChange({ target: { name, value: options[currentIndex + 1].value } });
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      const currentIndex = options.findIndex((opt) => String(opt.value) === String(value));
      if (currentIndex > 0) {
        onChange({ target: { name, value: options[currentIndex - 1].value } });
      }
    }
  };

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 bg-[#0b121e] hover:bg-[#0f172a] text-slate-100 border border-slate-700/80 hover:border-blue-500/60 rounded-xl text-xs sm:text-sm font-medium transition-all shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-left ${buttonClassName}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={`truncate ${selectedOption ? 'text-slate-100 font-medium' : 'text-slate-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-400' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-50 left-0 right-0 mt-1.5 max-h-60 overflow-y-auto bg-[#0d1626] border border-slate-700 rounded-xl shadow-2xl p-1.5 scrollbar-thin scrollbar-thumb-blue-600/40"
            role="listbox"
          >
            {options.length === 0 ? (
              <div className="px-3 py-2.5 text-xs text-slate-400 text-center italic">
                No options available
              </div>
            ) : (
              options.map((option) => {
                const isSelected = String(option.value) === String(value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange({ target: { name, value: option.value } });
                      setIsOpen(false);
                    }}
                    role="option"
                    aria-selected={isSelected}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm text-left transition-colors font-medium ${
                      isSelected
                        ? 'bg-blue-600/25 text-blue-300 font-semibold'
                        : 'text-slate-200 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && <Check size={14} className="shrink-0 text-blue-400" />}
                  </button>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
