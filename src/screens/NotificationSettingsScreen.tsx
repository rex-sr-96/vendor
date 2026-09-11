import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ChevronLeft,
  MessageSquare,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { haptics } from '../utils/haptics';

export const NotificationSettingsScreen: React.FC = () => {
  const { notificationPreferences, updateNotificationPreferences, goBack } = useApp();

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
    goBack();
  };

  return (
    <div className="pb-8 pt-3 px-4 w-full space-y-3.5 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              haptics.tap();
              goBack();
            }}
            className="w-9 h-9 -ml-1 rounded-xl flex items-center justify-center text-[#021526] hover:bg-[#E5E7EB]/50 active-press transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.4]" />
          </button>
          <div>
            <h1 className="text-[17px] font-extrabold text-[#021526] tracking-tight leading-none">
              Notification Preferences
            </h1>
            <span className="text-[11px] text-[#5F6368] mt-0.5 block">
              WhatsApp & booking alert channels
            </span>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1 text-[11.5px] font-bold text-white bg-[#021526] px-3 py-1.5 rounded-xl hover:bg-black active-press cursor-pointer shadow-xs"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save</span>
        </button>
      </div>

      {/* WhatsApp Automation Section */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
        <div className="p-3.5 bg-[#25D366]/10 border-b border-[#25D366]/20 flex items-center gap-2.5">
          <MessageSquare className="w-4 h-4 text-[#1E7E34]" />
          <div>
            <h2 className="text-[13px] font-bold text-[#1E7E34]">WhatsApp Automation</h2>
            <p className="text-[11px] text-[#1E7E34]/80">Sent directly to customer & venue numbers</p>
          </div>
        </div>

        <div className="divide-y divide-[#F3F4F4]">
          {/* Booking Confirmation */}
          <div
            onClick={() => togglePref('whatsappBookingConfirmation')}
            className="p-3.5 flex items-center justify-between hover:bg-[#F3F4F4] cursor-pointer"
          >
            <div className="pr-3">
              <h3 className="text-[13px] font-bold text-[#021526]">Booking Confirmations</h3>
              <p className="text-[11px] text-[#5F6368]">
                Instant ticket details with Google Maps venue pin
              </p>
            </div>
            <div
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                prefs.whatsappBookingConfirmation ? 'bg-[#F94001]' : 'bg-[#E5E7EB]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                  prefs.whatsappBookingConfirmation ? 'translate-x-5.5' : 'translate-x-0.5'
                }`}
              />
            </div>
          </div>

          {/* Payment Links & Balance Due */}
          <div
            onClick={() => togglePref('whatsappPaymentReminder')}
            className="p-3.5 flex items-center justify-between hover:bg-[#F3F4F4] cursor-pointer"
          >
            <div className="pr-3">
              <h3 className="text-[13px] font-bold text-[#021526]">Payment Links & Balance Due</h3>
              <p className="text-[11px] text-[#5F6368]">
                Auto-send UPI link 2 hours before scheduled match
              </p>
            </div>
            <div
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                prefs.whatsappPaymentReminder ? 'bg-[#F94001]' : 'bg-[#E5E7EB]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                  prefs.whatsappPaymentReminder ? 'translate-x-5.5' : 'translate-x-0.5'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save CTA */}
      <div className="pt-1">
        <button
          onClick={handleSave}
          className="w-full h-11 bg-[#021526] hover:bg-black text-white font-bold rounded-2xl text-[13.5px] flex items-center justify-center gap-2 active-press transition-all shadow-xs cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
          <span>Save Alert Settings</span>
        </button>
      </div>
    </div>
  );
};
