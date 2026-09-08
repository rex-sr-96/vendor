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
  | 'venue_profile'
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
  | 'help_faq'
  | 'support'
  | 'support_form'
  | 'export_report'
  | 'add_court'
  | 'privacy_policy'
  | 'terms_conditions';

export type BottomNavTab = 'home' | 'bookings' | 'slots' | 'payments' | 'settings';

export type BookingStatus = 'Confirmed' | 'Ongoing' | 'Payment Pending' | 'Partially Paid' | 'Completed' | 'Expired' | 'Cancelled';
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
  paymentMethod?: 'UPI' | 'Cash' | 'Online Link' | 'Card' | 'Online';
  createdAt: string;
  notes?: string;
  holdExpiresInMinutes?: number;
  reservationType?: 'direct_booking' | 'payment_link_request';
  paymentLinkSentAt?: number;        // Epoch ms when payment link was sent
  paymentLinkExpiresAt?: number;     // Epoch ms when 15-minute validity expires (button blocked)
  // Customer-initiated cancellation
  cancellationReason?: string;       // Reason customer gave when cancelling
  cancelledAt?: string;              // Timestamp of cancellation
  refundAmount?: number;             // Refund amount per policy (0 if not eligible)
  refundStatus?: 'Pending' | 'Processed' | 'Not Eligible';
}

export type CourtStatus = 'Approved' | 'Pending Approval' | 'Rejected';

export interface Court {
  id: string;
  name: string;
  displayName?: string;
  samePhysicalSports?: boolean;
  parentCourtId?: string;
  parentCourtName?: string;
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
  isActive?: boolean;
  operatingHours: string;
  type?: 'Outdoor' | 'Indoor' | 'Covered';
  cancellationWindowHours?: number; // e.g. 2, 4, 12, 24, 0 (no cancellation)
  refundPercentage?: number; // e.g. 50, 75, 90, 100, 0
  cancellationPolicyLabel?: string; // e.g. "Free cancel up to 12h before match (100% refund)"
  requestId?: string; // e.g. "CRQ-2026-1021"
  rejectionReason?: string; // Admin feedback note if rejected
}

export type SlotState =
  | 'available'
  | 'booked'
  | 'ongoing'
  | 'locked'
  | 'expired'
  | 'coaching'
  | 'tournament'
  | 'maintenance'
  | 'pending';

export interface Slot {
  id: string;
  courtId: string;
  courtName: string;
  sport: string;
  time: string; // "6–7 AM"
  timeFull: string; // "06:00 AM – 07:00 AM"
  date?: string; // "28 Aug 2026"
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
  status: 'Settled' | 'Processing' | 'Pending' | 'Failed' | 'Refunded';
  period: string;
  payoutMode: 'Instant IMPS' | 'Automated Daily NEFT' | 'Automated T+1 NEFT' | 'Refund Debit';
  // For customer refund entries
  type?: 'payout' | 'refund_debit';
  refundNote?: string; // e.g. "Refund for BK10241 – Sameer Khan"
  bookingId?: string;
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
  minNoticeHours?: number;
  slotHoldTimerMinutes?: number;
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

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumberMasked: string;
  accountNumberFull?: string;
  ifscCode: string;
  accountHolder: string;
  accountType: 'Savings' | 'Current' | 'Current Commercial';
  isVerified: boolean;
  addedOn: string;
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
  advancePercentage?: number;
  upiQr?: boolean;
  acceptUpi?: boolean;
  acceptCash?: boolean;
  // Multi-account support
  bankAccounts?: BankAccount[];
  primaryBankId?: string;
}

export interface AmenityItem {
  id: string;
  name: string;
  category: string;
  enabled: boolean;
  price?: number; // 0 for included free, >0 for rental
  description?: string;
  iconName?: string;
  icon?: string;
  details?: string;
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

export interface LoggedInUser {
  type: 'owner' | 'staff';
  id?: string;
  name: string;
  role: string;
  phone: string;
  email?: string;
  permissions?: StaffMember['permissions'];
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
  bookingAlerts?: boolean;
  dailyFinancialSummary?: boolean;
  slotExpiryAlerts?: boolean;
  whatsappBookingAlerts?: boolean;
  slotHoldExpiryAlerts?: boolean;
  dailyPayoutDigest?: boolean;
  slotMaintenanceReminders?: boolean;
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

export type SupportCategory =
  | 'Payment'
  | 'Booking'
  | 'Technical'
  | 'Settlements'
  | 'General'
  | 'Other';

export interface SupportTicket {
  id: string;
  category: SupportCategory | string;
  issue?: string;
  subject: string;
  description: string;
  bookingId?: string;
  status: 'In Progress' | 'Resolved' | 'Open' | 'Closed';
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  createdAt?: string;
  date?: string;
  lastUpdated?: string;
  requestType?: 'venue_change' | 'bank_change' | 'court_approval' | 'general_support';
  detailsPayload?: {
    // Venue change
    currentVenueName?: string;
    requestedVenueName?: string;
    requestedAddress?: string;
    requestedPhone?: string;
    // Bank change
    currentBankName?: string;
    requestedBankName?: string;
    requestedAccountMasked?: string;
    requestedIfsc?: string;
    accountHolder?: string;
    chequeAttached?: boolean;
    // Court approval request
    courtName?: string;
    displayName?: string;
    sports?: string[];
    surfaceType?: string;
    pricePerHour?: number;
    minBookingDuration?: string;
    peakHoursPrice?: number;
    weekendPrice?: number;
    peakSchedule?: string;
    cancellationPolicyLabel?: string;
    samePhysicalSports?: boolean;
    parentCourtName?: string;
    photosCount?: number;
  };
  attachmentName?: string;
  adminReply?: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'warning' | 'info' | 'error';
}

export interface BankDetails {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  maskedNumber: string;
  ifsc: string;
  accountType: string;
  payoutSchedule: string;
  status: string;
  branchName?: string;
}
