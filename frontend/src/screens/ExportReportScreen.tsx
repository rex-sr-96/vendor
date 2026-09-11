import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar as CalendarIcon,
  CheckCircle2,
  Loader2,
  Wallet,
  Clock,
  X,
  Sparkles,
  ArrowRight,
  Layers,
  Check,
  Building,
  CreditCard,
  Banknote,
  TrendingUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { haptics } from '../utils/haptics';
import {
  exportBookingsToPDF,
  exportBookingsToExcel,
  exportBookingsToCSV,
  exportPaymentsToPDF,
  exportPaymentsToExcel,
  exportPaymentCollectionsToCSV,
  exportSettlementsToPDF,
  exportSettlementsToExcel,
  exportSettlementsToCSV,
} from '../utils/exportUtils';
import { Booking, SettlementRecord } from '../types';

type ReportDomain = 'bookings' | 'revenue';
type RevenueReportType = 'booking_payments' | 'bank_settlements';
type TimeframeType = 'day' | 'month' | 'custom' | 'year';
type ExportFormat = 'pdf' | 'excel' | 'csv';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const ExportReportScreen: React.FC = () => {
  const { bookings, settlements, goBack, showToast, venueName } = useApp();

  // 1. Primary Report Domain
  const [reportDomain, setReportDomain] = useState<ReportDomain>('bookings');

  // 2. Revenue Sub-type: Booking Payments (Collections) vs Bank Settlements (Payouts)
  const [revenueType, setRevenueType] = useState<RevenueReportType>('booking_payments');

  // 3. Timeframe: Day, Month, Custom, Year (Settlements strictly: Monthly & Yearly)
  const [timeframe, setTimeframe] = useState<TimeframeType>('day');

  // Selected Day state (stored as string like '28 Aug 2026')
  const [selectedDayText, setSelectedDayText] = useState<string>('28 Aug 2026');

  // Selected Month state (stored as 'Aug 2026' or '2026' for annual)
  const [selectedMonthText, setSelectedMonthText] = useState<string>('Aug 2026');
  const [selectedPickerYear, setSelectedPickerYear] = useState<number>(2026);

  // Selected Year state (stored as '2026' for annual settlements audit)
  const [selectedYearText, setSelectedYearText] = useState<string>('2026');

  // Settlement mode flag (when active, strictly monthly and yearly are shown)
  const isSettlement = reportDomain === 'revenue' && revenueType === 'bank_settlements';

  // Custom Range states
  const [customStartText, setCustomStartText] = useState<string>('01 Aug 2026');
  const [customEndText, setCustomEndText] = useState<string>('31 Aug 2026');

  // Sport Filter
  const [selectedSport, setSelectedSport] = useState<string>('All');

  // Export Format
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Picker Modals State
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState<boolean>(false);
  const [isYearPickerOpen, setIsYearPickerOpen] = useState<boolean>(false);
  const [exportDecadeStart, setExportDecadeStart] = useState<number>(2020);
  const [customPickingTarget, setCustomPickingTarget] = useState<'start' | 'end' | null>(null);

  // Internal Calendar Navigation State
  const [calYear, setCalYear] = useState<number>(2026);
  const [calMonth, setCalMonth] = useState<number>(7); // August (0-indexed)

  // Date parsing helper
  const parseDateToTimestamp = (dateStr: string): number => {
    try {
      if (!dateStr) return 0;
      if (dateStr.includes('-')) return new Date(dateStr).getTime();
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

  // Filtered Bookings (for Booking Schedule & Booking Payments)
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Timeframe filter
      if (timeframe === 'day') {
        const bTime = parseDateToTimestamp(b.date);
        const selTime = parseDateToTimestamp(selectedDayText);
        const bDateObj = new Date(bTime);
        const selDateObj = new Date(selTime);
        const isMatch =
          bDateObj.getFullYear() === selDateObj.getFullYear() &&
          bDateObj.getMonth() === selDateObj.getMonth() &&
          bDateObj.getDate() === selDateObj.getDate();
        if (!isMatch) return false;
      } else if (timeframe === 'month') {
        if (selectedMonthText !== '2026' && !b.date.includes(selectedMonthText)) {
          return false;
        }
      } else if (timeframe === 'year') {
        const bTime = parseDateToTimestamp(b.date);
        const bYear = new Date(bTime).getFullYear().toString();
        if (bYear !== selectedYearText && !b.date.includes(selectedYearText)) {
          return false;
        }
      } else if (timeframe === 'custom') {
        const bTime = parseDateToTimestamp(b.date);
        const start = parseDateToTimestamp(customStartText);
        const end = parseDateToTimestamp(customEndText) + 86400000;
        if (bTime < start || bTime > end) return false;
      }

      // Sport filter (only applies to booking reports)
      if (reportDomain === 'bookings' && selectedSport !== 'All' && b.sport !== selectedSport) {
        return false;
      }

      return true;
    });
  }, [bookings, timeframe, selectedDayText, selectedMonthText, selectedYearText, customStartText, customEndText, selectedSport, reportDomain]);

  // Filtered Settlements (for Bank Settlements)
  const filteredSettlements = useMemo(() => {
    return settlements.filter((s) => {
      if (timeframe === 'day') {
        const sTime = parseDateToTimestamp(s.date);
        const selTime = parseDateToTimestamp(selectedDayText);
        const sDateObj = new Date(sTime);
        const selDateObj = new Date(selTime);
        const isMatch =
          sDateObj.getFullYear() === selDateObj.getFullYear() &&
          sDateObj.getMonth() === selDateObj.getMonth() &&
          sDateObj.getDate() === selDateObj.getDate();
        if (!isMatch) return false;
      } else if (timeframe === 'month') {
        if (selectedMonthText !== '2026' && !s.date.includes(selectedMonthText)) {
          return false;
        }
      } else if (timeframe === 'year') {
        const sTime = parseDateToTimestamp(s.date);
        const sYear = new Date(sTime).getFullYear().toString();
        if (sYear !== selectedYearText && !s.date.includes(selectedYearText)) {
          return false;
        }
      } else if (timeframe === 'custom') {
        const sTime = parseDateToTimestamp(s.date);
        const start = parseDateToTimestamp(customStartText);
        const end = parseDateToTimestamp(customEndText) + 86400000;
        if (sTime < start || sTime > end) return false;
      }
      return true;
    });
  }, [settlements, timeframe, selectedDayText, selectedMonthText, selectedYearText, customStartText, customEndText]);

  // Active items count based on current configuration
  const activeRecordCount = useMemo(() => {
    if (reportDomain === 'bookings') return filteredBookings.length;
    if (revenueType === 'booking_payments') return filteredBookings.length;
    return filteredSettlements.length;
  }, [reportDomain, revenueType, filteredBookings.length, filteredSettlements.length]);

  // Financial Metric Calculations
  const bookingTotalAmount = useMemo(
    () => filteredBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
    [filteredBookings]
  );
  const bookingTotalCollected = useMemo(
    () => filteredBookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0),
    [filteredBookings]
  );
  const bookingTotalBalance = useMemo(
    () => filteredBookings.reduce((sum, b) => sum + (b.balanceAmount || 0), 0),
    [filteredBookings]
  );

  const settlementTotalGross = useMemo(
    () => filteredSettlements.reduce((sum, s) => sum + (s.grossAmount || 0), 0),
    [filteredSettlements]
  );
  const settlementTotalNet = useMemo(
    () => filteredSettlements.reduce((sum, s) => sum + (s.settledAmount || 0), 0),
    [filteredSettlements]
  );

  const getTimeframeLabel = () => {
    if (timeframe === 'day') return `Date: ${selectedDayText}`;
    if (timeframe === 'month') return `Month: ${selectedMonthText}`;
    if (timeframe === 'year') return `Financial Year: ${selectedYearText}`;
    return `Range: ${customStartText} – ${customEndText}`;
  };

  const handleExport = () => {
    if (activeRecordCount === 0) {
      showToast('No Records Found', 'Adjust timeframe or search criteria.', 'info');
      return;
    }

    haptics.success();
    setIsExporting(true);

    setTimeout(() => {
      const periodLabel = getTimeframeLabel();
      const cleanLabel = periodLabel.replace(/[^a-zA-Z0-9]/g, '_');
      const dateTag = new Date().toISOString().split('T')[0];

      if (reportDomain === 'bookings') {
        // 1. BOOKINGS SCHEDULE
        if (format === 'pdf') {
          exportBookingsToPDF(
            filteredBookings,
            `${venueName} - Booking Schedule Statement`,
            periodLabel,
            `bookings_${cleanLabel}_${dateTag}.pdf`
          );
          showToast('PDF Exported', `${filteredBookings.length} bookings exported.`, 'success');
        } else if (format === 'excel') {
          exportBookingsToExcel(
            filteredBookings,
            `${venueName} - Bookings`,
            `bookings_${cleanLabel}_${dateTag}.xlsx`
          );
          showToast('Excel Exported', `${filteredBookings.length} bookings exported to Excel.`, 'success');
        } else {
          exportBookingsToCSV(filteredBookings, `bookings_${cleanLabel}`);
          showToast('CSV Exported', `${filteredBookings.length} bookings exported to CSV.`, 'success');
        }
      } else if (revenueType === 'booking_payments') {
        // 2. REVENUE > BOOKING PAYMENTS (COLLECTIONS)
        if (format === 'pdf') {
          exportPaymentsToPDF(
            filteredBookings,
            `${venueName} - Payment Collections & Revenue Statement`,
            periodLabel,
            `payments_${cleanLabel}_${dateTag}.pdf`
          );
          showToast('PDF Exported', `Payment statement exported.`, 'success');
        } else if (format === 'excel') {
          exportPaymentsToExcel(
            filteredBookings,
            `${venueName} - Payments`,
            `payments_${cleanLabel}_${dateTag}.xlsx`
          );
          showToast('Excel Exported', `Payment statement exported to Excel.`, 'success');
        } else {
          exportPaymentCollectionsToCSV(filteredBookings, `payments_${cleanLabel}`);
          showToast('CSV Exported', `Payment collections exported to CSV.`, 'success');
        }
      } else {
        // 3. REVENUE > BANK SETTLEMENTS (PAYOUTS)
        if (format === 'pdf') {
          exportSettlementsToPDF(
            filteredSettlements,
            `${venueName} - Bank Payout & Settlement Statement`,
            periodLabel,
            `settlements_${cleanLabel}_${dateTag}.pdf`
          );
          showToast('PDF Exported', `${filteredSettlements.length} bank settlements exported.`, 'success');
        } else if (format === 'excel') {
          exportSettlementsToExcel(
            filteredSettlements,
            `${venueName} - Settlements`,
            `settlements_${cleanLabel}_${dateTag}.xlsx`
          );
          showToast('Excel Exported', `Settlements statement exported to Excel.`, 'success');
        } else {
          exportSettlementsToCSV(filteredSettlements, cleanLabel);
          showToast('CSV Exported', `Settlements exported to CSV.`, 'success');
        }
      }

      setIsExporting(false);
    }, 600);
  };

  // Calendar math
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();

  return (
    <div className="pb-20 pt-1 w-full space-y-5 select-none">
      {/* Mobile Back Button */}
      <button
        onClick={() => {
          haptics.tap();
          goBack();
        }}
        className="md:hidden flex items-center gap-1.5 text-[12.5px] font-bold text-[#F94001] active-press cursor-pointer pb-1"
      >
        <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
        <span>Back to Settings</span>
      </button>

      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-[21px] font-black text-[#021526] tracking-tight">
            Export Audit Reports
          </h1>
          <p className="text-[11.5px] font-medium text-[#5F6368]">
            Verified financial statements for bookings, customer collections & bank settlements
          </p>
        </div>

        <div className="w-9 h-9 rounded-xl bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center">
          <FileSpreadsheet className="w-4.5 h-4.5" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP RESPONSIVE DUAL-PANEL LAYOUT (Correct & Minimal SaaS Design)       */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* ========================================== */}
        {/* LEFT PANEL: CONFIGURATION & EXPORT ACTIONS  */}
        {/* ========================================== */}
        <div className="w-full lg:w-[410px] shrink-0 space-y-4">
          {/* STEP 1: REPORT DOMAIN */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-2xs space-y-3">
            <label className="text-[11px] font-black text-[#5F6368] uppercase tracking-wider block">
              1. Report Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  haptics.tap();
                  setReportDomain('bookings');
                  if (timeframe === 'year') {
                    setTimeframe('month');
                  }
                }}
                className={`py-2 px-3 rounded-xl font-black text-[12.5px] flex items-center justify-center gap-2 transition-all border cursor-pointer ${
                  reportDomain === 'bookings'
                    ? 'bg-[#021526] text-white border-[#021526] shadow-sm'
                    : 'bg-[#F3F4F4] text-[#5F6368] border-[#E5E7EB] hover:text-[#021526]'
                }`}
              >
                <CalendarIcon className={`w-4 h-4 ${reportDomain === 'bookings' ? 'text-[#F94001]' : 'text-[#5F6368]'}`} />
                <span>Bookings</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  haptics.tap();
                  setReportDomain('revenue');
                }}
                className={`py-2 px-3 rounded-xl font-black text-[12.5px] flex items-center justify-center gap-2 transition-all border cursor-pointer ${
                  reportDomain === 'revenue'
                    ? 'bg-[#021526] text-white border-[#021526] shadow-sm'
                    : 'bg-[#F3F4F4] text-[#5F6368] border-[#E5E7EB] hover:text-[#021526]'
                }`}
              >
                <Wallet className={`w-4 h-4 ${reportDomain === 'revenue' ? 'text-[#F94001]' : 'text-[#5F6368]'}`} />
                <span>Revenue & Payouts</span>
              </button>
            </div>

            {/* REVENUE HAS 2 TYPES: BOOKING PAYMENTS VS SETTLEMENTS */}
            {reportDomain === 'revenue' && (
              <div className="pt-2 border-t border-[#F3F4F4] space-y-2">
                <span className="text-[10px] font-extrabold text-[#5F6368] uppercase block">
                  Select Revenue Report Type:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      haptics.tap();
                      setRevenueType('booking_payments');
                      if (timeframe === 'year') {
                        setTimeframe('month');
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      revenueType === 'booking_payments'
                        ? 'bg-[#FFF1EC] text-[#021526] border-2 border-[#F94001] shadow-2xs'
                        : 'bg-[#F3F4F4] border-[#E5E7EB] text-[#021526] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-[#F94001]" />
                      <span className="text-[11.5px] font-black">Booking Payments</span>
                    </div>
                    <span className={`text-[9.5px] block mt-0.5 ${revenueType === 'booking_payments' ? 'text-[#021526]/70 font-medium' : 'text-[#5F6368]'}`}>
                      Customer Collections (UPI/Cash)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      haptics.tap();
                      setRevenueType('bank_settlements');
                      if (timeframe === 'day' || timeframe === 'custom') {
                        setTimeframe('month');
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      revenueType === 'bank_settlements'
                        ? 'bg-[#FFF1EC] text-[#021526] border-2 border-[#F94001] shadow-2xs'
                        : 'bg-[#F3F4F4] border-[#E5E7EB] text-[#021526] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span className="text-[11.5px] font-black">Bank Settlements</span>
                    </div>
                    <span className={`text-[9.5px] block mt-0.5 ${revenueType === 'bank_settlements' ? 'text-[#021526]/70 font-medium' : 'text-[#5F6368]'}`}>
                      Net Bank Payouts Credited
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: TIMEFRAME (For Settlements: Strictly Monthly & Yearly; For others: Day, Month, Custom) */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-[#F3F4F4]">
              <label className="text-[11px] font-black text-[#5F6368] uppercase tracking-wider">
                2. Audit Timeframe
              </label>
              <span className="text-[10px] font-bold text-[#F94001] bg-[#F94001]/10 px-2 py-0.5 rounded-full">
                {timeframe === 'day' ? 'Single Day' : timeframe === 'month' ? 'Monthly Audit' : timeframe === 'year' ? 'Annual Payouts' : 'Date Range'}
              </span>
            </div>

            {/* Timeframe Segmented Pills */}
            <div className={`grid gap-2 ${isSettlement ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {!isSettlement ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      haptics.tap();
                      setTimeframe('day');
                    }}
                    className={`py-2 px-3 rounded-xl font-black text-[12px] transition-all border cursor-pointer capitalize text-center ${
                      timeframe === 'day'
                        ? 'bg-[#FFF1EC] text-[#F94001] border border-[#F94001]/40 shadow-2xs font-black'
                        : 'bg-[#F3F4F4] text-[#5F6368] border-[#E5E7EB] hover:text-[#021526]'
                    }`}
                  >
                    Day
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      haptics.tap();
                      setTimeframe('month');
                    }}
                    className={`py-2 px-3 rounded-xl font-black text-[12px] transition-all border cursor-pointer capitalize text-center ${
                      timeframe === 'month'
                        ? 'bg-[#FFF1EC] text-[#F94001] border border-[#F94001]/40 shadow-2xs font-black'
                        : 'bg-[#F3F4F4] text-[#5F6368] border-[#E5E7EB] hover:text-[#021526]'
                    }`}
                  >
                    Monthly
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      haptics.tap();
                      setTimeframe('custom');
                    }}
                    className={`py-2 px-3 rounded-xl font-black text-[12px] transition-all border cursor-pointer capitalize text-center ${
                      timeframe === 'custom'
                        ? 'bg-[#FFF1EC] text-[#F94001] border border-[#F94001]/40 shadow-2xs font-black'
                        : 'bg-[#F3F4F4] text-[#5F6368] border-[#E5E7EB] hover:text-[#021526]'
                    }`}
                  >
                    Custom Range
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      haptics.tap();
                      setTimeframe('month');
                    }}
                    className={`py-2 px-3 rounded-xl font-black text-[12px] transition-all border cursor-pointer capitalize text-center ${
                      timeframe === 'month'
                        ? 'bg-[#FFF1EC] text-[#F94001] border border-[#F94001]/40 shadow-2xs font-black'
                        : 'bg-[#F3F4F4] text-[#5F6368] border-[#E5E7EB] hover:text-[#021526]'
                    }`}
                  >
                    Monthly
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      haptics.tap();
                      setTimeframe('year');
                      setIsYearPickerOpen(true);
                    }}
                    className={`py-2 px-3 rounded-xl font-black text-[12px] transition-all border cursor-pointer capitalize text-center ${
                      timeframe === 'year'
                        ? 'bg-[#FFF1EC] text-[#F94001] border border-[#F94001]/40 shadow-2xs font-black'
                        : 'bg-[#F3F4F4] text-[#5F6368] border-[#E5E7EB] hover:text-[#021526]'
                    }`}
                  >
                    Yearly
                  </button>
                </>
              )}
            </div>

            {/* Dynamic Controls based on Timeframe */}
            <div className="pt-1">
              {timeframe === 'day' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 bg-[#F3F4F4] rounded-xl border border-[#E5E7EB]">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-[#F94001]" />
                      <span className="text-[13px] font-black text-[#021526]">{selectedDayText}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        haptics.tap();
                        setIsDatePickerOpen(true);
                      }}
                      className="h-7 px-3 rounded-lg bg-[#021526] hover:bg-black text-white text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
                    >
                      Change Date
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-[10.5px] font-bold text-[#5F6368]">Presets:</span>
                    {['28 Aug 2026', '27 Aug 2026', '26 Aug 2026'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setSelectedDayText(p)}
                        className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold border cursor-pointer transition-colors ${
                          selectedDayText === p
                            ? 'bg-[#FFF1EC] text-[#F94001] border border-[#F94001]/40 shadow-2xs'
                            : 'bg-[#F3F4F4] text-[#5F6368] border-[#E5E7EB] hover:text-[#021526]'
                        }`}
                      >
                        {p.slice(0, 6)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {timeframe === 'month' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 bg-[#F3F4F4] rounded-xl border border-[#E5E7EB]">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-[#16A34A]" />
                      <span className="text-[13px] font-black text-[#021526]">
                        {selectedMonthText === '2026' ? 'Full Year 2026' : `Month: ${selectedMonthText}`}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        haptics.tap();
                        setIsMonthPickerOpen(true);
                      }}
                      className="h-7 px-3 rounded-lg bg-[#021526] hover:bg-black text-white text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
                    >
                      Change Month
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-1 pt-1">
                    {[
                      { label: 'August', value: 'Aug 2026' },
                      { label: 'July', value: 'Jul 2026' },
                      { label: 'June', value: 'Jun 2026' },
                      { label: 'Full Year', value: '2026' },
                    ].map((m) => (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => setSelectedMonthText(m.value)}
                        className={`py-1.5 rounded-lg text-[10.5px] font-bold border text-center cursor-pointer transition-colors ${
                          selectedMonthText === m.value
                            ? 'bg-[#FFF1EC] text-[#F94001] border border-[#F94001]/40 shadow-2xs font-black'
                            : 'bg-[#F3F4F4] text-[#5F6368] border-[#E5E7EB] hover:text-[#021526]'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Settlements Year Picker Section (replaces custom for bank settlements) */}
              {timeframe === 'year' && (
                <div className="space-y-2">
                  <div
                    onClick={() => {
                      haptics.tap();
                      setIsYearPickerOpen(true);
                    }}
                    className="flex items-center justify-between p-2.5 bg-[#F3F4F4] rounded-xl border border-[#E5E7EB] cursor-pointer hover:bg-[#F3F4F4] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-[#16A34A]" />
                      <div>
                        <span className="text-[13px] font-black text-[#021526] block">
                          Financial Year {selectedYearText}
                        </span>
                        <span className="text-[10px] text-[#5F6368] font-medium">
                          Annual 12-Month Settlement Ledger
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        haptics.tap();
                        setIsYearPickerOpen(true);
                      }}
                      className="h-7 px-3 rounded-lg bg-[#021526] hover:bg-black text-white text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
                    >
                      Change Year
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    {['2026', '2025', '2024', '2023'].map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => {
                          haptics.tap();
                          setSelectedYearText(yr);
                        }}
                        className={`py-1.5 rounded-lg text-[10.5px] font-bold border text-center cursor-pointer transition-all ${
                          selectedYearText === yr
                            ? 'bg-[#FFF1EC] text-[#F94001] border border-[#F94001]/40 shadow-2xs font-black'
                            : 'bg-[#F3F4F4] text-[#5F6368] border-[#E5E7EB] hover:text-[#021526] hover:bg-[#F3F4F4]'
                        }`}
                      >
                        {yr} {yr === '2026' ? '★' : ''}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {timeframe === 'custom' && (
                <div className="grid grid-cols-2 gap-2">
                  <div
                    onClick={() => {
                      haptics.tap();
                      setCustomPickingTarget('start');
                      setIsDatePickerOpen(true);
                    }}
                    className="p-2.5 bg-[#F3F4F4] rounded-xl border border-[#E5E7EB] cursor-pointer"
                  >
                    <span className="text-[9.5px] font-bold text-[#5F6368] uppercase block">Start Date</span>
                    <span className="text-[12px] font-black text-[#021526]">{customStartText}</span>
                  </div>

                  <div
                    onClick={() => {
                      haptics.tap();
                      setCustomPickingTarget('end');
                      setIsDatePickerOpen(true);
                    }}
                    className="p-2.5 bg-[#F3F4F4] rounded-xl border border-[#E5E7EB] cursor-pointer"
                  >
                    <span className="text-[9.5px] font-bold text-[#5F6368] uppercase block">End Date</span>
                    <span className="text-[12px] font-black text-[#021526]">{customEndText}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* STEP 3: EXPORT DOCUMENT FORMAT */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-2xs space-y-2.5">
            <label className="text-[11px] font-black text-[#5F6368] uppercase tracking-wider block">
              3. Document Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'pdf' as const, label: 'PDF Statement', icon: FileText, color: 'text-[#DC2626]' },
                { id: 'excel' as const, label: 'Excel (.xlsx)', icon: FileSpreadsheet, color: 'text-[#16A34A]' },
                { id: 'csv' as const, label: 'CSV File', icon: FileText, color: 'text-[#3B82F6]' },
              ].map((fmt) => {
                const isSelected = format === fmt.id;
                const Icon = fmt.icon;
                return (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => {
                      haptics.tap();
                      setFormat(fmt.id);
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FFF1EC] text-[#021526] border-2 border-[#F94001] shadow-2xs'
                        : 'bg-[#F3F4F4] border-[#E5E7EB] text-[#021526] hover:bg-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mx-auto mb-1 ${fmt.color}`} />
                    <span className="text-[11.5px] font-black block">{fmt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACTION BUTTON */}
          <button
            type="button"
            disabled={isExporting || activeRecordCount === 0}
            onClick={handleExport}
            className={`w-full h-11 rounded-xl font-black text-[13px] flex items-center justify-center gap-2 shadow-sm active-press cursor-pointer transition-all ${
              activeRecordCount === 0
                ? 'bg-[#E5E7EB] text-[#5F6368] cursor-not-allowed'
                : 'bg-[#F94001] hover:bg-[#D93600] text-white'
            }`}
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating {format.toUpperCase()} Statement...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>
                  Download {format.toUpperCase()} ({activeRecordCount} Records)
                </span>
              </>
            )}
          </button>
        </div>

        {/* ========================================== */}
        {/* RIGHT PANEL: LIVE SUMMARY & AUDIT PREVIEW   */}
        {/* ========================================== */}
        <div className="flex-1 min-w-0 w-full space-y-4">
          {/* Summary Metric Strip */}
          <div className="grid grid-cols-3 gap-3">
            {reportDomain === 'bookings' && (
              <>
                <div className="bg-white rounded-2xl p-3.5 border border-[#E5E7EB] shadow-2xs">
                  <span className="text-[10px] font-bold text-[#5F6368] uppercase block">Total Bookings</span>
                  <span className="text-[18px] font-black text-[#021526] mt-0.5 block">{filteredBookings.length} Matches</span>
                </div>
                <div className="bg-white rounded-2xl p-3.5 border border-[#E5E7EB] shadow-2xs">
                  <span className="text-[10px] font-bold text-[#5F6368] uppercase block">Total Value</span>
                  <span className="text-[18px] font-black text-[#021526] mt-0.5 block">₹{bookingTotalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="bg-white rounded-2xl p-3.5 border border-[#E5E7EB] shadow-2xs">
                  <span className="text-[10px] font-bold text-[#5F6368] uppercase block">Advance Collected</span>
                  <span className="text-[18px] font-black text-[#16A34A] mt-0.5 block">₹{bookingTotalCollected.toLocaleString('en-IN')}</span>
                </div>
              </>
            )}

            {reportDomain === 'revenue' && revenueType === 'booking_payments' && (
              <>
                <div className="bg-white rounded-2xl p-3.5 border border-[#E5E7EB] shadow-2xs">
                  <span className="text-[10px] font-bold text-[#5F6368] uppercase block">Collections Count</span>
                  <span className="text-[18px] font-black text-[#021526] mt-0.5 block">{filteredBookings.length} Payments</span>
                </div>
                <div className="bg-white rounded-2xl p-3.5 border border-[#E5E7EB] shadow-2xs">
                  <span className="text-[10px] font-bold text-[#5F6368] uppercase block">Total Collected</span>
                  <span className="text-[18px] font-black text-[#16A34A] mt-0.5 block">₹{bookingTotalCollected.toLocaleString('en-IN')}</span>
                </div>
                <div className="bg-white rounded-2xl p-3.5 border border-[#E5E7EB] shadow-2xs">
                  <span className="text-[10px] font-bold text-[#5F6368] uppercase block">Pending Balance</span>
                  <span className="text-[18px] font-black text-[#F94001] mt-0.5 block">₹{bookingTotalBalance.toLocaleString('en-IN')}</span>
                </div>
              </>
            )}

            {reportDomain === 'revenue' && revenueType === 'bank_settlements' && (
              <>
                <div className="bg-white rounded-2xl p-3.5 border border-[#E5E7EB] shadow-2xs">
                  <span className="text-[10px] font-bold text-[#5F6368] uppercase block">Bank Payouts</span>
                  <span className="text-[18px] font-black text-[#021526] mt-0.5 block">{filteredSettlements.length} Transfers</span>
                </div>
                <div className="bg-white rounded-2xl p-3.5 border border-[#E5E7EB] shadow-2xs">
                  <span className="text-[10px] font-bold text-[#5F6368] uppercase block">Gross Turnaround</span>
                  <span className="text-[18px] font-black text-[#021526] mt-0.5 block">₹{settlementTotalGross.toLocaleString('en-IN')}</span>
                </div>
                <div className="bg-white rounded-2xl p-3.5 border border-[#E5E7EB] shadow-2xs">
                  <span className="text-[10px] font-bold text-[#5F6368] uppercase block">Net Settled to Bank</span>
                  <span className="text-[18px] font-black text-[#16A34A] mt-0.5 block">₹{settlementTotalNet.toLocaleString('en-IN')}</span>
                </div>
              </>
            )}
          </div>

          {/* Live Data Preview Table */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#F3F4F4]">
              <div>
                <h3 className="text-[13px] font-black text-[#021526] uppercase tracking-wider">
                  Audit Preview ({activeRecordCount} entries for {getTimeframeLabel()})
                </h3>
                <p className="text-[11px] text-[#5F6368]">
                  {reportDomain === 'bookings'
                    ? 'Schedule of verified court bookings'
                    : revenueType === 'booking_payments'
                    ? 'Customer payment collections ledger'
                    : 'T+0 direct IMPS bank payout receipts'}
                </p>
              </div>

              <span className="text-[10.5px] font-bold text-[#5F6368] bg-[#F3F4F4] px-2 py-0.5 rounded border border-[#E5E7EB]">
                Showing top 6
              </span>
            </div>

            {activeRecordCount === 0 ? (
              <div className="py-10 text-center text-[#5F6368] text-[12px]">
                No records found for the selected {timeframe}.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[12px] text-left">
                  {/* Table Header */}
                  <thead>
                    <tr className="border-b border-[#F3F4F4] text-[#5F6368] font-bold text-[11px]">
                      {reportDomain === 'bookings' && (
                        <>
                          <th className="pb-2">Booking ID</th>
                          <th className="pb-2">Customer</th>
                          <th className="pb-2">Court</th>
                          <th className="pb-2">Date & Time</th>
                          <th className="pb-2 text-right">Fee</th>
                          <th className="pb-2 text-right">Status</th>
                        </>
                      )}

                      {reportDomain === 'revenue' && revenueType === 'booking_payments' && (
                        <>
                          <th className="pb-2">Booking ID</th>
                          <th className="pb-2">Customer</th>
                          <th className="pb-2">Payment Mode</th>
                          <th className="pb-2">Date</th>
                          <th className="pb-2 text-right">Paid Amount</th>
                          <th className="pb-2 text-right">Status</th>
                        </>
                      )}

                      {reportDomain === 'revenue' && revenueType === 'bank_settlements' && (
                        <>
                          <th className="pb-2">Settlement ID</th>
                          <th className="pb-2">Bank & UTR</th>
                          <th className="pb-2">Date</th>
                          <th className="pb-2 text-right">Gross</th>
                          <th className="pb-2 text-right">Net Credited</th>
                          <th className="pb-2 text-right">Status</th>
                        </>
                      )}
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody className="divide-y divide-[#F3F4F4]">
                    {reportDomain === 'bookings' &&
                      filteredBookings.slice(0, 6).map((b) => (
                        <tr key={b.id} className="text-[#021526]">
                          <td className="py-2.5 font-mono font-bold text-[#F94001]">{b.id}</td>
                          <td className="py-2.5 font-bold">{b.customerName}</td>
                          <td className="py-2.5 text-[#5F6368]">{b.sport} · {b.courtName}</td>
                          <td className="py-2.5 text-[#5F6368]">{b.date} ({b.timeSlot})</td>
                          <td className="py-2.5 font-black text-right">₹{b.totalAmount}</td>
                          <td className="py-2.5 text-right">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#16A34A]/10 text-[#16A34A]">
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}

                    {reportDomain === 'revenue' &&
                      revenueType === 'booking_payments' &&
                      filteredBookings.slice(0, 6).map((b) => (
                        <tr key={b.id} className="text-[#021526]">
                          <td className="py-2.5 font-mono font-bold text-[#F94001]">{b.id}</td>
                          <td className="py-2.5 font-bold">{b.customerName}</td>
                          <td className="py-2.5">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F3F4F4] border border-[#E5E7EB]">
                              {b.paymentMethod || 'UPI'}
                            </span>
                          </td>
                          <td className="py-2.5 text-[#5F6368]">{b.date}</td>
                          <td className="py-2.5 font-black text-right text-[#16A34A]">₹{b.paidAmount}</td>
                          <td className="py-2.5 text-right">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#16A34A]/10 text-[#16A34A]">
                              {b.paymentStatus}
                            </span>
                          </td>
                        </tr>
                      ))}

                    {reportDomain === 'revenue' &&
                      revenueType === 'bank_settlements' &&
                      filteredSettlements.slice(0, 6).map((s) => (
                        <tr key={s.id} className="text-[#021526]">
                          <td className="py-2.5 font-mono font-bold text-[#16A34A]">{s.id}</td>
                          <td className="py-2.5">
                            <span className="font-bold block">{s.bankName}</span>
                            <span className="text-[10px] font-mono text-[#5F6368]">{s.utrNumber}</span>
                          </td>
                          <td className="py-2.5 text-[#5F6368]">{s.date}</td>
                          <td className="py-2.5 font-bold text-right text-[#5F6368]">₹{s.grossAmount}</td>
                          <td className="py-2.5 font-black text-right text-[#16A34A]">₹{s.settledAmount}</td>
                          <td className="py-2.5 text-right">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#16A34A]/10 text-[#16A34A]">
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* THEMED DATE PICKER MODAL (App Color Theme)                                */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isDatePickerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
            <div className="absolute inset-0" onClick={() => setIsDatePickerOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#F3F4F4]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#F94001]/10 text-[#F94001] flex items-center justify-center">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-black text-[#021526]">Select Date</h3>
                    <p className="text-[11px] text-[#5F6368]">TurfTown Calendar Theme</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen(false)}
                  className="w-7 h-7 rounded-full bg-[#F3F4F4] flex items-center justify-center text-[#5F6368] hover:text-[#021526] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Month Navigation */}
              <div className="flex items-center justify-between px-1">
                <span className="text-[14px] font-black text-[#021526]">
                  {MONTH_NAMES[calMonth]} {calYear}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      haptics.tap();
                      if (calMonth === 0) {
                        setCalMonth(11);
                        setCalYear(calYear - 1);
                      } else {
                        setCalMonth(calMonth - 1);
                      }
                    }}
                    className="w-7 h-7 rounded-lg bg-[#F3F4F4] border border-[#E5E7EB] flex items-center justify-center text-[#021526] hover:bg-[#F3F4F4] cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      haptics.tap();
                      if (calMonth === 11) {
                        setCalMonth(0);
                        setCalYear(calYear + 1);
                      } else {
                        setCalMonth(calMonth + 1);
                      }
                    }}
                    className="w-7 h-7 rounded-lg bg-[#F3F4F4] border border-[#E5E7EB] flex items-center justify-center text-[#021526] hover:bg-[#F3F4F4] cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Days Header */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10.5px] font-extrabold text-[#5F6368]">
                {DAYS_OF_WEEK.map((d) => (
                  <div key={d} className="py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Day Cells Grid */}
              <div className="grid grid-cols-7 gap-1 text-center text-[12px] font-bold">
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="py-2" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dayPadded = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
                  const fullDateStr = `${dayPadded} ${MONTH_SHORT[calMonth]} ${calYear}`;

                  const currentTargetVal =
                    customPickingTarget === 'start'
                      ? customStartText
                      : customPickingTarget === 'end'
                      ? customEndText
                      : selectedDayText;

                  const isSelected = currentTargetVal === fullDateStr;

                  return (
                    <button
                      key={dayNum}
                      type="button"
                      onClick={() => {
                        haptics.tap();
                        if (customPickingTarget === 'start') {
                          setCustomStartText(fullDateStr);
                          setCustomPickingTarget(null);
                        } else if (customPickingTarget === 'end') {
                          setCustomEndText(fullDateStr);
                          setCustomPickingTarget(null);
                        } else {
                          setSelectedDayText(fullDateStr);
                        }
                        setIsDatePickerOpen(false);
                      }}
                      className={`py-2 rounded-xl transition-all cursor-pointer text-center ${
                        isSelected
                          ? 'bg-[#F94001] text-white font-black shadow-xs'
                          : 'text-[#021526] hover:bg-[#F3F4F4]'
                      }`}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>

              {/* Quick Today */}
              <div className="pt-2 border-t border-[#F3F4F4] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    haptics.tap();
                    if (customPickingTarget === 'start') setCustomStartText('28 Aug 2026');
                    else if (customPickingTarget === 'end') setCustomEndText('28 Aug 2026');
                    else setSelectedDayText('28 Aug 2026');
                    setIsDatePickerOpen(false);
                  }}
                  className="text-[11.5px] font-bold text-[#F94001] hover:underline cursor-pointer"
                >
                  Today (28 Aug)
                </button>

                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen(false)}
                  className="px-3 py-1 rounded-lg bg-[#F94001] hover:bg-[#D93600] text-white text-[11.5px] font-bold cursor-pointer transition-colors shadow-2xs"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* THEMED MONTH PICKER MODAL (App Color Theme)                               */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isMonthPickerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
            <div className="absolute inset-0" onClick={() => setIsMonthPickerOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#F3F4F4]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-black text-[#021526]">Select Statement Month</h3>
                    <p className="text-[11px] text-[#5F6368]">TurfTown Financial Calendar</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMonthPickerOpen(false)}
                  className="w-7 h-7 rounded-full bg-[#F3F4F4] flex items-center justify-center text-[#5F6368] hover:text-[#021526] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Financial Year Selector with interactive Prev/Next Year */}
              <div className="bg-[#F3F4F4] p-2.5 rounded-2xl border border-[#E5E7EB] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11.5px] font-black text-[#5F6368] uppercase pl-1">Financial Year</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        haptics.tap();
                        setSelectedPickerYear((y) => y - 1);
                      }}
                      className="w-7 h-7 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center text-[#021526] hover:bg-[#F3F4F4] cursor-pointer"
                      title="Previous Year"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <span className="text-[14px] font-black text-[#021526] px-1">{selectedPickerYear}</span>

                    <button
                      type="button"
                      onClick={() => {
                        haptics.tap();
                        setSelectedPickerYear((y) => y + 1);
                      }}
                      className="w-7 h-7 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center text-[#021526] hover:bg-[#F3F4F4] cursor-pointer"
                      title="Next Year"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {selectedPickerYear === 2026 && (
                      <span className="text-[9.5px] font-bold text-[#16A34A] bg-[#16A34A]/10 px-1.5 py-0.5 rounded">Active</span>
                    )}
                  </div>
                </div>

                {/* Quick Year Shortcuts */}
                <div className="flex items-center gap-1 pt-0.5">
                  {[2026, 2025, 2024].map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => {
                        haptics.tap();
                        setSelectedPickerYear(yr);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold border transition-all cursor-pointer ${
                        selectedPickerYear === yr
                          ? 'bg-[#F94001] text-white border-[#F94001] shadow-2xs'
                          : 'bg-white text-[#5F6368] border-[#E5E7EB] hover:text-[#021526]'
                      }`}
                    >
                      {yr} {yr === 2026 ? '(Current)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Months Grid */}
              <div className="grid grid-cols-3 gap-2">
                {MONTH_SHORT.map((m, idx) => {
                  const monthValue = `${m} ${selectedPickerYear}`;
                  const isSelected = selectedMonthText === monthValue;
                  const isCurrent = idx === 7 && selectedPickerYear === 2026;

                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        haptics.tap();
                        setSelectedMonthText(monthValue);
                        setIsMonthPickerOpen(false);
                      }}
                      className={`py-2.5 rounded-xl text-[12.5px] font-black transition-all border cursor-pointer text-center ${
                        isSelected
                          ? 'bg-[#F94001] text-white border-[#F94001] shadow-sm'
                          : 'bg-[#F3F4F4] text-[#021526] border-[#E5E7EB] hover:bg-[#F3F4F4]'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span>{m}</span>
                        {isCurrent && (
                          <span className={`text-[8.5px] font-bold mt-0.5 ${isSelected ? 'text-white' : 'text-[#16A34A]'}`}>
                            Current
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Full Year */}
              <div className="pt-2 border-t border-[#F3F4F4]">
                <button
                  type="button"
                  onClick={() => {
                    haptics.tap();
                    setSelectedMonthText(`${selectedPickerYear}`);
                    setIsMonthPickerOpen(false);
                  }}
                  className={`w-full py-2 rounded-xl text-[12px] font-bold border transition-all cursor-pointer ${
                    selectedMonthText === `${selectedPickerYear}`
                      ? 'bg-[#F94001] text-white border-[#F94001] shadow-sm'
                      : 'bg-[#F3F4F4] text-[#021526] border-[#E5E7EB] hover:bg-[#F3F4F4]'
                  }`}
                >
                  Full Financial Year {selectedPickerYear} (All Records)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* THEMED YEAR PICKER MODAL (Settlements Annual Ledger)                       */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isYearPickerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
            <div className="absolute inset-0" onClick={() => setIsYearPickerOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-2xl space-y-4"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#F3F4F4]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-black text-[#021526]">Select Financial Year</h3>
                    <p className="text-[11px] text-[#5F6368]">Bank Settlement Payout Audits</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsYearPickerOpen(false)}
                  className="w-7 h-7 rounded-full bg-[#F3F4F4] flex items-center justify-center text-[#5F6368] hover:text-[#021526] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Decade Navigation */}
              <div className="flex items-center justify-between px-1 bg-[#F3F4F4] p-2 rounded-2xl border border-[#E5E7EB]">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      haptics.tap();
                      setExportDecadeStart((d) => d - 10);
                    }}
                    className="w-7 h-7 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#021526] hover:bg-[#F3F4F4] cursor-pointer"
                    title="Previous Decade"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[13.5px] font-black text-[#021526]">
                    {exportDecadeStart} – {exportDecadeStart + 9}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      haptics.tap();
                      setExportDecadeStart((d) => d + 10);
                    }}
                    className="w-7 h-7 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#021526] hover:bg-[#F3F4F4] cursor-pointer"
                    title="Next Decade"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-[10px] font-bold text-[#16A34A] bg-[#16A34A]/10 px-2 py-0.5 rounded-full">
                  Decade Statements
                </span>
              </div>

              {/* 10-Year Grid */}
              <div className="grid grid-cols-2 gap-2 pt-0.5 max-h-[250px] overflow-y-auto no-scrollbar">
                {Array.from({ length: 10 }).map((_, idx) => {
                  const yr = `${exportDecadeStart + idx}`;
                  const isSelected = selectedYearText === yr;
                  const isCurrent = yr === '2026';
                  const yrNum = parseInt(yr, 10);
                  const fyLabel = isCurrent
                    ? 'FY 2025-26 (Active)'
                    : `FY ${yrNum - 1}-${String(yrNum).slice(-2)}`;

                  return (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => {
                        haptics.tap();
                        setSelectedYearText(yr);
                        setIsYearPickerOpen(false);
                      }}
                      className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#F94001] text-white border-[#F94001] shadow-sm ring-2 ring-[#F94001]/30'
                          : 'bg-[#F3F4F4] text-[#021526] border-[#E5E7EB] hover:bg-[#F3F4F4]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[15px] font-black">{yr}</span>
                        {isSelected ? (
                          <div className="w-4.5 h-4.5 rounded-full bg-white text-[#F94001] flex items-center justify-center shadow-2xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : isCurrent ? (
                          <span className="text-[8.5px] font-bold text-[#16A34A] bg-[#16A34A]/10 px-1.5 py-0.5 rounded">
                            Active
                          </span>
                        ) : null}
                      </div>
                      <span
                        className={`text-[9.5px] font-medium mt-1 ${
                          isSelected ? 'text-white/80 font-semibold' : 'text-[#5F6368]'
                        }`}
                      >
                        {fyLabel}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Quick Actions Footer */}
              <div className="pt-2 border-t border-[#F3F4F4] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    haptics.tap();
                    setSelectedYearText('2026');
                    setIsYearPickerOpen(false);
                  }}
                  className="text-[11.5px] font-bold text-[#F94001] hover:underline cursor-pointer"
                >
                  Current FY (2026)
                </button>

                <button
                  type="button"
                  onClick={() => setIsYearPickerOpen(false)}
                  className="px-4 py-1.5 rounded-xl bg-[#F94001] text-white text-[11.5px] font-bold cursor-pointer hover:bg-[#D93600] transition-colors shadow-2xs"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
