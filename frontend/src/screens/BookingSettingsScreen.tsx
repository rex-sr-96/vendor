import React from 'react';
import { useApp } from '../context/AppContext';
import { CalendarCheck, Clock, ShieldCheck, Zap, ChevronLeft } from 'lucide-react';
import { haptics } from '../utils/haptics';

export const BookingSettingsScreen: React.FC = () => {
  const { bookingSettings, updateBookingSettings, goBack, showToast } = useApp();

  return (
    <div className="pb-20 pt-2 w-full space-y-6">
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
      <div className="pb-2 border-b border-[#E5E7EB]/70">
        <h1 className="text-[24px] font-black text-[#021526] tracking-tight">Booking Policy & Rules</h1>
        <p className="text-[12.5px] font-medium text-[#5F6368]">
          Define customer advance reservation windows, minimum notice limits & hold timers
        </p>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rules Card 1: Windows & Durations */}
        <div className="bg-white rounded-3xl border border-[#E5E7EB] p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#F3F4F4]">
            <div className="w-9 h-9 rounded-xl bg-[#F94001]/10 text-[#F94001] flex items-center justify-center">
              <CalendarCheck className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-[15px] font-black text-[#021526]">Reservation Windows</h3>
              <p className="text-[11.5px] text-[#5F6368]">Duration constraints & limits</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-[#F3F4F4] border border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h4 className="text-[13.5px] font-extrabold text-[#021526]">Advance Booking Window</h4>
                <p className="text-[11.5px] text-[#5F6368]">How far ahead players can reserve slots</p>
              </div>
              <span className="text-[13px] font-black text-[#021526] bg-white border border-[#E5E7EB] px-3 py-1 rounded-xl shadow-2xs">
                {bookingSettings.advanceBookingDays} Days
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F3F4F4] border border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h4 className="text-[13.5px] font-extrabold text-[#021526]">Minimum Booking Duration</h4>
                <p className="text-[11.5px] text-[#5F6368]">Shortest allowed single session</p>
              </div>
              <span className="text-[13px] font-black text-[#021526] bg-white border border-[#E5E7EB] px-3 py-1 rounded-xl shadow-2xs">
                {bookingSettings.minDurationHours} Hour
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F3F4F4] border border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h4 className="text-[13.5px] font-extrabold text-[#021526]">Maximum Booking Duration</h4>
                <p className="text-[11.5px] text-[#5F6368]">Longest allowed continuous session</p>
              </div>
              <span className="text-[13px] font-black text-[#021526] bg-white border border-[#E5E7EB] px-3 py-1 rounded-xl shadow-2xs">
                {bookingSettings.maxDurationHours} Hours
              </span>
            </div>
          </div>
        </div>

        {/* Rules Card 2: Slot Locking & Lead Times */}
        <div className="bg-white rounded-3xl border border-[#E5E7EB] p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#F3F4F4]">
            <div className="w-9 h-9 rounded-xl bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center">
              <Clock className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-[15px] font-black text-[#021526]">Timing & Locking Rules</h3>
              <p className="text-[11.5px] text-[#5F6368]">Buffer timers and payment locks</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-[#F3F4F4] border border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h4 className="text-[13.5px] font-extrabold text-[#021526]">Minimum Booking Notice</h4>
                <p className="text-[11.5px] text-[#5F6368]">Buffer required before start time</p>
              </div>
              <span className="text-[13px] font-black text-[#021526] bg-white border border-[#E5E7EB] px-3 py-1 rounded-xl shadow-2xs">
                {bookingSettings.minNoticeHours} Hours
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F3F4F4] border border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h4 className="text-[13.5px] font-extrabold text-[#021526]">Slot Hold Timer</h4>
                <p className="text-[11.5px] text-[#5F6368]">Cart checkout hold before releasing slot</p>
              </div>
              <span className="text-[13px] font-black text-[#F94001] bg-white border border-[#E5E7EB] px-3 py-1 rounded-xl shadow-2xs">
                {bookingSettings.slotHoldTimerMinutes} Mins
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F3F4F4] border border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h4 className="text-[13.5px] font-extrabold text-[#021526]">Auto-Release Unpaid</h4>
                <p className="text-[11.5px] text-[#5F6368]">Release unconfirmed slots automatically</p>
              </div>
              <span className="text-[12px] font-extrabold text-[#16A34A] bg-[#16A34A]/10 px-3 py-1 rounded-xl">
                Enabled
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
