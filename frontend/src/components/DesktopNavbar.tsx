'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard,
  CalendarDays,
  Grid3X3,
  Wallet,
  Settings,
  Bell,
  Plus,
  Ban,
  ChevronDown,
  Building2,
  Clock,
  LogOut,
  FileSpreadsheet,
  Users,
  Check,
  ArrowUpRight,
} from 'lucide-react';
import { haptics } from '@/utils/haptics';
import { BottomNavTab } from '@/types';
import { motion, AnimatePresence } from 'motion/react';

export const DesktopNavbar: React.FC = () => {
  const {
    activeTab,
    navigateTo,
    venueName,
    venueCity,
    ownerName,
    unreadNotifCount,
    notifications,
    markAllNotificationsAsRead,
    setActiveModal,
    bookings,
    setVenueDetails,
    ownerPhone,
    showToast,
  } = useApp();

  // Dropdown states
  const [isVenueDropdownOpen, setIsVenueDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('06:30 PM');

  const venueRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (venueRef.current && !venueRef.current.contains(e.target as Node)) {
        setIsVenueDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const pendingBookingsCount = bookings.filter((b) => b.balanceAmount > 0).length;

  const navItems: { id: BottomNavTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'home', label: 'Overview', icon: LayoutDashboard },
    {
      id: 'bookings',
      label: 'Bookings',
      icon: CalendarDays,
      badge: pendingBookingsCount > 0 ? pendingBookingsCount : undefined,
    },
    { id: 'slots', label: 'Slots Matrix', icon: Grid3X3 },
    { id: 'payments', label: 'Payments', icon: Wallet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (tab: BottomNavTab) => {
    haptics.tap();
    if (tab === 'home') navigateTo('home');
    else if (tab === 'bookings') navigateTo('bookings');
    else if (tab === 'slots') navigateTo('slots');
    else if (tab === 'payments') navigateTo('payments');
    else if (tab === 'settings') navigateTo('settings');
  };

  const venuesList = [
    {
      name: 'TurfTown Arena',
      city: 'Koramangala, Bengaluru',
      courts: '3 Courts · Football & Badminton',
      revenueToday: '₹48,600',
      active: venueName === 'TurfTown Arena',
    },
    {
      name: 'TurfTown Academy Center',
      city: 'Whitefield, Bengaluru',
      courts: '4 Courts · Box Cricket & Futsal',
      revenueToday: '₹62,400',
      active: venueName === 'TurfTown Academy Center',
    },
    {
      name: 'TurfTown Box Arena',
      city: 'Indiranagar, Bengaluru',
      courts: '2 Courts · Futsal 5v5',
      revenueToday: '₹34,200',
      active: venueName === 'TurfTown Box Arena',
    },
  ];

  const handleSelectVenue = (v: (typeof venuesList)[0]) => {
    haptics.tap();
    setVenueDetails({
      name: v.name,
      address: v.city,
      city: 'Bengaluru',
      phone: ownerPhone,
    });
    setIsVenueDropdownOpen(false);
    showToast(`Switched active venue to ${v.name}`);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white/95 backdrop-blur-xl border-b border-[#E8E6E1] shadow-[0_1px_4px_rgba(0,0,0,0.04)] select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* =========================================================================
            ZONE 1: BRAND LOGO & VENUE SELECTOR (LEFT)
           ========================================================================= */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Brand Mark */}
          <div
            onClick={() => navigateTo('home')}
            className="flex items-center gap-2 cursor-pointer group transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF6B2C] to-[#E55315] text-white flex items-center justify-center font-black text-base shadow-sm shadow-[#FF6B2C]/25 group-hover:scale-105 transition-all">
              TT
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-[15px] font-black text-[#171717] tracking-tight leading-none block">
                  TurfTown
                </span>
                <span className="px-1 py-0.5 rounded text-[8.5px] font-extrabold bg-[#FF6B2C]/10 text-[#FF6B2C] uppercase tracking-wider">
                  OS
                </span>
              </div>
              <span className="text-[10.5px] font-bold text-[#777570] tracking-wide block mt-0.5">
                Owner Center
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-[#E8E6E1] hidden md:block" />

          {/* Interactive Venue Switcher Dropdown */}
          <div className="relative" ref={venueRef}>
            <button
              onClick={() => {
                haptics.tap();
                setIsVenueDropdownOpen(!isVenueDropdownOpen);
              }}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#F7F7F5] border border-[#E8E6E1] hover:bg-[#F1F0EC] hover:border-[#171717]/30 active-press cursor-pointer transition-all shadow-2xs"
            >
              <div className="relative flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-[#2FA66A]" />
                <span className="absolute w-2 h-2 rounded-full bg-[#2FA66A] animate-ping opacity-60" />
              </div>
              <div className="text-left">
                <p className="text-[12px] sm:text-[12.5px] font-extrabold text-[#171717] leading-none max-w-[110px] sm:max-w-[140px] truncate">
                  {venueName}
                </p>
                <p className="text-[9.5px] font-semibold text-[#777570] leading-none mt-0.5 hidden sm:block">
                  {venueCity} · <span className="text-[#2FA66A] font-bold">Open</span>
                </p>
              </div>
              <ChevronDown
                className={`w-3 h-3 text-[#777570] transition-transform duration-200 ${
                  isVenueDropdownOpen ? 'rotate-180 text-[#171717]' : ''
                }`}
              />
            </button>

            {/* Venue Dropdown Popover */}
            <AnimatePresence>
              {isVenueDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-2 w-76 sm:w-80 bg-white rounded-2xl border border-[#E8E6E1] shadow-2xl p-2 z-50 overflow-hidden"
                >
                  <div className="px-3 py-2 border-b border-[#F1F0EC] flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#777570]">
                      Switch Arena Location
                    </span>
                    <span className="text-[11px] font-bold text-[#FF6B2C]">
                      {venuesList.length} Venues
                    </span>
                  </div>

                  <div className="py-1 space-y-1">
                    {venuesList.map((v) => (
                      <div
                        key={v.name}
                        onClick={() => handleSelectVenue(v)}
                        className={`p-2.5 rounded-xl cursor-pointer active-press transition-all flex items-center justify-between ${
                          v.active
                            ? 'bg-[#FF6B2C]/10 border border-[#FF6B2C]/30'
                            : 'hover:bg-[#F7F7F5]'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                              v.active
                                ? 'bg-[#FF6B2C] text-white'
                                : 'bg-[#F1F0EC] text-[#171717]'
                            }`}
                          >
                            <Building2 className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[12.5px] font-bold text-[#171717] truncate">{v.name}</p>
                            <p className="text-[10.5px] text-[#777570] truncate">{v.courts}</p>
                            <p className="text-[10px] font-semibold text-[#2FA66A] mt-0.5">
                              Today: {v.revenueToday}
                            </p>
                          </div>
                        </div>

                        {v.active && (
                          <div className="w-4 h-4 rounded-full bg-[#FF6B2C] text-white flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-[#F1F0EC]">
                    <button
                      onClick={() => {
                        setIsVenueDropdownOpen(false);
                        navigateTo('add_court');
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-[#F7F7F5] hover:bg-[#EBE9E3] text-[#171717] text-[11.5px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Arena / Court</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* =========================================================================
            ZONE 2: ELEVATED SEGMENTED NAVIGATION TABS (CENTER)
           ========================================================================= */}
        <nav className="flex items-center gap-0.5 sm:gap-1 bg-[#F1F0EC] p-1 rounded-2xl border border-[#E8E6E1]/80 shrink-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative px-2.5 lg:px-3.5 py-1.5 rounded-xl text-[12px] lg:text-[12.5px] font-bold transition-all cursor-pointer flex items-center gap-1.5 select-none ${
                  isActive
                    ? 'bg-white text-[#171717] shadow-xs ring-1 ring-black/5'
                    : 'text-[#777570] hover:text-[#171717] hover:bg-white/40'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 transition-colors shrink-0 ${
                    isActive ? 'text-[#FF6B2C] stroke-[2.5]' : 'text-[#777570]'
                  }`}
                />
                <span className="hidden md:inline">{item.label}</span>

                {item.badge && (
                  <span className="min-w-4 h-4 px-1 rounded-full bg-[#FF6B2C] text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* =========================================================================
            ZONE 3: QUICK CTAS, LIVE CLOCK & PROFILE (RIGHT)
           ========================================================================= */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Live Clock */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#F7F7F5] border border-[#E8E6E1] text-[11px] font-bold text-[#777570]">
            <Clock className="w-3 h-3 text-[#A3A099]" />
            <span>{currentTime}</span>
          </div>

          {/* Primary CTA: + New Booking */}
          <button
            id="btn-desktop-nav-new-booking"
            onClick={() => {
              haptics.tap();
              setActiveModal('new_booking');
            }}
            className="h-9 px-3 sm:px-3.5 bg-gradient-to-r from-[#FF6B2C] to-[#FF5410] hover:from-[#e85b1e] hover:to-[#db4a0b] text-white text-[12px] font-bold rounded-xl flex items-center gap-1 shadow-xs hover:shadow-md active-press cursor-pointer transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span className="hidden sm:inline">+ Booking</span>
          </button>

          {/* Secondary CTA: Block Slot */}
          <button
            id="btn-desktop-nav-block-slot"
            onClick={() => {
              haptics.tap();
              setActiveModal('block_slot');
            }}
            className="h-9 px-2.5 sm:px-3 bg-white hover:bg-[#F7F7F5] border border-[#E8E6E1] text-[#171717] text-[12px] font-bold rounded-xl hidden lg:flex items-center gap-1 shadow-2xs hover:border-[#171717]/30 active-press cursor-pointer transition-all"
          >
            <Ban className="w-3.5 h-3.5 text-[#777570]" />
            <span>Block</span>
          </button>

          {/* Notification Center Popover Trigger */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                haptics.tap();
                setIsNotifDropdownOpen(!isNotifDropdownOpen);
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

            {/* Notification Quick Preview Dropdown */}
            <AnimatePresence>
              {isNotifDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 sm:w-88 bg-white rounded-2xl border border-[#E8E6E1] shadow-2xl p-3 z-50 overflow-hidden"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#F1F0EC]">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[13.5px] font-extrabold text-[#171717]">Alert Center</h3>
                      {unreadNotifCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[9.5px] font-extrabold bg-[#FF6B2C]/10 text-[#FF6B2C]">
                          {unreadNotifCount} new
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

                  {/* List of recent notifications */}
                  <div className="py-2 space-y-1.5 max-h-64 overflow-y-auto no-scrollbar">
                    {notifications.slice(0, 4).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          setIsNotifDropdownOpen(false);
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
                        setIsNotifDropdownOpen(false);
                        navigateTo('notifications');
                      }}
                      className="w-full py-1.5 rounded-xl bg-[#F7F7F5] hover:bg-[#EBE9E3] text-[#171717] text-[11.5px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>View All Alerts</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                haptics.tap();
                setIsProfileDropdownOpen(!isProfileDropdownOpen);
              }}
              className="flex items-center gap-2 p-1 pr-2 rounded-xl bg-white border border-[#E8E6E1] hover:bg-[#F7F7F5] active-press cursor-pointer transition-all shadow-2xs"
            >
              <div className="w-7 h-7 rounded-lg bg-[#171717] text-white flex items-center justify-center font-bold text-[11px] shadow-xs">
                TT
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-[12px] font-extrabold text-[#171717] leading-none">{ownerName}</p>
              </div>
              <ChevronDown
                className={`w-3 h-3 text-[#777570] transition-transform duration-200 ${
                  isProfileDropdownOpen ? 'rotate-180 text-[#171717]' : ''
                }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            <AnimatePresence>
              {isProfileDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl border border-[#E8E6E1] shadow-2xl p-2 z-50 overflow-hidden"
                >
                  <div className="px-3 py-2 border-b border-[#F1F0EC]">
                    <p className="text-[12.5px] font-extrabold text-[#171717]">{ownerName}</p>
                    <p className="text-[10.5px] text-[#777570]">{ownerPhone || '+91 98765 43210'}</p>
                  </div>

                  <div className="py-1 space-y-0.5 text-[12px] font-bold text-[#171717]">
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        navigateTo('settings');
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl flex items-center gap-2 hover:bg-[#F7F7F5] cursor-pointer text-left"
                    >
                      <Settings className="w-3.5 h-3.5 text-[#777570]" />
                      <span>Arena Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        navigateTo('staff_management');
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl flex items-center gap-2 hover:bg-[#F7F7F5] cursor-pointer text-left"
                    >
                      <Users className="w-3.5 h-3.5 text-[#777570]" />
                      <span>Staff & Roles</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        navigateTo('export_report');
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl flex items-center gap-2 hover:bg-[#F7F7F5] cursor-pointer text-left"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-[#777570]" />
                      <span>Export Reports</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-[#F1F0EC]">
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        haptics.tap();
                        setActiveModal('logout_confirm');
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl flex items-center gap-2 text-[#D94B4B] hover:bg-[#D94B4B]/10 cursor-pointer text-[12px] font-bold text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};
