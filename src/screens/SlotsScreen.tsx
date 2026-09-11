import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Wrench,
  Calendar,
  Zap,
  CheckCircle2,
  Clock,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { haptics } from '../utils/haptics';
import { SlotState } from '../types';

interface GroupedSlotItem {
  id: string;
  isContinuous: boolean;
  durationHours: number;
  timeSpanLabel: string;
  displayStartTime: string;
  displayEndTime: string;
  individualTimes: string[];
  state: SlotState;
  bookingId?: string;
  customerName?: string;
  customerPhone?: string;
  priceTotal: number;
  pricePerHour: number;
  paidAmount?: number;
  reason?: string;
  notes?: string;
  countdown?: string;
  primarySlotId: string;
  allSlotIds: string[];
  peak?: boolean;
}

export const SlotsScreen: React.FC = () => {
  const {
    slots,
    courts,
    setSelectedSlotId,
    setActiveModal,
  } = useApp();

  const [currentDateIndex, setCurrentDateIndex] = useState(4); // Fri 28 Aug (Today)

  // Active approved courts
  const activeCourts = useMemo(
    () => courts.filter((c) => c.status === 'Approved' || !c.status),
    [courts]
  );

  // Single active turf selection
  const [selectedCourtId, setSelectedCourtId] = useState<string>(
    activeCourts[0]?.id || 'court-1'
  );

  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('all');

  const dates = [
    { dayName: 'Mon', dateNum: '24', full: '24 Aug 2026' },
    { dayName: 'Tue', dateNum: '25', full: '25 Aug 2026' },
    { dayName: 'Wed', dateNum: '26', full: '26 Aug 2026' },
    { dayName: 'Thu', dateNum: '27', full: '27 Aug 2026' },
    { dayName: 'Fri', dateNum: '28', full: '28 Aug 2026', isToday: true },
    { dayName: 'Sat', dateNum: '29', full: '29 Aug 2026' },
    { dayName: 'Sun', dateNum: '30', full: '30 Aug 2026' },
  ];

  const currentDateObj = dates[currentDateIndex] || dates[4];
  const currentDate = currentDateObj.full;

  const currentCourt =
    activeCourts.find((c) => c.id === selectedCourtId) || activeCourts[0] || courts[0];

  // Base slot definitions with clean 24h & 12h labels
  const baseTimeSlots = [
    { time: '6–7 AM', start24: '06:00', end24: '07:00', start: '06:00 AM', end: '07:00 AM', peak: false },
    { time: '7–8 AM', start24: '07:00', end24: '08:00', start: '07:00 AM', end: '08:00 AM', peak: false },
    { time: '8–9 AM', start24: '08:00', end24: '09:00', start: '08:00 AM', end: '09:00 AM', peak: false },
    { time: '9–10 AM', start24: '09:00', end24: '10:00', start: '09:00 AM', end: '10:00 AM', peak: false },
    { time: '10–11 AM', start24: '10:00', end24: '11:00', start: '10:00 AM', end: '11:00 AM', peak: false },
    { time: '11 AM–12 PM', start24: '11:00', end24: '12:00', start: '11:00 AM', end: '12:00 PM', peak: false },
    { time: '6–7 PM', start24: '18:00', end24: '19:00', start: '06:00 PM', end: '07:00 PM', peak: true },
    { time: '7–8 PM', start24: '19:00', end24: '20:00', start: '07:00 PM', end: '08:00 PM', peak: true },
    { time: '8–9 PM', start24: '20:00', end24: '21:00', start: '08:00 PM', end: '09:00 PM', peak: true },
  ];

  // Contiguity definition
  const areContiguous = (t1: string, t2: string): boolean => {
    const contiguousPairs: Record<string, string> = {
      '6–7 AM': '7–8 AM',
      '7–8 AM': '8–9 AM',
      '8–9 AM': '9–10 AM',
      '9–10 AM': '10–11 AM',
      '10–11 AM': '11 AM–12 PM',
      '6–7 PM': '7–8 PM',
      '7–8 PM': '8–9 PM',
    };
    return contiguousPairs[t1] === t2;
  };

  // Continuous 2-Hour Merging into unified schedule items
  const groupedScheduleItems: GroupedSlotItem[] = useMemo(() => {
    const items: GroupedSlotItem[] = [];
    let i = 0;

    while (i < baseTimeSlots.length) {
      const currentSlotMeta = baseTimeSlots[i];
      const nextSlotMeta = i + 1 < baseTimeSlots.length ? baseTimeSlots[i + 1] : null;

      const currentSlot = slots.find(
        (s) => s.courtId === currentCourt.id && s.time === currentSlotMeta.time
      );
      const nextSlot = nextSlotMeta
        ? slots.find(
            (s) => s.courtId === currentCourt.id && s.time === nextSlotMeta.time
          )
        : null;

      const currentState: SlotState = currentSlot?.state || 'available';
      const nextState: SlotState = nextSlot?.state || 'available';

      let is2HourGroup = false;

      if (
        nextSlotMeta &&
        areContiguous(currentSlotMeta.time, nextSlotMeta.time) &&
        currentState !== 'available' &&
        currentState === nextState
      ) {
        if (currentSlot?.bookingId && currentSlot.bookingId === nextSlot?.bookingId) {
          is2HourGroup = true;
        } else if (
          currentSlot?.customerName &&
          currentSlot.customerName === nextSlot?.customerName
        ) {
          is2HourGroup = true;
        } else if (
          (currentState === 'maintenance' || currentState === 'coaching' || currentState === 'tournament') &&
          currentSlot?.reason &&
          currentSlot.reason === nextSlot?.reason
        ) {
          is2HourGroup = true;
        } else if (
          (currentCourt.id === 'court-1' && currentSlotMeta.time === '6–7 PM' && nextSlotMeta.time === '7–8 PM') ||
          (currentCourt.id === 'court-2' && currentSlotMeta.time === '9–10 AM' && nextSlotMeta.time === '10–11 AM')
        ) {
          is2HourGroup = true;
        }
      }

      if (is2HourGroup && nextSlotMeta) {
        const pricePerHour = currentSlot?.price || currentCourt.pricePerHour;
        const priceTotal = (currentSlot?.price || pricePerHour) + (nextSlot?.price || pricePerHour);
        const paidAmount = (currentSlot?.paidAmount || 0) + (nextSlot?.paidAmount || 0);

        items.push({
          id: `grouped-${currentCourt.id}-${currentSlotMeta.time}-${nextSlotMeta.time}`,
          isContinuous: true,
          durationHours: 2,
          timeSpanLabel: `${currentSlotMeta.start24} – ${nextSlotMeta.end24}`,
          displayStartTime: currentSlotMeta.start24,
          displayEndTime: nextSlotMeta.end24,
          individualTimes: [currentSlotMeta.time, nextSlotMeta.time],
          state: currentState,
          bookingId: currentSlot?.bookingId || nextSlot?.bookingId || 'BK10231',
          customerName: currentSlot?.customerName || nextSlot?.customerName || 'Rahul Kumar',
          customerPhone: currentSlot?.customerPhone || nextSlot?.customerPhone || '+91 98765 43210',
          priceTotal,
          pricePerHour,
          paidAmount,
          reason: currentSlot?.reason || nextSlot?.reason,
          notes: currentSlot?.notes || nextSlot?.notes,
          countdown: currentSlot?.countdown || nextSlot?.countdown || '18:42',
          primarySlotId: currentSlot?.id || `slot-${currentCourt.id}-${currentSlotMeta.time}`,
          allSlotIds: [
            currentSlot?.id || `slot-${currentCourt.id}-${currentSlotMeta.time}`,
            nextSlot?.id || `slot-${currentCourt.id}-${nextSlotMeta.time}`,
          ],
          peak: currentSlotMeta.peak || nextSlotMeta.peak,
        });

        i += 2;
      } else {
        const price = currentSlot?.price || currentCourt.pricePerHour;

        items.push({
          id: currentSlot?.id || `slot-${currentCourt.id}-${currentSlotMeta.time}`,
          isContinuous: false,
          durationHours: 1,
          timeSpanLabel: `${currentSlotMeta.start24} – ${currentSlotMeta.end24}`,
          displayStartTime: currentSlotMeta.start24,
          displayEndTime: currentSlotMeta.end24,
          individualTimes: [currentSlotMeta.time],
          state: currentState,
          bookingId: currentSlot?.bookingId,
          customerName: currentSlot?.customerName,
          customerPhone: currentSlot?.customerPhone,
          priceTotal: price,
          pricePerHour: price,
          paidAmount: currentSlot?.paidAmount,
          reason: currentSlot?.reason,
          notes: currentSlot?.notes,
          countdown: currentSlot?.countdown,
          primarySlotId: currentSlot?.id || `slot-${currentCourt.id}-${currentSlotMeta.time}`,
          allSlotIds: [currentSlot?.id || `slot-${currentCourt.id}-${currentSlotMeta.time}`],
          peak: currentSlotMeta.peak,
        });

        i += 1;
      }
    }

    return items;
  }, [slots, currentCourt.id, currentCourt.pricePerHour]);

  // Compute live slot state counts
  const slotStats = useMemo(() => {
    const stats: Record<string, number> = {
      all: baseTimeSlots.length,
      available: 0,
      booked: 0,
      pending: 0,
      coaching: 0,
      tournament: 0,
      maintenance: 0,
    };

    baseTimeSlots.forEach((meta) => {
      const slot = slots.find((s) => s.courtId === currentCourt.id && s.time === meta.time);
      const state = slot?.state || 'available';
      if (stats[state] !== undefined) {
        stats[state]++;
      } else {
        stats.available++;
      }
    });

    return stats;
  }, [slots, currentCourt.id]);

  const handleRowClick = (item: GroupedSlotItem) => {
    haptics.tap();
    setSelectedSlotId(item.primarySlotId);
    if (item.state === 'available') {
      setActiveModal('new_booking');
    } else {
      setActiveModal('slot_details');
    }
  };

  const handleQuickBook = (e: React.MouseEvent, item: GroupedSlotItem) => {
    e.stopPropagation();
    haptics.tap();
    setSelectedSlotId(item.primarySlotId);
    setActiveModal('new_booking');
  };

  // Status Filter options with unified dot indicators and counts
  const filterOptions = [
    { id: 'all', label: 'All', count: slotStats.all, dotColor: 'bg-[#021526]' },
    { id: 'available', label: 'Open', count: slotStats.available, dotColor: 'bg-neutral-400' },
    { id: 'booked', label: 'Booked', count: slotStats.booked, dotColor: 'bg-emerald-500' },
    { id: 'pending', label: 'Hold', count: slotStats.pending, dotColor: 'bg-[#F94001]' },
    { id: 'coaching', label: 'Coaching', count: slotStats.coaching, dotColor: 'bg-blue-500' },
    { id: 'tournament', label: 'Tournament', count: slotStats.tournament, dotColor: 'bg-purple-500' },
    { id: 'maintenance', label: 'Maintenance', count: slotStats.maintenance, dotColor: 'bg-neutral-400' },
  ];

  return (
    <div className="pb-24 pt-3 px-4 w-full space-y-4 select-none font-sans max-w-xl mx-auto">
      {/* =========================================================================
          CLEAN, ROBUST HEADER (AUTO-LAYOUT WITH ZERO UNWANTED WRAPPING)
         ========================================================================= */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="min-w-0">
          <h1 className="text-[22px] font-extrabold text-[#021526] tracking-tight leading-tight whitespace-nowrap">
            Slots Schedule
          </h1>
          <p className="text-[12.5px] font-normal text-neutral-500 mt-0.5 whitespace-nowrap">
            {currentDate} · ₹{currentCourt.pricePerHour}/hr
          </p>
        </div>

        {/* Action Buttons: Clean, Compact, Whitespace-Protected */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-block-slot-header"
            onClick={() => {
              haptics.tap();
              setActiveModal('block_slot');
            }}
            className="h-9 px-3 rounded-xl bg-white hover:bg-neutral-50 text-neutral-800 font-semibold text-[12px] flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer border border-neutral-200 shadow-2xs whitespace-nowrap"
          >
            <Wrench className="w-3.5 h-3.5 text-neutral-500" />
            <span>Block</span>
          </button>

          <button
            id="btn-new-booking-header"
            onClick={() => {
              haptics.tap();
              setActiveModal('new_booking');
            }}
            className="h-9 px-3.5 rounded-xl bg-[#F94001] hover:bg-[#D93600] text-white font-semibold text-[12px] flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Booking</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          DATE NAVIGATION STRIP
         ========================================================================= */}
      <div className="bg-white rounded-2xl p-3.5 border border-[#E5E7EB] shadow-xs space-y-3">
        <div className="flex items-center justify-between px-1">
          <button
            id="btn-prev-date"
            onClick={() => {
              haptics.tap();
              setCurrentDateIndex((prev) => Math.max(0, prev - 1));
            }}
            className="w-8 h-8 rounded-xl bg-neutral-50 hover:bg-neutral-100 flex items-center justify-center text-neutral-700 active:scale-95 transition-all cursor-pointer border border-neutral-200"
            aria-label="Previous date"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#F94001]" />
            <span className="text-[14px] font-semibold text-neutral-900">{currentDate}</span>
            {currentDateObj.isToday && (
              <span className="text-[10px] font-semibold bg-[#F94001]/10 text-[#F94001] px-2 py-0.5 rounded-full uppercase tracking-wider">
                Today
              </span>
            )}
          </div>

          <button
            id="btn-next-date"
            onClick={() => {
              haptics.tap();
              setCurrentDateIndex((prev) => Math.min(dates.length - 1, prev + 1));
            }}
            className="w-8 h-8 rounded-xl bg-neutral-50 hover:bg-neutral-100 flex items-center justify-center text-neutral-700 active:scale-95 transition-all cursor-pointer border border-neutral-200"
            aria-label="Next date"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 7-Day Pill Strip with comfortable touch targets */}
        <div className="grid grid-cols-7 gap-1.5">
          {dates.map((d, index) => {
            const isSelected = index === currentDateIndex;
            return (
              <button
                key={d.full}
                id={`date-pill-${d.dateNum}`}
                onClick={() => {
                  haptics.tap();
                  setCurrentDateIndex(index);
                }}
                className={`py-2 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95 border ${
                  isSelected
                    ? 'bg-[#021526] text-white border-[#021526] shadow-xs'
                    : 'bg-neutral-50 text-neutral-500 border-transparent hover:bg-neutral-100'
                }`}
              >
                <span className="text-[9.5px] uppercase tracking-wider font-medium">{d.dayName}</span>
                <span className={`text-[13.5px] mt-0.5 ${isSelected ? 'font-semibold' : 'font-medium'}`}>
                  {d.dateNum}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          TURF / PITCH SELECTOR TABS (COMFORTABLE & INTUITIVE)
         ========================================================================= */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            Select Court / Turf
          </span>
          <span className="text-[11.5px] font-medium text-[#F94001]">
            ₹{currentCourt.pricePerHour}/hr base
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {activeCourts.map((court) => {
            const isSelected = selectedCourtId === court.id;
            return (
              <button
                key={court.id}
                id={`turf-filter-${court.id}`}
                onClick={() => {
                  haptics.tap();
                  setSelectedCourtId(court.id);
                }}
                className={`p-3 rounded-xl text-left transition-all active:scale-98 cursor-pointer flex flex-col justify-between border ${
                  isSelected
                    ? 'bg-[#021526] text-white border-[#021526] shadow-sm'
                    : 'bg-white text-neutral-800 border-[#E5E7EB] hover:border-neutral-400'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[13px] font-semibold leading-tight">{court.name}</span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-[#F94001]" />
                  )}
                </div>
                <span
                  className={`text-[11px] font-normal ${
                    isSelected ? 'text-neutral-300' : 'text-neutral-500'
                  }`}
                >
                  {court.sports[0]} · ₹{court.pricePerHour}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          STATUS FILTER PILLS (MATCHING BOOKINGS & PAYMENTS SCREENS DESIGN)
         ========================================================================= */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {filterOptions.map((opt) => {
          const isSelected = selectedStateFilter === opt.id;
          return (
            <button
              key={opt.id}
              id={`slot-state-filter-${opt.id}`}
              onClick={() => {
                haptics.tap();
                setSelectedStateFilter(isSelected && opt.id !== 'all' ? 'all' : opt.id);
              }}
              className={`px-3 py-1 rounded-full text-[11.5px] font-bold whitespace-nowrap transition-all active-press cursor-pointer flex items-center gap-1.5 shrink-0 ${
                isSelected
                  ? 'bg-[#021526] text-white shadow-xs'
                  : 'bg-white text-[#5F6368] border border-[#E5E7EB] hover:text-[#021526]'
              }`}
            >
              {opt.id !== 'all' && (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isSelected ? 'bg-white' : opt.dotColor
                  } shrink-0`}
                />
              )}
              <span>{opt.label}</span>
              <span
                className={`text-[10.5px] ${
                  isSelected ? 'text-white/70 font-semibold' : 'text-[#5F6368] font-medium'
                }`}
              >
                {opt.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          SLOTS SCHEDULE CARD CONTAINER (ELEGANT REFERENCE CARD DESIGN)
          - Left: Semi-bold Time indicator (06:00, 07:00, 18:00) with 2-hour span
          - Middle: Semi-bold title + Regular subtitle
          - Right: Category color dot indicator + price
          - 2-Hour Continuous Booking prominently displayed with subtle category tint
         ========================================================================= */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs divide-y divide-[#F0EFEA] overflow-hidden">
        {groupedScheduleItems.map((item) => {
          if (selectedStateFilter !== 'all' && selectedStateFilter !== item.state) {
            return null;
          }

          // Category Colors & Information Configuration
          let title = '';
          let subtitle = '';
          let dotColor = 'bg-neutral-300';
          let rowBg = 'hover:bg-neutral-50/70';
          let categoryBadgeBg = 'bg-neutral-100';
          let categoryBadgeText = 'text-neutral-700';
          let categoryBadgeBorder = 'border-neutral-200';
          let categoryName = 'Open';

          if (item.state === 'available') {
            title = 'Available Slot';
            subtitle = item.peak
              ? `Peak Hour · ₹${item.priceTotal} · Instant Booking`
              : `Standard Rate · ₹${item.priceTotal} · Instant Booking`;
            dotColor = 'bg-neutral-300';
            categoryName = 'Open';
          } else if (item.state === 'booked') {
            title = item.customerName || 'Rahul Kumar';
            subtitle = item.isContinuous
              ? `2-Hour Booking · ${currentCourt.name} · Paid ₹${item.priceTotal}`
              : `1-Hour Booking · ${currentCourt.name} · Paid ₹${item.priceTotal}`;
            dotColor = 'bg-emerald-600';
            categoryBadgeBg = 'bg-emerald-50';
            categoryBadgeText = 'text-emerald-800';
            categoryBadgeBorder = 'border-emerald-200';
            categoryName = 'Booked';
            rowBg = item.isContinuous
              ? 'bg-emerald-50/30 hover:bg-emerald-50/60'
              : 'hover:bg-emerald-50/20';
          } else if (item.state === 'pending') {
            title = item.customerName || 'Aditya Sharma';
            subtitle = `Hold expires in ${item.countdown || '14:20'} · ₹${item.priceTotal} due`;
            dotColor = 'bg-[#F94001]'; // Orange terracotta matching reference image
            categoryBadgeBg = 'bg-[#FFF3EC]';
            categoryBadgeText = 'text-[#D45017]';
            categoryBadgeBorder = 'border-[#FDCBB3]';
            categoryName = 'Hold';
            rowBg = item.isContinuous
              ? 'bg-amber-50/30 hover:bg-amber-50/60'
              : 'hover:bg-amber-50/20';
          } else if (item.state === 'coaching') {
            title = item.reason || 'Youth Academy Coaching';
            subtitle = `Coach Rajesh · ${item.isContinuous ? '2-Hour Session' : '1-Hour Session'}`;
            dotColor = 'bg-blue-600';
            categoryBadgeBg = 'bg-blue-50';
            categoryBadgeText = 'text-blue-800';
            categoryBadgeBorder = 'border-blue-200';
            categoryName = 'Coaching';
            rowBg = item.isContinuous
              ? 'bg-blue-50/30 hover:bg-blue-50/60'
              : 'hover:bg-blue-50/20';
          } else if (item.state === 'tournament') {
            title = item.reason || 'Corporate Cup - Semi Final';
            subtitle = `Cup Match · ${currentCourt.name} · Reserved`;
            dotColor = 'bg-purple-600';
            categoryBadgeBg = 'bg-purple-50';
            categoryBadgeText = 'text-purple-800';
            categoryBadgeBorder = 'border-purple-200';
            categoryName = 'Tournament';
            rowBg = item.isContinuous
              ? 'bg-purple-50/30 hover:bg-purple-50/60'
              : 'hover:bg-purple-50/20';
          } else if (item.state === 'maintenance') {
            title = item.reason || 'Pitch Infill & Turf Care';
            subtitle = `${currentCourt.name} · Blocked for maintenance`;
            dotColor = 'bg-neutral-400';
            categoryBadgeBg = 'bg-neutral-100';
            categoryBadgeText = 'text-neutral-600';
            categoryBadgeBorder = 'border-neutral-200';
            categoryName = 'Maintenance';
            rowBg = item.isContinuous
              ? 'bg-neutral-50/60 hover:bg-neutral-100/60'
              : 'hover:bg-neutral-50/60';
          }

          return (
            <div
              key={item.id}
              id={item.id}
              onClick={() => handleRowClick(item)}
              className={`py-3.5 px-4 flex items-center justify-between gap-3.5 transition-colors cursor-pointer active:bg-neutral-100/80 group ${rowBg} ${
                item.isContinuous ? 'relative' : ''
              }`}
            >
              {/* Left Column: Time Indicator (Semi-bold start time, regular end/span) */}
              <div className="w-16 shrink-0">
                <span className="text-[14px] font-semibold text-neutral-900 tracking-tight block leading-tight">
                  {item.displayStartTime}
                </span>

                {item.isContinuous ? (
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[11px] font-normal text-neutral-500">
                      to {item.displayEndTime}
                    </span>
                  </div>
                ) : (
                  <span className="text-[11px] font-normal text-neutral-400 block mt-0.5">
                    {item.individualTimes[0].includes('PM') ? 'PM' : 'AM'} · 1h
                  </span>
                )}
              </div>

              {/* Middle Column: Semi-bold Title & Regular Subtitle */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-[14px] font-semibold text-neutral-900 tracking-tight truncate">
                    {title}
                  </h2>

                  {/* 2-Hour Continuous Badge */}
                  {item.isContinuous && (
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-medium border ${categoryBadgeBg} ${categoryBadgeText} ${categoryBadgeBorder} shrink-0`}
                    >
                      <Zap className="w-2.5 h-2.5 fill-current" />
                      2h Continuous
                    </span>
                  )}

                  {item.peak && item.state === 'available' && (
                    <span className="px-1.5 py-0.2 rounded bg-[#F94001]/10 text-[#F94001] text-[9.5px] font-medium shrink-0">
                      Peak
                    </span>
                  )}
                </div>

                <p className="text-[12.5px] font-normal text-neutral-500 truncate mt-0.5">
                  {subtitle}
                </p>
              </div>

              {/* Right Column: Price / Status Dot / Actions */}
              <div className="flex items-center gap-3 shrink-0">
                {item.state === 'available' ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-neutral-800">
                      ₹{item.priceTotal}
                    </span>
                    <button
                      onClick={(e) => handleQuickBook(e, item)}
                      className="h-7 px-2.5 rounded-lg bg-[#F94001] hover:bg-[#D93600] text-white font-medium text-[11px] flex items-center gap-1 shadow-2xs active:scale-95 transition-all cursor-pointer"
                    >
                      <Plus className="w-3 h-3 stroke-[2]" />
                      <span>Book</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 text-right">
                    <div>
                      <span className="text-[13px] font-semibold text-neutral-800 block leading-tight">
                        ₹{item.priceTotal}
                      </span>
                      <span className="text-[10.5px] font-normal text-neutral-400 block">
                        {item.isContinuous ? '2 hrs total' : '1 hr'}
                      </span>
                    </div>

                    {/* Minimalist Status Dot with Category Color */}
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${dotColor} shrink-0 shadow-2xs`}
                      title={categoryName}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
