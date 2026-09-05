import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Grid3X3,
  Coffee,
  Clock,
  SlidersHorizontal,
  Wallet,
  RotateCcw,
  Users,
  HelpCircle,
  ChevronRight,
  LogOut,
  FileSpreadsheet,
  Shield,
  FileText,
} from 'lucide-react';
import { haptics } from '../utils/haptics';

export const SettingsScreen: React.FC = () => {
  const {
    navigateTo,
    venueName,
    venueCity,
    amenities,
    staffMembers,
    cancellationPolicy,
  } = useApp();

  const activeAmenitiesCount = amenities.filter((a) => a.enabled).length;
  const activeStaffCount = staffMembers.filter((s) => s.status === 'Active').length;

  const settingsRows = [
    {
      id: 'courts',
      title: 'Courts & Grounds',
      caption: 'Manage courts, sports & hourly rates',
      icon: Grid3X3,
      screen: 'courts' as const,
    },
    {
      id: 'amenities',
      title: 'Amenities',
      caption: `${activeAmenitiesCount} of ${amenities.length} active (Lighting, showers, parking)`,
      icon: Coffee,
      screen: 'amenities' as const,
    },
    {
      id: 'operating_hours',
      title: 'Operating Hours',
      caption: '06:00 AM – 11:00 PM (Daily)',
      icon: Clock,
      screen: 'operating_hours' as const,
    },
    {
      id: 'booking_settings',
      title: 'Booking Settings',
      caption: 'Advance window & duration limits',
      icon: SlidersHorizontal,
      screen: 'booking_settings' as const,
    },
    {
      id: 'payment_settings',
      title: 'Payment Settings',
      caption: 'UPI QR, bank settlement & cash mode',
      icon: Wallet,
      screen: 'payment_settings' as const,
    },
    {
      id: 'cancellation',
      title: 'Cancellation & Refunds',
      caption: `${cancellationPolicy.freeCancellationHours}h free window · ${cancellationPolicy.refundPercentage}% refund`,
      icon: RotateCcw,
      screen: 'cancellation_settings' as const,
    },
    {
      id: 'staff',
      title: 'Staff Management',
      caption: `${activeStaffCount} active members (Manager, Cashier, Groundkeeper)`,
      icon: Users,
      screen: 'staff_management' as const,
    },
    {
      id: 'export_reports',
      title: 'Export Booking Reports',
      caption: 'Download PDF, Excel & CSV statements',
      icon: FileSpreadsheet,
      screen: 'export_report' as const,
    },
    {
      id: 'notification_settings',
      title: 'Alert Preferences',
      caption: 'WhatsApp booking confirmation & payment link rules',
      icon: SlidersHorizontal,
      screen: 'notification_settings' as const,
    },
    {
      id: 'terms_conditions',
      title: 'Terms & Conditions',
      caption: 'Platform rules, manager rights & responsibilities',
      icon: FileText,
      screen: 'terms_conditions' as const,
    },
    {
      id: 'privacy_policy',
      title: 'Privacy Policy',
      caption: 'Data protection, player privacy & security',
      icon: Shield,
      screen: 'privacy_policy' as const,
    },
    {
      id: 'help_support',
      title: 'Help & Support',
      caption: 'Raise requests, view tickets & FAQs',
      icon: HelpCircle,
      screen: 'help_support' as const,
    },
  ];

  const handleRowClick = (row: (typeof settingsRows)[0]) => {
    haptics.tap();
    if (row.screen) {
      navigateTo(row.screen);
    }
  };

  return (
    <div className="pb-8 pt-3 px-4 w-full space-y-3.5 select-none">
      {/* Top Heading */}
      <div className="pt-1">
        <h1 className="text-[22px] font-extrabold text-[#171717] tracking-tight leading-none">
          Settings
        </h1>
        <p className="text-[12px] text-[#777570] mt-0.5 font-medium">Venue rules, staff & configurations</p>
      </div>

      {/* Venue Owner Profile Card */}
      <div className="bg-white rounded-2xl p-3.5 border border-[#E8E6E1] shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-11 h-11 rounded-2xl bg-[#FF6B2C] text-white font-extrabold text-base flex items-center justify-center shadow-xs">
            TT
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-[#171717]">{venueName}</h2>
            <p className="text-[11.5px] text-[#777570]">{venueCity} · Owner Admin</p>
          </div>
        </div>

        <button
          onClick={() => {
            haptics.tap();
            navigateTo('courts');
          }}
          className="text-[11.5px] font-bold text-[#FF6B2C] bg-[#FF6B2C]/10 px-2.5 py-1 rounded-xl hover:bg-[#FF6B2C]/20 active-press cursor-pointer"
        >
          Edit Courts
        </button>
      </div>

      {/* Settings Row List */}
      <div className="bg-white rounded-2xl border border-[#E8E6E1] shadow-xs divide-y divide-[#F1F0EC] overflow-hidden">
        {settingsRows.map((row) => {
          const Icon = row.icon;
          return (
            <div
              key={row.id}
              onClick={() => handleRowClick(row)}
              className="p-3 flex items-center justify-between hover:bg-[#F7F7F5] cursor-pointer active-press transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#F1F0EC] text-[#171717] flex items-center justify-center group-hover:bg-[#171717] group-hover:text-white transition-colors">
                  <Icon className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <h3 className="text-[13.5px] font-bold text-[#171717]">{row.title}</h3>
                  <p className="text-[11px] text-[#777570]">{row.caption}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-[#777570] group-hover:text-[#171717]" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Logout / Switch User */}
      <div className="pt-1">
        <button
          onClick={() => {
            haptics.tap();
            navigateTo('login');
          }}
          className="w-full py-2.5 bg-white text-[#D94B4B] border border-[#E8E6E1] rounded-2xl font-bold text-[13px] flex items-center justify-center gap-1.5 hover:bg-[#D94B4B]/10 active-press transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Switch Account / Sign Out</span>
        </button>
      </div>

      {/* App Version & Build Information */}
      <div className="pt-2 pb-6 text-center space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E8E6E1] text-[#777570] text-[11px] font-bold shadow-2xs">
          <span className="text-[#171717]">TurfTown Partner</span>
          <span className="w-1 h-1 rounded-full bg-[#D1CFCA]" />
          <span className="text-[#2FA66A] font-extrabold">v2.4.0</span>
          <span className="w-1 h-1 rounded-full bg-[#D1CFCA]" />
          <span className="text-[#A3A099] font-medium">Build 2026.08.29</span>
        </div>
        <p className="text-[10px] text-[#A3A099]">
          Ground Management & Real-time Booking Engine · Production
        </p>
      </div>
    </div>
  );
};
