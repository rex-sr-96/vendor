import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  ChevronRight,
  CheckCircle2,
  Clock,
  Building2,
  ArrowUpRight,
  Wallet,
  Calendar,
  CreditCard,
  Banknote,
  Download,
  ShieldCheck,
  Zap,
  ArrowDownLeft,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { haptics } from '../utils/haptics';
import { DateMonthPickerSheet } from '../components/DateMonthPickerSheet';
import {
  exportPaymentCollectionsToCSV,
  exportSettlementsToCSV,
  exportSettlementsToPDF,
  exportSettlementsToExcel,
  exportBookingsToPDF,
  exportBookingsToExcel,
} from '../utils/exportUtils';

type PaymentTab = 'booking' | 'settlement';

export const PaymentsScreen: React.FC = () => {
  const {
    bookings,
    setSelectedBookingId,
    setActiveModal,
    navigateTo,
    paymentSettings,
    settlements,
    requestInstantSettlement,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<PaymentTab>('booking');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Pending'>('All');
  const [selectedBookingDate, setSelectedBookingDate] = useState<string>('Today');
  const [isBookingPickerOpen, setIsBookingPickerOpen] = useState<boolean>(false);

  const [selectedSettlementMonth, setSelectedSettlementMonth] = useState<string>('Aug 2026');
  const [isSettlementPickerOpen, setIsSettlementPickerOpen] = useState<boolean>(false);

  const [expandedSettlementId, setExpandedSettlementId] = useState<string | null>(null);
  const [isSettlingInstant, setIsSettlingInstant] = useState(false);

  // Date constants
  const todayDateStr = '28 Aug 2026';
  const yesterdayDateStr = '27 Aug 2026';

  // Date-filtered bookings (for Booking calendar tab)
  const activeBookings = bookings.filter((b) => {
    if (selectedBookingDate === 'Today') return b.date === todayDateStr;
    if (selectedBookingDate === 'Yesterday') return b.date === yesterdayDateStr;
    if (selectedBookingDate === 'All') return true;
    return b.date === selectedBookingDate;
  });

  // Revenue amounts for selected date
  const bookingTotalAmount = activeBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const bookingPaidAmount = activeBookings.reduce((sum, b) => sum + b.paidAmount, 0);
  const bookingPendingAmount = activeBookings.reduce((sum, b) => sum + b.balanceAmount, 0);

  // Payment method breakdown for selected date
  const bookingUpiPaid = activeBookings
    .filter((b) => b.paymentMethod === 'UPI' || !b.paymentMethod)
    .reduce((sum, b) => sum + b.paidAmount, 0);
  const bookingCashPaid = activeBookings
    .filter((b) => b.paymentMethod === 'Cash')
    .reduce((sum, b) => sum + b.paidAmount, 0);

  // Settlement metrics & Monthly Filter
  const filteredSettlements = settlements.filter((s) => {
    if (selectedSettlementMonth === 'All') return true;
    return s.date.includes(selectedSettlementMonth);
  });

  const totalSettledAmount = filteredSettlements.reduce((sum, s) => sum + s.settledAmount, 0);
  const pendingSettlementBalance =
    selectedSettlementMonth.includes('Aug') || selectedSettlementMonth === 'All' ? 12800 : 0;

  const handleCollect = (bookingId: string) => {
    haptics.tap();
    setSelectedBookingId(bookingId);
    setActiveModal('payment_options');
  };

  const handleView = (bookingId: string) => {
    haptics.tap();
    setSelectedBookingId(bookingId);
    navigateTo('booking_details');
  };

  const handleInstantPayout = () => {
    haptics.tap();
    setIsSettlingInstant(true);
    setTimeout(() => {
      requestInstantSettlement(pendingSettlementBalance);
      setIsSettlingInstant(false);
    }, 600);
  };

  const [showBookingExportMenu, setShowBookingExportMenu] = useState(false);
  const [showSettlementExportMenu, setShowSettlementExportMenu] = useState(false);

  const handleExportBookingPayments = (format: 'pdf' | 'excel' | 'csv' = 'pdf') => {
    haptics.success();
    setShowBookingExportMenu(false);

    if (format === 'pdf') {
      exportBookingsToPDF(
        filteredBookings,
        `TurfTown Arena - Payment Collections (${selectedBookingDate})`,
        selectedBookingDate,
        `turftown_collections_${selectedBookingDate.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
      );
      showToast(
        'PDF Exported',
        `Exported ${filteredBookings.length} collection records to PDF`,
        'success'
      );
    } else if (format === 'excel') {
      exportBookingsToExcel(
        filteredBookings,
        `Payment Collections - ${selectedBookingDate}`,
        `turftown_collections_${selectedBookingDate.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`
      );
      showToast(
        'Excel Exported',
        `Exported ${filteredBookings.length} collection records to Excel (.xlsx)`,
        'success'
      );
    } else {
      exportPaymentCollectionsToCSV(filteredBookings, selectedBookingDate);
      showToast(
        'CSV Exported',
        `Exported ${filteredBookings.length} payment records (${selectedBookingDate}) to CSV`,
        'success'
      );
    }
  };

  const handleExportSettlements = (format: 'pdf' | 'excel' | 'csv' = 'pdf') => {
    haptics.success();
    setShowSettlementExportMenu(false);

    if (format === 'pdf') {
      exportSettlementsToPDF(filteredSettlements, selectedSettlementMonth);
      showToast(
        'PDF Statement Exported',
        `Exported ${filteredSettlements.length} bank settlements (${selectedSettlementMonth}) to PDF`,
        'success'
      );
    } else if (format === 'excel') {
      exportSettlementsToExcel(filteredSettlements, selectedSettlementMonth);
      showToast(
        'Excel Statement Exported',
        `Exported ${filteredSettlements.length} bank settlements (${selectedSettlementMonth}) to Excel (.xlsx)`,
        'success'
      );
    } else {
      exportSettlementsToCSV(filteredSettlements, selectedSettlementMonth);
      showToast(
        'CSV Statement Exported',
        `Exported ${filteredSettlements.length} bank settlements (${selectedSettlementMonth}) to CSV`,
        'success'
      );
    }
  };

  const filteredBookings = activeBookings.filter((b) => {
    const matchesSearch =
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.courtName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.sport.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'Paid') return matchesSearch && b.balanceAmount === 0;
    if (statusFilter === 'Pending') return matchesSearch && b.balanceAmount > 0;
    return matchesSearch;
  });

  // Extract all available booking dates and settlement months
  const availableBookingDates = Array.from(new Set(bookings.map((b) => b.date)));
  const availableSettlementMonths = ['Aug 2026', 'Jul 2026', 'Jun 2026'];

  return (
    <div className="pb-8 pt-3 px-3.5 w-full space-y-3 select-none">
      {/* Date Calendar Picker Sheet (for Bookings) */}
      <DateMonthPickerSheet
        isOpen={isBookingPickerOpen}
        onClose={() => setIsBookingPickerOpen(false)}
        title="Select Booking Date"
        mode="date"
        themeColor="orange"
        activeSelection={selectedBookingDate}
        availableDates={availableBookingDates}
        onSelect={(val) => setSelectedBookingDate(val)}
      />

      {/* Month Picker Sheet (for Settlements) */}
      <DateMonthPickerSheet
        isOpen={isSettlementPickerOpen}
        onClose={() => setIsSettlementPickerOpen(false)}
        title="Select Settlement Month"
        mode="month"
        themeColor="green"
        activeSelection={selectedSettlementMonth}
        availableDates={availableSettlementMonths}
        onSelect={(val) => setSelectedSettlementMonth(val)}
      />

      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <div className="min-w-0">
          <h1 className="text-[20px] font-extrabold text-[#171717] tracking-tight leading-tight">
            Payments
          </h1>
          <p className="text-[11.5px] text-[#777570] font-medium truncate">
            Daily collections & settlements
          </p>
        </div>
        <button
          onClick={() => {
            haptics.tap();
            navigateTo('payment_settings');
          }}
          className="shrink-0 text-[11.5px] font-bold text-[#FF6B2C] bg-white border border-[#E8E6E1] px-2.5 py-1.5 rounded-xl hover:border-[#FF6B2C] active-press cursor-pointer shadow-2xs flex items-center gap-1.5 whitespace-nowrap"
        >
          <Building2 className="w-3.5 h-3.5 text-[#FF6B2C]" />
          <span>Bank Settings</span>
        </button>
      </div>

      {/* Main Two-Option Tab Switcher: Booking vs Settlement */}
      <div className="bg-[#EBE9E3] p-1 rounded-2xl flex items-center shadow-2xs">
        <button
          onClick={() => {
            haptics.tap();
            setActiveTab('booking');
          }}
          className={`flex-1 py-2 rounded-xl text-[12.5px] font-bold transition-all flex items-center justify-center gap-1.5 active-press cursor-pointer whitespace-nowrap ${
            activeTab === 'booking'
              ? 'bg-[#171717] text-white shadow-xs'
              : 'text-[#777570] hover:text-[#171717]'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>Booking</span>
          {activeBookings.length > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold leading-tight ${
                activeTab === 'booking'
                  ? 'bg-[#FF6B2C] text-white'
                  : 'bg-[#DCDAD2] text-[#171717]'
              }`}
            >
              {activeBookings.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            haptics.tap();
            setActiveTab('settlement');
          }}
          className={`flex-1 py-2 rounded-xl text-[12.5px] font-bold transition-all flex items-center justify-center gap-1.5 active-press cursor-pointer whitespace-nowrap ${
            activeTab === 'settlement'
              ? 'bg-[#171717] text-white shadow-xs'
              : 'text-[#777570] hover:text-[#171717]'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Settlement</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#2FA66A]" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'booking' ? (
          /* =========================================================================
             BOOKING TAB CONTENT: Showing Daily Amount & Booking Collections
             ========================================================================= */
          <motion.div
            key="booking-tab"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="space-y-3"
          >
            {/* Date Calendar Filter Bar (Only showing chosen date & date calendar picker) */}
            <div className="px-0.5">
              <button
                onClick={() => {
                  haptics.tap();
                  setIsBookingPickerOpen(true);
                }}
                className="w-full flex items-center justify-between bg-white border border-[#E8E6E1] hover:border-[#FF6B2C] px-3 py-2 rounded-2xl active-press cursor-pointer shadow-2xs group transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-xl bg-[#FF6B2C]/10 text-[#FF6B2C] flex items-center justify-center shrink-0">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A3A099] block leading-none">
                      Booking Date
                    </span>
                    <span className="text-[12.5px] font-extrabold text-[#171717] truncate block leading-tight mt-0.5">
                      {selectedBookingDate === 'Today'
                        ? 'Today (28 Aug 2026)'
                        : selectedBookingDate === 'Yesterday'
                        ? 'Yesterday (27 Aug 2026)'
                        : selectedBookingDate === 'All'
                        ? 'All Dates Record'
                        : selectedBookingDate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-[#F7F7F5] group-hover:bg-[#FF6B2C]/10 group-hover:text-[#FF6B2C] text-[#777570] px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 transition-colors">
                  <Calendar className="w-3 h-3" />
                  <span>Change Date</span>
                  <ChevronDown className="w-3 h-3" />
                </div>
              </button>
            </div>

            {/* Daily Amount Hero Card */}
            <div className="bg-[#171717] text-white rounded-3xl p-4 shadow-sm space-y-3">
              {/* Row 1: Label & Count Pill */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#A3A099] truncate">
                  {selectedBookingDate === 'All'
                    ? 'All-Time Booking Revenue'
                    : selectedBookingDate === 'Today'
                    ? 'Today Booking Revenue'
                    : selectedBookingDate === 'Yesterday'
                    ? 'Yesterday Booking Revenue'
                    : `${selectedBookingDate} Revenue`}
                </span>
                <span className="text-[10.5px] text-[#2FA66A] font-bold bg-[#2FA66A]/20 px-2 py-0.5 rounded-full whitespace-nowrap">
                  {activeBookings.length} {activeBookings.length === 1 ? 'booking' : 'bookings'}
                </span>
              </div>

              {/* Row 2: Big Amount */}
              <div>
                <h2 className="text-[30px] font-extrabold tracking-tight leading-none text-white">
                  ₹{bookingTotalAmount.toLocaleString('en-IN')}
                </h2>
              </div>

              {/* Row 3: Daily Paid vs Daily Due Balance */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                <div className="bg-white/10 rounded-2xl p-2.5 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#A3A099] font-medium">
                      {selectedBookingDate === 'Today' ? 'Daily Paid' : selectedBookingDate === 'All' ? 'Total Paid' : 'Paid Amount'}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2FA66A] shrink-0" />
                  </div>
                  <div className="text-[16px] font-extrabold text-[#2FA66A] leading-tight">
                    ₹{bookingPaidAmount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[9.5px] text-white/65 font-medium truncate">
                    UPI: ₹{bookingUpiPaid.toLocaleString('en-IN')}
                    {bookingCashPaid > 0 ? ` · Cash: ₹${bookingCashPaid.toLocaleString('en-IN')}` : ''}
                  </div>
                </div>

                <div className="bg-white/10 rounded-2xl p-2.5 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#A3A099] font-medium">Due Balance</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E7A72F] shrink-0" />
                  </div>
                  <div className="text-[16px] font-extrabold text-[#E7A72F] leading-tight">
                    ₹{bookingPendingAmount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[9.5px] text-white/65 font-medium truncate">
                    {activeBookings.filter((b) => b.balanceAmount > 0).length} pending collection
                  </div>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative flex items-center bg-[#F7F7F5] border border-[#E8E6E1] rounded-2xl px-3 py-2 shadow-2xs">
              <Search className="w-3.5 h-3.5 text-[#777570] mr-2 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search booking ID, customer, turf..."
                className="w-full text-[12.5px] font-medium text-[#171717] bg-transparent focus:outline-none placeholder-[#A3A099]"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-[10.5px] font-bold text-[#777570] hover:text-[#171717] px-1 shrink-0"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter Pills & Export Action */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {(['All', 'Paid', 'Pending'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      haptics.tap();
                      setStatusFilter(f);
                    }}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all active-press cursor-pointer whitespace-nowrap ${
                      statusFilter === f
                        ? 'bg-[#171717] text-white'
                        : 'bg-white text-[#777570] border border-[#E8E6E1]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="relative">
                <button
                  id="btn-export-booking-payments"
                  onClick={() => {
                    haptics.tap();
                    setShowBookingExportMenu(!showBookingExportMenu);
                  }}
                  className="h-7 px-2.5 rounded-xl bg-white border border-[#E8E6E1] text-[#171717] text-[11px] font-bold flex items-center gap-1 shadow-2xs hover:border-[#FF6B2C] active-press cursor-pointer shrink-0 whitespace-nowrap"
                  title="Export booking payment transactions"
                >
                  <Download className="w-3 h-3 text-[#FF6B2C]" />
                  <span>Export</span>
                  <ChevronDown className="w-3 h-3 text-[#777570]" />
                </button>

                {/* Format Dropdown Menu */}
                {showBookingExportMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowBookingExportMenu(false)}
                    />
                    <div className="absolute right-0 top-8 z-50 w-44 bg-white rounded-2xl shadow-xl border border-[#E8E6E1] p-1.5 space-y-1">
                      <button
                        onClick={() => handleExportBookingPayments('pdf')}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl text-[11.5px] font-bold text-[#171717] hover:bg-[#FF6B2C]/10 hover:text-[#FF6B2C] flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span>PDF Report</span>
                        <span className="text-[9.5px] bg-[#D94B4B]/10 text-[#D94B4B] px-1.5 py-0.5 rounded font-mono">.pdf</span>
                      </button>
                      <button
                        onClick={() => handleExportBookingPayments('excel')}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl text-[11.5px] font-bold text-[#171717] hover:bg-[#2FA66A]/10 hover:text-[#2FA66A] flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span>Excel Spreadsheet</span>
                        <span className="text-[9.5px] bg-[#2FA66A]/10 text-[#2FA66A] px-1.5 py-0.5 rounded font-mono">.xlsx</span>
                      </button>
                      <button
                        onClick={() => handleExportBookingPayments('csv')}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl text-[11.5px] font-bold text-[#171717] hover:bg-[#F1F0EC] flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span>CSV Data File</span>
                        <span className="text-[9.5px] bg-[#F1F0EC] text-[#777570] px-1.5 py-0.5 rounded font-mono">.csv</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Booking Transactions List */}
            <div className="space-y-2.5">
              {filteredBookings.length === 0 ? (
                <div className="bg-white rounded-2xl p-7 border border-[#E8E6E1] text-center space-y-1.5 shadow-2xs">
                  <div className="w-9 h-9 rounded-full bg-[#F1F0EC] flex items-center justify-center mx-auto text-[#777570]">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <h3 className="text-[13.5px] font-bold text-[#171717]">No booking payments</h3>
                  <p className="text-[11.5px] text-[#777570]">
                    No transactions match your current search or filter.
                  </p>
                </div>
              ) : (
                filteredBookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white rounded-2xl p-3.5 border border-[#E8E6E1] shadow-2xs space-y-2 hover:border-[#171717]/25 transition-all"
                  >
                    {/* Top Metadata & Status Badge Row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                        <span className="text-[11.5px] font-mono font-extrabold text-[#171717] whitespace-nowrap">
                          {b.id}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-[#DCDAD2] shrink-0" />
                        <span className="text-[11px] text-[#777570] font-medium whitespace-nowrap">
                          {b.date}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-[#DCDAD2] shrink-0" />
                        <span className="text-[10px] font-bold text-[#FF6B2C] bg-[#FF6B2C]/10 px-1.5 py-0.5 rounded whitespace-nowrap">
                          {b.timeSlot}
                        </span>
                      </div>

                      {b.balanceAmount === 0 ? (
                        <span className="shrink-0 whitespace-nowrap px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#2FA66A]/15 text-[#1E774A] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Paid</span>
                        </span>
                      ) : (
                        <span className="shrink-0 whitespace-nowrap px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E7A72F]/15 text-[#B87C0D] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Due ₹{b.balanceAmount.toLocaleString('en-IN')}</span>
                        </span>
                      )}
                    </div>

                    {/* Customer & Court Details */}
                    <div>
                      <h3 className="text-[14px] font-bold text-[#171717] leading-snug">
                        {b.customerName}
                      </h3>
                      <p className="text-[11.5px] text-[#777570] mt-0.5">
                        {b.courtName} · {b.sport} · Total ₹{b.totalAmount.toLocaleString('en-IN')}
                      </p>
                    </div>

                    {/* Bottom Payment Status & Action */}
                    <div className="pt-2 border-t border-[#F1F0EC] flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[12px] font-bold text-[#171717] whitespace-nowrap">
                            Paid: ₹{b.paidAmount.toLocaleString('en-IN')}
                          </span>
                          {b.paymentMethod && (
                            <span className="text-[9px] font-bold text-[#777570] bg-[#F1F0EC] px-1.5 py-0.2 rounded uppercase whitespace-nowrap">
                              {b.paymentMethod}
                            </span>
                          )}
                        </div>
                        {b.balanceAmount > 0 && (
                          <span className="text-[11px] text-[#E7A72F] font-bold block mt-0.5 whitespace-nowrap">
                            Balance Due: ₹{b.balanceAmount.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      {b.balanceAmount > 0 ? (
                        <button
                          onClick={() => handleCollect(b.id)}
                          className="shrink-0 px-3 py-1.5 rounded-xl bg-[#FF6B2C] text-white text-[11.5px] font-bold flex items-center gap-1 shadow-2xs hover:bg-[#e85b1e] active-press cursor-pointer whitespace-nowrap"
                        >
                          <span>Collect</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleView(b.id)}
                          className="shrink-0 px-3 py-1.5 rounded-xl bg-[#F1F0EC] text-[#171717] text-[11.5px] font-bold flex items-center gap-1 hover:bg-[#E8E6E1] active-press cursor-pointer whitespace-nowrap"
                        >
                          <span>View</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        ) : (
          /* =========================================================================
             SETTLEMENT TAB CONTENT: Showing Amount Settled to Bank & Pending Balance
             ========================================================================= */
          <motion.div
            key="settlement-tab"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="space-y-3"
          >
            {/* Month Settlement Filter Bar (Only showing chosen month & picker) */}
            <div className="px-0.5">
              <button
                onClick={() => {
                  haptics.tap();
                  setIsSettlementPickerOpen(true);
                }}
                className="w-full flex items-center justify-between bg-white border border-[#E8E6E1] hover:border-[#2FA66A] px-3 py-2 rounded-2xl active-press cursor-pointer shadow-2xs group transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-xl bg-[#2FA66A]/10 text-[#2FA66A] flex items-center justify-center shrink-0">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A3A099] block leading-none">
                      Settlement Month
                    </span>
                    <span className="text-[12.5px] font-extrabold text-[#171717] truncate block leading-tight mt-0.5">
                      {selectedSettlementMonth === 'All'
                        ? 'All Settlements'
                        : `Month of ${selectedSettlementMonth}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-[#F7F7F5] group-hover:bg-[#2FA66A]/10 group-hover:text-[#2FA66A] text-[#777570] px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 transition-colors">
                  <Calendar className="w-3 h-3" />
                  <span>Change Month</span>
                  <ChevronDown className="w-3 h-3" />
                </div>
              </button>
            </div>

            {/* Master Settlement Hero Card */}
            <div className="bg-[#171717] text-white rounded-3xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#A3A099] block">
                    Settlement Overview {selectedSettlementMonth !== 'All' ? `(${selectedSettlementMonth})` : ''}
                  </span>
                  <p className="text-[11.5px] text-white/70 mt-0.5 truncate">
                    Direct payouts to {paymentSettings.bankName}
                  </p>
                </div>
                <span className="shrink-0 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#2FA66A]/20 text-[#2FA66A] border border-[#2FA66A]/30 flex items-center gap-1 whitespace-nowrap">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified</span>
                </span>
              </div>

              {/* 2 Primary Side-by-Side Cards: Amount Settled to Bank & Pending Balance */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                {/* 1. Amount Settled to Bank */}
                <div className="bg-white/10 rounded-2xl p-2.5 border border-white/10 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center gap-1 text-[#2FA66A]">
                      <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span className="text-[10px] text-[#A3A099] font-semibold whitespace-nowrap">
                        Settled to Bank
                      </span>
                    </div>
                    <div className="text-[19px] font-extrabold text-[#2FA66A] mt-1 leading-tight">
                      ₹{totalSettledAmount.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="pt-1.5 border-t border-white/10 text-[9px] text-white/70 truncate">
                    {paymentSettings.bankName} {paymentSettings.accountNumberMasked}
                  </div>
                </div>

                {/* 2. Pending Balance */}
                <div className="bg-white/10 rounded-2xl p-2.5 border border-white/10 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center gap-1 text-[#E7A72F]">
                      <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span className="text-[10px] text-[#A3A099] font-semibold whitespace-nowrap">
                        Pending Balance
                      </span>
                    </div>
                    <div className="text-[19px] font-extrabold text-[#E7A72F] mt-1 leading-tight">
                      ₹{pendingSettlementBalance.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="pt-1.5 border-t border-white/10 text-[9px] text-white/70 truncate">
                    Auto-payout: 06:00 AM
                  </div>
                </div>
              </div>

              {/* Instant Settlement CTA Banner */}
              <div className="bg-white/5 rounded-2xl p-2.5 border border-white/10 flex items-center justify-between gap-2">
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1 text-white">
                    <Zap className="w-3.5 h-3.5 text-[#FF6B2C] fill-[#FF6B2C] shrink-0" />
                    <span className="text-[11.5px] font-bold truncate">Instant Settlement</span>
                  </div>
                  <p className="text-[10px] text-[#A3A099] truncate">
                    Settle ₹{pendingSettlementBalance.toLocaleString('en-IN')} now via IMPS
                  </p>
                </div>

                <button
                  onClick={handleInstantPayout}
                  disabled={isSettlingInstant}
                  className="shrink-0 px-2.5 py-1.5 rounded-xl bg-[#FF6B2C] text-white text-[11px] font-extrabold flex items-center gap-1 shadow-2xs hover:bg-[#e85b1e] active-press cursor-pointer disabled:opacity-50 whitespace-nowrap"
                >
                  <span>{isSettlingInstant ? 'Processing...' : 'Settle Now'}</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Linked Settlement Account Information Card */}
            <div className="bg-white rounded-2xl p-3 border border-[#E8E6E1] shadow-2xs space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-xl bg-[#171717] text-white flex items-center justify-center shrink-0">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[13px] font-bold text-[#171717] truncate">
                      {paymentSettings.bankName}
                    </h3>
                    <p className="text-[10.5px] text-[#777570] font-mono truncate">
                      A/c {paymentSettings.accountNumberMasked} · IFSC: {paymentSettings.ifscCode}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    haptics.tap();
                    navigateTo('payment_settings');
                  }}
                  className="shrink-0 text-[11px] font-bold text-[#FF6B2C] hover:underline whitespace-nowrap"
                >
                  Edit
                </button>
              </div>

              <div className="pt-2 border-t border-[#F1F0EC] grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-[#F7F7F5] rounded-xl p-2">
                  <span className="text-[#777570] block text-[9.5px]">Payout Cycle</span>
                  <strong className="text-[#171717] text-[11px] block truncate">
                    {paymentSettings.payoutFrequency} (T+0)
                  </strong>
                </div>
                <div className="bg-[#F7F7F5] rounded-xl p-2">
                  <span className="text-[#777570] block text-[9.5px]">Linked UPI ID</span>
                  <strong className="text-[#171717] text-[11px] block truncate">
                    {paymentSettings.upiId}
                  </strong>
                </div>
              </div>
            </div>

            {/* Settlement History Header & Batches */}
            <div className="space-y-2">
              <div className="flex items-center justify-between pt-0.5">
                <div>
                  <h2 className="text-[13.5px] font-bold text-[#171717]">
                    Bank Settlement History
                  </h2>
                  <span className="text-[11px] text-[#777570] font-medium">
                    {filteredSettlements.length} {filteredSettlements.length === 1 ? 'payout' : 'payouts'} · {selectedSettlementMonth}
                  </span>
                </div>
                <div className="relative">
                  <button
                    id="btn-export-settlements"
                    onClick={() => {
                      haptics.tap();
                      setShowSettlementExportMenu(!showSettlementExportMenu);
                    }}
                    className="h-7 px-2.5 rounded-xl bg-white border border-[#E8E6E1] text-[#171717] text-[11px] font-bold flex items-center gap-1 shadow-2xs hover:border-[#2FA66A] active-press cursor-pointer shrink-0 whitespace-nowrap"
                    title="Export settlement statement (PDF / Excel / CSV)"
                  >
                    <Download className="w-3 h-3 text-[#2FA66A]" />
                    <span>Export Statement</span>
                    <ChevronDown className="w-3 h-3 text-[#777570]" />
                  </button>

                  {/* Format Dropdown Menu */}
                  {showSettlementExportMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowSettlementExportMenu(false)}
                      />
                      <div className="absolute right-0 top-8 z-50 w-44 bg-white rounded-2xl shadow-xl border border-[#E8E6E1] p-1.5 space-y-1">
                        <button
                          onClick={() => handleExportSettlements('pdf')}
                          className="w-full text-left px-2.5 py-1.5 rounded-xl text-[11.5px] font-bold text-[#171717] hover:bg-[#D94B4B]/10 hover:text-[#D94B4B] flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span>PDF Statement</span>
                          <span className="text-[9.5px] bg-[#D94B4B]/10 text-[#D94B4B] px-1.5 py-0.5 rounded font-mono">.pdf</span>
                        </button>
                        <button
                          onClick={() => handleExportSettlements('excel')}
                          className="w-full text-left px-2.5 py-1.5 rounded-xl text-[11.5px] font-bold text-[#171717] hover:bg-[#2FA66A]/10 hover:text-[#2FA66A] flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span>Excel Sheet</span>
                          <span className="text-[9.5px] bg-[#2FA66A]/10 text-[#2FA66A] px-1.5 py-0.5 rounded font-mono">.xlsx</span>
                        </button>
                        <button
                          onClick={() => handleExportSettlements('csv')}
                          className="w-full text-left px-2.5 py-1.5 rounded-xl text-[11.5px] font-bold text-[#171717] hover:bg-[#F1F0EC] flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span>CSV Statement</span>
                          <span className="text-[9.5px] bg-[#F1F0EC] text-[#777570] px-1.5 py-0.5 rounded font-mono">.csv</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {filteredSettlements.length === 0 ? (
                  <div className="bg-white rounded-2xl p-6 border border-[#E8E6E1] text-center space-y-1">
                    <p className="text-[13px] font-bold text-[#171717]">No payouts for this period</p>
                    <p className="text-[11.5px] text-[#777570]">Try selecting another month or &quot;All&quot;</p>
                  </div>
                ) : (
                  filteredSettlements.map((settlement) => {
                  const isExpanded = expandedSettlementId === settlement.id;
                  return (
                    <div
                      key={settlement.id}
                      className="bg-white rounded-2xl p-3 border border-[#E8E6E1] shadow-2xs space-y-2 hover:border-[#171717]/25 transition-all"
                    >
                      {/* Clickable Card Header */}
                      <div
                        onClick={() => {
                          haptics.tap();
                          setExpandedSettlementId(isExpanded ? null : settlement.id);
                        }}
                        className="cursor-pointer space-y-1.5"
                      >
                        {/* Top Meta: Status Badge + Date/Time + UTR */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                            <span className="shrink-0 whitespace-nowrap px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-[#2FA66A]/15 text-[#1E774A] flex items-center gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>Settled to Bank</span>
                            </span>
                            <span className="text-[10.5px] text-[#777570] whitespace-nowrap">
                              {settlement.date} · {settlement.time}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-[#777570] shrink-0">
                            <span className="text-[10px] font-mono font-bold text-[#777570] whitespace-nowrap">
                              UTR: {settlement.utrNumber.slice(0, 7)}...
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </div>
                        </div>

                        {/* Amount & Period */}
                        <div>
                          <div className="text-[16px] font-extrabold text-[#171717] leading-tight">
                            ₹{settlement.settledAmount.toLocaleString('en-IN')}
                          </div>
                          <p className="text-[11px] text-[#777570] mt-0.5">
                            {settlement.period} · {settlement.payoutMode}
                          </p>
                        </div>
                      </div>

                      {/* Expandable Breakdown Details */}
                      {isExpanded && (
                        <div className="pt-2 border-t border-[#F1F0EC] space-y-1.5 text-[11px] bg-[#F7F7F5] p-2.5 rounded-xl">
                          <div className="flex justify-between">
                            <span className="text-[#777570]">Full UTR Ref:</span>
                            <span className="font-mono font-bold text-[#171717]">
                              {settlement.utrNumber}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#777570]">Gross Booking Volume:</span>
                            <span className="font-bold text-[#171717]">
                              ₹{settlement.grossAmount.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#777570]">Gateway Deductions:</span>
                            <span className="font-bold text-[#2FA66A]">
                              ₹{settlement.feeDeductions.toLocaleString('en-IN')} (0% fee)
                            </span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-[#E8E6E1]">
                            <span className="font-bold text-[#171717]">
                              Net to {settlement.bankName}:
                            </span>
                            <span className="font-extrabold text-[#2FA66A]">
                              ₹{settlement.settledAmount.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

