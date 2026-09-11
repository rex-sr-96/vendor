import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ChevronLeft,
  ChevronDown,
  Check,
  Flame,
  Calendar,
  Layers,
  Sparkles,
  Clock,
  IndianRupee,
  HelpCircle,
  Sun,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'motion/react';
import { haptics } from '../utils/haptics';

const AVAILABLE_SPORTS = [
  'Football',
  'Cricket',
  'Badminton',
  'Pickleball',
  'Tennis',
  'Basketball',
  'Volleyball',
  'Padel',
];

const DURATION_OPTIONS = [
  '30 Mins',
  '1 Hour',
  '1.5 Hours',
  '2 Hours',
  '3 Hours',
];

const TIME_SLOTS = [
  '05:00 AM',
  '06:00 AM',
  '07:00 AM',
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
  '07:00 PM',
  '08:00 PM',
  '09:00 PM',
  '10:00 PM',
  '11:00 PM',
  '12:00 AM',
];

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const AddCourtScreen: React.FC = () => {
  const { goBack, addNewCourt, showToast } = useApp();

  // Form states
  const [isSamePhysicalSports, setIsSamePhysicalSports] = useState<'yes' | 'no'>('yes');
  const [selectedSports, setSelectedSports] = useState<string[]>(['Football']);
  const [courtName, setCourtName] = useState('');
  const [displayName, setDisplayName] = useState('');

  // Extended options for 'No'
  const [minBookingTime, setMinBookingTime] = useState('1 Hour');
  const [regularPrice, setRegularPrice] = useState('1000');
  
  // SEPARATE Peak Hours Window
  const [peakHoursStart, setPeakHoursStart] = useState('06:00 PM');
  const [peakHoursEnd, setPeakHoursEnd] = useState('11:00 PM');
  const [peakHoursPrice, setPeakHoursPrice] = useState('1400');

  // SEPARATE Peak Days
  const [peakDays, setPeakDays] = useState<string[]>(['Fri', 'Sat', 'Sun']);

  // SEPARATE Weekend Price
  const [weekendPrice, setWeekendPrice] = useState('1500');

  const togglePeakDay = (day: string) => {
    haptics.tap();
    if (peakDays.includes(day)) {
      if (peakDays.length > 1) {
        setPeakDays(peakDays.filter((d) => d !== day));
      } else {
        showToast('At least one day required', 'Select at least one peak day.', 'info');
      }
    } else {
      setPeakDays([...peakDays, day]);
    }
  };

  const handleSaveCourt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courtName.trim()) {
      showToast('Court Name Required', 'Please enter a name for this court.', 'warning');
      return;
    }
    if (selectedSports.length === 0) {
      showToast('Sport Required', 'Please select at least one sport.', 'warning');
      return;
    }

    if (isSamePhysicalSports === 'yes') {
      addNewCourt({
        name: courtName.trim(),
        displayName: displayName.trim() || undefined,
        samePhysicalSports: true,
        sports: selectedSports,
        pricePerHour: 1000,
        operatingHours: '06:00 AM – 11:00 PM',
        status: 'Pending Approval',
        statusDetails: 'Submitted · Physical ground mapped to existing sports turf',
      });
      showToast('Court Added', `${courtName} submitted for approval`, 'success');
    } else {
      const parsedPrice = parseInt(regularPrice, 10) || 1000;
      const parsedPeakPrice = parseInt(peakHoursPrice, 10) || parsedPrice;
      const parsedWeekendPrice = parseInt(weekendPrice, 10) || parsedPrice;

      addNewCourt({
        name: courtName.trim(),
        displayName: displayName.trim() || undefined,
        samePhysicalSports: false,
        sports: selectedSports,
        pricePerHour: parsedPrice,
        minBookingDuration: minBookingTime,
        peakHoursStart,
        peakHoursEnd,
        peakDays,
        peakHoursPrice: parsedPeakPrice,
        weekendPrice: parsedWeekendPrice,
        operatingHours: `${peakHoursStart} – ${peakHoursEnd}`,
        status: 'Pending Approval',
        statusDetails: 'Submitted · Custom pricing and peak schedules configured',
      });
      showToast('Court Added', `${courtName} with custom rates submitted for approval`, 'success');
    }

    haptics.success();
    goBack();
  };

  return (
    <div className="pb-32 pt-3 px-4 w-full max-w-md mx-auto space-y-4">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={goBack}
            className="w-10 h-10 -ml-2 rounded-xl flex items-center justify-center text-[#021526] hover:bg-[#E5E7EB]/50 active-press cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
          </button>
          <div>
            <h1 className="text-[20px] font-bold text-[#021526] leading-tight">Add New Court</h1>
            <p className="text-[11px] text-[#5F6368]">Configure court specs, pricing & peak schedules</p>
          </div>
        </div>

        <div className="w-8 h-8 rounded-full bg-[#F94001]/10 text-[#F94001] flex items-center justify-center font-bold text-[12px]">
          <Layers className="w-4 h-4" />
        </div>
      </div>

      <form onSubmit={handleSaveCourt} className="space-y-4 pt-1">
        {/* ========================================================================= */}
        {/* SECTION 1: QUESTION: Same physical sports for this turf?                 */}
        {/* ========================================================================= */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#021526] text-white text-[11px] font-bold flex items-center justify-center">
                1
              </span>
              <label className="text-[13.5px] font-bold text-[#021526]">
                Same physical sports for this turf?
              </label>
            </div>
            <span className="text-[10px] text-[#F94001] bg-[#F94001]/10 font-bold px-2 py-0.5 rounded-full">
              Required
            </span>
          </div>

          <p className="text-[11.5px] text-[#5F6368] leading-relaxed">
            Select <span className="font-bold text-[#021526]">Yes</span> if this court maps to an existing shared physical ground layout with standard rates.
          </p>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              id="btn-same-physical-yes"
              onClick={() => {
                haptics.tap();
                setIsSamePhysicalSports('yes');
              }}
              className={`py-3 px-3.5 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 transition-all border cursor-pointer ${
                isSamePhysicalSports === 'yes'
                  ? 'bg-[#021526] text-white border-transparent shadow-xs'
                  : 'bg-[#F3F4F4] text-[#5F6368] border-[#E5E7EB] hover:border-[#021526]/30'
              }`}
            >
              {isSamePhysicalSports === 'yes' && <Check className="w-4 h-4 text-[#16A34A]" />}
              <span>Yes</span>
            </button>

            <button
              type="button"
              id="btn-same-physical-no"
              onClick={() => {
                haptics.tap();
                setIsSamePhysicalSports('no');
              }}
              className={`py-3 px-3.5 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 transition-all border cursor-pointer ${
                isSamePhysicalSports === 'no'
                  ? 'bg-[#021526] text-white border-transparent shadow-xs'
                  : 'bg-[#F3F4F4] text-[#5F6368] border-[#E5E7EB] hover:border-[#021526]/30'
              }`}
            >
              {isSamePhysicalSports === 'no' && <Check className="w-4 h-4 text-[#16A34A]" />}
              <span>No</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: BASIC DETAILS (Always shown)                                   */}
        {/* ========================================================================= */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-3.5">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#021526] text-white text-[11px] font-bold flex items-center justify-center">
              2
            </span>
            <h3 className="text-[13.5px] font-bold text-[#021526]">Court Information</h3>
          </div>

          {/* Select Sport Dropdown */}
          <div>
            <label className="block text-[12px] font-bold text-[#021526] mb-1">
              Select Sport <span className="text-[#F94001]">*</span>
            </label>
            <div className="relative">
              <select
                id="select-sport-dropdown"
                value={selectedSports[0] || 'Football'}
                onChange={(e) => {
                  haptics.tap();
                  setSelectedSports([e.target.value]);
                }}
                className="w-full bg-[#F3F4F4] border border-[#E5E7EB] rounded-[14px] px-3.5 py-2.5 text-[14px] font-semibold text-[#021526] focus:outline-none focus:border-[#021526] appearance-none cursor-pointer pr-10"
              >
                {AVAILABLE_SPORTS.map((sp) => (
                  <option key={sp} value={sp}>
                    {sp}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#5F6368] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Court Name */}
          <div>
            <label className="block text-[12px] font-bold text-[#021526] mb-1">
              Court Name <span className="text-[#F94001]">*</span>
            </label>
            <input
              type="text"
              required
              value={courtName}
              onChange={(e) => setCourtName(e.target.value)}
              placeholder="e.g. Turf 1A (5-a-side)"
              className="w-full bg-[#F3F4F4] border border-[#E5E7EB] rounded-[14px] px-3.5 py-2.5 text-[14px] font-semibold text-[#021526] focus:outline-none focus:border-[#021526]"
            />
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-[12px] font-bold text-[#021526] mb-1">
              Display Name <span className="text-[10.5px] font-normal text-[#5F6368]">(Customer-Facing)</span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Main Arena Pitch 1 (Floodlit Turf)"
              className="w-full bg-[#F3F4F4] border border-[#E5E7EB] rounded-[14px] px-3.5 py-2.5 text-[14px] font-semibold text-[#021526] focus:outline-none focus:border-[#021526]"
            />
            <p className="text-[10.5px] text-[#5F6368] mt-1">
              Customer-facing title displayed on schedules and online booking slots.
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CONDITIONAL SECTIONS: IF 'NO' IS SELECTED                                 */}
        {/* ========================================================================= */}
        {isSamePhysicalSports === 'no' && (
          <div className="space-y-4">
            {/* SECTION 3: BASE BOOKING SETTINGS */}
            <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-3.5">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#021526] text-white text-[11px] font-bold flex items-center justify-center">
                  3
                </span>
                <h3 className="text-[13.5px] font-bold text-[#021526]">Base Duration & Rate</h3>
              </div>

              {/* Minimum Booking Time */}
              <div className="space-y-1.5">
                <label className="block text-[12px] font-bold text-[#021526]">
                  Minimum Booking Time
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {DURATION_OPTIONS.map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => {
                        haptics.tap();
                        setMinBookingTime(dur);
                      }}
                      className={`py-2 px-2 rounded-xl text-[11.5px] font-bold transition-all border cursor-pointer ${
                        minBookingTime === dur
                          ? 'bg-[#021526] text-white border-transparent'
                          : 'bg-[#F3F4F4] text-[#5F6368] border-[#E5E7EB]'
                      }`}
                    >
                      {dur}
                    </button>
                  ))}
                </div>
              </div>

              {/* Regular Booking Price */}
              <div>
                <label className="block text-[12px] font-bold text-[#021526] mb-1">
                  Regular Booking Price (₹/hour) <span className="text-[#F94001]">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-[#5F6368] font-bold text-[14px]">₹</span>
                  <input
                    type="number"
                    required
                    value={regularPrice}
                    onChange={(e) => setRegularPrice(e.target.value)}
                    placeholder="1000"
                    className="w-full bg-[#F3F4F4] border border-[#E5E7EB] rounded-[14px] pl-8 pr-3.5 py-2.5 text-[14px] font-bold text-[#021526] focus:outline-none focus:border-[#021526]"
                  />
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* SEPARATE CARD 4: PEAK HOURS (Time Slot Window & Peak Price)               */}
            {/* ========================================================================= */}
            <div className="bg-white p-4 rounded-2xl border border-[#F94001]/30 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#F94001]/10 text-[#F94001] flex items-center justify-center">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-[13.5px] font-bold text-[#021526]">Peak Hours</h3>
                    <p className="text-[10.5px] text-[#5F6368]">Configure high-demand slot timings</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#F94001] bg-[#F94001]/10 px-2 py-0.5 rounded-full">
                  Time Window
                </span>
              </div>

              {/* Start & End Time Dropdowns */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-[#F3F4F4] p-2.5 rounded-xl border border-[#E5E7EB]">
                  <span className="text-[10px] font-bold text-[#5F6368] block mb-1">
                    START TIME
                  </span>
                  <select
                    value={peakHoursStart}
                    onChange={(e) => setPeakHoursStart(e.target.value)}
                    className="w-full bg-white border border-[#E5E7EB] rounded-lg px-2 py-1.5 text-[12.5px] font-bold text-[#021526] focus:outline-none cursor-pointer"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={`peak-start-${slot}`} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-[#F3F4F4] p-2.5 rounded-xl border border-[#E5E7EB]">
                  <span className="text-[10px] font-bold text-[#5F6368] block mb-1">
                    END TIME
                  </span>
                  <select
                    value={peakHoursEnd}
                    onChange={(e) => setPeakHoursEnd(e.target.value)}
                    className="w-full bg-white border border-[#E5E7EB] rounded-lg px-2 py-1.5 text-[12.5px] font-bold text-[#021526] focus:outline-none cursor-pointer"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={`peak-end-${slot}`} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Peak Hours Price */}
              <div>
                <label className="block text-[12px] font-bold text-[#021526] mb-1">
                  Peak Hours Price (₹/hour)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-[#F94001] font-bold text-[14px]">₹</span>
                  <input
                    type="number"
                    value={peakHoursPrice}
                    onChange={(e) => setPeakHoursPrice(e.target.value)}
                    placeholder="1400"
                    className="w-full bg-[#F3F4F4] border border-[#E5E7EB] rounded-[14px] pl-8 pr-3.5 py-2.5 text-[14px] font-bold text-[#021526] focus:outline-none focus:border-[#F94001]"
                  />
                </div>
                <p className="text-[10.5px] text-[#5F6368] mt-1">
                  Applies during {peakHoursStart} – {peakHoursEnd} on designated peak days.
                </p>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* SEPARATE CARD 5: PEAK DAYS (7-Day Selector & Presets)                     */}
            {/* ========================================================================= */}
            <div className="bg-white p-4 rounded-2xl border border-[#16A34A]/30 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-[13.5px] font-bold text-[#021526]">Peak Days</h3>
                    <p className="text-[10.5px] text-[#5F6368]">Select days subject to peak slot pricing</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      haptics.tap();
                      setPeakDays(['Fri', 'Sat', 'Sun']);
                    }}
                    className="text-[10.5px] font-bold text-[#15803D] bg-[#16A34A]/10 px-2 py-0.5 rounded hover:bg-[#16A34A]/20 cursor-pointer"
                  >
                    Fri–Sun
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      haptics.tap();
                      setPeakDays(DAYS_OF_WEEK);
                    }}
                    className="text-[10.5px] font-bold text-[#021526] bg-[#F3F4F4] border border-[#E5E7EB] px-2 py-0.5 rounded hover:bg-[#E5E7EB] cursor-pointer"
                  >
                    All
                  </button>
                </div>
              </div>

              {/* 7-Day Buttons */}
              <div className="grid grid-cols-7 gap-1.5 pt-1">
                {DAYS_OF_WEEK.map((d) => {
                  const isDaySelected = peakDays.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => togglePeakDay(d)}
                      className={`h-10 rounded-xl text-[12px] font-bold transition-all border cursor-pointer flex flex-col items-center justify-center ${
                        isDaySelected
                          ? 'bg-[#021526] text-white border-transparent shadow-2xs'
                          : 'bg-[#F3F4F4] text-[#5F6368] border-[#E5E7EB]'
                      }`}
                    >
                      <span>{d}</span>
                      {isDaySelected && <div className="w-1.5 h-1.5 rounded-full bg-[#16A34A] mt-0.5" />}
                    </button>
                  );
                })}
              </div>

              <div className="bg-[#F3F4F4] p-2.5 rounded-xl border border-[#E5E7EB] flex items-center justify-between text-[11px]">
                <span className="text-[#5F6368]">Active Peak Days:</span>
                <span className="font-bold text-[#021526]">
                  {peakDays.length === 7 ? 'Everyday' : peakDays.join(', ')}
                </span>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* SEPARATE CARD 6: WEEKEND SPECIAL RATE                                     */}
            {/* ========================================================================= */}
            <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#F59E0B]/15 text-[#B87C0D] flex items-center justify-center">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[13.5px] font-bold text-[#021526]">Weekend Price (Saturday & Sunday)</h3>
                  <p className="text-[10.5px] text-[#5F6368]">All-day weekend flat hourly rate</p>
                </div>
              </div>

              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-[#5F6368] font-bold text-[14px]">₹</span>
                <input
                  type="number"
                  value={weekendPrice}
                  onChange={(e) => setWeekendPrice(e.target.value)}
                  placeholder="1500"
                  className="w-full bg-[#F3F4F4] border border-[#E5E7EB] rounded-[14px] pl-8 pr-3.5 py-2.5 text-[14px] font-bold text-[#021526] focus:outline-none focus:border-[#021526]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            id="btn-submit-add-court"
            className="w-full h-12 bg-[#F94001] text-white font-bold text-[14.5px] rounded-xl flex items-center justify-center gap-2 shadow-xs hover:bg-[#D93600] active-press cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Submit Court for Approval</span>
          </button>
        </div>
      </form>
    </div>
  );
};
