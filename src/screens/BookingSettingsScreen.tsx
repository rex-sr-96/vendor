import React from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft } from 'lucide-react';

export const BookingSettingsScreen: React.FC = () => {
  const { bookingSettings, updateBookingSettings, goBack } = useApp();

  return (
    <div className="pb-28 pt-4 px-4 max-w-md mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2 pt-2">
        <button
          onClick={goBack}
          className="w-10 h-10 -ml-2 rounded-xl flex items-center justify-center text-[#021526] hover:bg-[#E5E7EB]/50 active-press cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
        </button>
        <h1 className="text-[22px] font-bold text-[#021526]">Booking Settings</h1>
      </div>

      <p className="text-[13px] text-[#5F6368] -mt-2">
        Define customer advance booking limits and notice periods for your sports venue.
      </p>

      {/* Rules Card */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs divide-y divide-[#F3F4F4] overflow-hidden">
        <div className="p-4 flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-bold text-[#021526]">Advance Booking Window</h3>
            <p className="text-[12px] text-[#5F6368]">How far ahead players can reserve</p>
          </div>
          <span className="text-[13px] font-bold text-[#021526] bg-[#F3F4F4] px-3 py-1 rounded-xl">
            {bookingSettings.advanceBookingDays} Days
          </span>
        </div>

        <div className="p-4 flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-bold text-[#021526]">Minimum Booking Duration</h3>
            <p className="text-[12px] text-[#5F6368]">Shortest allowed slot</p>
          </div>
          <span className="text-[13px] font-bold text-[#021526] bg-[#F3F4F4] px-3 py-1 rounded-xl">
            {bookingSettings.minDurationHours} Hour
          </span>
        </div>

        <div className="p-4 flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-bold text-[#021526]">Maximum Booking Duration</h3>
            <p className="text-[12px] text-[#5F6368]">Longest single session</p>
          </div>
          <span className="text-[13px] font-bold text-[#021526] bg-[#F3F4F4] px-3 py-1 rounded-xl">
            {bookingSettings.maxDurationHours} Hours
          </span>
        </div>

        <div className="p-4 flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-bold text-[#021526]">Minimum Booking Notice</h3>
            <p className="text-[12px] text-[#5F6368]">Buffer required before start time</p>
          </div>
          <span className="text-[13px] font-bold text-[#021526] bg-[#F3F4F4] px-3 py-1 rounded-xl">
            {bookingSettings.minNoticeMinutes} Minutes
          </span>
        </div>
      </div>

      {/* Feature Toggles (Orange Switches) */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs divide-y divide-[#F3F4F4] overflow-hidden">
        <div className="p-4 flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-bold text-[#021526]">Same-Day Booking</h3>
            <p className="text-[12px] text-[#5F6368]">Allow walk-ins and instant slot reserves today</p>
          </div>
          <button
            onClick={() =>
              updateBookingSettings({ sameDayBooking: !bookingSettings.sameDayBooking })
            }
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
              bookingSettings.sameDayBooking ? 'bg-[#F94001]' : 'bg-[#E5E7EB]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                bookingSettings.sameDayBooking ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="p-4 flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-bold text-[#021526]">Recurring Booking</h3>
            <p className="text-[12px] text-[#5F6368]">Weekly slots for academies & corporate groups</p>
          </div>
          <button
            onClick={() =>
              updateBookingSettings({ recurringBooking: !bookingSettings.recurringBooking })
            }
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
              bookingSettings.recurringBooking ? 'bg-[#F94001]' : 'bg-[#E5E7EB]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                bookingSettings.recurringBooking ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="p-4 flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-bold text-[#021526]">Booking Extension</h3>
            <p className="text-[12px] text-[#5F6368]">Allow player to extend 30 min if next slot is open</p>
          </div>
          <button
            onClick={() =>
              updateBookingSettings({ bookingExtension: !bookingSettings.bookingExtension })
            }
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
              bookingSettings.bookingExtension ? 'bg-[#F94001]' : 'bg-[#E5E7EB]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                bookingSettings.bookingExtension ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
