export type ScreenType =
  | 'splash'
  | 'login'
  | 'otp'
  | 'home'
  | 'bookings'
  | 'booking_details'
  | 'slots'
  | 'payments'
  | 'settings'
  | 'courts'
  | 'operating_hours'
  | 'booking_settings'
  | 'payment_settings'
  | 'amenities'
  | 'cancellation_settings'
  | 'staff_management'
  | 'notification_settings'
  | 'notifications'
  | 'help_support'
  | 'support_form'
  | 'export_report'
  | 'add_court'
  | 'privacy_policy'
  | 'terms_conditions';

export type BottomNavTab = 'home' | 'bookings' | 'slots' | 'payments' | 'settings';

export type BookingStatus = 'Confirmed' | 'Payment Pending' | 'Partially Paid' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Paid' | 'Partially Paid' | 'Pending';

export interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  courtId: string;
  courtName: string;
  sport: 'Football' | 'Cricket' | 'Badminton' | 'Pickleball';
  date: string; // e.g. "28 Aug 2026"
  timeSlot: string; // e.g. "7:00–8:00 PM"
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: 'UPI' | 'Cash' | 'Online Link' | 'Card';
  createdAt: string;
  notes?: string;
  holdExpiresInMinutes?: number;
}

export type CourtStatus = 'Approved' | 'Pending Approval' | 'Rejected';

export interface Court {
  id: string;
  name: string;
  displayName?: string;
  samePhysicalSports?: boolean;
  sports: string[];
  pricePerHour: number;
  minBookingDuration?: string;
  peakHoursStart?: string;
  peakHoursEnd?: string;
  peakDays?: string[];
  peakHoursPrice?: number;
  weekendPrice?: number;
  status: CourtStatus;
  statusDetails?: string;
  operatingHours: string;
  type?: 'Outdoor' | 'Indoor' | 'Covered';
}

export type SlotState = 'available' | 'booked' | 'coaching' | 'tournament' | 'maintenance' | 'pending';

export interface Slot {
  id: string;
  courtId: string;
  courtName: string;
  sport: string;
  time: string; // "6–7 AM"
  timeFull: string; // "06:00 AM – 07:00 AM"
  state: SlotState;
  bookingId?: string;
  customerName?: string;
  customerPhone?: string;
  price: number;
  paidAmount?: number;
  reason?: string;
  countdown?: string;
  notes?: string;
}

export interface PaymentRecord {
  id: string;
  bookingId: string;
  customerName: string;
  customerPhone: string;
  courtName: string;
  timeSlot: string;
  date: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: 'Paid' | 'Partial' | 'Pending';
  method?: string;
  timestamp: string;
}

export interface SettlementRecord {
  id: string;
  utrNumber: string;
  settledAmount: number;
  grossAmount: number;
  feeDeductions: number;
  date: string;
  time: string;
  bankName: string;
  accountMasked: string;
  status: 'Settled' | 'Processing' | 'Pending' | 'Failed';
  period: string;
  payoutMode: 'Instant IMPS' | 'Automated Daily NEFT';
}

export interface OperatingHourDay {
  day: string;
  shortDay: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface BookingSettingsConfig {
  advanceBookingDays: number;
  minDurationHours: number;
  maxDurationHours: number;
  minNoticeMinutes: number;
  sameDayBooking: boolean;
  recurringBooking: boolean;
  bookingExtension: boolean;
  enabledBookingTypes: {
    normal: boolean;
    coaching: boolean;
    tournament: boolean;
    membership: boolean;
    party: boolean;
    longTerm: boolean;
  };
}

export interface PaymentSettingsConfig {
  onlinePayment: boolean;
  cashPayment: boolean;
  bankName: string;
  accountNumberMasked: string;
  ifscCode: string;
  isVerified: boolean;
  payoutFrequency: 'Daily' | 'Weekly';
  upiId: string;
}

export interface AmenityItem {
  id: string;
  name: string;
  category: 'facilities' | 'equipment' | 'comfort' | 'safety';
  enabled: boolean;
  price: number; // 0 for included free, >0 for rental
  description: string;
  iconName: string;
}

export interface CancellationPolicyConfig {
  freeCancellationHours: number;
  refundPercentage: number;
  autoReleaseHoldMinutes: number;
  weatherRescheduleAllowed: boolean;
  refundToWalletDefault: boolean;
  allowCustomerSelfCancel: boolean;
  lateCancellationFeePercent: number;
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'Manager' | 'Cashier' | 'Groundkeeper' | 'Coach';
  phone: string;
  email: string;
  shift: string;
  permissions: {
    manageBookings: boolean;
    collectCash: boolean;
    blockSlots: boolean;
    viewFinances: boolean;
    editPricing: boolean;
  };
  status: 'Active' | 'On Leave' | 'Inactive';
}

export interface NotificationPreferencesConfig {
  whatsappBookingConfirmation: boolean;
  whatsappPaymentReminder: boolean;
  smsAlertsManager: boolean;
  pushNewBooking: boolean;
  pushHoldExpiry: boolean;
  pushDailySummary: boolean;
  emailSettlementReports: boolean;
  soundHapticsEnabled: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  category: 'booking' | 'payment' | 'alert' | 'system';
  read: boolean;
  bookingId?: string;
  amount?: number;
}

export type SupportCategory = 'Booking' | 'Payment' | 'Court' | 'Technical' | 'Other';

export interface SupportTicket {
  id: string;
  category: string;
  issue?: string;
  subject: string;
  description: string;
  bookingId?: string;
  status: 'In Progress' | 'Resolved' | 'Open';
  createdAt?: string;
  date?: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'warning' | 'info' | 'error';
}
