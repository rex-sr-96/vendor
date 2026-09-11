import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  RotateCcw,
  Clock,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { haptics } from '../utils/haptics';

export interface DateMonthPickerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  themeColor?: 'orange' | 'green' | 'black';
  mode?: 'date' | 'month' | 'year'; // Date, Month, or Year
  showModeTabs?: boolean;
  activeSelection: string;
  onSelect: (value: string) => void;
  availableDates?: (string | { label: string; value: string })[];
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const DateMonthPickerSheet: React.FC<DateMonthPickerSheetProps> = ({
  isOpen,
  onClose,
  title,
  themeColor = 'orange',
  mode: initialMode = 'date',
  showModeTabs = true,
  activeSelection,
  onSelect,
  availableDates = [],
}) => {
  const [activeTab, setActiveTab] = useState<'date' | 'month' | 'year'>(
    initialMode === 'year' ? 'year' : initialMode === 'month' ? 'month' : 'date'
  );
  const [viewYear, setViewYear] = useState<number>(2026);
  const [viewMonth, setViewMonth] = useState<number>(7); // 7 is August (0-indexed)
  const [decadeStart, setDecadeStart] = useState<number>(2020);

  if (!isOpen) return null;

  const accentColorClass =
    themeColor === 'green'
      ? 'bg-[#16A34A] text-white hover:bg-[#268c59]'
      : 'bg-[#F94001] text-white hover:bg-[#e5591e]';

  const accentBgLightClass =
    themeColor === 'green'
      ? 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/30'
      : 'bg-[#F94001]/10 text-[#F94001] border-[#F94001]/30';

  const dotColorClass =
    themeColor === 'green'
      ? 'bg-[#16A34A]'
      : 'bg-[#F94001]';

  // Date Mode calculations
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const handlePrevMonth = () => {
    haptics.tap();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    haptics.tap();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    haptics.tap();
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const formatted = `${dayStr} ${MONTH_SHORT[viewMonth]} ${viewYear}`;
    onSelect(formatted);
    onClose();
  };

  const handleSelectMonth = (mIndex: number) => {
    haptics.tap();
    const formatted = `${MONTH_SHORT[mIndex]} ${viewYear}`;
    onSelect(formatted);
    onClose();
  };

  const handleSelectYear = (yr: number) => {
    haptics.tap();
    onSelect(`${yr}`);
    onClose();
  };

  const handleSelectPreset = (val: string) => {
    haptics.tap();
    onSelect(val);
    onClose();
  };

  const tabsList: { tab: 'date' | 'month' | 'year'; label: string }[] =
    initialMode === 'date'
      ? [
          { tab: 'date', label: 'Date' },
          { tab: 'month', label: 'Month' },
          { tab: 'year', label: 'Year' },
        ]
      : [
          { tab: 'month', label: 'Month' },
          { tab: 'year', label: 'Year' },
        ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            haptics.tap();
            onClose();
          }}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal / Bottom Sheet */}
        <motion.div
          initial={{ y: '100%', opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full md:max-w-md md:rounded-3xl bg-white rounded-t-3xl p-5 pb-7 shadow-2xl border border-[#E5E7EB] max-h-[92vh] overflow-y-auto no-scrollbar z-10"
        >
          {/* Sheet Grab Handle for mobile */}
          <div className="w-10 h-1 bg-[#E5E7EB] rounded-full mx-auto mb-3.5 md:hidden" />

          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F4]">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accentBgLightClass}`}>
                <CalendarIcon className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="text-[16px] font-black text-[#021526] tracking-tight">
                  {title}
                </h2>
                <p className="text-[11px] text-[#5F6368] font-medium">
                  Active selection:{' '}
                  <span className="font-bold text-[#021526]">
                    {activeSelection}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                haptics.tap();
                onClose();
              }}
              className="w-7 h-7 rounded-full bg-[#F3F4F4] flex items-center justify-center text-[#5F6368] hover:text-[#021526] active-press cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mode Switcher: Date vs Month vs Year */}
          {showModeTabs && (
            <div className="pt-3 pb-2">
              <div className="flex items-center bg-[#F3F4F4] p-1 rounded-xl border border-[#E5E7EB]">
                {tabsList.map(({ tab, label }) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => {
                        haptics.tap();
                        setActiveTab(tab);
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-[12px] font-bold transition-all active-press cursor-pointer flex items-center justify-center gap-1.5 ${
                        isActive
                          ? 'bg-[#F94001] text-white shadow-sm shadow-[#F94001]/20'
                          : 'text-[#5F6368] hover:text-[#021526]'
                      }`}
                    >
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Presets Bar */}
          <div className="pt-1 pb-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {activeTab === 'year' ? (
              <>
                <button
                  onClick={() => handleSelectPreset('2026')}
                  className={`px-3 py-1.5 rounded-xl text-[11.5px] font-bold shrink-0 border transition-all active-press cursor-pointer ${
                    activeSelection === '2026'
                      ? 'bg-[#F94001] text-white border-[#F94001] shadow-sm shadow-[#F94001]/20'
                      : 'bg-[#F3F4F4] border-[#E5E7EB] text-[#021526] hover:bg-[#F3F4F4]'
                  }`}
                >
                  2026 (Current FY)
                </button>
                <button
                  onClick={() => handleSelectPreset('2025')}
                  className={`px-3 py-1.5 rounded-xl text-[11.5px] font-bold shrink-0 border transition-all active-press cursor-pointer ${
                    activeSelection === '2025'
                      ? 'bg-[#F94001] text-white border-[#F94001] shadow-sm shadow-[#F94001]/20'
                      : 'bg-[#F3F4F4] border-[#E5E7EB] text-[#021526] hover:bg-[#F3F4F4]'
                  }`}
                >
                  2025 (FY 24-25)
                </button>
                <button
                  onClick={() => handleSelectPreset('2024')}
                  className={`px-3 py-1.5 rounded-xl text-[11.5px] font-bold shrink-0 border transition-all active-press cursor-pointer ${
                    activeSelection === '2024'
                      ? 'bg-[#F94001] text-white border-[#F94001] shadow-sm shadow-[#F94001]/20'
                      : 'bg-[#F3F4F4] border-[#E5E7EB] text-[#021526] hover:bg-[#F3F4F4]'
                  }`}
                >
                  2024
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleSelectPreset('28 Aug 2026')}
                  className={`px-3 py-1.5 rounded-xl text-[11.5px] font-bold shrink-0 border transition-all active-press cursor-pointer ${
                    activeSelection.includes('28 Aug')
                      ? 'bg-[#F94001] text-white border-[#F94001] shadow-sm shadow-[#F94001]/20'
                      : 'bg-[#F3F4F4] border-[#E5E7EB] text-[#021526] hover:bg-[#F3F4F4]'
                  }`}
                >
                  Today (28 Aug)
                </button>
                <button
                  onClick={() => handleSelectPreset('29 Aug 2026')}
                  className={`px-3 py-1.5 rounded-xl text-[11.5px] font-bold shrink-0 border transition-all active-press cursor-pointer ${
                    activeSelection.includes('29 Aug')
                      ? 'bg-[#F94001] text-white border-[#F94001] shadow-sm shadow-[#F94001]/20'
                      : 'bg-[#F3F4F4] border-[#E5E7EB] text-[#021526] hover:bg-[#F3F4F4]'
                  }`}
                >
                  Tomorrow (29 Aug)
                </button>
                <button
                  onClick={() => handleSelectPreset('Aug 2026')}
                  className={`px-3 py-1.5 rounded-xl text-[11.5px] font-bold shrink-0 border transition-all active-press cursor-pointer ${
                    activeSelection === 'Aug 2026'
                      ? 'bg-[#F94001] text-white border-[#F94001] shadow-sm shadow-[#F94001]/20'
                      : 'bg-[#F3F4F4] border-[#E5E7EB] text-[#021526] hover:bg-[#F3F4F4]'
                  }`}
                >
                  August 2026
                </button>
                <button
                  onClick={() => handleSelectPreset('Jul 2026')}
                  className={`px-3 py-1.5 rounded-xl text-[11.5px] font-bold shrink-0 border transition-all active-press cursor-pointer ${
                    activeSelection === 'Jul 2026'
                      ? 'bg-[#F94001] text-white border-[#F94001] shadow-sm shadow-[#F94001]/20'
                      : 'bg-[#F3F4F4] border-[#E5E7EB] text-[#021526] hover:bg-[#F3F4F4]'
                  }`}
                >
                  July 2026
                </button>
              </>
            )}
          </div>

          {/* TAB 1: DATE (CALENDAR) VIEW */}
          {activeTab === 'date' && (
            <div className="space-y-3">
              {/* Month Navigation */}
              <div className="flex items-center justify-between px-1">
                <span className="text-[14px] font-black text-[#021526]">
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevMonth}
                    className="w-7 h-7 rounded-lg bg-[#F3F4F4] border border-[#E5E7EB] flex items-center justify-center text-[#021526] hover:bg-[#F3F4F4] cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="w-7 h-7 rounded-lg bg-[#F3F4F4] border border-[#E5E7EB] flex items-center justify-center text-[#021526] hover:bg-[#F3F4F4] cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day of Week Labels */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {DAYS_OF_WEEK.map((d) => (
                  <span key={d} className="text-[11px] font-black text-[#5F6368] py-1">
                    {d}
                  </span>
                ))}
              </div>

              {/* Calendar Days Matrix */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="py-2" />
                ))}

                {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dayPadded = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
                  const formattedDay = `${dayPadded} ${MONTH_SHORT[viewMonth]} ${viewYear}`;
                  const isSelected =
                    activeSelection.includes(formattedDay) ||
                    (activeSelection.includes(`${dayNum} ${MONTH_SHORT[viewMonth]} ${viewYear}`));
                  const isToday = dayNum === 28 && viewMonth === 7 && viewYear === 2026;

                  return (
                    <button
                      key={dayNum}
                      onClick={() => handleSelectDay(dayNum)}
                      className={`py-2 rounded-xl text-[12px] font-extrabold transition-all cursor-pointer flex flex-col items-center justify-center relative ${
                        isSelected
                          ? 'bg-[#F94001] text-white shadow-sm shadow-[#F94001]/20'
                          : isToday
                          ? 'bg-[#F94001]/15 text-[#F94001] font-black hover:bg-[#F94001]/25'
                          : 'text-[#021526] hover:bg-[#F3F4F4]'
                      }`}
                    >
                      <span>{dayNum}</span>
                      {isToday && !isSelected && (
                        <span className="w-1 h-1 rounded-full bg-[#F94001] absolute bottom-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: MONTH VIEW */}
          {activeTab === 'month' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      haptics.tap();
                      setViewYear((y) => y - 1);
                    }}
                    className="w-6 h-6 rounded-lg bg-[#F3F4F4] border border-[#E5E7EB] flex items-center justify-center text-[#021526] hover:bg-[#F3F4F4] cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      haptics.tap();
                      setActiveTab('year');
                    }}
                    className="text-[14px] font-black text-[#021526] hover:text-[#16A34A] cursor-pointer px-1 rounded hover:bg-[#F3F4F4] transition-colors"
                    title="Switch to Year Picker"
                  >
                    {viewYear}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      haptics.tap();
                      setViewYear((y) => y + 1);
                    }}
                    className="w-6 h-6 rounded-lg bg-[#F3F4F4] border border-[#E5E7EB] flex items-center justify-center text-[#021526] hover:bg-[#F3F4F4] cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[10px] font-bold text-[#16A34A] bg-[#16A34A]/10 px-2 py-0.5 rounded-full">
                  Financial Year {viewYear}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {MONTH_SHORT.map((m, idx) => {
                  const mLabel = `${m} ${viewYear}`;
                  const isSelected = activeSelection.includes(m);
                  const isCurrent = idx === 7; // Aug

                  return (
                    <button
                      key={m}
                      onClick={() => handleSelectMonth(idx)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#F94001] text-white border-[#F94001] shadow-sm shadow-[#F94001]/20'
                          : 'bg-[#F3F4F4] border-[#E5E7EB] text-[#021526] hover:bg-[#F3F4F4]'
                      }`}
                    >
                      <span className="text-[13px] font-black block">{m}</span>
                      <span
                        className={`text-[9px] font-bold block mt-0.5 ${
                          isSelected
                            ? 'text-white/80'
                            : isCurrent
                            ? 'text-[#F94001]'
                            : 'text-[#5F6368]'
                        }`}
                      >
                        {isCurrent ? 'Current Month' : `${MONTH_NAMES[idx]}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: YEAR VIEW */}
          {activeTab === 'year' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      haptics.tap();
                      setDecadeStart((d) => d - 10);
                    }}
                    className="w-7 h-7 rounded-lg bg-[#F3F4F4] border border-[#E5E7EB] flex items-center justify-center text-[#021526] hover:bg-[#F3F4F4] cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[14px] font-black text-[#021526]">
                    {decadeStart} – {decadeStart + 9}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      haptics.tap();
                      setDecadeStart((d) => d + 10);
                    }}
                    className="w-7 h-7 rounded-lg bg-[#F3F4F4] border border-[#E5E7EB] flex items-center justify-center text-[#021526] hover:bg-[#F3F4F4] cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-[10px] font-bold text-[#16A34A] bg-[#16A34A]/10 px-2 py-0.5 rounded-full">
                  Annual Statements
                </span>
              </div>

              {/* Years Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Array.from({ length: 10 }).map((_, idx) => {
                  const yr = decadeStart + idx;
                  const isSelected =
                    activeSelection === `${yr}` || activeSelection.includes(`${yr}`);
                  const isCurrent = yr === 2026;

                  return (
                    <button
                      key={yr}
                      onClick={() => handleSelectYear(yr)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#F94001] text-white border-[#F94001] shadow-sm shadow-[#F94001]/20'
                          : 'bg-[#F3F4F4] border-[#E5E7EB] text-[#021526] hover:bg-[#F3F4F4]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[14px] font-black">{yr}</span>
                        {isSelected ? (
                          <div className="w-4 h-4 rounded-full bg-[#16A34A] text-white flex items-center justify-center text-[10px]">
                            ✓
                          </div>
                        ) : isCurrent ? (
                          <span className="text-[8.5px] font-bold text-[#16A34A] bg-[#16A34A]/15 px-1 py-0.2 rounded">
                            Active
                          </span>
                        ) : null}
                      </div>
                      <span
                        className={`text-[9px] font-bold block mt-1 ${
                          isSelected ? 'text-white/75' : 'text-[#5F6368]'
                        }`}
                      >
                        {isCurrent ? 'Current Fiscal' : `FY ${yr - 1}-${String(yr).slice(-2)}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Action */}
          <div className="pt-3 mt-3 border-t border-[#F3F4F4] flex items-center justify-between">
            <span className="text-[11px] text-[#5F6368] flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${dotColorClass}`} />
              <span>TurfTown Live System Time</span>
            </span>

            <button
              onClick={() => {
                haptics.tap();
                onClose();
              }}
              className="px-4 py-1.5 rounded-xl bg-[#021526] text-white text-[12px] font-bold cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
