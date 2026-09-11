import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  Plus,
  Ban,
  Wallet,
  Clock,
  ChevronRight,
  Send,
  BarChart2,
  TrendingUp,
} from 'lucide-react';
import { haptics } from '../utils/haptics';

export const HomeScreen: React.FC = () => {
  const {
    venueName,
    navigateTo,
    setSelectedBookingId,
    sendPaymentLink,
    setActiveModal,
    showToast,
    unreadNotifCount,
  } = useApp();

  const [selectedBarIdx, setSelectedBarIdx] = useState<number | null>(7); // Default to 8 PM peak

  const hourlyData = [
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

  const kpis = [
    {
      id: 'bookings',
      label: 'Bookings',
      value: '128',
      trend: '↑ 12%',
      trendPositive: true,
    },
    {
      id: 'revenue',
      label: 'Revenue',
      value: '₹1,84,500',
      trend: '↑ 18%',
      trendPositive: true,
    },
    {
      id: 'pending',
      label: 'Pending',
      value: '₹12,800',
      trend: '8 bookings',
      trendPositive: false,
      isWarning: true,
    },
    {
      id: 'utilization',
      label: 'Utilization',
      value: '76%',
      trend: '↑ 6%',
      trendPositive: true,
    },
  ];

  const handleActionRequiredPaymentLink = (e: React.MouseEvent, bookingId: string) => {
    e.stopPropagation();
    haptics.tap();
    sendPaymentLink(bookingId);
  };

  const handleViewBooking = (bookingId: string) => {
    haptics.tap();
    setSelectedBookingId(bookingId);
    navigateTo('booking_details');
  };

  return (
    <div className="pb-8 pt-3 px-4 w-full space-y-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[11.5px] font-semibold text-[#5F6368] block">Good morning</span>
          <h1 className="text-[22px] font-extrabold text-[#021526] tracking-tight leading-none mt-0.5">
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
            className="relative w-9 h-9 rounded-full bg-white border border-[#E5E7EB] text-[#021526] flex items-center justify-center shadow-2xs hover:bg-[#F3F4F4] active-press cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-[#021526]" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#F94001] text-white text-[9.5px] font-black flex items-center justify-center ring-2 ring-[#F8F9FA]">
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
            className="w-9 h-9 rounded-full bg-[#021526] text-white flex items-center justify-center font-extrabold text-xs shadow-xs active-press cursor-pointer"
            aria-label="Settings"
          >
            TT
          </button>
        </div>
      </div>

      {/* Top Arena Utilization & Revenue Graph Card */}
      <div className="bg-white rounded-[22px] p-4 border border-[#E5E7EB] shadow-xs space-y-3">
        {/* Graph Header: Title & Selected Slot Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#F94001]/10 text-[#F94001] flex items-center justify-center">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368] block">
                Today's Activity
              </span>
              <h2 className="text-[14px] font-extrabold text-[#021526] tracking-tight leading-none mt-0.5">
                Hourly Utilization
              </h2>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-bold text-[#16A34A] bg-[#16A34A]/10 px-2 py-0.5 rounded-full inline-flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              Peak 88%
            </span>
          </div>
        </div>

        {/* Selected Slot Information Pill */}
        {selectedBarIdx !== null && (
          <div className="bg-[#F3F4F4] border border-[#E5E7EB] rounded-xl px-3 py-2 flex items-center justify-between text-[11.5px]">
            <div className="flex items-center gap-1.5 text-[#5F6368]">
              <span className="font-bold text-[#021526]">{hourlyData[selectedBarIdx].time} Slot</span>
              <span>·</span>
              <span>{hourlyData[selectedBarIdx].bookings} Bookings</span>
            </div>
            <span className="font-extrabold text-[#F94001] text-[12px]">
              {hourlyData[selectedBarIdx].amount} earned
            </span>
          </div>
        )}

        {/* Interactive Bar Chart */}
        <div className="pt-1">
          <div className="h-24 w-full flex items-end justify-between gap-1.5 pb-1">
            {hourlyData.map((item, idx) => {
              const isSelected = selectedBarIdx === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    haptics.tap();
                    setSelectedBarIdx(idx);
                    showToast(`${item.time}: ${item.amount} (${item.bookings} slots booked)`);
                  }}
                  className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer focus:outline-none"
                >
                  {/* Bar Column */}
                  <div
                    style={{ height: `${item.height}%` }}
                    className={`w-full rounded-t-md transition-all duration-200 ${
                      isSelected
                        ? 'bg-[#F94001] shadow-sm ring-2 ring-[#F94001]/30'
                        : item.isPeak
                        ? 'bg-[#FF854D]/75 hover:bg-[#F94001]'
                        : 'bg-[#E5E7EB] hover:bg-[#D8D6D0]'
                    }`}
                  />
                  {/* Time label */}
                  <span
                    className={`text-[9px] font-bold mt-1.5 truncate ${
                      isSelected ? 'text-[#F94001]' : 'text-[#5F6368]'
                    }`}
                  >
                    {item.time.replace(':00', '')}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Graph Legend & Status Footer */}
          <div className="flex items-center justify-between text-[10px] text-[#5F6368] font-medium pt-2 border-t border-[#F3F4F4]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-xs bg-[#F94001]" />
                <span className="font-medium text-[#021526]">Peak (6–10 PM)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-xs bg-[#E5E7EB]" />
                <span>Regular</span>
              </span>
            </div>
            <span className="text-[#16A34A] font-bold inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
              14/18 Filled
            </span>
          </div>
        </div>
      </div>

      {/* KPI Carousel */}
      <div className="overflow-x-auto no-scrollbar -mx-4 px-4 flex gap-2.5">
        {kpis.map((kpi) => (
          <div
            key={kpi.id}
            className="shrink-0 w-[142px] bg-white rounded-2xl p-3.5 border border-[#E5E7EB] shadow-xs flex flex-col justify-between"
          >
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#5F6368]">
              {kpi.label}
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <p className="text-[20px] font-extrabold text-[#021526] tracking-tight">
                {kpi.value}
              </p>
              <span
                className={`text-[11px] font-bold ${
                  kpi.isWarning ? 'text-[#F59E0B]' : 'text-[#16A34A]'
                }`}
              >
                {kpi.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-3 gap-2">
        {/* + Booking (Orange Primary) */}
        <button
          onClick={() => {
            haptics.tap();
            setActiveModal('new_booking');
          }}
          className="h-11 bg-[#F94001] text-white rounded-2xl font-bold text-[12.5px] flex items-center justify-center gap-1.5 shadow-xs hover:bg-[#D93600] active-press transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Booking</span>
        </button>

        {/* Block Slot */}
        <button
          onClick={() => {
            haptics.tap();
            setActiveModal('block_slot');
          }}
          className="h-11 bg-white text-[#021526] border border-[#E5E7EB] rounded-2xl font-bold text-[12.5px] flex items-center justify-center gap-1.5 shadow-xs hover:border-[#021526] active-press transition-all cursor-pointer"
        >
          <Ban className="w-3.5 h-3.5 text-[#5F6368] stroke-[2]" />
          <span>Block Slot</span>
        </button>

        {/* Payment */}
        <button
          onClick={() => {
            haptics.tap();
            navigateTo('payments');
          }}
          className="h-11 bg-white text-[#021526] border border-[#E5E7EB] rounded-2xl font-bold text-[12.5px] flex items-center justify-center gap-1.5 shadow-xs hover:border-[#021526] active-press transition-all cursor-pointer"
        >
          <Wallet className="w-3.5 h-3.5 text-[#5F6368] stroke-[2]" />
          <span>Payments</span>
        </button>
      </div>

      {/* Action Required Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            <h2 className="text-[15px] font-bold text-[#021526]">Action Required</h2>
          </div>
          <button
            onClick={() => {
              haptics.tap();
              navigateTo('bookings');
            }}
            className="text-[12px] font-semibold text-[#F94001] hover:underline flex items-center cursor-pointer"
          >
            View all
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        {/* Card 1: Payment Pending */}
        <div
          onClick={() => handleViewBooking('BK10231')}
          className="bg-white rounded-2xl p-3.5 border border-[#F59E0B]/40 shadow-xs active-press cursor-pointer hover:border-[#F59E0B] transition-all"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#F59E0B]/15 text-[#B87C0D]">
                  Payment Pending
                </span>
                <span className="text-[11.5px] font-semibold text-[#5F6368]">Turf 1</span>
              </div>
              <h3 className="text-[14.5px] font-bold text-[#021526]">Rahul Kumar</h3>
              <p className="text-[11.5px] text-[#5F6368]">
                7:00–8:00 PM · <strong className="text-[#021526]">₹1,200 pending</strong>
              </p>
            </div>
            <button
              onClick={(e) => handleActionRequiredPaymentLink(e, 'BK10231')}
              className="px-3 py-1.5 rounded-xl bg-[#F94001] text-white text-[11.5px] font-bold flex items-center gap-1 shadow-xs hover:bg-[#D93600] active-press cursor-pointer"
            >
              <Send className="w-3 h-3" />
              <span>Send Link</span>
            </button>
          </div>
        </div>

        {/* Card 2: Hold Expiring */}
        <div
          onClick={() => handleViewBooking('BK10232')}
          className="bg-white rounded-2xl p-3.5 border border-[#F59E0B]/40 shadow-xs active-press cursor-pointer hover:border-[#F59E0B] transition-all"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#F59E0B]/15 text-[#B87C0D] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Hold Expiring
                </span>
                <span className="text-[11.5px] font-semibold text-[#5F6368]">Turf 2</span>
              </div>
              <h3 className="text-[14.5px] font-bold text-[#021526]">Arun Prakash · 8:00–9:00 PM</h3>
              <p className="text-[11.5px] text-[#DC2626] font-semibold">
                Expires in 12 min unless confirmed
              </p>
            </div>
            <button
              onClick={() => handleViewBooking('BK10232')}
              className="px-3 py-1.5 rounded-xl bg-[#021526] text-white text-[11.5px] font-bold flex items-center gap-1 active-press cursor-pointer"
            >
              <span>View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Today's Schedule Timeline */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-[#021526]">Today's Schedule</h2>
          <button
            onClick={() => {
              haptics.tap();
              navigateTo('slots');
            }}
            className="text-[12px] font-semibold text-[#5F6368] hover:text-[#021526] flex items-center cursor-pointer"
          >
            Court Grid
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-[#E5E7EB] shadow-xs divide-y divide-[#F3F4F4]">
          {/* Row 1: 07:00 Turf 1 */}
          <div
            onClick={() => handleViewBooking('BK10231')}
            className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between cursor-pointer active-press group"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-[12px] font-bold text-[#5F6368] w-11 font-mono">07:00</span>
              <div className="w-2 h-2 rounded-full bg-[#16A34A]" />
              <div>
                <p className="text-[13.5px] font-bold text-[#021526] group-hover:text-[#F94001] transition-colors">
                  Turf 1 · Rahul Kumar
                </p>
                <p className="text-[10.5px] text-[#5F6368]">Football (7v7)</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#16A34A]/15 text-[#15803D]">
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
              <span className="text-[12px] font-bold text-[#5F6368] w-11 font-mono">08:00</span>
              <div className="w-2 h-2 rounded-full bg-[#5F6368]" />
              <div>
                <p className="text-[13.5px] font-semibold text-[#5F6368] group-hover:text-[#021526] transition-colors">
                  Turf 2 · Available
                </p>
                <p className="text-[10.5px] text-[#5F6368]">₹800/hr · Open for walk-in</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#F3F4F4] text-[#5F6368]">
              Available
            </span>
          </div>

          {/* Row 3: 09:00 Turf 1 Arun */}
          <div
            onClick={() => handleViewBooking('BK10232')}
            className="py-2.5 flex items-center justify-between cursor-pointer active-press group"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-[12px] font-bold text-[#5F6368] w-11 font-mono">09:00</span>
              <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
              <div>
                <p className="text-[13.5px] font-bold text-[#021526] group-hover:text-[#F94001] transition-colors">
                  Turf 1 · Arun Prakash
                </p>
                <p className="text-[10.5px] text-[#5F6368]">Hold slot</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#F59E0B]/15 text-[#B87C0D]">
              Pending
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

