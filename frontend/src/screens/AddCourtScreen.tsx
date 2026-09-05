import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  ChevronLeft,
  ChevronDown,
  Check,
  Flame,
  Calendar,
  Sparkles,
  Clock,
  Percent,
  Layers,
  ShieldCheck,
} from 'lucide-react';
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

  // 1. Same physical ground question
  const [isSamePhysicalSports, setIsSamePhysicalSports] = useState<'yes' | 'no'>('no');

  // 2. Court info
  const [selectedSports, setSelectedSports] = useState<string[]>(['Football']);
  const [courtName, setCourtName] = useState('');
  const [displayName, setDisplayName] = useState('');

  // 3. Base duration & rate
  const [minBookingTime, setMinBookingTime] = useState('1 Hour');
  const [regularPrice, setRegularPrice] = useState('1000');

  // 4. Peak hours & weekend rates
  const [peakHoursStart, setPeakHoursStart] = useState('06:00 PM');
  const [peakHoursEnd, setPeakHoursEnd] = useState('11:00 PM');
  const [peakHoursPrice, setPeakHoursPrice] = useState('1400');
  const [peakDays, setPeakDays] = useState<string[]>(['Fri', 'Sat', 'Sun']);
  const [weekendPrice, setWeekendPrice] = useState('1500');

  // 5. Court-Specific Cancellation & Refund Policy (Exact match with user specs)
  const [cancellationNoticeHours, setCancellationNoticeHours] = useState<'2 Hours' | '4 Hours' | '12 Hours' | '24 Hours'>('12 Hours');
  const [refundPercentage, setRefundPercentage] = useState<'50%' | '75%' | '90%' | '100%'>('100%');

  const togglePeakDay = (day: string) => {
    haptics.tap();
    if (peakDays.includes(day)) {
      if (peakDays.length > 1) {
        setPeakDays(peakDays.filter((d) => d !== day));
      } else {
        showToast('Required', 'Select at least one peak day.', 'info');
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

    const windowHoursNum = parseInt(cancellationNoticeHours.split(' ')[0], 10) || 12;
    const refundPercentNum = parseInt(refundPercentage.replace('%', ''), 10) || 100;
    const policyLabel = `Free cancel up to ${cancellationNoticeHours} before kickoff (${refundPercentage} refund)`;

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
        cancellationWindowHours: windowHoursNum,
        refundPercentage: refundPercentNum,
        cancellationPolicyLabel: policyLabel,
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
        statusDetails: 'Submitted · Custom pricing & cancellation rules configured',
        cancellationWindowHours: windowHoursNum,
        refundPercentage: refundPercentNum,
        cancellationPolicyLabel: policyLabel,
      });
      showToast('Court Added', `${courtName} created with custom cancellation policy`, 'success');
    }

    haptics.success();
    goBack();
  };

  return (
    <div className="pb-32 pt-1 px-4 w-full max-w-3xl mx-auto space-y-4 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E8E6E1]">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="md:hidden w-9 h-9 rounded-xl bg-white border border-[#E8E6E1] flex items-center justify-center text-[#171717] hover:bg-[#F7F7F5] shadow-2xs active-press cursor-pointer transition-all"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          </button>
          <div>
            <h1 className="text-[21px] font-black text-[#171717] tracking-tight">Add New Court / Turf</h1>
            <p className="text-[11.5px] font-medium text-[#777570]">Configure court specs, sport layouts, pricing rates & peak schedules</p>
          </div>
        </div>

        <div className="w-9 h-9 rounded-xl bg-[#FF6B2C]/10 text-[#FF6B2C] flex items-center justify-center">
          <Layers className="w-4 h-4" />
        </div>
      </div>

      <form onSubmit={handleSaveCourt} className="space-y-3.5">
        {/* ========================================================================= */}
        {/* SECTION 1: QUESTION: Same physical sports for this turf?                 */}
        {/* ========================================================================= */}
        <div className="bg-white p-4 rounded-2xl border border-[#E8E6E1] shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-[13px] font-black text-[#171717] flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#171717] text-white text-[10px] font-bold flex items-center justify-center">
                1
              </span>
              <span>Same physical sports for this turf?</span>
            </label>
            <span className="text-[9.5px] text-[#FF6B2C] bg-[#FF6B2C]/10 font-bold px-2 py-0.5 rounded-full">
              Required
            </span>
          </div>

          <p className="text-[11px] text-[#777570]">
            Select <strong className="text-[#171717]">Yes</strong> if this court maps to an existing shared physical ground layout with standard rates.
          </p>

          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              type="button"
              id="btn-same-physical-yes"
              onClick={() => {
                haptics.tap();
                setIsSamePhysicalSports('yes');
              }}
              className={`py-2.5 px-3 rounded-xl font-bold text-[13px] flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${
                isSamePhysicalSports === 'yes'
                  ? 'bg-[#171717] text-white border-[#171717] shadow-xs'
                  : 'bg-[#FAF9F6] text-[#777570] border-[#E8E6E1] hover:text-[#171717]'
              }`}
            >
              {isSamePhysicalSports === 'yes' && <Check className="w-3.5 h-3.5 text-[#2FA66A]" />}
              <span>Yes</span>
            </button>

            <button
              type="button"
              id="btn-same-physical-no"
              onClick={() => {
                haptics.tap();
                setIsSamePhysicalSports('no');
              }}
              className={`py-2.5 px-3 rounded-xl font-bold text-[13px] flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${
                isSamePhysicalSports === 'no'
                  ? 'bg-[#171717] text-white border-[#171717] shadow-xs'
                  : 'bg-[#FAF9F6] text-[#777570] border-[#E8E6E1] hover:text-[#171717]'
              }`}
            >
              {isSamePhysicalSports === 'no' && <Check className="w-3.5 h-3.5 text-[#2FA66A]" />}
              <span>No</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: COURT INFORMATION                                             */}
        {/* ========================================================================= */}
        <div className="bg-white p-4 rounded-2xl border border-[#E8E6E1] shadow-2xs space-y-3">
          <div className="flex items-center gap-1.5 pb-1 border-b border-[#F1F0EC]">
            <span className="w-4 h-4 rounded-full bg-[#171717] text-white text-[10px] font-bold flex items-center justify-center">
              2
            </span>
            <h3 className="text-[13px] font-black text-[#171717]">Court Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#777570] mb-1">
                Select Sport <span className="text-[#FF6B2C]">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedSports[0] || 'Football'}
                  onChange={(e) => {
                    haptics.tap();
                    setSelectedSports([e.target.value]);
                  }}
                  className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-[13px] font-bold text-[#171717] focus:outline-none focus:border-[#171717] appearance-none cursor-pointer pr-9"
                >
                  {AVAILABLE_SPORTS.map((sp) => (
                    <option key={sp} value={sp}>
                      {sp}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#777570] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#777570] mb-1">
                Court Name <span className="text-[#FF6B2C]">*</span>
              </label>
              <input
                type="text"
                required
                value={courtName}
                onChange={(e) => setCourtName(e.target.value)}
                placeholder="e.g. Turf 1A (5-a-side)"
                className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-[13px] font-bold text-[#171717] focus:outline-none focus:border-[#171717]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#777570] mb-1">
              Display Name <span className="text-[10px] text-[#A3A099] font-normal">(Customer-Facing, optional)</span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Main Arena Pitch 1 (Floodlit Turf)"
              className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-[13px] font-bold text-[#171717] focus:outline-none focus:border-[#171717]"
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CONDITIONAL SECTIONS IF 'NO'                                              */}
        {/* ========================================================================= */}
        {isSamePhysicalSports === 'no' && (
          <div className="space-y-3.5">
            {/* SECTION 3: BASE DURATION & RATE */}
            <div className="bg-white p-4 rounded-2xl border border-[#E8E6E1] shadow-2xs space-y-3">
              <div className="flex items-center gap-1.5 pb-1 border-b border-[#F1F0EC]">
                <span className="w-4 h-4 rounded-full bg-[#171717] text-white text-[10px] font-bold flex items-center justify-center">
                  3
                </span>
                <h3 className="text-[13px] font-black text-[#171717]">Base Duration & Rate</h3>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#777570] mb-1.5">
                  Minimum Booking Duration
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {DURATION_OPTIONS.map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => {
                        haptics.tap();
                        setMinBookingTime(dur);
                      }}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all border cursor-pointer text-center ${
                        minBookingTime === dur
                          ? 'bg-[#171717] text-white border-[#171717]'
                          : 'bg-[#FAF9F6] text-[#777570] border-[#E8E6E1] hover:text-[#171717]'
                      }`}
                    >
                      {dur}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#777570] mb-1">
                  Regular Hourly Price (₹/hour) <span className="text-[#FF6B2C]">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-[#777570] font-bold text-[13px]">₹</span>
                  <input
                    type="number"
                    required
                    value={regularPrice}
                    onChange={(e) => setRegularPrice(e.target.value)}
                    placeholder="1000"
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl pl-7 pr-3 py-2 text-[13px] font-bold text-[#171717] focus:outline-none focus:border-[#171717]"
                  />
                  <span className="absolute right-3 text-[11px] font-bold text-[#777570]">/ hour</span>
                </div>
              </div>
            </div>

            {/* SECTION 4: PEAK HOURS & WEEKEND */}
            <div className="bg-white p-4 rounded-2xl border border-[#FF6B2C]/30 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-[#F1F0EC]">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#FF6B2C] text-white text-[10px] font-bold flex items-center justify-center">
                    4
                  </span>
                  <h3 className="text-[13px] font-black text-[#171717]">Peak Surcharge & Weekend Rates</h3>
                </div>
                <span className="text-[9.5px] font-bold text-[#FF6B2C] bg-[#FF6B2C]/10 px-2 py-0.5 rounded-full">
                  High Demand
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <span className="text-[10px] font-bold text-[#777570] block mb-1">PEAK START</span>
                  <select
                    value={peakHoursStart}
                    onChange={(e) => setPeakHoursStart(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-2.5 py-1.5 text-[12px] font-bold text-[#171717] focus:outline-none cursor-pointer"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={`peak-start-${slot}`} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#777570] block mb-1">PEAK END</span>
                  <select
                    value={peakHoursEnd}
                    onChange={(e) => setPeakHoursEnd(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-2.5 py-1.5 text-[12px] font-bold text-[#171717] focus:outline-none cursor-pointer"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={`peak-end-${slot}`} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10.5px] font-bold text-[#777570] mb-1">Peak Rate (₹/hr)</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-2.5 text-[#FF6B2C] font-bold text-[12px]">₹</span>
                    <input
                      type="number"
                      value={peakHoursPrice}
                      onChange={(e) => setPeakHoursPrice(e.target.value)}
                      placeholder="1400"
                      className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl pl-6 pr-2.5 py-1.5 text-[12.5px] font-bold text-[#171717] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-[#777570] mb-1">Weekend Rate (₹/hr)</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-2.5 text-[#171717] font-bold text-[12px]">₹</span>
                    <input
                      type="number"
                      value={weekendPrice}
                      onChange={(e) => setWeekendPrice(e.target.value)}
                      placeholder="1500"
                      className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl pl-6 pr-2.5 py-1.5 text-[12.5px] font-bold text-[#171717] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10.5px] font-bold text-[#777570]">Active Peak Days</span>
                  <button
                    type="button"
                    onClick={() => {
                      haptics.tap();
                      setPeakDays(['Fri', 'Sat', 'Sun']);
                    }}
                    className="text-[9.5px] font-bold text-[#2FA66A] bg-[#2FA66A]/10 px-1.5 py-0.5 rounded cursor-pointer"
                  >
                    Fri–Sun Preset
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {DAYS_OF_WEEK.map((d) => {
                    const isDaySelected = peakDays.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => togglePeakDay(d)}
                        className={`h-8 rounded-lg text-[11px] font-bold transition-all border cursor-pointer ${
                          isDaySelected
                            ? 'bg-[#171717] text-white border-[#171717]'
                            : 'bg-[#FAF9F6] text-[#777570] border-[#E8E6E1]'
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 5: COURT-SPECIFIC CANCELLATION & REFUND POLICY                    */}
        {/* (Exact match with user attached screenshot cards)                        */}
        {/* ========================================================================= */}
        <div className="space-y-3">
          {/* Card 1: Free Cancellation Window */}
          <div className="bg-white rounded-2xl p-4 border border-[#E8E6E1] shadow-2xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FF6B2C]/10 text-[#FF6B2C] flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[15px] font-black text-[#171717] leading-tight">
                  Free Cancellation Window
                </h3>
                <p className="text-[11.5px] text-[#777570] font-medium mt-0.5">
                  Minimum notice required for full or partial refund
                </p>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#171717] mb-2">
                Notice Buffer Before Match Kickoff:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['2 Hours', '4 Hours', '12 Hours', '24 Hours'] as const).map((win) => {
                  const isSelected = cancellationNoticeHours === win;
                  return (
                    <button
                      key={win}
                      type="button"
                      onClick={() => {
                        haptics.tap();
                        setCancellationNoticeHours(win);
                      }}
                      className={`py-2.5 px-3 rounded-xl font-black text-[13px] transition-all border cursor-pointer text-center ${
                        isSelected
                          ? 'bg-[#171717] text-white border-[#171717] shadow-xs'
                          : 'bg-[#FAF9F6] text-[#171717] border-[#E8E6E1] hover:bg-[#F1F0EC]'
                      }`}
                    >
                      {win}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card 2: Refund Payout Percentage */}
          <div className="bg-white rounded-2xl p-4 border border-[#E8E6E1] shadow-2xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#2FA66A]/10 text-[#2FA66A] flex items-center justify-center shrink-0">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[15px] font-black text-[#171717] leading-tight">
                  Refund Payout Percentage
                </h3>
                <p className="text-[11.5px] text-[#777570] font-medium mt-0.5">
                  Amount returned to customer source account
                </p>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#171717] mb-2">
                Eligible Refund Value:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['50%', '75%', '90%', '100%'] as const).map((pct) => {
                  const isSelected = refundPercentage === pct;
                  return (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => {
                        haptics.tap();
                        setRefundPercentage(pct);
                      }}
                      className={`py-2.5 px-3 rounded-xl font-black text-[13px] transition-all border cursor-pointer text-center ${
                        isSelected
                          ? 'bg-[#2FA66A] text-white border-[#2FA66A] shadow-xs'
                          : 'bg-[#FAF9F6] text-[#171717] border-[#E8E6E1] hover:bg-[#F1F0EC]'
                      }`}
                    >
                      {pct}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Live Policy Preview Strip */}
          <div className="bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl p-2.5 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2FA66A] shrink-0" />
            <span className="text-[11px] text-[#777570]">
              <strong className="text-[#171717]">Customer Cancellation Rule: </strong>
              Free cancellation permitted up to {cancellationNoticeHours} before kickoff with {refundPercentage} refund.
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            id="btn-submit-add-court"
            className="w-full h-11 bg-[#FF6B2C] hover:bg-[#e85b1e] text-white font-black text-[13.5px] rounded-xl flex items-center justify-center gap-1.5 shadow-sm active-press cursor-pointer transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Submit Court for Approval</span>
          </button>
        </div>
      </form>
    </div>
  );
};
