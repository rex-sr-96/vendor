import React from 'react';
import { useApp } from '../context/AppContext';
import { BottomNavTab } from '../types';
import { LayoutDashboard, CalendarDays, Grid3X3, Wallet, MoreHorizontal } from 'lucide-react';
import { haptics } from '../utils/haptics';

interface NavItem {
  id: BottomNavTab;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
}

export const BottomNav: React.FC = () => {
  const { activeTab, navigateTo, bookings } = useApp();

  const pendingBookingsCount = bookings.filter((b) => b.balanceAmount > 0).length;

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'bookings', label: 'Bookings', icon: CalendarDays, badge: pendingBookingsCount > 0 ? pendingBookingsCount : undefined },
    { id: 'slots', label: 'Slots', icon: Grid3X3 },
    { id: 'payments', label: 'Payments', icon: Wallet },
    { id: 'settings', label: 'More', icon: MoreHorizontal },
  ];

  const handleTabClick = (tab: BottomNavTab) => {
    haptics.tap();
    if (tab === 'home') navigateTo('home');
    else if (tab === 'bookings') navigateTo('bookings');
    else if (tab === 'slots') navigateTo('slots');
    else if (tab === 'payments') navigateTo('payments');
    else if (tab === 'settings') navigateTo('settings');
  };

  return (
    <nav
      id="bottom-nav-bar"
      className="w-full z-40 bg-white/95 backdrop-blur-xl border-t border-[#E8E6E1] shrink-0 select-none shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe"
    >
      <div className="w-full px-2 h-16 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => handleTabClick(item.id)}
              className="relative flex flex-col items-center justify-center flex-1 h-full py-1 text-center active-press transition-all focus:outline-none cursor-pointer"
            >
              <div
                className={`relative flex items-center justify-center w-12 h-7.5 rounded-full transition-all duration-200 ${
                  isActive ? 'bg-[#FF6B2C]/15 scale-105' : 'hover:bg-[#FAF9F6]'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-all duration-150 ${
                    isActive ? 'text-[#FF6B2C] stroke-[2.4]' : 'text-[#777570] stroke-[1.8]'
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-0.5 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#FF6B2C] text-white text-[9.5px] font-black flex items-center justify-center ring-2 ring-white shadow-xs animate-in zoom-in-50 duration-200">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10.5px] mt-0.5 transition-all duration-150 tracking-tight ${
                  isActive ? 'text-[#FF6B2C] font-black scale-105' : 'text-[#777570] font-semibold'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
