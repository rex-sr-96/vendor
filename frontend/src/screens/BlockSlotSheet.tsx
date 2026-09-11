import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Wrench,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  AlertTriangle,
  Sparkles,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { haptics } from '../utils/haptics';
import { CustomSelect } from '../components/CustomSelect';

// Converts "06:00 AM", "6:00 AM", "12:00 PM", "12:00 AM" into minutes from midnight
function parseTimeToMinutes(tStr: string, isEndTime = false): number {
  if (!tStr) return 0;
  const isPM = /PM/i.test(tStr);
  const isAM = /AM/i.test(tStr);
  const clean = tStr.replace(/AM|PM/i, '').trim();
  const [hStr, mStr] = clean.split(':');
  let h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr || '0', 10) || 0;
  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = isEndTime ? 24 : 0;
  if (!isAM && !isPM && isEndTime && h === 12) h = 24;
  return h * 60 + m;
}

// Converts minutes from midnight into "06:00 AM", "12:00 PM", "12:00 AM"
function formatMinutesToTime(totalMins: number): string {
  if (totalMins >= 1440) return '12:00 AM';
  const normalized = totalMins % 1440;
  const h24 = Math.floor(normalized / 60);
  const m = normalized % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const hFormatted = h12 < 10 ? `0${h12}` : `${h12}`;
  const mFormatted = m < 10 ? `0${m}` : `${m}`;
  return `${hFormatted}:${mFormatted} ${ampm}`;
}

// Parses a range like "8:00–10:00 PM", "6–7 AM", "06:00 AM – 07:00 AM", "6:00–7:00 AM" into { startMin, endMin }
function parseRangeToMinutes(rangeStr: string): { startMin: number; endMin: number } | null {
  if (!rangeStr) return null;
  const parts = rangeStr.split(/[–\-]| to /i).map((s) => s.trim());
  if (parts.length < 2) {
    const m = parseTimeToMinutes(parts[0]);
    return { startMin: m, endMin: m + 60 };
  }

  let startStr = parts[0];
  let endStr = parts[1];

  const hasEndMod = /(AM|PM)/i.test(endStr);
  const hasStartMod = /(AM|PM)/i.test(startStr);

  if (hasEndMod && !hasStartMod) {
    const endMod = endStr.match(/(AM|PM)/i)![1].toUpperCase();
    const startHourMatch = startStr.match(/^(\d{1,2})/);
    const endHourMatch = endStr.match(/^(\d{1,2})/);
    if (startHourMatch && endHourMatch) {
      const sH = parseInt(startHourMatch[1], 10);
      const eH = parseInt(endHourMatch[1], 10);
      if (endMod === 'PM') {
        if (sH >= 9 && sH < 12 && eH < 12) {
          startStr += ' AM';
        } else {
          startStr += ' PM';
        }
      } else {
        startStr += ' AM';
      }
    } else {
      startStr += ` ${endMod}`;
    }
  }

  const startMin = parseTimeToMinutes(startStr, false);
  let endMin = parseTimeToMinutes(endStr, true);
  if (endMin <= startMin && endStr.includes('12')) {
    endMin = 1440;
  }
  return { startMin, endMin };
}

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_SHORT = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export const BlockSlotSheet: React.FC = () => {
  const { activeModal, setActiveModal, courts, bookings, slots, blockSlotAction, showToast } = useApp();

  const approvedCourts = useMemo(
    () => courts.filter((c) => c.status === 'Approved' || !c.status),
    [courts]
  );

  const [courtId, setCourtId] = useState(approvedCourts[0]?.id || 'court-1');
  const currentCourt = approvedCourts.find((c) => c.id === courtId) || approvedCourts[0];

  // Date selection state
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(7); // Aug
  const [selectedDay, setSelectedDay] = useState(28); // Today baseline
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  const bookingDate = useMemo(() => {
    return `${String(selectedDay).padStart(2, '0')} ${MONTH_SHORT[selectedMonth]} ${selectedYear}`;
  }, [selectedDay, selectedMonth, selectedYear]);

  // Quick date presets
  const quickDates = useMemo(() => {
    return [
      { day: 28, month: 7, year: 2026, label: 'Today (28 Aug)' },
      { day: 29, month: 7, year: 2026, label: 'Tomorrow (29 Aug)' },
      { day: 30, month: 7, year: 2026, label: '30 Aug' },
      { day: 31, month: 7, year: 2026, label: '31 Aug' },
    ];
  }, []);

  // Court-specific time intervals (30m vs 1hr)
  const isCourt30Min = useMemo(() => {
    if (currentCourt?.minBookingDuration?.toLowerCase().includes('30')) return true;
    if (currentCourt?.sports?.some((s) => s.toLowerCase().includes('badminton') || s.toLowerCase().includes('pickleball'))) return true;
    return false;
  }, [currentCourt]);

  // Standard candidate operating slots (06:00 AM to 12:00 AM)
  const candidateSlots = useMemo(() => {
    const step = isCourt30Min ? 30 : 60;
    const slotsList: {
      startMin: number;
      endMin: number;
      startStr: string;
      endStr: string;
      label: string;
      durationLabel: string;
    }[] = [];

    for (let m = 360; m + step <= 1440; m += step) {
      const startStr = formatMinutesToTime(m);
      const endStr = formatMinutesToTime(m + step);
      slotsList.push({
        startMin: m,
        endMin: m + step,
        startStr,
        endStr,
        label: `${startStr} – ${endStr}`,
        durationLabel: isCourt30Min ? '30m' : '1 hr',
      });
    }
    return slotsList;
  }, [isCourt30Min]);

  // Calculate ONLY AVAILABLE slots for this court and date
  const availableSlots = useMemo(() => {
    // 1. Existing active customer bookings
    const courtBookings = bookings.filter(
      (b) =>
        b.courtId === courtId &&
        (b.date === bookingDate || b.date.replace(/^0+/, '') === bookingDate.replace(/^0+/, '')) &&
        b.status !== 'Cancelled' &&
        b.status !== 'Expired'
    );

    // 2. Existing maintenance blocks or occupied slots
    const courtBlocks = slots.filter(
      (s) =>
        s.courtId === courtId &&
        s.state !== 'available' &&
        (!s.date || s.date === bookingDate || s.date.replace(/^0+/, '') === bookingDate.replace(/^0+/, ''))
    );

    const occupiedRanges: { startMin: number; endMin: number; reason: string }[] = [];

    courtBookings.forEach((b) => {
      const r = parseRangeToMinutes(b.timeSlot);
      if (r) occupiedRanges.push({ ...r, reason: `Booked by ${b.customerName}` });
    });

    courtBlocks.forEach((s) => {
      const r = parseRangeToMinutes(s.time || s.timeFull);
      if (r) occupiedRanges.push({ ...r, reason: s.reason || 'Pitch Blocked' });
    });

    // Check availability
    return candidateSlots.filter((cand) => {
      const isOccupied = occupiedRanges.some(
        (occ) => Math.max(cand.startMin, occ.startMin) < Math.min(cand.endMin, occ.endMin)
      );
      return !isOccupied;
    });
  }, [courtId, bookingDate, bookings, slots, candidateSlots]);

  // Available Start Times (ONLY open slot starts)
  const availableStartTimes = useMemo(() => {
    const set = new Set<string>();
    availableSlots.forEach((s) => set.add(s.startStr));
    return Array.from(set);
  }, [availableSlots]);

  // Time selections
  const [fromTime, setFromTime] = useState<string>('');
  const [toTime, setToTime] = useState<string>('');
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  // Available End Times given the selected fromTime (continuous available chain only)
  const validToOptions = useMemo(() => {
    if (!fromTime) return [];
    const fromSlot = availableSlots.find((s) => s.startStr === fromTime);
    if (!fromSlot) return [];

    const validEnds: { value: string; durationLabel: string }[] = [];
    let currentStart = fromSlot.startMin;

    while (true) {
      const nextSlot = availableSlots.find((s) => s.startMin === currentStart);
      if (!nextSlot) break;
      const totalMinutes = nextSlot.endMin - fromSlot.startMin;
      const hours = totalMinutes / 60;
      const durationLabel = hours === 1 ? '1 hr' : hours % 1 === 0 ? `${hours} hrs` : `${totalMinutes} min`;
      validEnds.push({ value: nextSlot.endStr, durationLabel });
      currentStart = nextSlot.endMin;
    }

    return validEnds;
  }, [fromTime, availableSlots]);

  // Automatically keep fromTime and toTime valid and pre-selected with the first available slot
  useEffect(() => {
    if (availableSlots.length === 0) {
      setFromTime('');
      setToTime('');
      return;
    }

    const isCurrentFromValid = availableStartTimes.includes(fromTime);
    const isCurrentToValid = validToOptions.some((o) => o.value === toTime);

    if (!isCurrentFromValid || !isCurrentToValid) {
      setFromTime(availableSlots[0].startStr);
      setToTime(availableSlots[0].endStr);
    }
  }, [courtId, bookingDate, availableSlots, availableStartTimes, validToOptions, fromTime, toTime]);

  // Maintenance category & manual entry
  const [maintenanceCategory, setMaintenanceCategory] = useState<string>('Surface Grooming & Brushing');
  const [manualReason, setManualReason] = useState<string>('');

  const PRESET_CATEGORIES = [
    'Surface Grooming & Brushing',
    'Net, Goalpost & Hardware Repair',
    'Floodlight & Electrical Servicing',
    'Sprinkler & Pitch Deep Clean',
    'Custom (Manual Entry)',
  ];

  // Close popovers on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setIsDatePickerOpen(false);
      }
      if (fromRef.current && !fromRef.current.contains(e.target as Node)) {
        setIsFromOpen(false);
      }
      if (toRef.current && !toRef.current.contains(e.target as Node)) {
        setIsToOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Selected duration
  const selectedDurationLabel = useMemo(() => {
    if (!fromTime || !toTime) return '';
    const startM = parseTimeToMinutes(fromTime);
    let endM = parseTimeToMinutes(toTime, true);
    if (endM <= startM) endM += 1440;
    const diff = endM - startM;
    const hrs = diff / 60;
    return hrs === 1 ? '1 hour' : hrs % 1 === 0 ? `${hrs} hours` : `${diff} minutes`;
  }, [fromTime, toTime]);

  const handleClose = () => {
    haptics.tap();
    setActiveModal(null);
  };

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDayIndex = (new Date(selectedYear, selectedMonth, 1).getDay() + 6) % 7;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromTime || !toTime) {
      showToast('No Slot Selected', 'Please select an available slot to block.', 'warning');
      return;
    }

    const finalReason =
      maintenanceCategory === 'Custom (Manual Entry)'
        ? manualReason.trim() || 'Pitch Maintenance'
        : maintenanceCategory;

    const timeLabel = `${fromTime} – ${toTime}`;

    haptics.success();
    blockSlotAction(
      courtId,
      currentCourt?.name || 'Turf 1',
      timeLabel,
      finalReason,
      'maintenance',
      `Pitch maintenance block: ${finalReason} from ${fromTime} to ${toTime}`,
      bookingDate
    );

    showToast(
      'Pitch Blocked for Maintenance',
      `Blocked ${currentCourt?.name} on ${bookingDate} (${timeLabel}). Reason: ${finalReason}`,
      'info'
    );
  };

  if (activeModal !== 'block_slot') return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-xs">
        <div className="absolute inset-0" onClick={handleClose} />

        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-h-[92vh] md:max-w-lg md:rounded-3xl overflow-y-auto no-scrollbar bg-white rounded-t-3xl p-5 pb-6 shadow-2xl border border-[#E5E7EB]"
        >
          {/* Mobile Native Handle Bar */}
          <div className="md:hidden w-10 h-1 rounded-full bg-[#D4D2CD] mx-auto mb-3 shrink-0" />

          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F4]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#DC2626]/10 border border-[#DC2626]/30 flex items-center justify-center text-[#DC2626]">
                <Wrench className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="text-[17px] font-black text-[#021526] leading-tight">
                  Pitch Maintenance Block
                </h2>
                <p className="text-[11px] text-[#5F6368] font-medium">
                  Block available slots for turf upkeep & repair (Unavailable for bookings)
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-[#F3F4F4] flex items-center justify-center text-[#5F6368] hover:text-[#021526] cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="py-3 space-y-3.5">
            {/* 1. Court Selection */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-[#5F6368]">
                  Select Court <span className="text-[#F94001]">*</span>
                </label>
                <span className="text-[10px] font-bold text-[#16A34A] bg-[#16A34A]/10 px-2 py-0.5 rounded-md">
                  {currentCourt?.sports.join(', ')} · {currentCourt?.minBookingDuration || '1 hr'}
                </span>
              </div>
              <CustomSelect
                value={courtId}
                onChange={(val) => setCourtId(val)}
                options={approvedCourts.map((c) => ({
                  value: c.id,
                  label: `${c.name} (${c.sports.join(', ')}) · ${c.minBookingDuration || '1 hr'} min`,
                }))}
                className="w-full bg-[#F3F4F4] border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-[12.5px] font-bold text-[#021526] focus:outline-none"
              />
            </div>

            {/* 2. Date Selection with Quick Chips */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-[#5F6368]">Date</label>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    availableSlots.length > 0
                      ? 'bg-[#16A34A]/15 text-[#16A34A]'
                      : 'bg-[#DC2626]/15 text-[#DC2626]'
                  }`}>
                    {availableSlots.length > 0 ? `🟢 ${availableSlots.length} Available Slots` : '🔴 0 Slots Available'}
                  </span>
                </div>
              </div>

              {/* Quick Date Chips */}
              <div className="flex items-center gap-1.5 mb-2 overflow-x-auto no-scrollbar pb-0.5">
                {quickDates.map((qd) => {
                  const isMatch =
                    selectedDay === qd.day &&
                    selectedMonth === qd.month &&
                    selectedYear === qd.year;
                  return (
                    <button
                      key={qd.label}
                      type="button"
                      onClick={() => {
                        haptics.tap();
                        setSelectedDay(qd.day);
                        setSelectedMonth(qd.month);
                        setSelectedYear(qd.year);
                        setIsDatePickerOpen(false);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                        isMatch
                          ? 'bg-[#FFF1EC] text-[#F94001] border border-[#F94001]/40 font-black shadow-2xs'
                          : 'bg-[#F3F4F4] border border-[#E5E7EB] text-[#5F6368] hover:text-[#021526]'
                      }`}
                    >
                      {qd.label}
                    </button>
                  );
                })}
              </div>

              {/* Date Picker Button */}
              <div className="relative" ref={datePickerRef}>
                <button
                  type="button"
                  onClick={() => {
                    haptics.tap();
                    setIsDatePickerOpen(!isDatePickerOpen);
                    setIsFromOpen(false);
                    setIsToOpen(false);
                  }}
                  className="w-full bg-[#F3F4F4] border border-[#E5E7EB] hover:border-[#021526] rounded-xl px-3 py-2 text-left flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-3.5 h-3.5 text-[#F94001]" />
                    <span className="text-[12px] font-black text-[#021526]">
                      {bookingDate}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#5F6368]" />
                </button>

                {/* Calendar Popover */}
                <AnimatePresence>
                  {isDatePickerOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      className="absolute left-0 top-full mt-1.5 w-68 bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl p-3 z-50"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-[#F3F4F4] mb-2">
                        <span className="text-[12px] font-black text-[#021526]">
                          {MONTH_NAMES[selectedMonth]} {selectedYear}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedMonth((p) => (p === 0 ? 11 : p - 1))}
                            className="w-6 h-6 rounded-lg bg-[#F3F4F4] flex items-center justify-center text-[#5F6368]"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedMonth((p) => (p === 11 ? 0 : p + 1))}
                            className="w-6 h-6 rounded-lg bg-[#F3F4F4] flex items-center justify-center text-[#5F6368]"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-7 gap-1 text-center mb-1">
                        {DAYS_SHORT.map((d) => (
                          <span key={d} className="text-[9.5px] font-bold text-[#5F6368]">
                            {d}
                          </span>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-1 text-center">
                        {Array.from({ length: firstDayIndex }).map((_, i) => (
                          <div key={`empty-${i}`} className="w-7 h-7" />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                          const dNum = i + 1;
                          const isSelected = dNum === selectedDay;
                          const isToday = dNum === 28 && selectedMonth === 7;
                          return (
                            <button
                              key={dNum}
                              type="button"
                              onClick={() => {
                                setSelectedDay(dNum);
                                setIsDatePickerOpen(false);
                              }}
                              className={`w-7 h-7 rounded-lg text-[11px] font-bold flex items-center justify-center cursor-pointer ${
                                isSelected
                                  ? 'bg-[#F94001] text-white'
                                  : isToday
                                  ? 'bg-[#F94001]/15 text-[#F94001]'
                                  : 'text-[#021526] hover:bg-[#F3F4F4]'
                              }`}
                            >
                              {dNum}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* 3. 1-CLICK INTERACTIVE "AVAILABLE SLOTS ONLY" SELECTOR */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#16A34A]" />
                  <label className="text-[11px] font-black text-[#021526]">
                    Available Slots to Block
                  </label>
                </div>
                <span className="text-[10px] text-[#5F6368]">
                  Tap any slot to select instantly
                </span>
              </div>

              {availableSlots.length === 0 ? (
                <div className="p-3 bg-[#DC2626]/10 border border-[#DC2626]/25 rounded-xl flex items-center gap-2 text-[#DC2626]">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <p className="text-[11.5px] font-bold">
                    No available slots on this date. All slots are currently booked or under maintenance.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto no-scrollbar p-1 bg-[#F3F4F4] border border-[#E5E7EB] rounded-2xl">
                  {availableSlots.map((slot) => {
                    const isSelected = fromTime === slot.startStr && toTime === slot.endStr;
                    return (
                      <button
                        key={slot.label}
                        type="button"
                        onClick={() => {
                          haptics.tap();
                          setFromTime(slot.startStr);
                          setToTime(slot.endStr);
                        }}
                        className={`px-2.5 py-2 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#FFF1EC] text-[#021526] border-2 border-[#F94001] shadow-2xs'
                            : 'bg-white border-[#E5E7EB] text-[#021526] hover:border-[#5F6368] hover:bg-[#F3F4F4]'
                        }`}
                      >
                        <div className="min-w-0 pr-1">
                          <div className="flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? 'bg-[#F94001]' : 'bg-[#16A34A]'}`} />
                            <span className="text-[11px] font-black truncate">
                              {slot.startStr}
                            </span>
                          </div>
                          <span className={`text-[9.5px] block truncate ${isSelected ? 'text-[#021526]/70' : 'text-[#5F6368]'}`}>
                            to {slot.endStr}
                          </span>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                          isSelected ? 'bg-[#F94001]/15 text-[#F94001]' : 'bg-[#F3F4F4] text-[#5F6368]'
                        }`}>
                          {slot.durationLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 4. Fine-Tuned Start Time & End Time (ONLY Shows Available Slot Times) */}
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              {/* Start Time Dropdown (Filtered to ONLY available slot start times) */}
              <div className="relative" ref={fromRef}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-[#5F6368]">Start Time</label>
                  <span className="text-[9px] font-black text-[#16A34A] bg-[#16A34A]/10 px-1.5 py-0.5 rounded">
                    Free Slots Only
                  </span>
                </div>
                <button
                  type="button"
                  disabled={availableSlots.length === 0}
                  onClick={() => {
                    haptics.tap();
                    setIsFromOpen(!isFromOpen);
                    setIsDatePickerOpen(false);
                    setIsToOpen(false);
                  }}
                  className="w-full bg-[#F3F4F4] border border-[#E5E7EB] hover:border-[#021526] disabled:opacity-50 rounded-xl px-2.5 py-2 text-left flex items-center justify-between cursor-pointer"
                >
                  <span className="text-[11.5px] font-black text-[#021526] truncate">
                    {fromTime || 'No slot available'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#5F6368] shrink-0" />
                </button>

                <AnimatePresence>
                  {isFromOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      className="absolute left-0 top-full mt-1.5 w-64 max-h-56 overflow-y-auto no-scrollbar bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl p-2.5 z-50"
                    >
                      <div className="px-1.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#5F6368] flex items-center justify-between border-b border-[#F3F4F4] mb-1.5">
                        <span>Select Available Start</span>
                        <span className="text-[9px] font-black text-[#16A34A]">
                          {availableStartTimes.length} Open
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {availableStartTimes.map((val) => {
                          const isSelected = val === fromTime;
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => {
                                haptics.tap();
                                setFromTime(val);
                                setIsFromOpen(false);
                              }}
                              className={`px-2 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-between ${
                                isSelected
                                  ? 'bg-[#F94001] text-white shadow-xs'
                                  : 'bg-[#F3F4F4] border border-[#E5E7EB] text-[#021526] hover:bg-[#F3F4F4]'
                              }`}
                            >
                              <span>{val}</span>
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* End Time Dropdown (Filtered to ONLY non-colliding continuous ends) */}
              <div className="relative" ref={toRef}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-[#5F6368]">End Time</label>
                  <span className="text-[9px] font-black text-[#F94001] bg-[#F94001]/10 px-1.5 py-0.5 rounded">
                    Release
                  </span>
                </div>
                <button
                  type="button"
                  disabled={availableSlots.length === 0 || validToOptions.length === 0}
                  onClick={() => {
                    haptics.tap();
                    setIsToOpen(!isToOpen);
                    setIsDatePickerOpen(false);
                    setIsFromOpen(false);
                  }}
                  className="w-full bg-[#F3F4F4] border border-[#E5E7EB] hover:border-[#021526] disabled:opacity-50 rounded-xl px-2.5 py-2 text-left flex items-center justify-between cursor-pointer"
                >
                  <span className="text-[11.5px] font-black text-[#021526] truncate">
                    {toTime || 'Select Start first'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#5F6368] shrink-0" />
                </button>

                <AnimatePresence>
                  {isToOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      className="absolute right-0 top-full mt-1.5 w-64 max-h-56 overflow-y-auto no-scrollbar bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl p-2.5 z-50"
                    >
                      <div className="px-1.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#5F6368] flex items-center justify-between border-b border-[#F3F4F4] mb-1.5">
                        <span>Select Available End</span>
                        <span className="text-[9px] font-black text-[#16A34A]">
                          Valid Ranges
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {validToOptions.map((opt) => {
                          const isSelected = opt.value === toTime;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                haptics.tap();
                                setToTime(opt.value);
                                setIsToOpen(false);
                              }}
                              className={`px-2.5 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-between ${
                                isSelected
                                  ? 'bg-[#F94001] text-white shadow-xs'
                                  : 'bg-[#F3F4F4] border border-[#E5E7EB] text-[#021526] hover:bg-[#F3F4F4]'
                              }`}
                            >
                              <span>{opt.value}</span>
                              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-[#E5E7EB] text-[#5F6368]'
                              }`}>
                                +{opt.durationLabel}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Selected Block Summary Banner */}
            {fromTime && toTime && (
              <div className="p-2.5 bg-[#F3F4F4] border border-[#E5E7EB] rounded-xl flex items-center justify-between text-[11.5px]">
                <div className="flex items-center gap-1.5 font-bold text-[#021526]">
                  <Sparkles className="w-3.5 h-3.5 text-[#F94001]" />
                  <span>Blocking: <strong>{fromTime} – {toTime}</strong></span>
                </div>
                <span className="font-extrabold text-[#DC2626] bg-[#DC2626]/10 px-2 py-0.5 rounded-md text-[10.5px]">
                  {selectedDurationLabel}
                </span>
              </div>
            )}

            {/* 5. Maintenance Category Selection & Manual Entry */}
            <div className="space-y-1.5 pt-0.5">
              <label className="block text-[11px] font-bold text-[#5F6368]">
                Maintenance Purpose / Category <span className="text-[#F94001]">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {PRESET_CATEGORIES.map((cat) => {
                  const isSelected = maintenanceCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        haptics.tap();
                        setMaintenanceCategory(cat);
                      }}
                      className={`p-2.5 rounded-xl border text-left text-[11.5px] font-bold transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#F94001] text-white border-[#F94001] shadow-sm shadow-[#F94001]/20'
                          : 'bg-[#F3F4F4] border-[#E5E7EB] text-[#021526] hover:bg-[#F3F4F4]'
                      }`}
                    >
                      <span className="truncate">{cat}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Manual Entry Text Field */}
              {maintenanceCategory === 'Custom (Manual Entry)' && (
                <div className="pt-1">
                  <label className="block text-[10.5px] font-bold text-[#021526] mb-1 flex items-center gap-1">
                    <Edit3 className="w-3 h-3 text-[#F94001]" />
                    <span>Enter Custom Maintenance Reason</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Synthetic grass patch repair & high-pressure wash"
                    value={manualReason}
                    onChange={(e) => setManualReason(e.target.value)}
                    className="w-full bg-[#F3F4F4] border border-[#F94001] rounded-xl px-3 py-2 text-[12px] font-bold text-[#021526] focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Notice Strip */}
            <div className="bg-[#F3F4F4] border border-[#E5E7EB] rounded-xl p-2.5 text-[11px] text-[#5F6368]">
              Pitch status will display as <strong className="text-[#DC2626]">Unavailable (Maintenance)</strong> on the slot matrix. Customer bookings will be disabled for this window.
            </div>

            {/* Confirm Button */}
            <button
              type="submit"
              disabled={availableSlots.length === 0 || !fromTime || !toTime}
              className="w-full h-10 bg-[#DC2626] hover:bg-[#c33d3d] disabled:opacity-50 text-white font-extrabold text-[13px] rounded-xl flex items-center justify-center gap-1.5 shadow-sm active-press cursor-pointer transition-all mt-1"
            >
              <Wrench className="w-4 h-4" />
              <span>
                {availableSlots.length === 0 ? 'No Available Slots to Block' : 'Confirm & Block Pitch'}
              </span>
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

