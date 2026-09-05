import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  ChevronLeft,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  CheckCircle2,
  Loader2,
  FileCode,
  Wallet,
  CalendarDays,
  IndianRupee,
  Layers,
  Filter,
  CreditCard,
  Banknote,
  QrCode,
  ArrowRight,
  TrendingUp,
  Building2,
  ShieldCheck,
  CheckCircle,
  Clock,
} from 'lucide-react';
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

type ReportDomainType = 'bookings' | 'payments';
type PaymentReportSubtype = 'booking_payments' | 'settlement';
type ReportPeriodType = 'daily' | 'weekly' | 'monthly' | 'custom';
type DocumentFormatType = 'pdf' | 'excel' | 'csv';

const MONTH_OPTIONS = [
  { label: 'August 2026 (Current)', value: 'Aug 2026', desc: 'Current operating month' },
  { label: 'July 2026', value: 'Jul 2026', desc: 'Previous month records' },
  { label: 'June 2026', value: 'Jun 2026', desc: 'Q2 closing statement' },
  { label: 'May 2026', value: 'May 2026', desc: 'Pre-summer operations' },
  { label: 'Full Year 2026', value: '2026', desc: 'Annual operational audit' },
];

const WEEK_OPTIONS = [
  { label: 'This Week (24–30 Aug 2026)', start: '2026-08-24', end: '2026-08-30' },
  { label: 'Last Week (17–23 Aug 2026)', start: '2026-08-17', end: '2026-08-23' },
  { label: '2 Weeks Ago (10–16 Aug 2026)', start: '2026-08-10', end: '2026-08-16' },
  { label: '3 Weeks Ago (03–09 Aug 2026)', start: '2026-08-03', end: '2026-08-09' },
];

export const ExportReportScreen: React.FC = () => {
  const { bookings, settlements, goBack, showToast, venueName } = useApp();

  // 1. Primary Domain: Booking Reports vs Payment Reports
  const [reportDomain, setReportDomain] = useState<ReportDomainType>('bookings');

  // 2. In Payments domain: Booking Payments (Collections) vs Settlement (Bank Payouts)
  const [paymentSubtype, setPaymentSubtype] = useState<PaymentReportSubtype>('booking_payments');

  // 3. Timeframe scope: Daily (Day) / Weekly (Week) / Monthly (Month) / Custom
  const [periodType, setPeriodType] = useState<ReportPeriodType>('daily');
  const [documentFormat, setDocumentFormat] = useState<DocumentFormatType>('pdf');

  // Period-specific states
  const [selectedDay, setSelectedDay] = useState<string>('2026-08-28');
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(0);
  const [selectedMonth, setSelectedMonth] = useState<string>('Aug 2026');

  // Custom date range
  const [customStartDate, setCustomStartDate] = useState<string>('2026-08-01');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-08-31');

  // Sub-filters for Booking reports
  const [selectedSport, setSelectedSport] = useState<string>('All');
  const [selectedBookingStatus, setSelectedBookingStatus] = useState<string>('All');

  // Sub-filters for Payment > Booking Payments
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<string>('All');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('All');

  // Sub-filters for Payment > Settlement
  const [selectedSettlementStatus, setSelectedSettlementStatus] = useState<string>('All');

  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Date parsing helper
  const parseDateToTimestamp = (dateStr: string): number => {
    try {
      if (dateStr.includes('-')) {
        return new Date(dateStr).getTime();
      }
      const parts = dateStr.split(' ');
      if (parts.length === 3) {
        const months: Record<string, number> = {
          Jan: 0,
          Feb: 1,
          Mar: 2,
          Apr: 3,
          May: 4,
          Jun: 5,
          Jul: 6,
          Aug: 7,
          Sep: 8,
          Oct: 9,
          Nov: 10,
          Dec: 11,
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

  // Filtered Bookings (for Booking reports and Payment > Booking Payments)
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // 1. Timeframe filter
      if (periodType === 'daily') {
        const bTime = parseDateToTimestamp(b.date);
        const selTime = new Date(selectedDay).getTime();
        const bDateObj = new Date(bTime);
        const selDateObj = new Date(selTime);
        const isDayMatch =
          bDateObj.getFullYear() === selDateObj.getFullYear() &&
          bDateObj.getMonth() === selDateObj.getMonth() &&
          bDateObj.getDate() === selDateObj.getDate();
        if (!isDayMatch) return false;
      } else if (periodType === 'weekly') {
        const week = WEEK_OPTIONS[selectedWeekIndex];
        const bTime = parseDateToTimestamp(b.date);
        const start = new Date(week.start).getTime();
        const end = new Date(week.end).getTime() + 86400000;
        if (bTime < start || bTime > end) return false;
      } else if (periodType === 'monthly') {
        if (selectedMonth !== '2026' && !b.date.includes(selectedMonth)) {
          return false;
        }
      } else if (periodType === 'custom') {
        const bTime = parseDateToTimestamp(b.date);
        const start = new Date(customStartDate).getTime();
        const end = new Date(customEndDate).getTime() + 86400000;
        if (bTime < start || bTime > end) return false;
      }

      // 2. Domain-specific sub-filters
      if (reportDomain === 'bookings') {
        if (selectedSport !== 'All' && b.sport !== selectedSport) return false;
        if (selectedBookingStatus !== 'All' && b.status !== selectedBookingStatus) return false;
      } else {
        // In Payment > Booking Payments
        if (selectedPaymentMode !== 'All') {
          const method = b.paymentMethod || 'UPI';
          if (method !== selectedPaymentMode) return false;
        }
        if (selectedPaymentStatus !== 'All') {
          if (selectedPaymentStatus === 'Paid' && b.paymentStatus !== 'Paid') return false;
          if (
            selectedPaymentStatus === 'Pending' &&
            b.paymentStatus !== 'Pending' &&
            b.paymentStatus !== 'Partially Paid'
          )
            return false;
        }
      }

      return true;
    });
  }, [
    bookings,
    periodType,
    selectedDay,
    selectedWeekIndex,
    selectedMonth,
    customStartDate,
    customEndDate,
    reportDomain,
    selectedSport,
    selectedBookingStatus,
    selectedPaymentMode,
    selectedPaymentStatus,
  ]);

  // Filtered Settlements (for Payment > Settlement reports)
  const filteredSettlements = useMemo(() => {
    return settlements.filter((s) => {
      // 1. Timeframe filter
      if (periodType === 'daily') {
        const sTime = parseDateToTimestamp(s.date);
        const selTime = new Date(selectedDay).getTime();
        const sDateObj = new Date(sTime);
        const selDateObj = new Date(selTime);
        const isDayMatch =
          sDateObj.getFullYear() === selDateObj.getFullYear() &&
          sDateObj.getMonth() === selDateObj.getMonth() &&
          sDateObj.getDate() === selDateObj.getDate();
        if (!isDayMatch) return false;
      } else if (periodType === 'weekly') {
        const week = WEEK_OPTIONS[selectedWeekIndex];
        const sTime = parseDateToTimestamp(s.date);
        const start = new Date(week.start).getTime();
        const end = new Date(week.end).getTime() + 86400000;
        if (sTime < start || sTime > end) return false;
      } else if (periodType === 'monthly') {
        if (selectedMonth !== '2026' && !s.date.includes(selectedMonth)) {
          return false;
        }
      } else if (periodType === 'custom') {
        const sTime = parseDateToTimestamp(s.date);
        const start = new Date(customStartDate).getTime();
        const end = new Date(customEndDate).getTime() + 86400000;
        if (sTime < start || sTime > end) return false;
      }

      // 2. Status filter
      if (selectedSettlementStatus !== 'All' && s.status !== selectedSettlementStatus) {
        return false;
      }

      return true;
    });
  }, [
    settlements,
    periodType,
    selectedDay,
    selectedWeekIndex,
    selectedMonth,
    customStartDate,
    customEndDate,
    selectedSettlementStatus,
  ]);

  // Financial calculations for Bookings / Booking Payments
  const totalRevenue = useMemo(
    () => filteredBookings.reduce((sum, b) => sum + b.totalAmount, 0),
    [filteredBookings]
  );
  const totalCollected = useMemo(
    () => filteredBookings.reduce((sum, b) => sum + b.paidAmount, 0),
    [filteredBookings]
  );
  const totalDue = useMemo(
    () => filteredBookings.reduce((sum, b) => sum + b.balanceAmount, 0),
    [filteredBookings]
  );
  const realizationRate = totalRevenue > 0 ? Math.round((totalCollected / totalRevenue) * 100) : 100;

  // Financial calculations for Settlements
  const totalSettledAmount = useMemo(
    () => filteredSettlements.reduce((sum, s) => sum + s.settledAmount, 0),
    [filteredSettlements]
  );

  const getPeriodLabel = () => {
    if (periodType === 'daily') {
      try {
        const d = new Date(selectedDay);
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      } catch {
        return selectedDay;
      }
    }
    if (periodType === 'weekly') {
      return WEEK_OPTIONS[selectedWeekIndex].label;
    }
    if (periodType === 'monthly') {
      return selectedMonth === '2026' ? 'Full Year 2026' : `Month of ${selectedMonth}`;
    }
    return `${customStartDate} to ${customEndDate}`;
  };

  const getActiveItemCount = () => {
    if (reportDomain === 'bookings') return filteredBookings.length;
    if (paymentSubtype === 'booking_payments') return filteredBookings.length;
    return filteredSettlements.length;
  };

  const handleDownload = () => {
    const itemCount = getActiveItemCount();
    if (itemCount === 0) {
      showToast('No Data Found', 'Please adjust your filter period or criteria', 'info');
      return;
    }

    haptics.success();
    setIsExporting(true);

    setTimeout(() => {
      const periodLabel = getPeriodLabel();
      const cleanLabel = periodLabel.replace(/[^a-zA-Z0-9]/g, '_');
      const dateTag = new Date().toISOString().split('T')[0];

      if (reportDomain === 'bookings') {
        // 1. BOOKINGS SCHEDULE REPORT
        if (documentFormat === 'pdf') {
          const filename = `turftown_bookings_${cleanLabel}_${dateTag}.pdf`;
          exportBookingsToPDF(
            filteredBookings,
            `${venueName} - Booking Schedule Statement`,
            periodLabel,
            filename
          );
          showToast(
            'PDF Booking Report Generated',
            `Exported ${filteredBookings.length} bookings to PDF`,
            'success'
          );
        } else if (documentFormat === 'excel') {
          const filename = `turftown_bookings_${cleanLabel}_${dateTag}.xlsx`;
          exportBookingsToExcel(
            filteredBookings,
            `${venueName} Bookings - ${periodLabel}`,
            filename
          );
          showToast(
            'Excel Booking Report Generated',
            `Exported ${filteredBookings.length} bookings to Excel (.xlsx)`,
            'success'
          );
        } else {
          exportBookingsToCSV(filteredBookings, `bookings_${cleanLabel}`);
          showToast(
            'CSV File Generated',
            `Exported ${filteredBookings.length} records to CSV`,
            'success'
          );
        }
      } else if (paymentSubtype === 'booking_payments') {
        // 2. PAYMENT > BOOKING PAYMENTS (COLLECTIONS & REVENUE)
        if (documentFormat === 'pdf') {
          const filename = `turftown_payments_${cleanLabel}_${dateTag}.pdf`;
          exportPaymentsToPDF(
            filteredBookings,
            `${venueName} - Payment Collections & Revenue Statement`,
            periodLabel,
            filename
          );
          showToast(
            'PDF Payment Report Generated',
            `Exported INR ${totalCollected.toLocaleString('en-IN')} collections to PDF`,
            'success'
          );
        } else if (documentFormat === 'excel') {
          const filename = `turftown_payments_${cleanLabel}_${dateTag}.xlsx`;
          exportPaymentsToExcel(
            filteredBookings,
            `${venueName} Payments - ${periodLabel}`,
            filename
          );
          showToast(
            'Excel Payment Report Generated',
            `Exported ${filteredBookings.length} payment records to Excel (.xlsx)`,
            'success'
          );
        } else {
          exportPaymentCollectionsToCSV(filteredBookings, `payments_${cleanLabel}`);
          showToast(
            'CSV File Generated',
            `Exported ${filteredBookings.length} payment records to CSV`,
            'success'
          );
        }
      } else {
        // 3. PAYMENT > SETTLEMENT (BANK TRANSFERS & PAYOUTS)
        if (documentFormat === 'pdf') {
          const filename = `turftown_settlements_${cleanLabel}_${dateTag}.pdf`;
          exportSettlementsToPDF(
            filteredSettlements,
            `${venueName} - Bank Settlement & Payout Statement`,
            periodLabel,
            filename
          );
          showToast(
            'PDF Settlement Report Generated',
            `Exported INR ${totalSettledAmount.toLocaleString('en-IN')} payouts to PDF`,
            'success'
          );
        } else if (documentFormat === 'excel') {
          const filename = `turftown_settlements_${cleanLabel}_${dateTag}.xlsx`;
          exportSettlementsToExcel(
            filteredSettlements,
            `${venueName} Bank Settlements - ${periodLabel}`,
            filename
          );
          showToast(
            'Excel Settlement Report Generated',
            `Exported ${filteredSettlements.length} settlement transfers to Excel (.xlsx)`,
            'success'
          );
        } else {
          exportSettlementsToCSV(filteredSettlements, `settlements_${cleanLabel}`);
          showToast(
            'CSV File Generated',
            `Exported ${filteredSettlements.length} settlement transfers to CSV`,
            'success'
          );
        }
      }

      setIsExporting(false);
    }, 500);
  };

  return (
    <div className="pb-12 pt-3 px-4 w-full space-y-4 select-none">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between pt-1">
        <button
          id="btn-back-export"
          onClick={() => {
            haptics.tap();
            goBack();
          }}
          className="w-9 h-9 -ml-1 rounded-xl flex items-center justify-center text-[#171717] hover:bg-[#E8E6E1]/50 active-press transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.4]" />
        </button>

        <div className="text-center">
          <h1 className="text-[17px] font-extrabold text-[#171717] leading-none">
            Export Reports
          </h1>
          <span className="text-[11px] text-[#777570] mt-0.5 block">
            Generate printable & spreadsheet data
          </span>
        </div>

        <div className="w-9 h-9" />
      </div>

      {/* 1. PRIMARY REPORT DOMAIN SELECTOR: BOOKING VS PAYMENT */}
      <div className="bg-white rounded-2xl p-1.5 border border-[#E8E6E1] shadow-xs">
        <div className="grid grid-cols-2 gap-1.5 p-0.5 bg-[#F7F7F5] rounded-[14px]">
          <button
            type="button"
            id="tab-domain-bookings"
            onClick={() => {
              haptics.tap();
              setReportDomain('bookings');
            }}
            className={`py-2.5 px-2 rounded-xl font-extrabold text-[12.5px] flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer whitespace-nowrap active-press ${
              reportDomain === 'bookings'
                ? 'bg-[#171717] text-white shadow-xs'
                : 'text-[#777570] hover:text-[#171717] hover:bg-white/60'
            }`}
          >
            <CalendarDays className="w-4 h-4 shrink-0" />
            <span className="truncate">Booking Reports</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md shrink-0 ${
                reportDomain === 'bookings'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#E8E6E1] text-[#777570]'
              }`}
            >
              {bookings.length}
            </span>
          </button>

          <button
            type="button"
            id="tab-domain-payments"
            onClick={() => {
              haptics.tap();
              setReportDomain('payments');
            }}
            className={`py-2.5 px-2 rounded-xl font-extrabold text-[12.5px] flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer whitespace-nowrap active-press ${
              reportDomain === 'payments'
                ? 'bg-[#2FA66A] text-white shadow-xs'
                : 'text-[#777570] hover:text-[#171717] hover:bg-white/60'
            }`}
          >
            <Wallet className="w-4 h-4 shrink-0" />
            <span className="truncate">Payment Reports</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md shrink-0 ${
                reportDomain === 'payments'
                  ? 'bg-white/25 text-white'
                  : 'bg-[#E8E6E1] text-[#777570]'
              }`}
            >
              ₹
            </span>
          </button>
        </div>
      </div>

      {/* 2. SUB-DOMAIN SELECTOR FOR PAYMENT REPORTS (BOOKING PAYMENTS VS SETTLEMENT) */}
      {reportDomain === 'payments' && (
        <div className="bg-white rounded-2xl p-2 border border-[#E8E6E1] shadow-2xs space-y-1.5 animate-fadeIn">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-[#777570] uppercase tracking-wider">
              Select Payment Domain
            </span>
            <span className="text-[10px] font-bold text-[#2FA66A] bg-[#2FA66A]/10 px-2 py-0.5 rounded-full">
              {paymentSubtype === 'booking_payments' ? 'Customer Transactions' : 'Bank Transfers'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F1F0EC] rounded-xl">
            <button
              type="button"
              id="subtab-booking-payments"
              onClick={() => {
                haptics.tap();
                setPaymentSubtype('booking_payments');
              }}
              className={`py-2 px-2.5 rounded-lg font-extrabold text-[12px] flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active-press ${
                paymentSubtype === 'booking_payments'
                  ? 'bg-white text-[#171717] shadow-xs'
                  : 'text-[#777570] hover:text-[#171717]'
              }`}
            >
              <IndianRupee className="w-3.5 h-3.5 shrink-0" />
              <span>Booking Payments</span>
            </button>

            <button
              type="button"
              id="subtab-settlements"
              onClick={() => {
                haptics.tap();
                setPaymentSubtype('settlement');
              }}
              className={`py-2 px-2.5 rounded-lg font-extrabold text-[12px] flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active-press ${
                paymentSubtype === 'settlement'
                  ? 'bg-[#2FA66A] text-white shadow-xs'
                  : 'text-[#777570] hover:text-[#171717]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span>Settlement Payouts</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. ACTIVE CONTEXT SUMMARY BANNER */}
      <div
        className={`p-3.5 rounded-2xl border flex items-center justify-between shadow-2xs ${
          reportDomain === 'bookings'
            ? 'bg-[#FAF9F6] border-[#E8E6E1]'
            : paymentSubtype === 'booking_payments'
            ? 'bg-[#2FA66A]/5 border-[#2FA66A]/20'
            : 'bg-[#171717]/5 border-[#171717]/15'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              reportDomain === 'bookings'
                ? 'bg-[#FF6B2C]/10 text-[#FF6B2C]'
                : paymentSubtype === 'booking_payments'
                ? 'bg-[#2FA66A]/10 text-[#2FA66A]'
                : 'bg-[#171717]/10 text-[#171717]'
            }`}
          >
            {reportDomain === 'bookings' ? (
              <Calendar className="w-4.5 h-4.5" />
            ) : paymentSubtype === 'booking_payments' ? (
              <IndianRupee className="w-4.5 h-4.5" />
            ) : (
              <Building2 className="w-4.5 h-4.5" />
            )}
          </div>
          <div>
            <h3 className="text-[13.5px] font-extrabold text-[#171717]">
              {reportDomain === 'bookings'
                ? 'Pitch Schedule & Player Records'
                : paymentSubtype === 'booking_payments'
                ? 'Customer Collections & Dues'
                : 'Bank Payouts & UTR Records'}
            </h3>
            <p className="text-[11px] text-[#777570]">
              {reportDomain === 'bookings'
                ? `${filteredBookings.length} court bookings in selected period`
                : paymentSubtype === 'booking_payments'
                ? `INR ${totalCollected.toLocaleString('en-IN')} collected · INR ${totalDue.toLocaleString('en-IN')} dues`
                : `INR ${totalSettledAmount.toLocaleString('en-IN')} settled across ${filteredSettlements.length} transfers`}
            </p>
          </div>
        </div>

        <span
          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
            reportDomain === 'bookings'
              ? 'bg-[#FF6B2C]/10 text-[#FF6B2C]'
              : paymentSubtype === 'booking_payments'
              ? 'bg-[#2FA66A]/10 text-[#2FA66A]'
              : 'bg-[#171717]/10 text-[#171717]'
          }`}
        >
          {reportDomain === 'bookings'
            ? 'Bookings'
            : paymentSubtype === 'booking_payments'
            ? 'Collections'
            : 'Payouts'}
        </span>
      </div>

      {/* 4. REPORT TIMEFRAME SELECTOR (DAILY / WEEKLY / MONTHLY / CUSTOM) */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8E6E1] shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FAF9F6] text-[#171717] flex items-center justify-center border border-[#E8E6E1]">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[13px] font-bold text-[#171717] block leading-tight">
                Report Period
              </span>
              <span className="text-[10.5px] text-[#777570]">
                Choose day, week, month, or custom scope
              </span>
            </div>
          </div>
          <span className="text-[11px] font-extrabold text-[#171717] uppercase bg-[#F1F0EC] px-2 py-0.5 rounded-lg">
            {periodType}
          </span>
        </div>

        {/* 4 Period Tabs */}
        <div className="grid grid-cols-4 gap-1 bg-[#F1F0EC] p-1 rounded-xl">
          {(
            [
              { id: 'daily', label: 'Day' },
              { id: 'weekly', label: 'Week' },
              { id: 'monthly', label: 'Month' },
              { id: 'custom', label: 'Custom' },
            ] as const
          ).map((tab) => {
            const isActive = periodType === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-period-${tab.id}`}
                onClick={() => {
                  haptics.tap();
                  setPeriodType(tab.id);
                }}
                className={`py-1.5 rounded-lg text-[12px] font-bold transition-all active-press cursor-pointer flex items-center justify-center ${
                  isActive
                    ? 'bg-white text-[#171717] shadow-xs'
                    : 'text-[#777570] hover:text-[#171717]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Period Configuration */}
        <div className="bg-[#FAF9F6] p-3 rounded-xl border border-[#E8E6E1] space-y-2.5">
          {/* Day (Daily) Mode */}
          {periodType === 'daily' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#777570]">Select Day</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      haptics.tap();
                      setSelectedDay('2026-08-28');
                    }}
                    className={`text-[10.5px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                      selectedDay === '2026-08-28'
                        ? 'bg-[#171717] text-white border-transparent'
                        : 'bg-white text-[#777570] border-[#E8E6E1]'
                    }`}
                  >
                    Today (28 Aug)
                  </button>
                  <button
                    onClick={() => {
                      haptics.tap();
                      setSelectedDay('2026-08-27');
                    }}
                    className={`text-[10.5px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                      selectedDay === '2026-08-27'
                        ? 'bg-[#171717] text-white border-transparent'
                        : 'bg-white text-[#777570] border-[#E8E6E1]'
                    }`}
                  >
                    Yesterday (27 Aug)
                  </button>
                </div>
              </div>
              <input
                type="date"
                value={selectedDay}
                onChange={(e) => {
                  haptics.tap();
                  setSelectedDay(e.target.value);
                }}
                className="w-full bg-white border border-[#E8E6E1] rounded-xl px-3 py-2 text-[13px] font-bold text-[#171717] focus:outline-none focus:border-[#FF6B2C]"
              />
            </div>
          )}

          {/* Week (Weekly) Mode */}
          {periodType === 'weekly' && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#777570]">Select 7-Day Week Cycle</span>
              <div className="space-y-1.5">
                {WEEK_OPTIONS.map((w, idx) => {
                  const isSelected = selectedWeekIndex === idx;
                  return (
                    <div
                      key={w.label}
                      onClick={() => {
                        haptics.tap();
                        setSelectedWeekIndex(idx);
                      }}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-white border-[#2FA66A] shadow-xs text-[#171717]'
                          : 'bg-white border-[#E8E6E1] text-[#777570] hover:bg-[#F1F0EC]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isSelected ? 'bg-[#2FA66A]' : 'bg-[#D1CFCA]'
                          }`}
                        />
                        <span className="text-[12.5px] font-bold text-[#171717]">{w.label}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#2FA66A]" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Month (Monthly) Mode */}
          {periodType === 'monthly' && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#777570]">Select Month Statement</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {MONTH_OPTIONS.map((m) => {
                  const isSelected = selectedMonth === m.value;
                  return (
                    <button
                      key={m.value}
                      onClick={() => {
                        haptics.tap();
                        setSelectedMonth(m.value);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all active-press cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-white border-[#2FA66A] text-[#171717] shadow-xs'
                          : 'bg-white border-[#E8E6E1] text-[#777570] hover:bg-[#F1F0EC]'
                      }`}
                    >
                      <div>
                        <span className="text-[12.5px] font-bold block text-[#171717]">
                          {m.label}
                        </span>
                        <span className="text-[10px] text-[#777570]">{m.desc}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#2FA66A] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom Date Pickers */}
          {periodType === 'custom' && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#777570]">Choose Start & End Date</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-[#A3A099] block mb-1">
                    START DATE
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => {
                      haptics.tap();
                      setCustomStartDate(e.target.value);
                    }}
                    className="w-full bg-white border border-[#E8E6E1] rounded-xl px-2.5 py-2 text-[12px] font-bold text-[#171717] focus:outline-none focus:border-[#2FA66A]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#A3A099] block mb-1">
                    END DATE
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => {
                      haptics.tap();
                      setCustomEndDate(e.target.value);
                    }}
                    className="w-full bg-white border border-[#E8E6E1] rounded-xl px-2.5 py-2 text-[12px] font-bold text-[#171717] focus:outline-none focus:border-[#2FA66A]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. DOMAIN-SPECIFIC SUB-FILTERS */}
      {reportDomain === 'bookings' ? (
        <div className="bg-white rounded-2xl p-3.5 border border-[#E8E6E1] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-[#171717]">Filter by Sport</span>
            <span className="text-[11px] text-[#777570]">
              {selectedSport === 'All' ? 'All sports' : selectedSport}
            </span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {['All', 'Football', 'Cricket', 'Badminton', 'Pickleball'].map((sport) => {
              const isActive = selectedSport === sport;
              return (
                <button
                  key={sport}
                  type="button"
                  onClick={() => {
                    haptics.tap();
                    setSelectedSport(sport);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-[11.5px] font-bold shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#171717] text-white shadow-xs'
                      : 'bg-[#FAF9F6] border border-[#E8E6E1] text-[#777570] hover:text-[#171717]'
                  }`}
                >
                  {sport}
                </button>
              );
            })}
          </div>
        </div>
      ) : paymentSubtype === 'booking_payments' ? (
        <div className="bg-white rounded-2xl p-3.5 border border-[#E8E6E1] shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-[#171717]">Filter by Payment Mode</span>
            <span className="text-[11px] text-[#777570]">
              {selectedPaymentMode === 'All' ? 'All modes' : selectedPaymentMode}
            </span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {['All', 'UPI', 'Cash', 'Online Link', 'Card'].map((mode) => {
              const isActive = selectedPaymentMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    haptics.tap();
                    setSelectedPaymentMode(mode);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-[11.5px] font-bold shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#2FA66A] text-white shadow-xs'
                      : 'bg-[#FAF9F6] border border-[#E8E6E1] text-[#777570] hover:text-[#171717]'
                  }`}
                >
                  {mode}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-3.5 border border-[#E8E6E1] shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-[#171717]">Linked Bank Account</span>
            <span className="text-[11px] font-bold text-[#2FA66A] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Auto-NEFT
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#E8E6E1] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#171717]" />
              <div>
                <span className="text-[12.5px] font-extrabold text-[#171717] block leading-none">
                  HDFC Bank · A/c •••• 4321
                </span>
                <span className="text-[10px] text-[#777570] mt-0.5 block">
                  IFSC: HDFC0001234 · Daily 6:00 AM Settlement
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-white px-2 py-1 rounded-md border border-[#E8E6E1] text-[#171717]">
              Active
            </span>
          </div>
        </div>
      )}

      {/* 6. LIVE METRIC PREVIEW CARDS */}
      <div className="bg-white rounded-2xl p-3.5 border border-[#E8E6E1] shadow-xs space-y-2">
        <span className="text-[11px] font-bold text-[#777570] uppercase tracking-wider block">
          Statement Data Preview
        </span>

        {reportDomain === 'bookings' ? (
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#E8E6E1] text-center">
              <span className="text-[9.5px] font-semibold text-[#777570] block">Bookings</span>
              <span className="text-[15px] font-black text-[#171717] mt-0.5 block">
                {filteredBookings.length}
              </span>
            </div>
            <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#E8E6E1] text-center">
              <span className="text-[9.5px] font-semibold text-[#777570] block">Gross Value</span>
              <span className="text-[15px] font-black text-[#171717] mt-0.5 block">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#E8E6E1] text-center">
              <span className="text-[9.5px] font-semibold text-[#777570] block">Avg / Slot</span>
              <span className="text-[15px] font-black text-[#2FA66A] mt-0.5 block">
                ₹
                {filteredBookings.length > 0
                  ? Math.round(totalRevenue / filteredBookings.length).toLocaleString('en-IN')
                  : '0'}
              </span>
            </div>
          </div>
        ) : paymentSubtype === 'booking_payments' ? (
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#2FA66A]/5 p-2.5 rounded-xl border border-[#2FA66A]/20 text-center">
              <span className="text-[9.5px] font-bold text-[#2FA66A] block">Collected</span>
              <span className="text-[15px] font-black text-[#1E774A] mt-0.5 block">
                ₹{totalCollected.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="bg-[#FF6B2C]/5 p-2.5 rounded-xl border border-[#FF6B2C]/20 text-center">
              <span className="text-[9.5px] font-bold text-[#FF6B2C] block">Dues</span>
              <span className="text-[15px] font-black text-[#C84614] mt-0.5 block">
                ₹{totalDue.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#E8E6E1] text-center">
              <span className="text-[9.5px] font-semibold text-[#777570] block">Realization</span>
              <span className="text-[15px] font-black text-[#171717] mt-0.5 block">
                {realizationRate}%
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#2FA66A]/5 p-2.5 rounded-xl border border-[#2FA66A]/20 text-center">
              <span className="text-[9.5px] font-bold text-[#2FA66A] block">Total Settled</span>
              <span className="text-[15px] font-black text-[#1E774A] mt-0.5 block">
                ₹{totalSettledAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#E8E6E1] text-center">
              <span className="text-[9.5px] font-semibold text-[#777570] block">Transfers</span>
              <span className="text-[15px] font-black text-[#171717] mt-0.5 block">
                {filteredSettlements.length}
              </span>
            </div>
            <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#E8E6E1] text-center">
              <span className="text-[9.5px] font-semibold text-[#777570] block">Deductions</span>
              <span className="text-[15px] font-black text-[#3DD68C] mt-0.5 block">₹0</span>
            </div>
          </div>
        )}
      </div>

      {/* 7. DOCUMENT FORMAT PICKER (PDF / EXCEL / CSV) */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8E6E1] shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FAF9F6] text-[#171717] flex items-center justify-center border border-[#E8E6E1]">
              <FileSpreadsheet className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[13px] font-bold text-[#171717] block leading-tight">
                Document Format
              </span>
              <span className="text-[10.5px] text-[#777570]">Select export file type</span>
            </div>
          </div>
          <span className="text-[11px] font-extrabold text-[#171717] uppercase bg-[#F1F0EC] px-2 py-0.5 rounded-lg">
            {documentFormat.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* PDF Format */}
          <div
            id="format-pdf"
            onClick={() => {
              haptics.tap();
              setDocumentFormat('pdf');
            }}
            className={`p-3 rounded-2xl border transition-all cursor-pointer active-press flex flex-col justify-between ${
              documentFormat === 'pdf'
                ? reportDomain === 'bookings'
                  ? 'bg-[#FF6B2C]/5 border-[#FF6B2C] shadow-xs'
                  : 'bg-[#2FA66A]/5 border-[#2FA66A] shadow-xs'
                : 'bg-[#FAF9F6] border-[#E8E6E1] hover:bg-[#F1F0EC]'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="w-8 h-8 rounded-xl bg-[#D94B4B]/10 text-[#D94B4B] flex items-center justify-center">
                <FileText className="w-4.5 h-4.5" />
              </div>
              {documentFormat === 'pdf' && (
                <span
                  className={`w-2 h-2 rounded-full ${
                    reportDomain === 'bookings' ? 'bg-[#FF6B2C]' : 'bg-[#2FA66A]'
                  }`}
                />
              )}
            </div>
            <div className="mt-2.5">
              <h4 className="text-[12.5px] font-bold text-[#171717]">PDF</h4>
              <p className="text-[10px] text-[#777570] mt-0.5 leading-tight">
                Official statement layout
              </p>
            </div>
          </div>

          {/* Excel Format */}
          <div
            id="format-excel"
            onClick={() => {
              haptics.tap();
              setDocumentFormat('excel');
            }}
            className={`p-3 rounded-2xl border transition-all cursor-pointer active-press flex flex-col justify-between ${
              documentFormat === 'excel'
                ? 'bg-[#2FA66A]/5 border-[#2FA66A] shadow-xs'
                : 'bg-[#FAF9F6] border-[#E8E6E1] hover:bg-[#F1F0EC]'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="w-8 h-8 rounded-xl bg-[#2FA66A]/10 text-[#2FA66A] flex items-center justify-center">
                <FileSpreadsheet className="w-4.5 h-4.5" />
              </div>
              {documentFormat === 'excel' && (
                <span className="w-2 h-2 rounded-full bg-[#2FA66A]" />
              )}
            </div>
            <div className="mt-2.5">
              <h4 className="text-[12.5px] font-bold text-[#171717]">Excel (.xlsx)</h4>
              <p className="text-[10px] text-[#777570] mt-0.5 leading-tight">Formatted workbook</p>
            </div>
          </div>

          {/* CSV Format */}
          <div
            id="format-csv"
            onClick={() => {
              haptics.tap();
              setDocumentFormat('csv');
            }}
            className={`p-3 rounded-2xl border transition-all cursor-pointer active-press flex flex-col justify-between ${
              documentFormat === 'csv'
                ? 'bg-[#171717]/5 border-[#171717] shadow-xs'
                : 'bg-[#FAF9F6] border-[#E8E6E1] hover:bg-[#F1F0EC]'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="w-8 h-8 rounded-xl bg-[#171717]/10 text-[#171717] flex items-center justify-center">
                <FileCode className="w-4.5 h-4.5" />
              </div>
              {documentFormat === 'csv' && (
                <span className="w-2 h-2 rounded-full bg-[#171717]" />
              )}
            </div>
            <div className="mt-2.5">
              <h4 className="text-[12.5px] font-bold text-[#171717]">CSV</h4>
              <p className="text-[10px] text-[#777570] mt-0.5 leading-tight">Universal raw data</p>
            </div>
          </div>
        </div>
      </div>

      {/* 8. DOWNLOAD CTA BUTTON */}
      <div className="pt-2">
        <button
          id="btn-download-report-full"
          onClick={handleDownload}
          disabled={isExporting || getActiveItemCount() === 0}
          className={`w-full h-12 rounded-2xl font-bold text-[14px] flex items-center justify-center gap-2 shadow-md active-press transition-all cursor-pointer ${
            getActiveItemCount() === 0
              ? 'bg-[#E8E6E1] text-[#A3A099] cursor-not-allowed'
              : reportDomain === 'bookings'
              ? 'bg-[#FF6B2C] text-white hover:bg-[#e85b1e]'
              : 'bg-[#2FA66A] text-white hover:bg-[#268c59]'
          }`}
        >
          {isExporting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Building {documentFormat.toUpperCase()} Document...</span>
            </>
          ) : (
            <>
              <Download className="w-4.5 h-4.5" />
              <span>
                Download{' '}
                {reportDomain === 'bookings'
                  ? 'Booking Report'
                  : paymentSubtype === 'booking_payments'
                  ? 'Payment Collection Report'
                  : 'Settlement Payout Report'}{' '}
                ({getActiveItemCount()})
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
