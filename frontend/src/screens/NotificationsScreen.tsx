import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ChevronLeft,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Banknote,
  Calendar,
  CheckCheck,
  Trash2,
  ArrowRight,
  Info,
} from 'lucide-react';
import { haptics } from '../utils/haptics';
import { NotificationItem } from '../types';

export const NotificationsScreen: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    goBack,
    navigateTo,
    setSelectedBookingId,
    unreadNotifCount,
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'booking' | 'payment' | 'alert'>('all');

  const filteredNotifications = notifications.filter((item) => {
    if (filter === 'all') return true;
    return item.category === filter;
  });

  const handleNotificationClick = (item: NotificationItem) => {
    haptics.tap();
    markNotificationAsRead(item.id);
    if (item.bookingId) {
      setSelectedBookingId(item.bookingId);
      navigateTo('booking_details');
    } else if (item.category === 'payment') {
      navigateTo('payments');
    }
  };

  const getCategoryIcon = (category: NotificationItem['category']) => {
    switch (category) {
      case 'booking':
        return <Calendar className="w-4 h-4 text-[#F94001]" />;
      case 'payment':
        return <Banknote className="w-4 h-4 text-[#16A34A]" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />;
      case 'system':
      default:
        return <Info className="w-4 h-4 text-[#5F6368]" />;
    }
  };

  const getCategoryBg = (category: NotificationItem['category']) => {
    switch (category) {
      case 'booking':
        return 'bg-[#F94001]/10 text-[#F94001]';
      case 'payment':
        return 'bg-[#16A34A]/10 text-[#16A34A]';
      case 'alert':
        return 'bg-[#F59E0B]/10 text-[#F59E0B]';
      case 'system':
      default:
        return 'bg-[#F3F4F4] text-[#021526]';
    }
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
            className="md:hidden w-9 h-9 -ml-1 rounded-xl flex items-center justify-center text-[#021526] hover:bg-[#E5E7EB]/50 active-press transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.4]" />
          </button>
          <div>
            <h1 className="text-[17px] font-extrabold text-[#021526] tracking-tight leading-none">
              Notifications
            </h1>
            <span className="text-[11px] text-[#5F6368] mt-0.5 block">
              {unreadNotifCount > 0
                ? `${unreadNotifCount} unread update${unreadNotifCount > 1 ? 's' : ''}`
                : 'All caught up'}
            </span>
          </div>
        </div>

        {unreadNotifCount > 0 && (
          <button
            onClick={() => {
              haptics.tap();
              markAllNotificationsAsRead();
            }}
            className="flex items-center gap-1 text-[11.5px] font-bold text-[#F94001] bg-[#F94001]/10 px-2.5 py-1.5 rounded-xl hover:bg-[#F94001]/20 active-press cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 p-1 bg-[#F3F4F4] rounded-2xl">
        {[
          { id: 'all', label: 'All' },
          { id: 'booking', label: 'Bookings' },
          { id: 'payment', label: 'Payments' },
          { id: 'alert', label: 'Alerts' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              haptics.tap();
              setFilter(tab.id as any);
            }}
            className={`flex-1 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${
              filter === tab.id
                ? 'bg-white text-[#021526] shadow-xs'
                : 'text-[#5F6368] hover:text-[#021526]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-[#E5E7EB] shadow-xs text-center space-y-2.5">
          <div className="w-12 h-12 rounded-2xl bg-[#F3F4F4] text-[#5F6368] flex items-center justify-center mx-auto">
            <Bell className="w-6 h-6 stroke-[1.8]" />
          </div>
          <h3 className="text-[14.5px] font-bold text-[#021526]">No notifications</h3>
          <p className="text-[12px] text-[#5F6368] max-w-xs mx-auto">
            You're all up to date. Activity alerts for bookings and payouts will show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className={`p-3.5 rounded-2xl border transition-all active-press cursor-pointer relative ${
                item.read
                  ? 'bg-white border-[#E5E7EB] shadow-xs opacity-90'
                  : 'bg-white border-[#F94001]/40 shadow-sm ring-1 ring-[#F94001]/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${getCategoryBg(
                    item.category
                  )}`}
                >
                  {getCategoryIcon(item.category)}
                </div>

                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-1.5">
                    <h3
                      className={`text-[13.5px] font-bold leading-snug truncate ${
                        item.read ? 'text-[#021526]' : 'text-[#021526] font-extrabold'
                      }`}
                    >
                      {item.title}
                    </h3>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-[#F94001] shrink-0" />
                    )}
                  </div>
                  <p className="text-[12px] text-[#5F6368] mt-0.5 leading-relaxed">
                    {item.message}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#F3F4F4]">
                    <span className="text-[10.5px] text-[#5F6368] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.time}
                    </span>

                    <div className="flex items-center gap-2">
                      {item.bookingId && (
                        <span className="text-[11px] font-bold text-[#F94001] flex items-center gap-0.5">
                          View Details <ArrowRight className="w-3 h-3" />
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          haptics.tap();
                          deleteNotification(item.id);
                        }}
                        className="text-[#5F6368] hover:text-[#DC2626] p-1 cursor-pointer"
                        aria-label="Delete notification"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notification Preferences shortcut */}
      <div className="pt-2">
        <button
          onClick={() => {
            haptics.tap();
            navigateTo('notification_settings');
          }}
          className="w-full py-2.5 rounded-2xl bg-[#F3F4F4] hover:bg-[#E5E7EB] text-[#021526] font-bold text-[12.5px] flex items-center justify-center gap-1.5 active-press transition-colors cursor-pointer"
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Manage Alert Preferences</span>
        </button>
      </div>
    </div>
  );
};
