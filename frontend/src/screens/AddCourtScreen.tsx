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

  // 1. Same physical ground question
  const [isSamePhysicalSports, setIsSamePhysicalSports] = useState<'yes' | 'no'>('no');

  // Live courts available for same physical space mapping
  const liveCourts = useMemo(() => {
    return courts.filter((c) => c.status === 'Approved' || !c.status || c.status === 'Pending Approval');
  }, [courts]);

  const [selectedParentCourtId, setSelectedParentCourtId] = useState<string>('');

  useEffect(() => {
    if (!selectedParentCourtId && liveCourts.length > 0) {
      setSelectedParentCourtId(liveCourts[0].id);
    }
  }, [liveCourts, selectedParentCourtId]);

  const selectedParentCourt = useMemo(() => {
    return liveCourts.find((c) => c.id === selectedParentCourtId) || liveCourts[0];
  }, [liveCourts, selectedParentCourtId]);

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

    if (isSamePhysicalSports === 'yes') {
      if (!selectedParentCourt) {
        showToast('Live Court Required', 'Please select an existing live court.', 'warning');
        return;
      }
      const sportToAdd = selectedSports[0] || 'Cricket';
      const finalCourtName = selectedParentCourt.name;
      const finalDisplayName = displayName.trim() || `${selectedParentCourt.name} (${sportToAdd})`;

      addNewCourt({
        name: finalCourtName,
        displayName: finalDisplayName,
        samePhysicalSports: true,
        parentCourtId: selectedParentCourt.id,
        parentCourtName: selectedParentCourt.name,
        sports: [sportToAdd],
        pricePerHour: selectedParentCourt.pricePerHour || 1000,
        minBookingDuration: selectedParentCourt.minBookingDuration || '1 Hour',
        peakHoursStart: selectedParentCourt.peakHoursStart || '06:00 PM',
        peakHoursEnd: selectedParentCourt.peakHoursEnd || '11:00 PM',
        peakDays: selectedParentCourt.peakDays || ['Fri', 'Sat', 'Sun'],
        peakHoursPrice: selectedParentCourt.peakHoursPrice || Math.round((selectedParentCourt.pricePerHour || 1000) * 1.4),
        weekendPrice: selectedParentCourt.weekendPrice || Math.round((selectedParentCourt.pricePerHour || 1000) * 1.5),
        operatingHours: selectedParentCourt.operatingHours || '06:00 AM – 11:00 PM',
        type: selectedParentCourt.type || 'Outdoor',
        status: 'Approved',
        statusDetails: `Active · Shares physical ground with ${selectedParentCourt.name}`,
        cancellationWindowHours: selectedParentCourt.cancellationWindowHours ?? 12,
        refundPercentage: selectedParentCourt.refundPercentage ?? 100,
        cancellationPolicyLabel: selectedParentCourt.cancellationPolicyLabel || 'Free cancel up to 12h before match (100% refund)',
      });

      showToast('Sport Added to Court', `${sportToAdd} added to ${selectedParentCourt.name} (${finalDisplayName})!`, 'success');
      haptics.success();
      closeAfter();
      return;
    }

    // Standalone Court (isSamePhysicalSports === 'no')
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
        {/* SECTION 1: QUESTION: Same physical sports for this turf?                 */}
        {/* ========================================================================= */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-[13px] font-black text-[#021526] flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#021526] text-white text-[10px] font-bold flex items-center justify-center">
                1
              </span>
              <span>Same physical sports for this turf?</span>
            </label>
            <span className="text-[9.5px] text-[#F94001] bg-[#F94001]/10 font-bold px-2 py-0.5 rounded-full">
              Required
            </span>
          </div>

          <p className="text-[11px] text-[#5F6368]">
            Select <strong className="text-[#021526]">Yes</strong> if this sport will share the ground with an already live physical court (e.g. Football pitch also used for Box Cricket).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
            <button
              type="button"
              id="btn-same-physical-yes"
              onClick={() => {
                haptics.tap();
                setIsSamePhysicalSports('yes');
                if (selectedSports[0] === 'Football') {
                  setSelectedSports(['Cricket']);
                }
                if (selectedParentCourt) {
                  setDisplayName(`${selectedParentCourt.name} (${selectedSports[0] === 'Football' ? 'Cricket' : selectedSports[0]})`);
                }
              }}
              className={`py-2.5 px-3 rounded-xl font-bold text-[12.5px] sm:text-[13px] flex items-center justify-center gap-1.5 transition-all border cursor-pointer active-press ${
                isSamePhysicalSports === 'yes'
                  ? 'bg-[#FFF1EC] text-[#021526] border-2 border-[#F94001] shadow-2xs font-black'
                  : 'bg-[#F3F4F4] text-[#5F6368] border-[#E5E7EB] hover:text-[#021526]'
              }`}
            >
              {isSamePhysicalSports === 'yes' && <Check className="w-3.5 h-3.5 text-[#F94001] stroke-[3]" />}
              <span>Yes (Share Physical Ground)</span>
            </button>

            <button
              type="button"
              id="btn-same-physical-no"
              onClick={() => {
                haptics.tap();
                setIsSamePhysicalSports('no');
              }}
              className={`py-2.5 px-3 rounded-xl font-bold text-[12.5px] sm:text-[13px] flex items-center justify-center gap-1.5 transition-all border cursor-pointer active-press ${
                isSamePhysicalSports === 'no'
                  ? 'bg-[#FFF1EC] text-[#021526] border-2 border-[#F94001] shadow-2xs font-black'
                  : 'bg-[#F3F4F4] text-[#5F6368] border-[#E5E7EB] hover:text-[#021526]'
              }`}
            >
              {isSamePhysicalSports === 'no' && <Check className="w-3.5 h-3.5 text-[#F94001] stroke-[3]" />}
              <span>No (Separate Ground)</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CONDITIONAL FLOW A: WHEN 'YES' (SHARE PHYSICAL GROUND)                    */}
        {/* ========================================================================= */}
        {isSamePhysicalSports === 'yes' ? (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            {/* STEP 2: SELECT EXISTING LIVE COURT */}
            <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-[#F3F4F4]">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#021526] text-white text-[10px] font-bold flex items-center justify-center">
                    2
                  </span>
                  <h3 className="text-[13px] font-black text-[#021526]">Select Existing Live Court</h3>
                </div>
                <span className="text-[10px] text-[#16A34A] font-extrabold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {liveCourts.length} Live Courts Available
                </span>
              </div>

              <p className="text-[11px] text-[#5F6368]">
                Select the active physical ground that this new sport will map to:
              </p>

              {/* Grid of Live Courts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {liveCourts.map((court) => {
                  const isSelected = selectedParentCourt?.id === court.id;
                  return (
                    <button
                      key={court.id}
                      type="button"
                      onClick={() => {
                        haptics.tap();
                        setSelectedParentCourtId(court.id);
                        setDisplayName(`${court.name} (${selectedSports[0] || 'Cricket'})`);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 select-none ${
                        isSelected
                          ? 'bg-[#FFF1EC] text-[#021526] border-2 border-[#F94001] shadow-2xs'
                          : 'bg-[#F3F4F4] text-[#021526] border-[#E5E7EB] hover:bg-white hover:border-[#E5E7EB]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[13.5px] font-black">{court.name}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[8.5px] font-extrabold uppercase ${
                              isSelected ? 'bg-[#F94001]/15 text-[#F94001]' : 'bg-[#16A34A]/15 text-[#16A34A]'
                            }`}>
                              {court.status || 'Live'}
                            </span>
                          </div>
                          <p className={`text-[10.5px] font-medium mt-0.5 line-clamp-1 ${
                            isSelected ? 'text-[#021526]/70' : 'text-[#5F6368]'
                          }`}>
                            {court.displayName || court.name}
                          </p>
                        </div>

                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-[#F94001] border-[#F94001] text-white' : 'border-[#D4D2CD] bg-white'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>

                      {/* Specs pill strip */}
                      <div className="flex items-center justify-between pt-1.5 border-t border-black/5 text-[10.5px]">
                        <span className="font-bold text-[#5F6368]">
                          Sports: {court.sports?.join(', ') || 'Football'}
                        </span>
                        <span className="font-black text-[#F94001]">
                          ₹{court.pricePerHour}/hr
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 3: ADD ANOTHER SPORT & DISPLAY NAME */}
            {selectedParentCourt && (
              <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-3">
                <div className="flex items-center gap-1.5 pb-1 border-b border-[#F3F4F4]">
                  <span className="w-4 h-4 rounded-full bg-[#021526] text-white text-[10px] font-bold flex items-center justify-center">
                    3
                  </span>
                  <h3 className="text-[13px] font-black text-[#021526]">
                    Add Another Sport on {selectedParentCourt.name}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#5F6368] mb-1">
                      Select Additional Sport <span className="text-[#F94001]">*</span>
                    </label>
                    <CustomSelect
                      value={selectedSports[0] || 'Cricket'}
                      onChange={(newSport) => {
                        setSelectedSports([newSport]);
                        setDisplayName(`${selectedParentCourt.name} (${newSport})`);
                      }}
                      options={AVAILABLE_SPORTS.map((sp) => ({
                        value: sp,
                        label: `${sp} ${selectedParentCourt.sports.includes(sp) ? '(Already active)' : ''}`,
                      }))}
                      className="w-full bg-[#F3F4F4] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[13px] font-bold text-[#021526] focus:outline-none cursor-pointer"
                    />
                    <span className="text-[10px] text-[#5F6368] mt-1 block">
                      Currently on this physical turf: <strong className="text-[#021526]">{selectedParentCourt.sports.join(', ')}</strong>
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#5F6368] mb-1">
                      Display Name <span className="text-[10px] text-[#F94001] font-bold">* (Customer-Facing)</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={displayName || `${selectedParentCourt.name} (${selectedSports[0] || 'Cricket'})`}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder={`e.g. ${selectedParentCourt.name} (Box Cricket)`}
                      className="w-full bg-[#F3F4F4] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[13px] font-bold text-[#021526] focus:outline-none focus:border-[#021526]"
                    />
                    <span className="text-[10px] text-[#5F6368] mt-1 block">
                      Appears on customer booking screen when choosing {selectedSports[0] || 'this sport'}.
                    </span>
                  </div>
                </div>

                {/* Shared physical ground explanation banner */}
                <div className="bg-[#FFF8E6] border border-[#FFE082] rounded-xl p-3 text-[11.5px] text-[#8C6B00] flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-[#E65100] shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-[#B45309]">Physical Ground Conflict Synchronization</p>
                    <p className="text-[#8C6B00] leading-relaxed">
                      When a match is booked for <strong>{selectedSports[0] || 'this sport'}</strong>, the system will automatically lock physical ground <strong>{selectedParentCourt.name}</strong>. Conflicting bookings on other sports sharing this space will be automatically blocked.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: INHERITED PHYSICAL GROUND SPECS & POLICIES */}
            {selectedParentCourt && (
              <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-[#F3F4F4]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#021526] text-white text-[10px] font-bold flex items-center justify-center">
                      4
                    </span>
                    <h3 className="text-[13px] font-black text-[#021526]">
                      Inherited Physical Ground Specs & Policies
                    </h3>
                  </div>
                  <span className="text-[10px] text-[#5F6368] font-bold">
                    Continuing same turf specifications
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11.5px]">
                  <div className="bg-[#F3F4F4] p-2.5 rounded-xl border border-[#E5E7EB]">
                    <span className="text-[10px] font-bold text-[#5F6368] block">Regular Rate</span>
                    <span className="text-[13px] font-black text-[#021526]">₹{selectedParentCourt.pricePerHour}/hr</span>
                  </div>
                  <div className="bg-[#F3F4F4] p-2.5 rounded-xl border border-[#E5E7EB]">
                    <span className="text-[10px] font-bold text-[#5F6368] block">Min Duration</span>
                    <span className="text-[13px] font-black text-[#021526]">{selectedParentCourt.minBookingDuration || '1 Hour'}</span>
                  </div>
                  <div className="bg-[#F3F4F4] p-2.5 rounded-xl border border-[#E5E7EB]">
                    <span className="text-[10px] font-bold text-[#5F6368] block">Operating Hours</span>
                    <span className="text-[13px] font-black text-[#021526]">{selectedParentCourt.operatingHours}</span>
                  </div>
                  <div className="bg-[#F3F4F4] p-2.5 rounded-xl border border-[#E5E7EB]">
                    <span className="text-[10px] font-bold text-[#5F6368] block">Environment</span>
                    <span className="text-[13px] font-black text-[#021526]">{selectedParentCourt.type || 'Outdoor'}</span>
                  </div>
                </div>

                {/* Inherited Cancellation Policy Preview */}
                <div className="bg-[#F3F4F4] border border-[#E5E7EB] rounded-xl p-2.5 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
                  <span className="text-[11px] text-[#5F6368]">
                    <strong className="text-[#021526]">Inherited Cancellation Rule: </strong>
                    {selectedParentCourt.cancellationPolicyLabel || 'Free cancellation up to 12h before match with 100% refund.'}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /* CONDITIONAL FLOW B: WHEN 'NO' (SEPARATE STANDALONE GROUND)                */
          /* ========================================================================= */
          <div className="space-y-3.5 animate-in fade-in duration-200">
            {/* SECTION 2: COURT INFORMATION */}
            <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-3">
              <div className="flex items-center gap-1.5 pb-1 border-b border-[#F3F4F4]">
                <span className="w-4 h-4 rounded-full bg-[#021526] text-white text-[10px] font-bold flex items-center justify-center">
                  2
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

            {/* SECTION 3: BASE DURATION & RATE */}
            <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-3">
              <div className="flex items-center gap-1.5 pb-1 border-b border-[#F3F4F4]">
                <span className="w-4 h-4 rounded-full bg-[#021526] text-white text-[10px] font-bold flex items-center justify-center">
                  3
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

            {/* SECTION 4: PEAK HOURS & WEEKEND */}
            <div className="bg-white p-4 rounded-2xl border border-[#F94001]/30 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-[#F3F4F4]">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#F94001] text-white text-[10px] font-bold flex items-center justify-center">
                    4
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
      </div>
    )}

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            id="btn-submit-add-court"
            className="w-full h-11 bg-[#F94001] hover:bg-[#D93600] text-white font-black text-[13.5px] rounded-xl flex items-center justify-center gap-1.5 shadow-sm active-press cursor-pointer transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {isSamePhysicalSports === 'yes' && selectedParentCourt
                ? `Add ${selectedSports[0] || 'Sport'} to ${selectedParentCourt.name}`
                : 'Submit Court for Approval'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
