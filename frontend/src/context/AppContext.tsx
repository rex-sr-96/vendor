import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  BankDetails,
  LoggedInUser,
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
import { calculateBookingFinancials } from '../utils/feeCalculator';
import { haptics } from '../utils/haptics';

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

  // New Booking Prefill State
  bookingPrefill: {
    courtId?: string;
    courtName?: string;
    sport?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    totalPrice?: number;
  } | null;
  setBookingPrefill: (prefill: {
    courtId?: string;
    courtName?: string;
    sport?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    totalPrice?: number;
  } | null) => void;

  // Active Modals / Sheets
  activeModal:
    | null
    | 'payment_options'
    | 'qr_payment'
    | 'record_cash'
    | 'slot_details'
    | 'block_slot'
    | 'new_booking'
    | 'payment_link'
    | 'logout_confirm';
  setActiveModal: (
    modal:
      | null
      | 'payment_options'
      | 'qr_payment'
      | 'record_cash'
      | 'slot_details'
      | 'block_slot'
      | 'new_booking'
      | 'payment_link'
      | 'logout_confirm'
  ) => void;

  // Actions
  sendPaymentLink: (bookingId: string) => void;
  isPaymentLinkBlocked: (bookingId: string) => boolean;
  getPaymentLinkTimeRemaining: (bookingId: string) => number;
  recordCashPayment: (bookingId: string, amount: number) => void;
  completeBookingPayment: (bookingId: string) => void;
  markBookingCompleted: (bookingId: string) => void;
  checkInBooking: (bookingId: string) => void;
  checkOutBooking: (bookingId: string) => void;
  extendBookingSlot: (
    bookingId: string,
    additionalMinutes: number,
    additionalFee: number,
    newTimeSlot: string
  ) => void;
  confirmBookingPayment: (
    bookingId: string,
    paymentMethod?: 'Online' | 'UPI' | 'Cash' | 'Card',
    paymentType?: 'full' | 'advance'
  ) => void;
  relockAndResendLink: (bookingId: string, extensionMinutes?: number) => void;
  releaseExpiredSlot: (bookingId: string) => void;
  requestInstantSettlement: (amount?: number) => void;
  cancelBookingWithRefund: (bookingId: string, reason: string) => void;
  blockSlotAction: (
    courtId: string,
    courtName: string,
    time: string,
    reason: string,
    type: 'maintenance' | 'coaching' | 'tournament' | 'private' | 'owner_block',
    notes?: string,
    date?: string
  ) => void;
  unblockSlotAction: (slotId: string) => void;
  addNewCourt: (newCourt: Partial<Court>) => void;
  updateCourt: (courtId: string, updatedData: Partial<Court>) => void;
  addNewBooking: (newBooking: Partial<Booking>) => void;
  createNewBooking: (newBooking: Partial<Booking>) => void;
  createSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'status' | 'date'>) => void;
  addSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'status' | 'date'>) => void;
  updateBookingSettings: (settings: Partial<BookingSettingsConfig>) => void;
  updatePaymentSettings: (settings: Partial<PaymentSettingsConfig>) => void;
  toggleOperatingDay: (dayName: string) => void;
  updateOperatingDayHours: (dayName: string, openTime: string, closeTime: string) => void;
  updateOperatingHours: (hours: OperatingHourDay[]) => void;

  // Amenity Actions
  toggleAmenity: (id: string) => void;
  addAmenity: (item: Omit<AmenityItem, 'id'>) => void;

  // Cancellation Actions
  updateCancellationPolicy: (policy: Partial<CancellationPolicyConfig>) => void;

  // Staff Actions
  addStaffMember: (member: Omit<StaffMember, 'id'>) => void;
  updateStaffMember: (id: string, updatedData: Partial<StaffMember>) => void;
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
  isDesktop: boolean;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (val: boolean | ((prev: boolean) => boolean)) => void;
  toggleSidebar: () => void;

  // Auth / Venue setup simulation
  ownerName: string;
  venueName: string;
  venueAddress: string;
  venueCity: string;
  ownerPhone: string;
  ownerEmail: string;
  ownerPan: string;
  venuePincode: string;
  venueEstablished: string;
  venueDescription: string;
  venuePhotos: { id: string; url: string; label: string }[];
  addVenuePhoto: (photo: { url: string; label: string }) => void;
  removeVenuePhoto: (id: string) => void;
  setVenuePhotos: React.Dispatch<React.SetStateAction<{ id: string; url: string; label: string }[]>>;
  setVenueDetails: (details: {
    name?: string;
    address?: string;
    city?: string;
    phone?: string;
    venueName?: string;
    venueAddress?: string;
    venueCity?: string;
    ownerPhone?: string;
    ownerName?: string;
    ownerEmail?: string;
    ownerPan?: string;
    venuePincode?: string;
    venueEstablished?: string;
    venueDescription?: string;
  }) => void;

  // Onboarding Data Bridge & Bank Details
  bankDetails: BankDetails;
  updateBankDetails: (details: Partial<BankDetails>) => void;
  syncVendorProfileToBackend: (profileData?: any) => Promise<boolean>;
  syncBankChangeToBackend: (bankData: any) => Promise<boolean>;
  isLoadingOnboardingProfile: boolean;
  refreshFromOnboarding: (phone?: string) => Promise<void>;
  verificationId: string | null;
  setVerificationId: (id: string | null) => void;

  // Staff & Owner Authentication Control
  currentUser: LoggedInUser | null;
  setCurrentUser: (user: LoggedInUser | null) => void;
  checkPhoneAccess: (rawPhone: string) => {
    allowed: boolean;
    reason?: string;
    userType?: 'owner' | 'staff';
    staff?: StaffMember;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('splash');
  const [activeTab, setActiveTab] = useState<BottomNavTab>('home');
  const [screenHistory, setScreenHistory] = useState<ScreenType[]>(['splash']);
  const [isDesktop, setIsDesktop] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  React.useEffect(() => {
    const checkIsDesktop = () => {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);
      // On desktop, immediately skip splash screen and show login
      if (desktop) {
        setCurrentScreen((prev) => (prev === 'splash' ? 'login' : prev));
      }
    };
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  const [bookings, setBookings] = useState<Booking[]>(initialBookings);

  // Synchronize initial bookings to ensure Expired bookings are loaded into active state
  React.useEffect(() => {
    setBookings((prev) => {
      const hasExpired = prev.some((b) => b.status === 'Expired');
      if (!hasExpired) {
        const existingMap = new Map(prev.map((b) => [b.id, b]));
        initialBookings.forEach((ib) => {
          if (!existingMap.has(ib.id) || ib.status === 'Expired') {
            existingMap.set(ib.id, ib);
          }
        });
        return Array.from(existingMap.values());
      }
      return prev;
    });
  }, []);

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

  // Staff Members State with LocalStorage Persistence
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('turftown_staff_members');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn('Failed to parse stored staff members', e);
      }
    }
    return initialStaffMembers;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('turftown_staff_members', JSON.stringify(staffMembers));
      } catch (e) {
        console.warn('Failed to save staff members', e);
      }
    }
  }, [staffMembers]);

  // Logged-in Staff or Owner State
  const [currentUser, setCurrentUser] = useState<LoggedInUser | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('turftown_current_user');
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (e) {
        console.warn('Failed to parse current user session', e);
      }
    }
    return null;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if (currentUser) {
          localStorage.setItem('turftown_current_user', JSON.stringify(currentUser));
        } else {
          localStorage.removeItem('turftown_current_user');
        }
      } catch (e) {
        console.warn('Failed to save current user', e);
      }
    }
  }, [currentUser]);

  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferencesConfig>(initialNotificationPreferences);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>('BK10231');
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [bookingPrefill, setBookingPrefill] = useState<{
    courtId?: string;
    courtName?: string;
    sport?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    totalPrice?: number;
  } | null>(null);
  
  const [activeModal, setActiveModal] = useState<
    null | 'payment_options' | 'qr_payment' | 'record_cash' | 'slot_details' | 'block_slot' | 'new_booking' | 'payment_link' | 'logout_confirm'
  >(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(true);

  // Venue Info
  const [venueName, setVenueName] = useState<string>('Sky Sports Arena');
  const [venueAddress, setVenueAddress] = useState<string>('123 Avinashi Road, Peelamedu, Coimbatore');
  const [venueCity, setVenueCity] = useState<string>('Coimbatore, Tamil Nadu');
  const [ownerPhone, setOwnerPhone] = useState<string>('');
  const [ownerName, setOwnerName] = useState<string>('Karthik Rajan');
  const [ownerEmail, setOwnerEmail] = useState<string>('partner@ibooksports.com');
  const [ownerPan, setOwnerPan] = useState<string>('33ABCDE1234F1Z5');
  const [venuePincode, setVenuePincode] = useState<string>('641018');
  const [venueEstablished, setVenueEstablished] = useState<string>('2023');
  const [venueDescription, setVenueDescription] = useState<string>(
    'Premier FIFA-grade synthetic turf and BWF-standard badminton courts with locker rooms, LED floodlights, and player lounge.'
  );

  // Bank details state
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    bankName: 'HDFC Bank',
    accountHolder: 'Sky Sports Private Limited',
    accountNumber: '50200012345678',
    maskedNumber: '•••• •••• •••• 5678',
    ifsc: 'HDFC0001234',
    accountType: 'Current Commercial Account',
    payoutSchedule: 'T+0 Auto IMPS Midnight Direct Settlement',
    status: 'Verified & Active',
    branchName: 'Peelamedu',
  });

  const [isLoadingOnboardingProfile, setIsLoadingOnboardingProfile] = useState<boolean>(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);

  const [venuePhotos, setVenuePhotos] = useState<{ id: string; url: string; label: string }[]>([
    {
      id: 'p1',
      url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80',
      label: 'Main Pitch 1 (Floodlit)',
    },
    {
      id: 'p2',
      url: 'https://images.unsplash.com/photo-1529900240051-06c3960f15d8?auto=format&fit=crop&w=600&q=80',
      label: 'Covered AstroTurf 2',
    },
    {
      id: 'p3',
      url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&q=80',
      label: 'Badminton Court 1',
    },
    {
      id: 'p4',
      url: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=600&q=80',
      label: 'Pickleball Arena',
    },
    {
      id: 'p5',
      url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=600&q=80',
      label: 'Changing Rooms & Lockers',
    },
    {
      id: 'p6',
      url: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?auto=format&fit=crop&w=600&q=80',
      label: 'Arena Entrance & Parking',
    },
  ]);

  const addVenuePhoto = (photo: { url: string; label: string }) => {
    if (venuePhotos.length >= 8) {
      showToast('Maximum Reached', 'You can upload up to 8 photos maximum.', 'info');
      return;
    }
    const newId = `p${Date.now()}`;
    setVenuePhotos((prev) => [...prev, { id: newId, url: photo.url, label: photo.label }]);
    showToast('Photo Added', `${photo.label} added to venue gallery.`, 'success');
  };

  const removeVenuePhoto = (id: string) => {
    if (venuePhotos.length <= 4) {
      showToast('Minimum Required', 'Minimum 4 photos required for active verification.', 'warning');
      return;
    }
    setVenuePhotos((prev) => prev.filter((p) => p.id !== id));
    showToast('Photo Removed', 'Photo removed from gallery.', 'info');
  };

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
    // Staff access guard: silently redirect to home if attempting restricted screens
    const staffRestrictedScreens: ScreenType[] = ['staff_management', 'payment_settings'];
    if (currentUser?.type === 'staff' && staffRestrictedScreens.includes(screen)) {
      setScreenHistory((prev) => [...prev, 'home']);
      setCurrentScreen('home');
      setActiveTab('home');
      return;
    }

    setScreenHistory((prev) => [...prev, screen]);
    setCurrentScreen(screen);

    // Map screen to bottom navigation tab if applicable
    if (screen === 'home') setActiveTab('home');
    else if (screen === 'bookings' || screen === 'booking_details') setActiveTab('bookings');
    else if (screen === 'slots') setActiveTab('slots');
    else if (screen === 'payments') setActiveTab('payments');
    else if (
      screen === 'settings' ||
      screen === 'venue_profile' ||
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

    // Check if already blocked within 15 mins
    if (booking.paymentLinkExpiresAt && booking.paymentLinkExpiresAt > Date.now()) {
      const remainingSec = Math.max(0, Math.floor((booking.paymentLinkExpiresAt - Date.now()) / 1000));
      const m = Math.floor(remainingSec / 60);
      const s = remainingSec % 60;
      showToast(
        'Payment Link Active',
        `Payment link already sent. Valid for ${m}:${s < 10 ? '0' : ''}${s} more mins (button blocked).`,
        'info'
      );
      return;
    }

    const now = Date.now();
    const expiresAt = now + 15 * 60 * 1000; // 15 mins validity & block

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              paymentLinkSentAt: now,
              paymentLinkExpiresAt: expiresAt,
              holdExpiresInMinutes: 15,
            }
          : b
      )
    );

    setSlots((prev) =>
      prev.map((s) =>
        s.bookingId === bookingId
          ? {
              ...s,
              state: s.state === 'booked' ? 'booked' : 'locked',
              countdown: '15:00',
            }
          : s
      )
    );

    setSelectedBookingId(bookingId);
    // Do NOT open payment link modal - only close modal and show success toast
    setActiveModal(null);

    showToast(
      'Payment Link Sent Successfully',
      'Payment link sent successfully! It is valid for 15 mins.',
      'success'
    );
    haptics.success();
  };

  const isPaymentLinkBlocked = (bookingId: string): boolean => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking || !booking.paymentLinkExpiresAt) return false;
    return booking.paymentLinkExpiresAt > Date.now();
  };

  const getPaymentLinkTimeRemaining = (bookingId: string): number => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking || !booking.paymentLinkExpiresAt) return 0;
    return Math.max(0, Math.floor((booking.paymentLinkExpiresAt - Date.now()) / 1000));
  };

  const recordCashPayment = (bookingId: string, amount: number) => {
    const fin = calculateBookingFinancials(amount);

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          const isSettled = amount >= (b.balanceAmount || b.totalAmount) || b.balanceAmount <= amount;
          const newPaid = isSettled ? b.totalAmount : Math.min(b.totalAmount, b.paidAmount + amount);
          const newBalance = Math.max(0, b.totalAmount - newPaid);
          return {
            ...b,
            paidAmount: newPaid,
            balanceAmount: newBalance,
            status: b.status === 'Ongoing' ? 'Ongoing' : (newBalance === 0 ? 'Confirmed' : 'Partially Paid'),
            paymentStatus: newBalance === 0 ? 'Paid' : 'Partially Paid',
            paymentMethod: 'Cash',
            notes: `Paid in Cash · ₹${fin.totalConvenienceWithGst} platform fee (5% + 18% GST) to be deducted on next settlement`,
          };
        }
        return b;
      })
    );

    setSlots((prev) =>
      prev.map((s) => {
        if (s.bookingId === bookingId) {
          return { ...s, paidAmount: s.price };
        }
        return s;
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
      'Cash Payment Logged',
      `₹${amount.toLocaleString('en-IN')} received in cash. Note: ₹${fin.totalConvenienceWithGst} convenience fee (5% + 18% GST) will be deducted from your next bank payout.`,
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
            status: b.status === 'Ongoing' ? 'Ongoing' : 'Confirmed',
            paymentStatus: 'Paid',
            paymentMethod: 'Online',
          };
        }
        return b;
      })
    );

    setSlots((prev) =>
      prev.map((s) => (s.bookingId === bookingId ? { ...s, state: 'booked', paidAmount: s.price } : s))
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
      method: 'Online (Razorpay)',
      timestamp: 'Just now',
    };
    setPayments((prev) => [newPaymentRecord, ...prev]);

    showToast('Payment Successful', `₹${remaining.toLocaleString('en-IN')} received online for ${booking.customerName}.`, 'success');
  };

  const markBookingCompleted = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'Completed' } : b))
    );
    showToast('Booking Completed', `Booking ${bookingId} has been successfully completed and archived.`, 'success');
  };

  const checkInBooking = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'Ongoing' } : b))
    );
    setSlots((prev) =>
      prev.map((s) => (s.bookingId === bookingId ? { ...s, state: 'ongoing' } : s))
    );
    showToast(
      'Player Checked In',
      `${booking.customerName} checked in on ${booking.courtName}. Match is now ONGOING. Check-Out is now enabled.`,
      'success'
    );
  };

  const checkOutBooking = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    if (booking.balanceAmount > 0) {
      showToast(
        'Outstanding Balance Due',
        `Collect balance of ₹${booking.balanceAmount.toLocaleString('en-IN')} before completing check-out.`,
        'warning'
      );
      setSelectedBookingId(bookingId);
      setActiveModal('payment_options');
      return;
    }

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'Completed' } : b))
    );
    setSlots((prev) =>
      prev.filter((s) => s.bookingId !== bookingId)
    );
    showToast(
      'Session Checked Out',
      `Match for ${booking.customerName} completed & court slot closed.`,
      'success'
    );
  };

  const extendBookingSlot = (
    bookingId: string,
    additionalMinutes: number,
    additionalFee: number,
    newTimeSlot: string
  ) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          const newTotal = b.totalAmount + additionalFee;
          const newBalance = b.balanceAmount + additionalFee;
          return {
            ...b,
            timeSlot: newTimeSlot,
            totalAmount: newTotal,
            balanceAmount: newBalance,
            paymentStatus: newBalance === 0 ? 'Paid' : 'Partially Paid',
          };
        }
        return b;
      })
    );

    setSlots((prev) =>
      prev.map((s) =>
        s.bookingId === bookingId
          ? { ...s, timeFull: newTimeSlot, price: s.price + additionalFee }
          : s
      )
    );

    showToast(
      'Slot Extended Successfully',
      `Extended by ${additionalMinutes} mins (+₹${additionalFee.toLocaleString('en-IN')}). New slot: ${newTimeSlot}. Added to pending balance.`,
      'success'
    );
  };

  const confirmBookingPayment = (
    bookingId: string,
    paymentMethod: 'Online' | 'UPI' | 'Cash' | 'Card' = 'Online',
    paymentType: 'full' | 'advance' = 'full'
  ) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const total = booking.totalAmount;
    const isAdvance = paymentType === 'advance';
    const paid = isAdvance ? Math.round(total * 0.5) : total;
    const balance = Math.max(0, total - paid);

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'Confirmed',
              paymentStatus: balance === 0 ? 'Paid' : 'Partially Paid',
              paidAmount: paid,
              balanceAmount: balance,
              paymentMethod,
              holdExpiresInMinutes: 0,
              notes: isAdvance
                ? `Customer paid ₹${paid} Advance via online payment link · ₹${balance} due at venue`
                : `Customer paid Full ₹${paid} via online payment link`,
            }
          : b
      )
    );

    setSlots((prev) =>
      prev.map((s) => (s.bookingId === bookingId ? { ...s, state: 'booked', paidAmount: paid } : s))
    );

    const newPaymentRecord: PaymentRecord = {
      id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
      bookingId: booking.id,
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      courtName: booking.courtName,
      timeSlot: booking.timeSlot,
      date: booking.date,
      totalAmount: total,
      paidAmount: paid,
      balance,
      status: balance === 0 ? 'Paid' : 'Partial',
      method: paymentMethod === 'Cash' ? 'Cash' : 'Online (Razorpay)',
      timestamp: 'Just now',
    };
    setPayments((prev) => [newPaymentRecord, ...prev]);

    showToast(
      'Booking Confirmed!',
      isAdvance
        ? `₹${paid.toLocaleString('en-IN')} (50% Advance) received from ${booking.customerName}. Booking Confirmed! ₹${balance.toLocaleString('en-IN')} due at venue.`
        : `Full ₹${paid.toLocaleString('en-IN')} received from ${booking.customerName}. Booking Confirmed! Ready for player check-in.`,
      'success'
    );
  };

  const relockAndResendLink = (bookingId: string, holdMinutes: number = 15) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const now = Date.now();
    const expiresAt = now + holdMinutes * 60 * 1000;

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'Payment Pending',
              holdExpiresInMinutes: holdMinutes,
              paymentLinkSentAt: now,
              paymentLinkExpiresAt: expiresAt,
              notes: `Slot re-locked with ${holdMinutes}m fresh payment link`,
            }
          : b
      )
    );

    setSlots((prev) =>
      prev.map((s) =>
        s.bookingId === bookingId
          ? {
              ...s,
              state: 'locked',
              countdown: `${holdMinutes}:00`,
            }
          : s
      )
    );

    setSelectedBookingId(bookingId);
    setActiveModal(null);

    showToast(
      'Payment Link Sent Successfully',
      `Payment link sent successfully! It is valid for ${holdMinutes} mins.`,
      'success'
    );
    haptics.success();
  };

  const releaseExpiredSlot = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'Cancelled',
            }
          : b
      )
    );

    showToast(
      'Expired Slot Released',
      `Slot for ${booking.courtName} (${booking.timeSlot}) is now available for new bookings.`,
      'info'
    );
  };

  const cancelBookingWithRefund = (bookingId: string, reason: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    // Find the court to get cancellation policy
    const court = courts.find((c) => c.id === booking.courtId);
    const refundPct = court?.refundPercentage ?? 100;
    const refundAmount = Math.round((booking.paidAmount * refundPct) / 100);
    const isEligible = refundAmount > 0;
    const cancelledAt = '28 Aug 2026, ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    // 1. Update booking status
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'Cancelled' as const,
              cancellationReason: reason,
              cancelledAt,
              refundAmount,
              refundStatus: isEligible ? ('Processed' as const) : ('Not Eligible' as const),
            }
          : b
      )
    );

    // 2. If a refund is due, add a refund entry to the settlement audit
    if (isEligible) {
      const refundSettlement: SettlementRecord = {
        id: `REF-${Date.now()}`,
        utrNumber: `RFND${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        settledAmount: -refundAmount,
        grossAmount: -refundAmount,
        feeDeductions: 0,
        date: '28 Aug 2026',
        time: 'Just now',
        bankName: 'Customer Source Account',
        accountMasked: 'Razorpay Auto-Refund',
        status: 'Refunded',
        period: 'Customer Cancellation Refund',
        payoutMode: 'Refund Debit',
        type: 'refund_debit',
        refundNote: `Refund for #${bookingId} – ${booking.customerName}. Reason: ${reason || 'Customer cancelled'}`,
        bookingId,
      };
      setSettlements((prev) => [refundSettlement, ...prev]);

      // 3. Push notification
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: 'Booking Cancelled · Refund Processed',
        message: `${booking.customerName} cancelled #${bookingId} (${booking.timeSlot}, ${booking.date}). ₹${refundAmount.toLocaleString('en-IN')} refund issued to customer source.`,
        time: 'Just now',
        category: 'payment',
        read: false,
        amount: refundAmount,
        bookingId,
      };
      setNotifications((prev) => [newNotif, ...prev]);

      showToast(
        'Booking Cancelled & Refund Issued',
        `₹${refundAmount.toLocaleString('en-IN')} refunded to ${booking.customerName}. Reason: "${reason || 'Customer cancelled'}".`,
        'success'
      );
    } else {
      // No refund (no advance was paid or outside policy)
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: 'Booking Cancelled',
        message: `${booking.customerName} cancelled #${bookingId} (${booking.timeSlot}, ${booking.date}). No refund applicable – no advance paid.`,
        time: 'Just now',
        category: 'booking',
        read: false,
        bookingId,
      };
      setNotifications((prev) => [newNotif, ...prev]);

      showToast(
        'Booking Cancelled',
        `${booking.customerName}'s booking cancelled. Reason: "${reason || 'Customer cancelled'}". No refund applicable.`,
        'info'
      );
    }
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
    notes?: string,
    date?: string
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
      date: date || '28 Aug 2026',
      state: stateMap[type] || 'maintenance',
      reason,
      price: 1000,
      notes: notes || `Blocked for ${type}`,
    };

    setSlots((prev) => [newSlot, ...prev.filter((s) => !(s.courtId === courtId && s.time === time && (!date || s.date === date)))]);
    showToast('Slot Blocked', `${courtName} blocked for ${reason}.`, 'success');
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
      parentCourtId: newCourt.parentCourtId,
      parentCourtName: newCourt.parentCourtName,
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
      cancellationWindowHours: newCourt.cancellationWindowHours ?? 12,
      refundPercentage: newCourt.refundPercentage ?? 100,
      cancellationPolicyLabel: newCourt.cancellationPolicyLabel,
    };
    setCourts((prev) => [...prev, court]);
    showToast('Court Added', `${court.name} created and submitted for verification.`, 'success');
  };

  const updateCourt = (courtId: string, updatedData: Partial<Court>) => {
    setCourts((prev) =>
      prev.map((c) => (c.id === courtId ? { ...c, ...updatedData } : c))
    );
    showToast('Court Updated', 'Court details and pricing rules have been updated.', 'success');
  };

  const addNewBooking = (newBooking: Partial<Booking>) => {
    const total = newBooking.totalAmount || 1200;
    const paid = newBooking.paidAmount !== undefined ? newBooking.paidAmount : total;
    const balance = Math.max(0, total - paid);
    const bookingId = `BK${Math.floor(10240 + Math.random() * 100)}`;
    const isFullyPaid = balance === 0;

    const booking: Booking = {
      id: bookingId,
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
      status: isFullyPaid ? 'Confirmed' : paid > 0 ? 'Partially Paid' : 'Payment Pending',
      paymentStatus: isFullyPaid ? 'Paid' : paid > 0 ? 'Partially Paid' : 'Pending',
      paymentMethod: newBooking.paymentMethod || (isFullyPaid ? 'Online' : 'Cash'),
      createdAt: 'Just now',
      notes: newBooking.notes || `Booking created · ₹${paid} paid, ₹${balance} due`,
      holdExpiresInMinutes: isFullyPaid ? 0 : 30,
      reservationType: 'direct_booking',
    };

    setBookings((prev) => [booking, ...prev]);

    // Update slot on matrix
    setSlots((prev) => [
      {
        id: `slot-new-${Date.now()}`,
        courtId: booking.courtId,
        courtName: booking.courtName,
        sport: booking.sport,
        time: booking.timeSlot.split('–')[0].trim(),
        timeFull: booking.timeSlot,
        state: isFullyPaid ? 'booked' : paid > 0 ? 'booked' : 'locked',
        bookingId: booking.id,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        price: booking.totalAmount,
        paidAmount: booking.paidAmount,
      },
      ...prev,
    ]);

    if (paid > 0) {
      const newPaymentRecord: PaymentRecord = {
        id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
        bookingId: booking.id,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        courtName: booking.courtName,
        timeSlot: booking.timeSlot,
        date: booking.date,
        totalAmount: booking.totalAmount,
        paidAmount: paid,
        balance: balance,
        status: isFullyPaid ? 'Paid' : 'Partial',
        method: booking.paymentMethod || 'Online',
        timestamp: 'Just now',
      };
      setPayments((prev) => [newPaymentRecord, ...prev]);
    }

    setActiveModal(null);
    showToast(
      'Booking Confirmed',
      `Booking #${booking.id} created for ${booking.customerName} (₹${paid} paid, ₹${balance} due).`,
      'success'
    );
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

  const updateOperatingDayHours = (dayName: string, openTime: string, closeTime: string) => {
    setOperatingHours((prev) =>
      prev.map((d) => (d.day === dayName ? { ...d, openTime, closeTime } : d))
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
    const raw = member.phone || '';
    const cleanDigits = raw.replace(/\D/g, '').slice(-10);
    const formattedPhone = cleanDigits.length === 10
      ? `+91 ${cleanDigits.slice(0, 5)} ${cleanDigits.slice(5)}`
      : raw.trim();

    const newStaff: StaffMember = {
      ...member,
      phone: formattedPhone,
      id: `st-${Date.now()}`,
    };
    setStaffMembers((prev) => [...prev, newStaff]);
    showToast('Staff Added', `${newStaff.name} added as ${newStaff.role}.`, 'success');
  };

  const updateStaffMember = (id: string, updatedData: Partial<StaffMember>) => {
    let formattedPhone = updatedData.phone;
    if (updatedData.phone) {
      const cleanDigits = updatedData.phone.replace(/\D/g, '').slice(-10);
      if (cleanDigits.length === 10) {
        formattedPhone = `+91 ${cleanDigits.slice(0, 5)} ${cleanDigits.slice(5)}`;
      }
    }

    setStaffMembers((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              ...updatedData,
              ...(formattedPhone ? { phone: formattedPhone } : {}),
            }
          : s
      )
    );
    showToast('Staff Updated', 'Staff role & details updated successfully.', 'success');
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

  // Staff & Owner Access Verification Gate
  const checkPhoneAccess = (rawPhone: string) => {
    const clean = (rawPhone || '').replace(/\D/g, '').slice(-10);
    if (!clean || clean.length < 10) {
      return { allowed: false, reason: 'Please enter a valid 10-digit mobile number.' };
    }

    // 1. Check if matches the actual backend ownerPhone — always owner
    const currentOwnerClean = (ownerPhone || '').replace(/\D/g, '').slice(-10);
    if (currentOwnerClean && clean === currentOwnerClean) {
      return { allowed: true, userType: 'owner' as const };
    }

    // 2. Check staff list — staff takes priority over hardcoded fallback numbers
    const matchedStaff = staffMembers.find((s) => {
      const staffClean = (s.phone || '').replace(/\D/g, '').slice(-10);
      return staffClean === clean;
    });

    if (matchedStaff) {
      if (matchedStaff.status === 'Inactive') {
        return {
          allowed: false,
          reason: `Access restricted. Staff account for ${matchedStaff.name} is currently inactive. Please contact the arena owner.`,
        };
      }
      return {
        allowed: true,
        userType: 'staff' as const,
        staff: matchedStaff,
      };
    }

    // 3. Fallback hardcoded owner numbers (demo / second owner)
    const fallbackOwnerNumbers = ['6369591821', '9876543210'];
    if (fallbackOwnerNumbers.includes(clean)) {
      return { allowed: true, userType: 'owner' as const };
    }

    return {
      allowed: false,
      reason:
        'Access restricted. This mobile number is not registered as an arena owner or authorized staff member. Please contact your venue administrator.',
    };
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

  const updateOperatingHours = (hours: OperatingHourDay[]) => {
    setOperatingHours(hours);
  };

  const setVenueDetails = (details: {
    name?: string;
    address?: string;
    city?: string;
    phone?: string;
    venueName?: string;
    venueAddress?: string;
    venueCity?: string;
    ownerPhone?: string;
    ownerName?: string;
    ownerEmail?: string;
    ownerPan?: string;
    venuePincode?: string;
    venueEstablished?: string;
    venueDescription?: string;
  }) => {
    if (details.name || details.venueName) setVenueName(details.venueName || details.name || '');
    if (details.address || details.venueAddress) setVenueAddress(details.venueAddress || details.address || '');
    if (details.phone || details.ownerPhone) {
      const raw = details.ownerPhone || details.phone || '';
      const clean = raw.replace(/\D/g, '').slice(-10);
      setOwnerPhone(clean || raw);
    }
    if (details.ownerEmail) setOwnerEmail(details.ownerEmail);
    if (details.ownerPan) setOwnerPan(details.ownerPan);
    if (details.venuePincode) setVenuePincode(details.venuePincode);
    if (details.venueEstablished) setVenueEstablished(details.venueEstablished);
    if (details.venueDescription) setVenueDescription(details.venueDescription);
  };

  const updateBankDetails = (details: Partial<BankDetails>) => {
    setBankDetails((prev) => ({
      ...prev,
      ...details,
      maskedNumber: details.accountNumber
        ? `•••• •••• •••• ${details.accountNumber.slice(-4)}`
        : prev.maskedNumber,
    }));
  };

  const fetchOnboardingProfile = async (phoneToQuery?: string) => {
    try {
      setIsLoadingOnboardingProfile(true);
      const queryPhone = phoneToQuery || ownerPhone || '9876543210';
      const cleanPhone = queryPhone.replace(/\D/g, '').slice(-10);
      const res = await fetch(
        `http://localhost:4000/api/v1/onboarding/vendor/profile?mobile=${cleanPhone || '9876543210'}`
      );
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.success) {
        if (data.owner) {
          if (data.owner.name) setOwnerName(data.owner.name);
          if (data.owner.mobile) setOwnerPhone(`+91 ${data.owner.mobile}`);
          if (data.owner.email) setOwnerEmail(data.owner.email);
          if (data.owner.pan) setOwnerPan(data.owner.pan);
          if (data.owner.pincode) setVenuePincode(data.owner.pincode);
        }
        if (data.venue) {
          if (data.venue.name) setVenueName(data.venue.name);
          if (data.venue.address) setVenueAddress(data.venue.address);
          if (data.venue.city) setVenueCity(data.venue.city);
          if (data.venue.pincode) setVenuePincode(data.venue.pincode);
          if (data.venue.gst_number && !data.owner?.pan) setOwnerPan(data.venue.gst_number);
        }
        if (data.bank) {
          const accNum = data.bank.account_number || '50200012345678';
          setBankDetails({
            bankName: data.bank.bank_name || 'HDFC Bank',
            accountHolder: data.bank.account_holder_name || data.owner?.name || 'Sky Sports Private Limited',
            accountNumber: accNum,
            maskedNumber: accNum ? `•••• •••• •••• ${accNum.slice(-4)}` : '•••• •••• •••• 5678',
            ifsc: data.bank.ifsc_code || 'HDFC0001234',
            accountType: data.bank.account_type
              ? `${data.bank.account_type} Commercial Account`
              : 'Current Commercial Account',
            payoutSchedule: 'T+0 Auto IMPS Midnight Direct Settlement',
            status: 'Verified & Active',
            branchName: data.bank.branch_name || 'Peelamedu',
          });
        }
        if (data.court_photos && Array.isArray(data.court_photos) && data.court_photos.length > 0) {
          setVenuePhotos(
            data.court_photos.map((id: string, idx: number) => ({
              id: id,
              url:
                id.startsWith('http') || id.startsWith('/')
                  ? id
                  : `http://localhost:4000/api/v1/onboarding/documents/${id}/view`,
              label: `Verified Court Photo ${idx + 1}`,
            }))
          );
        }
      }

      // Fetch Admin-defined standard amenities (strictly show only admin amenities)
      try {
        const amnRes = await fetch('http://localhost:4000/api/v1/sports/amenities');
        if (amnRes.ok) {
          const adminAmns = await amnRes.json();
          if (Array.isArray(adminAmns) && adminAmns.length > 0) {
            setAmenities((prev) => {
              return adminAmns.map((a: any) => {
                const existing = prev.find(
                  (p) => p.id === a.amenity_id || p.name.toLowerCase() === a.name.toLowerCase()
                );
                return {
                  id: a.amenity_id,
                  name: a.name,
                  category: a.category || 'Facility',
                  enabled: existing ? existing.enabled : true,
                  price: existing ? existing.price || 0 : a.amenity_id === 'AMN_GEAR' ? 100 : 0,
                  description: existing?.description || `Standard venue amenity: ${a.name}`,
                  iconName: a.icon || 'Sparkles',
                  icon: a.icon || 'Sparkles',
                  details: existing?.details || `${a.category || 'Facility'} standard amenity`,
                };
              });
            });
          }
        }
      } catch (e) {
        // Fallback to initialAmenities
      }
    } catch (err) {
      console.warn('Could not auto-fetch onboarding profile from backend:', err);
    } finally {
      setIsLoadingOnboardingProfile(false);
    }
  };

  useEffect(() => {
    fetchOnboardingProfile();
  }, []);

  const syncVendorProfileToBackend = async (profileData?: any): Promise<boolean> => {
    try {
      const cleanPhone = (ownerPhone || '9876543210').replace(/\D/g, '').slice(-10);
      const payload = profileData || {
        owner: {
          name: ownerName,
          mobile: cleanPhone,
          email: ownerEmail,
          pan: ownerPan,
          address: venueAddress,
          pincode: venuePincode,
        },
        venue: {
          name: venueName,
          address: venueAddress,
          city: venueCity,
          pincode: venuePincode,
          gst_number: ownerPan,
        },
        bank: {
          bank_name: bankDetails.bankName,
          account_holder_name: bankDetails.accountHolder,
          account_number: bankDetails.accountNumber,
          ifsc_code: bankDetails.ifsc,
          branch_name: bankDetails.branchName,
          account_type: bankDetails.accountType.replace(/ commercial account/i, '').trim(),
        },
      };

      const res = await fetch(
        `http://localhost:4000/api/v1/onboarding/vendor/profile?mobile=${cleanPhone || '9876543210'}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );
      return res.ok;
    } catch (err) {
      console.error('Error syncing vendor profile to onboarding:', err);
      return false;
    }
  };

  const syncBankChangeToBackend = async (bankData: any): Promise<boolean> => {
    try {
      const cleanPhone = (ownerPhone || '9876543210').replace(/\D/g, '').slice(-10);
      const payload = {
        bank: {
          bank_name: bankData.bankName,
          account_holder_name: bankData.accountHolder || ownerName,
          account_number: bankData.accountNumber,
          ifsc_code: bankData.ifsc,
          branch_name: bankData.branchName || 'Main Branch',
          account_type: bankData.accountType || 'CURRENT',
        },
      };

      const res = await fetch(
        `http://localhost:4000/api/v1/onboarding/vendor/profile?mobile=${cleanPhone || '9876543210'}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );
      if (res.ok) {
        setBankDetails((prev) => ({
          ...prev,
          bankName: bankData.bankName,
          accountNumber: bankData.accountNumber,
          maskedNumber: `•••• •••• •••• ${bankData.accountNumber.slice(-4)}`,
          ifsc: bankData.ifsc,
          accountType: bankData.accountType ? `${bankData.accountType} Commercial Account` : prev.accountType,
        }));
      }
      return res.ok;
    } catch (err) {
      console.error('Error submitting bank change to backend:', err);
      return false;
    }
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
        bookingPrefill,
        setBookingPrefill,
        activeModal,
        setActiveModal,
        sendPaymentLink,
        isPaymentLinkBlocked,
        getPaymentLinkTimeRemaining,
        recordCashPayment,
        completeBookingPayment,
        markBookingCompleted,
        checkInBooking,
        checkOutBooking,
        extendBookingSlot,
        relockAndResendLink,
        confirmBookingPayment,
        releaseExpiredSlot,
        requestInstantSettlement,
        cancelBookingWithRefund,
        blockSlotAction,
        unblockSlotAction,
        addNewCourt,
        updateCourt,
        addNewBooking,
        createNewBooking: addNewBooking,
        createSupportTicket,
        addSupportTicket: createSupportTicket,
        updateBookingSettings,
        updatePaymentSettings,
        toggleOperatingDay,
        updateOperatingDayHours,
        updateOperatingHours,
        toggleAmenity,
        addAmenity,
        updateCancellationPolicy,
        addStaffMember,
        updateStaffMember,
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
        isDesktop,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar,
        ownerName,
        venueName,
        venueAddress,
        venueCity,
        ownerPhone,
        ownerEmail,
        ownerPan,
        venuePincode,
        venueEstablished,
        venueDescription,
        venuePhotos,
        addVenuePhoto,
        removeVenuePhoto,
        setVenuePhotos,
        setVenueDetails,
        bankDetails,
        updateBankDetails,
        syncVendorProfileToBackend,
        syncBankChangeToBackend,
        isLoadingOnboardingProfile,
        refreshFromOnboarding: fetchOnboardingProfile,
        verificationId,
        setVerificationId,
        currentUser,
        setCurrentUser,
        checkPhoneAccess,
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
