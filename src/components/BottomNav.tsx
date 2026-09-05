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
      className="w-full z-40 bg-white/95 backdrop-blur-lg border-t border-[#E8E6E1] shrink-0 select-none shadow-[0_-4px_12px_rgba(0,0,0,0.03)]"
    >
      <div className="w-full px-2 h-15 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => handleTabClick(item.id)}
              className="relative flex flex-col items-center justify-center flex-1 h-full py-1 text-center group active-press transition-colors focus:outline-none cursor-pointer"
            >
              <div className="relative flex items-center justify-center w-7 h-7">
                <Icon
                  className={`w-5 h-5 transition-all duration-150 ${
                    isActive ? 'text-[#FF6B2C] stroke-[2.4] scale-105' : 'text-[#777570] stroke-[1.8] group-hover:text-[#171717]'
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-[#FF6B2C] text-white text-[9px] font-extrabold flex items-center justify-center ring-2 ring-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10.5px] mt-0.5 transition-all duration-150 tracking-tight ${
                  isActive ? 'text-[#171717] font-extrabold' : 'text-[#777570] font-medium'
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
