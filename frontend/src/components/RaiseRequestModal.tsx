import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Building,
  CreditCard,
  Layers,
  LifeBuoy,
  Check,
  Upload,
  Send,
  ShieldCheck,
  Clock,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  Percent,
  Flame,
  Calendar,
} from 'lucide-react';
import { haptics } from '../utils/haptics';
import { motion, AnimatePresence } from 'motion/react';

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

export type RequestTypeOption = 'venue_change' | 'bank_change' | 'court_approval' | 'general_support';

interface RaiseRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: RequestTypeOption | null;
}

export const RaiseRequestModal: React.FC<RaiseRequestModalProps> = ({
  isOpen,
  onClose,
  initialType = null,
}) => {
  const {
    addSupportTicket,
    addNewCourt,
    courts,
    venueName,
    venueAddress,
    ownerPhone,
    showToast,
  } = useApp();

  // Navigation state within modal: category selection vs active form
  const [step, setStep] = useState<'category' | 'form'>('category');
  const [requestType, setRequestType] = useState<RequestTypeOption>('venue_change');

  // Sync initialType when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialType) {
        setRequestType(initialType);
        setStep('form');
      } else {
        setStep('category');
      }
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialType]);

  // ============================================
  // FORM STATES
  // ============================================

  // 1. Venue Details Form State
  const [reqVenueName, setReqVenueName] = useState(venueName ? `${venueName} (Updated)` : 'TurfTown Arena (North Wing)');
  const [reqVenueAddress, setReqVenueAddress] = useState(venueAddress || 'Plot 42-B, Sector 5, Outer Ring Road, HSR Layout');
  const [reqVenuePhone, setReqVenuePhone] = useState(ownerPhone || '+91 98451 22334');
  const [reqVenueReason, setReqVenueReason] = useState('Updating official municipal road alignment and adding emergency desk line.');
  const [venueDocAttached, setVenueDocAttached] = useState(false);

  // 2. Bank Account Change Form State
  const [bankName, setBankName] = useState('ICICI Bank');
  const [holderName, setHolderName] = useState('TurfTown Arena Sports LLP');
  const [accountNumber, setAccountNumber] = useState('50200088924519');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('50200088924519');
  const [ifscCode, setIfscCode] = useState('ICIC0001824');
  const [accountType, setAccountType] = useState('Current Commercial');
  const [bankChangeReason, setBankChangeReason] = useState('Switching primary settlement pool to ICICI commercial zero-balance account.');
  const [chequeAttached, setChequeAttached] = useState(true);

  // 3. New Court Approval Form State (Full Add Court Workflow)
  const [isSamePhysicalSports, setIsSamePhysicalSports] = useState<'yes' | 'no'>('no');
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

  const [courtSelectedSport, setCourtSelectedSport] = useState('Football');
  const [courtName, setCourtName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [minBookingTime, setMinBookingTime] = useState('1 Hour');
  const [regularPrice, setRegularPrice] = useState('1000');
  const [peakHoursStart, setPeakHoursStart] = useState('06:00 PM');
  const [peakHoursEnd, setPeakHoursEnd] = useState('11:00 PM');
  const [peakHoursPrice, setPeakHoursPrice] = useState('1400');
  const [peakDays, setPeakDays] = useState<string[]>(['Fri', 'Sat', 'Sun']);
  const [weekendPrice, setWeekendPrice] = useState('1500');
  const [cancellationNoticeHours, setCancellationNoticeHours] = useState<'2 Hours' | '4 Hours' | '12 Hours' | '24 Hours'>('12 Hours');
  const [refundPercentage, setRefundPercentage] = useState<'50%' | '75%' | '90%' | '100%'>('100%');
  const [courtSurface, setCourtSurface] = useState('FIFA-Grade 50mm Synthetic AstroTurf');
  const [courtEnvironment, setCourtEnvironment] = useState<'Outdoor' | 'Covered' | 'Indoor'>('Covered');
  const [courtPhotosAttached, setCourtPhotosAttached] = useState(true);

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

  // 4. General Support Form State
  const [supportCategory, setSupportCategory] = useState<'Payment' | 'Booking' | 'Technical' | 'Other'>('Payment');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('High');
  const [supportSubject, setSupportSubject] = useState('');
  const [supportDescription, setSupportDescription] = useState('');
  const [linkedBookingId, setLinkedBookingId] = useState<string>('');
  const [supportAttachment, setSupportAttachment] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handlers
  const handleSelectCategory = (type: RequestTypeOption) => {
    haptics.tap();
    setRequestType(type);
    setStep('form');
  };

  const handleSubmitVenueChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqVenueName.trim() || !reqVenueAddress.trim()) {
      showToast('Fields Required', 'Please enter venue name and updated address.', 'warning');
      return;
    }
    haptics.success();
    addSupportTicket({
      category: 'Venue Details',
      requestType: 'venue_change',
      subject: `Update Venue Details: ${reqVenueName.trim()}`,
      description: reqVenueReason.trim() || 'Request to update official venue name and address.',
      priority: 'High',
      attachmentName: venueDocAttached ? 'trade_license_tax_proof.pdf' : undefined,
      detailsPayload: {
        currentVenueName: venueName || 'TurfTown Arena',
        requestedVenueName: reqVenueName.trim(),
        requestedAddress: reqVenueAddress.trim(),
        requestedPhone: reqVenuePhone.trim(),
      },
    });
    onClose();
  };

  const handleSubmitBankChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (accountNumber !== confirmAccountNumber) {
      showToast('Account Number Mismatch', 'Account numbers do not match. Please re-enter.', 'warning');
      return;
    }
    if (!ifscCode.trim() || !holderName.trim()) {
      showToast('Fields Required', 'Please complete account holder and IFSC code.', 'warning');
      return;
    }
    haptics.success();
    const masked = `•••• •••• •••• ${accountNumber.slice(-4)}`;
    addSupportTicket({
      category: 'Bank Account',
      requestType: 'bank_change',
      subject: `Request to update payout bank to ${bankName}`,
      description: bankChangeReason.trim() || 'Request to update verified payout bank account.',
      priority: 'Urgent',
      attachmentName: chequeAttached ? 'cancelled_cheque_passbook.pdf' : undefined,
      detailsPayload: {
        currentBankName: 'HDFC Bank (•••• 8892)',
        requestedBankName: `${bankName} (${accountType})`,
        requestedAccountMasked: masked,
        requestedIfsc: ifscCode.toUpperCase().trim(),
        accountHolder: holderName.trim(),
        chequeAttached,
      },
    });
    onClose();
  };

  const handleSubmitCourtApproval = (e: React.FormEvent) => {
    e.preventDefault();

    if (isSamePhysicalSports === 'yes') {
      if (!selectedParentCourt) {
        showToast('Live Court Required', 'Please select an existing live court.', 'warning');
        return;
      }
      const sportToAdd = courtSelectedSport || 'Cricket';
      const finalCourtName = selectedParentCourt.name;
      const finalDisplayName = displayName.trim() || `${selectedParentCourt.name} (${sportToAdd})`;

      // 1. Add court to inventory
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
        status: 'Pending Approval',
        statusDetails: `Under Review · Multi-sport mapping on ${selectedParentCourt.name}`,
        cancellationWindowHours: selectedParentCourt.cancellationWindowHours ?? 12,
        refundPercentage: selectedParentCourt.refundPercentage ?? 100,
        cancellationPolicyLabel: selectedParentCourt.cancellationPolicyLabel || 'Free cancel up to 12h before match (100% refund)',
      });

      // 2. Create official support request ticket
      addSupportTicket({
        category: 'Court Approval',
        requestType: 'court_approval',
        subject: `New Sport Approval: ${sportToAdd} on ${selectedParentCourt.name}`,
        description: `Request to map ${sportToAdd} onto physical ground ${selectedParentCourt.name} (${finalDisplayName}). Automatic conflict booking lock applied.`,
        priority: 'High',
        attachmentName: courtPhotosAttached ? 'court_marking_and_lighting_photos.zip' : undefined,
        detailsPayload: {
          courtName: finalCourtName,
          displayName: finalDisplayName,
          sports: [sportToAdd],
          surfaceType: selectedParentCourt.type || 'Outdoor',
          pricePerHour: selectedParentCourt.pricePerHour || 1000,
          minBookingDuration: selectedParentCourt.minBookingDuration || '1 Hour',
          samePhysicalSports: true,
          parentCourtName: selectedParentCourt.name,
          cancellationPolicyLabel: selectedParentCourt.cancellationPolicyLabel || 'Free cancellation up to 12h before match with 100% refund',
          photosCount: courtPhotosAttached ? 4 : 0,
        },
      });

      showToast('Court Request Submitted', `${sportToAdd} on ${selectedParentCourt.name} submitted for desk verification.`, 'success');
      haptics.success();
      onClose();
      return;
    }

    // Standalone Court (isSamePhysicalSports === 'no')
    if (!courtName.trim()) {
      showToast('Court Name Required', 'Please enter court name.', 'warning');
      return;
    }

    const windowHoursNum = parseInt(cancellationNoticeHours.split(' ')[0], 10) || 12;
    const refundPercentNum = parseInt(refundPercentage.replace('%', ''), 10) || 100;
    const policyLabel = `Free cancel up to ${cancellationNoticeHours} before match (${refundPercentage} refund)`;
    const parsedPrice = parseInt(regularPrice, 10) || 1000;
    const parsedPeakPrice = parseInt(peakHoursPrice, 10) || Math.round(parsedPrice * 1.4);
    const parsedWeekendPrice = parseInt(weekendPrice, 10) || Math.round(parsedPrice * 1.5);
    const finalDisplayName = displayName.trim() || undefined;

    // 1. Add court to inventory
    addNewCourt({
      name: courtName.trim(),
      displayName: finalDisplayName,
      samePhysicalSports: false,
      sports: [courtSelectedSport],
      pricePerHour: parsedPrice,
      minBookingDuration: minBookingTime,
      peakHoursStart,
      peakHoursEnd,
      peakDays,
      peakHoursPrice: parsedPeakPrice,
      weekendPrice: parsedWeekendPrice,
      operatingHours: `${peakHoursStart} – ${peakHoursEnd}`,
      type: courtEnvironment,
      status: 'Pending Approval',
      statusDetails: 'Submitted via Support Desk · Under 24h fast audit',
      cancellationWindowHours: windowHoursNum,
      refundPercentage: refundPercentNum,
      cancellationPolicyLabel: policyLabel,
    });

    // 2. Create official support ticket
    addSupportTicket({
      category: 'Court Approval',
      requestType: 'court_approval',
      subject: `New Court Verification: ${courtName.trim()}`,
      description: `Request for safety audit and listing approval for newly built court (${courtSelectedSport}, ₹${parsedPrice}/hr, ${minBookingTime} min duration).`,
      priority: 'High',
      attachmentName: courtPhotosAttached ? 'court_marking_and_lighting_photos.zip' : undefined,
      detailsPayload: {
        courtName: courtName.trim(),
        displayName: finalDisplayName,
        sports: [courtSelectedSport],
        surfaceType: courtSurface,
        pricePerHour: parsedPrice,
        minBookingDuration: minBookingTime,
        peakHoursPrice: parsedPeakPrice,
        weekendPrice: parsedWeekendPrice,
        peakSchedule: `${peakHoursStart}–${peakHoursEnd} (${peakDays.join(', ')})`,
        cancellationPolicyLabel: policyLabel,
        samePhysicalSports: false,
        photosCount: courtPhotosAttached ? 4 : 0,
      },
    });

    showToast('Court Request Created', `${courtName.trim()} submitted to operations desk for 24h verification.`, 'success');
    haptics.success();
    onClose();
  };

  const handleSubmitGeneralSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportSubject.trim() || !supportDescription.trim()) {
      showToast('Fields Required', 'Please enter subject and query details.', 'warning');
      return;
    }
    haptics.success();
    addSupportTicket({
      category: supportCategory,
      requestType: 'general_support',
      subject: `[${priority.toUpperCase()}] ${supportSubject.trim()}`,
      description: supportDescription.trim(),
      bookingId: linkedBookingId.trim() || undefined,
      priority,
      attachmentName: supportAttachment || undefined,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center overflow-y-auto sm:py-6 sm:px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ y: '100%', opacity: 0.8 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative bg-white w-full sm:max-w-2xl rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-[#E8E6E1] overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Handle */}
        <div className="w-10 h-1 bg-[#D1CFCA] rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-3 sm:px-6 sm:py-4 border-b border-[#E8E6E1] bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            {step === 'form' && (
              <button
                type="button"
                onClick={() => {
                  haptics.tap();
                  setStep('category');
                }}
                className="w-8 h-8 rounded-xl bg-[#FAF9F6] border border-[#E8E6E1] flex items-center justify-center text-[#171717] hover:bg-[#F1F0EC] transition-all cursor-pointer mr-0.5"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#FF6B2C]">
                  {step === 'category' ? 'Step 1 of 2' : 'Step 2 of 2'}
                </span>
              </div>
              <h2 className="text-[17px] sm:text-[19px] font-black text-[#171717] tracking-tight leading-snug">
                {step === 'category'
                  ? 'Select Request Category'
                  : requestType === 'venue_change'
                  ? 'Venue Details Update'
                  : requestType === 'bank_change'
                  ? 'Payout Bank Change'
                  : requestType === 'court_approval'
                  ? 'New Court Approval'
                  : 'General Support Query'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF9F6] hover:bg-[#F1F0EC] border border-[#E8E6E1] flex items-center justify-center text-[#777570] hover:text-[#171717] transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ======================================================= */}
        {/* STEP 1: CATEGORY SELECTION POPUP */}
        {/* ======================================================= */}
        {step === 'category' && (
          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 space-y-3.5">
            <p className="text-[12.5px] text-[#777570]">
              Select the category for your request. Verified changes undergo operational review by the TurfTown Desk.
            </p>

            <div className="space-y-2.5">
              {[
                {
                  id: 'venue_change' as const,
                  title: 'Venue Details Update',
                  caption: 'Update legal venue name, official road address, emergency numbers or GPS',
                  icon: Building,
                  color: 'bg-purple-500/10 text-purple-700 border-purple-200/60',
                  badge: '12h Review',
                },
                {
                  id: 'bank_change' as const,
                  title: 'Bank Account & Payout Change',
                  caption: 'Switch payout bank, commercial account number, IFSC code & cancelled cheque',
                  icon: CreditCard,
                  color: 'bg-blue-500/10 text-blue-700 border-blue-200/60',
                  badge: '4h Penny-drop',
                },
                {
                  id: 'court_approval' as const,
                  title: 'New Court / Pitch Approval',
                  caption: 'Submit newly constructed turf, boundary markings, lighting lux & photo audit',
                  icon: Layers,
                  color: 'bg-emerald-500/10 text-emerald-700 border-emerald-200/60',
                  badge: '24h Audit',
                },
                {
                  id: 'general_support' as const,
                  title: 'General Support & Bookings',
                  caption: 'Immediate help for counter UPI reconciliation, slot collision, refund or glitches',
                  icon: LifeBuoy,
                  color: 'bg-amber-500/10 text-amber-700 border-amber-200/60',
                  badge: '15m Priority',
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectCategory(item.id)}
                    className="p-4 rounded-2xl bg-[#FAF9F6] hover:bg-white border border-[#E8E6E1] hover:border-[#171717] transition-all cursor-pointer active-press shadow-2xs group flex items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${item.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-[14px] font-black text-[#171717] group-hover:text-[#FF6B2C] transition-colors">
                            {item.title}
                          </h4>
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-white text-[#777570] border border-[#E8E6E1]">
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-[11.5px] text-[#777570] leading-snug">
                          {item.caption}
                        </p>
                      </div>
                    </div>

                    <div className="w-7 h-7 rounded-full bg-white border border-[#E8E6E1] flex items-center justify-center text-[#777570] group-hover:text-[#171717] group-hover:translate-x-0.5 transition-all shrink-0">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* STEP 2: DEDICATED FORM SCREEN / POPUP BODY */}
        {/* ======================================================= */}
        {step === 'form' && (
          <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
            {/* 1. VENUE DETAILS FORM */}
            {requestType === 'venue_change' && (
              <form onSubmit={handleSubmitVenueChange} className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-[12px] font-bold text-[#171717] mb-1">
                      Current Listed Venue Name
                    </label>
                    <input
                      type="text"
                      disabled
                      value={venueName || 'TurfTown Arena'}
                      className="w-full h-10 px-3.5 rounded-xl bg-[#FAF9F6] border border-[#E8E6E1] text-[13px] font-medium text-[#777570] cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-[#171717] mb-1">
                      Requested New Venue Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={reqVenueName}
                      onChange={(e) => setReqVenueName(e.target.value)}
                      placeholder="e.g. TurfTown Arena (HSR Complex)"
                      className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#E8E6E1] text-[13.5px] font-semibold text-[#171717] focus:outline-none focus:border-[#171717]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-[#171717] mb-1">
                      Requested New Venue Address *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={reqVenueAddress}
                      onChange={(e) => setReqVenueAddress(e.target.value)}
                      placeholder="Complete postal address with landmark and pincode..."
                      className="w-full p-3 rounded-xl bg-white border border-[#E8E6E1] text-[13px] font-medium text-[#171717] focus:outline-none focus:border-[#171717] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-[#171717] mb-1">
                      Manager Secondary Phone Number
                    </label>
                    <input
                      type="text"
                      value={reqVenuePhone}
                      onChange={(e) => setReqVenuePhone(e.target.value)}
                      placeholder="+91 98451 22334"
                      className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#E8E6E1] text-[13.5px] font-medium text-[#171717] focus:outline-none focus:border-[#171717]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-[#171717] mb-1">
                      Reason for Change *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={reqVenueReason}
                      onChange={(e) => setReqVenueReason(e.target.value)}
                      placeholder="State why this change is requested..."
                      className="w-full p-3 rounded-xl bg-white border border-[#E8E6E1] text-[13px] font-medium text-[#171717] focus:outline-none focus:border-[#171717] resize-none"
                    />
                  </div>

                  {/* Document upload simulation */}
                  <div>
                    <label className="block text-[12px] font-bold text-[#171717] mb-1">
                      Upload Address Proof / Trade License (Optional)
                    </label>
                    <div
                      onClick={() => {
                        haptics.tap();
                        setVenueDocAttached(!venueDocAttached);
                      }}
                      className={`p-3.5 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all ${
                        venueDocAttached
                          ? 'border-[#2FA66A] bg-[#2FA66A]/5 text-[#1E774A]'
                          : 'border-[#E8E6E1] bg-[#FAF9F6] hover:border-[#171717] text-[#777570]'
                      }`}
                    >
                      {venueDocAttached ? (
                        <div className="flex items-center justify-center gap-2 font-bold text-[12.5px]">
                          <Check className="w-4 h-4 text-[#2FA66A]" />
                          <span>Attached: trade_license_tax_proof.pdf</span>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <Upload className="w-4 h-4 mx-auto text-[#777570]" />
                          <p className="text-[12px] font-bold text-[#171717]">Tap to simulate attaching utility bill / trade license</p>
                          <p className="text-[10.5px]">PDF or JPG up to 10MB</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sticky Action Footer */}
                <div className="pt-3 border-t border-[#E8E6E1] flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setStep('category')}
                    className="h-11 px-4 rounded-xl bg-[#FAF9F6] text-[#171717] font-bold text-[13px] border border-[#E8E6E1]"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-11 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-[13.5px] flex items-center justify-center gap-2 active-press shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Venue Update Request</span>
                  </button>
                </div>
              </form>
            )}

            {/* 2. BANK ACCOUNT FORM */}
            {requestType === 'bank_change' && (
              <form onSubmit={handleSubmitBankChange} className="space-y-4">
                <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-[12px] text-blue-900 flex items-center justify-between">
                  <div>
                    <span className="font-bold">Active Account:</span>
                    <p className="font-medium mt-0.5">HDFC Bank Current (•••• 8892) · IFSC HDFC0001234</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-black text-[10px]">
                    ACTIVE
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-bold text-[#171717] mb-1">
                        New Bank Name *
                      </label>
                      <select
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full h-11 px-3 rounded-xl bg-white border border-[#E8E6E1] text-[13px] font-bold text-[#171717] focus:outline-none"
                      >
                        <option value="ICICI Bank">ICICI Bank</option>
                        <option value="State Bank of India">State Bank of India (SBI)</option>
                        <option value="Axis Bank">Axis Bank</option>
                        <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                        <option value="HDFC Bank">HDFC Bank (New Account)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-[#171717] mb-1">
                        Account Type *
                      </label>
                      <select
                        value={accountType}
                        onChange={(e) => setAccountType(e.target.value)}
                        className="w-full h-11 px-3 rounded-xl bg-white border border-[#E8E6E1] text-[13px] font-bold text-[#171717] focus:outline-none"
                      >
                        <option value="Current Commercial">Current Commercial Account</option>
                        <option value="Savings Account">Business Savings Account</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-[#171717] mb-1">
                      Account Holder Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={holderName}
                      onChange={(e) => setHolderName(e.target.value)}
                      placeholder="Must match PAN registration"
                      className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#E8E6E1] text-[13.5px] font-semibold text-[#171717] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-bold text-[#171717] mb-1">
                        New Account Number *
                      </label>
                      <input
                        type="password"
                        required
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="e.g. 50200088924519"
                        className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#E8E6E1] text-[13.5px] font-mono font-semibold text-[#171717] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-[#171717] mb-1">
                        Confirm Account Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={confirmAccountNumber}
                        onChange={(e) => setConfirmAccountNumber(e.target.value)}
                        placeholder="Re-enter account number"
                        className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#E8E6E1] text-[13.5px] font-mono font-semibold text-[#171717] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-[#171717] mb-1">
                      Bank IFSC Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                      placeholder="e.g. ICIC0001824"
                      className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#E8E6E1] text-[13.5px] font-mono font-bold text-[#171717] focus:outline-none"
                    />
                  </div>

                  {/* Cheque upload simulation */}
                  <div>
                    <label className="block text-[12px] font-bold text-[#171717] mb-1">
                      Upload Cancelled Cheque / Bank Statement *
                    </label>
                    <div
                      onClick={() => {
                        haptics.tap();
                        setChequeAttached(!chequeAttached);
                      }}
                      className={`p-3.5 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all ${
                        chequeAttached
                          ? 'border-[#2FA66A] bg-[#2FA66A]/5 text-[#1E774A]'
                          : 'border-[#E8E6E1] bg-[#FAF9F6] hover:border-[#171717] text-[#777570]'
                      }`}
                    >
                      {chequeAttached ? (
                        <div className="flex items-center justify-center gap-2 font-bold text-[12.5px]">
                          <Check className="w-4 h-4 text-[#2FA66A]" />
                          <span>Attached: cancelled_cheque_icici_turftown.pdf</span>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <Upload className="w-4 h-4 mx-auto text-[#777570]" />
                          <p className="text-[12px] font-bold text-[#171717]">Tap to upload cancelled cheque</p>
                          <p className="text-[10.5px]">Showing IFSC &amp; Account Number</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sticky Action Footer */}
                <div className="pt-3 border-t border-[#E8E6E1] flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setStep('category')}
                    className="h-11 px-4 rounded-xl bg-[#FAF9F6] text-[#171717] font-bold text-[13px] border border-[#E8E6E1]"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[13.5px] flex items-center justify-center gap-2 active-press shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Bank Change Request</span>
                  </button>
                </div>
              </form>
            )}

            {/* 3. NEW COURT APPROVAL FORM - COMPLETE ADD COURT SPECIFICATION WORKFLOW */}
            {requestType === 'court_approval' && (
              <form onSubmit={handleSubmitCourtApproval} className="space-y-4">
                {/* SECTION 1: QUESTION: Same physical sports for this turf? */}
                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E8E6E1] shadow-2xs space-y-2.5">
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

                  <p className="text-[11px] text-[#777570] leading-relaxed">
                    Select <strong className="text-[#171717]">Yes</strong> if this sport will share the ground with an already live physical court (e.g. Football pitch also used for Box Cricket).
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                    <button
                      type="button"
                      id="btn-same-physical-yes"
                      onClick={() => {
                        haptics.tap();
                        setIsSamePhysicalSports('yes');
                        if (courtSelectedSport === 'Football') {
                          setCourtSelectedSport('Cricket');
                        }
                        if (selectedParentCourt) {
                          setDisplayName(`${selectedParentCourt.name} (${courtSelectedSport === 'Football' ? 'Cricket' : courtSelectedSport})`);
                        }
                      }}
                      className={`py-2.5 px-3 rounded-xl font-bold text-[12.5px] sm:text-[13px] flex items-center justify-center gap-1.5 transition-all border cursor-pointer active-press ${
                        isSamePhysicalSports === 'yes'
                          ? 'bg-[#171717] text-white border-[#171717] shadow-xs'
                          : 'bg-[#FAF9F6] text-[#777570] border-[#E8E6E1] hover:text-[#171717]'
                      }`}
                    >
                      {isSamePhysicalSports === 'yes' && <Check className="w-3.5 h-3.5 text-[#2FA66A]" />}
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
                          ? 'bg-[#171717] text-white border-[#171717] shadow-xs'
                          : 'bg-[#FAF9F6] text-[#777570] border-[#E8E6E1] hover:text-[#171717]'
                      }`}
                    >
                      {isSamePhysicalSports === 'no' && <Check className="w-3.5 h-3.5 text-[#2FA66A]" />}
                      <span>No (Separate Ground)</span>
                    </button>
                  </div>
                </div>

                {/* CONDITIONAL FLOW A: WHEN 'YES' (SHARE PHYSICAL GROUND) */}
                {isSamePhysicalSports === 'yes' ? (
                  <div className="space-y-3.5 animate-in fade-in duration-200">
                    {/* STEP 2: SELECT EXISTING LIVE COURT */}
                    <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E8E6E1] shadow-2xs space-y-3">
                      <div className="flex items-center justify-between pb-1 border-b border-[#F1F0EC]">
                        <div className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-[#171717] text-white text-[10px] font-bold flex items-center justify-center">
                            2
                          </span>
                          <h3 className="text-[13px] font-black text-[#171717]">Select Existing Live Court</h3>
                        </div>
                        <span className="text-[10px] text-[#2FA66A] font-extrabold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {liveCourts.length} Live Courts Available
                        </span>
                      </div>

                      <p className="text-[11px] text-[#777570]">
                        Select the active physical ground that this new sport will map to:
                      </p>

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
                                setDisplayName(`${court.name} (${courtSelectedSport || 'Cricket'})`);
                              }}
                              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 select-none active-press ${
                                isSelected
                                  ? 'bg-[#171717] text-white border-[#171717] ring-2 ring-[#FF6B2C]/40 shadow-sm'
                                  : 'bg-[#FAF9F6] text-[#171717] border-[#E8E6E1] hover:bg-[#F1F0EC]'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[13px] sm:text-[13.5px] font-black">{court.name}</span>
                                    <span
                                      className={`px-1.5 py-0.2 rounded text-[8.5px] font-extrabold uppercase ${
                                        isSelected ? 'bg-white/20 text-[#FF9D66]' : 'bg-[#2FA66A]/15 text-[#2FA66A]'
                                      }`}
                                    >
                                      {court.status || 'Live'}
                                    </span>
                                  </div>
                                  <p
                                    className={`text-[10.5px] font-medium mt-0.5 line-clamp-1 ${
                                      isSelected ? 'text-[#D4D2CD]' : 'text-[#777570]'
                                    }`}
                                  >
                                    {court.displayName || court.name}
                                  </p>
                                </div>

                                <div
                                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                                    isSelected ? 'bg-[#FF6B2C] border-[#FF6B2C] text-white' : 'border-[#D4D2CD] bg-white'
                                  }`}
                                >
                                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-1.5 border-t border-white/10 text-[10.5px]">
                                <span className={`font-bold ${isSelected ? 'text-[#FF9D66]' : 'text-[#777570]'}`}>
                                  Sports: {court.sports?.join(', ') || 'Football'}
                                </span>
                                <span className="font-black text-[#FF6B2C]">₹{court.pricePerHour}/hr</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* STEP 3: ADD ANOTHER SPORT & DISPLAY NAME */}
                    {selectedParentCourt && (
                      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E8E6E1] shadow-2xs space-y-3">
                        <div className="flex items-center gap-1.5 pb-1 border-b border-[#F1F0EC]">
                          <span className="w-4 h-4 rounded-full bg-[#171717] text-white text-[10px] font-bold flex items-center justify-center">
                            3
                          </span>
                          <h3 className="text-[13px] font-black text-[#171717]">
                            Add Another Sport on {selectedParentCourt.name}
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-[#777570] mb-1">
                              Select Additional Sport <span className="text-[#FF6B2C]">*</span>
                            </label>
                            <div className="relative">
                              <select
                                value={courtSelectedSport}
                                onChange={(e) => {
                                  haptics.tap();
                                  const newSport = e.target.value;
                                  setCourtSelectedSport(newSport);
                                  setDisplayName(`${selectedParentCourt.name} (${newSport})`);
                                }}
                                className="w-full h-11 bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 text-[13px] font-bold text-[#171717] focus:outline-none focus:border-[#171717] appearance-none cursor-pointer pr-9"
                              >
                                {AVAILABLE_SPORTS.map((sp) => (
                                  <option key={sp} value={sp}>
                                    {sp} {selectedParentCourt.sports.includes(sp) ? '(Already active)' : ''}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="w-3.5 h-3.5 text-[#777570] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                            <span className="text-[10px] text-[#777570] mt-1 block">
                              Active sports on physical turf: <strong className="text-[#171717]">{selectedParentCourt.sports.join(', ')}</strong>
                            </span>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-[#777570] mb-1">
                              Display Name <span className="text-[10px] text-[#FF6B2C] font-bold">* (Customer-Facing)</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={displayName || `${selectedParentCourt.name} (${courtSelectedSport || 'Cricket'})`}
                              onChange={(e) => setDisplayName(e.target.value)}
                              placeholder={`e.g. ${selectedParentCourt.name} (Box Cricket)`}
                              className="w-full h-11 bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 text-[13px] font-bold text-[#171717] focus:outline-none focus:border-[#171717]"
                            />
                            <span className="text-[10px] text-[#777570] mt-1 block">
                              Appears on customer booking screen when selecting {courtSelectedSport || 'this sport'}.
                            </span>
                          </div>
                        </div>

                        {/* Shared physical ground explanation banner */}
                        <div className="bg-[#FFF8E6] border border-[#FFE082] rounded-xl p-3 text-[11.5px] text-[#8C6B00] flex items-start gap-2.5">
                          <AlertCircle className="w-4 h-4 text-[#E65100] shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <p className="font-bold text-[#B45309]">Physical Ground Conflict Synchronization</p>
                            <p className="text-[#8C6B00] leading-relaxed">
                              When a slot is booked for <strong>{courtSelectedSport || 'this sport'}</strong>, the system will automatically block the underlying physical ground <strong>{selectedParentCourt.name}</strong> to prevent double bookings.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 4: INHERITED PHYSICAL GROUND SPECS & POLICIES */}
                    {selectedParentCourt && (
                      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E8E6E1] shadow-2xs space-y-3">
                        <div className="flex items-center justify-between pb-1 border-b border-[#F1F0EC]">
                          <div className="flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-[#171717] text-white text-[10px] font-bold flex items-center justify-center">
                              4
                            </span>
                            <h3 className="text-[13px] font-black text-[#171717]">
                              Inherited Ground Specs &amp; Policies
                            </h3>
                          </div>
                          <span className="text-[10px] text-[#777570] font-bold">
                            Matches parent court setup
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11.5px]">
                          <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#E8E6E1]">
                            <span className="text-[10px] font-bold text-[#777570] block">Regular Rate</span>
                            <span className="text-[13px] font-black text-[#171717]">₹{selectedParentCourt.pricePerHour}/hr</span>
                          </div>
                          <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#E8E6E1]">
                            <span className="text-[10px] font-bold text-[#777570] block">Min Duration</span>
                            <span className="text-[13px] font-black text-[#171717]">{selectedParentCourt.minBookingDuration || '1 Hour'}</span>
                          </div>
                          <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#E8E6E1]">
                            <span className="text-[10px] font-bold text-[#777570] block">Operating Hours</span>
                            <span className="text-[13px] font-black text-[#171717]">{selectedParentCourt.operatingHours || '06:00 AM – 11:00 PM'}</span>
                          </div>
                          <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#E8E6E1]">
                            <span className="text-[10px] font-bold text-[#777570] block">Environment</span>
                            <span className="text-[13px] font-black text-[#171717]">{selectedParentCourt.type || 'Outdoor'}</span>
                          </div>
                        </div>

                        <div className="bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl p-2.5 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-[#2FA66A] shrink-0" />
                          <span className="text-[11px] text-[#777570]">
                            <strong className="text-[#171717]">Inherited Cancellation Rule: </strong>
                            {selectedParentCourt.cancellationPolicyLabel || 'Free cancellation up to 12h before match with 100% refund.'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* CONDITIONAL FLOW B: WHEN 'NO' (SEPARATE GROUND) */
                  <div className="space-y-3.5 animate-in fade-in duration-200">
                    {/* SECTION 2: COURT INFORMATION */}
                    <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E8E6E1] shadow-2xs space-y-3">
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
                              value={courtSelectedSport}
                              onChange={(e) => {
                                haptics.tap();
                                setCourtSelectedSport(e.target.value);
                              }}
                              className="w-full h-11 bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 text-[13px] font-bold text-[#171717] focus:outline-none focus:border-[#171717] appearance-none cursor-pointer pr-9"
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
                            className="w-full h-11 bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 text-[13px] font-bold text-[#171717] focus:outline-none focus:border-[#171717]"
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
                          className="w-full h-11 bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 text-[13px] font-bold text-[#171717] focus:outline-none focus:border-[#171717]"
                        />
                      </div>
                    </div>

                    {/* SECTION 3: BASE DURATION & RATE */}
                    <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E8E6E1] shadow-2xs space-y-3">
                      <div className="flex items-center gap-1.5 pb-1 border-b border-[#F1F0EC]">
                        <span className="w-4 h-4 rounded-full bg-[#171717] text-white text-[10px] font-bold flex items-center justify-center">
                          3
                        </span>
                        <h3 className="text-[13px] font-black text-[#171717]">Base Duration &amp; Rate</h3>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#777570] mb-1.5">
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
                            className="w-full h-11 bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl pl-7 pr-16 text-[13.5px] font-bold text-[#171717] focus:outline-none focus:border-[#171717]"
                          />
                          <span className="absolute right-3 text-[11px] font-bold text-[#777570]">/ hour</span>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 4: PEAK HOURS & WEEKEND */}
                    <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#FF6B2C]/30 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between pb-1 border-b border-[#F1F0EC]">
                        <div className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-[#FF6B2C] text-white text-[10px] font-bold flex items-center justify-center">
                            4
                          </span>
                          <h3 className="text-[13px] font-black text-[#171717]">Peak Surcharge &amp; Weekend Rates</h3>
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
                            className="w-full h-10 bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-2.5 text-[12px] font-bold text-[#171717] focus:outline-none cursor-pointer"
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
                            className="w-full h-10 bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-2.5 text-[12px] font-bold text-[#171717] focus:outline-none cursor-pointer"
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
                              className="w-full h-10 bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl pl-6 pr-2 text-[12.5px] font-bold text-[#171717] focus:outline-none"
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
                              className="w-full h-10 bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl pl-6 pr-2 text-[12.5px] font-bold text-[#171717] focus:outline-none"
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
                                className={`h-8 rounded-lg text-[11px] font-bold transition-all border cursor-pointer active-press ${
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

                    {/* SECTION 5: COURT-SPECIFIC CANCELLATION & REFUND POLICY */}
                    <div className="space-y-3">
                      {/* Card 1: Free Cancellation Window */}
                      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-[#E8E6E1] shadow-2xs space-y-2.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#FF6B2C]/10 text-[#FF6B2C] flex items-center justify-center shrink-0">
                            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <div>
                            <h3 className="text-[14px] sm:text-[15px] font-black text-[#171717] leading-tight">
                              Free Cancellation Window
                            </h3>
                            <p className="text-[11px] text-[#777570] font-medium mt-0.5">
                              Minimum notice buffer required before match kickoff
                            </p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11.5px] font-bold text-[#171717] mb-1.5">
                            Notice Buffer Before Kickoff:
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
                      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-[#E8E6E1] shadow-2xs space-y-2.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#2FA66A]/10 text-[#2FA66A] flex items-center justify-center shrink-0">
                            <Percent className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <div>
                            <h3 className="text-[14px] sm:text-[15px] font-black text-[#171717] leading-tight">
                              Refund Payout Percentage
                            </h3>
                            <p className="text-[11px] text-[#777570] font-medium mt-0.5">
                              Amount returned to customer source account
                            </p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11.5px] font-bold text-[#171717] mb-1.5">
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
                          <strong className="text-[#171717]">Cancellation Rule: </strong>
                          Free cancellation up to {cancellationNoticeHours} before kickoff with {refundPercentage} refund.
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION 6: PHOTO AUDIT ATTACHMENTS */}
                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E8E6E1] shadow-2xs space-y-2">
                  <label className="block text-[12px] font-bold text-[#171717]">
                    Court Photos &amp; Boundary Markings (4 Photos) *
                  </label>
                  <div
                    onClick={() => {
                      haptics.tap();
                      setCourtPhotosAttached(!courtPhotosAttached);
                    }}
                    className={`p-3.5 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all ${
                      courtPhotosAttached
                        ? 'border-[#2FA66A] bg-[#2FA66A]/5 text-[#1E774A]'
                        : 'border-[#E8E6E1] bg-[#FAF9F6] hover:border-[#171717] text-[#777570]'
                    }`}
                  >
                    {courtPhotosAttached ? (
                      <div className="flex items-center justify-center gap-2 font-bold text-[12px] sm:text-[12.5px]">
                        <Check className="w-4 h-4 text-[#2FA66A]" />
                        <span>4 Photos Attached (Turf, Lighting, Netting, Access)</span>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <Upload className="w-4 h-4 mx-auto text-[#777570]" />
                        <p className="text-[12px] font-bold text-[#171717]">Tap to simulate uploading 4 court audit photos</p>
                        <p className="text-[10.5px]">High-res pitch and boundary verification</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sticky Action Footer */}
                <div className="pt-3 border-t border-[#E8E6E1] flex items-center gap-2.5 sticky bottom-0 bg-white z-10 pb-1">
                  <button
                    type="button"
                    onClick={() => setStep('category')}
                    className="h-11 px-4 rounded-xl bg-[#FAF9F6] text-[#171717] font-bold text-[13px] border border-[#E8E6E1] active-press cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[13px] sm:text-[13.5px] flex items-center justify-center gap-2 active-press shadow-sm cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {isSamePhysicalSports === 'yes' && selectedParentCourt
                        ? `Submit ${courtSelectedSport} on ${selectedParentCourt.name}`
                        : 'Submit Court for Approval & Verification'}
                    </span>
                  </button>
                </div>
              </form>
            )}

            {/* 4. GENERAL SUPPORT FORM */}
            {requestType === 'general_support' && (
              <form onSubmit={handleSubmitGeneralSupport} className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-[12px] font-bold text-[#171717] mb-1">
                      Query Category *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(['Payment', 'Booking', 'Technical', 'Other'] as const).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            haptics.tap();
                            setSupportCategory(cat);
                          }}
                          className={`h-8 px-3 rounded-lg text-[12px] font-bold transition-all ${
                            supportCategory === cat
                              ? 'bg-[#171717] text-white'
                              : 'bg-[#FAF9F6] text-[#55534E] border border-[#E8E6E1]'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-[#171717] mb-1">
                      Urgency Level
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['Low', 'Medium', 'High', 'Urgent'] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => {
                            haptics.tap();
                            setPriority(p);
                          }}
                          className={`h-8 rounded-lg text-[12px] font-bold transition-all border ${
                            priority === p
                              ? p === 'Urgent'
                                ? 'bg-red-600 text-white border-red-600'
                                : 'bg-[#FF6B2C] text-white border-[#FF6B2C]'
                              : 'bg-[#FAF9F6] text-[#55534E] border-[#E8E6E1]'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-[#171717] mb-1">
                      Linked Booking ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={linkedBookingId}
                      onChange={(e) => setLinkedBookingId(e.target.value)}
                      placeholder="e.g. BK10231"
                      className="w-full h-10 px-3 rounded-xl bg-white border border-[#E8E6E1] text-[13px] font-semibold text-[#171717] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-[#171717] mb-1">
                      Query Subject *
                    </label>
                    <input
                      type="text"
                      required
                      value={supportSubject}
                      onChange={(e) => setSupportSubject(e.target.value)}
                      placeholder="e.g. Customer payment debited via UPI, counter slot pending"
                      className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#E8E6E1] text-[13.5px] font-semibold text-[#171717] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-[#171717] mb-1">
                      Detailed Description *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={supportDescription}
                      onChange={(e) => setSupportDescription(e.target.value)}
                      placeholder="Provide details, timestamps, customer phone, or UTR number..."
                      className="w-full p-3 rounded-xl bg-white border border-[#E8E6E1] text-[13px] font-medium text-[#171717] focus:outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Sticky Action Footer */}
                <div className="pt-3 border-t border-[#E8E6E1] flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setStep('category')}
                    className="h-11 px-4 rounded-xl bg-[#FAF9F6] text-[#171717] font-bold text-[13px] border border-[#E8E6E1]"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-11 rounded-xl bg-[#FF6B2C] hover:bg-[#e85b1e] text-white font-extrabold text-[13.5px] flex items-center justify-center gap-2 active-press shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Query</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
