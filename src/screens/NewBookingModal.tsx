import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Plus,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Check,
  Zap,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { haptics } from '../utils/haptics';

// All standard operating hours for sports turf slots
const ALL_TIME_SLOTS = [
  { value: '05:00 AM', minutes: 300, label: '05:00 AM (Early Morning)' },
  { value: '06:00 AM', minutes: 360, label: '06:00 AM' },
  { value: '07:00 AM', minutes: 420, label: '07:00 AM' },
  { value: '08:00 AM', minutes: 480, label: '08:00 AM' },
  { value: '09:00 AM', minutes: 540, label: '09:00 AM' },
  { value: '10:00 AM', minutes: 600, label: '10:00 AM' },
  { value: '11:00 AM', minutes: 660, label: '11:00 AM' },
  { value: '12:00 PM', minutes: 720, label: '12:00 PM (Noon)' },
  { value: '01:00 PM', minutes: 780, label: '01:00 PM' },
  { value: '02:00 PM', minutes: 840, label: '02:00 PM' },
  { value: '03:00 PM', minutes: 900, label: '03:00 PM' },
  { value: '04:00 PM', minutes: 960, label: '04:00 PM' },
  { value: '05:00 PM', minutes: 1020, label: '05:00 PM' },
  { value: '06:00 PM', minutes: 1080, label: '06:00 PM (Prime Evening)' },
  { value: '07:00 PM', minutes: 1140, label: '07:00 PM (Prime Evening)' },
  { value: '08:00 PM', minutes: 1200, label: '08:00 PM (Prime Night)' },
  { value: '09:00 PM', minutes: 1260, label: '09:00 PM (Prime Night)' },
  { value: '10:00 PM', minutes: 1320, label: '10:00 PM' },
  { value: '11:00 PM', minutes: 1380, label: '11:00 PM' },
  { value: '12:00 AM', minutes: 1440, label: '12:00 AM (Midnight)' },
];

export const NewBookingModal: React.FC = () => {
  const { activeModal, setActiveModal, courts, createNewBooking } = useApp();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+91 ');
  const [courtId, setCourtId] = useState(courts[0]?.id || 'court-1');
  const [sport, setSport] = useState('Football');

  // Manual Start Time & End Time
  const [startTime, setStartTime] = useState('06:00 PM');
  const [endTime, setEndTime] = useState('08:00 PM');

  const [totalAmount, setTotalAmount] = useState('2000');
  const [paidAmount, setPaidAmount] = useState('1000');

  const currentCourt = courts.find((c) => c.id === courtId) || courts[0];
  const unitPrice = currentCourt ? currentCourt.pricePerHour : 1000;

  // Calculate duration in hours based on Start & End Time
  const startSlotObj = ALL_TIME_SLOTS.find((t) => t.value === startTime) || ALL_TIME_SLOTS[13]; // 06:00 PM
  const endSlotObj = ALL_TIME_SLOTS.find((t) => t.value === endTime) || ALL_TIME_SLOTS[15]; // 08:00 PM

  const diffMinutes = endSlotObj.minutes - startSlotObj.minutes;
  const durationHours = diffMinutes > 0 ? diffMinutes / 60 : 1;

  if (activeModal !== 'new_booking') return null;

  // Handle Court Change
  const handleCourtChange = (id: string) => {
    setCourtId(id);
    const court = courts.find((c) => c.id === id);
    if (court) {
      setSport(court.sports[0]);
      const newTotal = Math.round(court.pricePerHour * durationHours);
      setTotalAmount(newTotal.toString());
      setPaidAmount(Math.round(newTotal / 2).toString());
    }
  };

  // Handle Manual Start Time Change
  const handleStartTimeChange = (newStart: string) => {
    haptics.tap();
    setStartTime(newStart);
    const newStartObj = ALL_TIME_SLOTS.find((t) => t.value === newStart);
    if (!newStartObj) return;

    // Check if current endTime is after new startTime
    const currentEndObj = ALL_TIME_SLOTS.find((t) => t.value === endTime);
    if (!currentEndObj || currentEndObj.minutes <= newStartObj.minutes) {
      // Automatically adjust endTime to startTime + duration or +1 hr
      const targetMins = newStartObj.minutes + (durationHours > 0 ? durationHours * 60 : 60);
      const matchingEnd = ALL_TIME_SLOTS.find((t) => t.minutes === targetMins) ||
        ALL_TIME_SLOTS.find((t) => t.minutes > newStartObj.minutes) ||
        ALL_TIME_SLOTS[ALL_TIME_SLOTS.length - 1];
      if (matchingEnd) {
        setEndTime(matchingEnd.value);
        const newDur = (matchingEnd.minutes - newStartObj.minutes) / 60;
        const newTotal = Math.round(unitPrice * (newDur > 0 ? newDur : 1));
        setTotalAmount(newTotal.toString());
        setPaidAmount(Math.round(newTotal / 2).toString());
      }
    } else {
      const newDur = (currentEndObj.minutes - newStartObj.minutes) / 60;
      const newTotal = Math.round(unitPrice * (newDur > 0 ? newDur : 1));
      setTotalAmount(newTotal.toString());
      setPaidAmount(Math.round(newTotal / 2).toString());
    }
  };

  // Handle Manual End Time Change
  const handleEndTimeChange = (newEnd: string) => {
    haptics.tap();
    setEndTime(newEnd);
    const newEndObj = ALL_TIME_SLOTS.find((t) => t.value === newEnd);
    if (!newEndObj) return;

    const newDur = (newEndObj.minutes - startSlotObj.minutes) / 60;
    const effectiveDur = newDur > 0 ? newDur : 1;
    const newTotal = Math.round(unitPrice * effectiveDur);
    setTotalAmount(newTotal.toString());
    setPaidAmount(Math.round(newTotal / 2).toString());
  };

  // Handle Quick Duration Preset Click
  const handlePresetDuration = (hours: number) => {
    haptics.tap();
    const targetMins = startSlotObj.minutes + hours * 60;
    const matchingEnd = ALL_TIME_SLOTS.find((t) => t.minutes === targetMins);
    if (matchingEnd) {
      setEndTime(matchingEnd.value);
    } else {
      // Fallback to latest slot
      setEndTime(ALL_TIME_SLOTS[ALL_TIME_SLOTS.length - 1].value);
    }
    const newTotal = Math.round(unitPrice * hours);
    setTotalAmount(newTotal.toString());
    setPaidAmount(Math.round(newTotal / 2).toString());
  };

  // Formatted Slot Display
  const computeTimeSlotLabel = () => {
    return `${startTime} – ${endTime} (${durationHours} ${durationHours === 1 ? 'Hour' : 'Continuous Hours'})`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    const total = parseInt(totalAmount, 10) || unitPrice * durationHours;
    const paid = parseInt(paidAmount, 10) || 0;
    const court = courts.find((c) => c.id === courtId) || courts[0];
    const computedSlot = computeTimeSlotLabel();

    haptics.success();
    createNewBooking({
      customerName,
      customerPhone: customerPhone.trim() || '+91 98765 43210',
      courtId,
      courtName: court ? court.name : 'Turf 1',
      sport: (sport as any) || 'Football',
      timeSlot: computedSlot,
      date: 'Today, 28 Aug 2026',
      totalAmount: total,
      paidAmount: paid,
      notes: durationHours > 1 ? `${durationHours}-hour continuous reservation (${startTime} to ${endTime})` : undefined,
    });
  };

  // Valid End Time options (only times strictly after start time)
  const validEndOptions = ALL_TIME_SLOTS.filter((t) => t.minutes > startSlotObj.minutes);

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="w-full max-h-[92vh] overflow-y-auto no-scrollbar bg-white rounded-t-[32px] p-5 pb-8 shadow-2xl border-t border-[#E8E6E1]"
        >
          {/* iOS Grab Handle */}
          <div className="w-10 h-1 bg-[#D1CFCA] rounded-full mx-auto mb-3" />

          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F0EC]">
            <div>
              <h2 className="text-[18px] font-black text-[#171717] tracking-tight">
                New Booking Reservation
              </h2>
              <p className="text-[11px] text-[#777570] font-medium">
                Reserve custom start & end time slots
              </p>
            </div>
            <button
              onClick={() => {
                setActiveModal(null);
                haptics.tap();
              }}
              className="w-8 h-8 rounded-full bg-[#F1F0EC] flex items-center justify-center text-[#777570] hover:text-[#171717] active-press cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="py-2.5 space-y-3.5">
            {/* Customer Details */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11.5px] font-bold text-[#171717] mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Kumar"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-[#F7F7F5] border border-[#E8E6E1] rounded-[14px] px-3 py-2 text-[13px] font-bold text-[#171717] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-bold text-[#171717] mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765..."
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-[#F7F7F5] border border-[#E8E6E1] rounded-[14px] px-3 py-2 text-[12.5px] font-bold text-[#171717] focus:outline-none"
                />
              </div>
            </div>

            {/* Court Selection */}
            <div>
              <label className="block text-[11.5px] font-bold text-[#171717] mb-1">
                Select Court & Turf
              </label>
              <select
                value={courtId}
                onChange={(e) => handleCourtChange(e.target.value)}
                className="w-full bg-[#F7F7F5] border border-[#E8E6E1] rounded-[14px] px-3 py-2 text-[13px] font-bold text-[#171717] focus:outline-none"
              >
                {courts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.sports.join(', ')}) — ₹{c.pricePerHour}/hr
                  </option>
                ))}
              </select>
            </div>

            {/* Booking Duration & Manual Start / End Time Selection */}
            <div className="bg-[#F7F7F5] border border-[#E8E6E1] rounded-2xl p-3.5 space-y-3">
              {/* Card Header & Dynamic Duration Badge */}
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-extrabold text-[#171717] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#FF6B2C]" />
                  <span>Booking Duration & Timings</span>
                </label>
                <span className="text-[10.5px] font-extrabold bg-[#FF6B2C]/10 text-[#FF6B2C] px-2.5 py-0.5 rounded-full">
                  {durationHours} {durationHours === 1 ? 'Hour' : 'Hours'} ({durationHours * 60} mins)
                </span>
              </div>

              {/* Quick Duration Preset Pills */}
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  type="button"
                  id="btn-duration-1hr"
                  onClick={() => handlePresetDuration(1)}
                  className={`py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                    durationHours === 1
                      ? 'bg-[#171717] text-white shadow-xs'
                      : 'bg-white text-[#777570] border border-[#E8E6E1] hover:bg-[#EBE9E3]'
                  }`}
                >
                  <span>1 Hour</span>
                  <span className="text-[8.5px] opacity-75">Single slot</span>
                </button>

                <button
                  type="button"
                  id="btn-duration-2hrs"
                  onClick={() => handlePresetDuration(2)}
                  className={`py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                    durationHours === 2
                      ? 'bg-[#171717] text-white shadow-xs'
                      : 'bg-white text-[#777570] border border-[#E8E6E1] hover:bg-[#EBE9E3]'
                  }`}
                >
                  <span className="flex items-center gap-0.5">
                    <Zap className="w-3 h-3 text-[#FF6B2C]" />
                    2 Hours
                  </span>
                  <span className="text-[8.5px] text-[#FF6B2C] font-extrabold">Continuous</span>
                </button>

                <button
                  type="button"
                  id="btn-duration-3hrs"
                  onClick={() => handlePresetDuration(3)}
                  className={`py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                    durationHours === 3
                      ? 'bg-[#171717] text-white shadow-xs'
                      : 'bg-white text-[#777570] border border-[#E8E6E1] hover:bg-[#EBE9E3]'
                  }`}
                >
                  <span>3 Hours</span>
                  <span className="text-[8.5px] opacity-75">Extended</span>
                </button>

                <button
                  type="button"
                  id="btn-duration-4hrs"
                  onClick={() => handlePresetDuration(4)}
                  className={`py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                    durationHours >= 4
                      ? 'bg-[#171717] text-white shadow-xs'
                      : 'bg-white text-[#777570] border border-[#E8E6E1] hover:bg-[#EBE9E3]'
                  }`}
                >
                  <span>4+ Hours</span>
                  <span className="text-[8.5px] opacity-75">Tournament</span>
                </button>
              </div>

              {/* Manual Start Time & End Time Inputs */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {/* Start Time Select */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-[#171717] flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#2FA66A]" />
                      Start Time
                    </label>
                  </div>
                  <select
                    value={startTime}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                    className="w-full bg-white border border-[#E8E6E1] rounded-xl px-2.5 py-2 text-[12.5px] font-extrabold text-[#171717] focus:outline-none focus:border-[#FF6B2C] shadow-2xs"
                  >
                    {ALL_TIME_SLOTS.slice(0, -1).map((slot) => (
                      <option key={slot.value} value={slot.value}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* End Time Select */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-[#171717] flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#FF6B2C]" />
                      End Time
                    </label>
                  </div>
                  <select
                    value={endTime}
                    onChange={(e) => handleEndTimeChange(e.target.value)}
                    className="w-full bg-white border border-[#E8E6E1] rounded-xl px-2.5 py-2 text-[12.5px] font-extrabold text-[#171717] focus:outline-none focus:border-[#FF6B2C] shadow-2xs"
                  >
                    {validEndOptions.map((slot) => (
                      <option key={slot.value} value={slot.value}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Slot & Price Breakdown Banner */}
              <div className="bg-white rounded-xl p-2.5 border border-[#E8E6E1] flex items-center justify-between">
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-[#A3A099] block tracking-wide">
                    Reservation Window
                  </span>
                  <div className="text-[12.5px] font-extrabold text-[#FF6B2C] truncate flex items-center gap-1">
                    <span>{startTime}</span>
                    <ArrowRight className="w-3 h-3 text-[#777570] shrink-0" />
                    <span>{endTime}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold text-[#A3A099] block tracking-wide">
                    Rate Calculation
                  </span>
                  <span className="text-[12px] font-extrabold text-[#171717]">
                    ₹{unitPrice}/hr × {durationHours} hr{durationHours > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Multi-hour continuous badge */}
              {durationHours >= 2 && (
                <div className="p-2.5 rounded-xl bg-[#E8F8EE] border border-[#A7E8BD] flex items-center gap-2 text-[11px] font-bold text-[#177A42]">
                  <Check className="w-4 h-4 shrink-0 stroke-[2.5] text-[#2FA66A]" />
                  <span>
                    Continuous {durationHours}-hour span: Reserves consecutive slots automatically for uninterrupted play.
                  </span>
                </div>
              )}
            </div>

            {/* Financials */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11.5px] font-bold text-[#171717] mb-1">
                  Total Price (₹)
                </label>
                <input
                  type="number"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="w-full bg-[#F7F7F5] border border-[#E8E6E1] rounded-[14px] px-3 py-2 text-[13px] font-bold text-[#171717] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-bold text-[#171717] mb-1">
                  Advance Collected (₹)
                </label>
                <input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  className="w-full bg-[#F7F7F5] border border-[#E8E6E1] rounded-[14px] px-3 py-2 text-[13px] font-bold text-[#1E9A55] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                id="btn-submit-new-booking"
                className="w-full h-11 bg-[#FF6B2C] text-white font-bold text-[13.5px] rounded-xl flex items-center justify-center shadow-xs hover:bg-[#e85b1e] active-press cursor-pointer"
              >
                Create & Confirm Reservation
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
