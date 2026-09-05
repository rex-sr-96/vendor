import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Check,
  Ban,
  Lock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { haptics } from '../utils/haptics';
import { parseTimeToMinutes, parseBookingRangeToMinutes, formatMinutesToTime } from '../utils/extensionSlots';

// Standard 30-min & 1-hour operating time slots
const ALL_TIME_SLOTS = [
  { value: '05:30 AM', minutes: 330, period: 'morning' },
  { value: '06:00 AM', minutes: 360, period: 'morning' },
  { value: '06:30 AM', minutes: 390, period: 'morning' },
  { value: '07:00 AM', minutes: 420, period: 'morning' },
  { value: '07:30 AM', minutes: 450, period: 'morning' },
  { value: '08:00 AM', minutes: 480, period: 'morning' },
  { value: '08:30 AM', minutes: 510, period: 'morning' },
  { value: '09:00 AM', minutes: 540, period: 'morning' },
  { value: '09:30 AM', minutes: 570, period: 'morning' },
  { value: '10:00 AM', minutes: 600, period: 'morning' },
  { value: '10:30 AM', minutes: 630, period: 'morning' },
  { value: '11:00 AM', minutes: 660, period: 'morning' },
  { value: '12:00 PM', minutes: 720, period: 'afternoon' },
  { value: '01:00 PM', minutes: 780, period: 'afternoon' },
  { value: '02:00 PM', minutes: 840, period: 'afternoon' },
  { value: '03:00 PM', minutes: 900, period: 'afternoon' },
  { value: '04:00 PM', minutes: 960, period: 'afternoon' },
  { value: '05:00 PM', minutes: 1020, period: 'evening' },
  { value: '05:30 PM', minutes: 1050, period: 'evening' },
  { value: '06:00 PM', minutes: 1080, period: 'evening', isPrime: true },
  { value: '06:30 PM', minutes: 1110, period: 'evening', isPrime: true },
  { value: '07:00 PM', minutes: 1140, period: 'evening', isPrime: true },
  { value: '07:30 PM', minutes: 1170, period: 'evening', isPrime: true },
  { value: '08:00 PM', minutes: 1200, period: 'evening', isPrime: true },
  { value: '08:30 PM', minutes: 1230, period: 'evening', isPrime: true },
  { value: '09:00 PM', minutes: 1260, period: 'evening', isPrime: true },
  { value: '09:30 PM', minutes: 1290, period: 'night' },
  { value: '10:00 PM', minutes: 1320, period: 'night' },
  { value: '10:30 PM', minutes: 1350, period: 'night' },
  { value: '11:00 PM', minutes: 1380, period: 'night' },
  { value: '12:00 AM', minutes: 1440, period: 'night' },
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const DAYS_SHORT = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

// Helper to parse '28 Aug 2026' or '28 August 2026'
const parseBookingDate = (dateStr: string) => {
  const parts = dateStr.trim().split(' ');
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const mStr = parts[1].toLowerCase().slice(0, 3);
    const year = parseInt(parts[2], 10);
    const mIdx = MONTH_SHORT.findIndex((m) => m.toLowerCase().slice(0, 3) === mStr);
    if (!isNaN(day) && mIdx !== -1 && !isNaN(year)) {
      return { day, month: mIdx, year };
    }
  }
  return null;
};

export const NewBookingModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    courts,
    createNewBooking,
    showToast,
    bookingPrefill,
    setBookingPrefill,
    bookings,
    slots,
  } = useApp();

  // Facility baseline: 28 Aug 2026, 5:00 PM (17:00)
  const TODAY_YEAR = 2026;
  const TODAY_MONTH = 7; // August (0-indexed)
  const TODAY_DAY = 28;
  const CURRENT_HOUR_BASELINE = 17; // 5:00 PM

  // 1. Customer Details (Mobile First, then Customer Name)
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');

  // 2. Sports & Courts
  const approvedCourts = useMemo(
    () => courts.filter((c) => c.status === 'Approved' || !c.status),
    [courts]
  );

  const availableSports = useMemo(() => {
    const sportsSet = new Set<string>();
    approvedCourts.forEach((c) => c.sports.forEach((s) => sportsSet.add(s)));
    return Array.from(sportsSet);
  }, [approvedCourts]);

  const [selectedSport, setSelectedSport] = useState<string>(availableSports[0] || 'Football');

  const courtsForSelectedSport = useMemo(() => {
    const filtered = approvedCourts.filter((c) =>
      c.sports.some((s) => s.toLowerCase() === selectedSport.toLowerCase())
    );
    return filtered.length > 0 ? filtered : approvedCourts;
  }, [approvedCourts, selectedSport]);

  const [courtId, setCourtId] = useState(courtsForSelectedSport[0]?.id || approvedCourts[0]?.id || 'court-1');

  // 3. App-Themed Date Picker State
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(7); // August (0-indexed)
  const [selectedDay, setSelectedDay] = useState(28); // 28 August 2026 (Today)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  const isSelectedDateToday =
    selectedYear === TODAY_YEAR &&
    selectedMonth === TODAY_MONTH &&
    selectedDay === TODAY_DAY;

  const isCurrentMonthOrPast =
    selectedYear < TODAY_YEAR ||
    (selectedYear === TODAY_YEAR && selectedMonth <= TODAY_MONTH);

  const bookingDate = useMemo(() => {
    return `${selectedDay} ${MONTH_SHORT[selectedMonth]} ${selectedYear}`;
  }, [selectedDay, selectedMonth, selectedYear]);

  // 4. App-Themed Time Picker State
  const [startTime, setStartTime] = useState('06:00 PM');
  const [endTime, setEndTime] = useState('08:00 PM');
  const [isStartTimeOpen, setIsStartTimeOpen] = useState(false);
  const [isEndTimeOpen, setIsEndTimeOpen] = useState(false);
  const startTimeRef = useRef<HTMLDivElement>(null);
  const endTimeRef = useRef<HTMLDivElement>(null);

  // Sync selected court, date, startTime, and endTime from slot selection when modal opens
  useEffect(() => {
    if (activeModal === 'new_booking' && bookingPrefill) {
      if (bookingPrefill.courtId) {
        setCourtId(bookingPrefill.courtId);
        const targetCourt = approvedCourts.find((c) => c.id === bookingPrefill.courtId);
        if (targetCourt) {
          if (
            bookingPrefill.sport &&
            targetCourt.sports.some((s) => s.toLowerCase() === bookingPrefill.sport?.toLowerCase())
          ) {
            setSelectedSport(bookingPrefill.sport);
          } else if (targetCourt.sports[0]) {
            setSelectedSport(targetCourt.sports[0]);
          }
        }
      }
      if (bookingPrefill.date) {
        const parsed = parseBookingDate(bookingPrefill.date);
        if (parsed) {
          setSelectedDay(parsed.day);
          setSelectedMonth(parsed.month);
          setSelectedYear(parsed.year);
        }
      }
      if (bookingPrefill.startTime) {
        setStartTime(bookingPrefill.startTime);
      }
      if (bookingPrefill.endTime) {
        setEndTime(bookingPrefill.endTime);
      }
    }
  }, [activeModal, bookingPrefill, approvedCourts]);

  // 5. Payment on Confirmation (Only Full Paid or 50% Advance)
  const [paymentOption, setPaymentOption] = useState<'full' | 'advance'>('full');

  const currentCourt =
    approvedCourts.find((c) => c.id === courtId) || approvedCourts[0] || courts[0];
  const unitPrice = currentCourt ? currentCourt.pricePerHour : 1000;

  // Determine if selected court has 30-min or 1-hour minimum booking duration
  const isCourt30Min = useMemo(() => {
    if (currentCourt?.minBookingDuration?.toLowerCase().includes('30')) return true;
    if (currentCourt?.sports?.some((s) => s.toLowerCase().includes('badminton') || s.toLowerCase().includes('pickleball'))) return true;
    return false;
  }, [currentCourt]);

  // Court-specific time intervals (30m slots for Badminton/Pickleball vs 1hr slots for Football/Cricket)
  const courtTimeSlots = useMemo(() => {
    if (isCourt30Min) {
      return ALL_TIME_SLOTS;
    }
    // 1-hour minimum booking: strictly only whole-hour slots
    return ALL_TIME_SLOTS.filter((s) => s.minutes % 60 === 0);
  }, [isCourt30Min]);

  // Auto-align start and end times if court switches between 30m and 1hr
  useEffect(() => {
    if (!isCourt30Min) {
      const sObj = ALL_TIME_SLOTS.find((t) => t.value === startTime);
      if (sObj && sObj.minutes % 60 !== 0) {
        const snappedStart = courtTimeSlots.find((t) => t.minutes >= sObj.minutes) || courtTimeSlots[0];
        if (snappedStart) setStartTime(snappedStart.value);
      }
      const eObj = ALL_TIME_SLOTS.find((t) => t.value === endTime);
      if (eObj && eObj.minutes % 60 !== 0) {
        const snappedEnd = courtTimeSlots.find((t) => t.minutes >= (sObj?.minutes || 360) + 60) || courtTimeSlots[courtTimeSlots.length - 1];
        if (snappedEnd) setEndTime(snappedEnd.value);
      }
    }
  }, [isCourt30Min, courtTimeSlots]);

  const startSlotObj =
    courtTimeSlots.find((t) => t.value === startTime) || courtTimeSlots[0];
  const endSlotObj =
    courtTimeSlots.find((t) => t.value === endTime) || courtTimeSlots[Math.min(1, courtTimeSlots.length - 1)];

  const diffMinutes = Math.max(0, (endSlotObj?.minutes || 480) - (startSlotObj?.minutes || 360));
  const durationHours = diffMinutes > 0 ? diffMinutes / 60 : isCourt30Min ? 0.5 : 1;

  const isPeak = (startSlotObj?.minutes || 0) >= 1080 && (startSlotObj?.minutes || 0) < 1320;
  const effectiveRate = isPeak && currentCourt?.peakHoursPrice ? currentCourt.peakHoursPrice : unitPrice;

  // Fixed Non-Editable Calculations
  const computedTotal = Math.round(effectiveRate * durationHours);
  const computedAdvance = Math.round(computedTotal * 0.5);

  // Valid End Time options (only times strictly after start time by at least min duration)
  const validEndOptions = useMemo(() => {
    const sObj = courtTimeSlots.find((t) => t.value === startTime) || courtTimeSlots[0];
    const minStep = isCourt30Min ? 30 : 60;
    return courtTimeSlots.filter((t) => t.minutes >= (sObj?.minutes || 360) + minStep);
  }, [courtTimeSlots, startTime, isCourt30Min]);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setIsDatePickerOpen(false);
      }
      if (startTimeRef.current && !startTimeRef.current.contains(e.target as Node)) {
        setIsStartTimeOpen(false);
      }
      if (endTimeRef.current && !endTimeRef.current.contains(e.target as Node)) {
        setIsEndTimeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSportChange = (newSport: string) => {
    haptics.tap();
    setSelectedSport(newSport);
    const matchingCourts = approvedCourts.filter((c) =>
      c.sports.some((s) => s.toLowerCase() === newSport.toLowerCase())
    );
    if (matchingCourts.length > 0) {
      setCourtId(matchingCourts[0].id);
    }
  };

  const handleSelectStartTime = (val: string) => {
    haptics.tap();
    setStartTime(val);
    setIsStartTimeOpen(false);

    const sObj = ALL_TIME_SLOTS.find((t) => t.value === val);
    if (!sObj) return;

    const eObj = ALL_TIME_SLOTS.find((t) => t.value === endTime);
    if (!eObj || eObj.minutes <= sObj.minutes) {
      const targetMins = sObj.minutes + Math.round(durationHours * 60 || 60);
      const matchingEnd =
        ALL_TIME_SLOTS.find((t) => t.minutes === targetMins) ||
        ALL_TIME_SLOTS.find((t) => t.minutes > sObj.minutes) ||
        ALL_TIME_SLOTS[ALL_TIME_SLOTS.length - 1];
      setEndTime(matchingEnd.value);
    }
  };

  const handleSelectEndTime = (val: string) => {
    haptics.tap();
    setEndTime(val);
    setIsEndTimeOpen(false);
  };

  // Active bookings on this court and date
  const courtBookingsOnDate = useMemo(() => {
    return bookings.filter(
      (b) =>
        b.courtId === courtId &&
        b.date === bookingDate &&
        b.status !== 'Cancelled' &&
        b.status !== 'Expired'
    );
  }, [bookings, courtId, bookingDate]);

  // Active maintenance blocks on this court and date
  const courtBlocksOnDate = useMemo(() => {
    return slots.filter(
      (s) =>
        s.courtId === courtId &&
        s.state === 'maintenance' &&
        (s.date === bookingDate || !s.date)
    );
  }, [slots, courtId, bookingDate]);

  // Comprehensive Timeline Slots for the chosen court & date
  const timelineSlots = useMemo(() => {
    const step = isCourt30Min ? 30 : 60;
    const startMin = 360; // 6:00 AM
    const endMin = 1380; // 11:00 PM
    const list = [];

    const selStart = parseTimeToMinutes(startTime);
    const selEnd = parseTimeToMinutes(endTime);

    for (let m = startMin; m < endMin; m += step) {
      const nextM = m + step;
      const startStr = formatMinutesToTime(m);
      const endStr = formatMinutesToTime(nextM);

      const h24 = Math.floor(m / 60);
      const mins = m % 60;
      const ampm = h24 >= 12 ? 'PM' : 'AM';
      const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
      const label = mins === 0 ? `${h12} ${ampm}` : `${h12}:${mins < 10 ? '0' + mins : mins}`;

      // Passed check: if selected date is today, hours before baseline 17:00 (5 PM) are passed
      const isPassed = isSelectedDateToday && m < CURRENT_HOUR_BASELINE * 60;

      const matchedBooking = courtBookingsOnDate.find((b) => {
        const range = parseBookingRangeToMinutes(b.timeSlot || '');
        if (range) {
          return Math.max(range.startMins, m) < Math.min(range.endMins, nextM);
        }
        return false;
      });

      const matchedBlock = courtBlocksOnDate.find((blk) => {
        const range = parseBookingRangeToMinutes(blk.timeFull || blk.time || '');
        if (range) {
          return Math.max(range.startMins, m) < Math.min(range.endMins, nextM);
        }
        return false;
      });

      const isSelected = m >= selStart && nextM <= selEnd;
      const isSelectionStart = m === selStart;
      const isSelectionEnd = nextM === selEnd;

      list.push({
        label,
        start: startStr,
        end: endStr,
        startMins: m,
        endMins: nextM,
        isPassed,
        isBooked: !!matchedBooking,
        bookingCustomer: matchedBooking?.customerName?.split(' ')[0] || '',
        isBlocked: !!matchedBlock,
        isSelected,
        isSelectionStart,
        isSelectionEnd,
      });
    }

    return list;
  }, [
    isCourt30Min,
    isSelectedDateToday,
    courtBookingsOnDate,
    courtBlocksOnDate,
    startTime,
    endTime,
  ]);

  // Auto-align start time if currently passed on today
  useEffect(() => {
    if (isSelectedDateToday) {
      const sMins = parseTimeToMinutes(startTime);
      if (sMins < CURRENT_HOUR_BASELINE * 60) {
        const firstAvailable = timelineSlots.find(
          (ts) => !ts.isPassed && !ts.isBooked && !ts.isBlocked
        );
        if (firstAvailable) {
          setStartTime(firstAvailable.start);
          setEndTime(firstAvailable.end);
        } else {
          setStartTime('06:00 PM');
          setEndTime('07:00 PM');
        }
      }
    }
  }, [isSelectedDateToday, selectedDay, selectedMonth, selectedYear]);

  const handleTimelineSlotClick = (slot: (typeof timelineSlots)[0]) => {
    if (slot.isPassed) {
      showToast('Slot Passed', `${slot.label} has already passed today.`, 'warning');
      return;
    }
    if (slot.isBooked) {
      showToast('Slot Booked', `${slot.label} is already booked by ${slot.bookingCustomer || 'another customer'}.`, 'warning');
      return;
    }
    if (slot.isBlocked) {
      showToast('Slot Blocked', `${slot.label} is currently blocked for maintenance.`, 'warning');
      return;
    }

    haptics.tap();
    const currentStart = parseTimeToMinutes(startTime);
    const currentEnd = parseTimeToMinutes(endTime);
    const minStep = isCourt30Min ? 30 : 60;
    const isSingleSlotActive = currentEnd - currentStart <= minStep;

    if (isSingleSlotActive && slot.startMins > currentStart) {
      const hasBlockedOrBooked = timelineSlots.some(
        (ts) =>
          ts.startMins >= currentStart &&
          ts.endMins <= slot.endMins &&
          (ts.isBooked || ts.isBlocked || ts.isPassed)
      );
      if (hasBlockedOrBooked) {
        setStartTime(slot.start);
        setEndTime(slot.end);
      } else {
        setEndTime(slot.end);
      }
    } else {
      setStartTime(slot.start);
      setEndTime(slot.end);
    }
  };

  // Calendar calculations
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDayIndex = (new Date(selectedYear, selectedMonth, 1).getDay() + 6) % 7; // Monday = 0

  const handleCloseModal = () => {
    haptics.tap();
    setBookingPrefill(null);
    setActiveModal(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhone.trim() || customerPhone.length < 10) {
      showToast('Mobile Required', 'Please enter a valid 10-digit mobile number.', 'error');
      return;
    }
    if (!customerName.trim()) {
      showToast('Name Required', 'Please enter customer name.', 'error');
      return;
    }

    const court = approvedCourts.find((c) => c.id === courtId) || approvedCourts[0];
    const computedSlot = `${startTime} – ${endTime} (${durationHours} hr${durationHours !== 1 ? 's' : ''})`;
    const paid = paymentOption === 'full' ? computedTotal : computedAdvance;
    const balance = computedTotal - paid;

    haptics.success();
    createNewBooking({
      customerName: customerName.trim(),
      customerPhone: `+91 ${customerPhone.trim()}`,
      courtId,
      courtName: court ? court.name : 'Turf 1',
      sport: (selectedSport as any) || (court?.sports[0] as any) || 'Football',
      timeSlot: computedSlot,
      date: bookingDate,
      totalAmount: computedTotal,
      paidAmount: paid,
      balanceAmount: balance,
      status: 'Confirmed',
      paymentStatus: balance === 0 ? 'Paid' : 'Partially Paid',
      paymentMethod: 'UPI',
      notes: `${selectedSport} booking for ${customerName} (${startTime} to ${endTime})`,
    });

    setBookingPrefill(null);
    setCustomerPhone('');
    setCustomerName('');
    setActiveModal(null);
  };

  if (activeModal !== 'new_booking') return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-xs">
        <div className="absolute inset-0" onClick={handleCloseModal} />

        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-h-[90vh] md:max-w-lg md:rounded-3xl overflow-y-auto no-scrollbar bg-white rounded-t-3xl p-5 pb-6 shadow-2xl border border-[#E8E6E1]"
        >
          {/* Mobile Native Handle Bar */}
          <div className="md:hidden w-10 h-1 rounded-full bg-[#D4D2CD] mx-auto mb-3 shrink-0" />

          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F0EC]">
            <h2 className="text-[17px] font-black text-[#171717]">New Booking</h2>
            <button
              onClick={handleCloseModal}
              className="w-8 h-8 rounded-full bg-[#F1F0EC] flex items-center justify-center text-[#777570] hover:text-[#171717] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="py-3 space-y-3">


            {/* 1. Mobile Number (First) & Customer Name (Next) */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[#777570] mb-1">
                  Mobile Number <span className="text-[#FF6B2C]">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-2.5 text-[12px] font-black text-[#777570] pointer-events-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    placeholder="98765 43210"
                    value={customerPhone}
                    onChange={(e) => {
                      // Strictly allow only numeric digits
                      const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setCustomerPhone(digitsOnly);
                    }}
                    onKeyDown={(e) => {
                      if (
                        ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key) ||
                        e.ctrlKey || e.metaKey
                      ) {
                        return;
                      }
                      if (!/^[0-9]$/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    className="w-full bg-[#F7F7F5] border border-[#E8E6E1] rounded-xl pl-9 pr-3 py-2 text-[13px] font-bold text-[#171717] focus:outline-none focus:border-[#FF6B2C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#777570] mb-1">
                  Customer Name <span className="text-[#FF6B2C]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Rahul Kumar"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-[#F7F7F5] border border-[#E8E6E1] rounded-xl px-3 py-2 text-[13px] font-bold text-[#171717] focus:outline-none focus:border-[#FF6B2C]"
                />
              </div>
            </div>

            {/* 2. Sport & Court */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[#777570] mb-1">Sport</label>
                <select
                  value={selectedSport}
                  onChange={(e) => handleSportChange(e.target.value)}
                  className="w-full bg-[#F7F7F5] border border-[#E8E6E1] rounded-xl px-2.5 py-2 text-[12.5px] font-bold text-[#171717] focus:outline-none"
                >
                  {availableSports.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#777570] mb-1">Court</label>
                <select
                  value={courtId}
                  onChange={(e) => {
                    haptics.tap();
                    setCourtId(e.target.value);
                  }}
                  className="w-full bg-[#F7F7F5] border border-[#E8E6E1] rounded-xl px-2.5 py-2 text-[12.5px] font-bold text-[#171717] focus:outline-none"
                >
                  {courtsForSelectedSport.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (₹{c.pricePerHour}/hr)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. Date Selection & Interactive Timeline Slot Selection */}
            <div className="space-y-2.5 pt-0.5">
              {/* Row A: Date Picker Trigger */}
              <div className="flex items-center justify-between gap-2">
                <div className="relative flex-1" ref={datePickerRef}>
                  <label className="block text-[11px] font-bold text-[#777570] mb-1">
                    Booking Date <span className="text-[#FF6B2C]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      haptics.tap();
                      setIsDatePickerOpen(!isDatePickerOpen);
                      setIsStartTimeOpen(false);
                      setIsEndTimeOpen(false);
                    }}
                    className="w-full bg-[#F7F7F5] border border-[#E8E6E1] hover:border-[#FF6B2C] rounded-xl px-2.5 py-2 text-left flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <CalendarIcon className="w-3.5 h-3.5 text-[#FF6B2C] shrink-0" />
                      <span className="text-[12px] font-black text-[#171717] truncate">
                        {bookingDate}
                      </span>
                      {isSelectedDateToday && (
                        <span className="text-[9px] font-black bg-[#FF6B2C]/15 text-[#FF6B2C] px-1.5 py-0.2 rounded">
                          Today
                        </span>
                      )}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-[#777570] shrink-0" />
                  </button>

                  {/* Calendar Popover */}
                  <AnimatePresence>
                    {isDatePickerOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 top-full mt-1.5 w-72 bg-white rounded-2xl border border-[#E8E6E1] shadow-2xl p-3 z-50"
                      >
                        {/* Month Navigation */}
                        <div className="flex items-center justify-between pb-2 border-b border-[#F1F0EC] mb-2">
                          <span className="text-[12px] font-black text-[#171717]">
                            {MONTH_NAMES[selectedMonth]} {selectedYear}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={isCurrentMonthOrPast}
                              onClick={() => {
                                if (isCurrentMonthOrPast) return;
                                haptics.tap();
                                setSelectedMonth((prev) => {
                                  if (prev === 0) {
                                    setSelectedYear((y) => y - 1);
                                    return 11;
                                  }
                                  return prev - 1;
                                });
                              }}
                              className={`w-6 h-6 rounded-lg bg-[#FAF9F6] flex items-center justify-center transition-all ${
                                isCurrentMonthOrPast
                                  ? 'opacity-25 cursor-not-allowed text-[#A3A099]'
                                  : 'text-[#777570] hover:text-[#171717] cursor-pointer'
                              }`}
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                haptics.tap();
                                setSelectedMonth((prev) => {
                                  if (prev === 11) {
                                    setSelectedYear((y) => y + 1);
                                    return 0;
                                  }
                                  return prev + 1;
                                });
                              }}
                              className="w-6 h-6 rounded-lg bg-[#FAF9F6] flex items-center justify-center text-[#777570] hover:text-[#171717] cursor-pointer"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Weekday Header */}
                        <div className="grid grid-cols-7 gap-1 text-center mb-1">
                          {DAYS_SHORT.map((d) => (
                            <span key={d} className="text-[9.5px] font-bold text-[#A3A099]">
                              {d}
                            </span>
                          ))}
                        </div>

                        {/* Day Grid */}
                        <div className="grid grid-cols-7 gap-1 text-center">
                          {Array.from({ length: firstDayIndex }).map((_, i) => (
                            <div key={`empty-${i}`} className="w-7 h-7" />
                          ))}
                          {Array.from({ length: daysInMonth }).map((_, i) => {
                            const dNum = i + 1;
                            const isSelected = dNum === selectedDay;
                            const isToday = dNum === TODAY_DAY && selectedMonth === TODAY_MONTH && selectedYear === TODAY_YEAR;
                            const isPast =
                              selectedYear < TODAY_YEAR ||
                              (selectedYear === TODAY_YEAR && selectedMonth < TODAY_MONTH) ||
                              (selectedYear === TODAY_YEAR && selectedMonth === TODAY_MONTH && dNum < TODAY_DAY);

                            return (
                              <button
                                key={dNum}
                                type="button"
                                disabled={isPast}
                                onClick={() => {
                                  if (isPast) return;
                                  haptics.tap();
                                  setSelectedDay(dNum);
                                  setIsDatePickerOpen(false);
                                }}
                                className={`w-7 h-7 rounded-lg text-[11px] font-extrabold flex items-center justify-center transition-all ${
                                  isSelected
                                    ? 'bg-[#171717] text-white shadow-xs cursor-pointer'
                                    : isPast
                                    ? 'text-[#C5C3BD] bg-transparent line-through cursor-not-allowed opacity-35'
                                    : isToday
                                    ? 'bg-[#FF6B2C]/15 text-[#FF6B2C] hover:bg-[#FF6B2C]/25 cursor-pointer'
                                    : 'text-[#171717] hover:bg-[#FAF9F6] cursor-pointer'
                                }`}
                              >
                                {dNum}
                              </button>
                            );
                          })}
                        </div>

                        {/* Quick Date Chips */}
                        <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-[#F1F0EC]">
                          <button
                            type="button"
                            onClick={() => {
                              haptics.tap();
                              setSelectedDay(TODAY_DAY);
                              setSelectedMonth(TODAY_MONTH);
                              setSelectedYear(TODAY_YEAR);
                              setIsDatePickerOpen(false);
                            }}
                            className="text-[10px] font-extrabold text-[#FF6B2C] hover:underline cursor-pointer"
                          >
                            Today
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              haptics.tap();
                              setSelectedDay(TODAY_DAY + 1);
                              setSelectedMonth(TODAY_MONTH);
                              setSelectedYear(TODAY_YEAR);
                              setIsDatePickerOpen(false);
                            }}
                            className="text-[10px] font-bold text-[#777570] hover:text-[#171717] cursor-pointer"
                          >
                            Tomorrow
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              haptics.tap();
                              setSelectedDay(TODAY_DAY + 2);
                              setSelectedMonth(TODAY_MONTH);
                              setSelectedYear(TODAY_YEAR);
                              setIsDatePickerOpen(false);
                            }}
                            className="text-[10px] font-bold text-[#777570] hover:text-[#171717] cursor-pointer"
                          >
                            Sun (Weekend)
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="text-right shrink-0 pt-3">
                  <span className="block text-[10px] font-bold text-[#777570]">Rate</span>
                  <span className="text-[12.5px] font-black text-[#171717]">₹{effectiveRate}/hr</span>
                </div>
              </div>

              {/* Row B: Interactive Timeline Slot Selection */}
              <div className="bg-[#FAF9F6] border border-[#E8E6E1] rounded-2xl p-2.5 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#FF6B2C]" />
                    <span className="text-[11px] font-black text-[#171717]">Timeline Slot Selection</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#777570]">
                    <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded-full bg-[#FF6B2C]" /> Selected</span>
                    <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded-full bg-[#171717]" /> Booked</span>
                    <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded-full bg-[#D4D2CD]" /> Passed</span>
                  </div>
                </div>

                {/* Scrollable Timeline Track */}
                <div className="overflow-x-auto no-scrollbar pb-1">
                  <div className="flex items-center gap-1.5 min-w-max">
                    {timelineSlots.map((slot) => {
                      const isClickable = !slot.isPassed && !slot.isBooked && !slot.isBlocked;

                      return (
                        <button
                          key={`timeline-${slot.startMins}`}
                          type="button"
                          disabled={!isClickable}
                          onClick={() => handleTimelineSlotClick(slot)}
                          className={`px-2.5 py-1.5 rounded-xl text-center transition-all shrink-0 flex flex-col items-center justify-center min-w-[58px] select-none ${
                            slot.isSelected
                              ? 'bg-gradient-to-r from-[#FF6B2C] to-[#FA5A14] text-white shadow-xs ring-1 ring-[#FF6B2C] cursor-pointer active:scale-95'
                              : slot.isPassed
                              ? 'bg-[#ECEAE4]/50 border border-[#E8E6E1] text-[#A3A099] line-through cursor-not-allowed opacity-50'
                              : slot.isBooked
                              ? 'bg-[#171717] text-white border border-[#171717] cursor-not-allowed'
                              : slot.isBlocked
                              ? 'bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1] cursor-not-allowed'
                              : 'bg-white border border-[#E8E6E1] hover:border-[#FF6B2C] text-[#171717] hover:bg-white/80 cursor-pointer active:scale-95 shadow-2xs'
                          }`}
                        >
                          <span className={`text-[10px] font-black leading-tight ${slot.isSelected ? 'text-white' : ''}`}>
                            {slot.label}
                          </span>
                          <span className={`text-[8px] font-bold leading-tight mt-0.5 ${
                            slot.isSelected
                              ? 'text-white/90'
                              : slot.isPassed
                              ? 'text-[#A3A099]'
                              : slot.isBooked
                              ? 'text-[#FF6B2C]'
                              : slot.isBlocked
                              ? 'text-[#475569]'
                              : 'text-[#777570]'
                          }`}>
                            {slot.isSelected
                              ? (slot.isSelectionStart ? 'Start' : slot.isSelectionEnd ? 'End' : 'Selected')
                              : slot.isPassed
                              ? 'Passed'
                              : slot.isBooked
                              ? (slot.bookingCustomer ? slot.bookingCustomer.slice(0, 5) : 'Booked')
                              : slot.isBlocked
                              ? 'Blocked'
                              : `₹${effectiveRate}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Selection Summary & Start/End Controls */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#E8E6E1]/60">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[10.5px] font-black text-[#171717] truncate">
                      {startTime} – {endTime}
                    </span>
                    <span className="text-[9.5px] font-black bg-[#FF6B2C]/15 text-[#FF6B2C] px-1.5 py-0.2 rounded-md shrink-0">
                      {durationHours} hr{durationHours !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Start Time Dropdown Trigger */}
                    <div className="relative" ref={startTimeRef}>
                      <button
                        type="button"
                        onClick={() => {
                          haptics.tap();
                          setIsStartTimeOpen(!isStartTimeOpen);
                          setIsEndTimeOpen(false);
                          setIsDatePickerOpen(false);
                        }}
                        className="text-[10px] font-extrabold text-[#777570] hover:text-[#171717] bg-white border border-[#E8E6E1] px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <span>Start: {startTime}</span>
                        <ChevronDown className="w-2.5 h-2.5" />
                      </button>

                      {/* Start Time Popover */}
                      <AnimatePresence>
                        {isStartTimeOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 4, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 4, scale: 0.98 }}
                            className="absolute right-0 bottom-full mb-1.5 w-60 max-h-52 overflow-y-auto no-scrollbar bg-white rounded-2xl border border-[#E8E6E1] shadow-2xl p-2 z-50"
                          >
                            <div className="px-1.5 py-1 text-[9.5px] font-bold uppercase tracking-wider text-[#A3A099]">
                              Select Start Time
                            </div>
                            <div className="grid grid-cols-2 gap-1 pt-1">
                              {courtTimeSlots.slice(0, -1).map((s) => {
                                const isSelected = s.value === startTime;
                                const isSlotPassed = isSelectedDateToday && s.minutes < CURRENT_HOUR_BASELINE * 60;

                                return (
                                  <button
                                    key={s.value}
                                    type="button"
                                    disabled={isSlotPassed}
                                    onClick={() => handleSelectStartTime(s.value)}
                                    className={`px-2 py-1 rounded-lg text-[10.5px] font-bold flex items-center justify-between transition-all ${
                                      isSelected
                                        ? 'bg-[#171717] text-white shadow-xs cursor-pointer'
                                        : isSlotPassed
                                        ? 'bg-transparent text-[#C5C3BD] line-through cursor-not-allowed opacity-35'
                                        : 'bg-[#FAF9F6] text-[#171717] hover:bg-[#F1F0EC] cursor-pointer'
                                    }`}
                                  >
                                    <span>{s.value}</span>
                                    {isSlotPassed && <span className="text-[7.5px] text-[#A3A099]">Passed</span>}
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* End Time Dropdown Trigger */}
                    <div className="relative" ref={endTimeRef}>
                      <button
                        type="button"
                        onClick={() => {
                          haptics.tap();
                          setIsEndTimeOpen(!isEndTimeOpen);
                          setIsStartTimeOpen(false);
                          setIsDatePickerOpen(false);
                        }}
                        className="text-[10px] font-extrabold text-[#777570] hover:text-[#171717] bg-white border border-[#E8E6E1] px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <span>End: {endTime}</span>
                        <ChevronDown className="w-2.5 h-2.5" />
                      </button>

                      {/* End Time Popover */}
                      <AnimatePresence>
                        {isEndTimeOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 4, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 4, scale: 0.98 }}
                            className="absolute right-0 bottom-full mb-1.5 w-60 max-h-52 overflow-y-auto no-scrollbar bg-white rounded-2xl border border-[#E8E6E1] shadow-2xl p-2 z-50"
                          >
                            <div className="px-1.5 py-1 text-[9.5px] font-bold uppercase tracking-wider text-[#A3A099]">
                              Select End Time
                            </div>
                            <div className="grid grid-cols-2 gap-1 pt-1">
                              {validEndOptions.map((s) => {
                                const isSelected = s.value === endTime;
                                return (
                                  <button
                                    key={s.value}
                                    type="button"
                                    onClick={() => handleSelectEndTime(s.value)}
                                    className={`px-2 py-1 rounded-lg text-[10.5px] font-bold flex items-center justify-between transition-all cursor-pointer ${
                                      isSelected
                                        ? 'bg-[#171717] text-white shadow-xs'
                                        : 'bg-[#FAF9F6] text-[#171717] hover:bg-[#F1F0EC]'
                                    }`}
                                  >
                                    <span>{s.value}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Payment on Booking */}
            <div className="bg-[#FAF9F6] border border-[#E8E6E1] rounded-2xl p-3 space-y-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-[#F1F0EC]">
                <span className="text-[11px] font-bold text-[#777570] uppercase tracking-wider">
                  Payment Collection
                </span>
                <span className="text-[11.5px] font-black text-[#171717]">
                  Total: ₹{computedTotal.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    haptics.tap();
                    setPaymentOption('full');
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentOption === 'full'
                      ? 'bg-[#171717] text-white border-[#171717] shadow-xs'
                      : 'bg-white border-[#E8E6E1] text-[#171717] hover:bg-[#F1F0EC]'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">
                    Full Paid
                  </span>
                  <span className="text-[15px] font-black block mt-0.5">
                    ₹{computedTotal.toLocaleString('en-IN')}
                  </span>
                  <span className={`text-[9px] block mt-0.5 ${paymentOption === 'full' ? 'text-white/80' : 'text-[#777570]'}`}>
                    Due ₹0
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    haptics.tap();
                    setPaymentOption('advance');
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentOption === 'advance'
                      ? 'bg-[#171717] text-white border-[#171717] shadow-xs'
                      : 'bg-white border-[#E8E6E1] text-[#171717] hover:bg-[#F1F0EC]'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">
                    50% Advance
                  </span>
                  <span className="text-[15px] font-black block mt-0.5">
                    ₹{computedAdvance.toLocaleString('en-IN')}
                  </span>
                  <span className={`text-[9px] block mt-0.5 ${paymentOption === 'advance' ? 'text-amber-300' : 'text-[#FF6B2C]'}`}>
                    Due ₹{computedTotal - computedAdvance}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full h-11 bg-[#FF6B2C] hover:bg-[#e85b1e] text-white font-extrabold text-[13px] rounded-xl flex items-center justify-center gap-1.5 shadow-sm active-press cursor-pointer transition-all mt-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {paymentOption === 'full'
                  ? `Confirm & Collect ₹${computedTotal.toLocaleString('en-IN')}`
                  : `Confirm Booking (₹${computedAdvance.toLocaleString('en-IN')} Paid)`}
              </span>
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
