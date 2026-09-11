import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  MessageSquare,
  Save,
  CheckCircle2,
  Bell,
  Smartphone,
  Mail,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';
import { haptics } from '../utils/haptics';

export const NotificationSettingsScreen: React.FC = () => {
  const { notificationPreferences, updateNotificationPreferences, goBack, showToast } = useApp();

  const [prefs, setPrefs] = useState(notificationPreferences);

  const togglePref = (key: keyof typeof prefs) => {
    haptics.tap();
    setPrefs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    haptics.success();
    updateNotificationPreferences(prefs);
    showToast('Preferences Saved', 'Your alert notification channels have been updated.', 'success');
    goBack();
  };

  return (
    <div className="pb-20 pt-2 w-full space-y-6 select-none">
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

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E7EB]/70">
        <div>
          <h1 className="text-[24px] font-black text-[#021526] tracking-tight">
            Notification Preferences
          </h1>
          <p className="text-[12.5px] font-medium text-[#5F6368]">
            Configure WhatsApp dispatch channels, slot lock alerts & daily payout summaries
          </p>
        </div>

        <button
          onClick={handleSave}
          className="h-10 px-5 rounded-xl bg-gradient-to-r from-[#F94001] to-[#FF5410] hover:from-[#D93600] hover:to-[#db4a0b] text-white font-extrabold text-[13px] flex items-center justify-center gap-2 shadow-sm hover:shadow-md active-press cursor-pointer transition-all self-start sm:self-auto"
        >
          <Save className="w-4 h-4 stroke-[2.5]" />
          <span>Save Preferences</span>
        </button>
      </div>

      {/* 2-Column Responsive Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Instant WhatsApp Alerts */}
        <div className="bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-black text-[#021526]">WhatsApp Booking Alerts</h3>
                  <p className="text-[11.5px] text-[#5F6368]">Instant booking confirmation to customer & owner</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => togglePref('whatsappBookingConfirmation')}
                className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                  prefs.whatsappBookingConfirmation ? 'bg-[#16A34A]' : 'bg-[#E5E7EB]'
                }`}
              >
                <div
                  className={`w-5.5 h-5.5 rounded-full bg-white shadow-md absolute top-0.75 transition-transform ${
                    prefs.whatsappBookingConfirmation ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
            <p className="text-[12px] text-[#5F6368] leading-relaxed bg-[#F3F4F4] p-3 rounded-2xl border border-[#E5E7EB]">
              Sends automated receipt, location map link, and slot PIN directly via WhatsApp business API.
            </p>
          </div>
        </div>

        {/* New Booking App Push */}
        <div className="bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F94001]/10 text-[#F94001] flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-black text-[#021526]">Live Booking Notifications</h3>
                  <p className="text-[11.5px] text-[#5F6368]">Sound and banner alert on new slot reservations</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => togglePref('bookingAlerts')}
                className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                  prefs.bookingAlerts ? 'bg-[#16A34A]' : 'bg-[#E5E7EB]'
                }`}
              >
                <div
                  className={`w-5.5 h-5.5 rounded-full bg-white shadow-md absolute top-0.75 transition-transform ${
                    prefs.bookingAlerts ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
            <p className="text-[12px] text-[#5F6368] leading-relaxed bg-[#F3F4F4] p-3 rounded-2xl border border-[#E5E7EB]">
              Real-time push notifications whenever a player locks or pays for a court slot.
            </p>
          </div>
        </div>

        {/* Daily Financial Summary */}
        <div className="bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#3B82F6]/10 text-[#2563EB] flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-black text-[#021526]">Daily Financial Digest</h3>
                  <p className="text-[11.5px] text-[#5F6368]">Midnight settlement and payout breakdown</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => togglePref('dailyFinancialSummary')}
                className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                  prefs.dailyFinancialSummary ? 'bg-[#16A34A]' : 'bg-[#E5E7EB]'
                }`}
              >
                <div
                  className={`w-5.5 h-5.5 rounded-full bg-white shadow-md absolute top-0.75 transition-transform ${
                    prefs.dailyFinancialSummary ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
            <p className="text-[12px] text-[#5F6368] leading-relaxed bg-[#F3F4F4] p-3 rounded-2xl border border-[#E5E7EB]">
              Full breakdown of cash collected, UPI bank payouts, and occupancy percentage sent to email.
            </p>
          </div>
        </div>

        {/* Slot Expiry Reminders */}
        <div className="bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#8B5CF6]/10 text-[#7C3AED] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-black text-[#021526]">Slot Hold Expiry Alerts</h3>
                  <p className="text-[11.5px] text-[#5F6368]">Alert when an unconfirmed hold is auto-released</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => togglePref('slotExpiryAlerts')}
                className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                  prefs.slotExpiryAlerts ? 'bg-[#16A34A]' : 'bg-[#E5E7EB]'
                }`}
              >
                <div
                  className={`w-5.5 h-5.5 rounded-full bg-white shadow-md absolute top-0.75 transition-transform ${
                    prefs.slotExpiryAlerts ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
            <p className="text-[12px] text-[#5F6368] leading-relaxed bg-[#F3F4F4] p-3 rounded-2xl border border-[#E5E7EB]">
              Notifies ground staff when a pending phone booking hold releases back into the open pool.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
