import React, { useState, useMemo, useEffect } from 'react';
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
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { haptics } from '../utils/haptics';
import { CustomSelect } from '../components/CustomSelect';

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

interface AddCourtScreenProps {
  onClose?: () => void;
}

export const AddCourtScreen: React.FC<AddCourtScreenProps> = ({ onClose }) => {
  const { goBack, addNewCourt, showToast, courts } = useApp();
  const handleClose = () => { if (onClose) onClose(); else goBack(); };


  // 2. Court info
  const [selectedSports, setSelectedSports] = useState<string[]>(['Football']);
  const [courtName, setCourtName] = useState('');
  const [displayName, setDisplayName] = useState('');

  // 3. Base duration & rate (for standalone court)
  const [minBookingTime, setMinBookingTime] = useState('1 Hour');
  const [regularPrice, setRegularPrice] = useState('1000');

  // 4. Peak hours & weekend rates (for standalone court)
  const [peakHoursStart, setPeakHoursStart] = useState('06:00 PM');
  const [peakHoursEnd, setPeakHoursEnd] = useState('11:00 PM');
  const [peakHoursPrice, setPeakHoursPrice] = useState('1400');
  const [peakDays, setPeakDays] = useState<string[]>(['Fri', 'Sat', 'Sun']);
  const [weekendPrice, setWeekendPrice] = useState('1500');

  // 5. Court-Specific Cancellation & Refund Policy
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
    const closeAfter = onClose || goBack;

    if (!courtName.trim()) {
      showToast('Court Name Required', 'Please enter a name for this court.', 'warning');
      return;
    }
    if (selectedSports.length === 0) {
      showToast('Sport Required', 'Please select a sport.', 'warning');
      return;
    }

    const windowHoursNum = parseInt(cancellationNoticeHours.split(' ')[0], 10) || 12;
    const refundPercentNum = parseInt(refundPercentage.replace('%', ''), 10) || 100;
    const policyLabel = `Free cancel up to ${cancellationNoticeHours} before kickoff (${refundPercentage} refund)`;

    const parsedPrice = parseInt(regularPrice, 10) || 1000;
    const parsedPeakPrice = parseInt(peakHoursPrice, 10) || parsedPrice;
    const parsedWeekendPrice = parseInt(weekendPrice, 10) || parsedPrice;

    addNewCourt({
      name: courtName.trim(),
      displayName: displayName.trim() || undefined,
      samePhysicalSports: false,
      sports: [selectedSports[0] || 'Football'],
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
    haptics.success();
    closeAfter();
  };

  return (
    <div className={`w-full max-w-3xl mx-auto space-y-4 select-none ${onClose ? 'pb-4' : 'pb-32 pt-1 px-4'}`}>
      {/* Top Header - only shown in standalone screen mode (not in modal) */}
      {!onClose && (
        <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="md:hidden w-9 h-9 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#021526] hover:bg-[#F3F4F4] shadow-2xs active-press cursor-pointer transition-all"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
            <div>
              <h1 className="text-[21px] font-black text-[#021526] tracking-tight">Add New Court / Turf</h1>
              <p className="text-[11.5px] font-medium text-[#5F6368]">Configure court specs, sport layouts, pricing rates &amp; peak schedules</p>
            </div>
          </div>

          <div className="w-9 h-9 rounded-xl bg-[#F94001]/10 text-[#F94001] flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>
      )}

      <form onSubmit={handleSaveCourt} className="space-y-3.5">
        {/* ========================================================================= */}
        {/* SECTION 1: COURT INFORMATION (1 COURT = 1 SPORT)                          */}
        {/* ========================================================================= */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-3">
          <div className="flex items-center gap-1.5 pb-1 border-b border-[#F3F4F4]">
            <span className="w-4 h-4 rounded-full bg-[#021526] text-white text-[10px] font-bold flex items-center justify-center">
              1
            </span>
            <h3 className="text-[13px] font-black text-[#021526]">Court Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#5F6368] mb-1">
                Select Sport <span className="text-[#F94001]">*</span>
              </label>
              <CustomSelect
                value={selectedSports[0] || 'Football'}
                onChange={(val) => setSelectedSports([val])}
                options={AVAILABLE_SPORTS}
                className="w-full bg-[#F3F4F4] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[13px] font-bold text-[#021526] focus:outline-none cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#5F6368] mb-1">
                Court Name <span className="text-[#F94001]">*</span>
              </label>
              <input
                type="text"
                required
                value={courtName}
                onChange={(e) => setCourtName(e.target.value)}
                placeholder="e.g. Turf 1A (5-a-side)"
                className="w-full bg-[#F3F4F4] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[13px] font-bold text-[#021526] focus:outline-none focus:border-[#021526]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#5F6368] mb-1">
              Display Name <span className="text-[10px] text-[#5F6368] font-normal">(Customer-Facing, optional)</span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Main Arena Pitch 1 (Floodlit Turf)"
              className="w-full bg-[#F3F4F4] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[13px] font-bold text-[#021526] focus:outline-none focus:border-[#021526]"
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: BASE DURATION & RATE                                           */}
        {/* ========================================================================= */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-3">
          <div className="flex items-center gap-1.5 pb-1 border-b border-[#F3F4F4]">
            <span className="w-4 h-4 rounded-full bg-[#021526] text-white text-[10px] font-bold flex items-center justify-center">
              2
            </span>
            <h3 className="text-[13px] font-black text-[#021526]">Base Duration & Rate</h3>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#5F6368] mb-1.5">
              Minimum Booking Duration
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {DURATION_OPTIONS.map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => {
                    haptics.tap();
                    setMinBookingTime(dur);
                  }}
                  className={`py-2 px-2 rounded-xl text-[11px] sm:text-[11.5px] font-bold transition-all border cursor-pointer text-center active-press ${
                    minBookingTime === dur
                      ? 'bg-[#F94001] text-white border-[#F94001] shadow-sm shadow-[#F94001]/20'
                      : 'bg-[#F3F4F4] text-[#5F6368] border-[#E5E7EB] hover:text-[#021526]'
                  }`}
                >
                  {dur}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#5F6368] mb-1">
              Regular Hourly Price (₹/hour) <span className="text-[#F94001]">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-[#5F6368] font-bold text-[13px]">₹</span>
              <input
                type="number"
                required
                value={regularPrice}
                onChange={(e) => setRegularPrice(e.target.value)}
                placeholder="1000"
                className="w-full bg-[#F3F4F4] border border-[#E5E7EB] rounded-xl pl-7 pr-3 py-2 text-[13px] font-bold text-[#021526] focus:outline-none focus:border-[#021526]"
              />
              <span className="absolute right-3 text-[11px] font-bold text-[#5F6368]">/ hour</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 3: PEAK HOURS & WEEKEND                                           */}
        {/* ========================================================================= */}
        <div className="bg-white p-4 rounded-2xl border border-[#F94001]/30 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-[#F3F4F4]">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#F94001] text-white text-[10px] font-bold flex items-center justify-center">
                3
              </span>
              <h3 className="text-[13px] font-black text-[#021526]">Peak Surcharge & Weekend Rates</h3>
            </div>
            <span className="text-[9.5px] font-bold text-[#F94001] bg-[#F94001]/10 px-2 py-0.5 rounded-full">
              High Demand
            </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <span className="text-[10px] font-bold text-[#5F6368] block mb-1">PEAK START</span>
                  <CustomSelect
                    value={peakHoursStart}
                    onChange={(val) => setPeakHoursStart(val)}
                    options={TIME_SLOTS}
                    className="w-full bg-[#F3F4F4] border border-[#E5E7EB] rounded-xl px-2.5 py-1.5 text-[12px] font-bold text-[#021526] focus:outline-none cursor-pointer"
                  />
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#5F6368] block mb-1">PEAK END</span>
                  <CustomSelect
                    value={peakHoursEnd}
                    onChange={(val) => setPeakHoursEnd(val)}
                    options={TIME_SLOTS}
                    className="w-full bg-[#F3F4F4] border border-[#E5E7EB] rounded-xl px-2.5 py-1.5 text-[12px] font-bold text-[#021526] focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10.5px] font-bold text-[#5F6368] mb-1">Peak Rate (₹/hr)</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-2.5 text-[#F94001] font-bold text-[12px]">₹</span>
                    <input
                      type="number"
                      value={peakHoursPrice}
                      onChange={(e) => setPeakHoursPrice(e.target.value)}
                      placeholder="1400"
                      className="w-full bg-[#F3F4F4] border border-[#E5E7EB] rounded-xl pl-6 pr-2.5 py-1.5 text-[12.5px] font-bold text-[#021526] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-[#5F6368] mb-1">Weekend Rate (₹/hr)</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-2.5 text-[#021526] font-bold text-[12px]">₹</span>
                    <input
                      type="number"
                      value={weekendPrice}
                      onChange={(e) => setWeekendPrice(e.target.value)}
                      placeholder="1500"
                      className="w-full bg-[#F3F4F4] border border-[#E5E7EB] rounded-xl pl-6 pr-2.5 py-1.5 text-[12.5px] font-bold text-[#021526] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10.5px] font-bold text-[#5F6368]">Active Peak Days</span>
                  <button
                    type="button"
                    onClick={() => {
                      haptics.tap();
                      setPeakDays(['Fri', 'Sat', 'Sun']);
                    }}
                    className="text-[9.5px] font-bold text-[#16A34A] bg-[#16A34A]/10 px-1.5 py-0.5 rounded cursor-pointer"
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
                            ? 'bg-[#F94001] text-white border-[#F94001]'
                            : 'bg-[#F3F4F4] text-[#5F6368] border-[#E5E7EB]'
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* SECTION 5: COURT-SPECIFIC CANCELLATION & REFUND POLICY                    */}
            {/* (Exact match with user attached screenshot cards)                        */}
            {/* ========================================================================= */}
            <div className="space-y-3">
          {/* Card 1: Free Cancellation Window */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-2xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F94001]/10 text-[#F94001] flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[15px] font-black text-[#021526] leading-tight">
                  Free Cancellation Window
                </h3>
                <p className="text-[11.5px] text-[#5F6368] font-medium mt-0.5">
                  Minimum notice required for full or partial refund
                </p>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#021526] mb-2">
                Notice Buffer Before Match Kickoff:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                      className={`py-2 px-2.5 rounded-xl font-black text-[12px] sm:text-[13px] transition-all border cursor-pointer text-center active-press ${
                        isSelected
                          ? 'bg-[#F94001] text-white border-[#F94001] shadow-sm shadow-[#F94001]/20'
                          : 'bg-[#F3F4F4] text-[#021526] border-[#E5E7EB] hover:bg-[#F3F4F4]'
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
          <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-2xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center shrink-0">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[15px] font-black text-[#021526] leading-tight">
                  Refund Payout Percentage
                </h3>
                <p className="text-[11.5px] text-[#5F6368] font-medium mt-0.5">
                  Amount returned to customer source account
                </p>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#021526] mb-2">
                Eligible Refund Value:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                      className={`py-2 px-2.5 rounded-xl font-black text-[12px] sm:text-[13px] transition-all border cursor-pointer text-center active-press ${
                        isSelected
                          ? 'bg-[#16A34A] text-white border-[#16A34A] shadow-xs'
                          : 'bg-[#F3F4F4] text-[#021526] border-[#E5E7EB] hover:bg-[#F3F4F4]'
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
          <div className="bg-[#F3F4F4] border border-[#E5E7EB] rounded-xl p-2.5 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
            <span className="text-[11px] text-[#5F6368]">
              <strong className="text-[#021526]">Customer Cancellation Rule: </strong>
              Free cancellation permitted up to {cancellationNoticeHours} before kickoff with {refundPercentage} refund.
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            id="btn-submit-add-court"
            className="w-full h-11 bg-[#F94001] hover:bg-[#D93600] text-white font-black text-[13.5px] rounded-xl flex items-center justify-center gap-1.5 shadow-sm active-press cursor-pointer transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Submit Court for Approval</span>
          </button>
        </div>
      </form>
    </div>
  );
};
