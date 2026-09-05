import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  ScreenType,
  BottomNavTab,
  Booking,
  Court,
  Slot,
  PaymentRecord,
  SettlementRecord,
  OperatingHourDay,
  BookingSettingsConfig,
  PaymentSettingsConfig,
  SupportTicket,
  ToastMessage,
  AmenityItem,
  CancellationPolicyConfig,
  StaffMember,
  NotificationPreferencesConfig,
  NotificationItem,
} from '../types';
import {
  initialBookings,
  initialCourts,
  initialSlots,
  initialPaymentRecords,
  initialSettlements,
  initialOperatingHours,
  initialBookingSettings,
  initialPaymentSettings,
  initialSupportTickets,
  initialAmenities,
  initialCancellationPolicy,
  initialStaffMembers,
  initialNotificationPreferences,
  initialNotifications,
} from '../data/mockData';

interface AppContextType {
  // Navigation
  currentScreen: ScreenType;
  setCurrentScreen: (screen: ScreenType) => void;
  activeTab: BottomNavTab;
  setActiveTab: (tab: BottomNavTab) => void;
  navigateTo: (screen: ScreenType) => void;
  goBack: () => void;
  screenHistory: ScreenType[];

  // Entities & State
  bookings: Booking[];
  courts: Court[];
  slots: Slot[];
  payments: PaymentRecord[];
  settlements: SettlementRecord[];
  operatingHours: OperatingHourDay[];
  bookingSettings: BookingSettingsConfig;
  paymentSettings: PaymentSettingsConfig;
  supportTickets: SupportTicket[];
  amenities: AmenityItem[];
  cancellationPolicy: CancellationPolicyConfig;
  staffMembers: StaffMember[];
  notificationPreferences: NotificationPreferencesConfig;
  notifications: NotificationItem[];
  unreadNotifCount: number;

  // Selection
  selectedBookingId: string | null;
  setSelectedBookingId: (id: string | null) => void;
  selectedBooking: Booking | undefined;
  
  selectedSlotId: string | null;
  setSelectedSlotId: (id: string | null) => void;
  selectedSlot: Slot | undefined;

  // Active Modals / Sheets
  activeModal:
    | null
    | 'payment_options'
    | 'qr_payment'
    | 'record_cash'
    | 'slot_details'
    | 'block_slot'
    | 'new_booking';
  setActiveModal: (
    modal:
      | null
      | 'payment_options'
      | 'qr_payment'
      | 'record_cash'
      | 'slot_details'
      | 'block_slot'
      | 'new_booking'
  ) => void;

  // Actions
  sendPaymentLink: (bookingId: string) => void;
  recordCashPayment: (bookingId: string, amount: number) => void;
  completeBookingPayment: (bookingId: string) => void;
  markBookingCompleted: (bookingId: string) => void;
  requestInstantSettlement: (amount?: number) => void;
  blockSlotAction: (
    courtId: string,
    courtName: string,
    time: string,
    reason: string,
    type: 'maintenance' | 'coaching' | 'tournament' | 'private' | 'owner_block',
    notes?: string
  ) => void;
  unblockSlotAction: (slotId: string) => void;
  addNewCourt: (newCourt: Partial<Court>) => void;
  addNewBooking: (newBooking: Partial<Booking>) => void;
  createNewBooking: (newBooking: Partial<Booking>) => void;
  createSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'status' | 'date'>) => void;
  addSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'status' | 'date'>) => void;
  updateBookingSettings: (settings: Partial<BookingSettingsConfig>) => void;
  updatePaymentSettings: (settings: Partial<PaymentSettingsConfig>) => void;
  toggleOperatingDay: (dayName: string) => void;

  // Amenity Actions
  toggleAmenity: (id: string) => void;
  addAmenity: (item: Omit<AmenityItem, 'id'>) => void;

  // Cancellation Actions
  updateCancellationPolicy: (policy: Partial<CancellationPolicyConfig>) => void;

  // Staff Actions
  addStaffMember: (member: Omit<StaffMember, 'id'>) => void;
  toggleStaffStatus: (id: string) => void;
  updateStaffPermissions: (id: string, permKey: keyof StaffMember['permissions']) => void;

  // Notification actions
  updateNotificationPreferences: (prefs: Partial<NotificationPreferencesConfig>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;

  // Notification / Toast
  toasts: ToastMessage[];
  showToast: (title: string, description?: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
  dismissToast: (id: string) => void;

  // Frame layout switch
  isPhoneFrame: boolean;
  setIsPhoneFrame: (val: boolean | ((prev: boolean) => boolean)) => void;

  // Auth / Venue setup simulation
  ownerName: string;
  venueName: string;
  venueAddress: string;
  venueCity: string;
  ownerPhone: string;
  setVenueDetails: (details: { name: string; address: string; city: string; phone: string }) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('splash');
  const [activeTab, setActiveTab] = useState<BottomNavTab>('home');
  const [screenHistory, setScreenHistory] = useState<ScreenType[]>(['splash']);

  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [courts, setCourts] = useState<Court[]>(initialCourts);
  const [slots, setSlots] = useState<Slot[]>(initialSlots);
  const [payments, setPayments] = useState<PaymentRecord[]>(initialPaymentRecords);
  const [settlements, setSettlements] = useState<SettlementRecord[]>(initialSettlements);
  const [operatingHours, setOperatingHours] = useState<OperatingHourDay[]>(initialOperatingHours);
  const [bookingSettings, setBookingSettings] = useState<BookingSettingsConfig>(initialBookingSettings);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettingsConfig>(initialPaymentSettings);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(initialSupportTickets);
  const [amenities, setAmenities] = useState<AmenityItem[]>(initialAmenities);
  const [cancellationPolicy, setCancellationPolicy] = useState<CancellationPolicyConfig>(initialCancellationPolicy);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(initialStaffMembers);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferencesConfig>(initialNotificationPreferences);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>('BK10231');
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  
  const [activeModal, setActiveModal] = useState<
    null | 'payment_options' | 'qr_payment' | 'record_cash' | 'slot_details' | 'block_slot' | 'new_booking'
  >(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(true);

  // Venue Info
  const [venueName, setVenueName] = useState<string>('TurfTown Arena');
  const [venueAddress, setVenueAddress] = useState<string>('12/4 Outer Ring Road, Koramangala');
  const [venueCity, setVenueCity] = useState<string>('Bengaluru');
  const [ownerPhone, setOwnerPhone] = useState<string>('9876543210');
  const ownerName = 'Kavin S.';

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId);
  const selectedSlot = slots.find((s) => s.id === selectedSlotId);

  const showToast = (
    title: string,
    description?: string,
    type: 'success' | 'warning' | 'info' | 'error' = 'success'
  ) => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const navigateTo = (screen: ScreenType) => {
    setScreenHistory((prev) => [...prev, screen]);
    setCurrentScreen(screen);

    // Map screen to bottom navigation tab if applicable
    if (screen === 'home') setActiveTab('home');
    else if (screen === 'bookings' || screen === 'booking_details') setActiveTab('bookings');
    else if (screen === 'slots') setActiveTab('slots');
    else if (screen === 'payments') setActiveTab('payments');
    else if (
      screen === 'settings' ||
      screen === 'courts' ||
      screen === 'operating_hours' ||
      screen === 'booking_settings' ||
      screen === 'payment_settings' ||
      screen === 'amenities' ||
      screen === 'cancellation_settings' ||
      screen === 'staff_management' ||
      screen === 'notification_settings' ||
      screen === 'help_support' ||
      screen === 'support_form'
    ) {
      setActiveTab('settings');
    }
  };

  const goBack = () => {
    if (screenHistory.length > 1) {
      const newHistory = [...screenHistory];
      newHistory.pop();
      const prevScreen = newHistory[newHistory.length - 1];
      setScreenHistory(newHistory);
      setCurrentScreen(prevScreen);

      if (prevScreen === 'home') setActiveTab('home');
      else if (prevScreen === 'bookings') setActiveTab('bookings');
      else if (prevScreen === 'slots') setActiveTab('slots');
      else if (prevScreen === 'payments') setActiveTab('payments');
      else if (prevScreen === 'settings') setActiveTab('settings');
    } else {
      navigateTo('home');
    }
  };

  const sendPaymentLink = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    showToast(
      'Payment Link Sent',
      `Payment link for ₹${booking.balanceAmount.toLocaleString('en-IN')} sent to ${booking.customerName} (${booking.customerPhone}) via SMS & WhatsApp.`,
      'success'
    );
  };

  const recordCashPayment = (bookingId: string, amount: number) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          const newPaid = b.paidAmount + amount;
          const newBalance = Math.max(0, b.totalAmount - newPaid);
          return {
            ...b,
            paidAmount: newPaid,
            balanceAmount: newBalance,
            status: newBalance === 0 ? 'Confirmed' : 'Partially Paid',
            paymentStatus: newBalance === 0 ? 'Paid' : 'Partially Paid',
            paymentMethod: 'Cash',
          };
        }
        return b;
      })
    );

    const booking = bookings.find((b) => b.id === bookingId);
    if (booking) {
      const newPaymentRecord: PaymentRecord = {
        id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
        bookingId: booking.id,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        courtName: booking.courtName,
        timeSlot: booking.timeSlot,
        date: booking.date,
        totalAmount: booking.totalAmount,
        paidAmount: amount,
        balance: Math.max(0, booking.balanceAmount - amount),
        status: booking.balanceAmount - amount <= 0 ? 'Paid' : 'Partial',
        method: 'Cash',
        timestamp: 'Just now',
      };
      setPayments((prev) => [newPaymentRecord, ...prev]);
    }

    showToast(
      'Cash Payment Recorded',
      `₹${amount.toLocaleString('en-IN')} received in cash for ${booking?.customerName}.`,
      'success'
    );
    setActiveModal(null);
  };

  const completeBookingPayment = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const remaining = booking.balanceAmount;
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            paidAmount: b.totalAmount,
            balanceAmount: 0,
            status: 'Confirmed',
            paymentStatus: 'Paid',
            paymentMethod: 'UPI',
          };
        }
        return b;
      })
    );

    const newPaymentRecord: PaymentRecord = {
      id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
      bookingId: booking.id,
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      courtName: booking.courtName,
      timeSlot: booking.timeSlot,
      date: booking.date,
      totalAmount: booking.totalAmount,
      paidAmount: remaining,
      balance: 0,
      status: 'Paid',
      method: 'UPI Instant Scan',
      timestamp: 'Just now',
    };
    setPayments((prev) => [newPaymentRecord, ...prev]);

    showToast('Payment Successful', `₹${remaining.toLocaleString('en-IN')} received via UPI for ${booking.customerName}.`, 'success');
  };

  const markBookingCompleted = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'Completed' } : b))
    );
    showToast('Booking Completed', `Booking ${bookingId} has been successfully completed and archived.`, 'success');
  };

  const requestInstantSettlement = (amount: number = 12800) => {
    const newSettlement: SettlementRecord = {
      id: `SET-${Date.now()}`,
      utrNumber: `IMPS${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      settledAmount: amount,
      grossAmount: amount,
      feeDeductions: 0,
      date: '28 Aug 2026',
      time: 'Just now',
      bankName: paymentSettings.bankName,
      accountMasked: paymentSettings.accountNumberMasked,
      status: 'Settled',
      period: 'Instant On-Demand Payout',
      payoutMode: 'Instant IMPS',
    };

    setSettlements((prev) => [newSettlement, ...prev]);

    // Also add to notifications
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Instant Settlement Processed',
      message: `₹${amount.toLocaleString('en-IN')} successfully settled to ${paymentSettings.bankName} (${paymentSettings.accountNumberMasked}).`,
      time: 'Just now',
      category: 'payment',
      read: false,
      amount,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast(
      'Settlement Initiated',
      `₹${amount.toLocaleString('en-IN')} settled to ${paymentSettings.bankName} ${paymentSettings.accountNumberMasked} via Instant IMPS.`,
      'success'
    );
  };

  const blockSlotAction = (
    courtId: string,
    courtName: string,
    time: string,
    reason: string,
    type: 'maintenance' | 'coaching' | 'tournament' | 'private' | 'owner_block',
    notes?: string
  ) => {
    const stateMap: Record<string, Slot['state']> = {
      maintenance: 'maintenance',
      coaching: 'coaching',
      tournament: 'tournament',
      private: 'booked',
      owner_block: 'maintenance',
    };

    const newSlot: Slot = {
      id: `slot-custom-${Date.now()}`,
      courtId,
      courtName,
      sport: 'Football',
      time,
      timeFull: `${time} Slot`,
      state: stateMap[type] || 'maintenance',
      reason,
      price: 1000,
      notes: notes || `Blocked for ${type}`,
    };

    setSlots((prev) => [newSlot, ...prev.filter((s) => !(s.courtId === courtId && s.time === time))]);
    showToast('Slot Blocked', `${courtName} blocked at ${time} for ${reason}.`, 'success');
    setActiveModal(null);
  };

  const unblockSlotAction = (slotId: string) => {
    setSlots((prev) =>
      prev.map((s) =>
        s.id === slotId
          ? {
              ...s,
              state: 'available',
              customerName: undefined,
              customerPhone: undefined,
              reason: undefined,
              bookingId: undefined,
              notes: undefined,
            }
          : s
      )
    );
    showToast('Slot Unblocked', 'The slot is now open and available for bookings.', 'info');
    setActiveModal(null);
  };

  const addNewCourt = (newCourt: Partial<Court>) => {
    const court: Court = {
      id: `court-${Date.now()}`,
      name: newCourt.name || 'New Turf',
      displayName: newCourt.displayName || undefined,
      samePhysicalSports: newCourt.samePhysicalSports ?? false,
      sports: newCourt.sports && newCourt.sports.length > 0 ? newCourt.sports : ['Football'],
      pricePerHour: newCourt.pricePerHour || 1000,
      minBookingDuration: newCourt.minBookingDuration,
      peakHoursStart: newCourt.peakHoursStart,
      peakHoursEnd: newCourt.peakHoursEnd,
      peakDays: newCourt.peakDays,
      peakHoursPrice: newCourt.peakHoursPrice,
      weekendPrice: newCourt.weekendPrice,
      status: 'Pending Approval',
      statusDetails: 'Submitted just now · Under fast review',
      operatingHours: newCourt.operatingHours || '06:00 AM – 11:00 PM',
      type: newCourt.type || 'Outdoor',
    };
    setCourts((prev) => [...prev, court]);
    showToast('Court Added', `${court.name} created and submitted for verification.`, 'success');
  };

  const addNewBooking = (newBooking: Partial<Booking>) => {
    const total = newBooking.totalAmount || 1200;
    const paid = newBooking.paidAmount || 0;
    const balance = total - paid;
    const booking: Booking = {
      id: `BK${Math.floor(10240 + Math.random() * 100)}`,
      customerName: newBooking.customerName || 'Customer',
      customerPhone: newBooking.customerPhone || '+91 98765 00000',
      courtId: newBooking.courtId || 'court-1',
      courtName: newBooking.courtName || 'Turf 1',
      sport: (newBooking.sport as any) || 'Football',
      date: newBooking.date || '28 Aug 2026',
      timeSlot: newBooking.timeSlot || '8:00–9:00 PM',
      totalAmount: total,
      paidAmount: paid,
      balanceAmount: balance,
      status: balance === 0 ? 'Confirmed' : paid > 0 ? 'Partially Paid' : 'Payment Pending',
      paymentStatus: balance === 0 ? 'Paid' : paid > 0 ? 'Partially Paid' : 'Pending',
      createdAt: 'Just now',
      notes: newBooking.notes,
    };

    setBookings((prev) => [booking, ...prev]);

    // Also update slot
    setSlots((prev) => [
      {
        id: `slot-new-${Date.now()}`,
        courtId: booking.courtId,
        courtName: booking.courtName,
        sport: booking.sport,
        time: booking.timeSlot.split('–')[0].trim(),
        timeFull: booking.timeSlot,
        state: 'booked',
        bookingId: booking.id,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        price: booking.totalAmount,
        paidAmount: booking.paidAmount,
      },
      ...prev,
    ]);

    showToast('Booking Created', `Booking #${booking.id} confirmed for ${booking.customerName}.`, 'success');
    setActiveModal(null);
  };

  const createSupportTicket = (ticket: Omit<SupportTicket, 'id' | 'status' | 'date'>) => {
    const newTicket: SupportTicket = {
      ...ticket,
      id: `SUP${Math.floor(10235 + Math.random() * 50)}`,
      status: 'Open',
      date: '28 Aug 2026',
    };
    setSupportTickets((prev) => [newTicket, ...prev]);
    showToast('Support Ticket Created', `Ticket #${newTicket.id} submitted. Our venue manager team will reply shortly.`, 'success');
    navigateTo('help_support');
  };

  const updateBookingSettings = (settings: Partial<BookingSettingsConfig>) => {
    setBookingSettings((prev) => ({ ...prev, ...settings }));
    showToast('Settings Saved', 'Booking policies updated successfully.', 'success');
  };

  const updatePaymentSettings = (settings: Partial<PaymentSettingsConfig>) => {
    setPaymentSettings((prev) => ({ ...prev, ...settings }));
    showToast('Settings Saved', 'Payment preferences updated.', 'success');
  };

  const toggleOperatingDay = (dayName: string) => {
    setOperatingHours((prev) =>
      prev.map((d) => (d.day === dayName ? { ...d, isOpen: !d.isOpen } : d))
    );
  };

  const toggleAmenity = (id: string) => {
    setAmenities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const addAmenity = (item: Omit<AmenityItem, 'id'>) => {
    const newAmenity: AmenityItem = {
      ...item,
      id: `am-${Date.now()}`,
    };
    setAmenities((prev) => [...prev, newAmenity]);
    showToast('Amenity Added', `${newAmenity.name} added to venue profile.`, 'success');
  };

  const updateCancellationPolicy = (policy: Partial<CancellationPolicyConfig>) => {
    setCancellationPolicy((prev) => ({ ...prev, ...policy }));
    showToast('Policy Saved', 'Cancellation and refund rules updated.', 'success');
  };

  const addStaffMember = (member: Omit<StaffMember, 'id'>) => {
    const newStaff: StaffMember = {
      ...member,
      id: `st-${Date.now()}`,
    };
    setStaffMembers((prev) => [...prev, newStaff]);
    showToast('Staff Added', `${newStaff.name} added as ${newStaff.role}.`, 'success');
  };

  const toggleStaffStatus = (id: string) => {
    setStaffMembers((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextStatus = s.status === 'Active' ? 'Inactive' : 'Active';
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  const updateStaffPermissions = (id: string, permKey: keyof StaffMember['permissions']) => {
    setStaffMembers((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              permissions: {
                ...s.permissions,
                [permKey]: !s.permissions[permKey],
              },
            }
          : s
      )
    );
  };

  const updateNotificationPreferences = (prefs: Partial<NotificationPreferencesConfig>) => {
    setNotificationPreferences((prev) => ({ ...prev, ...prefs }));
    showToast('Alerts Updated', 'Notification preferences saved.', 'success');
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All Caught Up', 'Marked all notifications as read.', 'info');
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const setVenueDetails = (details: { name: string; address: string; city: string; phone: string }) => {
    setVenueName(details.name);
    setVenueAddress(details.address);
    setVenueCity(details.city);
    setOwnerPhone(details.phone);
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        activeTab,
        setActiveTab,
        navigateTo,
        goBack,
        screenHistory,
        bookings,
        courts,
        slots,
        payments,
        settlements,
        operatingHours,
        bookingSettings,
        paymentSettings,
        supportTickets,
        amenities,
        cancellationPolicy,
        staffMembers,
        notificationPreferences,
        notifications,
        unreadNotifCount,
        selectedBookingId,
        setSelectedBookingId,
        selectedBooking,
        selectedSlotId,
        setSelectedSlotId,
        selectedSlot,
        activeModal,
        setActiveModal,
        sendPaymentLink,
        recordCashPayment,
        completeBookingPayment,
        markBookingCompleted,
        requestInstantSettlement,
        blockSlotAction,
        unblockSlotAction,
        addNewCourt,
        addNewBooking,
        createNewBooking: addNewBooking,
        createSupportTicket,
        addSupportTicket: createSupportTicket,
        updateBookingSettings,
        updatePaymentSettings,
        toggleOperatingDay,
        toggleAmenity,
        addAmenity,
        updateCancellationPolicy,
        addStaffMember,
        toggleStaffStatus,
        updateStaffPermissions,
        updateNotificationPreferences,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        toasts,
        showToast,
        dismissToast,
        isPhoneFrame,
        setIsPhoneFrame,
        ownerName,
        venueName,
        venueAddress,
        venueCity,
        ownerPhone,
        setVenueDetails,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
