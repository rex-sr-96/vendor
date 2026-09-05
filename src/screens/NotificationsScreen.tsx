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
        return <Calendar className="w-4 h-4 text-[#FF6B2C]" />;
      case 'payment':
        return <Banknote className="w-4 h-4 text-[#2FA66A]" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-[#E7A72F]" />;
      case 'system':
      default:
        return <Info className="w-4 h-4 text-[#777570]" />;
    }
  };

  const getCategoryBg = (category: NotificationItem['category']) => {
    switch (category) {
      case 'booking':
        return 'bg-[#FF6B2C]/10 text-[#FF6B2C]';
      case 'payment':
        return 'bg-[#2FA66A]/10 text-[#2FA66A]';
      case 'alert':
        return 'bg-[#E7A72F]/10 text-[#E7A72F]';
      case 'system':
      default:
        return 'bg-[#F1F0EC] text-[#171717]';
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
            className="w-9 h-9 -ml-1 rounded-xl flex items-center justify-center text-[#171717] hover:bg-[#E8E6E1]/50 active-press transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.4]" />
          </button>
          <div>
            <h1 className="text-[17px] font-extrabold text-[#171717] tracking-tight leading-none">
              Notifications
            </h1>
            <span className="text-[11px] text-[#777570] mt-0.5 block">
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
            className="flex items-center gap-1 text-[11.5px] font-bold text-[#FF6B2C] bg-[#FF6B2C]/10 px-2.5 py-1.5 rounded-xl hover:bg-[#FF6B2C]/20 active-press cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 p-1 bg-[#F1F0EC] rounded-2xl">
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
                ? 'bg-white text-[#171717] shadow-xs'
                : 'text-[#777570] hover:text-[#171717]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-[#E8E6E1] shadow-xs text-center space-y-2.5">
          <div className="w-12 h-12 rounded-2xl bg-[#F1F0EC] text-[#777570] flex items-center justify-center mx-auto">
            <Bell className="w-6 h-6 stroke-[1.8]" />
          </div>
          <h3 className="text-[14.5px] font-bold text-[#171717]">No notifications</h3>
          <p className="text-[12px] text-[#777570] max-w-xs mx-auto">
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
                  ? 'bg-white border-[#E8E6E1] shadow-xs opacity-90'
                  : 'bg-white border-[#FF6B2C]/40 shadow-sm ring-1 ring-[#FF6B2C]/20'
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
                        item.read ? 'text-[#171717]' : 'text-[#171717] font-extrabold'
                      }`}
                    >
                      {item.title}
                    </h3>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-[#FF6B2C] shrink-0" />
                    )}
                  </div>
                  <p className="text-[12px] text-[#777570] mt-0.5 leading-relaxed">
                    {item.message}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#F1F0EC]">
                    <span className="text-[10.5px] text-[#A3A099] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.time}
                    </span>

                    <div className="flex items-center gap-2">
                      {item.bookingId && (
                        <span className="text-[11px] font-bold text-[#FF6B2C] flex items-center gap-0.5">
                          View Details <ArrowRight className="w-3 h-3" />
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          haptics.tap();
                          deleteNotification(item.id);
                        }}
                        className="text-[#A3A099] hover:text-[#D94B4B] p-1 cursor-pointer"
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
          className="w-full py-2.5 rounded-2xl bg-[#F1F0EC] hover:bg-[#E8E6E1] text-[#171717] font-bold text-[12.5px] flex items-center justify-center gap-1.5 active-press transition-colors cursor-pointer"
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Manage Alert Preferences</span>
        </button>
      </div>
    </div>
  );
};
