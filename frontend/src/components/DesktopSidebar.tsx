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
  Coffee,
  RotateCcw,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  PanelLeft,
} from 'lucide-react';
import { haptics } from '@/utils/haptics';
import { ScreenType } from '@/types';
import { motion, AnimatePresence } from 'motion/react';

export const DesktopSidebar: React.FC = () => {
  const {
    currentScreen,
    navigateTo,
    venueName,
    venueCity,
    ownerName,
    currentUser,
    unreadNotifCount,
    bookings,
    setVenueDetails,
    ownerPhone,
    showToast,
    setActiveModal,
    isSidebarCollapsed,
    toggleSidebar,
  } = useApp();

  const [isVenueOpen, setIsVenueOpen] = useState(false);
  const venueRef = useRef<HTMLDivElement>(null);

  // Close venue dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (venueRef.current && !venueRef.current.contains(e.target as Node)) {
        setIsVenueOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pendingBookingsCount = bookings.filter((b) => b.balanceAmount > 0).length;

  const navGroups = [
    {
      group: 'OPERATIONS',
      items: [
        {
          id: 'home' as ScreenType,
          label: 'Overview',
          icon: LayoutDashboard,
          active: currentScreen === 'home',
        },
        {
          id: 'bookings' as ScreenType,
          label: 'Bookings',
          icon: CalendarDays,
          badge: pendingBookingsCount > 0 ? pendingBookingsCount : undefined,
          active: currentScreen === 'bookings' || currentScreen === 'booking_details',
        },
        {
          id: 'slots' as ScreenType,
          label: 'Slots Matrix',
          icon: Grid3X3,
          active: currentScreen === 'slots',
        },
        {
          id: 'payments' as ScreenType,
          label: 'Payments & Payouts',
          icon: Wallet,
          active: currentScreen === 'payments',
        },
      ],
    },
    {
      group: 'FACILITY & COURTS',
      items: [
        {
          id: 'courts' as ScreenType,
          label: 'Courts & Pitches',
          icon: Building2,
          active: currentScreen === 'courts' || currentScreen === 'add_court',
        },
        {
          id: 'cancellation_settings' as ScreenType,
          label: 'Refund & Policies',
          icon: RotateCcw,
          active: currentScreen === 'cancellation_settings',
        },
      ],
    },
    {
      group: 'MANAGEMENT & TOOLS',
      items: [
        {
          id: 'staff_management' as ScreenType,
          label: 'Staff & Roles',
          icon: Users,
          active: currentScreen === 'staff_management',
        },
        {
          id: 'export_report' as ScreenType,
          label: 'Export Reports',
          icon: FileSpreadsheet,
          active: currentScreen === 'export_report',
        },
        {
          id: 'settings' as ScreenType,
          label: 'General Settings',
          icon: Settings,
          active: currentScreen === 'settings' || currentScreen === 'booking_settings' || currentScreen === 'payment_settings' || currentScreen === 'notification_settings',
        },
        {
          id: 'help_support' as ScreenType,
          label: 'Help & Support',
          icon: HelpCircle,
          active: currentScreen === 'help_support' || currentScreen === 'support_form',
        },
      ],
    },
  ];

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
    setIsVenueOpen(false);
    showToast(`Switched active venue to ${v.name}`);
  };

  const handleItemClick = (screen: ScreenType) => {
    haptics.tap();
    navigateTo(screen);
  };

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 bg-white border-r border-[#E8E6E1] flex flex-col justify-between z-40 select-none shadow-[1px_0_4px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? 'w-20' : 'w-68'
      }`}
    >
      {/* =========================================================================
          TOP SECTION: BRAND LOGO + EXPAND/COLLAPSE TOGGLE + VENUE + NEW BOOKING CTA
         ========================================================================= */}
      <div className="p-3.5 pb-3 border-b border-[#F1F0EC] space-y-3 shrink-0">
        {/* Brand Header */}
        {!isSidebarCollapsed ? (
          /* Full Expanded Header: Logo + Title + Close '<' Button */
          <div className="flex items-center justify-between">
            <div
              onClick={() => navigateTo('home')}
              className="flex items-center gap-2.5 cursor-pointer group px-0.5"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF6B2C] via-[#FF5F1A] to-[#E55315] text-white flex items-center justify-center font-black text-lg shadow-md shadow-[#FF6B2C]/25 group-hover:scale-105 transition-all shrink-0">
                TT
              </div>
              <div className="overflow-hidden whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-[17px] font-black text-[#171717] tracking-tight leading-none">
                    TurfTown
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[8.5px] font-black bg-[#FF6B2C]/10 text-[#FF6B2C] uppercase tracking-wider">
                    PRO
                  </span>
                </div>
                <p className="text-[10.5px] font-bold text-[#777570] tracking-wide mt-0.5">
                  Owner OS
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Mini Collapsed Header: Clean TT Logo (click to navigate home or expand via Menu button in nav) */
          <div className="flex flex-col items-center">
            <div
              onClick={() => {
                haptics.tap();
                navigateTo('home');
              }}
              className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF6B2C] via-[#FF5F1A] to-[#E55315] text-white flex items-center justify-center font-black text-lg shadow-md shadow-[#FF6B2C]/25 hover:scale-105 transition-all cursor-pointer"
              title="TurfTown Home"
            >
              TT
            </div>
          </div>
        )}

        {/* Venue Switcher Card (Only shown when expanded) */}
        {!isSidebarCollapsed && (
          <div className="relative" ref={venueRef}>
            <button
              onClick={() => {
                haptics.tap();
                setIsVenueOpen(!isVenueOpen);
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-[#F7F7F5] border border-[#E8E6E1] hover:bg-[#F1F0EC] hover:border-[#171717]/30 active-press transition-all cursor-pointer shadow-2xs"
            >
              <div className="text-left min-w-0">
                <p className="text-[12.5px] font-black text-[#171717] leading-none truncate">
                  {venueName}
                </p>
                <p className="text-[10px] font-semibold text-[#777570] leading-none mt-1">
                  {venueCity}
                </p>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#777570] shrink-0 transition-transform duration-200 ${
                  isVenueOpen ? 'rotate-180 text-[#171717]' : ''
                }`}
              />
            </button>

            {/* Venue Switcher Dropdown Popover */}
            <AnimatePresence>
              {isVenueOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-1.5 w-76 bg-white rounded-2xl border border-[#E8E6E1] shadow-2xl p-2 z-50 overflow-hidden"
                >
                  <div className="px-3 py-1.5 border-b border-[#F1F0EC] flex items-center justify-between">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#777570]">
                      Select Arena
                    </span>
                    <span className="text-[10.5px] font-bold text-[#FF6B2C]">
                      {venuesList.length} Active
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
                        <div className="min-w-0">
                          <p className="text-[12.5px] font-bold text-[#171717] truncate">{v.name}</p>
                          <p className="text-[10.5px] text-[#777570] truncate">{v.courts}</p>
                        </div>
                        {v.active && (
                          <div className="w-4 h-4 rounded-full bg-[#FF6B2C] text-white flex items-center justify-center shrink-0 ml-2">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-1.5 border-t border-[#F1F0EC]">
                    <button
                      onClick={() => {
                        setIsVenueOpen(false);
                        navigateTo('add_court');
                      }}
                      className="w-full py-1.5 px-3 rounded-xl bg-[#F7F7F5] hover:bg-[#EBE9E3] text-[#171717] text-[11.5px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Court</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Primary Action: + New Booking */}
        <button
          onClick={() => {
            haptics.tap();
            setActiveModal('new_booking');
          }}
          className={`h-10 bg-gradient-to-r from-[#FF6B2C] via-[#FF5F1A] to-[#E55315] hover:from-[#e85b1e] hover:to-[#db4a0b] text-white text-[13px] font-extrabold rounded-2xl flex items-center justify-center shadow-md shadow-[#FF6B2C]/25 hover:shadow-lg hover:shadow-[#FF6B2C]/35 active-press cursor-pointer transition-all ${
            isSidebarCollapsed ? 'w-10 mx-auto p-0' : 'w-full px-4 gap-2'
          }`}
          title="New Booking"
        >
          <Plus className="w-4 h-4 stroke-[3] shrink-0" />
          {!isSidebarCollapsed && <span className="whitespace-nowrap truncate">New Booking</span>}
        </button>
      </div>

      {/* =========================================================================
          MIDDLE SECTION: SCROLLABLE NAVIGATION GROUPS (Clean icons, no dots)
         ========================================================================= */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-2 sm:px-3 py-3 space-y-4">
        {navGroups.map((group) => (
          <div key={group.group} className="space-y-1">
            {!isSidebarCollapsed ? (
              <h4 className="px-3 text-[10px] font-black uppercase tracking-wider text-[#A3A099] whitespace-nowrap truncate">
                {group.group}
              </h4>
            ) : (
              <div className="h-px bg-[#F1F0EC] my-2 mx-1" />
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center rounded-xl text-[12.5px] font-bold transition-all cursor-pointer select-none group relative ${
                      isSidebarCollapsed
                        ? 'justify-center p-2.5'
                        : 'justify-between px-3 py-2'
                    } ${
                      item.active
                        ? 'bg-[#171717] text-white shadow-xs'
                        : 'text-[#5C5A55] hover:text-[#171717] hover:bg-[#F7F7F5]'
                    }`}
                    title={isSidebarCollapsed ? item.label : undefined}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          item.active
                            ? 'text-[#FF6B2C] stroke-[2.5]'
                            : 'text-[#777570] group-hover:text-[#171717]'
                        }`}
                      />
                      {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!isSidebarCollapsed && item.badge !== undefined && (
                      <span
                        className={`min-w-4.5 h-4.5 px-1 rounded-full text-[9.5px] font-black flex items-center justify-center shrink-0 ${
                          item.active
                            ? 'bg-[#FF6B2C] text-white'
                            : 'bg-[#FF6B2C]/15 text-[#FF6B2C]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* =========================================================================
          BOTTOM SECTION: USER PROFILE & QUICK LOGOUT
         ========================================================================= */}
      <div className="p-2.5 border-t border-[#F1F0EC] bg-[#FAF9F6] shrink-0">
        <div
          className={`flex items-center rounded-2xl bg-white border border-[#E8E6E1] shadow-2xs ${
            isSidebarCollapsed ? 'justify-center p-1.5' : 'justify-between p-2'
          }`}
        >
          <div
            onClick={() => navigateTo('settings')}
            className={`flex items-center gap-2.5 min-w-0 cursor-pointer group ${
              isSidebarCollapsed ? 'justify-center' : 'flex-1'
            }`}
            title={isSidebarCollapsed ? `${ownerName} (Settings)` : undefined}
          >
            <div className="w-8 h-8 rounded-xl bg-[#171717] text-white flex items-center justify-center font-black text-xs shadow-xs group-hover:ring-2 group-hover:ring-[#FF6B2C] transition-all shrink-0">
              {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'TT'}
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <p className="text-[12px] font-extrabold text-[#171717] leading-none truncate">
                  {currentUser?.name || ownerName}
                </p>
                <p className="text-[10px] font-semibold text-[#777570] leading-none mt-1 truncate">
                  {currentUser?.type === 'staff' ? currentUser.role : 'Arena Director'}
                </p>
              </div>
            )}
          </div>

          {!isSidebarCollapsed && (
            <button
              onClick={() => {
                haptics.tap();
                setActiveModal('logout_confirm');
              }}
              className="w-7 h-7 rounded-lg bg-[#F7F7F5] hover:bg-[#D94B4B]/10 hover:text-[#D94B4B] text-[#777570] flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-1"
              title="Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
