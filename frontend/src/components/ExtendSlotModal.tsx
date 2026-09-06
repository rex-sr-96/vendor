import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Ban,
  Sun,
  Moon,
  Lock,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Booking } from '../types';
import { haptics } from '../utils/haptics';
import {
  parseBookingRangeToMinutes,
  formatMinutesToTime,
} from '../utils/extensionSlots';

interface ExtendSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

export const ExtendSlotModal: React.FC<ExtendSlotModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  const { bookings, courts, slots, extendBookingSlot, showToast } = useApp();

  const [extensionMinutes, setExtensionMinutes] = useState<number | null>(null);

  // Reset extension selection whenever modal opens or booking changes
  useEffect(() => {
    setExtensionMinutes(null);
  }, [booking?.id, isOpen]);

  // Find court details
  const court = useMemo(() => {
    if (!booking) return undefined;
    return courts.find(
      (c) => c.id === booking.courtId || c.name === booking.courtName
    );
  }, [courts, booking]);

  const hourlyRate =
    court?.pricePerHour || (booking && booking.totalAmount > 0 ? booking.totalAmount : 1000);
  const peakHourlyRate = court?.peakHoursPrice || hourlyRate;

  // Parse booking's current time slot
  const parsedRange = useMemo(() => {
    if (!booking) return { startMins: 1080, endMins: 1140 };
    return parseBookingRangeToMinutes(booking.timeSlot) || {
      startMins: 1080,
      endMins: 1140,
    };
  }, [booking]);

  const matchStartMins = parsedRange.startMins;
  const matchEndMins = parsedRange.endMins;
  const matchStartTimeStr = formatMinutesToTime(matchStartMins);
  const matchEndTimeStr = formatMinutesToTime(matchEndMins);

  // Step size: 30m for Badminton / Pickleball, 60m for Football / Cricket
  const is30Min = useMemo(() => {
    if (!booking) return false;
    return (
      court?.minBookingDuration?.includes('30') ||
      court?.sports?.some(
        (s) =>
          s.toLowerCase().includes('badminton') ||
          s.toLowerCase().includes('pickleball')
      ) ||
      booking.sport === 'Badminton' ||
      booking.sport === 'Pickleball'
    );
  }, [court, booking]);

  const stepMins = is30Min ? 30 : 60;
  const openingMins = 6 * 60; // 06:00 AM
  const closingMins = 23 * 60; // 11:00 PM

  // Find other bookings on the same court and date
  const otherRanges = useMemo(() => {
    if (!booking) return [];
    const otherBookings = bookings.filter(
      (b) =>
        b.id !== booking.id &&
        (b.courtId === booking.courtId || b.courtName === booking.courtName) &&
        b.date === booking.date &&
        b.status !== 'Cancelled' &&
        b.status !== 'Expired'
    );

    return otherBookings.map((b) => {
      const range = parseBookingRangeToMinutes(b.timeSlot) || {
        startMins: 0,
        endMins: 0,
      };
      return {
        booking: b,
        startMins: range.startMins,
        endMins: range.endMins,
      };
    });
  }, [bookings, booking]);

  // Build the complete timeline slots for this court from 06:00 AM to 11:00 PM
  const allTimelineSlots = useMemo(() => {
    if (!booking) return [];
    const list: Array<{
      startMins: number;
      endMins: number;
      label: string;
      startTimeStr: string;
      endTimeStr: string;
      isCurrentMatch: boolean;
      isPreceding: boolean;
      isExtensionCandidate: boolean;
      isExtended: boolean;
      isTargetEnd: boolean;
      isBooked: boolean;
      isHold: boolean;
      isBlocked: boolean;
      occupantName?: string;
      rate: number;
    }> = [];

    const targetEndMins = extensionMinutes !== null ? matchEndMins + extensionMinutes : null;

    for (let m = openingMins; m + stepMins <= closingMins; m += stepMins) {
      const slotStart = m;
      const slotEnd = m + stepMins;
      const startTimeStr = formatMinutesToTime(slotStart);
      const endTimeStr = formatMinutesToTime(slotEnd);

      const isCurrentMatch =
        slotStart >= matchStartMins && slotEnd <= matchEndMins;
      const isPreceding = slotEnd <= matchStartMins;
      const isExtensionCandidate = slotStart >= matchEndMins;

      // Check conflict with other bookings
      const overlap = otherRanges.find(
        (r) => r.startMins < slotEnd && r.endMins > slotStart
      );

      const isHold = overlap ? overlap.booking.status === 'Payment Pending' : false;
      const isBooked = overlap ? overlap.booking.status !== 'Payment Pending' : false;
      const occupantName = overlap ? overlap.booking.customerName : undefined;

      // Check slot maintenance
      const slotBlock = slots.find(
        (s) =>
          (s.courtId === booking.courtId || s.courtName === booking.courtName) &&
          (s.timeFull?.includes(startTimeStr) || s.time?.includes(startTimeStr.replace(':00', ''))) &&
          (s.state === 'maintenance' || s.state === 'coaching' || s.state === 'tournament')
      );
      const isBlocked = !!slotBlock;

      // Check if this slot is selected as part of extension
      const isExtended =
        targetEndMins !== null &&
        slotStart >= matchEndMins &&
        slotEnd <= targetEndMins;
      const isTargetEnd = targetEndMins !== null && slotEnd === targetEndMins;

      // Peak rate check (6 PM to 11 PM)
      const isPeakSlot = slotStart >= 18 * 60 && slotStart < 23 * 60;
      const slotRate = isPeakSlot ? peakHourlyRate : hourlyRate;
      const rateForSlot = is30Min ? Math.round(slotRate / 2) : slotRate;

      list.push({
        startMins: slotStart,
        endMins: slotEnd,
        label: is30Min ? startTimeStr : startTimeStr.replace(':00', ''),
        startTimeStr,
        endTimeStr,
        isCurrentMatch,
        isPreceding,
        isExtensionCandidate,
        isExtended,
        isTargetEnd,
        isBooked,
        isHold,
        isBlocked,
        occupantName,
        rate: rateForSlot,
      });
    }

    return list;
  }, [
    booking,
    openingMins,
    closingMins,
    stepMins,
    matchStartMins,
    matchEndMins,
    extensionMinutes,
    otherRanges,
    slots,
    is30Min,
    peakHourlyRate,
    hourlyRate,
  ]);

  // Find the immediate next occupied slot after current match, if any
  const nextOccupiedSlot = useMemo(() => {
    return allTimelineSlots.find(
      (s) => s.isExtensionCandidate && (s.isBooked || s.isHold || s.isBlocked)
    );
  }, [allTimelineSlots]);

  // Max extension possible before first collision or closing time
  const maxPossibleExtensionMins = useMemo(() => {
    let continuousMins = 0;
    for (const s of allTimelineSlots) {
      if (s.isExtensionCandidate) {
        if (s.isBooked || s.isHold || s.isBlocked) {
          break;
        }
        continuousMins += stepMins;
      }
    }
    return continuousMins;
  }, [allTimelineSlots, stepMins]);

  // Generate valid quick preset options (up to maxPossibleExtensionMins)
  const quickPresets = useMemo(() => {
    const presets: Array<{ mins: number; hours: number; fee: number; endTime: string }> = [];
    const steps = is30Min ? [30, 60, 90, 120, 180] : [60, 120, 180, 240];

    for (const mins of steps) {
      if (mins <= maxPossibleExtensionMins) {
        const targetEnd = matchEndMins + mins;
        // Calculate fee for the slots covered
        const slotsCovered = allTimelineSlots.filter(
          (s) => s.startMins >= matchEndMins && s.endMins <= targetEnd
        );
        const fee = slotsCovered.reduce((sum, s) => sum + s.rate, 0);

        presets.push({
          mins,
          hours: mins / 60,
          fee,
          endTime: formatMinutesToTime(targetEnd),
        });
      }
    }
    return presets;
  }, [maxPossibleExtensionMins, matchEndMins, allTimelineSlots, is30Min]);

  // Computed summary for the currently active extension selection
  const extensionSummary = useMemo(() => {
    if (!booking || extensionMinutes === null || extensionMinutes <= 0) return null;

    const newEndMins = matchEndMins + extensionMinutes;
    const newEndTimeStr = formatMinutesToTime(newEndMins);
    const newFullTimeSlot = `${matchStartTimeStr} – ${newEndTimeStr}`;

    const slotsCovered = allTimelineSlots.filter(
      (s) => s.startMins >= matchEndMins && s.endMins <= newEndMins
    );
    const addedFee = slotsCovered.reduce((sum, s) => sum + s.rate, 0);
    const addedHours = extensionMinutes / 60;

    return {
      addedMinutes: extensionMinutes,
      addedHours,
      newEndTimeStr,
      newFullTimeSlot,
      addedFee,
      newBalanceAmount: booking.balanceAmount + addedFee,
      newTotalAmount: booking.totalAmount + addedFee,
    };
  }, [
    booking,
    extensionMinutes,
    matchEndMins,
    matchStartTimeStr,
    allTimelineSlots,
  ]);

  if (!isOpen || !booking) return null;

  // Split into 2-row view:
  // Row 1: Morning & Afternoon (06:00 AM – 02:00 PM) -> 360 to 840 mins
  // Row 2: Evening & Prime Time (02:00 PM – 11:00 PM) -> 840 to 1380 mins
  const row1Slots = allTimelineSlots.filter((s) => s.startMins < 840);
  const row2Slots = allTimelineSlots.filter((s) => s.startMins >= 840);

  // Handle clicking a slot on the timeline
  const handleSlotClick = (slot: (typeof allTimelineSlots)[0]) => {
    haptics.tap();

    if (slot.isCurrentMatch) {
      showToast('Current Match', 'This slot is part of the ongoing booking.', 'info');
      return;
    }

    if (slot.isPreceding) {
      showToast('Past Timing', 'Cannot extend into slots prior to current match kickoff.', 'warning');
      return;
    }

    if (slot.isBooked || slot.isHold || slot.isBlocked) {
      showToast(
        'Slot Unavailable',
        `Slot ${slot.startTimeStr}–${slot.endTimeStr} is ${
          slot.isHold ? 'on hold' : slot.isBooked ? `booked by ${slot.occupantName}` : 'blocked'
        }. Cannot extend through occupied slots.`,
        'warning'
      );
      return;
    }

    // Check if any slot between matchEndMins and slot.endMins is blocked
    const hasCollision = allTimelineSlots.some(
      (s) =>
        s.startMins >= matchEndMins &&
        s.endMins <= slot.endMins &&
        (s.isBooked || s.isHold || s.isBlocked)
    );

    if (hasCollision) {
      showToast(
        'Collision Ahead',
        'Cannot extend to this slot: An earlier slot in between is already booked or on hold.',
        'warning'
      );
      return;
    }

    const desiredExtension = slot.endMins - matchEndMins;
    if (extensionMinutes === desiredExtension) {
      // Toggle off
      setExtensionMinutes(null);
    } else {
      setExtensionMinutes(desiredExtension);
    }
  };

  const handleConfirm = () => {
    if (!extensionSummary) return;
    haptics.success();

    extendBookingSlot(
      booking.id,
      extensionSummary.addedMinutes,
      extensionSummary.addedFee,
      extensionSummary.newFullTimeSlot
    );

    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-xs select-none">
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-h-[92vh] md:max-w-xl md:rounded-3xl overflow-y-auto no-scrollbar bg-white rounded-t-3xl p-5 md:p-6 shadow-2xl border border-[#E8E6E1] space-y-3.5"
        >
          {/* Grab handle for mobile */}
          <div className="md:hidden w-10 h-1 rounded-full bg-[#D4D2CD] mx-auto mb-2 shrink-0" />

          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F0EC]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#FF6B2C] uppercase tracking-wider">
                  Extend Booking #{booking.id}
                </span>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-black bg-[#FF6B2C]/10 text-[#FF6B2C]">
                  {booking.sport}
                </span>
              </div>
              <h2 className="text-[17px] font-black text-[#171717] tracking-tight mt-0.5">
                Timeline Slot Extension
              </h2>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F1F0EC] flex items-center justify-center text-[#777570] hover:text-[#171717] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current Booking Header Box */}
          <div className="bg-[#FAF9F6] border border-[#E8E6E1] rounded-2xl p-3 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[13.5px] font-black text-[#171717]">
                  {booking.customerName}
                </span>
                <span className="text-[11px] font-mono text-[#777570]">
                  {booking.customerPhone}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11.5px] text-[#777570] mt-0.5">
                <span>{booking.courtName}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#FF6B2C]" />
                  {booking.date}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[9.5px] font-bold uppercase text-[#777570] block">
                Current Match
              </span>
              <span className="text-[13px] font-black text-[#171717]">
                {booking.timeSlot}
              </span>
            </div>
          </div>

          {/* Conflict Guard: If next slot is already occupied */}
          {maxPossibleExtensionMins === 0 ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center space-y-1.5">
              <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <Ban className="w-4 h-4" />
              </div>
              <h3 className="text-[13.5px] font-black text-red-800">
                Extension Unavailable
              </h3>
              <p className="text-[11.5px] text-red-600 max-w-sm mx-auto leading-relaxed">
                The immediately following slot (after {matchEndTimeStr}) is already{' '}
                {nextOccupiedSlot?.isHold ? 'on hold' : `booked by ${nextOccupiedSlot?.occupantName || 'another customer'}`}.
                This court cannot be extended.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* ========================================================================= */}
              {/* INTERACTIVE 2-ROW TIMELINE SLOT PICKER                                   */}
              {/* ========================================================================= */}
              <div className="bg-[#FAF9F6] border border-[#E8E6E1] rounded-2xl p-3.5 space-y-3">
                {/* Timeline Header & Comprehensive Status Legend */}
                <div className="flex items-center justify-between flex-wrap gap-1.5 pb-2 border-b border-[#E8E6E1]">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#FF6B2C]" />
                    <span className="text-[11.5px] font-black text-[#171717]">
                      Court Timeline Schedule (2-Row View)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-bold text-[#777570] flex-wrap">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#171717]" /> Match
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#FF6B2C]" /> Extended
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#2FA66A]" /> Available
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> Hold
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#475569]" /> Booked
                    </span>
                  </div>
                </div>

                {/* Slot Button Renderer */}
                {(() => {
                  const renderSlotBtn = (slot: (typeof allTimelineSlots)[0]) => {
                    return (
                      <button
                        key={`ext-slot-${slot.startMins}`}
                        type="button"
                        onClick={() => handleSlotClick(slot)}
                        className={`px-2.5 py-2 rounded-xl text-center transition-all shrink-0 flex flex-col items-center justify-center min-w-[70px] select-none ${
                          slot.isCurrentMatch
                            ? 'bg-[#171717] text-white shadow-xs cursor-default ring-1 ring-white/10'
                            : slot.isExtended
                            ? 'bg-gradient-to-r from-[#FF6B2C] to-[#FA5A14] text-white shadow-md ring-2 ring-[#FF6B2C]/40 cursor-pointer active:scale-95'
                            : slot.isPreceding
                            ? 'bg-[#ECEAE4]/60 border border-[#E8E6E1] text-[#A3A099] line-through cursor-not-allowed opacity-45'
                            : slot.isHold
                            ? 'bg-[#FFFBEB] border-2 border-[#F59E0B] text-[#B45309] shadow-2xs cursor-not-allowed'
                            : slot.isBooked
                            ? 'bg-[#1E293B] text-white border border-[#0F172A] cursor-not-allowed shadow-2xs'
                            : slot.isBlocked
                            ? 'bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1] cursor-not-allowed'
                            : 'bg-white border-2 border-dashed border-[#2FA66A]/40 hover:border-[#FF6B2C] hover:bg-[#FFF8F5] text-[#171717] cursor-pointer active:scale-95 shadow-2xs'
                        }`}
                      >
                        <span
                          className={`text-[10.5px] font-black leading-tight ${
                            slot.isCurrentMatch || slot.isExtended
                              ? 'text-white'
                              : ''
                          }`}
                        >
                          {slot.label}
                        </span>

                        <span
                          className={`text-[8.5px] font-bold leading-tight mt-0.5 flex items-center justify-center gap-0.5 ${
                            slot.isCurrentMatch
                              ? 'text-[#FF9D66] font-black uppercase'
                              : slot.isExtended
                              ? 'text-white/95 font-black'
                              : slot.isPreceding
                              ? 'text-[#A3A099]'
                              : slot.isHold
                              ? 'text-[#D97706] font-black uppercase'
                              : slot.isBooked
                              ? 'text-[#94A3B8] font-bold'
                              : slot.isBlocked
                              ? 'text-[#475569] font-bold'
                              : 'text-[#2FA66A] font-black'
                          }`}
                        >
                          {slot.isCurrentMatch ? (
                            'Match'
                          ) : slot.isExtended ? (
                            slot.isTargetEnd ? 'End ✓' : 'Extend'
                          ) : slot.isPreceding ? (
                            'Passed'
                          ) : slot.isHold ? (
                            <span className="flex items-center gap-0.5">
                              <Lock className="w-2 h-2" /> Hold
                            </span>
                          ) : slot.isBooked ? (
                            slot.occupantName ? slot.occupantName.slice(0, 5) : 'Booked'
                          ) : slot.isBlocked ? (
                            'Blocked'
                          ) : (
                            `+₹${slot.rate}`
                          )}
                        </span>
                      </button>
                    );
                  };

                  return (
                    <div className="space-y-2.5">
                      {/* Row 1: Morning & Afternoon */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[9.5px] font-bold text-[#777570] px-0.5">
                          <span className="flex items-center gap-1 text-[#D97706] font-black">
                            <Sun className="w-3 h-3 text-[#F59E0B]" /> Morning & Afternoon (06:00 AM – 02:00 PM)
                          </span>
                          <span className="text-[9px] text-[#A3A099] font-extrabold">Row 1</span>
                        </div>
                        <div className="overflow-x-auto no-scrollbar py-0.5">
                          <div className="flex items-center gap-1.5 min-w-max">
                            {row1Slots.map(renderSlotBtn)}
                          </div>
                        </div>
                      </div>

                      {/* Row 2: Evening & Prime Time */}
                      <div className="space-y-1 pt-1.5 border-t border-[#E8E6E1]/60">
                        <div className="flex items-center justify-between text-[9.5px] font-bold text-[#777570] px-0.5">
                          <span className="flex items-center gap-1 text-[#4F46E5] font-black">
                            <Moon className="w-3 h-3 text-[#6366F1]" /> Evening & Prime Time (02:00 PM – 11:00 PM)
                          </span>
                          <span className="text-[9px] text-[#A3A099] font-extrabold">Row 2</span>
                        </div>
                        <div className="overflow-x-auto no-scrollbar py-0.5">
                          <div className="flex items-center gap-1.5 min-w-max">
                            {row2Slots.map(renderSlotBtn)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Quick Add Presets Bar */}
                {quickPresets.length > 0 && (
                  <div className="pt-2 border-t border-[#E8E6E1] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    <span className="text-[10px] font-black text-[#777570] uppercase tracking-wider shrink-0 mr-0.5">
                      Quick Add:
                    </span>
                    {quickPresets.map((opt) => {
                      const isSelected = extensionMinutes === opt.mins;
                      return (
                        <button
                          key={`ext-quick-${opt.mins}`}
                          type="button"
                          onClick={() => {
                            haptics.tap();
                            setExtensionMinutes(isSelected ? null : opt.mins);
                          }}
                          className={`px-2.5 py-1 rounded-full text-[10.5px] font-black shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                            isSelected
                              ? 'bg-[#171717] text-white shadow-2xs ring-1 ring-[#171717]'
                              : 'bg-white border border-[#E8E6E1] text-[#55534E] hover:border-[#FF6B2C] hover:text-[#FF6B2C]'
                          }`}
                        >
                          <span>+{opt.hours}h</span>
                          <span className={isSelected ? 'text-[#FF9D66]' : 'text-[#777570]'}>
                            (+₹{opt.fee.toLocaleString('en-IN')})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Dynamic Calculation Summary Card */}
              {!extensionSummary ? (
                <div className="bg-[#FFF8E6] border border-[#FFE082] rounded-xl p-2.5 text-[11.5px] text-[#8C6B00] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#E65100] mt-0.5" />
                  <span>
                    <strong>Select Extension Time:</strong> Tap any available slot on the timeline above or choose a Quick Add preset to extend this court booking.
                  </span>
                </div>
              ) : (
                <div className="bg-[#FAF9F6] p-3.5 rounded-2xl border border-[#E8E6E1] space-y-2 text-[12px] animate-in fade-in duration-200">
                  <div className="flex justify-between text-[#777570]">
                    <span>Original Match Schedule:</span>
                    <strong className="text-[#171717]">{booking.timeSlot}</strong>
                  </div>
                  <div className="flex justify-between text-[#777570]">
                    <span>New Extended Schedule:</span>
                    <strong className="text-[#171717] font-black text-[13px]">
                      {extensionSummary.newFullTimeSlot}
                    </strong>
                  </div>
                  <div className="flex justify-between text-[#777570]">
                    <span>Additional Duration:</span>
                    <strong className="text-[#171717]">
                      +{extensionSummary.addedHours} Hour{extensionSummary.addedHours !== 1 ? 's' : ''}
                    </strong>
                  </div>
                  <div className="flex justify-between text-[#777570]">
                    <span>Extension Fee:</span>
                    <strong className="text-[#FF6B2C] font-black">
                      +₹{extensionSummary.addedFee.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="pt-2 border-t border-[#E8E6E1] flex justify-between items-baseline">
                    <span className="font-bold text-[#171717]">Updated Balance Due:</span>
                    <span className="text-[17px] font-black text-[#B87C0D]">
                      ₹{extensionSummary.newBalanceAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-11 rounded-xl bg-[#F7F7F5] border border-[#E8E6E1] text-[#777570] font-bold text-[13px] hover:text-[#171717] active-press cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!extensionSummary}
                  onClick={handleConfirm}
                  className={`flex-2 h-11 rounded-xl font-black text-[13px] flex items-center justify-center gap-2 shadow-xs transition-all ${
                    extensionSummary
                      ? 'bg-gradient-to-r from-[#FF6B2C] to-[#FA5A14] hover:brightness-105 text-white active-press cursor-pointer shadow-md'
                      : 'bg-[#E8E6E1] text-[#A3A099] cursor-not-allowed border border-[#D5D3CC]'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {extensionSummary
                      ? `Confirm +${extensionSummary.addedHours}h (Until ${extensionSummary.newEndTimeStr} · +₹${extensionSummary.addedFee})`
                      : 'Select Extension Slot'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
