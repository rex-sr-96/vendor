import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Plus,
  Ban,
  Calendar as CalendarIcon,
  Clock,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  LogOut,
  LogIn,
  ChevronLeft,
  ChevronRight,
  MapPin,
  CreditCard,
  ChevronDown,
  Phone,
  Zap,
  Check,
  X,
  Sparkles,
  Sliders,
  Lock,
  Link2,
} from 'lucide-react';
import { haptics } from '../utils/haptics';
import { SlotState, Court, Booking } from '../types';
import { DateMonthPickerSheet } from '../components/DateMonthPickerSheet';
import { getAvailableExtensionSlots, parseTimeToMinutes } from '../utils/extensionSlots';
import { motion, AnimatePresence } from 'motion/react';

interface MatrixCellData {
  courtId: string;
  courtName: string;
  sport: string;
  timeSlot: string;
  displayStartTime: string;
  displayEndTime: string;
  slotIndex: number;
  hour24: number;
  state: SlotState | 'ongoing' | 'closed';
  isPast: boolean;
  booking?: Booking;
  maintenanceReason?: string;
  slotId: string;
  blockId?: string;
  price: number;
  isPeak: boolean;
}

interface ContinuousRangeSelection {
  courtId: string;
  courtName: string;
  sport: string;
  startIndex: number;
  endIndex: number;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  totalPrice: number;
  slotsCount: number;
}

// Fixed facility baseline: 28 Aug 2026, 5:00 PM (17:00)
const TODAY_BASELINE = new Date(2026, 7, 28); // Month 7 = August
const CURRENT_HOUR_BASELINE = 17; // 5:00 PM

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Helper to format Date into 'DD Mon YYYY' (e.g. '28 Aug 2026')
function formatAppDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = MONTH_NAMES_SHORT[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

// Helper to parse 'DD Mon YYYY' or 'YYYY-MM-DD' into Date
function parseAppDate(dateStr: string): Date {
  if (!dateStr) return new Date(TODAY_BASELINE);
  const parts = dateStr.trim().split(' ');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const mIdx = MONTH_NAMES_SHORT.findIndex(
      (m) => m.toLowerCase() === parts[1].toLowerCase()
    );
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && mIdx !== -1 && !isNaN(year)) {
      return new Date(year, mIdx, day);
    }
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date(TODAY_BASELINE) : d;
}

export const SlotsScreen: React.FC = () => {
  const {
    slots,
    courts,
    bookings,
    setSelectedSlotId,
    setSelectedBookingId,
    setActiveModal,
    showToast,
    unblockSlotAction,
    checkInBooking,
    checkOutBooking,
    extendBookingSlot,
    relockAndResendLink,
    releaseExpiredSlot,
    confirmBookingPayment,
    sendPaymentLink,
  } = useApp();

  // Active approved courts
  const activeCourts = useMemo(
    () => courts.filter((c) => c.status === 'Approved' || !c.status),
    [courts]
  );

  // Sports filter
  const [selectedSportFilter, setSelectedSportFilter] = useState<string>('All');

  // Courts filtered by sport
  const filteredCourts = useMemo(() => {
    if (selectedSportFilter === 'All') return activeCourts;
    return activeCourts.filter((c) =>
      c.sports.some((s) => s.toLowerCase().includes(selectedSportFilter.toLowerCase()))
    );
  }, [activeCourts, selectedSportFilter]);

  // Selected court
  const [selectedCourtId, setSelectedCourtId] = useState<string>(
    activeCourts[0]?.id || 'court-1'
  );
  const [mobileSlotsMode, setMobileSlotsMode] = useState<'picker' | 'matrix'>('picker');

  // Re-lock duration selector
  const [relockHoldMinutes, setRelockHoldMinutes] = useState<number>(15);

  useEffect(() => {
    if (filteredCourts.length > 0 && !filteredCourts.some((c) => c.id === selectedCourtId)) {
      setSelectedCourtId(filteredCourts[0].id);
    }
  }, [filteredCourts, selectedCourtId]);

  // -------------------------------------------------------------
  // DYNAMIC DATE SYSTEM (ROLLS INTO NEXT MONTH, DYNAMIC DAYS)
  // -------------------------------------------------------------
  const [selectedDateObj, setSelectedDateObj] = useState<Date>(new Date(TODAY_BASELINE));
  const [isAdvanceDatePickerOpen, setIsAdvanceDatePickerOpen] = useState(false);

  const currentDate = formatAppDate(selectedDateObj);

  // Check if selected date is strictly in the past
  const isPastDate = useMemo(() => {
    const todayZero = new Date(TODAY_BASELINE.getFullYear(), TODAY_BASELINE.getMonth(), TODAY_BASELINE.getDate()).getTime();
    const selZero = new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth(), selectedDateObj.getDate()).getTime();
    return selZero < todayZero;
  }, [selectedDateObj]);

  const isTodayDate = useMemo(() => {
    return (
      selectedDateObj.getDate() === TODAY_BASELINE.getDate() &&
      selectedDateObj.getMonth() === TODAY_BASELINE.getMonth() &&
      selectedDateObj.getFullYear() === TODAY_BASELINE.getFullYear()
    );
  }, [selectedDateObj]);

  // Generate a dynamic 7-day rolling window centered around selectedDateObj
  const rollingDays = useMemo(() => {
    const result = [];
    for (let offset = -3; offset <= 3; offset++) {
      const d = new Date(selectedDateObj);
      d.setDate(selectedDateObj.getDate() + offset);
      const isToday =
        d.getDate() === TODAY_BASELINE.getDate() &&
        d.getMonth() === TODAY_BASELINE.getMonth() &&
        d.getFullYear() === TODAY_BASELINE.getFullYear();

      const isSelected =
        d.getDate() === selectedDateObj.getDate() &&
        d.getMonth() === selectedDateObj.getMonth() &&
        d.getFullYear() === selectedDateObj.getFullYear();

      result.push({
        dateObj: d,
        dayName: DAYS_SHORT[d.getDay()],
        dateNum: String(d.getDate()).padStart(2, '0'),
        monthShort: MONTH_NAMES_SHORT[d.getMonth()],
        full: formatAppDate(d),
        isToday,
        isSelected,
      });
    }
    return result;
  }, [selectedDateObj]);

  // Available sports across all courts
  const availableSports = useMemo(() => {
    const sSet = new Set<string>();
    activeCourts.forEach((c) => c.sports.forEach((s) => sSet.add(s)));
    return ['All', ...Array.from(sSet)];
  }, [activeCourts]);

  // Advance dates for Month Picker
  const advanceBookingDates = [
    '28 Aug 2026', '29 Aug 2026', '30 Aug 2026', '31 Aug 2026',
    '01 Sep 2026', '02 Sep 2026', '03 Sep 2026', '04 Sep 2026',
    '05 Sep 2026', '06 Sep 2026', '07 Sep 2026', '12 Sep 2026',
    '15 Sep 2026', '20 Sep 2026', '30 Sep 2026', '05 Oct 2026'
  ];

  // -------------------------------------------------------------
  // FIXED STANDARD 1-HOUR TIME SLOTS (60m / 30m REMOVED PER USER)
  // -------------------------------------------------------------
  const standardTimeSlots = useMemo(() => {
    return [
      { time: '6:00–7:00 AM', start: '06:00 AM', end: '07:00 AM', label: '6 am', hour24: 6, peak: false },
      { time: '7:00–8:00 AM', start: '07:00 AM', end: '08:00 AM', label: '7 am', hour24: 7, peak: false },
      { time: '8:00–9:00 AM', start: '08:00 AM', end: '09:00 AM', label: '8 am', hour24: 8, peak: false },
      { time: '9:00–10:00 AM', start: '09:00 AM', end: '10:00 AM', label: '9 am', hour24: 9, peak: false },
      { time: '10:00–11:00 AM', start: '10:00 AM', end: '11:00 AM', label: '10 am', hour24: 10, peak: false },
      { time: '11:00 AM–12:00 PM', start: '11:00 AM', end: '12:00 PM', label: '11 am', hour24: 11, peak: false },
      { time: '12:00–1:00 PM', start: '12:00 PM', end: '01:00 PM', label: '12 pm', hour24: 12, peak: false },
      { time: '1:00–2:00 PM', start: '01:00 PM', end: '02:00 PM', label: '1 pm', hour24: 13, peak: false },
      { time: '2:00–3:00 PM', start: '02:00 PM', end: '03:00 PM', label: '2 pm', hour24: 14, peak: false },
      { time: '3:00–4:00 PM', start: '03:00 PM', end: '04:00 PM', label: '3 pm', hour24: 15, peak: false },
      { time: '4:00–5:00 PM', start: '04:00 PM', end: '05:00 PM', label: '4 pm', hour24: 16, peak: false },
      { time: '5:00–6:00 PM', start: '05:00 PM', end: '06:00 PM', label: '5 pm', hour24: 17, peak: false },
      { time: '6:00–7:00 PM', start: '06:00 PM', end: '07:00 PM', label: '6 pm', hour24: 18, peak: true },
      { time: '7:00–8:00 PM', start: '07:00 PM', end: '08:00 PM', label: '7 pm', hour24: 19, peak: true },
      { time: '8:00–9:00 PM', start: '08:00 PM', end: '09:00 PM', label: '8 pm', hour24: 20, peak: true },
      { time: '9:00–10:00 PM', start: '09:00 PM', end: '10:00 PM', label: '9 pm', hour24: 21, peak: true },
      { time: '10:00–11:00 PM', start: '10:00 PM', end: '11:00 PM', label: '10 pm', hour24: 22, peak: true },
    ];
  }, []);

  // -------------------------------------------------------------
  // MATRIX CELL GENERATOR (WITH CLOSED / PASSED DETECTION)
  // -------------------------------------------------------------
  const matrixCells = useMemo(() => {
    const result: Record<string, MatrixCellData[]> = {};

    filteredCourts.forEach((court) => {
      const courtBookings = bookings.filter(
        (b) => b.courtId === court.id && b.date === currentDate && b.status !== 'Cancelled' && b.status !== 'Expired'
      );
      const courtBlocks = slots.filter(
        (s) => s.courtId === court.id && s.state === 'maintenance' && (s.date === currentDate || !s.date)
      );

      const basePrice = court.pricePerHour || 1000;
      const peakPrice = court.peakHoursPrice || basePrice + 200;

      result[court.id] = standardTimeSlots.map((timeDef, idx) => {
        const isPeak = timeDef.peak;
        const price = isPeak ? peakPrice : basePrice;

        // Passed Slot Check:
        // If the date is strictly in the past, or if it's today and the hour is before CURRENT_HOUR_BASELINE (17:00)
        const isSlotAlreadyPassed = isPastDate || (isTodayDate && timeDef.hour24 < CURRENT_HOUR_BASELINE);

        // Check if matching active booking exists
        const matchedBooking = courtBookings.find((b) => {
          const slotStr = b.timeSlot || '';
          return (
            slotStr.includes(timeDef.time) ||
            slotStr.includes(timeDef.start) ||
            (slotStr.includes(timeDef.start.split(' ')[0]) && slotStr.includes(timeDef.start.split(' ')[1]))
          );
        });

        if (matchedBooking) {
          let cellState: SlotState | 'ongoing' = 'booked';
          if (matchedBooking.status === 'Ongoing') cellState = 'ongoing';
          else if (matchedBooking.status === 'Payment Pending') cellState = 'pending';

          return {
            courtId: court.id,
            courtName: court.name,
            sport: matchedBooking.sport || court.sports[0],
            timeSlot: timeDef.time,
            displayStartTime: timeDef.start,
            displayEndTime: timeDef.end,
            slotIndex: idx,
            hour24: timeDef.hour24,
            state: cellState,
            isPast: isSlotAlreadyPassed,
            booking: matchedBooking,
            slotId: `slot-${court.id}-${idx}`,
            price: matchedBooking.totalAmount || price,
            isPeak,
          };
        }

        // Check if maintenance block exists
        const matchedBlock = courtBlocks.find((s) => {
          const blkTime = s.time || '';
          if (blkTime.includes(timeDef.start) || blkTime.includes(timeDef.time) || blkTime.includes(timeDef.start.split(' ')[0])) {
            return true;
          }
          const parts = blkTime.split(/[–\-]| to /i).map((p) => p.trim());
          if (parts.length >= 2) {
            const sMin = parseTimeToMinutes(parts[0]);
            let eMin = parseTimeToMinutes(parts[1]);
            if (eMin <= sMin && parts[1].includes('12')) eMin = 1440;
            const cellStart = timeDef.hour24 * 60;
            const cellEnd = (timeDef.hour24 + 1) * 60;
            return Math.max(sMin, cellStart) < Math.min(eMin, cellEnd);
          }
          return false;
        });

        if (matchedBlock) {
          return {
            courtId: court.id,
            courtName: court.name,
            sport: court.sports[0],
            timeSlot: timeDef.time,
            displayStartTime: timeDef.start,
            displayEndTime: timeDef.end,
            slotIndex: idx,
            hour24: timeDef.hour24,
            state: 'maintenance',
            isPast: isSlotAlreadyPassed,
            maintenanceReason: matchedBlock.reason || 'Pitch Upkeep',
            slotId: `slot-block-${court.id}-${idx}`,
            blockId: matchedBlock.id,
            price,
            isPeak,
          };
        }

        // If slot has passed, it is closed for booking
        if (isSlotAlreadyPassed) {
          return {
            courtId: court.id,
            courtName: court.name,
            sport: court.sports[0],
            timeSlot: timeDef.time,
            displayStartTime: timeDef.start,
            displayEndTime: timeDef.end,
            slotIndex: idx,
            hour24: timeDef.hour24,
            state: 'closed',
            isPast: true,
            slotId: `slot-closed-${court.id}-${idx}`,
            price,
            isPeak,
          };
        }

        // Open available slot for future/today
        return {
          courtId: court.id,
          courtName: court.name,
          sport: court.sports[0],
          timeSlot: timeDef.time,
          displayStartTime: timeDef.start,
          displayEndTime: timeDef.end,
          slotIndex: idx,
          hour24: timeDef.hour24,
          state: 'available',
          isPast: false,
          slotId: `slot-avail-${court.id}-${idx}`,
          price,
          isPeak,
        };
      });
    });

    return result;
  }, [filteredCourts, bookings, slots, currentDate, standardTimeSlots, isPastDate, isTodayDate]);

  // Selected Court's Slots for App Slot Picker
  const selectedCourtCells = useMemo(() => {
    return matrixCells[selectedCourtId] || [];
  }, [matrixCells, selectedCourtId]);

  // Categorized Day-Part Time Blocks for Mobile
  const timeBlocks = useMemo(() => {
    const morning = selectedCourtCells.filter((c) => c.hour24 >= 6 && c.hour24 < 12);
    const afternoon = selectedCourtCells.filter((c) => c.hour24 >= 12 && c.hour24 < 17);
    const evening = selectedCourtCells.filter((c) => c.hour24 >= 17 && c.hour24 < 21);
    const night = selectedCourtCells.filter((c) => c.hour24 >= 21);

    return [
      { id: 'morning', label: 'Morning Sessions', time: '06:00 AM – 12:00 PM', icon: '🌅', cells: morning, isPeak: false },
      { id: 'afternoon', label: 'Afternoon Sessions', time: '12:00 PM – 05:00 PM', icon: '☀️', cells: afternoon, isPeak: false },
      { id: 'evening', label: 'Evening Peak Sessions', time: '05:00 PM – 09:00 PM', icon: '🌆', cells: evening, isPeak: true },
      { id: 'night', label: 'Late Night Sessions', time: '09:00 PM – 11:00 PM', icon: '🌙', cells: night, isPeak: false },
    ];
  }, [selectedCourtCells]);

  // Active selected court object
  const selectedCourt = useMemo(() => {
    return filteredCourts.find((c) => c.id === selectedCourtId) || filteredCourts[0];
  }, [filteredCourts, selectedCourtId]);

  // Quick stats per court for pitch selector pills
  const courtStats = useMemo(() => {
    const map: Record<string, { total: number; available: number; booked: number; inPlay: number }> = {};
    filteredCourts.forEach((c) => {
      const cells = matrixCells[c.id] || [];
      let available = 0;
      let booked = 0;
      let inPlay = 0;
      cells.forEach((cell) => {
        if (cell.state === 'available') available++;
        else if (cell.state === 'booked') booked++;
        else if (cell.state === 'ongoing') inPlay++;
      });
      map[c.id] = { total: cells.length, available, booked, inPlay };
    });
    return map;
  }, [filteredCourts, matrixCells]);

  // -------------------------------------------------------------
  // CONTINUOUS RANGE SELECTION (RESTRICTED ON PAST / CLOSED SLOTS)
  // -------------------------------------------------------------
  const [rangeSelection, setRangeSelection] = useState<ContinuousRangeSelection | null>(null);

  const handleSlotTrackClick = (cell: MatrixCellData) => {
    haptics.tap();

    // 1. If slot has passed or is closed, DO NOT ALLOW BOOKING
    if (cell.state === 'closed' || cell.isPast) {
      if (isPastDate) {
        showToast('Past Date (Read-Only)', 'Historical dates cannot be booked for new sessions.', 'warning');
      } else {
        showToast('Slot Closed', `The ${cell.displayStartTime} slot has already passed today.`, 'warning');
      }
      return;
    }

    // 2. If clicking a booked or maintenance slot, open details modal
    if (cell.state !== 'available') {
      setSelectedCell(cell);
      return;
    }

    // 3. If starting a new range, or clicking on another court
    if (!rangeSelection || rangeSelection.courtId !== cell.courtId) {
      setRangeSelection({
        courtId: cell.courtId,
        courtName: cell.courtName,
        sport: cell.sport,
        startIndex: cell.slotIndex,
        endIndex: cell.slotIndex,
        startTime: cell.displayStartTime,
        endTime: cell.displayEndTime,
        durationMinutes: 60,
        totalPrice: cell.price,
        slotsCount: 1,
      });
      return;
    }

    // 4. If clicking the exact same single slot again, deselect
    if (rangeSelection.startIndex === cell.slotIndex && rangeSelection.endIndex === cell.slotIndex) {
      setRangeSelection(null);
      return;
    }

    // 5. Expand or shrink continuous range
    const start = Math.min(rangeSelection.startIndex, cell.slotIndex);
    const end = Math.max(rangeSelection.startIndex, cell.slotIndex);

    // Verify all slots in range are available & open
    const courtCells = matrixCells[cell.courtId] || [];
    const hasInterveningBookingOrClosed = courtCells
      .slice(start, end + 1)
      .some((c) => c.state !== 'available');

    if (hasInterveningBookingOrClosed) {
      showToast('Cannot Select Across Bookings', 'Please select a continuous available time window.', 'warning');
      setRangeSelection({
        courtId: cell.courtId,
        courtName: cell.courtName,
        sport: cell.sport,
        startIndex: cell.slotIndex,
        endIndex: cell.slotIndex,
        startTime: cell.displayStartTime,
        endTime: cell.displayEndTime,
        durationMinutes: 60,
        totalPrice: cell.price,
        slotsCount: 1,
      });
      return;
    }

    const selectedSlice = courtCells.slice(start, end + 1);
    const totalMinutes = selectedSlice.length * 60;
    const totalPrice = selectedSlice.reduce((sum, c) => sum + c.price, 0);

    setRangeSelection({
      courtId: cell.courtId,
      courtName: cell.courtName,
      sport: cell.sport,
      startIndex: start,
      endIndex: end,
      startTime: selectedSlice[0].displayStartTime,
      endTime: selectedSlice[selectedSlice.length - 1].displayEndTime,
      durationMinutes: totalMinutes,
      totalPrice,
      slotsCount: selectedSlice.length,
    });
  };

  const handleProceedBookingContinuous = () => {
    if (!rangeSelection) return;
    haptics.success();
    setSelectedSlotId(`slot-${rangeSelection.courtId}-${rangeSelection.startIndex}`);
    setActiveModal('new_booking');
  };

  // -------------------------------------------------------------
  // INTERACTIVE CELL POPUP / MODAL
  // -------------------------------------------------------------
  const [selectedCell, setSelectedCell] = useState<MatrixCellData | null>(null);
  const [extensionMinutes, setExtensionMinutes] = useState<number | null>(null);
  const [showExtensionModal, setShowExtensionModal] = useState<boolean>(false);

  // -------------------------------------------------------------
  // KPIS FOR ACTIVE DATE
  // -------------------------------------------------------------
  const kpis = useMemo(() => {
    let totalSlots = 0;
    let bookedSlots = 0;
    let ongoingMatches = 0;
    let maintenanceSlots = 0;
    let availableSlots = 0;
    let totalRevenue = 0;

    Object.values(matrixCells).forEach((cells) => {
      cells.forEach((c) => {
        totalSlots++;
        if (c.state === 'booked') {
          bookedSlots++;
          totalRevenue += c.booking?.totalAmount || c.price;
        } else if (c.state === 'ongoing') {
          bookedSlots++;
          ongoingMatches++;
          totalRevenue += c.booking?.totalAmount || c.price;
        } else if (c.state === 'maintenance') {
          maintenanceSlots++;
        } else if (c.state === 'available') {
          availableSlots++;
        }
      });
    });

    const occupancyRate = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;

    return {
      totalSlots,
      bookedSlots,
      ongoingMatches,
      maintenanceSlots,
      availableSlots,
      totalRevenue,
      occupancyRate,
    };
  }, [matrixCells]);

  return (
    <div className="pb-36 pt-2 px-3.5 sm:px-0 sm:pt-0 w-full space-y-3.5 select-none animate-in fade-in duration-200">
      {/* --------------------------------------------------------- */}
      {/* 1. DATE PICKER SHEET (ALLOWS ANY MONTH & DATE SELECTION)  */}
      {/* --------------------------------------------------------- */}
      <DateMonthPickerSheet
        isOpen={isAdvanceDatePickerOpen}
        onClose={() => setIsAdvanceDatePickerOpen(false)}
        title="Select Booking Date"
        mode="date"
        themeColor="orange"
        activeSelection={currentDate}
        availableDates={advanceBookingDates}
        onSelect={(val) => {
          const parsed = parseAppDate(val);
          setSelectedDateObj(parsed);
          setRangeSelection(null);
          setIsAdvanceDatePickerOpen(false);
          showToast('Date Changed', `Viewing schedule for ${val}`, 'info');
        }}
      />

      {/* --------------------------------------------------------- */}
      {/* 2. TOP HEADER STRIP                                       */}
      {/* --------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E8E6E1]/80">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-[20px] sm:text-[22px] font-black text-[#171717] tracking-tight">Time Track Matrix</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-[#2FA66A]/15 text-[#1E774A] border border-[#2FA66A]/30 flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2FA66A] animate-pulse" />
              <span>{kpis.ongoingMatches > 0 ? `${kpis.ongoingMatches} In Play Now` : `${kpis.occupancyRate}% Occupied`}</span>
            </span>
            <span className="text-[10.5px] font-bold text-[#777570] bg-[#FAF9F6] px-2 py-0.5 rounded border border-[#E8E6E1]">
              {filteredCourts.length} {filteredCourts.length === 1 ? 'Pitch' : 'Pitches'}
            </span>
            {isPastDate && (
              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-black bg-[#F1F5F9] text-[#64748B] border border-[#CBD5E1] flex items-center gap-1">
                <Lock className="w-3 h-3" /> Past Date (Archived)
              </span>
            )}
          </div>
          <p className="text-[11.5px] sm:text-[12px] font-medium text-[#777570] mt-0.5">
            {isPastDate
              ? 'Viewing historical records · Past dates cannot be booked.'
              : 'Select open slots on today & upcoming dates · Continuous multi-hour booking.'}
          </p>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Book Button (Disabled on Past Dates) */}
          <button
            onClick={() => {
              if (isPastDate) {
                showToast('Past Date', 'Cannot book on past dates. Please select today or an upcoming date.', 'warning');
                return;
              }
              haptics.tap();
              setActiveModal('new_booking');
            }}
            disabled={isPastDate}
            className={`h-9 px-3.5 rounded-xl font-black text-[12px] flex items-center justify-center gap-1.5 shadow-2xs active-press cursor-pointer transition-all shrink-0 ${
              isPastDate
                ? 'bg-[#E8E6E1] text-[#A3A099] cursor-not-allowed opacity-60'
                : 'bg-[#FF6B2C] hover:bg-[#e85b1e] text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>New Booking</span>
          </button>

          {/* Block Pitch Button */}
          <button
            onClick={() => {
              haptics.tap();
              setActiveModal('block_slot');
            }}
            className="h-9 px-3.5 rounded-xl bg-white border border-[#E8E6E1] hover:border-[#D94B4B] text-[#171717] hover:text-[#D94B4B] font-extrabold text-[12px] flex items-center justify-center gap-1.5 shadow-2xs active-press cursor-pointer transition-all shrink-0"
          >
            <Ban className="w-3.5 h-3.5 text-[#D94B4B]" />
            <span>Block Pitch</span>
          </button>
        </div>
      </div>

      {/* Mobile View Mode Switcher: App Slot Picker (Default) vs Timeline Matrix */}
      <div className="flex md:hidden items-center bg-[#F1F0EC] p-1 rounded-2xl border border-[#E4E2DC] shadow-2xs">
        <button
          onClick={() => {
            haptics.tap();
            setMobileSlotsMode('picker');
          }}
          className={`flex-1 py-2 rounded-xl text-[12px] font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer active-press ${
            mobileSlotsMode === 'picker'
              ? 'bg-white text-[#171717] shadow-xs'
              : 'text-[#777570] hover:text-[#171717]'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-[#FF6B2C]" />
          <span>App Slot Picker</span>
        </button>
        <button
          onClick={() => {
            haptics.tap();
            setMobileSlotsMode('matrix');
          }}
          className={`flex-1 py-2 rounded-xl text-[12px] font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer active-press ${
            mobileSlotsMode === 'matrix'
              ? 'bg-white text-[#171717] shadow-xs'
              : 'text-[#777570] hover:text-[#171717]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Timeline Matrix</span>
        </button>
      </div>

      {/* --------------------------------------------------------- */}
      {/* 3. DYNAMIC DATE CAROUSEL (CONTINUOUS MONTH NAVIGATION)    */}
      {/* --------------------------------------------------------- */}
      <div className="bg-white rounded-2xl p-3 border border-[#E8E6E1] shadow-2xs relative flex flex-col lg:flex-row items-center justify-between gap-3 min-h-[58px]">
        {/* Left: Quick Jump / Today status */}
        <div className="hidden lg:flex items-center z-10">
          <button
            onClick={() => {
              haptics.tap();
              setSelectedDateObj(new Date(TODAY_BASELINE));
              setRangeSelection(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              isTodayDate
                ? 'bg-[#171717] text-white shadow-2xs'
                : 'bg-[#FAF9F6] border border-[#E8E6E1] text-[#777570] hover:text-[#171717] hover:border-[#171717]/30'
            }`}
          >
            <Sparkles className="w-3 h-3 text-[#FF6B2C]" />
            <span>Jump to Today</span>
          </button>
        </div>

        {/* Center: Dynamic Rolling Carousel PRECISELY CENTERED IN CARD */}
        <div className="lg:absolute lg:inset-x-0 lg:mx-auto flex items-center justify-center gap-1.5 w-full lg:w-fit overflow-x-auto no-scrollbar z-0">
          {/* Previous Day Button */}
          <button
            onClick={() => {
              haptics.tap();
              const prev = new Date(selectedDateObj);
              prev.setDate(selectedDateObj.getDate() - 1);
              setSelectedDateObj(prev);
              setRangeSelection(null);
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#171717] hover:bg-[#F7F7F5] cursor-pointer shrink-0"
            title="Previous Day (Rolls across months)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Rolling Days */}
          <div className="flex items-center justify-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {rollingDays.map((d) => {
              return (
                <button
                  key={d.full}
                  onClick={() => {
                    haptics.tap();
                    setSelectedDateObj(d.dateObj);
                    setRangeSelection(null);
                  }}
                  className={`py-1.5 px-3.5 rounded-xl text-center transition-all cursor-pointer min-w-16 ${
                    d.isSelected
                      ? 'bg-[#171717] text-white shadow-2xs scale-105'
                      : 'bg-[#FAF9F6] border border-[#E8E6E1] text-[#777570] hover:text-[#171717] hover:border-[#171717]/30'
                  }`}
                >
                  <p className="text-[9px] font-black uppercase tracking-wider">
                    {d.dayName} {d.monthShort}
                  </p>
                  <p className="text-[14px] font-black leading-tight mt-0.5">{d.dateNum}</p>
                  {d.isToday && (
                    <span className={`block text-[8px] font-black tracking-widest ${d.isSelected ? 'text-[#FF6B2C]' : 'text-[#2FA66A]'}`}>
                      TODAY
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Next Day Button */}
          <button
            onClick={() => {
              haptics.tap();
              const next = new Date(selectedDateObj);
              next.setDate(selectedDateObj.getDate() + 1);
              setSelectedDateObj(next);
              setRangeSelection(null);
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#171717] hover:bg-[#F7F7F5] cursor-pointer shrink-0"
            title="Next Day (Rolls into next month)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Date Picker Button */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-2 lg:pt-0 border-[#F1F0EC] z-10 ml-auto">
          <button
            onClick={() => {
              haptics.tap();
              setIsAdvanceDatePickerOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl border border-[#E8E6E1] hover:border-[#FF6B2C] bg-white text-[#171717] text-[12px] font-black flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
          >
            <CalendarIcon className="w-4 h-4 text-[#FF6B2C]" />
            <span>{currentDate}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#777570]" />
          </button>
        </div>
      </div>

      {/* --------------------------------------------------------- */}
      {/* 4. FINANCIAL & OCCUPANCY KPIS STRIP                       */}
      {/* --------------------------------------------------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-3.5 border border-[#E8E6E1] shadow-2xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#777570] block">Day Occupancy</span>
          <p className="text-[20px] font-black text-[#171717] mt-0.5">{kpis.occupancyRate}%</p>
          <p className="text-[11px] text-[#2FA66A] font-bold mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{kpis.bookedSlots} booked sessions</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-[#E8E6E1] shadow-2xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#777570] block">Revenue On Date</span>
          <p className="text-[20px] font-black text-[#2FA66A] mt-0.5">₹{kpis.totalRevenue.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-[#777570] font-medium mt-0.5">Estimated gross slot value</p>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-[#E8E6E1] shadow-2xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#777570] block">Open Available Slots</span>
          <p className="text-[20px] font-black text-[#171717] mt-0.5">{isPastDate ? 0 : kpis.availableSlots}</p>
          <p className="text-[11px] text-[#FF6B2C] font-bold mt-0.5">
            {isPastDate ? 'Historical record (Closed)' : 'Ready for continuous booking'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-[#E8E6E1] shadow-2xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#777570] block">Maintenance Blocks</span>
          <p className="text-[20px] font-black text-[#D94B4B] mt-0.5">{kpis.maintenanceSlots}</p>
          <p className="text-[11px] text-[#777570] font-medium mt-0.5">Reserved for pitch servicing</p>
        </div>
      </div>

      {/* --------------------------------------------------------- */}
      {/* 5. SPORT FILTER STRIP & LEGEND                            */}
      {/* --------------------------------------------------------- */}
      <div className="bg-white rounded-2xl p-3.5 border border-[#E8E6E1] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 flex-wrap">
        {/* Sports Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-black text-[#777570] uppercase mr-1 shrink-0">Sport:</span>
          {availableSports.map((sport) => {
            const isSelected = selectedSportFilter === sport;
            return (
              <button
                key={sport}
                onClick={() => {
                  haptics.tap();
                  setSelectedSportFilter(sport);
                  setRangeSelection(null);
                }}
                className={`px-3 py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#FF6B2C] text-white shadow-2xs'
                    : 'bg-[#FAF9F6] border border-[#E8E6E1] text-[#777570] hover:text-[#171717]'
                }`}
              >
                {sport}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11.5px] font-bold text-[#777570] flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#FF6B2C] shadow-2xs ring-2 ring-[#FF6B2C]/20" />
            <span className="text-[#171717]">Selected Range</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#2FA66A] shadow-2xs" />
            <span className="text-[#171717]">In Play (Live)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#171717] shadow-2xs" />
            <span className="text-[#171717]">Confirmed</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#FEF3C7] border border-[#FCD34D]" />
            <span className="text-[#D97706]">Hold Active</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#CBD5E1]" />
            <span className="text-[#777570]">Closed / Passed</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full border border-[#E8E6E1] bg-[#FAF9F6]" />
            <span className="text-[#171717]">Available (₹ Price)</span>
          </span>
        </div>
      </div>

      {/* --------------------------------------------------------- */}
      {/* 6A. MOBILE NATIVE APP SLOT PICKER (BEST-IN-CLASS UX)     */}
      {/* --------------------------------------------------------- */}
      {mobileSlotsMode === 'picker' && (
        <div className="block md:hidden space-y-3.5 animate-in fade-in duration-200">
          {/* Pitch Horizontal Swipeable Cards */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#777570]">
                Select Pitch ({filteredCourts.length})
              </span>
              <span className="text-[10.5px] font-bold text-[#FF6B2C]">
                {courtStats[selectedCourt?.id]?.available || 0} Open Today
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
              {filteredCourts.map((court) => {
                const isCourtActive = court.id === selectedCourtId;
                const stats = courtStats[court.id] || { available: 0, booked: 0, inPlay: 0 };
                return (
                  <button
                    key={court.id}
                    onClick={() => {
                      haptics.tap();
                      setSelectedCourtId(court.id);
                      if (rangeSelection && rangeSelection.courtId !== court.id) {
                        setRangeSelection(null);
                      }
                    }}
                    className={`shrink-0 min-w-[145px] p-2.5 rounded-2xl text-left border transition-all cursor-pointer active:scale-[0.98] ${
                      isCourtActive
                        ? 'bg-[#171717] text-white border-[#171717] shadow-sm ring-2 ring-[#FF6B2C]/40'
                        : 'bg-white border-[#E8E6E1] text-[#171717] hover:border-[#D0CECB]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5 mb-1">
                      <span className="text-[13px] font-black truncate">{court.name}</span>
                      <span
                        className={`text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-md ${
                          isCourtActive
                            ? 'bg-white/20 text-white'
                            : 'bg-[#FAF9F6] text-[#777570] border border-[#E8E6E1]'
                        }`}
                      >
                        {court.sports[0] || 'Sport'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-medium">
                      <span className={isCourtActive ? 'text-[#FF9D66] font-bold' : 'text-[#777570]'}>
                        ₹{court.pricePerHour || 1000}/h
                      </span>
                      <span className={`font-bold text-[10.5px] ${isCourtActive ? 'text-[#34D399]' : 'text-[#2FA66A]'}`}>
                        {stats.available} Free
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Selection Guide Micro-Banner */}
          <div className="bg-gradient-to-r from-[#FAF9F6] to-white rounded-2xl p-3 border border-[#E8E6E1] flex items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#FF6B2C]/10 border border-[#FF6B2C]/30 text-[#FF6B2C] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-black text-[#171717] truncate">
                  {selectedCourt?.name || 'Pitch'} · {currentDate}
                </p>
                <p className="text-[10.5px] text-[#777570] font-medium truncate">
                  {rangeSelection && rangeSelection.courtId === selectedCourt?.id
                    ? `${rangeSelection.slotsCount} slot selected (${rangeSelection.startTime} – ${rangeSelection.endTime})`
                    : 'Tap open slot to start · Tap 2nd slot for range'}
                </p>
              </div>
            </div>
            {rangeSelection && rangeSelection.courtId === selectedCourt?.id && (
              <button
                onClick={() => {
                  haptics.tap();
                  setRangeSelection(null);
                }}
                className="text-[10.5px] font-bold text-[#D94B4B] bg-[#D94B4B]/10 px-2 py-1 rounded-lg shrink-0 cursor-pointer active-press"
              >
                Reset
              </button>
            )}
          </div>

          {/* Grouped Day-Part Time Blocks */}
          <div className="space-y-3">
            {timeBlocks.map((block) => {
              const availableInBlock = block.cells.filter((c) => c.state === 'available').length;
              if (block.cells.length === 0) return null;

              return (
                <div
                  key={block.id}
                  className="bg-white rounded-2xl p-3 border border-[#E8E6E1] shadow-2xs space-y-2.5"
                >
                  {/* Block Header */}
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#F1F0EC]">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] leading-none">{block.icon}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-[12.5px] font-black text-[#171717]">{block.label}</h3>
                          {block.isPeak && (
                            <span className="text-[8.5px] font-black px-1.5 py-0.2 rounded bg-[#FF6B2C]/10 text-[#FF6B2C] border border-[#FF6B2C]/25 uppercase tracking-wide">
                              Peak
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-medium text-[#777570]">{block.time}</p>
                      </div>
                    </div>
                    <span
                      className={`text-[9.5px] font-black px-2 py-0.5 rounded-full ${
                        availableInBlock > 0
                          ? 'bg-[#2FA66A]/10 text-[#1E774A] border border-[#2FA66A]/20'
                          : 'bg-[#F1F0EC] text-[#777570]'
                      }`}
                    >
                      {availableInBlock} Open
                    </span>
                  </div>

                  {/* 2-Column Responsive Touch Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {block.cells.map((cell) => {
                      const isCourtSelected = rangeSelection?.courtId === cell.courtId;
                      const isSelectedSlot =
                        isCourtSelected &&
                        rangeSelection &&
                        cell.slotIndex >= rangeSelection.startIndex &&
                        cell.slotIndex <= rangeSelection.endIndex;

                      const isSelectionStart = isSelectedSlot && cell.slotIndex === rangeSelection?.startIndex;
                      const isSelectionEnd = isSelectedSlot && cell.slotIndex === rangeSelection?.endIndex;
                      const isSingle = isSelectedSlot && rangeSelection?.startIndex === rangeSelection?.endIndex;

                      const isAvailable = cell.state === 'available';
                      const isOngoing = cell.state === 'ongoing';
                      const isBooked = cell.state === 'booked';
                      const isPending = cell.state === 'pending';
                      const isMaintenance = cell.state === 'maintenance';
                      const isClosed = cell.state === 'closed' || cell.isPast;

                      return (
                        <button
                          key={`mobile-cell-${cell.courtId}-${cell.slotIndex}`}
                          onClick={() => handleSlotTrackClick(cell)}
                          disabled={isClosed}
                          className={`p-2.5 rounded-xl text-left transition-all relative flex flex-col justify-between min-h-[64px] select-none ${
                            isSelectedSlot
                              ? 'bg-gradient-to-br from-[#FF6B2C] to-[#FA5A14] text-white shadow-md shadow-[#FF6B2C]/30 ring-2 ring-[#FF6B2C] cursor-pointer active:scale-[0.98]'
                              : isOngoing
                              ? 'bg-[#2FA66A]/10 border border-[#2FA66A]/30 text-[#1E774A] hover:bg-[#2FA66A]/15 cursor-pointer active:scale-[0.98]'
                              : isBooked
                              ? 'bg-[#171717]/5 border border-[#171717]/15 text-[#171717] hover:bg-[#171717]/10 cursor-pointer active:scale-[0.98]'
                              : isPending
                              ? 'bg-[#FEF3C7] border border-[#FCD34D] text-[#D97706] hover:bg-[#FDE68A] cursor-pointer active:scale-[0.98]'
                              : isMaintenance
                              ? 'bg-[#F1F5F9] border border-[#CBD5E1] text-[#475569] cursor-pointer active:scale-[0.98]'
                              : isClosed
                              ? 'bg-[#F8F7F5] border border-[#E8E6E1]/60 text-[#A3A099] opacity-50 cursor-not-allowed'
                              : 'bg-[#FAF9F6] border border-[#E8E6E1] hover:border-[#FF6B2C]/40 text-[#171717] hover:bg-white shadow-2xs cursor-pointer active:scale-[0.98]'
                          }`}
                        >
                          {/* Top Row: Time & State Badge */}
                          <div className="flex items-center justify-between gap-1 w-full">
                            <span className={`text-[12px] font-black ${isSelectedSlot ? 'text-white' : ''}`}>
                              {cell.displayStartTime}
                            </span>

                            {isSelectedSlot ? (
                              <span className="text-[8.5px] font-black uppercase bg-white/20 text-white px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                                <span>{isSingle ? 'Selected' : isSelectionStart ? 'Start' : isSelectionEnd ? 'End' : 'In'}</span>
                              </span>
                            ) : isOngoing ? (
                              <span className="w-2 h-2 rounded-full bg-[#2FA66A] animate-ping" />
                            ) : isBooked ? (
                              <span className="text-[8.5px] font-bold text-[#777570] bg-white px-1 py-0.2 rounded border border-[#E8E6E1]">
                                Booked
                              </span>
                            ) : isPending ? (
                              <span className="text-[8.5px] font-bold text-[#D97706] bg-white/70 px-1 py-0.2 rounded">
                                Hold
                              </span>
                            ) : isMaintenance ? (
                              <Ban className="w-3 h-3 text-[#D94B4B]" />
                            ) : isClosed ? (
                              <span className="text-[8.5px] font-medium text-[#A3A099]">
                                Passed
                              </span>
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#2FA66A]" />
                            )}
                          </div>

                          {/* Bottom Row: Detail Label / Price */}
                          <div className="flex items-center justify-between gap-1 w-full mt-1.5 pt-1 border-t border-black/5">
                            <span className={`text-[9.5px] font-medium truncate ${isSelectedSlot ? 'text-white/85' : 'text-[#777570]'}`}>
                              {isSelectedSlot
                                ? `${cell.displayStartTime}–${cell.displayEndTime}`
                                : isOngoing
                                ? (cell.booking?.customerName ? `Live · ${cell.booking.customerName.split(' ')[0]}` : 'Live Match')
                                : isBooked
                                ? (cell.booking?.customerName ? cell.booking.customerName.split(' ')[0] : 'Reserved')
                                : isPending
                                ? 'Payment Due'
                                : isMaintenance
                                ? 'Maintenance'
                                : isClosed
                                ? 'Closed'
                                : '1h Slot'}
                            </span>

                            <span
                              className={`text-[11px] font-black shrink-0 ${
                                isSelectedSlot
                                  ? 'text-white'
                                  : isOngoing || isBooked
                                  ? 'text-[#777570]'
                                  : isClosed
                                  ? 'text-[#A3A099]'
                                  : 'text-[#171717]'
                              }`}
                            >
                              ₹{cell.price}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* 6B. CONTINUOUS TIME TRACK (STICKY COURT NAMES + ONLY TIME SCROLLS) */}
      {/* --------------------------------------------------------- */}
      <div
        className={`bg-white rounded-3xl p-6 border border-[#E8E6E1] shadow-2xs space-y-6 overflow-hidden text-[#171717] ${
          mobileSlotsMode === 'picker' ? 'hidden md:block' : 'block'
        }`}
      >
        {/* Instructions Banner */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E6E1] flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#2563EB]/10 border border-[#2563EB]/30 text-[#2563EB]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[14.5px] font-black tracking-tight text-[#171717]">
                {currentDate} · Pitch Time Tracks
              </h2>
              <p className="text-[11.5px] font-medium text-[#777570]">
                {isPastDate
                  ? 'Historical Date · Slots are closed for booking'
                  : 'Court names stay fixed on left · Scroll right across hours · Tap start & end to book'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                isPastDate
                  ? 'text-[#DC2626] bg-[#FEE2E2] border-[#FCA5A5]'
                  : 'text-[#777570] bg-[#FAF9F6] border-[#E8E6E1]'
              }`}
            >
              {isPastDate ? 'Read-Only Historical View' : 'Standard 1-Hour Intervals'}
            </span>
          </div>
        </div>

        {/* Horizontal Tracks Container with STICKY Court Names */}
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[1100px]">
            {/* Timeline Row Header */}
            <div className="flex items-center pb-3 border-b border-[#E8E6E1]">
              {/* STICKY Court Header Column (DOES NOT SCROLL) */}
              <div className="w-[115px] min-w-[115px] sm:w-[240px] sm:min-w-[240px] shrink-0 sticky left-0 z-30 px-2 sm:px-3.5 py-1.5 border-r border-[#E8E6E1] bg-white flex items-center justify-between shadow-[4px_0_12px_-4px_rgba(0,0,0,0.06)]">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#777570]">
                  Courts
                </span>
                <span className="text-[9.5px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#FAF9F6] border border-[#E8E6E1] text-[#777570]">
                  {filteredCourts.length}
                </span>
              </div>

              {/* Top Hours Track (SCROLLS HORIZONTALLY) */}
              <div
                className="flex-1 grid pl-3"
                style={{ gridTemplateColumns: `repeat(${standardTimeSlots.length}, minmax(58px, 1fr))` }}
              >
                {standardTimeSlots.map((timeDef, idx) => (
                  <div key={timeDef.time} className="flex items-center justify-center text-center">
                    <span className="text-[12px] font-black tracking-tight whitespace-nowrap text-[#171717]">
                      {timeDef.label}
                    </span>
                    {idx < standardTimeSlots.length - 1 && (
                      <span className="text-[10px] mx-1 select-none text-[#A3A099]">
                        ·
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Court Tracks List */}
            <div className="divide-y divide-[#F1F0EC] pt-2">
              {filteredCourts.map((court) => {
                const cells = matrixCells[court.id] || [];
                const isCourtSelected = rangeSelection?.courtId === court.id;
                const bookedCount = cells.filter((c) => c.state === 'booked' || c.state === 'ongoing').length;
                const occPct = cells.length > 0 ? Math.round((bookedCount / cells.length) * 100) : 0;

                return (
                  <div
                    key={court.id}
                    className="flex items-center py-3.5 hover:bg-[#FAF9F6]/60 transition-colors"
                  >
                    {/* STICKY Court Info Column: Compact on mobile, 240px on desktop (DOES NOT SCROLL) */}
                    <div className="w-[115px] min-w-[115px] sm:w-[240px] sm:min-w-[240px] shrink-0 sticky left-0 z-30 px-2 sm:px-3.5 py-2 sm:py-2.5 border-r border-[#E8E6E1] bg-white shadow-[4px_0_12px_-4px_rgba(0,0,0,0.06)] flex flex-col justify-center gap-1">
                      {/* Row 1: Court Avatar + Name + Sport Badge */}
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#171717] text-white flex items-center justify-center font-black text-[10px] sm:text-[11px] shrink-0 shadow-2xs">
                            {court.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                          </span>
                          <h3 className="text-[11.5px] sm:text-[13.5px] font-black tracking-tight truncate text-[#171717]">
                            {court.name}
                          </h3>
                        </div>
                        <span className="hidden sm:inline-block text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-[#FAF9F6] border border-[#E8E6E1] text-[#777570] shrink-0">
                          {court.sports[0] === 'Football' ? '⚽ Football' : court.sports[0] === 'Badminton' ? '🏸 Badminton' : court.sports[0] === 'Pickleball' ? '🏓 Pickleball' : court.sports[0] === 'Cricket' ? '🏏 Cricket' : court.sports[0]}
                        </span>
                      </div>

                      {/* Row 2: Price / hr + Occupancy Indicator */}
                      <div className="flex items-center justify-between gap-1 text-[10px] sm:text-[11px]">
                        <div className="flex items-center gap-0.5 sm:gap-1">
                          <span className="font-extrabold text-[#171717]">
                            ₹{court.pricePerHour}
                          </span>
                          <span className="text-[9px] sm:text-[10px] text-[#A3A099]">/hr</span>
                        </div>
                        <div>
                          {occPct > 0 ? (
                            <span className="flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10.5px] font-black text-[#2FA66A] bg-[#2FA66A]/10 px-1.5 sm:px-2 py-0.5 rounded-full border border-[#2FA66A]/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#2FA66A] animate-pulse" />
                              <span>{occPct}%</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10.5px] font-bold text-[#777570] bg-[#FAF9F6] px-1.5 sm:px-2 py-0.5 rounded-full border border-[#E8E6E1]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#D4D2CD]" />
                              <span className="hidden sm:inline">Available</span>
                              <span className="sm:hidden">Open</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Track: Continuous Segmented Pill Bar (SCROLLS HORIZONTALLY) */}
                    <div className="flex-1 pl-3">
                      <div
                        className="grid h-12 rounded-full p-1 relative shadow-inner bg-[#FAF9F6] border border-[#E8E6E1]"
                        style={{ gridTemplateColumns: `repeat(${standardTimeSlots.length}, minmax(58px, 1fr))` }}
                      >
                        {cells.map((cell, idx) => {
                          const isAvailable = cell.state === 'available';
                          const isOngoing = cell.state === 'ongoing';
                          const isBooked = cell.state === 'booked';
                          const isPending = cell.state === 'pending';
                          const isMaintenance = cell.state === 'maintenance';
                          const isClosed = cell.state === 'closed' || cell.isPast;

                          // Check if slot is within active continuous range
                          const isSelectedSlot =
                            isCourtSelected &&
                            rangeSelection &&
                            idx >= rangeSelection.startIndex &&
                            idx <= rangeSelection.endIndex;

                          const isSelectionStart = isSelectedSlot && idx === rangeSelection.startIndex;
                          const isSelectionEnd = isSelectedSlot && idx === rangeSelection.endIndex;

                          // Outer pill ends
                          let roundedClass = '';
                          if (idx === 0) roundedClass = 'rounded-l-full';
                          if (idx === standardTimeSlots.length - 1) roundedClass += ' rounded-r-full';

                          return (
                            <div
                              key={`track-${court.id}-${idx}`}
                              onClick={() => handleSlotTrackClick(cell)}
                              title={
                                isClosed
                                  ? `${cell.timeSlot} - Closed (Passed)`
                                  : `${cell.timeSlot} (${cell.state}) - ₹${cell.price}`
                              }
                              className={`h-full relative transition-all flex items-center justify-center select-none ${
                                /* 1. ACTIVE CONTINUOUS SELECTION (PERFECT THEME-BASED ORANGE) */
                                isSelectedSlot
                                  ? `bg-gradient-to-r from-[#FF6B2C] to-[#FA5A14] text-white z-10 ${
                                      isSelectionStart ? 'rounded-l-full' : ''
                                    } ${isSelectionEnd ? 'rounded-r-full' : ''} shadow-[0_3px_10px_rgba(255,107,44,0.35)] ring-1 ring-[#FF6B2C] cursor-pointer`
                                  : /* 2. ONGOING MATCH (LIVE) */
                                  isOngoing
                                  ? 'bg-[#2FA66A] text-white shadow-xs cursor-pointer'
                                  : /* 3. CONFIRMED BOOKING */
                                  isBooked
                                  ? 'bg-[#171717] text-white border-r border-neutral-700 cursor-pointer hover:bg-black transition-colors'
                                  : /* 4. HOLD / PAYMENT LINK PENDING */
                                  isPending
                                  ? 'bg-[#FEF3C7] text-[#D97706] border border-[#FCD34D] cursor-pointer hover:bg-[#FDE68A] transition-colors'
                                  : /* 5. MAINTENANCE */
                                  isMaintenance
                                  ? 'bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1] cursor-pointer'
                                  : /* 6. CLOSED / PASSED SLOTS (NOT CLICKABLE FOR BOOKING) */
                                  isClosed
                                  ? `bg-[#ECEAE4]/50 border-r border-[#E8E6E1] last:border-r-0 cursor-not-allowed opacity-50 ${roundedClass}`
                                  : /* 7. AVAILABLE OPEN SLOTS (CLICKABLE FOR BOOKING) */
                                  `bg-transparent hover:bg-white border-r border-[#E8E6E1] last:border-r-0 text-[#777570] hover:text-[#171717] hover:shadow-2xs cursor-pointer ${roundedClass}`
                              }`}
                            >
                              {/* Content inside segment */}
                              {isSelectedSlot ? (
                                <div className="text-center px-1 truncate">
                                  {isSelectionStart ? (
                                    <span className="text-[11px] font-black block leading-none">
                                      {rangeSelection?.slotsCount && rangeSelection.slotsCount > 1
                                        ? `${rangeSelection.durationMinutes / 60}h`
                                        : 'Select'}
                                    </span>
                                  ) : isSelectionEnd ? (
                                    <span className="text-[10px] font-black block leading-none">
                                      ✓
                                    </span>
                                  ) : (
                                    <span className="w-1.5 h-1.5 rounded-full bg-white/50 block mx-auto" />
                                  )}
                                </div>
                              ) : isOngoing ? (
                                <div className="flex items-center gap-1 px-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                  <span className="text-[10px] font-black truncate">Live</span>
                                </div>
                              ) : isBooked ? (
                                <span className="text-[10px] font-bold truncate px-1 text-white">
                                  {cell.booking?.customerName.split(' ')[0]}
                                </span>
                              ) : isPending ? (
                                <div className="flex items-center gap-1 px-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
                                  <span className="text-[9.5px] font-black truncate text-[#D97706]">Hold</span>
                                </div>
                              ) : isMaintenance ? (
                                <span className="text-[9.5px] font-bold truncate px-1">
                                  Blocked
                                </span>
                              ) : isClosed ? (
                                <span className="text-[9px] font-bold text-[#A3A099] select-none">
                                  Closed
                                </span>
                              ) : (
                                <span className="text-[10.5px] font-bold text-[#777570] hover:text-[#171717] transition-colors">
                                  ₹{cell.price}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------- */}
      {/* 7. DOCKED CONTINUOUS RANGE CONFIRMATION BAR               */}
      {/* --------------------------------------------------------- */}
      <AnimatePresence>
        {rangeSelection && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4"
          >
            <div className="bg-[#171717] text-white p-3 sm:p-4 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#FF6B2C] text-white flex items-center justify-center shrink-0 font-black shadow-md shadow-[#FF6B2C]/25">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-[13px] sm:text-[14.5px] font-black text-white truncate">
                      {rangeSelection.courtName}
                    </h4>
                    <span className="text-[10px] sm:text-[11px] font-black bg-[#FF6B2C] text-white px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-md shadow-2xs">
                      {rangeSelection.slotsCount} {rangeSelection.slotsCount === 1 ? 'Slot' : 'Slots'} ({rangeSelection.durationMinutes / 60}h)
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-[12px] text-white/70 font-medium truncate mt-0.5">
                    {rangeSelection.startTime} – {rangeSelection.endTime} · <strong className="text-[#FF6B2C]">₹{rangeSelection.totalPrice}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  onClick={() => setRangeSelection(null)}
                  className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-white/20 text-white/80 hover:text-white text-[11px] sm:text-[12px] font-bold cursor-pointer transition-colors active-press"
                >
                  Clear
                </button>
                <button
                  onClick={handleProceedBookingContinuous}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#FF6B2C] to-[#e85b1e] hover:from-[#e85b1e] hover:to-[#db4a0b] text-white font-black text-[11px] sm:text-[12px] flex items-center gap-1 sm:gap-1.5 shadow-md shadow-[#FF6B2C]/30 active-press cursor-pointer transition-all whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                  <span>Book {rangeSelection.durationMinutes / 60}h</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --------------------------------------------------------- */}
      {/* 8. INTERACTIVE SLOT DETAILS MODAL (MOBILE BOTTOM SHEET)   */}
      {/* --------------------------------------------------------- */}
      {selectedCell && (
        <div
          onClick={() => {
            setSelectedCell(null);
            setShowExtensionModal(false);
          }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-lg bg-white rounded-t-[32px] sm:rounded-3xl p-5 sm:p-6 border border-[#E8E6E1] shadow-2xl space-y-4 max-h-[88vh] sm:max-h-[90vh] overflow-y-auto pb-safe animate-in slide-in-from-bottom duration-200"
          >
            {/* Native Mobile Drag Handle */}
            <div className="w-12 h-1.5 bg-[#E2E0D8] rounded-full mx-auto -mt-1 mb-2 sm:hidden" />
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F0EC]">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-2xl bg-[#171717] text-white flex items-center justify-center font-black text-[15px]">
                  {selectedCell.courtName.slice(0, 1)}
                </span>
                <div>
                  <h3 className="text-[16px] font-black text-[#171717]">
                    {selectedCell.courtName} · {selectedCell.timeSlot}
                  </h3>
                  <p className="text-[12px] text-[#777570] font-medium">
                    {currentDate} · {selectedCell.sport}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedCell(null);
                  setShowExtensionModal(false);
                }}
                className="w-8 h-8 rounded-full bg-[#FAF9F6] flex items-center justify-center text-[#777570] hover:text-[#171717] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedCell.booking ? (
              <div className="bg-[#FAF9F6] rounded-2xl p-4 border border-[#E8E6E1] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-[15px] font-black text-[#171717]">
                      {selectedCell.booking.customerName}
                    </h4>
                    <p className="text-[12px] text-[#777570] font-medium flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-[#FF6B2C]" />
                      <span>{selectedCell.booking.customerPhone}</span>
                    </p>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-[#777570] bg-white px-2 py-1 rounded-lg border border-[#E8E6E1]">
                    {selectedCell.booking.id}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E8E6E1]/80 text-center">
                  <div className="bg-white p-2 rounded-xl border border-[#E8E6E1]">
                    <span className="text-[10px] text-[#777570] uppercase font-bold block">Total Fee</span>
                    <span className="text-[13.5px] font-black text-[#171717]">₹{selectedCell.booking.totalAmount}</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-[#E8E6E1]">
                    <span className="text-[10px] text-[#777570] uppercase font-bold block">Paid</span>
                    <span className="text-[13.5px] font-black text-[#2FA66A]">₹{selectedCell.booking.paidAmount}</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-[#E8E6E1]">
                    <span className="text-[10px] text-[#777570] uppercase font-bold block">Balance</span>
                    <span className={`text-[13.5px] font-black ${selectedCell.booking.balanceAmount > 0 ? 'text-[#FF6B2C]' : 'text-[#777570]'}`}>
                      ₹{selectedCell.booking.balanceAmount}
                    </span>
                  </div>
                </div>
              </div>
            ) : selectedCell.state === 'maintenance' ? (
              <div className="bg-[#D94B4B]/10 rounded-2xl p-4 border border-[#D94B4B]/25">
                <h4 className="text-[14px] font-black text-[#D94B4B] flex items-center gap-1.5">
                  <Ban className="w-4 h-4" />
                  <span>Maintenance Blocked</span>
                </h4>
                <p className="text-[12px] text-[#777570] mt-1">
                  Reason: {selectedCell.maintenanceReason}
                </p>
              </div>
            ) : null}

            {showExtensionModal && selectedCell.booking && (() => {
              const cellCourt = courts.find((c) => c.id === selectedCell.courtId) || courts[0];
              const extData = getAvailableExtensionSlots(selectedCell.booking, bookings, cellCourt);
              const activeOption = extensionMinutes !== null
                ? extData.availableOptions.find((o) => o.addedMinutes === extensionMinutes) || null
                : null;

              return (
                <div className="bg-[#FAF9F6] rounded-2xl p-4 border border-[#FF6B2C]/30 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-black text-[#171717] flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#FF6B2C]" />
                      <span>Extend Session Time</span>
                    </span>
                    {activeOption ? (
                      <span className="text-[11px] text-[#FF6B2C] font-bold">
                        +₹{activeOption.addedFee} added to due balance
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#B87C0D] font-bold bg-[#FFF8E6] px-2 py-0.5 rounded-md border border-[#FFE082]">
                        Selection Required
                      </span>
                    )}
                  </div>

                  {extData.hasConflict ? (
                    <div className="space-y-2">
                      <div className="bg-[#D94B4B]/10 border border-[#D94B4B]/30 rounded-xl p-3 text-[11.5px] text-[#B52B2B] space-y-1">
                        <p className="font-bold flex items-center gap-1.5 text-[12px]">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>Extension Not Allowed</span>
                        </p>
                        <p className="text-[10.5px] leading-relaxed text-[#8A1A1A]">
                          {extData.conflictMessage || 'Next slot is already booked by another player. Court extension is not allowed.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled
                        className="w-full h-10 rounded-xl bg-[#F1F0EC] text-[#A09D96] font-bold text-[11.5px] cursor-not-allowed flex items-center justify-center gap-1.5 border border-[#E8E6E1]"
                      >
                        <Ban className="w-3.5 h-3.5 text-[#D94B4B]" />
                        <span>Extension Not Allowed</span>
                      </button>
                    </div>
                  ) : extData.availableOptions.length === 0 ? (
                    <div className="space-y-2">
                      <div className="bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl p-3 text-[11.5px] text-[#777570] text-center space-y-1">
                        <p className="font-bold text-[#D94B4B] flex items-center justify-center gap-1">
                          <Ban className="w-3.5 h-3.5" />
                          <span>Extension Not Allowed</span>
                        </p>
                        <p className="text-[10.5px]">Court operating hours end after this match schedule.</p>
                      </div>
                      <button
                        type="button"
                        disabled
                        className="w-full h-10 rounded-xl bg-[#F1F0EC] text-[#A09D96] font-bold text-[11.5px] cursor-not-allowed flex items-center justify-center gap-1.5 border border-[#E8E6E1]"
                      >
                        <Ban className="w-3.5 h-3.5 text-[#D94B4B]" />
                        <span>Extension Not Allowed</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] font-bold text-[#777570] block">
                          Select extra hours to extend:
                        </span>
                        {!activeOption && (
                          <span className="text-[10px] text-[#D94B4B] font-bold">
                            * Selection Required
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-0.5">
                        {extData.availableOptions.map((opt) => {
                          const isSelected = extensionMinutes === opt.addedMinutes;
                          return (
                            <button
                              key={opt.addedMinutes}
                              type="button"
                              onClick={() => {
                                haptics.tap();
                                setExtensionMinutes(opt.addedMinutes);
                              }}
                              className={`w-full p-2.5 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                                isSelected
                                  ? 'bg-[#171717] text-white border-[#171717] ring-2 ring-[#FF6B2C]/40 shadow-2xs'
                                  : 'bg-white border-[#E8E6E1] text-[#777570] hover:text-[#171717] hover:border-[#D0CECB]'
                              }`}
                            >
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[11.5px] font-bold block">{opt.label}</span>
                                  {isSelected && (
                                    <span className="px-1 py-0.2 rounded bg-[#FF6B2C] text-white text-[9px] font-extrabold uppercase">
                                      Selected
                                    </span>
                                  )}
                                </div>
                                <span className={`text-[10px] ${isSelected ? 'text-[#FF9D66]' : 'text-[#777570]'}`}>
                                  Total: {opt.newFullTimeSlot}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className={`text-[12px] font-black block ${isSelected ? 'text-[#FF6B2C]' : 'text-[#171717]'}`}>
                                  +₹{opt.addedFee}
                                </span>
                                <span className="text-[9px] font-bold text-[#2FA66A] uppercase">
                                  Available
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        disabled={!activeOption}
                        onClick={() => {
                          if (selectedCell.booking && activeOption) {
                            haptics.success();
                            extendBookingSlot(
                              selectedCell.booking.id,
                              activeOption.addedMinutes,
                              activeOption.addedFee,
                              activeOption.newFullTimeSlot
                            );
                            setShowExtensionModal(false);
                            setSelectedCell(null);
                          }
                        }}
                        className={`w-full h-10 rounded-xl font-black text-[12px] shadow-2xs transition-colors flex items-center justify-center gap-1.5 ${
                          activeOption
                            ? 'bg-[#FF6B2C] hover:bg-[#e85b1e] text-white cursor-pointer'
                            : 'bg-[#E8E6E1] text-[#777570] border border-[#D5D3CC] cursor-not-allowed'
                        }`}
                      >
                        {activeOption ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>
                              Confirm Extension ({activeOption.newFullTimeSlot} · +₹{activeOption.addedFee})
                            </span>
                          </>
                        ) : (
                          <>
                            <Ban className="w-3.5 h-3.5 text-[#777570]" />
                            <span>Select Extra Hours (Not Allowed Without Selection)</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="pt-2 space-y-2">
              {selectedCell.booking && selectedCell.state === 'ongoing' && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      haptics.tap();
                      setExtensionMinutes(null);
                      setShowExtensionModal(true);
                    }}
                    className="h-10 rounded-xl bg-[#171717] hover:bg-[#2e2e2e] text-white font-black text-[11.5px] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5 text-[#FF6B2C]" />
                    <span>Extend Session</span>
                  </button>
                  <button
                    onClick={() => {
                      checkOutBooking(selectedCell.booking!.id);
                      setSelectedCell(null);
                    }}
                    className="h-10 rounded-xl bg-[#2FA66A] hover:bg-[#258756] text-white font-black text-[11.5px] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Check Out & Settle</span>
                  </button>
                </div>
              )}

              {selectedCell.booking && selectedCell.state === 'booked' && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      checkInBooking(selectedCell.booking!.id);
                      setSelectedCell(null);
                    }}
                    className="h-10 rounded-xl bg-[#2FA66A] hover:bg-[#258756] text-white font-black text-[11.5px] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Check In Players</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBookingId(selectedCell.booking!.id);
                      setActiveModal('payment_options');
                      setSelectedCell(null);
                    }}
                    className="h-10 rounded-xl bg-white border border-[#E8E6E1] hover:bg-[#FAF9F6] text-[#171717] font-black text-[11.5px] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-[#FF6B2C]" />
                    <span>Collect Payment</span>
                  </button>
                </div>
              )}

              {/* HOLD / PAYMENT PENDING MODAL ACTIONS (ONLY IF NOT EXPIRED) */}
              {selectedCell.booking &&
                (selectedCell.state === 'pending' || selectedCell.booking.status === 'Payment Pending') &&
                selectedCell.state !== 'expired' &&
                selectedCell.booking.status !== 'Expired' && (
                <div className="space-y-2">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-800 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-600" />
                      Pending Payment (Due: ₹{selectedCell.booking.balanceAmount})
                    </span>
                    <span className="font-bold text-amber-700">Payment Pending</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedBookingId(selectedCell.booking!.id);
                      setActiveModal('payment_link');
                      setSelectedCell(null);
                    }}
                    className="w-full h-10 rounded-xl bg-[#FF6B2C] hover:bg-[#e85b1e] text-white font-black text-[12px] flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                  >
                    <Link2 className="w-4 h-4" />
                    <span>View & Share Payment Link</span>
                  </button>
                </div>
              )}

              {/* EXPIRED HOLD MODAL ACTIONS: RE-LOCK WITH EXTENDED DURATION */}
              {(selectedCell.state === 'expired' || selectedCell.booking?.status === 'Expired') && selectedCell.booking && (
                <div className="space-y-2.5">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-bold text-red-800 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      Hold Expired (Unpaid Slot)
                    </span>
                    <span className="font-bold text-red-700">Expired</span>
                  </div>

                  {/* Hold Duration Increment Selector */}
                  <div className="bg-[#FAF9F6] border border-[#E8E6E1] p-2.5 rounded-xl space-y-1.5">
                    <span className="text-[10.5px] font-bold text-[#777570] block">
                      Select Re-lock Hold Duration:
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[15, 30, 45, 60].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => {
                            haptics.tap();
                            setRelockHoldMinutes(mins);
                          }}
                          className={`py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            relockHoldMinutes === mins
                              ? 'bg-[#171717] text-white shadow-2xs'
                              : 'bg-white border border-[#E8E6E1] text-[#777570]'
                          }`}
                        >
                          +{mins}m
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      relockAndResendLink(selectedCell.booking!.id, relockHoldMinutes);
                      setSelectedCell(null);
                    }}
                    className="w-full h-11 rounded-xl bg-[#FF6B2C] hover:bg-[#e85b1e] text-white font-black text-[12px] flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Re-lock & Send Payment Link (+{relockHoldMinutes}m)</span>
                  </button>
                </div>
              )}

              {selectedCell.state === 'maintenance' && (
                <button
                  onClick={() => {
                    unblockSlotAction(selectedCell.blockId || selectedCell.slotId);
                    setSelectedCell(null);
                  }}
                  className="w-full h-10 rounded-xl bg-[#D94B4B] hover:bg-[#b83535] text-white font-black text-[12px] cursor-pointer transition-colors"
                >
                  Unblock Pitch Now
                </button>
              )}

              <button
                onClick={() => {
                  setSelectedCell(null);
                  setShowExtensionModal(false);
                }}
                className="w-full h-10 rounded-xl bg-[#FAF9F6] hover:bg-[#F1F0EC] border border-[#E8E6E1] text-[#171717] font-bold text-[12px] cursor-pointer transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
