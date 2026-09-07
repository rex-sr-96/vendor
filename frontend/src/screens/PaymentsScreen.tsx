import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  ChevronRight,
  CheckCircle2,
  Clock,
  Building2,
  Wallet,
  Calendar,
  CreditCard,
  Banknote,
  Download,
  ShieldCheck,
  Zap,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  FileText,
  FileCode,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  AlertCircle,
  ExternalLink,
  Phone,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
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
import { Booking, SettlementRecord } from '../types';

type PaymentTab = 'booking' | 'settlement';

export const PaymentsScreen: React.FC = () => {
  const {
    bookings,
    setSelectedBookingId,
    setActiveModal,
    navigateTo,
    paymentSettings,
    settlements,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<PaymentTab>('booking');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Pending' | 'Cancelled'>('All');
  const [selectedBookingDate, setSelectedBookingDate] = useState<string>('Today');
  const [isBookingPickerOpen, setIsBookingPickerOpen] = useState<boolean>(false);

  const [selectedSettlementMonth, setSelectedSettlementMonth] = useState<string>('Aug 2026');
  const [isSettlementPickerOpen, setIsSettlementPickerOpen] = useState<boolean>(false);

  const [expandedSettlementId, setExpandedSettlementId] = useState<string | null>(null);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Mobile Bottom Sheet Details State
  const [activeCollectionDetail, setActiveCollectionDetail] = useState<Booking | null>(null);
  const [activeSettlementDetail, setActiveSettlementDetail] = useState<SettlementRecord | null>(null);
  const [copiedUtr, setCopiedUtr] = useState<boolean>(false);

  // Dynamic Date calculations
  const getDynamicTodayStr = () => {
    const d = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };
  const getDynamicYesterdayStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const todayDateStr = getDynamicTodayStr();
  const yesterdayDateStr = getDynamicYesterdayStr();

  // Date-filtered bookings (for Booking calendar tab)
  const activeBookings = bookings.filter((b) => {
    if (selectedBookingDate === 'Today') return b.date === todayDateStr || b.date === '28 Aug 2026';
    if (selectedBookingDate === 'Yesterday') return b.date === yesterdayDateStr || b.date === '27 Aug 2026';
    if (selectedBookingDate === 'All') return true;
    return b.date === selectedBookingDate;
  });

  // Revenue amounts for selected date
  const bookingTotalAmount = activeBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const bookingPaidAmount = activeBookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
  const bookingPendingAmount = activeBookings.reduce((sum, b) => sum + (b.balanceAmount || 0), 0);

  // Payment method breakdown for selected date (Online Link / Razorpay vs Physical Cash)
  const bookingOnlinePaid = activeBookings
    .filter((b) => b.paymentMethod !== 'Cash')
    .reduce((sum, b) => sum + (b.paidAmount || 0), 0);
  const bookingCashPaid = activeBookings
    .filter((b) => b.paymentMethod === 'Cash')
    .reduce((sum, b) => sum + (b.paidAmount || 0), 0);

  // Settlement metrics & Monthly Filter
  const filteredSettlements = settlements.filter((s) => {
    if (selectedSettlementMonth === 'All') return true;
    return s.date.includes(selectedSettlementMonth);
  });

  const totalSettledAmount = filteredSettlements
    .filter((s) => s.type !== 'refund_debit')
    .reduce((sum, s) => sum + (s.settledAmount || 0), 0);
  const totalRefundDebits = filteredSettlements
    .filter((s) => s.type === 'refund_debit')
    .reduce((sum, s) => sum + Math.abs(s.settledAmount || 0), 0);
  // Refunds issued for the selected date (booking tab)
  const bookingRefundAmount = activeBookings
    .filter((b) => b.status === 'Cancelled' && (b.refundAmount || 0) > 0)
    .reduce((sum, b) => sum + (b.refundAmount || 0), 0);

  // Dynamic pending settlement balance (confirmed online collections minus what was already settled)
  const onlineSettlablePaid = bookings
    .filter((b) => b.status === 'Confirmed' && b.paymentMethod !== 'Cash')
    .reduce((sum, b) => sum + (b.paidAmount || 0), 0);
  const pendingSettlementBalance = Math.max(0, onlineSettlablePaid - totalSettledAmount);

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


  const handleExportStatement = (format: 'pdf' | 'excel' | 'csv') => {
    haptics.tap();
    setShowExportDropdown(false);
    if (activeTab === 'booking') {
      const label = selectedBookingDate === 'Today' ? '28Aug2026' : selectedBookingDate.replace(/\s+/g, '_');
      if (format === 'pdf') {
        exportBookingsToPDF(filteredBookings, `TurfTown Collections`, selectedBookingDate, `turftown_payments_${label}.pdf`);
        showToast('PDF Exported', 'Booking payment report downloaded as PDF.', 'success');
      } else if (format === 'excel') {
        exportBookingsToExcel(filteredBookings, `TurfTown Collections - ${selectedBookingDate}`, `turftown_payments_${label}.xlsx`);
        showToast('Excel Exported', 'Booking payment report downloaded as Excel (.xlsx).', 'success');
      } else {
        exportPaymentCollectionsToCSV(filteredBookings, `turftown_payments_${label}`);
        showToast('CSV Exported', 'Booking payment report downloaded as CSV.', 'success');
      }
    } else {
      const label = selectedSettlementMonth.replace(/\s+/g, '_');
      if (format === 'pdf') {
        exportSettlementsToPDF(filteredSettlements, `TurfTown Settlements - ${selectedSettlementMonth}`, `turftown_settlements_${label}.pdf`);
        showToast('PDF Exported', 'Bank settlement statements downloaded as PDF.', 'success');
      } else if (format === 'excel') {
        exportSettlementsToExcel(filteredSettlements, `TurfTown Settlements - ${selectedSettlementMonth}`, `turftown_settlements_${label}.xlsx`);
        showToast('Excel Exported', 'Bank settlement statements downloaded as Excel (.xlsx).', 'success');
      } else {
        exportSettlementsToCSV(filteredSettlements, `turftown_settlements_${label}`);
        showToast('CSV Exported', 'Bank settlement statements downloaded as CSV.', 'success');
      }
    }
  };

  // Filtered booking records by search and status
  const filteredBookings = activeBookings.filter((b) => {
    const matchesSearch =
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.courtName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.sport.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'All'
        ? true
        : statusFilter === 'Paid'
        ? b.balanceAmount === 0 && b.status !== 'Cancelled'
        : statusFilter === 'Pending'
        ? b.balanceAmount > 0 && b.status !== 'Cancelled'
        : statusFilter === 'Cancelled'
        ? b.status === 'Cancelled'
        : true;

    return matchesSearch && matchesStatus;
  });

  const availableBookingDates = [
    { label: 'Today (28 Aug 2026)', value: 'Today' },
    { label: 'Yesterday (27 Aug 2026)', value: 'Yesterday' },
    { label: '26 Aug 2026', value: '26 Aug 2026' },
    { label: '25 Aug 2026', value: '25 Aug 2026' },
    { label: '24 Aug 2026', value: '24 Aug 2026' },
    { label: 'All Booking Records', value: 'All' },
  ];

  const availableSettlementMonths = [
    { label: 'August 2026 (Current)', value: 'Aug 2026' },
    { label: 'July 2026', value: 'Jul 2026' },
    { label: 'June 2026', value: 'Jun 2026' },
    { label: 'May 2026', value: 'May 2026' },
    { label: 'All Settlement Records', value: 'All' },
  ];

  return (
    <div className="pb-28 sm:pb-20 pt-2 sm:pt-1 px-3.5 sm:px-0 w-full space-y-4 select-none animate-in fade-in duration-200">
      {/* Centralized Date Picker Sheet (Bookings) */}
      <DateMonthPickerSheet
        isOpen={isBookingPickerOpen}
        onClose={() => setIsBookingPickerOpen(false)}
        title="Select Ledger Date"
        mode="date"
        themeColor="orange"
        activeSelection={selectedBookingDate}
        availableDates={availableBookingDates}
        onSelect={(val) => setSelectedBookingDate(val)}
      />

      {/* Centralized Month Picker Sheet (Settlements) */}
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

      {/* ========================================================================= */}
      {/* 1. TOP HEADER & QUICK ACTION STRIP                                        */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[#E8E6E1]">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[20px] sm:text-[22px] font-black text-[#171717] tracking-tight">
                Payments & Financial Ledger
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[10.5px] font-black bg-[#2FA66A]/10 text-[#2FA66A] flex items-center gap-1 border border-[#2FA66A]/20">
                <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Automated Bank Settlements</span>
              </span>
            </div>
            <p className="text-[11.5px] sm:text-[12px] font-medium text-[#777570] mt-0.5 hidden sm:block">
              Real-time collection ledger, dues tracking & automated bank settlement transfers
            </p>
          </div>

          {/* Quick Header Actions on Mobile */}
          <div className="flex sm:hidden items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                haptics.tap();
                navigateTo('payment_settings');
              }}
              className="w-8.5 h-8.5 rounded-xl bg-white border border-[#E8E6E1] flex items-center justify-center text-[#171717] active-press shadow-2xs cursor-pointer"
              title="Bank Account"
            >
              <Building2 className="w-4 h-4 text-[#777570]" />
            </button>
            <button
              onClick={() => {
                haptics.tap();
                setShowExportDropdown(!showExportDropdown);
              }}
              className="w-8.5 h-8.5 rounded-xl bg-white border border-[#E8E6E1] flex items-center justify-center text-[#171717] active-press shadow-2xs cursor-pointer"
              title="Export Statements"
            >
              <Download className="w-4 h-4 text-[#FF6B2C]" />
            </button>
          </div>
        </div>

        {/* Top Header Actions (Desktop) */}
        <div className="hidden sm:flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Statement Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                haptics.tap();
                setShowExportDropdown(!showExportDropdown);
              }}
              className="h-9 px-3.5 rounded-xl bg-white border border-[#E8E6E1] text-[#171717] hover:border-[#171717] text-[12px] font-extrabold flex items-center gap-1.5 shadow-2xs active-press cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#FF6B2C]" />
              <span>Export</span>
              <ChevronDown className={`w-3 h-3 text-[#777570] transition-transform ${showExportDropdown ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showExportDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowExportDropdown(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-2xl shadow-2xl border border-[#E8E6E1] p-1.5 z-50 space-y-1"
                  >
                    <button
                      onClick={() => handleExportStatement('pdf')}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl text-[11.5px] font-extrabold text-[#171717] hover:bg-[#FAF9F6] flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-[#D94B4B]" />
                        <span>PDF Statement</span>
                      </div>
                      <span className="text-[9px] bg-[#D94B4B]/10 text-[#D94B4B] px-1 py-0.5 rounded font-mono">.pdf</span>
                    </button>

                    <button
                      onClick={() => handleExportStatement('excel')}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl text-[11.5px] font-extrabold text-[#171717] hover:bg-[#FAF9F6] flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-[#2FA66A]" />
                        <span>Excel Spreadsheet</span>
                      </div>
                      <span className="text-[9px] bg-[#2FA66A]/10 text-[#2FA66A] px-1 py-0.5 rounded font-mono">.xlsx</span>
                    </button>

                    <button
                      onClick={() => handleExportStatement('csv')}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl text-[11.5px] font-extrabold text-[#171717] hover:bg-[#FAF9F6] flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <FileCode className="w-3.5 h-3.5 text-[#171717]" />
                        <span>CSV Data File</span>
                      </div>
                      <span className="text-[9px] bg-[#F1F0EC] text-[#777570] px-1 py-0.5 rounded font-mono">.csv</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Linked Bank Settings */}
          <button
            onClick={() => {
              haptics.tap();
              navigateTo('payment_settings');
            }}
            className="h-9 px-3 rounded-xl bg-[#FAF9F6] hover:bg-[#F1F0EC] border border-[#E8E6E1] text-[#171717] text-[12px] font-bold flex items-center gap-1.5 active-press cursor-pointer transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-[#777570]" />
            <span>Bank Account</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. REFINED & MINIMAL FINTECH KPI METRIC STRIP                             */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Metric 1: Gross Turnaround */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#E8E6E1] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] sm:text-[10.5px] font-black uppercase tracking-wider text-[#777570]">
              Gross Revenue
            </span>
            <span className="w-2 h-2 rounded-full bg-[#FF6B2C]" />
          </div>
          <div className="mt-1.5 sm:mt-2">
            <p className="text-[18px] sm:text-[22px] font-black text-[#171717] tracking-tight">
              ₹{bookingTotalAmount.toLocaleString('en-IN')}
            </p>
            <p className="text-[10.5px] sm:text-[11px] font-medium text-[#777570] mt-0.5 truncate">
              {activeBookings.length} bookings recorded
            </p>
          </div>
        </div>

        {/* Metric 2: Collected Cash & Online */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#E8E6E1] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] sm:text-[10.5px] font-black uppercase tracking-wider text-[#777570]">
              Collected (Paid)
            </span>
            <span className="w-2 h-2 rounded-full bg-[#2FA66A]" />
          </div>
          <div className="mt-1.5 sm:mt-2">
            <p className="text-[18px] sm:text-[22px] font-black text-[#2FA66A] tracking-tight">
              ₹{bookingPaidAmount.toLocaleString('en-IN')}
            </p>
            <p className="text-[10.5px] sm:text-[11px] font-medium text-[#777570] mt-0.5 truncate">
              Online: ₹{bookingOnlinePaid.toLocaleString('en-IN')} · Cash: ₹{bookingCashPaid.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Metric 3: Due Balances */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#E8E6E1] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] sm:text-[10.5px] font-black uppercase tracking-wider text-[#777570]">
              Due Balances
            </span>
            <span className="w-2 h-2 rounded-full bg-[#E7A72F]" />
          </div>
          <div className="mt-1.5 sm:mt-2">
            <p className="text-[18px] sm:text-[22px] font-black text-[#E7A72F] tracking-tight">
              ₹{bookingPendingAmount.toLocaleString('en-IN')}
            </p>
            <p className="text-[10.5px] sm:text-[11px] font-medium text-[#777570] mt-0.5 truncate">
              {activeBookings.filter((b) => (b.balanceAmount || 0) > 0 && b.status !== 'Cancelled').length} players pending
            </p>
          </div>
        </div>

        {/* Metric 4: Refunds Issued */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-red-100 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] sm:text-[10.5px] font-black uppercase tracking-wider text-[#777570]">
              Refunds Issued
            </span>
            <span className="w-2 h-2 rounded-full bg-red-400" />
          </div>
          <div className="mt-1.5 sm:mt-2">
            <p className="text-[18px] sm:text-[22px] font-black text-red-600 tracking-tight">
              {bookingRefundAmount > 0 ? `-₹${bookingRefundAmount.toLocaleString('en-IN')}` : '₹0'}
            </p>
            <p className="text-[10.5px] sm:text-[11px] font-medium text-[#777570] mt-0.5 truncate">
              {activeBookings.filter((b) => b.status === 'Cancelled').length} cancelled bookings
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. STRUCTURED TOOLBAR: TABS + INTEGRATED FILTERS & SEARCH                   */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-3 border border-[#E8E6E1] shadow-2xs space-y-3">
        {/* Row 1: Segmented Primary Tabs & Quick Date Pill */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Main 2 Tabs */}
          {/* View Mode Segmented Pill */}
          <div className="grid grid-cols-2 w-full sm:w-auto sm:flex items-center bg-[#FAF9F6] p-1 rounded-xl border border-[#E8E6E1]">
            <button
              onClick={() => {
                haptics.tap();
                setActiveTab('booking');
              }}
              className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 rounded-lg text-[12px] sm:text-[12.5px] font-black transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                activeTab === 'booking'
                  ? 'bg-[#171717] text-white shadow-xs'
                  : 'text-[#777570] hover:text-[#171717]'
              }`}
            >
              <Wallet className="w-3.5 h-3.5 text-[#FF6B2C]" />
              <span>Collections</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeTab === 'booking' ? 'bg-[#FF6B2C] text-white' : 'bg-[#E8E6E1] text-[#171717]'
                }`}
              >
                {activeBookings.length}
              </span>
            </button>

            <button
              onClick={() => {
                haptics.tap();
                setActiveTab('settlement');
              }}
              className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 rounded-lg text-[12px] sm:text-[12.5px] font-black transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                activeTab === 'settlement'
                  ? 'bg-[#171717] text-white shadow-xs'
                  : 'text-[#777570] hover:text-[#171717]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-[#2FA66A]" />
              <span>Settlements</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#2FA66A]" />
            </button>
          </div>

          {/* Date / Month Picker Pill */}
          {activeTab === 'booking' ? (
            <button
              onClick={() => {
                haptics.tap();
                setIsBookingPickerOpen(true);
              }}
              className="flex items-center justify-between gap-2 bg-[#FAF9F6] hover:bg-[#F1F0EC] border border-[#E8E6E1] px-3 py-1.5 rounded-xl cursor-pointer transition-colors w-full sm:w-auto"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#FF6B2C]" />
                <span className="text-[12px] font-black text-[#171717]">
                  {selectedBookingDate === 'Today'
                    ? 'Today (28 Aug 2026)'
                    : selectedBookingDate === 'Yesterday'
                    ? 'Yesterday (27 Aug 2026)'
                    : selectedBookingDate === 'All'
                    ? 'All Dates'
                    : selectedBookingDate}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-[#777570]" />
            </button>
          ) : (
            <button
              onClick={() => {
                haptics.tap();
                setIsSettlementPickerOpen(true);
              }}
              className="flex items-center justify-between gap-2 bg-[#FAF9F6] hover:bg-[#F1F0EC] border border-[#E8E6E1] px-3 py-1.5 rounded-xl cursor-pointer transition-colors w-full sm:w-auto"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#2FA66A]" />
                <span className="text-[12px] font-black text-[#171717]">
                  {selectedSettlementMonth === 'Aug 2026'
                    ? 'August 2026 (Current)'
                    : selectedSettlementMonth === 'All'
                    ? 'All Months'
                    : selectedSettlementMonth}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-[#777570]" />
            </button>
          )}
        </div>

        {/* Row 2: Search Input & Status Filters (Unified Bar) */}
        {activeTab === 'booking' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#F1F0EC]">
            {/* Search Box */}
            <div className="relative flex items-center bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 flex-1 w-full sm:max-w-md">
              <Search className="w-3.5 h-3.5 text-[#777570] mr-2 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search customer, booking ID, turf, sport..."
                className="w-full text-[12.5px] font-medium text-[#171717] bg-transparent focus:outline-none placeholder-[#A3A099]"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-[#777570] hover:text-[#171717] text-[11px] font-bold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto pb-0.5">
              <span className="text-[11px] font-bold text-[#777570] mr-1 hidden md:inline shrink-0">Status:</span>
              {(['All', 'Paid', 'Pending', 'Cancelled'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    haptics.tap();
                    setStatusFilter(f);
                  }}
                  className={`px-3 py-1 rounded-xl text-[11.5px] font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    statusFilter === f
                      ? f === 'Cancelled' ? 'bg-red-600 text-white shadow-xs' : 'bg-[#171717] text-white shadow-xs'
                      : 'bg-[#FAF9F6] text-[#777570] hover:text-[#171717] border border-[#E8E6E1]'
                  }`}
                >
                  {f === 'All' ? 'All' : f === 'Paid' ? 'Paid in Full' : f === 'Pending' ? 'Pending Due' : 'Cancelled'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. MAIN CONTENT AREA: STRUCTURED FINTECH LEDGER                           */}
      {/* ========================================================================= */}
      <AnimatePresence mode="wait">
        {activeTab === 'booking' ? (
          /* =========================================================================
             TAB 1: BOOKING COLLECTIONS (Structured Clean Ledger)
             ========================================================================= */
          <motion.div
            key="booking-tab"
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.12 }}
            className="space-y-3"
          >
            {/* Header info strip */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-[12.5px] font-black text-[#171717] uppercase tracking-wider">
                  Verified Collections ({filteredBookings.length})
                </span>
                <span className="text-[11px] font-medium text-[#777570]">
                  · Total Value: ₹{bookingTotalAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11.5px] text-[#777570] hidden sm:flex">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#2FA66A]" />
                  <span>Online: ₹{bookingOnlinePaid.toLocaleString('en-IN')}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Banknote className="w-3.5 h-3.5 text-[#FF6B2C]" />
                  <span>Cash: ₹{bookingCashPaid.toLocaleString('en-IN')}</span>
                </span>
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 border border-[#E8E6E1] text-center space-y-2 shadow-2xs">
                <div className="w-10 h-10 rounded-full bg-[#FAF9F6] flex items-center justify-center mx-auto text-[#777570]">
                  <Wallet className="w-5 h-5" />
                </div>
                <h3 className="text-[14px] font-black text-[#171717]">No booking payment records found</h3>
                <p className="text-[12px] text-[#777570]">
                  Try clearing your search query or selecting a different date from the picker.
                </p>
              </div>
            ) : (
              /* Structured Fintech Rows */
              <div className="bg-white rounded-2xl border border-[#E8E6E1] shadow-2xs overflow-hidden">
                {/* 1. MOBILE NATIVE TRANSACTION CARDS */}
                <div className="block md:hidden divide-y divide-[#F1F0EC]">
                  {filteredBookings.map((b) => {
                    const isPaid = (b.balanceAmount || 0) === 0 && b.status !== 'Cancelled';
                    const isCancelled = b.status === 'Cancelled';

                    return (
                      <div
                        key={`mob-${b.id}`}
                        onClick={() => {
                          haptics.tap();
                          setActiveCollectionDetail(b);
                        }}
                        className="p-3.5 bg-white hover:bg-[#FAF9F6] active:bg-[#F5F4F0] cursor-pointer transition-colors space-y-2.5"
                      >
                        {/* Top Row: Customer Avatar & Name + Status Pill */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-[12px] shrink-0 ${
                                isCancelled
                                  ? 'bg-red-100 text-red-600'
                                  : 'bg-[#171717] text-white'
                              }`}
                            >
                              {b.customerName.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-[13.5px] font-black text-[#171717] truncate">
                                  {b.customerName}
                                </h4>
                                <span className="font-mono text-[9.5px] font-bold text-[#777570] bg-[#FAF9F6] px-1.5 py-0.2 rounded border border-[#E8E6E1]">
                                  {b.id}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#777570] truncate mt-0.5">
                                {b.sport} · {b.courtName}
                              </p>
                            </div>
                          </div>

                          {/* Status Pill */}
                          {isCancelled ? (
                            <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black bg-red-50 text-red-600 border border-red-200 shrink-0">
                              {b.refundStatus === 'Processed' ? 'Refunded' : 'Cancelled'}
                            </span>
                          ) : isPaid ? (
                            <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black bg-[#2FA66A]/10 text-[#2FA66A] border border-[#2FA66A]/20 shrink-0 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Paid in Full</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black bg-[#E7A72F]/15 text-[#B87C0D] border border-[#E7A72F]/30 shrink-0">
                              Due ₹{b.balanceAmount}
                            </span>
                          )}
                        </div>

                        {/* Middle Row: Time Slot, Date & Channel Tag */}
                        <div className="flex items-center justify-between text-[11px] text-[#777570] bg-[#FAF9F6] p-2 rounded-xl border border-[#F1F0EC]">
                          <div className="flex items-center gap-1.5 font-bold text-[#171717]">
                            <Clock className="w-3.5 h-3.5 text-[#FF6B2C]" />
                            <span>{b.timeSlot}</span>
                            <span className="text-[#A3A099] font-normal">· {b.date}</span>
                          </div>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider border ${
                              b.paymentMethod === 'Cash'
                                ? 'bg-[#2FA66A]/10 border-[#2FA66A]/25 text-[#2FA66A]'
                                : 'bg-[#FF6B2C]/10 border-[#FF6B2C]/25 text-[#FF6B2C]'
                            }`}
                          >
                            {b.paymentMethod === 'Cash' ? 'Cash' : 'Online'}
                          </span>
                        </div>

                        {/* Bottom Row: Amount & Action Buttons */}
                        <div className="flex items-center justify-between gap-2 pt-0.5">
                          <div>
                            <p className="text-[15px] font-black text-[#171717]">
                              ₹{b.totalAmount.toLocaleString('en-IN')}
                            </p>
                            <p className="text-[10.5px] text-[#777570]">
                              Paid: <strong className={isPaid ? 'text-[#2FA66A]' : 'text-[#171717]'}>₹{b.paidAmount.toLocaleString('en-IN')}</strong>
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            {!isPaid && !isCancelled && (
                              <button
                                onClick={() => handleCollect(b.id)}
                                className="h-7.5 px-3 rounded-xl bg-gradient-to-r from-[#FF6B2C] to-[#e85b1e] hover:from-[#e85b1e] hover:to-[#db4a0b] text-white text-[11px] font-black shadow-2xs active-press cursor-pointer flex items-center gap-1"
                              >
                                <span>Collect ₹{b.balanceAmount}</span>
                              </button>
                            )}
                            <button
                              onClick={() => {
                                haptics.tap();
                                setActiveCollectionDetail(b);
                              }}
                              className="h-7.5 px-2.5 rounded-xl bg-[#FAF9F6] border border-[#E8E6E1] text-[#171717] text-[11px] font-extrabold flex items-center gap-0.5 active-press cursor-pointer"
                            >
                              <span>Details</span>
                              <ChevronRight className="w-3 h-3 text-[#777570]" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 2. DESKTOP STRUCTURED TABLE ROWS */}
                <div className="hidden md:block divide-y divide-[#F1F0EC]">
                  {/* Structured Table Column Header (Desktop) */}
                  <div className="grid grid-cols-[minmax(240px,1.2fr)_170px_130px_130px_190px] items-center px-4 py-2.5 bg-[#FAF9F6] border-b border-[#E8E6E1] text-[10.5px] font-black text-[#777570] uppercase tracking-wider">
                    <div>Customer & Booking</div>
                    <div>Slot & Channel</div>
                    <div className="text-right pr-2">Amount / Paid</div>
                    <div className="text-center">Status</div>
                    <div className="text-right pr-1">Actions</div>
                  </div>

                  {filteredBookings.map((b) => {
                    const isPaid = (b.balanceAmount || 0) === 0 && b.status !== 'Cancelled';
                    const isCancelled = b.status === 'Cancelled';

                    return (
                      <div
                        key={b.id}
                        className={`p-4 grid grid-cols-[minmax(240px,1.2fr)_170px_130px_130px_190px] items-center hover:bg-[#FAF9F6]/60 transition-colors ${isCancelled ? 'opacity-80' : ''}`}
                      >
                        {/* Column 1: Customer, Sport & Booking Reference */}
                        <div className="flex items-center gap-3 min-w-0 pr-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[13px] shrink-0 ${isCancelled ? 'bg-red-100 text-red-600' : 'bg-[#171717] text-white'}`}>
                            {b.customerName.slice(0, 2).toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="text-[13.5px] font-black text-[#171717] tracking-tight truncate">
                                {b.customerName}
                              </h3>
                              <span className="font-mono text-[10px] font-bold text-[#777570] bg-[#FAF9F6] px-1.5 py-0.5 rounded border border-[#E8E6E1]">
                                {b.id}
                              </span>
                              {isCancelled && (
                                <span className="text-[9px] font-black uppercase text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                                  Cancelled
                                </span>
                              )}
                            </div>
                            <p className="text-[11.5px] text-[#777570] mt-0.5 truncate">
                              {b.sport} · {b.courtName}
                              {isCancelled && b.cancellationReason && (
                                <span className="ml-1 italic">· "{b.cancellationReason.substring(0, 30)}{b.cancellationReason.length > 30 ? '…' : ''}"</span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Column 2: Schedule & Channel Badge */}
                        <div className="text-[12px] pr-2">
                          <div className="flex items-center gap-1.5 text-[#171717] font-bold">
                            <Clock className="w-3.5 h-3.5 text-[#FF6B2C]" />
                            <span>{b.timeSlot}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10.5px] text-[#777570] font-medium">{b.date}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9.5px] font-extrabold uppercase tracking-wide border ${
                                b.paymentMethod === 'Cash'
                                  ? 'bg-[#2FA66A]/10 border-[#2FA66A]/25 text-[#2FA66A]'
                                  : 'bg-[#FF6B2C]/10 border-[#FF6B2C]/25 text-[#FF6B2C]'
                              }`}
                            >
                              {b.paymentMethod === 'Cash' ? 'Cash' : 'Online'}
                            </span>
                          </div>
                        </div>

                        {/* Column 3: Amount & Paid */}
                        <div className="text-right pr-2">
                          <p className={`text-[14.5px] font-black leading-none ${isCancelled ? 'text-[#777570] line-through' : 'text-[#171717]'}`}>
                            ₹{b.totalAmount.toLocaleString('en-IN')}
                          </p>
                          {isCancelled && (b.refundAmount || 0) > 0 ? (
                            <p className="text-[11px] text-red-600 font-black mt-1">
                              -₹{(b.refundAmount || 0).toLocaleString('en-IN')} Refunded
                            </p>
                          ) : (
                            <p className="text-[11px] text-[#777570] font-medium mt-1">
                              Paid: <strong className={isPaid ? 'text-[#2FA66A]' : 'text-[#171717]'}>₹{b.paidAmount.toLocaleString('en-IN')}</strong>
                            </p>
                          )}
                        </div>

                        {/* Column 4: Status */}
                        <div className="flex items-center justify-center">
                          {isCancelled ? (
                            <span className="px-2.5 py-1 rounded-full text-[10.5px] font-black bg-red-50 text-red-600 flex items-center gap-1 border border-red-200 whitespace-nowrap">
                              <X className="w-3 h-3" />
                              <span>{(b.refundStatus === 'Processed') ? 'Refunded' : 'Cancelled'}</span>
                            </span>
                          ) : isPaid ? (
                            <span className="px-2.5 py-1 rounded-full text-[10.5px] font-black bg-[#2FA66A]/10 text-[#2FA66A] flex items-center gap-1 border border-[#2FA66A]/20 whitespace-nowrap">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Paid in Full</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10.5px] font-black bg-[#E7A72F]/10 text-[#B87C0D] flex items-center gap-1 border border-[#E7A72F]/20 whitespace-nowrap">
                              <Clock className="w-3 h-3" />
                              <span>Due ₹{b.balanceAmount.toLocaleString('en-IN')}</span>
                            </span>
                          )}
                        </div>

                        {/* Column 5: Actions */}
                        <div className="flex items-center justify-end gap-2">
                          {!isPaid && !isCancelled && (
                            <button
                              onClick={() => handleCollect(b.id)}
                              className="h-8 px-2.5 rounded-xl bg-[#FF6B2C] hover:bg-[#e85b1e] text-white text-[11px] font-black active-press cursor-pointer transition-colors shadow-2xs whitespace-nowrap"
                            >
                              Collect ₹{b.balanceAmount}
                            </button>
                          )}
                          <button
                            onClick={() => handleView(b.id)}
                            className="h-8 px-3 rounded-xl bg-[#FAF9F6] hover:bg-[#F1F0EC] border border-[#E8E6E1] text-[#171717] text-[11.5px] font-bold active-press cursor-pointer transition-colors flex items-center gap-1 shrink-0 whitespace-nowrap"
                          >
                            <span>Details</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          /* =========================================================================
             TAB 2: BANK SETTLEMENTS (Structured Clean Payouts)
             ========================================================================= */
          <motion.div
            key="settlement-tab"
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.12 }}
            className="space-y-4"
          >
            {/* Linked Bank Verification Hero Banner */}
            <div className="bg-[#171717] text-white rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5 text-[#2FA66A]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[15px] font-black tracking-tight">{paymentSettings.bankName}</h3>
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-black bg-[#2FA66A]/20 text-[#2FA66A]">
                      Verified Active
                    </span>
                  </div>
                  <p className="text-[12px] text-white/70 mt-0.5 font-mono">
                    A/C {paymentSettings.accountNumberMasked} · IFSC {paymentSettings.ifscCode} · Commercial Current
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/60 block">
                    Total Settled ({selectedSettlementMonth})
                  </span>
                  <span className="text-[20px] font-black text-[#2FA66A] block">
                    ₹{totalSettledAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Settlement Payout Rows */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[12.5px] font-black text-[#171717] uppercase tracking-wider">
                  Transfer Statements ({filteredSettlements.length})
                </span>
                <button
                  onClick={() => handleExportStatement('pdf')}
                  className="text-[11.5px] font-bold text-[#2FA66A] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Statements (.PDF)</span>
                </button>
              </div>

              {filteredSettlements.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 border border-[#E8E6E1] text-center space-y-2 shadow-2xs">
                  <Building2 className="w-8 h-8 text-[#777570] mx-auto" />
                  <h3 className="text-[14px] font-black text-[#171717]">No settlement transfers found</h3>
                  <p className="text-[12px] text-[#777570]">
                    No bank payout records exist for {selectedSettlementMonth}.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-[#E8E6E1] shadow-2xs overflow-hidden">
                  {/* 1. MOBILE NATIVE SETTLEMENT CARDS */}
                  <div className="block md:hidden divide-y divide-[#F1F0EC]">
                    {filteredSettlements.map((s) => {
                      const isRefundDebit = s.type === 'refund_debit';
                      return (
                        <div
                          key={`mob-set-${s.id}`}
                          onClick={() => {
                            haptics.tap();
                            setActiveSettlementDetail(s);
                          }}
                          className={`p-3.5 bg-white hover:bg-[#FAF9F6] active:bg-[#F5F4F0] cursor-pointer transition-colors space-y-2.5 ${
                            isRefundDebit ? 'bg-red-50/20' : ''
                          }`}
                        >
                          {/* Top Row: Icon + Reference ID + Status */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 ${
                                  isRefundDebit ? 'bg-red-100 text-red-600' : 'bg-[#2FA66A]/10 text-[#2FA66A]'
                                }`}
                              >
                                {isRefundDebit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                              </div>
                              <div className="min-w-0">
                                <span className="font-mono text-[12.5px] font-black text-[#171717] block truncate">
                                  {s.id}
                                </span>
                                <span className="text-[10.5px] text-[#777570] block">
                                  {s.date} · {s.payoutMode || 'Instant IMPS'}
                                </span>
                              </div>
                            </div>

                            <span
                              className={`px-2 py-0.5 rounded-full text-[9.5px] font-black border shrink-0 ${
                                isRefundDebit
                                  ? 'bg-red-50 text-red-600 border-red-200'
                                  : 'bg-[#2FA66A]/10 text-[#2FA66A] border-[#2FA66A]/20'
                              }`}
                            >
                              {s.status}
                            </span>
                          </div>

                          {/* Bottom Row: Amount + Bank + Action */}
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#F1F0EC]">
                            <div>
                              <p
                                className={`text-[15.5px] font-black leading-tight ${
                                  isRefundDebit ? 'text-red-600' : 'text-[#2FA66A]'
                                }`}
                              >
                                {isRefundDebit
                                  ? `-₹${Math.abs(s.settledAmount).toLocaleString('en-IN')}`
                                  : `+₹${s.settledAmount.toLocaleString('en-IN')}`}
                              </p>
                              <p className="text-[10px] text-[#777570]">
                                {s.bankName || paymentSettings.bankName} · {s.utrNumber ? `UTR: ${s.utrNumber.slice(-6)}` : 'Processed'}
                              </p>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                haptics.tap();
                                setActiveSettlementDetail(s);
                              }}
                              className="h-7 px-2.5 rounded-xl bg-[#FAF9F6] border border-[#E8E6E1] text-[#171717] text-[11px] font-extrabold flex items-center gap-1 active-press cursor-pointer"
                            >
                              <span>Audit Split</span>
                              <ChevronRight className="w-3 h-3 text-[#777570]" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 2. DESKTOP STRUCTURED TABLE ROWS */}
                  <div className="hidden md:block divide-y divide-[#F1F0EC]">
                    {/* Structured Table Column Header (Bank Settlements) */}
                    <div className="grid grid-cols-[minmax(240px,1.2fr)_170px_130px_130px_190px] items-center px-4 py-2.5 bg-[#FAF9F6] border-b border-[#E8E6E1] text-[10.5px] font-black text-[#777570] uppercase tracking-wider">
                      <div>Transfer Reference & Date</div>
                      <div>Destination Bank</div>
                      <div className="text-right pr-2">Net Credited</div>
                      <div className="text-center">Status</div>
                      <div className="text-right pr-1">Action</div>
                    </div>

                    {filteredSettlements.map((s) => {
                      const isExpanded = expandedSettlementId === s.id;
                      const isRefundDebit = s.type === 'refund_debit';
                      return (
                        <div key={s.id} className={`p-4 hover:bg-[#FAF9F6]/60 transition-colors ${isRefundDebit ? 'bg-red-50/40' : ''}`}>
                          <div className="grid grid-cols-[minmax(240px,1.2fr)_170px_130px_130px_190px] items-center">
                            {/* Column 1: Transfer Ref & Date */}
                            <div className="flex items-center gap-3 min-w-0 pr-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isRefundDebit ? 'bg-red-100 text-red-600' : 'bg-[#2FA66A]/10 text-[#2FA66A]'}`}>
                                {isRefundDebit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-[13px] font-black text-[#171717]">{s.id}</span>
                                  {isRefundDebit && (
                                    <span className="text-[9px] font-black uppercase text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">Refund</span>
                                  )}
                                </div>
                                <p className="text-[11px] text-[#777570] mt-0.5">
                                  {isRefundDebit ? s.refundNote : `${s.date} · UTR: `}
                                  {!isRefundDebit && <span className="font-mono text-[#171717] font-semibold">{s.utrNumber}</span>}
                                </p>
                              </div>
                            </div>

                            {/* Column 2: Bank & Payout Mode */}
                            <div className="text-[12px] text-[#777570] pr-2">
                              <p className="font-bold text-[#171717]">{s.bankName || 'HDFC Bank'}</p>
                              <p className="text-[11px] mt-0.5">{s.payoutMode || 'Instant IMPS'}</p>
                            </div>

                            {/* Column 3: Amount */}
                            <div className="text-right pr-2">
                              <p className={`text-[15.5px] font-black leading-none ${isRefundDebit ? 'text-red-600' : 'text-[#2FA66A]'}`}>
                                {isRefundDebit ? `-₹${Math.abs(s.settledAmount).toLocaleString('en-IN')}` : `₹${s.settledAmount.toLocaleString('en-IN')}`}
                              </p>
                              <p className="text-[10.5px] text-[#777570] font-medium mt-1">
                                {isRefundDebit ? 'Refunded to Customer' : 'Net Credited'}
                              </p>
                            </div>

                            {/* Column 4: Status */}
                            <div className="flex items-center justify-center">
                              <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-black border whitespace-nowrap ${
                                isRefundDebit
                                  ? 'bg-red-50 text-red-600 border-red-200'
                                  : 'bg-[#2FA66A]/10 text-[#2FA66A] border-[#2FA66A]/20'
                              }`}>
                                {s.status}
                              </span>
                            </div>

                            {/* Column 5: Action */}
                            <div className="flex items-center justify-end">
                              {!isRefundDebit && (
                                <button
                                  onClick={() => setExpandedSettlementId(isExpanded ? null : s.id)}
                                  className="h-8 px-3 rounded-xl bg-[#FAF9F6] hover:bg-[#F1F0EC] border border-[#E8E6E1] text-[11.5px] font-bold text-[#171717] cursor-pointer flex items-center gap-1 transition-colors whitespace-nowrap"
                                >
                                  <span>Audit Split</span>
                                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Breakdown Expandable Drawer */}
                          {isExpanded && !isRefundDebit && (
                            <div className="mt-3 pt-3 border-t border-[#F1F0EC] bg-[#FAF9F6] p-3 rounded-xl text-[12px] space-y-1.5">
                              <div className="flex justify-between text-[#777570]">
                                <span>Gross Turnaround (Online Slots):</span>
                                <strong className="text-[#171717]">₹{(s.grossAmount || s.settledAmount || 0).toLocaleString('en-IN')}</strong>
                              </div>
                              <div className="flex justify-between text-[#777570]">
                                <span>Cash Convenience Fee Recovery (5% + 18% GST):</span>
                                <span className="text-[#B87C0D] font-semibold">-₹178 (2 Cash Bookings @ ₹89)</span>
                              </div>
                              <div className="flex justify-between text-[#777570]">
                                <span>Bank Gateway Processing Fee:</span>
                                <span className="text-[#777570]">₹0 (Platform Waived)</span>
                              </div>
                              <div className="flex justify-between text-[#171717] font-black pt-1 border-t border-[#E8E6E1]">
                                <span>Net Credited to Linked Account:</span>
                                <span className="text-[#2FA66A]">₹{(s.settledAmount || 0).toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 5. NATIVE MOBILE BOTTOM SHEET: BOOKING PAYMENT DETAILS                    */}
      {/* ========================================================================= */}
      {activeCollectionDetail && (
        <div
          onClick={() => setActiveCollectionDetail(null)}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200 select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-lg bg-white rounded-t-[32px] sm:rounded-3xl p-5 sm:p-6 border border-[#E8E6E1] shadow-2xl space-y-4 max-h-[88vh] sm:max-h-[90vh] overflow-y-auto pb-safe animate-in slide-in-from-bottom duration-200"
          >
            {/* Native Mobile Drag Handle */}
            <div className="w-12 h-1.5 bg-[#E2E0D8] rounded-full mx-auto -mt-1 mb-2 sm:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F0EC]">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-2xl bg-[#171717] text-white flex items-center justify-center font-black text-[14px]">
                  {activeCollectionDetail.customerName.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-[15.5px] font-black text-[#171717]">
                      {activeCollectionDetail.customerName}
                    </h3>
                    <span className="font-mono text-[10px] font-bold text-[#777570] bg-[#FAF9F6] px-1.5 py-0.2 rounded border border-[#E8E6E1]">
                      {activeCollectionDetail.id}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-[#777570] mt-0.5">
                    {activeCollectionDetail.sport} · {activeCollectionDetail.courtName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveCollectionDetail(null)}
                className="w-8 h-8 rounded-full bg-[#FAF9F6] flex items-center justify-center text-[#777570] hover:text-[#171717] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer Contact Action Buttons */}
            <div>
              <a
                href={`tel:${activeCollectionDetail.customerPhone}`}
                className="w-full h-9.5 rounded-xl bg-[#FAF9F6] border border-[#E8E6E1] hover:border-[#171717] text-[#171717] font-bold text-[11.5px] flex items-center justify-center gap-1.5 cursor-pointer active-press transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#FF6B2C]" />
                <span>Call Customer ({activeCollectionDetail.customerPhone})</span>
              </a>
            </div>

            {/* Booking Schedule Summary */}
            <div className="bg-[#FAF9F6] rounded-2xl p-3.5 border border-[#E8E6E1] space-y-2 text-[12px]">
              <div className="flex justify-between items-center text-[#777570]">
                <span>Scheduled Match:</span>
                <span className="font-bold text-[#171717] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#FF6B2C]" />
                  {activeCollectionDetail.timeSlot}
                </span>
              </div>
              <div className="flex justify-between items-center text-[#777570]">
                <span>Date & Pitch:</span>
                <span className="font-bold text-[#171717]">
                  {activeCollectionDetail.date} · {activeCollectionDetail.courtName}
                </span>
              </div>
              <div className="flex justify-between items-center text-[#777570]">
                <span>Payment Channel:</span>
                <span className="font-black text-[#171717]">
                  {activeCollectionDetail.paymentMethod === 'Cash' ? 'Physical Cash at Counter' : 'Online Razorpay / UPI'}
                </span>
              </div>
            </div>

            {/* Financial Ledger Breakdown Grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-[#FAF9F6] p-2.5 rounded-2xl border border-[#E8E6E1]">
                <span className="text-[10px] text-[#777570] uppercase font-bold block">Total Fee</span>
                <span className="text-[15px] font-black text-[#171717] mt-0.5 block">
                  ₹{activeCollectionDetail.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="bg-[#2FA66A]/10 p-2.5 rounded-2xl border border-[#2FA66A]/25">
                <span className="text-[10px] text-[#1E774A] uppercase font-bold block">Paid Amount</span>
                <span className="text-[15px] font-black text-[#2FA66A] mt-0.5 block">
                  ₹{activeCollectionDetail.paidAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div
                className={`p-2.5 rounded-2xl border ${
                  activeCollectionDetail.balanceAmount > 0
                    ? 'bg-[#FF6B2C]/10 border-[#FF6B2C]/30'
                    : 'bg-[#FAF9F6] border-[#E8E6E1]'
                }`}
              >
                <span className="text-[10px] text-[#777570] uppercase font-bold block">Balance Due</span>
                <span
                  className={`text-[15px] font-black mt-0.5 block ${
                    activeCollectionDetail.balanceAmount > 0 ? 'text-[#FF6B2C]' : 'text-[#777570]'
                  }`}
                >
                  ₹{activeCollectionDetail.balanceAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              {activeCollectionDetail.balanceAmount > 0 && activeCollectionDetail.status !== 'Cancelled' ? (
                <button
                  onClick={() => {
                    const bId = activeCollectionDetail.id;
                    setActiveCollectionDetail(null);
                    handleCollect(bId);
                  }}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-[#FF6B2C] to-[#e85b1e] hover:from-[#e85b1e] hover:to-[#db4a0b] text-white font-black text-[13px] flex items-center justify-center gap-2 shadow-md shadow-[#FF6B2C]/30 active-press cursor-pointer transition-all"
                >
                  <span>Collect Balance (₹{activeCollectionDetail.balanceAmount})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="bg-[#2FA66A]/10 rounded-xl p-3 border border-[#2FA66A]/25 flex items-center gap-2 text-[12px] text-[#1E774A] font-bold">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2FA66A]" />
                  <span>Full payment verified and recorded in financial ledger.</span>
                </div>
              )}

              <button
                onClick={() => {
                  const bId = activeCollectionDetail.id;
                  setActiveCollectionDetail(null);
                  handleView(bId);
                }}
                className="w-full h-10 rounded-xl bg-[#FAF9F6] hover:bg-[#F1F0EC] border border-[#E8E6E1] text-[#171717] font-bold text-[12px] flex items-center justify-center gap-1.5 cursor-pointer active-press transition-colors"
              >
                <span>Open Full Match Booking Screen</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#777570]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. NATIVE MOBILE BOTTOM SHEET: BANK SETTLEMENT DETAILS                    */}
      {/* ========================================================================= */}
      {activeSettlementDetail && (
        <div
          onClick={() => setActiveSettlementDetail(null)}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200 select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-lg bg-white rounded-t-[32px] sm:rounded-3xl p-5 sm:p-6 border border-[#E8E6E1] shadow-2xl space-y-4 max-h-[88vh] sm:max-h-[90vh] overflow-y-auto pb-safe animate-in slide-in-from-bottom duration-200"
          >
            {/* Native Mobile Drag Handle */}
            <div className="w-12 h-1.5 bg-[#E2E0D8] rounded-full mx-auto -mt-1 mb-2 sm:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F0EC]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[16px] font-black text-[#171717]">Bank Settlement Transfer</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#2FA66A]/10 text-[#2FA66A] border border-[#2FA66A]/25">
                    ● {activeSettlementDetail.status}
                  </span>
                </div>
                <p className="text-[11.5px] text-[#777570] font-mono mt-0.5">
                  Ref: {activeSettlementDetail.id} · {activeSettlementDetail.date}
                </p>
              </div>
              <button
                onClick={() => setActiveSettlementDetail(null)}
                className="w-8 h-8 rounded-full bg-[#FAF9F6] flex items-center justify-center text-[#777570] hover:text-[#171717] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Hero Net Credited Amount Card */}
            <div className="bg-[#171717] text-white rounded-2xl p-4.5 space-y-2 text-center shadow-md">
              <span className="text-[10.5px] uppercase font-bold text-white/60 tracking-wider block">
                Net Deposited to Linked Account
              </span>
              <p className="text-[28px] font-black text-[#2FA66A] tracking-tight">
                ₹{activeSettlementDetail.settledAmount.toLocaleString('en-IN')}
              </p>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-white/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2FA66A]" />
                <span>Direct Credit via {activeSettlementDetail.payoutMode || 'Instant IMPS'}</span>
              </div>
            </div>

            {/* Bank & UTR Reference Box */}
            <div className="bg-[#FAF9F6] rounded-2xl p-3.5 border border-[#E8E6E1] space-y-2 text-[12px]">
              <div className="flex items-center justify-between text-[#777570]">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#2FA66A]" />
                  <span>Destination Bank:</span>
                </span>
                <span className="font-bold text-[#171717]">
                  {activeSettlementDetail.bankName || paymentSettings.bankName}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#777570]">
                <span>Account Number:</span>
                <span className="font-mono font-bold text-[#171717]">
                  {activeSettlementDetail.accountMasked || paymentSettings.accountNumberMasked}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#777570]">
                <span>IFSC Code:</span>
                <span className="font-mono font-bold text-[#171717]">
                  {paymentSettings.ifscCode}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#777570] pt-1 border-t border-[#E8E6E1]">
                <span>Bank UTR Reference:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-black text-[#171717]">
                    {activeSettlementDetail.utrNumber}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(activeSettlementDetail.utrNumber);
                      setCopiedUtr(true);
                      setTimeout(() => setCopiedUtr(false), 2000);
                      showToast('UTR Copied', 'UTR Reference number copied to clipboard.', 'success');
                    }}
                    className="text-[10px] font-bold text-[#FF6B2C] bg-[#FF6B2C]/10 px-1.5 py-0.5 rounded cursor-pointer active-press flex items-center gap-1"
                  >
                    {copiedUtr ? <Check className="w-3 h-3 text-[#2FA66A]" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedUtr ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Financial Deductions Waterfall */}
            <div className="bg-white rounded-2xl p-3.5 border border-[#E8E6E1] space-y-2 text-[12px]">
              <h4 className="text-[11px] font-black uppercase text-[#777570] tracking-wider">
                Transparent Fee Calculation Split
              </h4>
              <div className="flex justify-between text-[#777570]">
                <span>Gross Slot Booking Value:</span>
                <strong className="text-[#171717]">
                  +₹{(activeSettlementDetail.grossAmount || activeSettlementDetail.settledAmount + 178).toLocaleString('en-IN')}
                </strong>
              </div>
              <div className="flex justify-between text-[#777570]">
                <span>Cash Convenience Fee Recovery (5% + 18% GST):</span>
                <span className="text-[#B87C0D] font-semibold">-₹178 (2 Cash Bookings @ ₹89)</span>
              </div>
              <div className="flex justify-between text-[#777570]">
                <span>Bank Payment Gateway Processing:</span>
                <span className="text-[#2FA66A] font-semibold">₹0 (Platform Waived)</span>
              </div>
              <div className="flex justify-between text-[#171717] font-black pt-1.5 border-t border-[#E8E6E1] text-[13px]">
                <span>Net Deposited to Linked Account:</span>
                <span className="text-[#2FA66A]">
                  ₹{activeSettlementDetail.settledAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Download & Actions */}
            <div className="pt-2 space-y-2">
              <button
                onClick={() => {
                  handleExportStatement('pdf');
                  setActiveSettlementDetail(null);
                }}
                className="w-full h-11 rounded-xl bg-[#171717] hover:bg-[#2e2e2e] text-white font-black text-[12.5px] flex items-center justify-center gap-2 cursor-pointer active-press transition-colors shadow-2xs"
              >
                <Download className="w-4 h-4 text-[#2FA66A]" />
                <span>Download Bank Payout Statement (.PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
