import React, { useState } from 'react';
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
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { haptics } from '../utils/haptics';

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
    venueName,
    navigateTo,
    setSelectedBookingId,
    setActiveModal,
    showToast,
    unreadNotifCount,
  } = useApp();

  // Active Timeframe: 'today' | 'month' | 'yearly'
  const [timeframe, setTimeframe] = useState<TimeframeType>('today');
  const [selectedBarIdx, setSelectedBarIdx] = useState<number | null>(7); // Default to peak slot

  // Handle switching timeframe with default bar selection
  const handleTimeframeChange = (tf: TimeframeType) => {
    haptics.tap();
    setTimeframe(tf);
    if (tf === 'today') setSelectedBarIdx(7);
    else if (tf === 'month') setSelectedBarIdx(4);
    else setSelectedBarIdx(7);
  };

  // 1. TODAY'S DATA (9 hourly slots)
  const todayHourlyData: ChartDataPoint[] = [
    { time: '6 AM', amount: '₹1.2k', height: 28, bookings: 2 },
    { time: '8 AM', amount: '₹3.4k', height: 50, bookings: 4 },
    { time: '10 AM', amount: '₹2.1k', height: 35, bookings: 3 },
    { time: '12 PM', amount: '₹1.8k', height: 30, bookings: 2 },
    { time: '2 PM', amount: '₹2.6k', height: 42, bookings: 3 },
    { time: '4 PM', amount: '₹4.8k', height: 68, bookings: 6 },
    { time: '6 PM', amount: '₹8.4k', height: 92, bookings: 9, isPeak: true },
    { time: '8 PM', amount: '₹9.6k', height: 100, bookings: 11, isPeak: true },
    { time: '10 PM', amount: '₹6.2k', height: 75, bookings: 7 },
  ];

  // 2. THIS MONTH'S DATA (6 date ranges across August)
  const monthDailyData: ChartDataPoint[] = [
    { time: 'Aug 1–5', amount: '₹84.5k', height: 65, bookings: 58 },
    { time: 'Aug 6–10', amount: '₹92.0k', height: 72, bookings: 64 },
    { time: 'Aug 11–15', amount: '₹104.2k', height: 86, bookings: 72, isPeak: true },
    { time: 'Aug 16–20', amount: '₹98.4k', height: 78, bookings: 69 },
    { time: 'Aug 21–25', amount: '₹112.8k', height: 100, bookings: 81, isPeak: true },
    { time: 'Aug 26–31', amount: '₹90.6k', height: 70, bookings: 68 },
  ];

  // 3. YEARLY DATA (12 Months FY 2026)
  const yearlyMonthlyData: ChartDataPoint[] = [
    { time: 'Jan', amount: '₹4.8L', height: 65, bookings: 340 },
    { time: 'Feb', amount: '₹4.9L', height: 68, bookings: 355 },
    { time: 'Mar', amount: '₹5.4L', height: 75, bookings: 390 },
    { time: 'Apr', amount: '₹5.8L', height: 80, bookings: 410 },
    { time: 'May', amount: '₹6.2L', height: 86, bookings: 445, isPeak: true },
    { time: 'Jun', amount: '₹5.6L', height: 78, bookings: 395 },
    { time: 'Jul', amount: '₹6.5L', height: 90, bookings: 460, isPeak: true },
    { time: 'Aug', amount: '₹5.8L', height: 80, bookings: 412 },
    { time: 'Sep', amount: '₹6.0L', height: 83, bookings: 430 },
    { time: 'Oct', amount: '₹6.4L', height: 88, bookings: 455 },
    { time: 'Nov', amount: '₹6.6L', height: 92, bookings: 470 },
    { time: 'Dec', amount: '₹7.2L', height: 100, bookings: 510, isPeak: true },
  ];

  // Dynamic Chart Properties
  const activeChartData =
    timeframe === 'today'
      ? todayHourlyData
      : timeframe === 'month'
      ? monthDailyData
      : yearlyMonthlyData;

  const chartMeta = {
    today: {
      category: "Today's Activity",
      title: 'Hourly Utilization',
      badge: 'Peak 88% (8–10 PM)',
      badgeColor: 'text-[#2FA66A] bg-[#2FA66A]/10',
      legendLeft: 'Peak (6–10 PM)',
      legendRight: '14/18 Slots Filled',
      itemUnit: 'Slot',
    },
    month: {
      category: 'August 2026 Velocity',
      title: 'Daily Revenue & Booking Trend',
      badge: 'Target 94% Achieved',
      badgeColor: 'text-[#FF6B2C] bg-[#FF6B2C]/10',
      legendLeft: 'Weekday Avg: ₹18.2k',
      legendRight: '28/31 Days Active',
      itemUnit: 'Period',
    },
    yearly: {
      category: 'Annual Performance',
      title: 'Month-by-Month Gross Revenue',
      badge: '+32.5% YoY Growth',
      badgeColor: 'text-[#2FA66A] bg-[#2FA66A]/10',
      legendLeft: 'Run-Rate: ₹71.2L',
      legendRight: '12 Months Tracked',
      itemUnit: 'Month',
    },
  }[timeframe];

  // Dynamic KPIs by Timeframe
  const kpis = {
    today: [
      { id: 'bookings', label: "Today's Bookings", value: '18', trend: '↑ 12% vs y’day', trendPositive: true },
      { id: 'revenue', label: "Today's Revenue", value: '₹24,800', trend: '↑ 18% vs y’day', trendPositive: true },
      { id: 'pending', label: 'Pending Dues', value: '₹1,500', trend: '2 bookings', trendPositive: false, isWarning: true },
      { id: 'utilization', label: 'Court Occupancy', value: '78%', trend: '↑ 6% capacity', trendPositive: true },
    ],
    month: [
      { id: 'bookings', label: 'Monthly Bookings', value: '412', trend: '↑ 15.4% vs last mo', trendPositive: true },
      { id: 'revenue', label: 'August Gross Revenue', value: '₹5,82,500', trend: '↑ 21.8% vs last mo', trendPositive: true },
      { id: 'pending', label: 'Pending Collections', value: '₹18,400', trend: '11 unpaid walk-ins', trendPositive: false, isWarning: true },
      { id: 'utilization', label: 'Avg Monthly Occupancy', value: '82%', trend: 'Peak 94% on weekends', trendPositive: true },
    ],
    yearly: [
      { id: 'bookings', label: 'Total Annual Bookings', value: '4,850', trend: '↑ 28% YoY', trendPositive: true },
      { id: 'revenue', label: 'Annual Gross Revenue', value: '₹68,45,000', trend: '↑ 32.5% YoY', trendPositive: true },
      { id: 'pending', label: 'Bank Payouts Settled', value: '₹62,10,000', trend: 'Auto-settled weekly', trendPositive: true },
      { id: 'utilization', label: 'Annual Arena Utilization', value: '79%', trend: '+11% YoY Gain', trendPositive: true },
    ],
  }[timeframe];

  const handleActionRequiredPaymentLink = (e: React.MouseEvent, bookingId: string) => {
    e.stopPropagation();
    haptics.tap();
    setSelectedBookingId(bookingId);
    setActiveModal('payment_link');
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
              {timeframe === 'month' && 'August 2026 Performance'}
              {timeframe === 'yearly' && 'Annual Arena Analytics 2026'}
            </h1>
          </div>
          <p className="text-[12.5px] text-[#777570] font-medium mt-0.5">
            {timeframe === 'today' && 'Real-time slot bookings, hourly court loads & today’s due collections.'}
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
                <span>Regular</span>
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
              <p className="text-[19px] sm:text-[21px] md:text-[23px] font-black text-[#171717] tracking-tight">
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

        <button
          onClick={() => {
            haptics.tap();
            navigateTo('payments');
          }}
          className="h-11 bg-white text-[#171717] border border-[#E8E6E1] rounded-2xl font-bold text-[12.5px] flex items-center justify-center gap-1.5 shadow-xs hover:border-[#171717] active-press transition-all cursor-pointer"
        >
          <Wallet className="w-3.5 h-3.5 text-[#777570] stroke-[2]" />
          <span>Payments</span>
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

            {/* Card 1: Advance Paid - Due Collection Required */}
            <div
              onClick={() => handleViewBooking('BK10233')}
              className="bg-white rounded-2xl p-3.5 border border-[#FF6B2C]/40 shadow-xs active-press cursor-pointer hover:border-[#FF6B2C] transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#FF6B2C]/15 text-[#E65100]">
                      Advance Paid (50%)
                    </span>
                    <span className="text-[11.5px] font-semibold text-[#777570]">Turf 1</span>
                  </div>
                  <h3 className="text-[14.5px] font-bold text-[#171717]">Priya Menon</h3>
                  <p className="text-[11.5px] text-[#777570]">
                    6:00–7:00 PM · Paid ₹750 · <strong className="text-[#FF6B2C]">Due ₹750</strong>
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    haptics.tap();
                    setSelectedBookingId('BK10233');
                    setActiveModal('payment_options');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#FF6B2C] text-white text-[11.5px] font-bold flex items-center gap-1 shadow-xs hover:bg-[#e85b1e] active-press cursor-pointer"
                >
                  <CreditCard className="w-3 h-3" />
                  <span>Collect ₹750</span>
                </button>
              </div>
            </div>

            {/* Card 2: Hold Expiring (Payment Pending) */}
            <div
              onClick={() => handleViewBooking('BK10232')}
              className="bg-white rounded-2xl p-3.5 border border-[#E7A72F]/40 shadow-xs active-press cursor-pointer hover:border-[#E7A72F] transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#E7A72F]/15 text-[#B87C0D] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Hold Expiring (12m)
                    </span>
                    <span className="text-[11.5px] font-semibold text-[#777570]">Turf 2</span>
                  </div>
                  <h3 className="text-[14.5px] font-bold text-[#171717]">Arun Prakash · 8:00–9:00 PM</h3>
                  <p className="text-[11.5px] text-[#D94B4B] font-semibold">
                    Online link sent · Holds for 12 mins
                  </p>
                </div>
                <button
                  onClick={(e) => handleActionRequiredPaymentLink(e, 'BK10232')}
                  className="px-3 py-1.5 rounded-xl bg-[#171717] text-white text-[11.5px] font-bold flex items-center gap-1 active-press cursor-pointer"
                >
                  <Link2 className="w-3 h-3" />
                  <span>View Link</span>
                </button>
              </div>
            </div>
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

            <div className="bg-white rounded-2xl p-3.5 border border-[#E8E6E1] shadow-xs divide-y divide-[#F1F0EC]">
              {/* Row 1: 07:00 Turf 1 */}
              <div
                onClick={() => handleViewBooking('BK10231')}
                className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between cursor-pointer active-press group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-[12px] font-bold text-[#777570] w-11 font-mono">07:00</span>
                  <div className="w-2 h-2 rounded-full bg-[#2FA66A]" />
                  <div>
                    <p className="text-[13.5px] font-bold text-[#171717] group-hover:text-[#FF6B2C] transition-colors">
                      Turf 1 · Rahul Kumar
                    </p>
                    <p className="text-[10.5px] text-[#777570]">Football (7v7)</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#2FA66A]/15 text-[#1E774A]">
                  Confirmed
                </span>
              </div>

              {/* Row 2: 08:00 Turf 2 Available */}
              <div
                onClick={() => {
                  haptics.tap();
                  navigateTo('slots');
                }}
                className="py-2.5 flex items-center justify-between cursor-pointer active-press group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-[12px] font-bold text-[#777570] w-11 font-mono">08:00</span>
                  <div className="w-2 h-2 rounded-full bg-[#A3A099]" />
                  <div>
                    <p className="text-[13.5px] font-semibold text-[#777570] group-hover:text-[#171717] transition-colors">
                      Turf 2 · Available
                    </p>
                    <p className="text-[10.5px] text-[#777570]">₹800/hr · Open for walk-in</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#F1F0EC] text-[#777570]">
                  Available
                </span>
              </div>

              {/* Row 3: 09:00 Turf 1 Arun */}
              <div
                onClick={() => handleViewBooking('BK10232')}
                className="py-2.5 flex items-center justify-between cursor-pointer active-press group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-[12px] font-bold text-[#777570] w-11 font-mono">09:00</span>
                  <div className="w-2 h-2 rounded-full bg-[#E7A72F]" />
                  <div>
                    <p className="text-[13.5px] font-bold text-[#171717] group-hover:text-[#FF6B2C] transition-colors">
                      Turf 1 · Arun Prakash
                    </p>
                    <p className="text-[10.5px] text-[#777570]">Hold slot</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#E7A72F]/15 text-[#B87C0D]">
                  Pending
                </span>
              </div>
            </div>
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
                <h2 className="text-[16px] font-bold text-[#171717]">Top Revenue Drivers (August)</h2>
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
              {/* Pitch 1 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-bold text-[#171717]">Turf 1 · Main Football (7v7)</span>
                  <span className="font-black text-[#171717]">₹2,56,000 <span className="text-[11px] text-[#777570] font-medium">(44%)</span></span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#F1F0EC] overflow-hidden">
                  <div className="h-full rounded-full bg-[#FF6B2C] w-[44%]" />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#777570]">
                  <span>178 slots confirmed</span>
                  <span className="text-[#2FA66A] font-bold">↑ 14% occupancy</span>
                </div>
              </div>

              {/* Pitch 2 */}
              <div className="space-y-1.5 pt-2 border-t border-[#F1F0EC]">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-bold text-[#171717]">Turf 2 · Box Cricket Pitch</span>
                  <span className="font-black text-[#171717]">₹1,98,500 <span className="text-[11px] text-[#777570] font-medium">(34%)</span></span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#F1F0EC] overflow-hidden">
                  <div className="h-full rounded-full bg-[#2FA66A] w-[34%]" />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#777570]">
                  <span>142 slots confirmed</span>
                  <span className="text-[#2FA66A] font-bold">↑ 22% occupancy</span>
                </div>
              </div>

              {/* Court 3 */}
              <div className="space-y-1.5 pt-2 border-t border-[#F1F0EC]">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-bold text-[#171717]">Court 3 · Badminton Arena</span>
                  <span className="font-black text-[#171717]">₹1,28,000 <span className="text-[11px] text-[#777570] font-medium">(22%)</span></span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#F1F0EC] overflow-hidden">
                  <div className="h-full rounded-full bg-[#4D83C4] w-[22%]" />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#777570]">
                  <span>92 slots confirmed</span>
                  <span className="text-[#2FA66A] font-bold">↑ 8% occupancy</span>
                </div>
              </div>
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
                  <p className="text-[11.5px] text-[#777570]">Floodlights & active matches</p>
                </div>
                <span className="font-black text-[16px] text-[#171717]">540 hrs</span>
              </div>

              <div className="flex items-center justify-between pt-3">
                <div>
                  <p className="text-[13.5px] font-bold text-[#171717]">Online vs Cash Ratio</p>
                  <p className="text-[11.5px] text-[#777570]">Payment methods split</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[13px] text-[#2FA66A]">72% Online</span>
                  <span className="text-[#777570] text-[11px] block">28% Counter Cash</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3">
                <div>
                  <p className="text-[13.5px] font-bold text-[#171717]">Repeat Teams Rate</p>
                  <p className="text-[11.5px] text-[#777570]">Player loyalty & weekly regulars</p>
                </div>
                <span className="font-bold text-[13.5px] text-[#FF6B2C] bg-[#FFF3EC] px-2.5 py-0.5 rounded-full border border-[#FF6B2C]/20">
                  68% Rebooked
                </span>
              </div>

              <div className="flex items-center justify-between pt-3">
                <div>
                  <p className="text-[13.5px] font-bold text-[#171717]">Bank Settlement Status</p>
                  <p className="text-[11.5px] text-[#777570]">HDFC Current A/C ••9012</p>
                </div>
                <span className="inline-flex items-center gap-1 text-[11.5px] font-bold text-[#2FA66A] bg-[#2FA66A]/10 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ₹5,42,000 Settled
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
                <h2 className="text-[16px] font-bold text-[#171717]">Sport Category Split (FY 2026)</h2>
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
              {/* Football */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-bold text-[#171717]">⚽ 7v7 Football & Futsal</span>
                  <span className="font-black text-[#171717]">₹32,40,000 <span className="text-[11px] text-[#777570] font-medium">(47.3%)</span></span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#F1F0EC] overflow-hidden">
                  <div className="h-full rounded-full bg-[#FF6B2C] w-[47.3%]" />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#777570]">
                  <span>2,290 team bookings</span>
                  <span className="text-[#2FA66A] font-bold">↑ 34% YoY</span>
                </div>
              </div>

              {/* Cricket */}
              <div className="space-y-1.5 pt-2 border-t border-[#F1F0EC]">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-bold text-[#171717]">🏏 Box Cricket Pitch</span>
                  <span className="font-black text-[#171717]">₹24,60,000 <span className="text-[11px] text-[#777570] font-medium">(35.9%)</span></span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#F1F0EC] overflow-hidden">
                  <div className="h-full rounded-full bg-[#2FA66A] w-[35.9%]" />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#777570]">
                  <span>1,740 team bookings</span>
                  <span className="text-[#2FA66A] font-bold">↑ 29% YoY</span>
                </div>
              </div>

              {/* Badminton */}
              <div className="space-y-1.5 pt-2 border-t border-[#F1F0EC]">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-bold text-[#171717]">🏸 Badminton & Pickleball</span>
                  <span className="font-black text-[#171717]">₹11,45,000 <span className="text-[11px] text-[#777570] font-medium">(16.8%)</span></span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#F1F0EC] overflow-hidden">
                  <div className="h-full rounded-full bg-[#4D83C4] w-[16.8%]" />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#777570]">
                  <span>820 match bookings</span>
                  <span className="text-[#2FA66A] font-bold">↑ 18% YoY</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Annual Arena Health & Milestones */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-[#171717]">Annual Milestones & Health</h2>
              <span className="text-[11px] font-bold text-[#2FA66A] bg-[#2FA66A]/10 px-2 py-0.5 rounded-full">
                99.8% Uptime
              </span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#E8E6E1] shadow-xs divide-y divide-[#F1F0EC] space-y-3">
              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="text-[13.5px] font-bold text-[#171717]">Total Arena Hours Played</p>
                  <p className="text-[11.5px] text-[#777570]">Across all 3 multi-sport pitches</p>
                </div>
                <span className="font-black text-[16px] text-[#171717]">6,480 hrs</span>
              </div>

              <div className="flex items-center justify-between pt-3">
                <div>
                  <p className="text-[13.5px] font-bold text-[#171717]">Unique Registered Teams</p>
                  <p className="text-[11.5px] text-[#777570]">Active team captains & squads</p>
                </div>
                <span className="font-black text-[16px] text-[#FF6B2C]">1,420 Teams</span>
              </div>

              <div className="flex items-center justify-between pt-3">
                <div>
                  <p className="text-[13.5px] font-bold text-[#171717]">Record Peak Month</p>
                  <p className="text-[11.5px] text-[#777570]">July 2026 Monsoon Leagues</p>
                </div>
                <span className="font-bold text-[13px] text-[#2FA66A] bg-[#2FA66A]/10 px-2.5 py-0.5 rounded-full">
                  ₹6,50,000 / mo
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
