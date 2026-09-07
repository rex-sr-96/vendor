'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Bell,
  Clock,
  Ban,
  Plus,
  ArrowUpRight,
  Shield,
  ChevronRight,
  PanelLeft,
  Menu,
} from 'lucide-react';
import { haptics } from '@/utils/haptics';
import { motion, AnimatePresence } from 'motion/react';

export const DesktopHeader: React.FC = () => {
  const {
    currentScreen,
    navigateTo,
    unreadNotifCount,
    notifications,
    markAllNotificationsAsRead,
    setActiveModal,
    venueName,
    ownerName,
    isSidebarCollapsed,
    toggleSidebar,
  } = useApp();

  const [currentTime, setCurrentTime] = useState<string>('06:30 PM');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Update clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getScreenTitle = () => {
    switch (currentScreen) {
      case 'home':
        return { title: 'Arena Overview', category: 'Operations' };
      case 'bookings':
        return { title: 'Bookings', category: 'Operations' };
      case 'booking_details':
        return { title: 'Booking Details', category: 'Bookings' };
      case 'slots':
        return { title: 'Slots Matrix & Timetable', category: 'Operations' };
      case 'payments':
        return { title: 'Payments & Payouts', category: 'Finance' };
      case 'venue_profile':
        return { title: 'Venue Profile & Photos', category: 'Facility' };
      case 'courts':
        return { title: 'Courts & Facilities', category: 'Facility' };
      case 'operating_hours':
        return { title: 'Operating Schedule', category: 'Facility' };
      case 'amenities':
        return { title: 'Arena Amenities', category: 'Facility' };
      case 'cancellation_settings':
        return { title: 'Refund & Policies', category: 'Facility' };
      case 'staff_management':
        return { title: 'Staff & Roles Management', category: 'Team' };
      case 'export_report':
        return { title: 'Export Financial Statements', category: 'Reports' };
      case 'notifications':
        return { title: 'Alert & Notifications Center', category: 'System' };
      case 'help_faq':
      case 'help_support':
        return { title: 'Help Center & Frequently Asked Questions', category: 'Knowledge Base' };
      case 'support':
      case 'support_form':
        return { title: 'Partner Support & Operations Desk', category: 'Assistance' };
      case 'settings':
      case 'booking_settings':
      case 'payment_settings':
      case 'notification_settings':
        return { title: 'Arena System Configurations', category: 'Settings' };
      default:
        return { title: 'Dashboard', category: 'Operations' };
    }
  };

  const meta = getScreenTitle();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-[#E8E6E1] h-16 px-6 lg:px-8 flex items-center justify-between select-none shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all duration-300">
      {/* Left: Open Sidebar Button (when collapsed) + Breadcrumbs / Title */}
      <div className="flex items-center gap-3">
        {/* Open Sidebar Icon Button: ONLY visible when sidebar is closed */}
        {isSidebarCollapsed && (
          <>
            <button
              onClick={() => {
                haptics.tap();
                toggleSidebar();
              }}
              className="w-9 h-9 rounded-xl bg-[#F7F7F5] hover:bg-[#EBE9E3] border border-[#E8E6E1] text-[#171717] flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:border-[#171717]/30"
              title="Open sidebar"
            >
              <PanelLeft className="w-4.5 h-4.5 text-[#FF6B2C]" />
            </button>

            <div className="h-5 w-px bg-[#E8E6E1]" />
          </>
        )}

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2">
          <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#A3A099] hidden sm:inline">
            {meta.category}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[#A3A099] hidden sm:inline" />
          <h1 className="text-[15.5px] sm:text-[16px] font-black text-[#171717] tracking-tight leading-none truncate">
            {meta.title}
          </h1>
        </div>
      </div>

      {/* Right: Actions, Live Clock & Notification */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Date & Time Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F7F7F5] border border-[#E8E6E1] text-[11.5px] font-bold text-[#777570]">
          <Clock className="w-3.5 h-3.5 text-[#A3A099]" />
          <span>28 Aug · {currentTime}</span>
        </div>

        {/* Quick Action: Block Slot */}
        <button
          onClick={() => {
            haptics.tap();
            setActiveModal('block_slot');
          }}
          className="h-9 px-3 bg-white hover:bg-[#F7F7F5] border border-[#E8E6E1] text-[#171717] text-[12px] font-bold rounded-xl flex items-center gap-1.5 shadow-2xs hover:border-[#171717]/30 active-press cursor-pointer transition-all"
        >
          <Ban className="w-3.5 h-3.5 text-[#777570]" />
          <span className="hidden sm:inline">Block Pitch</span>
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              haptics.tap();
              setIsNotifOpen(!isNotifOpen);
            }}
            className="relative w-9 h-9 rounded-xl bg-white border border-[#E8E6E1] text-[#171717] flex items-center justify-center shadow-2xs hover:bg-[#F7F7F5] active-press cursor-pointer transition-all"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-[#171717]" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 rounded-full bg-[#FF6B2C] text-white text-[9.5px] font-black flex items-center justify-center ring-2 ring-white shadow-xs">
                {unreadNotifCount}
              </span>
            )}
          </button>

          {/* Quick Notification Dropdown */}
          <AnimatePresence>
            {isNotifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-[#E8E6E1] shadow-2xl p-3 z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#F1F0EC]">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-[13px] font-extrabold text-[#171717]">Alert Center</h3>
                    {unreadNotifCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-md text-[9px] font-extrabold bg-[#FF6B2C]/10 text-[#FF6B2C]">
                        {unreadNotifCount}
                      </span>
                    )}
                  </div>
                  {unreadNotifCount > 0 && (
                    <button
                      onClick={() => {
                        haptics.tap();
                        markAllNotificationsAsRead();
                      }}
                      className="text-[11px] font-bold text-[#FF6B2C] hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="py-2 space-y-1.5 max-h-60 overflow-y-auto no-scrollbar">
                  {notifications.slice(0, 4).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        setIsNotifOpen(false);
                        navigateTo('notifications');
                      }}
                      className={`p-2 rounded-xl cursor-pointer active-press transition-all ${
                        n.read
                          ? 'hover:bg-[#F7F7F5] opacity-75'
                          : 'bg-[#FF6B2C]/5 border border-[#FF6B2C]/20 hover:bg-[#FF6B2C]/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[12px] font-bold text-[#171717]">{n.title}</p>
                        <span className="text-[9.5px] font-semibold text-[#777570] shrink-0">
                          {n.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#777570] mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-[#F1F0EC]">
                  <button
                    onClick={() => {
                      setIsNotifOpen(false);
                      navigateTo('notifications');
                    }}
                    className="w-full py-1.5 rounded-xl bg-[#F7F7F5] hover:bg-[#EBE9E3] text-[#171717] text-[11.5px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>View All Notifications</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
