import React, { useState, useEffect } from 'react';
import { Court } from '../types';
import { useApp } from '../context/AppContext';
import {
  X,
  Check,
  Flame,
  Sun,
  Clock,
  Percent,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { haptics } from '../utils/haptics';
import { CustomSelect } from './CustomSelect';

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

const DURATION_OPTIONS = ['30 Mins', '1 Hour', '1.5 Hours', '2 Hours', '3 Hours'];

const TIME_SLOTS = [
  '05:00 AM', '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM',
  '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM', '12:00 AM',
];

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface EditCourtModalProps {
  court: Court | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditCourtModal: React.FC<EditCourtModalProps> = ({ court, isOpen, onClose }) => {
  const { updateCourt, resubmitCourt, showToast } = useApp();

  const [courtName, setCourtName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedSports, setSelectedSports] = useState<string[]>(['Football']);
  const [minBookingDuration, setMinBookingDuration] = useState('1 Hour');
  const [pricePerHour, setPricePerHour] = useState('1000');
  const [peakHoursStart, setPeakHoursStart] = useState('06:00 PM');
  const [peakHoursEnd, setPeakHoursEnd] = useState('11:00 PM');
  const [peakHoursPrice, setPeakHoursPrice] = useState('1400');
  const [weekendPrice, setWeekendPrice] = useState('1500');
  const [peakDays, setPeakDays] = useState<string[]>(['Fri', 'Sat', 'Sun']);
  const [operatingHours, setOperatingHours] = useState('06:00 AM – 11:00 PM');
  const [statusDetails, setStatusDetails] = useState('');
  const [cancellationNoticeHours, setCancellationNoticeHours] = useState<'2 Hours' | '4 Hours' | '12 Hours' | '24 Hours'>('12 Hours');
  const [refundPercentage, setRefundPercentage] = useState<'50%' | '75%' | '90%' | '100%'>('100%');

  useEffect(() => {
    if (court) {
      setCourtName(court.name || '');
      setDisplayName(court.displayName || '');
      setSelectedSports(court.sports && court.sports.length > 0 ? court.sports : ['Football']);
      setMinBookingDuration(court.minBookingDuration || '1 Hour');
      setPricePerHour(String(court.pricePerHour || 1000));
      setPeakHoursStart(court.peakHoursStart || '06:00 PM');
      setPeakHoursEnd(court.peakHoursEnd || '11:00 PM');
      setPeakHoursPrice(String(court.peakHoursPrice || (court.pricePerHour || 1000) + 400));
      setWeekendPrice(String(court.weekendPrice || (court.pricePerHour || 1000) + 500));
      setPeakDays(court.peakDays && court.peakDays.length > 0 ? court.peakDays : ['Fri', 'Sat', 'Sun']);
      setOperatingHours(court.operatingHours || '06:00 AM – 11:00 PM');
      setStatusDetails(court.statusDetails || '');
      
      const win = court.cancellationWindowHours;
      if (win === 2) setCancellationNoticeHours('2 Hours');
      else if (win === 4) setCancellationNoticeHours('4 Hours');
      else if (win === 24) setCancellationNoticeHours('24 Hours');
      else setCancellationNoticeHours('12 Hours');

      const ref = court.refundPercentage;
      if (ref === 50) setRefundPercentage('50%');
      else if (ref === 75) setRefundPercentage('75%');
      else if (ref === 90) setRefundPercentage('90%');
      else setRefundPercentage('100%');
    }
  }, [court]);

  if (!isOpen || !court) return null;

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courtName.trim()) {
      showToast('Name Required', 'Please enter court name.', 'warning');
      return;
    }

    const windowHoursNum = parseInt(cancellationNoticeHours.split(' ')[0], 10) || 12;
    const refundPercentNum = parseInt(refundPercentage.replace('%', ''), 10) || 100;
    const policyLabel = `Free cancel up to ${cancellationNoticeHours} before kickoff (${refundPercentage} refund)`;

    haptics.success();

    if (court.status === 'Rejected') {
      resubmitCourt(court.id, {
        name: courtName.trim(),
        displayName: displayName.trim() || undefined,
        sports: selectedSports,
        minBookingDuration,
        pricePerHour: parseInt(pricePerHour, 10) || 1000,
        peakHoursStart,
        peakHoursEnd,
        peakHoursPrice: parseInt(peakHoursPrice, 10) || 1400,
        weekendPrice: parseInt(weekendPrice, 10) || 1500,
        peakDays,
        operatingHours,
        statusDetails: statusDetails.trim() || undefined,
        cancellationWindowHours: windowHoursNum,
        refundPercentage: refundPercentNum,
        cancellationPolicyLabel: policyLabel,
      });
      onClose();
      return;
    }

    updateCourt(court.id, {
      name: courtName.trim(),
      displayName: displayName.trim() || undefined,
      sports: selectedSports,
      minBookingDuration,
      pricePerHour: parseInt(pricePerHour, 10) || 1000,
      peakHoursStart,
      peakHoursEnd,
      peakHoursPrice: parseInt(peakHoursPrice, 10) || 1400,
      weekendPrice: parseInt(weekendPrice, 10) || 1500,
      peakDays,
      operatingHours,
      statusDetails: statusDetails.trim() || undefined,
      cancellationWindowHours: windowHoursNum,
      refundPercentage: refundPercentNum,
      cancellationPolicyLabel: policyLabel,
    });

    onClose();
  };

  const isRejected = court.status === 'Rejected';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-xs select-none">
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-h-[92vh] md:max-w-2xl md:rounded-3xl overflow-y-auto no-scrollbar bg-white rounded-t-3xl p-5 pb-6 shadow-2xl border border-[#E5E7EB]"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F4]">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[18px] font-black text-[#021526] tracking-tight">
                  {isRejected ? `Edit & Resubmit Court: ${court.name}` : `Edit Court: ${court.name}`}
                </h2>
                {isRejected && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-200">
                    Resubmission
                  </span>
                )}
              </div>
              <p className="text-[11.5px] text-[#5F6368] font-medium mt-0.5">
                {isRejected
                  ? 'Update rejected court details and resubmit for admin approval'
                  : 'Update rates, duration, peak schedules & cancellation policy'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F3F4F4] flex items-center justify-center text-[#5F6368] hover:text-[#021526] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Rejection reason banner */}
          {isRejected && court.rejectionReason && (
            <div className="mt-3 p-3 rounded-xl bg-[#DC2626]/8 border border-[#DC2626]/30 text-[11.5px] flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-[#DC2626] block">Admin Feedback for Rejection:</strong>
                <p className="text-[#991B1B] mt-0.5 leading-relaxed">{court.rejectionReason}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="py-3 space-y-3.5">
            {/* 1. Court Name & Display Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#5F6368] mb-1">
                  Court Name <span className="text-[#F94001]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={courtName}
                  onChange={(e) => setCourtName(e.target.value)}
                  className="w-full bg-[#F3F4F4] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[13px] font-bold text-[#021526] focus:outline-none focus:border-[#021526]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#5F6368] mb-1">
                  Display Name <span className="text-[10px] text-[#5F6368] font-normal">(Customer-Facing)</span>
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Main Arena Pitch 1"
                  className="w-full bg-[#F3F4F4] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[13px] font-bold text-[#021526] focus:outline-none focus:border-[#021526]"
                />
              </div>
            </div>

            {/* 2. Sport & Surface Spec */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#5F6368] mb-1">Sport</label>
                <CustomSelect
                  value={selectedSports[0] || 'Football'}
                  onChange={(val) => setSelectedSports([val])}
                  options={AVAILABLE_SPORTS}
                  className="w-full bg-[#F3F4F4] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[13px] font-bold text-[#021526] focus:outline-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#5F6368] mb-1">Surface Specification</label>
                <input
                  type="text"
                  value={statusDetails}
                  onChange={(e) => setStatusDetails(e.target.value)}
                  placeholder="e.g. FIFA Grade 5G Synthetic Turf"
                  className="w-full bg-[#F3F4F4] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[13px] font-bold text-[#021526] focus:outline-none"
                />
              </div>
            </div>

            {/* 3. Duration & Hourly Rates */}
            <div className="bg-[#F3F4F4] p-3 rounded-2xl border border-[#E5E7EB] space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[#5F6368] mb-1">
                  Minimum Booking Duration
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {DURATION_OPTIONS.map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => {
                        haptics.tap();
                        setMinBookingDuration(dur);
                      }}
                      className={`py-1 px-1.5 rounded-lg text-[11px] font-bold transition-all border cursor-pointer text-center ${
                        minBookingDuration.toLowerCase() === dur.toLowerCase()
                          ? 'bg-[#FFF1EC] text-[#F94001] border border-[#F94001]/40 font-black shadow-2xs'
                          : 'bg-white text-[#5F6368] border-[#E5E7EB]'
                      }`}
                    >
                      {dur}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <div>
                  <label className="block text-[10.5px] font-bold text-[#5F6368] mb-1">Standard Rate (₹/hr)</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-2.5 text-[#5F6368] font-bold text-[12px]">₹</span>
                    <input
                      type="number"
                      value={pricePerHour}
                      onChange={(e) => setPricePerHour(e.target.value)}
                      className="w-full bg-white border border-[#E5E7EB] rounded-xl pl-6 pr-2 py-1.5 text-[12.5px] font-bold text-[#021526] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-[#F94001] mb-1">Peak Rate (₹/hr)</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-2.5 text-[#F94001] font-bold text-[12px]">₹</span>
                    <input
                      type="number"
                      value={peakHoursPrice}
                      onChange={(e) => setPeakHoursPrice(e.target.value)}
                      className="w-full bg-white border border-[#E5E7EB] rounded-xl pl-6 pr-2 py-1.5 text-[12.5px] font-bold text-[#021526] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-[#021526] mb-1">Weekend Rate (₹/hr)</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-2.5 text-[#021526] font-bold text-[12px]">₹</span>
                    <input
                      type="number"
                      value={weekendPrice}
                      onChange={(e) => setWeekendPrice(e.target.value)}
                      className="w-full bg-white border border-[#E5E7EB] rounded-xl pl-6 pr-2 py-1.5 text-[12.5px] font-bold text-[#021526] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Peak Hours Schedule */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <span className="text-[10px] font-bold text-[#5F6368] block mb-1">PEAK START TIME</span>
                <CustomSelect
                  value={peakHoursStart}
                  onChange={(val) => setPeakHoursStart(val)}
                  options={TIME_SLOTS}
                  className="w-full bg-[#F3F4F4] border border-[#E5E7EB] rounded-xl px-2.5 py-1.5 text-[12px] font-bold text-[#021526] focus:outline-none cursor-pointer"
                />
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#5F6368] block mb-1">PEAK END TIME</span>
                <CustomSelect
                  value={peakHoursEnd}
                  onChange={(val) => setPeakHoursEnd(val)}
                  options={TIME_SLOTS}
                  className="w-full bg-[#F3F4F4] border border-[#E5E7EB] rounded-xl px-2.5 py-1.5 text-[12px] font-bold text-[#021526] focus:outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* 5. Cancellation & Refund Policy */}
            <div className="bg-[#F3F4F4] p-3 rounded-2xl border border-[#E5E7EB] space-y-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-[#E5E7EB]/70">
                <span className="text-[11.5px] font-black text-[#021526] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Cancellation & Refund Policy</span>
                </span>
                <span className="text-[9.5px] font-bold text-[#16A34A] bg-[#16A34A]/10 px-1.5 py-0.5 rounded">
                  Court-Specific
                </span>
              </div>

              {/* Free Cancellation Window */}
              <div>
                <span className="text-[10.5px] font-bold text-[#5F6368] block mb-1">
                  Notice Buffer Before Match Kickoff:
                </span>
                <div className="grid grid-cols-4 gap-1.5">
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
                        className={`py-1.5 px-2 rounded-xl font-bold text-[12px] transition-all border cursor-pointer text-center ${
                          isSelected
                            ? 'bg-[#FFF1EC] text-[#F94001] border border-[#F94001]/40 font-black shadow-2xs'
                            : 'bg-white text-[#5F6368] border-[#E5E7EB]'
                        }`}
                      >
                        {win}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Refund Payout Percentage */}
              <div>
                <span className="text-[10.5px] font-bold text-[#5F6368] block mb-1">
                  Eligible Refund Value:
                </span>
                <div className="grid grid-cols-4 gap-1.5">
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
                        className={`py-1.5 px-2 rounded-xl font-bold text-[12px] transition-all border cursor-pointer text-center ${
                          isSelected
                            ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/40 font-black shadow-2xs'
                            : 'bg-white text-[#5F6368] border-[#E5E7EB]'
                        }`}
                      >
                        {pct}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full h-11 bg-[#F94001] hover:bg-[#D93600] text-white font-black text-[13.5px] rounded-xl flex items-center justify-center gap-1.5 shadow-sm active-press cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isRejected ? 'Resubmit Court for Admin Approval' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
