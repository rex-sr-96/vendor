import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Plus,
  Link2,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Ban,
  Download,
  Calendar as CalendarIcon,
  Phone,
  MapPin,
  Copy,
  X,
  LayoutGrid,
  List,
  Wallet,
  CreditCard,
  Building,
  Check,
  RotateCcw,
  QrCode,
  Banknote,
  LogIn,
  LogOut,
  Sparkles,
  AlertTriangle,
  Flame,
  ArrowRight,
  Timer,
  RefreshCw,
  Trash2,
  SlidersHorizontal,
  Lock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Booking, BookingStatus, PaymentStatus } from '../types';
import { haptics } from '../utils/haptics';
import { DateMonthPickerSheet } from '../components/DateMonthPickerSheet';
import { exportSingleBookingReceipt } from '../utils/exportUtils';
import { calculateBookingFinancials, formatMinutesSeconds } from '../utils/feeCalculator';
import { getAvailableExtensionSlots } from '../utils/extensionSlots';

type DateFilterType = 'today' | 'tomorrow' | 'upcoming' | 'particular' | 'all';
type ViewMode = 'grid' | 'table';

function isBookingExpired(b: Booking): boolean {
  if (b.status === 'Confirmed' || b.status === 'Ongoing' || b.status === 'Completed' || b.status === 'Cancelled') return false;
  return (
    b.status === 'Expired' ||
    (b.status === 'Payment Pending' && b.holdExpiresInMinutes !== undefined && b.holdExpiresInMinutes <= 0)
  );
}

export const BookingListScreen: React.FC = () => {
  const {
    bookings,
    courts,
    navigateTo,
    setSelectedBookingId,
    setActiveModal,
    sendPaymentLink,
    isPaymentLinkBlocked,
    getPaymentLinkTimeRemaining,
    showToast,
    checkInBooking,
    checkOutBooking,
    extendBookingSlot,
    relockAndResendLink,
    confirmBookingPayment,
    releaseExpiredSlot,
  } = useApp();

  const [, setTimerTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTimerTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);



  // 1. Search & Taxonomy Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [relockMins, setRelockMins] = useState<number>(15);
  const [selectedBookingStatus, setSelectedBookingStatus] = useState<string>('All');
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState<string>('All');
  const [selectedSport, setSelectedSport] = useState<string>('All');

  // 2. Date Filtering State
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
  const [selectedParticularDate, setSelectedParticularDate] = useState<string>('28 Aug 2026');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const [isMobileFilterSheetOpen, setIsMobileFilterSheetOpen] = useState<boolean>(false);

  // 3. View Mode (Grid vs Table)
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // 4. Booking Details Popup Modal State (User requested: modal popup instead of new page)
  const [selectedPopupBooking, setSelectedPopupBooking] = useState<Booking | null>(null);

  // 5. Extend Slot Modal State
  const [extendingBooking, setExtendingBooking] = useState<Booking | null>(null);
  const [extensionMinutes, setExtensionMinutes] = useState<number | null>(null);
  const [customEndTime, setCustomEndTime] = useState<string>('');

  // Helper date timestamp parser
  const parseDateToTimestamp = (dateStr: string): number => {
    try {
      if (!dateStr) return 0;
      const parts = dateStr.split(' ');
      if (parts.length === 3) {
        const months: Record<string, number> = {
          Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
          Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
        };
        const day = parseInt(parts[0], 10);
        const month = months[parts[1]] ?? 7;
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day).getTime();
      }
      return new Date(dateStr).getTime();
    } catch {
      return 0;
    }
  };

  const todayTimestamp = parseDateToTimestamp('28 Aug 2026');

  // Filtered Bookings Logic
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // 1. Search query filter
      const matchesSearch =
        b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.courtName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.sport.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      // 2. Booking Status Filter
      if (selectedBookingStatus !== 'All') {
        if (selectedBookingStatus === 'Ongoing' && b.status !== 'Ongoing') return false;
        if (selectedBookingStatus === 'Confirmed' && b.status !== 'Confirmed') return false;
        if (selectedBookingStatus === 'Completed' && b.status !== 'Completed') return false;
        if (selectedBookingStatus === 'Payment Pending') {
          if (b.status !== 'Payment Pending' || isBookingExpired(b)) return false;
        }
        if (selectedBookingStatus === 'Expired') {
          if (!isBookingExpired(b)) return false;
        }
      }

      // 3. Payment Status Filter
      if (selectedPaymentFilter !== 'All') {
        if (selectedPaymentFilter === 'Paid' && (b.balanceAmount > 0 || b.paymentStatus !== 'Paid')) return false;
        if (selectedPaymentFilter === 'Pending' && b.balanceAmount === 0) return false;
      }

      // 4. Sport filter
      const matchesSport = selectedSport === 'All' || b.sport === selectedSport;
      if (!matchesSport) return false;

      // 5. Date filter
      if (dateFilter === 'today') {
        return b.date === '28 Aug 2026';
      }
      if (dateFilter === 'tomorrow') {
        return b.date === '29 Aug 2026';
      }
      if (dateFilter === 'upcoming') {
        const bTime = parseDateToTimestamp(b.date);
        return bTime >= todayTimestamp;
      }
      if (dateFilter === 'particular') {
        return b.date === selectedParticularDate;
      }

      return true;
    });
  }, [
    bookings,
    searchTerm,
    selectedBookingStatus,
    selectedPaymentFilter,
    selectedSport,
    dateFilter,
    selectedParticularDate,
    todayTimestamp,
  ]);

  // Keep selectedPopupBooking in sync with bookings state if updated
  const activePopupBooking = useMemo(() => {
    if (!selectedPopupBooking) return null;
    return bookings.find((b) => b.id === selectedPopupBooking.id) || selectedPopupBooking;
  }, [selectedPopupBooking, bookings]);

  // Financial KPIs based on active bookings
  const kpis = useMemo(() => {
    const totalCount = filteredBookings.length;
    const totalGross = filteredBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const totalPaid = filteredBookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
    const totalDue = filteredBookings.reduce((sum, b) => sum + (b.balanceAmount || 0), 0);
    const ongoingCount = filteredBookings.filter((b) => b.status === 'Ongoing').length;
    const confirmedCount = filteredBookings.filter((b) => b.status === 'Confirmed').length;
    const expiredCount = filteredBookings.filter((b) => b.status === 'Expired').length;

    return { totalCount, totalGross, totalPaid, totalDue, ongoingCount, confirmedCount, expiredCount };
  }, [filteredBookings]);

  // Contextual counts for match status tabs (evaluated against active search & date)
  const statusCounts = useMemo(() => {
    const base = bookings.filter((b) => {
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const matches =
          b.customerName.toLowerCase().includes(term) ||
          b.customerPhone.includes(term) ||
          b.id.toLowerCase().includes(term) ||
          b.courtName.toLowerCase().includes(term) ||
          b.sport.toLowerCase().includes(term);
        if (!matches) return false;
      }
      if (selectedSport !== 'All' && b.sport !== selectedSport) return false;
      if (dateFilter === 'today' && b.date !== '28 Aug 2026') return false;
      if (dateFilter === 'tomorrow' && b.date !== '29 Aug 2026') return false;
      if (dateFilter === 'particular' && b.date !== selectedParticularDate) return false;
      return true;
    });

    return {
      all: base.length,
      ongoing: base.filter((b) => b.status === 'Ongoing').length,
      confirmed: base.filter((b) => b.status === 'Confirmed').length,
      pending: base.filter((b) => b.status === 'Payment Pending' && !isBookingExpired(b)).length,
      completed: base.filter((b) => b.status === 'Completed').length,
    };
  }, [bookings, searchTerm, selectedSport, dateFilter, selectedParticularDate]);

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    selectedBookingStatus !== 'All' ||
    selectedPaymentFilter !== 'All' ||
    selectedSport !== 'All' ||
    dateFilter !== 'all';

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedBookingStatus !== 'All') count++;
    if (selectedPaymentFilter !== 'All') count++;
    if (selectedSport !== 'All') count++;
    if (dateFilter !== 'all') count++;
    return count;
  }, [selectedBookingStatus, selectedPaymentFilter, selectedSport, dateFilter]);

  const handleClearAllFilters = () => {
    haptics.tap();
    setSearchTerm('');
    setSelectedBookingStatus('All');
    setSelectedPaymentFilter('All');
    setSelectedSport('All');
    setDateFilter('all');
  };

  const handleOpenExportPage = () => {
    haptics.tap();
    navigateTo('export_report');
  };

  const handleOpenPopup = (booking: Booking) => {
    haptics.tap();
    setSelectedPopupBooking(booking);
  };

  const handleCollectPayment = (booking: Booking, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    haptics.tap();
    setSelectedBookingId(booking.id);
    setActiveModal('payment_options');
  };

  const copyPhone = (phone: string) => {
    haptics.tap();
    navigator.clipboard?.writeText(phone);
    showToast('Copied to Clipboard', phone, 'info');
  };

  // -------------------------------------------------------------
  // DUAL STATUS BADGES (Booking Status vs Payment Status)
  // -------------------------------------------------------------
  const getBookingStatusBadge = (status: BookingStatus, holdMinutes?: number, notes?: string) => {
    if (status === 'Ongoing') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-[#2FA66A]/20 text-[#1E774A] border border-[#2FA66A]/30 inline-flex items-center gap-1.5 shrink-0 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#2FA66A] animate-ping shrink-0" />
          <span>Ongoing Match</span>
        </span>
      );
    }
    if (status === 'Confirmed') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-[#FF6B2C]/15 text-[#E65100] border border-[#FF6B2C]/25 inline-flex items-center gap-1 shrink-0">
          <CheckCircle2 className="w-3 h-3" />
          <span>Confirmed</span>
        </span>
      );
    }
    if (status === 'Completed') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-[#F1F0EC] text-[#777570] border border-[#E8E6E1] inline-flex items-center gap-1 shrink-0">
          <Check className="w-3 h-3 text-[#2FA66A]" />
          <span>Checked Out</span>
        </span>
      );
    }
    if (
      status === 'Expired' ||
      (status === 'Payment Pending' && holdMinutes !== undefined && holdMinutes <= 0)
    ) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-[#D94B4B]/15 text-[#B52B2B] border border-[#D94B4B]/25 inline-flex items-center gap-1 shrink-0 animate-pulse">
          <AlertTriangle className="w-3 h-3" />
          <span>Hold Expired</span>
        </span>
      );
    }
    if (status === 'Payment Pending') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-[#E7A72F]/15 text-[#B87C0D] border border-[#E7A72F]/30 inline-flex items-center gap-1 shrink-0">
          <Clock className="w-3 h-3 text-[#B87C0D]" />
          <span>Payment Pending ({holdMinutes || 15}m hold)</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-[#777570]/15 text-[#171717] border border-[#E8E6E1] inline-flex items-center gap-1 shrink-0">
        <span>{status}</span>
      </span>
    );
  };

  const getPaymentStatusBadge = (paymentStatus: PaymentStatus, balanceAmount: number) => {
    if (balanceAmount === 0 || paymentStatus === 'Paid') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#2FA66A]/10 text-[#2FA66A] border border-[#2FA66A]/20 inline-flex items-center gap-1 shrink-0">
          <CheckCircle2 className="w-2.5 h-2.5" />
          <span>Paid</span>
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#E7A72F]/15 text-[#B87C0D] border border-[#E7A72F]/25 inline-flex items-center gap-1 shrink-0">
        <Clock className="w-2.5 h-2.5" />
        <span>Due ₹{balanceAmount.toLocaleString('en-IN')}</span>
      </span>
    );
  };

  // -------------------------------------------------------------
  // EXTENSION TIME LOGIC & CONFLICT DETECTION
  // -------------------------------------------------------------
  const calculateExtension = (booking: Booking, addedMinutes: number) => {
    const court = courts.find((c) => c.id === booking.courtId || c.name === booking.courtName);
    const hourlyRate = court?.pricePerHour || (booking.totalAmount > 0 ? booking.totalAmount / 2 : 1000);
    const addedFee = Math.round((hourlyRate * addedMinutes) / 60);

    // Calculate new end time
    // e.g. "6:00–8:00 PM" -> split into start "6:00 PM" and end "8:00 PM"
    const slotParts = booking.timeSlot.split('–');
    const startTime = slotParts[0]?.trim() || '6:00 PM';
    const currentEndTime = slotParts[1]?.trim() || '8:00 PM';

    // Parse current end time to advance it
    // Example format: "8:00 PM"
    let newEndTime = currentEndTime;
    try {
      const isPM = currentEndTime.toUpperCase().includes('PM');
      const isAM = currentEndTime.toUpperCase().includes('AM');
      const timeClean = currentEndTime.replace(/AM|PM/i, '').trim();
      const [hStr, mStr] = timeClean.split(':');
      let hours = parseInt(hStr, 10);
      let mins = parseInt(mStr || '0', 10);

      if (isPM && hours < 12) hours += 12;
      if (isAM && hours === 12) hours = 0;

      const totalMins = hours * 60 + mins + addedMinutes;
      const endH24 = Math.floor(totalMins / 60) % 24;
      const endM = totalMins % 60;
      const endH12 = endH24 % 12 === 0 ? 12 : endH24 % 12;
      const endAmpm = endH24 >= 12 ? 'PM' : 'AM';
      newEndTime = `${endH12}:${endM === 0 ? '00' : endM < 10 ? '0' + endM : endM} ${endAmpm}`;
    } catch {
      newEndTime = `${currentEndTime} +${addedMinutes}m`;
    }

    const newTimeSlot = `${startTime}–${newEndTime}`;

    // Conflict Check: Check if another booking on the same court and date starts before or at this newEndTime
    const conflictingBooking = bookings.find(
      (b) =>
        b.id !== booking.id &&
        b.courtId === booking.courtId &&
        b.date === booking.date &&
        b.status !== 'Cancelled' &&
        b.timeSlot.startsWith(currentEndTime)
    );

    return { addedFee, newTimeSlot, newEndTime, hasConflict: !!conflictingBooking, conflictingBooking };
  };

  return (
    <div className="pb-24 pt-2 px-3.5 sm:px-0 sm:pt-0 w-full space-y-3 sm:space-y-4 select-none">
      {/* ========================================================================= */}
      {/* 1. CENTRALIZED DATE PICKER MODAL (PARTICULAR DATE FILTER)                  */}
      {/* ========================================================================= */}
      <DateMonthPickerSheet
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        title="Filter by Particular Date"
        mode="date"
        themeColor="orange"
        activeSelection={selectedParticularDate}
        onSelect={(val) => {
          setSelectedParticularDate(val);
          setDateFilter('particular');
        }}
      />

      {/* ========================================================================= */}
      {/* 2. TOP HEADER & PRIMARY ACTIONS                                           */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[#E8E6E1]">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-[20px] sm:text-[22px] font-black text-[#171717] tracking-tight leading-tight">
              Bookings
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#171717]/10 text-[#171717]">
              {filteredBookings.length}
            </span>
            {kpis.ongoingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#2FA66A]/15 text-[#2FA66A] inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2FA66A] animate-ping" />
                <span>{kpis.ongoingCount} Live</span>
              </span>
            )}
          </div>
          <p className="text-[11.5px] sm:text-[12px] text-[#777570] font-medium mt-0.5">
            Real-time arena court schedule, player dues & check-ins
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle - Desktop Only (Cards preferred on mobile UX) */}
          <div className="hidden md:flex items-center bg-[#FAF9F6] p-1 rounded-xl border border-[#E8E6E1]">
            <button
              onClick={() => {
                haptics.tap();
                setViewMode('grid');
              }}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-[#171717] shadow-xs'
                  : 'text-[#777570] hover:text-[#171717]'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                haptics.tap();
                setViewMode('table');
              }}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-[#171717] shadow-xs'
                  : 'text-[#777570] hover:text-[#171717]'
              }`}
              title="Structured Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            id="btn-export-bookings"
            onClick={handleOpenExportPage}
            className="h-9 px-3 rounded-xl bg-white border border-[#E8E6E1] text-[#171717] font-bold text-[12px] flex items-center gap-1.5 shadow-2xs hover:bg-[#FAF9F6] active-press cursor-pointer transition-colors"
            title="Export reports"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={() => {
              haptics.tap();
              setActiveModal('new_booking');
            }}
            className="h-9 px-3.5 rounded-xl bg-[#FF6B2C] hover:bg-[#e85b1e] text-white font-black text-[12px] flex items-center gap-1.5 shadow-xs active-press cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. KPI SUMMARY STRIP (DESKTOP 4-GRID + MOBILE HORIZONTAL CAROUSEL)         */}
      {/* ========================================================================= */}
      {/* Desktop View (>= 768px): Spacious 4-Card Grid */}
      <div className="hidden md:grid md:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-3.5 border border-[#E8E6E1] shadow-2xs">
          <div className="flex items-center justify-between text-[#777570] text-[10.5px] font-black uppercase tracking-wider">
            <span>Ongoing Matches</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#2FA66A] animate-ping" />
          </div>
          <p className="text-[20px] font-black text-[#2FA66A] mt-1 leading-none">
            {kpis.ongoingCount} Live
          </p>
          <span className="text-[11px] font-medium text-[#777570] mt-1 block truncate">
            Active on pitches
          </span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-[#E8E6E1] shadow-2xs">
          <div className="flex items-center justify-between text-[#777570] text-[10.5px] font-black uppercase tracking-wider">
            <span>Confirmed</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B2C]" />
          </div>
          <p className="text-[20px] font-black text-[#171717] mt-1 leading-none">
            {kpis.confirmedCount} Bookings
          </p>
          <span className="text-[11px] font-medium text-[#777570] mt-1 block truncate">
            Ready for check-in
          </span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-[#E8E6E1] shadow-2xs">
          <div className="flex items-center justify-between text-[#777570] text-[10.5px] font-black uppercase tracking-wider">
            <span>Pending Balance</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#E7A72F]" />
          </div>
          <p className="text-[20px] font-black text-[#B87C0D] mt-1 leading-none">
            ₹{kpis.totalDue.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] font-medium text-[#777570] mt-1 block truncate">
            Due at counter
          </span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-[#E8E6E1] shadow-2xs">
          <div className="flex items-center justify-between text-[#777570] text-[10.5px] font-black uppercase tracking-wider">
            <span>Timeline</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#171717]" />
          </div>
          <p className="text-[16px] font-black text-[#171717] mt-1 leading-none truncate">
            {dateFilter === 'today'
              ? 'Today'
              : dateFilter === 'tomorrow'
              ? 'Tomorrow'
              : dateFilter === 'upcoming'
              ? 'Upcoming'
              : dateFilter === 'particular'
              ? selectedParticularDate
              : 'All Dates'}
          </p>
          <span className="text-[11px] font-medium text-[#777570] mt-1 block truncate">
            ₹{kpis.totalGross.toLocaleString('en-IN')} gross
          </span>
        </div>
      </div>

      {/* Mobile View (< 768px): Sleek Horizontal Swipeable Stats Strip (Takes only 50px height!) */}
      <div className="flex md:hidden gap-2 overflow-x-auto no-scrollbar py-0.5">
        <div className="bg-white rounded-xl px-3 py-2 border border-[#E8E6E1] shadow-2xs flex items-center gap-2.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#2FA66A] animate-ping" />
          <div>
            <span className="text-[9px] font-extrabold text-[#777570] uppercase block leading-none">Live Match</span>
            <span className="text-[13px] font-black text-[#2FA66A] leading-tight block">{kpis.ongoingCount} Ongoing</span>
          </div>
        </div>

        <div className="bg-white rounded-xl px-3 py-2 border border-[#E8E6E1] shadow-2xs flex items-center gap-2.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#FF6B2C]" />
          <div>
            <span className="text-[9px] font-extrabold text-[#777570] uppercase block leading-none">Confirmed</span>
            <span className="text-[13px] font-black text-[#171717] leading-tight block">{kpis.confirmedCount} Bookings</span>
          </div>
        </div>

        <div className="bg-white rounded-xl px-3 py-2 border border-[#E8E6E1] shadow-2xs flex items-center gap-2.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#E7A72F]" />
          <div>
            <span className="text-[9px] font-extrabold text-[#777570] uppercase block leading-none">Due Balance</span>
            <span className="text-[13px] font-black text-[#B87C0D] leading-tight block">₹{kpis.totalDue.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl px-3 py-2 border border-[#E8E6E1] shadow-2xs flex items-center gap-2.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#171717]" />
          <div>
            <span className="text-[9px] font-extrabold text-[#777570] uppercase block leading-none">Timeline</span>
            <span className="text-[13px] font-black text-[#171717] leading-tight block">
              {dateFilter === 'particular' ? selectedParticularDate : dateFilter === 'all' ? 'All Dates' : dateFilter}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. TOOLBAR & FILTER SYSTEM (DESKTOP INLINE + MOBILE APP FILTER BAR)        */}
      {/* ========================================================================= */}
      {/* DESKTOP TOOLBAR (>= 768px): Full 2-tier Toolbar */}
      <div className="hidden md:block bg-white rounded-2xl p-4 border border-[#E8E6E1] shadow-2xs space-y-3">
        {/* Tier 1: Match Status & Date Timeline */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'All', label: 'All Bookings', count: statusCounts.all },
              { id: 'Ongoing', label: 'Ongoing', count: statusCounts.ongoing, dot: 'bg-[#2FA66A]' },
              { id: 'Confirmed', label: 'Confirmed', count: statusCounts.confirmed },
              { id: 'Payment Pending', label: 'Payment Pending', count: statusCounts.pending, dot: 'bg-[#E7A72F]' },
              { id: 'Completed', label: 'Completed', count: statusCounts.completed },
            ].map((tab) => {
              const isActive = selectedBookingStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    haptics.tap();
                    setSelectedBookingStatus(tab.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-[12px] font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#171717] text-white shadow-xs'
                      : 'bg-[#FAF9F6] text-[#777570] border border-[#E8E6E1] hover:text-[#171717] hover:bg-[#F1F0EC]'
                  }`}
                >
                  {tab.dot && (
                    <span
                      className={`w-2 h-2 rounded-full ${tab.dot} ${
                        tab.id === 'Ongoing' ? 'animate-ping' : ''
                      }`}
                    />
                  )}
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                        isActive ? 'bg-white/20 text-white' : 'bg-[#E8E6E1] text-[#777570]'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
            <div className="flex items-center bg-[#FAF9F6] p-1 rounded-xl border border-[#E8E6E1] shrink-0">
              {[
                { id: 'today', label: 'Today' },
                { id: 'tomorrow', label: 'Tomorrow' },
                { id: 'upcoming', label: 'Upcoming' },
                { id: 'all', label: 'All Dates' },
              ].map((d) => {
                const isActive = dateFilter === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => {
                      haptics.tap();
                      setDateFilter(d.id as DateFilterType);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[12px] transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-white text-[#171717] shadow-xs font-black'
                        : 'text-[#777570] hover:text-[#171717] font-semibold'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                haptics.tap();
                setIsDatePickerOpen(true);
              }}
              className={`h-9 px-3 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                dateFilter === 'particular'
                  ? 'bg-[#FF6B2C] text-white border-[#FF6B2C] shadow-xs font-black'
                  : 'bg-[#FAF9F6] border-[#E8E6E1] text-[#171717] hover:bg-[#F1F0EC] font-bold'
              }`}
              title="Pick a specific date"
            >
              <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[12px] whitespace-nowrap">
                {dateFilter === 'particular' ? selectedParticularDate : 'Pick Date'}
              </span>
            </button>

            {dateFilter === 'particular' && (
              <button
                onClick={() => {
                  haptics.tap();
                  setDateFilter('all');
                }}
                className="w-8 h-8 rounded-xl bg-[#FAF9F6] border border-[#E8E6E1] flex items-center justify-center text-[#777570] hover:text-[#171717] cursor-pointer transition-colors shrink-0"
                title="Reset to All Dates"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="h-px bg-[#F1F0EC] w-full" />

        {/* Tier 2: Search Bar + Sport & Payment Taxonomies */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex items-center bg-[#FAF9F6] border border-[#E8E6E1] focus-within:border-[#171717] focus-within:bg-white rounded-xl px-3.5 py-2 flex-1 w-full md:max-w-md transition-all shadow-2xs">
            <Search className="w-4 h-4 text-[#777570] mr-2.5 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search customer, booking ID, court, sport..."
              className="w-full text-[13px] font-medium text-[#171717] bg-transparent focus:outline-none placeholder-[#A3A099]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="w-5 h-5 rounded-full bg-[#E8E6E1] hover:bg-[#D1CFCA] flex items-center justify-center text-[#777570] hover:text-[#171717] text-[10px] font-bold cursor-pointer transition-colors"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
            <div className="flex items-center bg-[#FAF9F6] p-1 rounded-xl border border-[#E8E6E1] shrink-0">
              <span className="text-[11px] font-bold text-[#777570] px-2">Sport:</span>
              {['All', 'Football', 'Cricket', 'Badminton'].map((sport) => {
                const isActive = selectedSport === sport;
                return (
                  <button
                    key={sport}
                    onClick={() => {
                      haptics.tap();
                      setSelectedSport(sport);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11.5px] transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-white text-[#171717] shadow-xs font-black'
                        : 'text-[#777570] hover:text-[#171717] font-semibold'
                    }`}
                  >
                    {sport}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center bg-[#FAF9F6] p-1 rounded-xl border border-[#E8E6E1] shrink-0">
              <span className="text-[11px] font-bold text-[#777570] px-2">Payment:</span>
              {[
                { id: 'All', label: 'All' },
                { id: 'Paid', label: 'Paid in Full' },
                { id: 'Pending', label: 'Due Balances' },
              ].map((p) => {
                const isActive = selectedPaymentFilter === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      haptics.tap();
                      setSelectedPaymentFilter(p.id);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11.5px] transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-white text-[#171717] shadow-xs font-black'
                        : 'text-[#777570] hover:text-[#171717] font-semibold'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleClearAllFilters}
                className="h-8 px-2.5 rounded-xl bg-[#FAF9F6] hover:bg-red-50 text-[#777570] hover:text-red-700 text-[11px] font-bold border border-[#E8E6E1] hover:border-red-200 flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                title="Reset all filters to default"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE APP TOOLBAR (< 768px): Native Search Bar + 1-Tap Filter Trigger + Fast Status Chips */}
      <div className="block md:hidden space-y-2">
        {/* Row 1: Search Box + Native Filter Sheet Button */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center bg-white border border-[#E8E6E1] focus-within:border-[#FF6B2C] rounded-2xl px-3 py-2 flex-1 shadow-2xs transition-all">
            <Search className="w-4 h-4 text-[#777570] mr-2 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search customer, ID, court..."
              className="w-full text-[13px] font-medium text-[#171717] bg-transparent focus:outline-none placeholder-[#A3A099]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="w-5 h-5 rounded-full bg-[#E8E6E1] flex items-center justify-center text-[#777570] text-[10px] font-bold shrink-0"
              >
                ✕
              </button>
            )}
          </div>

          <button
            id="btn-mobile-filter-open"
            onClick={() => {
              haptics.tap();
              setIsMobileFilterSheetOpen(true);
            }}
            className={`h-10 px-3 rounded-2xl border flex items-center gap-1.5 transition-all shadow-2xs shrink-0 cursor-pointer active-press ${
              activeFiltersCount > 0
                ? 'bg-[#171717] text-white border-[#171717] font-black'
                : 'bg-white text-[#171717] border-[#E8E6E1] hover:bg-[#FAF9F6] font-bold'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="text-[12px]">Filter</span>
            {activeFiltersCount > 0 && (
              <span className="min-w-[17px] h-[17px] px-1 rounded-full bg-[#FF6B2C] text-white text-[9.5px] font-black flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Row 2: 1-Tap Horizontal Status Scroll Pills (Single Row!) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 w-full">
          {[
            { id: 'All', label: 'All', count: statusCounts.all },
            { id: 'Ongoing', label: 'Ongoing', count: statusCounts.ongoing, dot: 'bg-[#2FA66A]' },
            { id: 'Confirmed', label: 'Confirmed', count: statusCounts.confirmed },
            { id: 'Payment Pending', label: 'Due', count: statusCounts.pending, dot: 'bg-[#E7A72F]' },
            { id: 'Completed', label: 'Done', count: statusCounts.completed },
          ].map((tab) => {
            const isActive = selectedBookingStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  haptics.tap();
                  setSelectedBookingStatus(tab.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-[11.5px] font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active-press ${
                  isActive
                    ? 'bg-[#171717] text-white shadow-xs font-black'
                    : 'bg-white text-[#777570] border border-[#E8E6E1]'
                }`}
              >
                {tab.dot && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${tab.dot} ${
                      tab.id === 'Ongoing' ? 'animate-ping' : ''
                    }`}
                  />
                )}
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[9.5px] font-black ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#E8E6E1] text-[#777570]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Row 3: Active Filters Tags Strip (Only visible if extra filters applied) */}
        {(selectedSport !== 'All' || dateFilter !== 'all' || selectedPaymentFilter !== 'All') && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
            <span className="text-[10px] font-bold text-[#777570] shrink-0">Filters:</span>
            {selectedSport !== 'All' && (
              <button
                onClick={() => setSelectedSport('All')}
                className="h-6 px-2 rounded-lg bg-[#FF6B2C]/10 text-[#FF6B2C] text-[10.5px] font-black inline-flex items-center gap-1 border border-[#FF6B2C]/25 shrink-0"
              >
                <span>{selectedSport}</span>
                <X className="w-3 h-3" />
              </button>
            )}
            {dateFilter !== 'all' && (
              <button
                onClick={() => setDateFilter('all')}
                className="h-6 px-2 rounded-lg bg-[#FF6B2C]/10 text-[#FF6B2C] text-[10.5px] font-black inline-flex items-center gap-1 border border-[#FF6B2C]/25 shrink-0"
              >
                <span>{dateFilter === 'particular' ? selectedParticularDate : dateFilter}</span>
                <X className="w-3 h-3" />
              </button>
            )}
            {selectedPaymentFilter !== 'All' && (
              <button
                onClick={() => setSelectedPaymentFilter('All')}
                className="h-6 px-2 rounded-lg bg-[#FF6B2C]/10 text-[#FF6B2C] text-[10.5px] font-black inline-flex items-center gap-1 border border-[#FF6B2C]/25 shrink-0"
              >
                <span>{selectedPaymentFilter === 'Pending' ? 'Due Balances' : 'Paid'}</span>
                <X className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={handleClearAllFilters}
              className="text-[10.5px] font-bold text-[#777570] hover:text-red-600 underline shrink-0 ml-1"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. MAIN CONTENT: STRUCTURED TABLE OR CARD GRID VIEW                       */}
      {/* ========================================================================= */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-[#E8E6E1] text-center space-y-2.5 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF9F6] flex items-center justify-center mx-auto text-[#777570] border border-[#E8E6E1]">
            <CalendarIcon className="w-6 h-6 text-[#FF6B2C]" />
          </div>
          <h3 className="text-[15px] font-black text-[#171717]">No bookings found</h3>
          <p className="text-[12px] text-[#777570] max-w-md mx-auto">
            No bookings match the selected date filter ({dateFilter === 'particular' ? selectedParticularDate : dateFilter}) or search criteria.
          </p>
          <button
            onClick={() => {
              haptics.tap();
              setDateFilter('all');
              setSelectedBookingStatus('All');
              setSelectedPaymentFilter('All');
              setSelectedSport('All');
              setSearchTerm('');
            }}
            className="mt-2 px-4 py-1.5 rounded-xl bg-[#171717] text-white text-[12px] font-bold cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* -------------------------------------------------------------
           GRID VIEW (Sleek Minimal High-Density Cards)
           ------------------------------------------------------------- */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              onClick={() => handleOpenPopup(b)}
              className="bg-white rounded-2xl p-4 border border-[#E8E6E1] shadow-2xs hover:border-[#171717]/40 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
            >
              {/* Header: ID + Dual Status Badges (Booking Status + Payment Status) */}
              <div className="flex items-center justify-between gap-1 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[11px] font-black text-[#171717] bg-[#FAF9F6] px-2 py-0.5 rounded border border-[#E8E6E1]">
                    {b.id}
                  </span>
                  <span className="text-[11.5px] font-bold text-[#777570]">
                    · {b.sport}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {getBookingStatusBadge(b.status, b.holdExpiresInMinutes, b.notes)}
                  {getPaymentStatusBadge(b.paymentStatus, b.balanceAmount)}
                </div>
              </div>

              {/* Customer Avatar & Name */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#171717] text-white font-black text-[13px] flex items-center justify-center shrink-0">
                  {b.customerName.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="text-[14.5px] font-black text-[#171717] tracking-tight truncate group-hover:text-[#FF6B2C] transition-colors">
                    {b.customerName}
                  </h3>
                  <p className="text-[11.5px] text-[#777570] flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-[#FF6B2C] shrink-0" />
                    <span>{b.courtName}</span>
                  </p>
                </div>
              </div>

              {/* Slot Details Box */}
              <div className="bg-[#FAF9F6] rounded-xl p-2.5 border border-[#E8E6E1]/80 text-[11.5px] flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-[#171717]">
                  <Clock className="w-3.5 h-3.5 text-[#FF6B2C]" />
                  <span>{b.timeSlot}</span>
                </div>
                <span className="font-medium text-[#777570]">{b.date}</span>
              </div>

              {/* Footer: Price & Contextual Lifecycle Actions */}
              <div className="pt-2 border-t border-[#F1F0EC] flex items-center justify-between gap-2">
                <div>
                  <span className="text-[15px] font-black text-[#171717] block leading-none">
                    ₹{b.totalAmount.toLocaleString('en-IN')}
                  </span>
                  {b.balanceAmount > 0 ? (
                    <span className="text-[10.5px] font-bold text-[#B87C0D] mt-1 block">
                      Paid ₹{b.paidAmount.toLocaleString('en-IN')} · Due ₹{b.balanceAmount.toLocaleString('en-IN')}
                    </span>
                  ) : (
                    <span className="text-[10.5px] font-semibold text-[#2FA66A] mt-1 block">
                      Fully Settled ({b.paymentMethod || 'Online'})
                    </span>
                  )}
                </div>

                {/* Contextual Action Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {/* LIFECYCLE 1: CONFIRMED BOOKING (COLLECT BALANCE & CHECK IN) */}
                  {b.status === 'Confirmed' && (
                    <>
                      {b.balanceAmount > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            haptics.tap();
                            setSelectedBookingId(b.id);
                            setActiveModal('payment_options');
                          }}
                          className="h-8 px-2.5 rounded-xl bg-[#FF6B2C] hover:bg-[#e85b1e] text-white text-[10.5px] font-black flex items-center gap-1 shadow-2xs active-press cursor-pointer transition-colors whitespace-nowrap"
                          title="Collect remaining balance at counter"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>Collect Due ₹{b.balanceAmount.toLocaleString('en-IN')}</span>
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          haptics.tap();
                          checkInBooking(b.id);
                        }}
                        className="h-8 px-2.5 rounded-xl bg-[#2FA66A] hover:bg-[#258756] text-white text-[11px] font-black flex items-center gap-1 shadow-2xs active-press cursor-pointer transition-colors whitespace-nowrap"
                        title="Check in players on court"
                      >
                        <LogIn className="w-3 h-3" />
                        <span>Check In</span>
                      </button>
                    </>
                  )}

                  {/* LIFECYCLE 2: EXTEND SLOT & CHECK OUT FOR ONGOING MATCHES */}
                  {b.status === 'Ongoing' && (
                    <>
                      {b.balanceAmount > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            haptics.tap();
                            setSelectedBookingId(b.id);
                            setActiveModal('payment_options');
                          }}
                          className="h-8 px-2.5 rounded-xl bg-[#FF6B2C] hover:bg-[#e85b1e] text-white text-[10.5px] font-black flex items-center gap-1 shadow-2xs active-press cursor-pointer transition-colors whitespace-nowrap"
                          title="Collect remaining balance"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>Collect Due ₹{b.balanceAmount.toLocaleString('en-IN')}</span>
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          haptics.tap();
                          setExtendingBooking(b);
                          setExtensionMinutes(null);
                        }}
                        className="h-8 px-2 rounded-xl bg-[#171717] hover:bg-[#2e2e2e] text-white text-[11px] font-black flex items-center gap-1 shadow-2xs active-press cursor-pointer transition-colors whitespace-nowrap"
                        title="Extend match duration"
                      >
                        <Clock className="w-3 h-3 text-[#FF6B2C]" />
                        <span>+ Extend</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          haptics.tap();
                          checkOutBooking(b.id);
                        }}
                        className="h-8 px-2.5 rounded-xl bg-[#2FA66A] hover:bg-[#258756] text-white text-[11px] font-black flex items-center gap-1 shadow-2xs active-press cursor-pointer transition-colors whitespace-nowrap"
                        title="Check out and finish session"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>Check Out</span>
                      </button>
                    </>
                  )}

                  {/* ACTIVE PAYMENT PENDING (HOLD ACTIVE) -> VIEW / SEND PAYMENT LINK */}
                  {b.status === 'Payment Pending' && !isBookingExpired(b) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        haptics.tap();
                        if (isPaymentLinkBlocked(b.id)) {
                          const sec = getPaymentLinkTimeRemaining(b.id);
                          showToast('Payment Link Active', `Link is valid for 15 mins. Button blocked for ${formatMinutesSeconds(sec)}.`, 'info');
                          return;
                        }
                        sendPaymentLink(b.id);
                      }}
                      className={`h-8 px-2.5 rounded-xl border text-[10.5px] font-bold flex items-center gap-1 shadow-2xs whitespace-nowrap transition-colors ${
                        isPaymentLinkBlocked(b.id)
                          ? 'bg-amber-50 border-amber-300 text-amber-800 cursor-not-allowed'
                          : 'bg-white border-[#FF6B2C]/40 hover:bg-[#FAF9F6] text-[#FF6B2C] active-press cursor-pointer'
                      }`}
                      title={isPaymentLinkBlocked(b.id) ? `Link active (Valid for ${formatMinutesSeconds(getPaymentLinkTimeRemaining(b.id))})` : "Send payment link"}
                    >
                      {isPaymentLinkBlocked(b.id) ? (
                        <>
                          <Lock className="w-3 h-3 text-amber-600" />
                          <span>Sent ({formatMinutesSeconds(getPaymentLinkTimeRemaining(b.id))})</span>
                        </>
                      ) : (
                        <>
                          <Link2 className="w-3 h-3" />
                          <span>Send Link</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* LIFECYCLE 3: EXPIRED SLOT (RE-LOCK & SEND FRESH LINK) */}
                  {isBookingExpired(b) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        haptics.tap();
                        handleOpenPopup(b);
                      }}
                      className="h-8 px-2.5 rounded-xl bg-[#FF6B2C] hover:bg-[#e85b1e] text-white text-[10.5px] font-black flex items-center gap-1 shadow-2xs active-press cursor-pointer transition-colors whitespace-nowrap"
                      title="Re-lock slot with new hold time"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Re-lock</span>
                    </button>
                  )}

                  {/* DETAILS BUTTON */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenPopup(b);
                    }}
                    className="h-8 px-2.5 rounded-xl bg-[#FAF9F6] hover:bg-[#F1F0EC] border border-[#E8E6E1] text-[#171717] text-[11px] font-bold flex items-center gap-0.5 active-press cursor-pointer transition-colors"
                  >
                    <span>Details</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* -------------------------------------------------------------
           TABLE LIST VIEW (High-Density Structured 5-Column Ledger)
           ------------------------------------------------------------- */
        <div className="bg-white rounded-2xl border border-[#E8E6E1] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <div className="min-w-[1020px]">
              {/* Structured Column Header */}
              <div className="grid grid-cols-[minmax(230px,2fr)_minmax(150px,1.2fr)_minmax(120px,1fr)_minmax(180px,1.3fr)_minmax(290px,2.2fr)] items-center px-4 py-3 bg-[#FAF9F6] border-b border-[#E8E6E1] text-[10.5px] font-black text-[#777570] uppercase tracking-wider">
                <div>Customer & Court</div>
                <div>Slot & Date</div>
                <div>Total (Paid)</div>
                <div>Booking & Payment Status</div>
                <div className="text-right pr-1">Actions</div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-[#F1F0EC]">
                {filteredBookings.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => handleOpenPopup(b)}
                    className="grid grid-cols-[minmax(230px,2fr)_minmax(150px,1.2fr)_minmax(120px,1fr)_minmax(180px,1.3fr)_minmax(290px,2.2fr)] items-center px-4 py-3 hover:bg-[#FAF9F6]/80 transition-colors cursor-pointer group"
                  >
                    {/* Column 1: Customer & Court */}
                    <div className="flex items-center gap-3 min-w-0 pr-3">
                      <div className="w-10 h-10 rounded-xl bg-[#171717] text-white flex items-center justify-center font-black text-[13px] shrink-0 shadow-2xs">
                        {b.customerName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-[13.5px] font-black text-[#171717] tracking-tight truncate group-hover:text-[#FF6B2C] transition-colors">
                            {b.customerName}
                          </h3>
                          <span className="font-mono text-[10px] font-bold text-[#777570] bg-[#FAF9F6] px-1.5 py-0.5 rounded border border-[#E8E6E1]">
                            {b.id}
                          </span>
                        </div>
                        <p className="text-[11.5px] text-[#777570] mt-0.5 truncate font-medium">
                          {b.sport} · {b.courtName}
                        </p>
                      </div>
                    </div>

                    {/* Column 2: Slot & Date */}
                    <div className="text-[12px] pr-2">
                      <div className="flex items-center gap-1.5 text-[#171717] font-bold">
                        <Clock className="w-3.5 h-3.5 text-[#FF6B2C] shrink-0" />
                        <span className="whitespace-nowrap">{b.timeSlot}</span>
                      </div>
                      <span className="text-[10.5px] text-[#777570] font-medium block mt-0.5">
                        {b.date}
                      </span>
                    </div>

                    {/* Column 3: Amount (Paid / Due) */}
                    <div className="text-left pr-2">
                      <p className="text-[14.5px] font-black text-[#171717] leading-none">
                        ₹{b.totalAmount.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[11px] font-medium mt-1">
                        {b.balanceAmount > 0 ? (
                          <span className="text-[#B87C0D] font-bold">
                            Due: ₹{b.balanceAmount.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-[#2FA66A] font-bold">
                            Paid: ₹{b.paidAmount.toLocaleString('en-IN')}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Column 4: Dual Status Column (Booking Status + Payment Status) */}
                    <div className="flex flex-col items-start justify-center gap-1">
                      {getBookingStatusBadge(b.status, b.holdExpiresInMinutes, b.notes)}
                      {getPaymentStatusBadge(b.paymentStatus, b.balanceAmount)}
                    </div>

                    {/* Column 5: Actions (Single-line Contextual Lifecycle Actions) */}
                    <div className="flex items-center justify-end gap-1.5 flex-nowrap shrink-0">
                      {b.status === 'Confirmed' && (
                        <>
                          {b.balanceAmount > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                haptics.tap();
                                setSelectedBookingId(b.id);
                                setActiveModal('payment_options');
                              }}
                              className="h-8 px-2.5 rounded-xl bg-[#FF6B2C] hover:bg-[#e85b1e] text-white text-[10.5px] font-black flex items-center gap-1 shadow-2xs active-press cursor-pointer transition-colors whitespace-nowrap shrink-0"
                              title="Collect remaining balance at counter"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Collect Due ₹{b.balanceAmount.toLocaleString('en-IN')}</span>
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              haptics.tap();
                              checkInBooking(b.id);
                            }}
                            className="h-8 px-2.5 rounded-xl bg-[#2FA66A] hover:bg-[#258756] text-white text-[11px] font-black flex items-center gap-1 shadow-2xs active-press cursor-pointer transition-colors whitespace-nowrap shrink-0"
                          >
                            <LogIn className="w-3 h-3" />
                            <span>Check In</span>
                          </button>
                        </>
                      )}

                      {b.status === 'Ongoing' && (
                        <>
                          {b.balanceAmount > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                haptics.tap();
                                setSelectedBookingId(b.id);
                                setActiveModal('payment_options');
                              }}
                              className="h-8 px-2.5 rounded-xl bg-[#FF6B2C] hover:bg-[#e85b1e] text-white text-[10.5px] font-black flex items-center gap-1 shadow-2xs active-press cursor-pointer transition-colors whitespace-nowrap shrink-0"
                              title="Collect remaining balance"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Collect Due ₹{b.balanceAmount.toLocaleString('en-IN')}</span>
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              haptics.tap();
                              setExtendingBooking(b);
                              setExtensionMinutes(null);
                            }}
                            className="h-8 px-2.5 rounded-xl bg-[#171717] hover:bg-[#2e2e2e] text-white text-[11px] font-black flex items-center gap-1 shadow-2xs active-press cursor-pointer transition-colors whitespace-nowrap shrink-0"
                            title="Extend Slot"
                          >
                            <Clock className="w-3 h-3 text-[#FF6B2C]" />
                            <span>Extend</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              haptics.tap();
                              checkOutBooking(b.id);
                            }}
                            className="h-8 px-2.5 rounded-xl bg-[#2FA66A] hover:bg-[#258756] text-white text-[11px] font-black flex items-center gap-1 shadow-2xs active-press cursor-pointer transition-colors whitespace-nowrap shrink-0"
                          >
                            <LogOut className="w-3 h-3" />
                            <span>Check Out</span>
                          </button>
                        </>
                      )}

                      {/* ACTIVE PAYMENT PENDING (HOLD ACTIVE) -> VIEW / SEND PAYMENT LINK */}
                      {b.status === 'Payment Pending' && !isBookingExpired(b) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            haptics.tap();
                            if (isPaymentLinkBlocked(b.id)) {
                              const sec = getPaymentLinkTimeRemaining(b.id);
                              showToast('Payment Link Active', `Link is valid for 15 mins. Button blocked for ${formatMinutesSeconds(sec)}.`, 'info');
                              return;
                            }
                            sendPaymentLink(b.id);
                          }}
                          className={`h-8 px-2.5 rounded-xl border text-[10.5px] font-bold flex items-center gap-1 shadow-2xs whitespace-nowrap shrink-0 transition-colors ${
                            isPaymentLinkBlocked(b.id)
                              ? 'bg-amber-50 border-amber-300 text-amber-800 cursor-not-allowed'
                              : 'bg-white border-[#FF6B2C]/40 hover:bg-[#FAF9F6] text-[#FF6B2C] active-press cursor-pointer'
                          }`}
                          title={isPaymentLinkBlocked(b.id) ? `Link active (Valid for ${formatMinutesSeconds(getPaymentLinkTimeRemaining(b.id))})` : "Send payment link"}
                        >
                          {isPaymentLinkBlocked(b.id) ? (
                            <>
                              <Lock className="w-3 h-3 text-amber-600" />
                              <span>Sent ({formatMinutesSeconds(getPaymentLinkTimeRemaining(b.id))})</span>
                            </>
                          ) : (
                            <>
                              <Link2 className="w-3 h-3" />
                              <span>Send Link</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* EXPIRED SLOT -> RE-LOCK */}
                      {isBookingExpired(b) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            haptics.tap();
                            handleOpenPopup(b);
                          }}
                          className="h-8 px-2.5 rounded-xl bg-[#FF6B2C] hover:bg-[#e85b1e] text-white text-[10.5px] font-black flex items-center gap-1 shadow-2xs active-press cursor-pointer transition-colors whitespace-nowrap shrink-0"
                          title="Re-lock slot with custom timer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Re-lock</span>
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPopup(b);
                        }}
                        className="h-8 px-2.5 rounded-xl bg-[#FAF9F6] hover:bg-[#F1F0EC] border border-[#E8E6E1] text-[#171717] text-[11px] font-bold active-press cursor-pointer transition-colors flex items-center gap-1 shrink-0 whitespace-nowrap"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. EXTEND SLOT DRAWER / MODAL (User Requested: Extend slot & add balance)  */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {extendingBooking && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-xs select-none">
            <div className="absolute inset-0" onClick={() => setExtendingBooking(null)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-t-[32px] md:rounded-3xl p-5 md:p-6 border border-[#E8E6E1] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto pb-safe"
            >
              {/* Mobile Sheet Drag Handle */}
              <div className="w-10 h-1 rounded-full bg-[#D4D2CD] mx-auto mb-2 md:hidden" />

              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F0EC]">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#FF6B2C]/10 text-[#FF6B2C] flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-[16px] font-black text-[#171717]">Extend Court Slot</h2>
                    <p className="text-[11.5px] text-[#777570] font-medium">
                      Booking #{extendingBooking.id} · {extendingBooking.courtName}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setExtendingBooking(null)}
                  className="w-8 h-8 rounded-full bg-[#F1F0EC] flex items-center justify-center text-[#777570] hover:text-[#171717] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Current Match Details */}
              <div className="bg-[#FAF9F6] p-3 rounded-2xl border border-[#E8E6E1] text-[12px] space-y-1">
                <div className="flex justify-between text-[#777570]">
                  <span>Customer:</span>
                  <strong className="text-[#171717]">{extendingBooking.customerName}</strong>
                </div>
                <div className="flex justify-between text-[#777570]">
                  <span>Current Schedule:</span>
                  <strong className="text-[#171717]">{extendingBooking.timeSlot} ({extendingBooking.date})</strong>
                </div>
                <div className="flex justify-between text-[#777570]">
                  <span>Current Fee / Balance:</span>
                  <span>
                    ₹{extendingBooking.totalAmount.toLocaleString('en-IN')} (Due: <strong className="text-[#B87C0D]">₹{extendingBooking.balanceAmount.toLocaleString('en-IN')}</strong>)
                  </span>
                </div>
              </div>

              {/* Dynamic Available Slots Calculation */}
              {(() => {
                const court = courts.find((c) => c.id === extendingBooking.courtId || c.name === extendingBooking.courtName);
                const extData = getAvailableExtensionSlots(extendingBooking, bookings, court);
                const activeOption = extensionMinutes !== null
                  ? extData.availableOptions.find((o) => o.addedMinutes === extensionMinutes) || null
                  : null;

                return (
                  <div className="space-y-3">
                    {/* If next slot is booked immediately */}
                    {extData.hasConflict ? (
                      <div className="space-y-3">
                        {/* Visual Timeline Showing Conflict */}
                        <div className="bg-[#FAF9F6] border border-[#E8E6E1] rounded-2xl p-3 space-y-2.5">
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="text-[#777570] uppercase tracking-wider flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-[#FF6B2C]" />
                              Pitch Schedule Timeline
                            </span>
                            <span className="text-[#D94B4B] flex items-center gap-1 font-extrabold">
                              <Ban className="w-3 h-3" /> Conflict Detected
                            </span>
                          </div>

                          <div className="overflow-x-auto no-scrollbar py-1">
                            <div className="flex items-center gap-2 min-w-max">
                              {/* Current Match */}
                              <div className="bg-[#171717] text-white px-3.5 py-2.5 rounded-xl flex flex-col items-center justify-center min-w-[120px] shadow-2xs">
                                <span className="text-[9px] font-black uppercase tracking-wider text-[#FF9D66] bg-white/10 px-1.5 py-0.5 rounded-full mb-0.5">
                                  Current Match
                                </span>
                                <span className="text-[12px] font-black">{extendingBooking.timeSlot}</span>
                                <span className="text-[9.5px] text-[#A3A099] max-w-[110px] truncate">{extendingBooking.customerName}</span>
                              </div>

                              <ArrowRight className="w-4 h-4 text-[#A3A099] shrink-0" />

                              {/* Conflicting booked block */}
                              <div className="bg-[#D94B4B]/10 border-2 border-[#D94B4B] text-[#D94B4B] px-3.5 py-2.5 rounded-xl flex flex-col items-center justify-center min-w-[130px] shadow-2xs">
                                <span className="text-[9px] font-black uppercase tracking-wider bg-[#D94B4B] text-white px-1.5 py-0.5 rounded-full mb-0.5 flex items-center gap-1">
                                  <Ban className="w-2.5 h-2.5" /> Booked
                                </span>
                                <span className="text-[12px] font-black text-[#B52B2B]">
                                  {extData.conflictingBooking?.timeSlot || 'Next Slot'}
                                </span>
                                <span className="text-[9.5px] text-[#8A1A1A] font-bold max-w-[120px] truncate">
                                  {extData.conflictingBooking?.customerName || 'Other Customer'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-[#D94B4B]/10 border border-[#D94B4B]/30 rounded-2xl p-3.5 text-[12px] text-[#B52B2B] space-y-1">
                          <p className="font-black flex items-center gap-2 text-[12.5px]">
                            <AlertTriangle className="w-4 h-4 shrink-0 text-[#D94B4B]" />
                            <span>Court Extension Blocked</span>
                          </p>
                          <p className="text-[11.5px] leading-relaxed text-[#8A1A1A]">
                            {extData.conflictMessage || 'Next slot on this court is already booked by another customer. Court cannot be extended.'}
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled
                          className="w-full h-11 rounded-2xl bg-[#F1F0EC] text-[#A09D96] font-black text-[12.5px] flex items-center justify-center gap-2 cursor-not-allowed border border-[#E8E6E1]"
                        >
                          <Ban className="w-4 h-4 text-[#D94B4B]" />
                          <span>Extension Unavailable (Next Slot Occupied)</span>
                        </button>
                      </div>
                    ) : extData.availableOptions.length === 0 ? (
                      <div className="space-y-3">
                        <div className="bg-[#FAF9F6] border border-[#E8E6E1] rounded-2xl p-4 text-[12px] text-[#777570] text-center space-y-1">
                          <p className="font-black text-[#D94B4B] flex items-center justify-center gap-1.5 text-[13px]">
                            <Ban className="w-4 h-4" />
                            <span>Extension Not Allowed</span>
                          </p>
                          <p className="text-[11.5px]">Court operating hours have ended after current match schedule.</p>
                        </div>
                        <button
                          type="button"
                          disabled
                          className="w-full h-11 rounded-2xl bg-[#F1F0EC] text-[#A09D96] font-black text-[12.5px] flex items-center justify-center gap-2 cursor-not-allowed border border-[#E8E6E1]"
                        >
                          <Ban className="w-4 h-4 text-[#D94B4B]" />
                          <span>Extension Not Allowed (Operating Hours Ended)</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-[#777570] uppercase tracking-wider flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#FF6B2C]" />
                            Timeline Slot Extension
                          </span>
                          <span className="text-[10.5px] text-[#2FA66A] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {extData.availableOptions.length} Slots Available
                          </span>
                        </div>

                        {/* Interactive Timeline Track Card */}
                        <div className="bg-[#FAF9F6] border border-[#E8E6E1] rounded-2xl p-3 space-y-2.5">
                          {/* Legend & Header */}
                          <div className="flex items-center justify-between text-[9.5px] text-[#777570] font-bold pb-1 border-b border-[#E8E6E1]">
                            <span>Court Pitch Schedule Track</span>
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-[#171717]" /> Current
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-[#FF6B2C]" /> Extended
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-[#2FA66A]" /> Available
                              </span>
                            </div>
                          </div>

                          {/* Scrollable Timeline */}
                          <div className="overflow-x-auto no-scrollbar py-1">
                            <div className="flex items-center gap-2 min-w-max">
                              {/* Pinned Current Match */}
                              <div className="bg-[#171717] text-white px-3 py-2.5 rounded-2xl flex flex-col items-center justify-center min-w-[115px] shadow-xs select-none shrink-0">
                                <span className="text-[8.5px] font-black uppercase tracking-wider text-[#FF9D66] bg-white/10 px-1.5 py-0.5 rounded-full mb-1">
                                  Current Match
                                </span>
                                <span className="text-[12px] font-black leading-tight text-white">
                                  {extendingBooking.timeSlot}
                                </span>
                                <span className="text-[9.5px] text-[#A3A099] mt-0.5 max-w-[105px] truncate">
                                  {extendingBooking.customerName.split(' ')[0]}
                                </span>
                              </div>

                              <ArrowRight className="w-3.5 h-3.5 text-[#A3A099] shrink-0" />

                              {/* Available Extension Slot Segments */}
                              {extData.availableOptions.map((opt) => {
                                const isSelected = extensionMinutes !== null && opt.addedMinutes <= extensionMinutes;
                                const isTargetEnd = extensionMinutes === opt.addedMinutes;

                                return (
                                  <button
                                    key={opt.addedMinutes}
                                    type="button"
                                    onClick={() => {
                                      haptics.tap();
                                      if (extensionMinutes === opt.addedMinutes) {
                                        setExtensionMinutes(null);
                                      } else {
                                        setExtensionMinutes(opt.addedMinutes);
                                      }
                                    }}
                                    className={`px-3 py-2.5 rounded-2xl text-center transition-all shrink-0 flex flex-col items-center justify-center min-w-[108px] cursor-pointer select-none ${
                                      isSelected
                                        ? 'bg-gradient-to-r from-[#FF6B2C] to-[#FA5A14] text-white shadow-md ring-2 ring-[#FF6B2C]/40 active:scale-95'
                                        : 'bg-white border-2 border-dashed border-[#2FA66A]/40 hover:border-[#FF6B2C] hover:bg-[#FFF8F5] text-[#171717] shadow-2xs active:scale-95'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1 mb-0.5">
                                      <span className={`text-[11px] font-black ${isSelected ? 'text-white' : 'text-[#171717]'}`}>
                                        +{opt.addedHours}h
                                      </span>
                                      {isTargetEnd && (
                                        <span className="w-3.5 h-3.5 rounded-full bg-white text-[#FF6B2C] flex items-center justify-center text-[9px] font-black">
                                          ✓
                                        </span>
                                      )}
                                    </div>
                                    <span className={`text-[11px] font-bold leading-tight ${isSelected ? 'text-white/95' : 'text-[#55534E]'}`}>
                                      until {opt.stepEndTime}
                                    </span>
                                    <div className="flex items-center gap-1.5 mt-1">
                                      <span className={`text-[11px] font-black ${isSelected ? 'text-[#FFE4D6]' : 'text-[#FF6B2C]'}`}>
                                        +₹{opt.addedFee.toLocaleString('en-IN')}
                                      </span>
                                      <span className={`text-[8.5px] font-bold uppercase tracking-wider px-1 py-0.2 rounded ${
                                        isSelected ? 'bg-white/20 text-white' : 'bg-[#2FA66A]/10 text-[#2FA66A]'
                                      }`}>
                                        {isSelected ? 'Selected' : 'Add'}
                                      </span>
                                    </div>
                                  </button>
                                );
                              })}

                              {/* Next occupied block if scanned hit a booked slot */}
                              {extData.nextOccupiedBooking && (
                                <>
                                  <ArrowRight className="w-3.5 h-3.5 text-[#A3A099] shrink-0" />
                                  <div className="bg-[#ECEAE4] border border-[#D5D3CC] text-[#777570] px-3 py-2.5 rounded-2xl shrink-0 min-w-[110px] flex flex-col items-center justify-center opacity-75 select-none">
                                    <span className="text-[8.5px] font-bold uppercase tracking-wider text-[#D94B4B] bg-[#D94B4B]/10 px-1.5 py-0.5 rounded-full mb-0.5">
                                      Booked
                                    </span>
                                    <span className="text-[11px] font-bold text-[#44423E]">
                                      {extData.nextOccupiedTime}
                                    </span>
                                    <span className="text-[9px] text-[#777570] truncate max-w-[100px]">
                                      {extData.nextOccupiedBooking.customerName.split(' ')[0]}
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Quick Selection Pills */}
                          <div className="pt-2 border-t border-[#E8E6E1] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                            <span className="text-[10px] font-extrabold text-[#777570] uppercase tracking-wider shrink-0 mr-0.5">
                              Quick Add:
                            </span>
                            {extData.availableOptions.map((opt) => {
                              const isTarget = extensionMinutes === opt.addedMinutes;
                              return (
                                <button
                                  key={`quick-${opt.addedMinutes}`}
                                  type="button"
                                  onClick={() => {
                                    haptics.tap();
                                    setExtensionMinutes(isTarget ? null : opt.addedMinutes);
                                  }}
                                  className={`px-2.5 py-1 rounded-full text-[10.5px] font-black shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                                    isTarget
                                      ? 'bg-[#171717] text-white shadow-2xs'
                                      : 'bg-white border border-[#E8E6E1] text-[#55534E] hover:border-[#FF6B2C] hover:text-[#FF6B2C]'
                                  }`}
                                >
                                  <span>+{opt.addedHours}h</span>
                                  <span className={isTarget ? 'text-[#FF9D66]' : 'text-[#777570]'}>
                                    (+₹{opt.addedFee.toLocaleString('en-IN')})
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Tip or Summary */}
                        {!activeOption ? (
                          <div className="bg-[#FFF8E6] border border-[#FFE082] rounded-xl p-2.5 text-[11.5px] text-[#8C6B00] flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 text-[#E65100] mt-0.5" />
                            <span>
                              <strong>Timeline Selection Required:</strong> Tap a slot on the timeline above or pick a Quick Add preset to extend this court match.
                            </span>
                          </div>
                        ) : (
                          <div className="bg-[#FAF9F6] p-3 rounded-2xl border border-[#E8E6E1] space-y-1.5 text-[12px] animate-in fade-in duration-200">
                            <div className="flex justify-between text-[#777570]">
                              <span>New Match Timing:</span>
                              <strong className="text-[#171717] font-black">{activeOption.newFullTimeSlot}</strong>
                            </div>
                            <div className="flex justify-between text-[#777570]">
                              <span>Extension Added:</span>
                              <strong className="text-[#171717]">+{activeOption.addedHours} Hour{activeOption.addedHours !== 1 ? 's' : ''}</strong>
                            </div>
                            <div className="flex justify-between text-[#777570]">
                              <span>Additional Fee:</span>
                              <strong className="text-[#FF6B2C]">+₹{activeOption.addedFee.toLocaleString('en-IN')}</strong>
                            </div>
                            <div className="pt-1.5 border-t border-[#E8E6E1] flex justify-between items-baseline">
                              <span className="font-bold text-[#171717]">New Balance Due:</span>
                              <span className="text-[16px] font-black text-[#B87C0D]">
                                ₹{(extendingBooking.balanceAmount + activeOption.addedFee).toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Action button */}
                        <button
                          type="button"
                          disabled={!activeOption}
                          onClick={() => {
                            if (activeOption) {
                              haptics.success();
                              extendBookingSlot(
                                extendingBooking.id,
                                activeOption.addedMinutes,
                                activeOption.addedFee,
                                activeOption.newFullTimeSlot
                              );
                              setExtendingBooking(null);
                            }
                          }}
                          className={`w-full h-11 rounded-2xl font-black text-[13px] flex items-center justify-center gap-2 shadow-xs transition-all ${
                            activeOption
                              ? 'bg-gradient-to-r from-[#FF6B2C] to-[#FA5A14] hover:brightness-105 text-white cursor-pointer shadow-md'
                              : 'bg-[#E8E6E1] text-[#777570] border border-[#D5D3CC] cursor-not-allowed'
                          }`}
                        >
                          {activeOption ? (
                            <>
                              <Check className="w-4 h-4 stroke-[3]" />
                              <span>
                                Confirm Extension to {activeOption.stepEndTime} (+₹{activeOption.addedFee.toLocaleString('en-IN')})
                              </span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-4 h-4 text-[#777570]" />
                              <span>Select Extension Slot on Timeline (Required)</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 7. BOOKING DETAILS POPUP MODAL (User Requested: In-place Popup Dialog)     */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {activePopupBooking && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-xs select-none">
            <div className="absolute inset-0" onClick={() => setSelectedPopupBooking(null)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-t-[32px] md:rounded-3xl p-5 md:p-6 border border-[#E8E6E1] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar pb-safe"
            >
              {/* Mobile Sheet Drag Handle */}
              <div className="w-10 h-1 rounded-full bg-[#D4D2CD] mx-auto mb-2 md:hidden" />

              {/* Modal Top Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F0EC]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[14px] font-black text-[#171717] bg-[#FAF9F6] px-2 py-0.5 rounded-lg border border-[#E8E6E1]">
                    #{activePopupBooking.id}
                  </span>
                  <span className="text-[11px] text-[#777570] font-medium">
                    {activePopupBooking.createdAt}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {getBookingStatusBadge(activePopupBooking.status, activePopupBooking.holdExpiresInMinutes, activePopupBooking.notes)}
                  {getPaymentStatusBadge(activePopupBooking.paymentStatus, activePopupBooking.balanceAmount)}
                  <button
                    onClick={() => setSelectedPopupBooking(null)}
                    className="w-8 h-8 rounded-full bg-[#F1F0EC] flex items-center justify-center text-[#777570] hover:text-[#171717] cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Customer Contact Card */}
              <div className="bg-[#FAF9F6] rounded-2xl p-3.5 border border-[#E8E6E1] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#171717] text-white font-black text-[14px] flex items-center justify-center">
                    {activePopupBooking.customerName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-[15px] font-black text-[#171717]">
                      {activePopupBooking.customerName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[12px] text-[#777570] font-medium mt-0.5">
                      <span>{activePopupBooking.customerPhone}</span>
                      <button
                        onClick={() => copyPhone(activePopupBooking.customerPhone)}
                        className="text-[#777570] hover:text-[#171717] cursor-pointer"
                        title="Copy Phone"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <a
                    href={`tel:${activePopupBooking.customerPhone}`}
                    onClick={() => haptics.tap()}
                    className="w-9 h-9 rounded-xl bg-white border border-[#E8E6E1] flex items-center justify-center text-[#171717] hover:bg-[#171717] hover:text-white transition-all shadow-2xs cursor-pointer"
                    title="Call Customer"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Match & Court Information */}
              <div className="bg-white rounded-2xl p-3.5 border border-[#E8E6E1] shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-[#777570] uppercase tracking-wider">
                    Court & Slot Details
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10.5px] font-black bg-[#FF6B2C]/10 text-[#FF6B2C]">
                    {activePopupBooking.sport}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[12px]">
                  <div className="space-y-0.5">
                    <span className="text-[#777570] text-[10.5px] font-medium block">Venue Pitch</span>
                    <span className="font-bold text-[#171717] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#FF6B2C]" />
                      {activePopupBooking.courtName}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[#777570] text-[10.5px] font-medium block">Reserved Date</span>
                    <span className="font-bold text-[#171717] flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5 text-[#2FA66A]" />
                      {activePopupBooking.date}
                    </span>
                  </div>

                  <div className="col-span-2 pt-2 border-t border-[#F1F0EC] space-y-0.5">
                    <span className="text-[#777570] text-[10.5px] font-medium block">Time Slot</span>
                    <span className="font-bold text-[#171717] text-[13px] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#FF6B2C]" />
                      {activePopupBooking.timeSlot}
                    </span>
                  </div>
                </div>

                {activePopupBooking.notes && (
                  <div className="bg-[#FAF9F6] p-2.5 rounded-xl text-[11.5px] text-[#777570] border border-[#E8E6E1]">
                    <strong className="text-[#171717]">Booking Note:</strong> {activePopupBooking.notes}
                  </div>
                )}
              </div>

              {/* Financial Breakdown Card */}
              <div className="bg-white rounded-2xl p-3.5 border border-[#E8E6E1] shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-[#777570] uppercase tracking-wider">
                    Payment Breakdown
                  </span>
                  <button
                    onClick={() => {
                      haptics.success();
                      exportSingleBookingReceipt(activePopupBooking);
                      showToast('Receipt Generated', `Invoice #${activePopupBooking.id} downloaded`, 'success');
                    }}
                    className="text-[11px] font-bold text-[#2FA66A] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Invoice</span>
                  </button>
                </div>

                {(() => {
                  const fin = calculateBookingFinancials(activePopupBooking.totalAmount);
                  return (
                    <div className="space-y-1.5 text-[11.5px]">
                      <div className="flex justify-between text-[#777570]">
                        <span>Base Court Cost:</span>
                        <strong className="text-[#171717]">₹{fin.baseCourtCost.toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="flex justify-between text-[#777570]">
                        <span>Venue GST (18%):</span>
                        <strong className="text-[#171717]">₹{fin.courtGst18.toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="flex justify-between text-[#171717] font-bold bg-[#FAF9F6] p-1.5 rounded-lg border border-[#E8E6E1]">
                        <span>Total Turf Price (Venue):</span>
                        <span>₹{fin.courtTotal.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-[#777570] pt-0.5">
                        <span>Platform Convenience Fee (5%):</span>
                        <strong className="text-[#B87C0D]">+₹{fin.convenienceFee5Percent.toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="flex justify-between text-[#777570]">
                        <span>Convenience GST (18% on fee):</span>
                        <strong className="text-[#B87C0D]">+₹{fin.convenienceGst18Percent.toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="flex justify-between text-[#777570]">
                        <span>Amount Paid ({activePopupBooking.paymentMethod || 'Online'}):</span>
                        <strong className="text-[#2FA66A]">₹{activePopupBooking.paidAmount.toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="pt-1.5 border-t border-[#F1F0EC] flex justify-between items-baseline">
                        <span className="font-bold text-[#171717]">Balance Due at Counter:</span>
                        <span
                          className={`text-[17px] font-black ${
                            activePopupBooking.balanceAmount > 0 ? 'text-[#B87C0D]' : 'text-[#2FA66A]'
                          }`}
                        >
                          ₹{activePopupBooking.balanceAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Status Notice Banner */}
                {activePopupBooking.status === 'Payment Pending' && !isBookingExpired(activePopupBooking) ? (
                  <div className="bg-[#E7A72F]/10 border border-[#E7A72F]/30 rounded-xl p-2.5 text-center">
                    <span className="text-[11px] font-black text-[#B87C0D] uppercase tracking-wider block">
                      PAYMENT LINK ACTIVE · {activePopupBooking.holdExpiresInMinutes || 15} MIN HOLD
                    </span>
                    <span className="text-[10px] text-[#777570] block mt-0.5">
                      Online payment link sent to customer. Status auto-updates to Confirmed once paid.
                    </span>
                  </div>
                ) : isBookingExpired(activePopupBooking) ? (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 text-center">
                    <span className="text-[11px] font-black text-red-700 uppercase tracking-wider block">
                      HOLD EXPIRED (UNPAID)
                    </span>
                    <span className="text-[10px] text-red-600 block mt-0.5">
                      Hold period expired. Re-lock below to issue a fresh valid link.
                    </span>
                  </div>
                ) : activePopupBooking.balanceAmount > 0 ? (
                  <div className="bg-[#E7A72F]/10 border border-[#E7A72F]/30 rounded-xl p-2.5 text-center">
                    <span className="text-[11px] font-black text-[#B87C0D] uppercase tracking-wider block">
                      OUTSTANDING BALANCE ₹{activePopupBooking.balanceAmount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-[#777570] block mt-0.5">
                      Must be collected at counter via UPI QR or Cash before match completion
                    </span>
                  </div>
                ) : (
                  <div className="bg-[#2FA66A]/10 border border-[#2FA66A]/30 rounded-xl p-2.5 text-center">
                    <span className="text-[11px] font-black text-[#1E774A] uppercase tracking-wider flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      FULL PAYMENT SETTLED
                    </span>
                    <span className="text-[10px] text-[#777570] block mt-0.5">
                      Customer verified for immediate court entry
                    </span>
                  </div>
                )}
              </div>

              {/* ACTIVE PAYMENT LINK HOLD (When Status is Payment Pending) */}
              {activePopupBooking.status === 'Payment Pending' && !isBookingExpired(activePopupBooking) && (
                <div className="space-y-2 pt-1 border-t border-[#F1F0EC]">
                  <div className="bg-[#E7A72F]/10 border border-[#E7A72F]/30 rounded-2xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11.5px] font-black text-[#B87C0D] uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#B87C0D]" />
                        Payment Link Sent · Hold Active ({activePopupBooking.holdExpiresInMinutes || 15}m)
                      </span>
                      <span className="text-[11px] font-bold text-[#171717] bg-white px-2.5 py-0.5 rounded-md border border-[#E8E6E1]">
                        Due ₹{activePopupBooking.balanceAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#777570]">
                      Payment link is valid for 15 minutes. When customer completes payment, booking automatically moves to <strong>Confirmed</strong>.
                    </p>
                    <button
                      type="button"
                      disabled={isPaymentLinkBlocked(activePopupBooking.id)}
                      onClick={() => {
                        haptics.tap();
                        if (isPaymentLinkBlocked(activePopupBooking.id)) {
                          const sec = getPaymentLinkTimeRemaining(activePopupBooking.id);
                          showToast('Payment Link Active', `Link is valid for 15 mins. Button blocked for ${formatMinutesSeconds(sec)}.`, 'info');
                          return;
                        }
                        sendPaymentLink(activePopupBooking.id);
                        setSelectedPopupBooking(null);
                      }}
                      className={`w-full h-10 rounded-xl font-black text-[12px] flex items-center justify-center gap-2 shadow-xs transition-colors ${
                        isPaymentLinkBlocked(activePopupBooking.id)
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 cursor-not-allowed'
                          : 'bg-[#FF6B2C] hover:bg-[#e85b1e] text-white cursor-pointer'
                      }`}
                    >
                      {isPaymentLinkBlocked(activePopupBooking.id) ? (
                        <>
                          <Lock className="w-4 h-4 text-amber-700" />
                          <span>Link Active · Blocked for {formatMinutesSeconds(getPaymentLinkTimeRemaining(activePopupBooking.id))}</span>
                        </>
                      ) : (
                        <>
                          <Link2 className="w-4 h-4" />
                          <span>Send Payment Link (15m Validity)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* PAYMENT COLLECTION OPTIONS HUB (For all active bookings with balance due) */}
              {activePopupBooking.balanceAmount > 0 &&
                activePopupBooking.status !== 'Expired' &&
                activePopupBooking.status !== 'Payment Pending' && (
                  <div className="space-y-2 pt-1 border-t border-[#F1F0EC]">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-[#777570] uppercase tracking-wider">
                        Collect Remaining Balance Due
                      </span>
                      <span className="text-[10.5px] font-bold text-[#FF6B2C] bg-[#FF6B2C]/10 px-2 py-0.5 rounded-full">
                        Due ₹{activePopupBooking.balanceAmount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* 3 Interactive Direct Payment Methods: Payment Link, UPI QR, Record Cash */}
                    <div className="grid grid-cols-3 gap-2">
                      {/* Option 1: Payment Link */}
                      <button
                        type="button"
                        disabled={isPaymentLinkBlocked(activePopupBooking.id)}
                        onClick={() => {
                          haptics.tap();
                          if (isPaymentLinkBlocked(activePopupBooking.id)) {
                            const sec = getPaymentLinkTimeRemaining(activePopupBooking.id);
                            showToast('Payment Link Active', `Link is valid for 15 mins. Button blocked for ${formatMinutesSeconds(sec)}.`, 'info');
                            return;
                          }
                          sendPaymentLink(activePopupBooking.id);
                          setSelectedPopupBooking(null);
                        }}
                        className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all active-press ${
                          isPaymentLinkBlocked(activePopupBooking.id)
                            ? 'bg-amber-50 border-amber-300 opacity-90 cursor-not-allowed'
                            : 'bg-[#FAF9F6] hover:bg-[#F1F0EC] border-[#E8E6E1] cursor-pointer group'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-xl text-white flex items-center justify-center shadow-xs mb-1.5 ${
                          isPaymentLinkBlocked(activePopupBooking.id) ? 'bg-amber-500' : 'bg-[#FF6B2C]'
                        }`}>
                          {isPaymentLinkBlocked(activePopupBooking.id) ? <Lock className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <span className={`text-[11.5px] font-black block leading-tight ${
                            isPaymentLinkBlocked(activePopupBooking.id) ? 'text-amber-900' : 'text-[#171717] group-hover:text-[#FF6B2C]'
                          }`}>
                            {isPaymentLinkBlocked(activePopupBooking.id) ? 'Link Sent' : 'Pay Link'}
                          </span>
                          <span className="text-[9px] text-[#777570] block leading-tight mt-0.5">
                            {isPaymentLinkBlocked(activePopupBooking.id)
                              ? `${formatMinutesSeconds(getPaymentLinkTimeRemaining(activePopupBooking.id))} left`
                              : 'Share Online'}
                          </span>
                        </div>
                      </button>

                      {/* Option 2: Show Dynamic UPI QR */}
                      <button
                        type="button"
                        onClick={() => {
                          haptics.tap();
                          setSelectedBookingId(activePopupBooking.id);
                          setSelectedPopupBooking(null);
                          setActiveModal('qr_payment');
                        }}
                        className="p-2.5 rounded-2xl bg-[#FAF9F6] hover:bg-[#F1F0EC] border border-[#E8E6E1] text-left flex flex-col justify-between transition-all cursor-pointer group active-press"
                      >
                        <div className="w-7 h-7 rounded-xl bg-[#171717] text-white flex items-center justify-center shadow-xs mb-1.5">
                          <QrCode className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-[11.5px] font-black text-[#171717] block group-hover:text-[#FF6B2C] transition-colors leading-tight">
                            UPI QR Code
                          </span>
                          <span className="text-[9px] text-[#777570] block leading-tight mt-0.5">
                            Instant Scan
                          </span>
                        </div>
                      </button>

                      {/* Option 3: Record Cash */}
                      <button
                        type="button"
                        onClick={() => {
                          haptics.tap();
                          setSelectedBookingId(activePopupBooking.id);
                          setSelectedPopupBooking(null);
                          setActiveModal('record_cash');
                        }}
                        className="p-2.5 rounded-2xl bg-[#FAF9F6] hover:bg-[#F1F0EC] border border-[#E8E6E1] text-left flex flex-col justify-between transition-all cursor-pointer group active-press"
                      >
                        <div className="w-7 h-7 rounded-xl bg-[#2FA66A] text-white flex items-center justify-center shadow-xs mb-1.5">
                          <Banknote className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-[11.5px] font-black text-[#171717] block group-hover:text-[#2FA66A] transition-colors leading-tight">
                            Record Cash
                          </span>
                          <span className="text-[9px] text-[#777570] block leading-tight mt-0.5">
                            Counter Cash
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

              {/* BOOKING LIFECYCLE MANAGEMENT HUB */}
              <div className="space-y-2 pt-2 border-t border-[#F1F0EC]">
                <span className="text-[11px] font-black text-[#777570] uppercase tracking-wider block">
                  Booking Lifecycle Operations
                </span>

                {/* State 1: Confirmed -> Check In */}
                {activePopupBooking.status === 'Confirmed' && (
                  <button
                    onClick={() => {
                      haptics.tap();
                      checkInBooking(activePopupBooking.id);
                    }}
                    className="w-full h-11 rounded-2xl bg-[#2FA66A] hover:bg-[#258756] text-white font-black text-[13px] flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Check In Players (Start Match)</span>
                  </button>
                )}

                {/* State 2: Ongoing -> Extend Slot or Check Out */}
                {activePopupBooking.status === 'Ongoing' && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        haptics.tap();
                        setExtendingBooking(activePopupBooking);
                        setExtensionMinutes(null);
                      }}
                      className="h-11 rounded-2xl bg-[#171717] hover:bg-[#2e2e2e] text-white font-black text-[12px] flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                    >
                      <Clock className="w-4 h-4 text-[#FF6B2C]" />
                      <span>Extend Slot (+Time)</span>
                    </button>

                    <button
                      onClick={() => {
                        haptics.tap();
                        checkOutBooking(activePopupBooking.id);
                      }}
                      className="h-11 rounded-2xl bg-[#2FA66A] hover:bg-[#258756] text-white font-black text-[12px] flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Check Out & Complete</span>
                    </button>
                  </div>
                )}

                {/* State 3: Expired Slot -> Re-lock with Duration Selector */}
                {isBookingExpired(activePopupBooking) && (
                  <div className="space-y-2.5">
                    <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-xs">
                      <span className="font-bold text-red-800 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        Hold Expired (Unpaid Slot)
                      </span>
                      <span className="font-bold text-red-700">Expired</span>
                    </div>

                    <div className="bg-[#FAF9F6] border border-[#E8E6E1] p-2.5 rounded-2xl space-y-1.5">
                      <span className="text-[11px] font-bold text-[#777570] block">
                        Select Re-lock Hold Duration:
                      </span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[15, 30, 45, 60].map((mins) => (
                          <button
                            key={mins}
                            type="button"
                            onClick={() => {
                              haptics.tap();
                              setRelockMins(mins);
                            }}
                            className={`py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                              relockMins === mins
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
                        haptics.tap();
                        relockAndResendLink(activePopupBooking.id, relockMins);
                        setSelectedPopupBooking(null);
                      }}
                      className="w-full h-11 rounded-2xl bg-[#FF6B2C] hover:bg-[#e85b1e] text-white font-black text-[12px] flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Re-lock & Send Payment Link (+{relockMins}m)</span>
                    </button>
                  </div>
                )}

                {/* Close Button */}
                <button
                  onClick={() => setSelectedPopupBooking(null)}
                  className="w-full h-10 rounded-2xl bg-[#FAF9F6] hover:bg-[#F1F0EC] border border-[#E8E6E1] text-[#171717] font-bold text-[12px] cursor-pointer transition-colors mt-2"
                >
                  Close Window
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 8. MOBILE NATIVE FILTER BOTTOM SHEET (Slide-up modal for mobile refinement) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isMobileFilterSheetOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs select-none md:hidden">
            <div className="absolute inset-0" onClick={() => setIsMobileFilterSheetOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full bg-white rounded-t-[32px] p-5 pb-8 border-t border-[#E8E6E1] shadow-2xl max-h-[85vh] overflow-y-auto no-scrollbar space-y-5 z-10"
            >
              {/* Drag Handle */}
              <div className="w-10 h-1 rounded-full bg-[#D4D2CD] mx-auto mb-1" />

              {/* Sheet Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F0EC]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FF6B2C]/10 text-[#FF6B2C] flex items-center justify-center">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-[17px] font-black text-[#171717] leading-tight">Filter Bookings</h2>
                    <p className="text-[11.5px] text-[#777570] font-medium">
                      {filteredBookings.length} matches currently found
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {hasActiveFilters && (
                    <button
                      onClick={handleClearAllFilters}
                      className="text-[11.5px] font-bold text-red-600 hover:text-red-700 underline cursor-pointer"
                    >
                      Reset All
                    </button>
                  )}
                  <button
                    onClick={() => setIsMobileFilterSheetOpen(false)}
                    className="w-8 h-8 rounded-full bg-[#F1F0EC] flex items-center justify-center text-[#777570] hover:text-[#171717] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Section 1: Sport Taxonomy */}
              <div className="space-y-2">
                <span className="text-[11px] font-black text-[#777570] uppercase tracking-wider block">
                  Sport Category
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'All', label: 'All Sports' },
                    { id: 'Football', label: '⚽ Football' },
                    { id: 'Cricket', label: '🏏 Box Cricket' },
                    { id: 'Badminton', label: '🏸 Badminton' },
                  ].map((s) => {
                    const isActive = selectedSport === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => {
                          haptics.tap();
                          setSelectedSport(s.id);
                        }}
                        className={`h-11 px-3 rounded-xl text-[12.5px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#171717] text-white shadow-xs font-black'
                            : 'bg-[#FAF9F6] text-[#777570] border border-[#E8E6E1]'
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Timeline / Date */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-[#777570] uppercase tracking-wider">
                    Timeline & Schedule
                  </span>
                  {dateFilter === 'particular' && (
                    <span className="text-[11px] font-black text-[#FF6B2C]">
                      {selectedParticularDate}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'all', label: 'All Dates' },
                    { id: 'today', label: "Today's Matches" },
                    { id: 'tomorrow', label: 'Tomorrow' },
                    { id: 'upcoming', label: 'Upcoming' },
                  ].map((d) => {
                    const isActive = dateFilter === d.id;
                    return (
                      <button
                        key={d.id}
                        onClick={() => {
                          haptics.tap();
                          setDateFilter(d.id as DateFilterType);
                        }}
                        className={`h-11 px-3 rounded-xl text-[12px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#171717] text-white shadow-xs font-black'
                            : 'bg-[#FAF9F6] text-[#777570] border border-[#E8E6E1]'
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
                {/* Specific date button */}
                <button
                  onClick={() => {
                    haptics.tap();
                    setIsDatePickerOpen(true);
                  }}
                  className={`w-full h-11 px-3.5 rounded-xl border flex items-center justify-center gap-2 text-[12px] font-bold transition-all cursor-pointer ${
                    dateFilter === 'particular'
                      ? 'bg-[#FF6B2C] text-white border-[#FF6B2C] shadow-xs font-black'
                      : 'bg-[#FAF9F6] text-[#171717] border-[#E8E6E1]'
                  }`}
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>{dateFilter === 'particular' ? `Date: ${selectedParticularDate}` : 'Select Specific Date...'}</span>
                </button>
              </div>

              {/* Section 3: Payment Status */}
              <div className="space-y-2">
                <span className="text-[11px] font-black text-[#777570] uppercase tracking-wider block">
                  Payment Status
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'All', label: 'All' },
                    { id: 'Paid', label: 'Paid in Full' },
                    { id: 'Pending', label: 'Due Balances' },
                  ].map((p) => {
                    const isActive = selectedPaymentFilter === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          haptics.tap();
                          setSelectedPaymentFilter(p.id);
                        }}
                        className={`h-11 px-2 rounded-xl text-[12px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#171717] text-white shadow-xs font-black'
                            : 'bg-[#FAF9F6] text-[#777570] border border-[#E8E6E1]'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 4: Booking Lifecycle Status */}
              <div className="space-y-2">
                <span className="text-[11px] font-black text-[#777570] uppercase tracking-wider block">
                  Match Status
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'All', label: 'All Statuses' },
                    { id: 'Ongoing', label: '🟢 Ongoing' },
                    { id: 'Confirmed', label: '🟠 Confirmed' },
                    { id: 'Payment Pending', label: '🟡 Due Hold' },
                    { id: 'Completed', label: 'Checked Out' },
                  ].map((s) => {
                    const isActive = selectedBookingStatus === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => {
                          haptics.tap();
                          setSelectedBookingStatus(s.id);
                        }}
                        className={`px-3 py-2 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#171717] text-white shadow-xs font-black'
                            : 'bg-[#FAF9F6] text-[#777570] border border-[#E8E6E1]'
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Sticky CTA Button */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    haptics.tap();
                    setIsMobileFilterSheetOpen(false);
                  }}
                  className="w-full h-12 rounded-2xl bg-[#FF6B2C] hover:bg-[#e85b1e] text-white font-black text-[14px] flex items-center justify-center gap-2 shadow-md active-press cursor-pointer transition-colors"
                >
                  <span>Apply Filters ({filteredBookings.length} Bookings)</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Floating Action Button (FAB) for Instant New Booking */}
      <div className="md:hidden fixed bottom-20 right-4 z-30">
        <button
          onClick={() => {
            haptics.tap();
            setActiveModal('new_booking');
          }}
          className="h-12 px-4.5 rounded-full bg-[#FF6B2C] hover:bg-[#e85b1e] text-white font-black text-[13px] flex items-center gap-2 shadow-[0_8px_25px_rgba(255,107,44,0.38)] active-press cursor-pointer border-2 border-white"
          aria-label="New Booking"
        >
          <Plus className="w-4.5 h-4.5 stroke-[3]" />
          <span>New Booking</span>
        </button>
      </div>
    </div>
  );
};
