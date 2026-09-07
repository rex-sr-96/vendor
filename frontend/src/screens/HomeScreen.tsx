import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  Plus,
  Ban,
  Wallet,
  Clock,
  ChevronRight,
  CreditCard,
  BarChart2,
  TrendingUp,
  Link2,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { haptics } from '../utils/haptics';
import { formatMinutesSeconds } from '../utils/feeCalculator';

export type TimeframeType = 'today' | 'month' | 'yearly';

interface ChartDataPoint {
  time: string;
  amount: string;
  height: number;
  bookings: number;
  isPeak?: boolean;
}

export const HomeScreen: React.FC = () => {
  const {
    currentUser,
    venueName,
    navigateTo,
    setSelectedBookingId,
    setActiveModal,
    sendPaymentLink,
    isPaymentLinkBlocked,
    getPaymentLinkTimeRemaining,
    showToast,
    unreadNotifCount,
    bookings,
    courts,
    slots,
    operatingHours,
    settlements,
    paymentSettings,
    bankDetails,
  } = useApp();

  const isStaff = currentUser?.type === 'staff';

  const todayDayName = useMemo(() => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' });
  }, []);

  const todaySchedule = useMemo(() => {
    return operatingHours?.find(
      (d) => d.day.toLowerCase() === todayDayName.toLowerCase() || d.shortDay.toLowerCase() === todayDayName.slice(0, 3).toLowerCase()
    );
  }, [operatingHours, todayDayName]);

  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Active Timeframe: 'today' | 'month' | 'yearly'
  const [timeframe, setTimeframe] = useState<TimeframeType>('today');
  const [selectedBarIdx, setSelectedBarIdx] = useState<number | null>(0);

  // Currency Formatter Helpers
  const formatK = (num: number) => {
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}k`;
    return `₹${num}`;
  };
  const formatCurrency = (num: number) => `₹${num.toLocaleString('en-IN')}`;

  // Handle switching timeframe with default bar selection
  const handleTimeframeChange = (tf: TimeframeType) => {
    haptics.tap();
    setTimeframe(tf);
    setSelectedBarIdx(0);
  };

  // 1. TODAY'S DYNAMIC HOURLY DATA (Computed directly from real bookings across hourly blocks)
  const todayHourlyData: ChartDataPoint[] = useMemo(() => {
    const buckets = [
      { label: '6 AM', startHour: 6, endHour: 8 },
      { label: '8 AM', startHour: 8, endHour: 10 },
      { label: '10 AM', startHour: 10, endHour: 12 },
      { label: '12 PM', startHour: 12, endHour: 14 },
      { label: '2 PM', startHour: 14, endHour: 16 },
      { label: '4 PM', startHour: 16, endHour: 18 },
      { label: '6 PM', startHour: 18, endHour: 20 },
      { label: '8 PM', startHour: 20, endHour: 22 },
      { label: '10 PM', startHour: 22, endHour: 24 },
    ];

    const bucketStats = buckets.map((b) => {
      const matching = bookings.filter((bk) => {
        const timeStr = bk.timeSlot || '';
        const match = timeStr.match(/(\d+):?(\d+)?\s*(AM|PM)/i);
        if (!match) return false;
        let h = parseInt(match[1], 10);
        const ampm = match[3]?.toUpperCase();
        if (ampm === 'PM' && h < 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
        return h >= b.startHour && h < b.endHour;
      });

      const amount = matching.reduce((sum, bk) => sum + (bk.paidAmount || 0), 0);
      return {
        time: b.label,
        rawAmount: amount,
        amount: formatK(amount),
        bookings: matching.length,
      };
    });

    const maxAmount = Math.max(...bucketStats.map((b) => b.rawAmount), 0);
    return bucketStats.map((b) => ({
      time: b.time,
      amount: b.amount,
      height: maxAmount > 0 && b.rawAmount > 0 ? Math.max(20, Math.round((b.rawAmount / maxAmount) * 100)) : 12,
      bookings: b.bookings,
      isPeak: maxAmount > 0 && b.rawAmount === maxAmount,
    }));
  }, [bookings]);

  // 2. THIS MONTH'S DYNAMIC DATA (Grouped by date ranges)
  const monthDailyData: ChartDataPoint[] = useMemo(() => {
    const ranges = [
      { label: 'Day 1–5', startDay: 1, endDay: 5 },
      { label: 'Day 6–10', startDay: 6, endDay: 10 },
      { label: 'Day 11–15', startDay: 11, endDay: 15 },
      { label: 'Day 16–20', startDay: 16, endDay: 20 },
      { label: 'Day 21–25', startDay: 21, endDay: 25 },
      { label: 'Day 26–31', startDay: 26, endDay: 31 },
    ];

    const rangeStats = ranges.map((r) => {
      const matching = bookings.filter((bk) => {
        const parts = bk.date?.split(' ') || [];
        const day = parseInt(parts[0], 10);
        return !isNaN(day) && day >= r.startDay && day <= r.endDay;
      });
      const amount = matching.reduce((sum, bk) => sum + (bk.paidAmount || 0), 0);
      return {
        time: r.label,
        rawAmount: amount,
        amount: formatK(amount),
        bookings: matching.length,
      };
    });

    const maxAmount = Math.max(...rangeStats.map((r) => r.rawAmount), 0);
    return rangeStats.map((r) => ({
      time: r.time,
      amount: r.amount,
      height: maxAmount > 0 && r.rawAmount > 0 ? Math.max(20, Math.round((r.rawAmount / maxAmount) * 100)) : 12,
      bookings: r.bookings,
      isPeak: maxAmount > 0 && r.rawAmount === maxAmount,
    }));
  }, [bookings]);

  // 3. YEARLY DYNAMIC DATA (Grouped by 12 Months)
  const yearlyMonthlyData: ChartDataPoint[] = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthStats = months.map((m) => {
      const matching = bookings.filter((bk) => bk.date?.includes(m));
      const amount = matching.reduce((sum, bk) => sum + (bk.paidAmount || 0), 0);
      return {
        time: m,
        rawAmount: amount,
        amount: formatK(amount),
        bookings: matching.length,
      };
    });

    const maxAmount = Math.max(...monthStats.map((m) => m.rawAmount), 0);
    return monthStats.map((m) => ({
      time: m.time,
      amount: m.amount,
      height: maxAmount > 0 && m.rawAmount > 0 ? Math.max(20, Math.round((m.rawAmount / maxAmount) * 100)) : 12,
      bookings: m.bookings,
      isPeak: maxAmount > 0 && m.rawAmount === maxAmount,
    }));
  }, [bookings]);

  // Dynamic Chart Properties
  const activeChartData =
    timeframe === 'today'
      ? todayHourlyData
      : timeframe === 'month'
      ? monthDailyData
      : yearlyMonthlyData;

  // Real Financial & Operational Metrics
  const totalRevenue = useMemo(() => bookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0), [bookings]);
  const totalPending = useMemo(() => bookings.reduce((sum, b) => sum + (b.balanceAmount || 0), 0), [bookings]);
  const occupiedSlots = useMemo(() => slots.filter((s) => s.state === 'booked' || s.state === 'pending'), [slots]);
  const occupancyRate = slots.length > 0 ? Math.round((occupiedSlots.length / slots.length) * 100) : 0;
  const totalSettled = useMemo(() => settlements.reduce((sum, s) => sum + (s.settledAmount || 0), 0), [settlements]);

  const currentMonthName = useMemo(() => {
    return new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }, []);

  const chartMeta = {
    today: {
      category: "Today's Activity",
      title: 'Hourly Utilization',
      badge: `${occupancyRate}% Occupied`,
      badgeColor: occupancyRate > 0 ? 'text-[#2FA66A] bg-[#2FA66A]/10' : 'text-[#777570] bg-[#F1F0EC]',
      legendLeft: `${bookings.length} Bookings`,
      legendRight: `${slots.length} Total Slots`,
      itemUnit: 'Slot',
    },
    month: {
      category: `${currentMonthName} Velocity`,
      title: 'Daily Revenue & Booking Trend',
      badge: `${bookings.length} Bookings`,
      badgeColor: bookings.length > 0 ? 'text-[#FF6B2C] bg-[#FF6B2C]/10' : 'text-[#777570] bg-[#F1F0EC]',
      legendLeft: `${courts.length} Active Courts`,
      legendRight: formatCurrency(totalRevenue),
      itemUnit: 'Period',
    },
    yearly: {
      category: 'Annual Performance',
      title: 'Month-by-Month Gross Revenue',
      badge: formatCurrency(totalRevenue),
      badgeColor: totalRevenue > 0 ? 'text-[#2FA66A] bg-[#2FA66A]/10' : 'text-[#777570] bg-[#F1F0EC]',
      legendLeft: `${bookings.length} Total Matches`,
      legendRight: totalSettled > 0 ? `${formatCurrency(totalSettled)} Settled` : 'Real-Time Sync',
      itemUnit: 'Month',
    },
  }[timeframe];

  // Dynamic KPIs by Timeframe (Computed live from actual bookings and ledger)
  const kpis = {
    today: [
      {
        id: 'bookings',
        label: "Today's Bookings",
        value: `${bookings.length}`,
        trend: bookings.length > 0 ? `${bookings.length} confirmed` : '0 booked',
        trendPositive: bookings.length > 0,
      },
      {
        id: 'revenue',
        label: "Today's Revenue",
        value: formatCurrency(totalRevenue),
        trend: totalRevenue > 0 ? 'Live ledger' : '₹0 collected',
        trendPositive: totalRevenue > 0,
      },
      {
        id: 'pending',
        label: 'Pending Dues',
        value: formatCurrency(totalPending),
        trend: `${bookings.filter((b) => b.balanceAmount > 0).length} dues`,
        trendPositive: totalPending === 0,
        isWarning: totalPending > 0,
      },
      {
        id: 'utilization',
        label: 'Court Occupancy',
        value: `${occupancyRate}%`,
        trend: `${occupiedSlots.length}/${slots.length} slots`,
        trendPositive: occupancyRate > 0,
      },
    ],
    month: [
      {
        id: 'bookings',
        label: 'Monthly Bookings',
        value: `${bookings.length}`,
        trend: 'Month to date',
        trendPositive: true,
      },
      {
        id: 'revenue',
        label: 'Monthly Gross Revenue',
        value: formatCurrency(totalRevenue),
        trend: 'Collections',
        trendPositive: true,
      },
      {
        id: 'pending',
        label: 'Pending Collections',
        value: formatCurrency(totalPending),
        trend: `${bookings.filter((b) => b.balanceAmount > 0).length} walk-in dues`,
        trendPositive: totalPending === 0,
        isWarning: totalPending > 0,
      },
      {
        id: 'utilization',
        label: 'Avg Monthly Occupancy',
        value: `${occupancyRate}%`,
        trend: 'Arena capacity',
        trendPositive: true,
      },
    ],
    yearly: [
      {
        id: 'bookings',
        label: 'Total Annual Bookings',
        value: `${bookings.length}`,
        trend: 'Annual count',
        trendPositive: true,
      },
      {
        id: 'revenue',
        label: 'Annual Gross Revenue',
        value: formatCurrency(totalRevenue),
        trend: 'Gross receipts',
        trendPositive: true,
      },
      {
        id: 'pending',
        label: 'Bank Payouts Settled',
        value: formatCurrency(totalSettled),
        trend: 'Verified transfers',
        trendPositive: true,
      },
      {
        id: 'utilization',
        label: 'Annual Arena Utilization',
        value: `${occupancyRate}%`,
        trend: 'Arena overall',
        trendPositive: true,
      },
    ],
  }[timeframe];

  // Action Required Bookings (Uncollected dues, hold expiring, payment pending)
  const actionRequiredBookings = useMemo(() => {
    return bookings.filter(
      (b) => (b.balanceAmount && b.balanceAmount > 0) || b.status === 'Payment Pending'
    );
  }, [bookings]);

  // Today's Scheduled Bookings
  const todayScheduleBookings = useMemo(() => {
    return bookings.slice(0, 5);
  }, [bookings]);

  const handleActionRequiredPaymentLink = (e: React.MouseEvent, bookingId: string) => {
    e.stopPropagation();
    haptics.tap();
    if (isPaymentLinkBlocked(bookingId)) {
      const remaining = getPaymentLinkTimeRemaining(bookingId);
      showToast('Payment Link Active', `Link is valid for 15 mins. Button blocked for ${formatMinutesSeconds(remaining)}.`, 'info');
      return;
    }
    sendPaymentLink(bookingId);
  };

  const handleViewBooking = (bookingId: string) => {
    haptics.tap();
    setSelectedBookingId(bookingId);
    navigateTo('booking_details');
  };

  return (
    <div className="pb-8 pt-3 px-4 md:px-0 md:pt-0 w-full space-y-5 select-none">
      {/* Mobile-only Header */}
      <div className="flex md:hidden items-center justify-between pt-1">
        <div>
          <span className="text-[11.5px] font-semibold text-[#777570] block">Good morning</span>
          <h1 className="text-[22px] font-extrabold text-[#171717] tracking-tight leading-none mt-0.5">
            {venueName}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Notification Center Bell */}
          <button
            onClick={() => {
              haptics.tap();
              navigateTo('notifications');
            }}
            className="relative w-9 h-9 rounded-full bg-white border border-[#E8E6E1] text-[#171717] flex items-center justify-center shadow-2xs hover:bg-[#F7F7F5] active-press cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-[#171717]" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#FF6B2C] text-white text-[9.5px] font-black flex items-center justify-center ring-2 ring-[#F6F5F2]">
                {unreadNotifCount}
              </span>
            )}
          </button>

          {/* Settings / Venue Profile */}
          <button
            onClick={() => {
              haptics.tap();
              navigateTo('settings');
            }}
            className="w-9 h-9 rounded-full bg-[#171717] text-white flex items-center justify-center font-extrabold text-xs shadow-xs active-press cursor-pointer"
            aria-label="Settings"
          >
            TT
          </button>
        </div>
      </div>

      {/* Top Overview Control Bar: Title & Timeframe Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2FA66A] animate-pulse" />
            <h1 className="text-[20px] sm:text-[22px] font-black text-[#171717] tracking-tight">
              {timeframe === 'today' && "Today's Operations"}
              {timeframe === 'month' && `${currentMonthName} Performance`}
              {timeframe === 'yearly' && 'Annual Arena Analytics'}
            </h1>
          </div>
          <p className="text-[12.5px] text-[#777570] font-medium mt-0.5">
            {timeframe === 'today' &&
              (todaySchedule
                ? `Real-time slot bookings, hourly court loads & today's collections (${todaySchedule.isOpen ? `${todaySchedule.openTime} – ${todaySchedule.closeTime}` : 'Closed Today'}).`
                : 'Real-time slot bookings, hourly court loads & today’s due collections.')}
            {timeframe === 'month' && 'Month-to-date revenue velocity, court load share & occupancy trends.'}
            {timeframe === 'yearly' && 'Full year gross revenue trajectory, category split & annual milestones.'}
          </p>
        </div>

        {/* Sleek Segmented Switcher Pill */}
        <div className="grid grid-cols-3 w-full sm:w-auto sm:inline-flex items-center bg-[#F1F0EC] p-1 rounded-2xl border border-[#E4E2DC] shadow-2xs self-stretch sm:self-auto">
          <button
            id="tab-overview-today"
            type="button"
            onClick={() => handleTimeframeChange('today')}
            className={`px-3 py-1.5 rounded-xl text-[12px] sm:text-[12.5px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              timeframe === 'today'
                ? 'bg-white text-[#171717] shadow-sm ring-1 ring-black/5'
                : 'text-[#777570] hover:text-[#171717]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#2FA66A]" />
            <span>Today</span>
          </button>

          <button
            id="tab-overview-month"
            type="button"
            onClick={() => handleTimeframeChange('month')}
            className={`px-3 py-1.5 rounded-xl text-[12px] sm:text-[12.5px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              timeframe === 'month'
                ? 'bg-white text-[#171717] shadow-sm ring-1 ring-black/5'
                : 'text-[#777570] hover:text-[#171717]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-[#FF6B2C]" />
            <span>Month</span>
          </button>

          <button
            id="tab-overview-yearly"
            type="button"
            onClick={() => handleTimeframeChange('yearly')}
            className={`px-3 py-1.5 rounded-xl text-[12px] sm:text-[12.5px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              timeframe === 'yearly'
                ? 'bg-white text-[#171717] shadow-sm ring-1 ring-black/5'
                : 'text-[#777570] hover:text-[#171717]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-[#4D83C4]" />
            <span>Yearly</span>
          </button>
        </div>
      </div>

      {/* Top Arena Utilization & Revenue Graph Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E8E6E1] shadow-xs space-y-3.5">
        {/* Graph Header: Title & Selected Slot Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FF6B2C]/10 text-[#FF6B2C] flex items-center justify-center shrink-0">
              <BarChart2 className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#777570] block">
                {chartMeta.category}
              </span>
              <h2 className="text-[14.5px] sm:text-[15px] font-extrabold text-[#171717] tracking-tight leading-none mt-0.5">
                {chartMeta.title}
              </h2>
            </div>
          </div>

          <div className="text-right">
            <span className={`text-[11px] sm:text-[11.5px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${chartMeta.badgeColor}`}>
              <TrendingUp className="w-3.5 h-3.5" />
              {chartMeta.badge}
            </span>
          </div>
        </div>

        {/* Selected Slot Information Pill */}
        {selectedBarIdx !== null && activeChartData[selectedBarIdx] && (
          <div className="bg-[#FAF9F6] border border-[#E8E6E1] rounded-2xl px-3.5 py-2 flex items-center justify-between text-[11.5px] sm:text-[12px] transition-all">
            <div className="flex items-center gap-1.5 sm:gap-2 text-[#777570] truncate">
              <span className="font-bold text-[#171717]">
                {activeChartData[selectedBarIdx].time} {chartMeta.itemUnit}
              </span>
              <span>·</span>
              <span>{activeChartData[selectedBarIdx].bookings} Bookings</span>
            </div>
            <span className="font-extrabold text-[#FF6B2C] text-[12.5px] sm:text-[13px] shrink-0 ml-2">
              {activeChartData[selectedBarIdx].amount}
            </span>
          </div>
        )}

        {/* Interactive Dynamic Bar Chart */}
        <div className="pt-2">
          <div className="h-28 w-full flex items-end justify-between gap-1 sm:gap-2 pb-1">
            {activeChartData.map((item, idx) => {
              const isSelected = selectedBarIdx === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    haptics.tap();
                    setSelectedBarIdx(idx);
                    showToast(`${item.time}: ${item.amount} (${item.bookings} bookings)`);
                  }}
                  className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer focus:outline-none"
                >
                  {/* Bar Column with Smooth Height Animation */}
                  <div
                    style={{ height: `${item.height}%` }}
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      isSelected
                        ? 'bg-[#FF6B2C] shadow-md ring-2 ring-[#FF6B2C]/40'
                        : item.isPeak
                        ? 'bg-[#FF854D]/75 hover:bg-[#FF6B2C]'
                        : item.bookings > 0
                        ? 'bg-[#2FA66A]/60 hover:bg-[#2FA66A]'
                        : 'bg-[#E8E6E1] hover:bg-[#D8D6D0]'
                    }`}
                  />
                  {/* Label */}
                  <span
                    className={`text-[9px] sm:text-[9.5px] font-bold mt-2 truncate ${
                      isSelected ? 'text-[#FF6B2C]' : 'text-[#777570]'
                    }`}
                  >
                    {item.time.replace(':00', '')}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Graph Footer Legend */}
          <div className="flex items-center justify-between pt-2.5 border-t border-[#F1F0EC] text-[11px] sm:text-[11.5px]">
            <div className="flex items-center gap-3 text-[#777570]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#FF6B2C]" />
                <span className="font-semibold text-[#171717]">{chartMeta.legendLeft}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#E8E6E1]" />
                <span>Available Slots</span>
              </span>
            </div>
            <span className="text-[#2FA66A] font-bold inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2FA66A]" />
              {chartMeta.legendRight}
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic KPI Cards - Balanced 2x2 Grid on Mobile, 4-col on Desktop */}
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.id}
            className="w-full bg-white rounded-2xl p-3.5 sm:p-4 border border-[#E8E6E1] shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow"
          >
            <span className="text-[10px] sm:text-[11px] md:text-[11.5px] font-bold uppercase tracking-wider text-[#777570] truncate">
              {kpi.label}
            </span>
            <div className="mt-2 flex items-baseline justify-between gap-1">
              <p className="text-[19px] sm:text-[21px] md:text-[23px] font-black text-[#171717] tracking-tight truncate">
                {kpi.value}
              </p>
              <span
                className={`text-[10.5px] sm:text-[11px] md:text-[11.5px] font-bold shrink-0 ${
                  kpi.isWarning ? 'text-[#E7A72F]' : 'text-[#2FA66A]'
                }`}
              >
                {kpi.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Row (Mobile only) */}
      <div className="grid grid-cols-3 gap-2 md:hidden">
        {isStaff ? (
          <div className="h-11 bg-[#F1F0EC] text-[#777570] border border-[#E8E6E1] rounded-2xl font-bold text-[12px] flex items-center justify-center gap-1.5 shadow-2xs cursor-not-allowed">
            <Lock className="w-3.5 h-3.5 text-[#777570]" />
            <span>View-Only</span>
          </div>
        ) : (
          <button
            onClick={() => {
              haptics.tap();
              setActiveModal('new_booking');
            }}
            className="h-11 bg-[#FF6B2C] text-white rounded-2xl font-bold text-[12.5px] flex items-center justify-center gap-1.5 shadow-xs hover:bg-[#e85b1e] active-press transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Booking</span>
          </button>
        )}

        {isStaff ? (
          <div className="h-11 bg-[#F1F0EC] text-[#777570] border border-[#E8E6E1] rounded-2xl font-bold text-[12px] flex items-center justify-center gap-1.5 shadow-2xs cursor-not-allowed">
            <Lock className="w-3.5 h-3.5 text-[#777570]" />
            <span>Locked</span>
          </div>
        ) : (
          <button
            onClick={() => {
              haptics.tap();
              setActiveModal('block_slot');
            }}
            className="h-11 bg-white text-[#171717] border border-[#E8E6E1] rounded-2xl font-bold text-[12.5px] flex items-center justify-center gap-1.5 shadow-xs hover:border-[#171717] active-press transition-all cursor-pointer"
          >
            <Ban className="w-3.5 h-3.5 text-[#777570] stroke-[2]" />
            <span>Block Slot</span>
          </button>
        )}

        <button
          onClick={() => {
            haptics.tap();
            navigateTo('slots');
          }}
          className="h-11 bg-white text-[#171717] border border-[#E8E6E1] rounded-2xl font-bold text-[12.5px] flex items-center justify-center gap-1.5 shadow-xs hover:border-[#171717] active-press transition-all cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5 text-[#777570] stroke-[2]" />
          <span>Timetable</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* Dynamic 2-Column Section Based on Timeframe                                 */}
      {/* ========================================================================= */}

      {/* 1. TODAY'S CONTENT: Action Required & Today's Schedule */}
      {timeframe === 'today' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-1">
          {/* Action Required Column */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#E7A72F]" />
                <h2 className="text-[16px] font-bold text-[#171717]">Action Required</h2>
                {actionRequiredBookings.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#E7A72F]/15 text-[#B87C0D]">
                    {actionRequiredBookings.length}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  haptics.tap();
                  navigateTo('bookings');
                }}
                className="text-[12px] font-semibold text-[#FF6B2C] hover:underline flex items-center cursor-pointer"
              >
                View all
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>

            {actionRequiredBookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 border border-[#E8E6E1] text-center space-y-2 shadow-xs">
                <div className="w-10 h-10 rounded-full bg-[#2FA66A]/10 text-[#2FA66A] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-[14px] font-extrabold text-[#171717]">All Caught Up</h3>
                <p className="text-[11.5px] text-[#777570] max-w-xs mx-auto">
                  No pending dues or expiring holds requiring counter action today.
                </p>
                {!isStaff && (
                  <button
                    onClick={() => {
                      haptics.tap();
                      setActiveModal('new_booking');
                    }}
                    className="mt-1 px-3.5 py-1.5 rounded-xl bg-[#FF6B2C] text-white text-[11.5px] font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer active-press hover:bg-[#e85b1e]"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>+ New Booking</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                {actionRequiredBookings.map((b) => {
                  const isBlocked = isPaymentLinkBlocked(b.id);
                  const remaining = getPaymentLinkTimeRemaining(b.id);

                  return (
                    <div
                      key={b.id}
                      onClick={() => handleViewBooking(b.id)}
                      className="bg-white rounded-2xl p-3.5 border border-[#FF6B2C]/40 shadow-xs active-press cursor-pointer hover:border-[#FF6B2C] transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#FF6B2C]/15 text-[#E65100]">
                              {b.balanceAmount > 0 ? `Due ₹${b.balanceAmount}` : 'Hold Expiring'}
                            </span>
                            <span className="text-[11.5px] font-semibold text-[#777570]">{b.courtName}</span>
                          </div>
                          <h3 className="text-[14.5px] font-bold text-[#171717]">{b.customerName}</h3>
                          <p className="text-[11.5px] text-[#777570]">
                            {b.timeSlot} · Paid ₹{b.paidAmount || 0} ·{' '}
                            <strong className="text-[#FF6B2C]">Due ₹{b.balanceAmount || 0}</strong>
                          </p>
                        </div>

                        {b.balanceAmount > 0 ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              haptics.tap();
                              setSelectedBookingId(b.id);
                              setActiveModal('payment_options');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#FF6B2C] text-white text-[11.5px] font-bold flex items-center gap-1 shadow-xs hover:bg-[#e85b1e] active-press cursor-pointer"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Collect ₹{b.balanceAmount}</span>
                          </button>
                        ) : (
                          <button
                            disabled={isBlocked}
                            onClick={(e) => handleActionRequiredPaymentLink(e, b.id)}
                            className={`px-3 py-1.5 rounded-xl text-[11.5px] font-bold flex items-center gap-1 transition-all ${
                              isBlocked
                                ? 'bg-amber-100 text-amber-900 border border-amber-300 cursor-not-allowed'
                                : 'bg-[#171717] hover:bg-[#333] text-white active-press cursor-pointer'
                            }`}
                          >
                            {isBlocked ? (
                              <>
                                <Lock className="w-3 h-3 text-amber-700" />
                                <span>Sent ({formatMinutesSeconds(remaining)})</span>
                              </>
                            ) : (
                              <>
                                <Link2 className="w-3 h-3" />
                                <span>Send Link</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Today's Schedule Column */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-[#171717]">Today's Schedule</h2>
              <button
                onClick={() => {
                  haptics.tap();
                  navigateTo('slots');
                }}
                className="text-[12px] font-semibold text-[#777570] hover:text-[#171717] flex items-center cursor-pointer"
              >
                Court Grid
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>

            {todayScheduleBookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 border border-[#E8E6E1] text-center space-y-2 shadow-xs">
                <div className="w-10 h-10 rounded-full bg-[#FAF9F6] border border-[#E8E6E1] text-[#777570] flex items-center justify-center mx-auto">
                  <Calendar className="w-5 h-5 text-[#FF6B2C]" />
                </div>
                <h3 className="text-[14px] font-extrabold text-[#171717]">No Bookings Scheduled Yet</h3>
                <p className="text-[11.5px] text-[#777570] max-w-xs mx-auto">
                  All {courts.length || 2} courts are currently open and ready for walk-in or online bookings.
                </p>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      haptics.tap();
                      navigateTo('slots');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#E8E6E1] text-[#171717] text-[11.5px] font-bold cursor-pointer active-press hover:bg-[#FAF9F6]"
                  >
                    View Court Grid
                  </button>
                  <button
                    onClick={() => {
                      haptics.tap();
                      setActiveModal('new_booking');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#171717] text-white text-[11.5px] font-bold cursor-pointer active-press hover:bg-[#333]"
                  >
                    + Add Booking
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-3.5 border border-[#E8E6E1] shadow-xs divide-y divide-[#F1F0EC]">
                {todayScheduleBookings.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => handleViewBooking(b.id)}
                    className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between cursor-pointer active-press group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[12px] font-bold text-[#777570] w-14 font-mono truncate">
                        {b.timeSlot?.split('–')[0]?.trim() || 'Slot'}
                      </span>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          b.status === 'Confirmed' ? 'bg-[#2FA66A]' : b.status === 'Ongoing' ? 'bg-[#FF6B2C]' : 'bg-[#E7A72F]'
                        }`}
                      />
                      <div>
                        <p className="text-[13.5px] font-bold text-[#171717] group-hover:text-[#FF6B2C] transition-colors">
                          {b.courtName} · {b.customerName}
                        </p>
                        <p className="text-[10.5px] text-[#777570]">{b.sport} match</p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                        b.status === 'Confirmed'
                          ? 'bg-[#2FA66A]/15 text-[#1E774A]'
                          : 'bg-[#E7A72F]/15 text-[#B87C0D]'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. MONTH'S CONTENT: Top Revenue Drivers & Monthly Operations Summary */}
      {timeframe === 'month' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-1">
          {/* Left: Top Revenue Drivers by Court */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#FF6B2C]" />
                <h2 className="text-[16px] font-bold text-[#171717]">Top Revenue Drivers ({currentMonthName})</h2>
              </div>
              <button
                onClick={() => {
                  haptics.tap();
                  navigateTo('courts');
                }}
                className="text-[12px] font-semibold text-[#FF6B2C] hover:underline flex items-center cursor-pointer"
              >
                Courts details
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#E8E6E1] shadow-xs space-y-4">
              {courts.length === 0 ? (
                <p className="text-[12.5px] text-[#777570] py-4 text-center">No active courts found.</p>
              ) : (
                courts.map((court, i) => {
                  const courtBookings = bookings.filter((b) => b.courtId === court.id);
                  const courtRev = courtBookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
                  const pct = totalRevenue > 0 ? Math.round((courtRev / totalRevenue) * 100) : 0;
                  const colors = ['#FF6B2C', '#2FA66A', '#4D83C4', '#E7A72F'];
                  const barColor = colors[i % colors.length];

                  return (
                    <div key={court.id} className={i > 0 ? 'space-y-1.5 pt-2 border-t border-[#F1F0EC]' : 'space-y-1.5'}>
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="font-bold text-[#171717]">
                          {court.name} · {court.sports.join(', ')}
                        </span>
                        <span className="font-black text-[#171717]">
                          {formatCurrency(courtRev)}{' '}
                          <span className="text-[11px] text-[#777570] font-medium">({pct}%)</span>
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#F1F0EC] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pct, courtRev > 0 ? 10 : 0)}%`, backgroundColor: barColor }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#777570]">
                        <span>{courtBookings.length} slots confirmed</span>
                        <span className="font-semibold text-[#171717]">₹{court.pricePerHour}/hr base</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Monthly Operational Insights */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-[#171717]">Monthly Operations Summary</h2>
              <button
                onClick={() => {
                  haptics.tap();
                  navigateTo('payments');
                }}
                className="text-[12px] font-semibold text-[#777570] hover:text-[#171717] flex items-center cursor-pointer"
              >
                Ledger
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#E8E6E1] shadow-xs divide-y divide-[#F1F0EC] space-y-3">
              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="text-[13.5px] font-bold text-[#171717]">Total Court Hours Operated</p>
                  <p className="text-[11.5px] text-[#777570]">Booked arena sessions</p>
                </div>
                <span className="font-black text-[16px] text-[#171717]">{bookings.length} hrs</span>
              </div>

              <div className="flex items-center justify-between pt-3">
                <div>
                  <p className="text-[13.5px] font-bold text-[#171717]">Online vs Cash Ratio</p>
                  <p className="text-[11.5px] text-[#777570]">Payment methods split</p>
                </div>
                <div className="text-right">
                  {(() => {
                    const cashCount = bookings.filter((b) => b.paymentMethod === 'Cash').length;
                    const onlineCount = bookings.length - cashCount;
                    const onlinePct = bookings.length > 0 ? Math.round((onlineCount / bookings.length) * 100) : 0;
                    return (
                      <>
                        <span className="font-bold text-[13px] text-[#2FA66A]">{onlinePct}% Online</span>
                        <span className="text-[#777570] text-[11px] block">{100 - onlinePct}% Counter Cash</span>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3">
                <div>
                  <p className="text-[13.5px] font-bold text-[#171717]">Active Court Count</p>
                  <p className="text-[11.5px] text-[#777570]">Pitches & arenas configured</p>
                </div>
                <span className="font-bold text-[13.5px] text-[#FF6B2C] bg-[#FFF3EC] px-2.5 py-0.5 rounded-full border border-[#FF6B2C]/20">
                  {courts.length} Live Pitches
                </span>
              </div>

              <div className="flex items-center justify-between pt-3">
                <div>
                  <p className="text-[13.5px] font-bold text-[#171717]">Bank Settlement Account</p>
                  <p className="text-[11.5px] text-[#777570]">
                    {bankDetails?.bankName || 'Verified Bank'} A/C ••
                    {bankDetails?.accountNumber?.slice(-4) || '6914'}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-[11.5px] font-bold text-[#2FA66A] bg-[#2FA66A]/10 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {formatCurrency(totalSettled)} Settled
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. YEARLY CONTENT: Category Split & Annual Milestones */}
      {timeframe === 'yearly' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-1">
          {/* Left: Annual Revenue by Sport Category */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF6B2C]" />
                <h2 className="text-[16px] font-bold text-[#171717]">Sport Category Split</h2>
              </div>
              <button
                onClick={() => {
                  haptics.tap();
                  navigateTo('export_report');
                }}
                className="text-[12px] font-semibold text-[#FF6B2C] hover:underline flex items-center cursor-pointer"
              >
                Annual report
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#E8E6E1] shadow-xs space-y-4">
              {(() => {
                const venueSports = Array.from(new Set(courts.flatMap((c) => c.sports)));
                if (venueSports.length === 0) venueSports.push('Cricket', 'Football');
                const colors = ['#FF6B2C', '#2FA66A', '#4D83C4', '#E7A72F'];

                return venueSports.map((sport, idx) => {
                  const sportBookings = bookings.filter((b) => b.sport === sport);
                  const sportRev = sportBookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
                  const pct = totalRevenue > 0 ? Math.round((sportRev / totalRevenue) * 100) : 0;
                  const barColor = colors[idx % colors.length];

                  return (
                    <div key={sport} className={idx > 0 ? 'space-y-1.5 pt-2 border-t border-[#F1F0EC]' : 'space-y-1.5'}>
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="font-bold text-[#171717]">🏆 {sport}</span>
                        <span className="font-black text-[#171717]">
                          {formatCurrency(sportRev)}{' '}
                          <span className="text-[11px] text-[#777570] font-medium">({pct}%)</span>
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#F1F0EC] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pct, sportRev > 0 ? 10 : 0)}%`, backgroundColor: barColor }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#777570]">
                        <span>{sportBookings.length} match bookings</span>
                        <span className="text-[#2FA66A] font-bold">Active Venue Sport</span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Right: Annual Arena Health & Milestones */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-[#171717]">Annual Milestones & Health</h2>
              <span className="text-[11px] font-bold text-[#2FA66A] bg-[#2FA66A]/10 px-2 py-0.5 rounded-full">
                100% Uptime
              </span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#E8E6E1] shadow-xs divide-y divide-[#F1F0EC] space-y-3">
              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="text-[13.5px] font-bold text-[#171717]">Total Arena Hours Played</p>
                  <p className="text-[11.5px] text-[#777570]">Across all {courts.length} configured pitches</p>
                </div>
                <span className="font-black text-[16px] text-[#171717]">{bookings.length} hrs</span>
              </div>

              <div className="flex items-center justify-between pt-3">
                <div>
                  <p className="text-[13.5px] font-bold text-[#171717]">Unique Registered Players</p>
                  <p className="text-[11.5px] text-[#777570]">Active player & captain records</p>
                </div>
                <span className="font-black text-[16px] text-[#FF6B2C]">
                  {new Set(bookings.map((b) => b.customerPhone || b.customerName)).size} Players
                </span>
              </div>

              <div className="flex items-center justify-between pt-3">
                <div>
                  <p className="text-[13.5px] font-bold text-[#171717]">Current Month Gross</p>
                  <p className="text-[11.5px] text-[#777570]">{currentMonthName}</p>
                </div>
                <span className="font-bold text-[13px] text-[#2FA66A] bg-[#2FA66A]/10 px-2.5 py-0.5 rounded-full">
                  {formatCurrency(totalRevenue)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3">
                <div>
                  <p className="text-[13.5px] font-bold text-[#171717]">Anti-Double Booking Guarantee</p>
                  <p className="text-[11.5px] text-[#777570]">Automated slot lock engine</p>
                </div>
                <span className="inline-flex items-center gap-1 text-[11.5px] font-bold text-[#171717] bg-[#F1F0EC] px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2FA66A]" />
                  100% Conflict-Free
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
