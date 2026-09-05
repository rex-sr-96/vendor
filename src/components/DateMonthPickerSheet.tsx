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
  mode?: 'date' | 'week' | 'month'; // default starting mode
  showModeTabs?: boolean; // whether to show Date | Week | Month switcher tabs
  activeSelection: string; // e.g. '28 Aug 2026', 'Today', 'Week (24–30 Aug)', 'Aug 2026', 'All'
  onSelect: (value: string) => void;
  availableDates?: string[]; // list of date strings e.g. ['28 Aug 2026', '27 Aug 2026'] or month strings
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
  const [activeTab, setActiveTab] = useState<'date' | 'week' | 'month'>(initialMode);
  const [viewYear, setViewYear] = useState<number>(2026);
  const [viewMonth, setViewMonth] = useState<number>(7); // 7 is August (0-indexed)

  if (!isOpen) return null;

  const accentColorClass =
    themeColor === 'green'
      ? 'bg-[#2FA66A] text-white hover:bg-[#268c59]'
      : themeColor === 'black'
      ? 'bg-[#171717] text-white hover:bg-[#333333]'
      : 'bg-[#FF6B2C] text-white hover:bg-[#e5591e]';

  const accentBgLightClass =
    themeColor === 'green'
      ? 'bg-[#2FA66A]/10 text-[#2FA66A] border-[#2FA66A]/30'
      : themeColor === 'black'
      ? 'bg-[#171717]/10 text-[#171717] border-[#171717]/30'
      : 'bg-[#FF6B2C]/10 text-[#FF6B2C] border-[#FF6B2C]/30';

  const dotColorClass =
    themeColor === 'green'
      ? 'bg-[#2FA66A]'
      : themeColor === 'black'
      ? 'bg-[#171717]'
      : 'bg-[#FF6B2C]';

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
    const formatted = `${day} ${MONTH_SHORT[viewMonth]} ${viewYear}`;
    onSelect(formatted);
    onClose();
  };

  const handleSelectWeek = (weekLabel: string) => {
    haptics.tap();
    onSelect(weekLabel);
    onClose();
  };

  const handleSelectMonth = (mIndex: number) => {
    haptics.tap();
    const formatted = `${MONTH_SHORT[mIndex]} ${viewYear}`;
    onSelect(formatted);
    onClose();
  };

  const handleSelectPreset = (val: string) => {
    haptics.tap();
    onSelect(val);
    onClose();
  };

  const handleSelectAll = () => {
    haptics.tap();
    onSelect('All');
    onClose();
  };

  const weekOptions = [
    {
      id: 'current_week',
      label: 'This Week (24–30 Aug)',
      dateRange: '24 Aug – 30 Aug 2026',
      slots: '56 slots booked',
      revenue: '₹92,400',
    },
    {
      id: 'last_week',
      label: 'Last Week (17–23 Aug)',
      dateRange: '17 Aug – 23 Aug 2026',
      slots: '48 slots booked',
      revenue: '₹84,200',
    },
    {
      id: 'two_weeks_ago',
      label: '2 Weeks Ago (10–16 Aug)',
      dateRange: '10 Aug – 16 Aug 2026',
      slots: '51 slots booked',
      revenue: '₹88,000',
    },
    {
      id: 'three_weeks_ago',
      label: '3 Weeks Ago (03–09 Aug)',
      dateRange: '03 Aug – 09 Aug 2026',
      slots: '44 slots booked',
      revenue: '₹76,500',
    },
  ];

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs">
        {/* Backdrop click to dismiss */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full bg-white rounded-t-[32px] p-5 pb-7 shadow-2xl border-t border-[#E8E6E1] max-h-[92vh] overflow-y-auto"
        >
          {/* Sheet Grab Handle */}
          <div className="w-10 h-1 bg-[#D1CFCA] rounded-full mx-auto mb-3.5" />

          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F0EC]">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accentBgLightClass}`}>
                <CalendarIcon className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="text-[17px] font-extrabold text-[#171717] tracking-tight">
                  {title}
                </h2>
                <p className="text-[11.5px] text-[#777570] font-medium">
                  Currently selected:{' '}
                  <span className="font-bold text-[#171717]">
                    {activeSelection === 'All'
                      ? 'All Time'
                      : activeSelection === 'Today'
                      ? 'Today (28 Aug 2026)'
                      : activeSelection === 'Yesterday'
                      ? 'Yesterday (27 Aug 2026)'
                      : activeSelection}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                haptics.tap();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-[#F1F0EC] flex items-center justify-center text-[#777570] hover:text-[#171717] active-press cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Tabs: Date | Week | Month */}
          {showModeTabs && (
            <div className="pt-3 pb-2">
              <div className="flex items-center bg-[#F1F0EC] p-1 rounded-2xl">
                {(['date', 'week', 'month'] as const).map((tab) => {
                  const isActive = activeTab === tab;
                  const label = tab === 'date' ? 'Date (Calendar)' : tab === 'week' ? 'Week' : 'Month';
                  return (
                    <button
                      key={tab}
                      onClick={() => {
                        haptics.tap();
                        setActiveTab(tab);
                      }}
                      className={`flex-1 py-1.5 rounded-xl text-[12px] font-bold transition-all active-press cursor-pointer flex items-center justify-center gap-1 ${
                        isActive
                          ? 'bg-white text-[#171717] shadow-xs'
                          : 'text-[#777570] hover:text-[#171717]'
                      }`}
                    >
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Presets Bar */}
          <div className="pt-1 pb-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => handleSelectPreset('Today')}
              className={`px-3 py-1.5 rounded-xl text-[11.5px] font-bold shrink-0 border transition-all active-press cursor-pointer ${
                activeSelection === 'Today' || activeSelection === '28 Aug 2026'
                  ? accentColorClass
                  : 'bg-[#F7F7F5] border-[#E8E6E1] text-[#171717] hover:bg-[#EBE9E3]'
              }`}
            >
              Today (28 Aug)
            </button>
            <button
              onClick={() => handleSelectPreset('Yesterday')}
              className={`px-3 py-1.5 rounded-xl text-[11.5px] font-bold shrink-0 border transition-all active-press cursor-pointer ${
                activeSelection === 'Yesterday' || activeSelection === '27 Aug 2026'
                  ? accentColorClass
                  : 'bg-[#F7F7F5] border-[#E8E6E1] text-[#171717] hover:bg-[#EBE9E3]'
              }`}
            >
              Yesterday (27 Aug)
            </button>
            <button
              onClick={() => handleSelectPreset('This Week (24–30 Aug)')}
              className={`px-3 py-1.5 rounded-xl text-[11.5px] font-bold shrink-0 border transition-all active-press cursor-pointer ${
                activeSelection.includes('This Week') || activeSelection.includes('24–30 Aug')
                  ? accentColorClass
                  : 'bg-[#F7F7F5] border-[#E8E6E1] text-[#171717] hover:bg-[#EBE9E3]'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => handleSelectPreset('Aug 2026')}
              className={`px-3 py-1.5 rounded-xl text-[11.5px] font-bold shrink-0 border transition-all active-press cursor-pointer ${
                activeSelection === 'Aug 2026'
                  ? accentColorClass
                  : 'bg-[#F7F7F5] border-[#E8E6E1] text-[#171717] hover:bg-[#EBE9E3]'
              }`}
            >
              Aug 2026
            </button>
          </div>

          {/* Main Content Based on Active Tab */}
          {activeTab === 'date' && (
            /* Standard Date Calendar */
            <div className="bg-[#FAF9F6] rounded-2xl p-4 border border-[#E8E6E1] space-y-3">
              {/* Calendar Month & Year Switcher */}
              <div className="flex items-center justify-between px-1">
                <button
                  onClick={handlePrevMonth}
                  className="w-8 h-8 rounded-xl bg-white border border-[#E8E6E1] flex items-center justify-center text-[#171717] hover:bg-[#F1F0EC] active-press cursor-pointer shadow-2xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="text-center">
                  <span className="text-[15px] font-extrabold text-[#171717]">
                    {MONTH_NAMES[viewMonth]} {viewYear}
                  </span>
                  <span className="text-[10px] text-[#777570] font-medium block">
                    Tap any date to select
                  </span>
                </div>
                <button
                  onClick={handleNextMonth}
                  className="w-8 h-8 rounded-xl bg-white border border-[#E8E6E1] flex items-center justify-center text-[#171717] hover:bg-[#F1F0EC] active-press cursor-pointer shadow-2xs"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {DAYS_OF_WEEK.map((d) => (
                  <span key={d} className="text-[11px] font-bold text-[#A3A099] py-0.5">
                    {d}
                  </span>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for start padding */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-9 w-full" />
                ))}

                {/* Days of Month */}
                {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${day} ${MONTH_SHORT[viewMonth]} ${viewYear}`;
                  const isSelected =
                    activeSelection === dateStr ||
                    (activeSelection === 'Today' && dateStr === '28 Aug 2026') ||
                    (activeSelection === 'Yesterday' && dateStr === '27 Aug 2026');
                  const isToday = day === 28 && viewMonth === 7 && viewYear === 2026;
                  const hasActivity = availableDates.some(
                    (ad) => ad === dateStr || ad.includes(dateStr)
                  );

                  return (
                    <button
                      key={`day-${day}`}
                      onClick={() => handleSelectDay(day)}
                      className={`h-9 w-full rounded-xl flex flex-col items-center justify-center text-[12.5px] font-bold transition-all relative cursor-pointer active-press border ${
                        isSelected
                          ? `${accentColorClass} border-transparent shadow-xs font-extrabold`
                          : isToday
                          ? 'bg-white border-[#FF6B2C]/50 text-[#FF6B2C] shadow-2xs'
                          : 'bg-white border-[#E8E6E1] text-[#171717] hover:bg-[#EBE9E3]'
                      }`}
                    >
                      <span>{day}</span>
                      {hasActivity && !isSelected && (
                        <span className={`w-1.5 h-1.5 rounded-full ${dotColorClass} -mt-0.5`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'week' && (
            /* Week Selector */
            <div className="space-y-2">
              {weekOptions.map((wk) => {
                const isSelected =
                  activeSelection === wk.label || activeSelection === wk.dateRange;
                return (
                  <div
                    key={wk.id}
                    onClick={() => handleSelectWeek(wk.label)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer active-press flex items-center justify-between ${
                      isSelected
                        ? `${accentColorClass} border-transparent shadow-xs`
                        : 'bg-[#FAF9F6] border-[#E8E6E1] hover:bg-[#F1F0EC]'
                    }`}
                  >
                    <div>
                      <h4 className="text-[13.5px] font-bold">{wk.label}</h4>
                      <p
                        className={`text-[11px] ${
                          isSelected ? 'text-white/80' : 'text-[#777570]'
                        }`}
                      >
                        {wk.slots} · {wk.revenue}
                      </p>
                    </div>
                    {isSelected ? (
                      <Check className="w-5 h-5 stroke-[2.5]" />
                    ) : (
                      <span className="text-[11px] font-semibold text-[#777570]">Select</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'month' && (
            /* Month Picker Grid */
            <div className="bg-[#FAF9F6] rounded-2xl p-4 border border-[#E8E6E1] space-y-3.5">
              {/* Year Switcher */}
              <div className="flex items-center justify-between px-1">
                <button
                  onClick={() => {
                    haptics.tap();
                    setViewYear((y) => y - 1);
                  }}
                  className="w-8 h-8 rounded-xl bg-white border border-[#E8E6E1] flex items-center justify-center text-[#171717] hover:bg-[#F1F0EC] active-press cursor-pointer shadow-2xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="text-center">
                  <span className="text-[15px] font-extrabold text-[#171717]">
                    Year {viewYear}
                  </span>
                  <span className="text-[10px] text-[#777570] font-medium block">
                    Select a month to filter data
                  </span>
                </div>
                <button
                  onClick={() => {
                    haptics.tap();
                    setViewYear((y) => y + 1);
                  }}
                  className="w-8 h-8 rounded-xl bg-white border border-[#E8E6E1] flex items-center justify-center text-[#171717] hover:bg-[#F1F0EC] active-press cursor-pointer shadow-2xs"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* 12 Months Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                {MONTH_NAMES.map((name, idx) => {
                  const monthShortStr = `${MONTH_SHORT[idx]} ${viewYear}`;
                  const isSelected = activeSelection === monthShortStr;
                  const isCurrentMonth = idx === 7 && viewYear === 2026; // August 2026
                  const hasActivity = availableDates.some((ad) => ad.includes(monthShortStr));

                  return (
                    <button
                      key={name}
                      onClick={() => handleSelectMonth(idx)}
                      className={`py-3 px-2 rounded-2xl text-center transition-all cursor-pointer active-press border flex flex-col items-center justify-center relative ${
                        isSelected
                          ? `${accentColorClass} border-transparent shadow-xs font-extrabold`
                          : isCurrentMonth
                          ? 'bg-white border-[#2FA66A]/40 text-[#171717] font-extrabold shadow-2xs'
                          : 'bg-white border-[#E8E6E1] text-[#171717] hover:bg-[#EBE9E3]'
                      }`}
                    >
                      <span className="text-[13px] font-bold block">{name}</span>
                      <span
                        className={`text-[10px] block mt-0.5 ${
                          isSelected ? 'text-white/80' : 'text-[#777570]'
                        }`}
                      >
                        {MONTH_SHORT[idx]} {viewYear}
                      </span>

                      {/* Activity Indicator Dot */}
                      {hasActivity && !isSelected && (
                        <span className={`w-1.5 h-1.5 rounded-full ${dotColorClass} mt-1`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Action Bar */}
          <div className="flex items-center justify-between gap-2 pt-4">
            <button
              onClick={handleSelectAll}
              className="flex-1 py-2.5 rounded-2xl bg-[#F1F0EC] text-[#171717] text-[12.5px] font-bold hover:bg-[#E8E6E1] active-press cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Show All Time</span>
            </button>
            <button
              onClick={() => {
                haptics.tap();
                onClose();
              }}
              className={`flex-1 py-2.5 rounded-2xl text-[12.5px] font-bold active-press cursor-pointer flex items-center justify-center gap-1.5 ${accentColorClass}`}
            >
              <Check className="w-4 h-4" />
              <span>Done</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
