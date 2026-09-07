import {
  Booking,
  Court,
  Slot,
  PaymentRecord,
  SettlementRecord,
  OperatingHourDay,
  BookingSettingsConfig,
  PaymentSettingsConfig,
  SupportTicket,
  AmenityItem,
  CancellationPolicyConfig,
  StaffMember,
  NotificationPreferencesConfig,
  NotificationItem,
} from '../types';

// Live dynamic state: Initial empty records for active arena
export const initialBookings: Booking[] = [];
export const initialCourts: Court[] = [];
export const initialSlots: Slot[] = [];
export const initialPaymentRecords: PaymentRecord[] = [];
export const initialSettlements: SettlementRecord[] = [];
export const initialSupportTickets: SupportTicket[] = [];
export const initialStaffMembers: StaffMember[] = [];
export const initialNotifications: NotificationItem[] = [];

// Standard operating hours template (overridden dynamically by verified onboarding record)
export const initialOperatingHours: OperatingHourDay[] = [
  { day: 'Monday', shortDay: 'Mon', isOpen: true, openTime: '01:00 PM', closeTime: '10:00 PM' },
  { day: 'Tuesday', shortDay: 'Tue', isOpen: true, openTime: '09:00 AM', closeTime: '10:00 PM' },
  { day: 'Wednesday', shortDay: 'Wed', isOpen: true, openTime: '06:00 AM', closeTime: '10:00 PM' },
  { day: 'Thursday', shortDay: 'Thu', isOpen: true, openTime: '06:00 AM', closeTime: '10:00 PM' },
  { day: 'Friday', shortDay: 'Fri', isOpen: true, openTime: '10:30 AM', closeTime: '10:00 PM' },
  { day: 'Saturday', shortDay: 'Sat', isOpen: true, openTime: '06:00 AM', closeTime: '11:00 PM' },
  { day: 'Sunday', shortDay: 'Sun', isOpen: true, openTime: '01:00 PM', closeTime: '10:00 PM' },
];

export const initialBookingSettings: BookingSettingsConfig = {
  advanceBookingDays: 30,
  minDurationHours: 1,
  maxDurationHours: 4,
  minNoticeMinutes: 30,
  sameDayBooking: true,
  recurringBooking: true,
  bookingExtension: true,
  enabledBookingTypes: {
    normal: true,
    coaching: true,
    tournament: true,
    membership: true,
    party: true,
    longTerm: true,
  },
};

export const initialPaymentSettings: PaymentSettingsConfig = {
  onlinePayment: true,
  cashPayment: true,
  bankName: 'SBI BANK',
  accountNumberMasked: '•••• 6914',
  ifscCode: 'SBIN0018111',
  isVerified: true,
  payoutFrequency: 'Daily',
  upiId: 'skywalk.sports@oksbi',
};

export const initialAmenities: AmenityItem[] = [
  {
    id: 'AMN_LIGHTS',
    name: 'LED Floodlights',
    category: 'Lighting',
    enabled: true,
    price: 0,
    description: 'Day-light grade LED towers for night games & match broadcasts',
    iconName: 'SunMedium',
    icon: 'SunMedium',
    details: '500 Lux professional floodlighting',
  },
  {
    id: 'AMN_PARKING',
    name: 'Car & Bike Parking',
    category: 'Facility',
    enabled: true,
    price: 0,
    description: 'Dedicated parking bays for four-wheelers and two-wheelers',
    iconName: 'Car',
    icon: 'Car',
    details: 'Covered and secure parking',
  },
  {
    id: 'AMN_CHANGE',
    name: 'Changing Rooms & Showers',
    category: 'Facility',
    enabled: true,
    price: 0,
    description: 'Clean hygiene stalls with hot water and shower cabins',
    iconName: 'DoorOpen',
    icon: 'DoorOpen',
    details: 'Male and female separate changing rooms',
  },
  {
    id: 'AMN_WATER',
    name: 'Purified Drinking Water',
    category: 'Refreshment',
    enabled: true,
    price: 0,
    description: 'Chilled & ambient RO purified drinking water station',
    iconName: 'Droplets',
    icon: 'Droplets',
    details: 'Free continuous hydration',
  },
  {
    id: 'AMN_FIRSTAID',
    name: 'First Aid Kit',
    category: 'Safety',
    enabled: true,
    price: 0,
    description: 'Crepe bandages, pain relief spray, instant ice, and emergency medical kit',
    iconName: 'HeartPulse',
    icon: 'HeartPulse',
    details: 'On-site medical safety kit',
  },
  {
    id: 'AMN_CAFE',
    name: 'Snacks & Cafeteria',
    category: 'Refreshment',
    enabled: true,
    price: 0,
    description: 'Cafeteria serving energy drinks, health snacks, and refreshments',
    iconName: 'Coffee',
    icon: 'Coffee',
    details: 'Snack bar & hydration lounge',
  },
  {
    id: 'AMN_GEAR',
    name: 'Equipment Rental',
    category: 'Equipment',
    enabled: true,
    price: 100,
    description: 'Match cricket equipment, badminton rackets, and training bibs',
    iconName: 'ShieldCheck',
    icon: 'ShieldCheck',
    details: 'Pro sport gear rental at counter',
  },
  {
    id: 'AMN_SEATING',
    name: 'Spectator Seating / Gallery',
    category: 'Facility',
    enabled: true,
    price: 0,
    description: 'Tiered spectator gallery and player viewing benches',
    iconName: 'Armchair',
    icon: 'Armchair',
    details: 'Covered spectator stand',
  },
];

export const initialCancellationPolicy: CancellationPolicyConfig = {
  freeCancellationHours: 12,
  refundPercentage: 100,
  autoReleaseHoldMinutes: 15,
  weatherRescheduleAllowed: true,
  refundToWalletDefault: true,
  allowCustomerSelfCancel: true,
  lateCancellationFeePercent: 20,
};

export const initialNotificationPreferences: NotificationPreferencesConfig = {
  whatsappBookingConfirmation: true,
  whatsappPaymentReminder: true,
  smsAlertsManager: true,
  pushNewBooking: true,
  pushHoldExpiry: true,
  pushDailySummary: true,
  emailSettlementReports: true,
  soundHapticsEnabled: true,
};
