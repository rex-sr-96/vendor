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

export const initialBookings: Booking[] = [
  {
    id: 'BK10231',
    customerName: 'Rahul Kumar',
    customerPhone: '+91 98765 43210',
    courtId: 'court-1',
    courtName: 'Turf 1',
    sport: 'Football',
    date: '28 Aug 2026',
    timeSlot: '6:00–8:00 PM',
    totalAmount: 3000,
    paidAmount: 3000,
    balanceAmount: 0,
    status: 'Confirmed',
    paymentStatus: 'Paid',
    paymentMethod: 'UPI',
    createdAt: '28 Aug 2026, 04:30 PM',
    notes: '2-Hour Continuous Match Session · Needs 2 footballs and bibs',
    holdExpiresInMinutes: 0,
  },
  {
    id: 'BK10232',
    customerName: 'Arun Prakash',
    customerPhone: '+91 98450 11223',
    courtId: 'court-2',
    courtName: 'Turf 2',
    sport: 'Football',
    date: '28 Aug 2026',
    timeSlot: '8:00–9:00 PM',
    totalAmount: 1200,
    paidAmount: 0,
    balanceAmount: 1200,
    status: 'Payment Pending',
    paymentStatus: 'Pending',
    createdAt: '28 Aug 2026, 05:15 PM',
    notes: 'Online hold initiated',
    holdExpiresInMinutes: 12,
  },
  {
    id: 'BK10233',
    customerName: 'Priya Menon',
    customerPhone: '+91 97412 88901',
    courtId: 'court-1',
    courtName: 'Turf 1',
    sport: 'Cricket',
    date: '28 Aug 2026',
    timeSlot: '6:00–7:00 PM',
    totalAmount: 1500,
    paidAmount: 1500,
    balanceAmount: 0,
    status: 'Confirmed',
    paymentStatus: 'Paid',
    paymentMethod: 'UPI',
    createdAt: '28 Aug 2026, 02:00 PM',
    notes: 'Box cricket leather ball allowed',
  },
  {
    id: 'BK10228',
    customerName: 'ABC Sports Club',
    customerPhone: '+91 99000 55443',
    courtId: 'court-2',
    courtName: 'Turf 2',
    sport: 'Football',
    date: '27 Aug 2026',
    timeSlot: '5:00–7:00 PM',
    totalAmount: 2800,
    paidAmount: 2800,
    balanceAmount: 0,
    status: 'Completed',
    paymentStatus: 'Paid',
    paymentMethod: 'Cash',
    createdAt: '27 Aug 2026, 01:20 PM',
    notes: 'Weekend league match 7v7',
  },
  {
    id: 'BK10234',
    customerName: 'Vikram Sethi',
    customerPhone: '+91 98111 22334',
    courtId: 'court-3',
    courtName: 'Badminton 1',
    sport: 'Badminton',
    date: '28 Aug 2026',
    timeSlot: '8:00–9:00 PM',
    totalAmount: 600,
    paidAmount: 0,
    balanceAmount: 600,
    status: 'Payment Pending',
    paymentStatus: 'Pending',
    createdAt: '28 Aug 2026, 06:40 PM',
    holdExpiresInMinutes: 18,
  },
];

export const initialCourts: Court[] = [
  {
    id: 'court-1',
    name: 'Turf 1',
    sports: ['Football', 'Cricket'],
    pricePerHour: 1000,
    status: 'Approved',
    statusDetails: 'FIFA Grade 5G Synthetic Turf',
    operatingHours: '06:00 AM – 11:00 PM',
    type: 'Outdoor',
  },
  {
    id: 'court-2',
    name: 'Turf 2',
    sports: ['Football'],
    pricePerHour: 800,
    status: 'Approved',
    statusDetails: '7-a-side AstroTurf with LED floodlights',
    operatingHours: '06:00 AM – 11:00 PM',
    type: 'Covered',
  },
  {
    id: 'court-3',
    name: 'Court 1',
    sports: ['Badminton'],
    pricePerHour: 500,
    status: 'Approved',
    statusDetails: 'Synthetic Badminton Court with wooden spring base',
    operatingHours: '06:00 AM – 11:00 PM',
    type: 'Indoor',
  },
  {
    id: 'court-4',
    name: 'Turf 3',
    sports: ['Football'],
    pricePerHour: 900,
    status: 'Rejected',
    statusDetails: 'Court photos unclear. Edit & Resubmit',
    operatingHours: '06:00 AM – 11:00 PM',
    type: 'Outdoor',
  },
];

export const initialSlots: Slot[] = [
  { id: 'slot-t1-6', courtId: 'court-1', courtName: 'Turf 1', sport: 'Football', time: '6–7 AM', timeFull: '06:00 AM – 07:00 AM', state: 'coaching', reason: 'Youth Academy', price: 1000, notes: 'Coach Alex coaching 12 kids' },
  { id: 'slot-t1-7', courtId: 'court-1', courtName: 'Turf 1', sport: 'Football', time: '7–8 AM', timeFull: '07:00 AM – 08:00 AM', state: 'coaching', reason: 'Senior Fitness', price: 1000 },
  { id: 'slot-t1-8', courtId: 'court-1', courtName: 'Turf 1', sport: 'Football', time: '8–9 AM', timeFull: '08:00 AM – 09:00 AM', state: 'available', price: 1000 },
  { id: 'slot-t1-9', courtId: 'court-1', courtName: 'Turf 1', sport: 'Football', time: '9–10 AM', timeFull: '09:00 AM – 10:00 AM', state: 'booked', bookingId: 'BK10231', customerName: 'Rahul Kumar', customerPhone: '+91 98765 43210', price: 1000, paidAmount: 1000 },
  { id: 'slot-t1-18', courtId: 'court-1', courtName: 'Turf 1', sport: 'Football', time: '6–7 PM', timeFull: '06:00 PM – 07:00 PM', state: 'booked', bookingId: 'BK10231', customerName: 'Rahul Kumar', customerPhone: '+91 98765 43210', price: 1500, paidAmount: 1500 },
  { id: 'slot-t2-6', courtId: 'court-2', courtName: 'Turf 2', sport: 'Football', time: '6–7 AM', timeFull: '06:00 AM – 07:00 AM', state: 'available', price: 800 },
  { id: 'slot-t2-8', courtId: 'court-2', courtName: 'Turf 2', sport: 'Football', time: '8–9 AM', timeFull: '08:00 AM – 09:00 AM', state: 'booked', customerName: 'Karthik Rao', customerPhone: '+91 99887 76655', price: 800, paidAmount: 800 },
  { id: 'slot-t2-9', courtId: 'court-2', courtName: 'Turf 2', sport: 'Football', time: '9–10 AM', timeFull: '09:00 AM – 10:00 AM', state: 'maintenance', reason: 'Turf Infill M...', price: 800, notes: 'Scheduled regular grooming with brush machine' },
  { id: 'slot-t2-20', courtId: 'court-2', courtName: 'Turf 2', sport: 'Football', time: '8–9 PM', timeFull: '08:00 PM – 09:00 PM', state: 'pending', bookingId: 'BK10232', customerName: 'Arun Prakash', customerPhone: '+91 98450 11223', price: 800, paidAmount: 0, countdown: '11:45' },
  { id: 'slot-c1-8', courtId: 'court-3', courtName: 'Court 1', sport: 'Badminton', time: '8–9 AM', timeFull: '08:00 AM – 09:00 AM', state: 'pending', customerName: 'Vikram Sethi', customerPhone: '+91 98111 22334', price: 500, paidAmount: 0, countdown: '18:24' },
  { id: 'slot-c1-9', courtId: 'court-3', courtName: 'Court 1', sport: 'Badminton', time: '9–10 AM', timeFull: '09:00 AM – 10:00 AM', state: 'tournament', reason: 'Corporate I...', price: 500, notes: '8 singles players registered' },
];

export const initialPaymentRecords: PaymentRecord[] = [
  { id: 'PAY-1001', bookingId: 'BK10231', customerName: 'Rahul Kumar', customerPhone: '+91 98765 43210', courtName: 'Turf 1', timeSlot: '7:00–8:00 PM', date: '28 Aug 2026', totalAmount: 5000, paidAmount: 2500, balance: 2500, status: 'Partial', method: 'UPI', timestamp: '28 Aug, 04:32 PM' },
  { id: 'PAY-1002', bookingId: 'BK10232', customerName: 'Arun Prakash', customerPhone: '+91 98450 11223', courtName: 'Turf 2', timeSlot: '8:00–9:00 PM', date: '28 Aug 2026', totalAmount: 8000, paidAmount: 8000, balance: 0, status: 'Paid', method: 'UPI Auto-collect', timestamp: '28 Aug, 03:10 PM' },
  { id: 'PAY-1003', bookingId: 'BK10233', customerName: 'Priya Menon', customerPhone: '+91 97412 88901', courtName: 'Turf 1', timeSlot: '6:00–7:00 PM', date: '28 Aug 2026', totalAmount: 1500, paidAmount: 1500, balance: 0, status: 'Paid', method: 'UPI', timestamp: '28 Aug, 02:00 PM' },
];

export const initialSettlements: SettlementRecord[] = [
  { id: 'SET-20260828', utrNumber: 'HDFC9048172648', settledAmount: 48600, grossAmount: 48600, feeDeductions: 0, date: '28 Aug 2026', time: '06:00 AM', bankName: 'HDFC Bank', accountMasked: '•••• 4321', status: 'Settled', period: '27 Aug Online Bookings (14 slots)', payoutMode: 'Automated Daily NEFT' },
  { id: 'SET-20260827', utrNumber: 'HDFC8910472619', settledAmount: 62400, grossAmount: 62400, feeDeductions: 0, date: '27 Aug 2026', time: '06:00 AM', bankName: 'HDFC Bank', accountMasked: '•••• 4321', status: 'Settled', period: '26 Aug Online Bookings (18 slots)', payoutMode: 'Automated Daily NEFT' },
  { id: 'SET-20260826', utrNumber: 'HDFC7819230481', settledAmount: 60700, grossAmount: 60700, feeDeductions: 0, date: '26 Aug 2026', time: '06:00 AM', bankName: 'HDFC Bank', accountMasked: '•••• 4321', status: 'Settled', period: '25 Aug Online Bookings (17 slots)', payoutMode: 'Automated Daily NEFT' },
];

export const initialOperatingHours: OperatingHourDay[] = [
  { day: 'Monday', shortDay: 'Mon', isOpen: true, openTime: '06:00 AM', closeTime: '11:00 PM' },
  { day: 'Tuesday', shortDay: 'Tue', isOpen: true, openTime: '06:00 AM', closeTime: '11:00 PM' },
  { day: 'Wednesday', shortDay: 'Wed', isOpen: true, openTime: '06:00 AM', closeTime: '11:00 PM' },
  { day: 'Thursday', shortDay: 'Thu', isOpen: true, openTime: '06:00 AM', closeTime: '11:00 PM' },
  { day: 'Friday', shortDay: 'Fri', isOpen: true, openTime: '06:00 AM', closeTime: '11:00 PM' },
  { day: 'Saturday', shortDay: 'Sat', isOpen: true, openTime: '06:00 AM', closeTime: '11:00 PM' },
  { day: 'Sunday', shortDay: 'Sun', isOpen: true, openTime: '06:00 AM', closeTime: '11:00 PM' },
];

export const initialBookingSettings: BookingSettingsConfig = {
  advanceBookingDays: 30,
  minDurationHours: 1,
  maxDurationHours: 4,
  minNoticeMinutes: 30,
  sameDayBooking: true,
  recurringBooking: true,
  bookingExtension: true,
  enabledBookingTypes: { normal: true, coaching: true, tournament: true, membership: true, party: true, longTerm: true },
};

export const initialPaymentSettings: PaymentSettingsConfig = {
  onlinePayment: true,
  cashPayment: true,
  bankName: 'HDFC Bank',
  accountNumberMasked: '•••• 4321',
  ifscCode: 'HDFC0001234',
  isVerified: true,
  payoutFrequency: 'Daily',
  upiId: 'turftown.arena@okhdfcbank',
};

export const initialSupportTickets: SupportTicket[] = [
  { id: 'SUP10231', category: 'Payment', issue: 'Payment not received', subject: 'Customer UPI debited but marked pending in app', description: 'Customer Rahul Kumar paid ₹2,500 via GPay at 4:32 PM, balance pending on counter.', bookingId: 'BK10231', status: 'In Progress', date: '28 Aug 2026' },
  { id: 'SUP10225', category: 'Court Approval', issue: 'New Court Approval', subject: 'Badminton Court 1 indoor mat photo verification', description: 'Submitted Yonex wooden synthetic flooring certificate and 4 boundary pictures.', status: 'Resolved', date: '24 Aug 2026' },
];

export const initialAmenities: AmenityItem[] = [
  { id: 'AMN_LIGHTS', name: 'LED Floodlights', category: 'Lighting', enabled: true, price: 0, description: 'Day-light grade LED towers for night games & match broadcasts', iconName: 'SunMedium', icon: 'SunMedium', details: '500 Lux professional floodlighting' },
  { id: 'AMN_PARKING', name: 'Car & Bike Parking', category: 'Facility', enabled: true, price: 0, description: 'Dedicated parking bays for four-wheelers and two-wheelers', iconName: 'Car', icon: 'Car', details: 'Covered and secure parking' },
  { id: 'AMN_CHANGE', name: 'Changing Rooms & Showers', category: 'Facility', enabled: true, price: 0, description: 'Clean hygiene stalls with hot water and shower cabins', iconName: 'DoorOpen', icon: 'DoorOpen', details: 'Male and female separate changing rooms' },
  { id: 'AMN_WATER', name: 'Purified Drinking Water', category: 'Refreshment', enabled: true, price: 0, description: 'Chilled & ambient RO purified drinking water station', iconName: 'Droplets', icon: 'Droplets', details: 'Free continuous hydration' },
  { id: 'AMN_FIRSTAID', name: 'First Aid Kit', category: 'Safety', enabled: true, price: 0, description: 'Crepe bandages, pain relief spray, instant ice, and emergency medical kit', iconName: 'HeartPulse', icon: 'HeartPulse', details: 'On-site medical safety kit' },
  { id: 'AMN_CAFE', name: 'Snacks & Cafeteria', category: 'Refreshment', enabled: true, price: 0, description: 'Sports snack bar, cold drinks, energy bars, and hydration lounge', iconName: 'Coffee', icon: 'Coffee', details: 'Snack bar & hydration lounge' },
  { id: 'AMN_GEAR', name: 'Equipment Rental', category: 'Equipment', enabled: true, price: 100, description: 'Match footballs, cricket bats, badminton racquets, and bibs', iconName: 'ShieldCheck', icon: 'ShieldCheck', details: 'Pro sport gear rental at counter' },
  { id: 'AMN_SEATING', name: 'Spectator Seating / Gallery', category: 'Facility', enabled: true, price: 0, description: 'Covered tiered seating stands and dugouts for viewers and squads', iconName: 'Armchair', icon: 'Armchair', details: 'Covered spectator stand' },
];

export const initialCancellationPolicy: CancellationPolicyConfig = {
  freeCancellationHours: 4,
  refundPercentage: 100,
  autoReleaseHoldMinutes: 15,
  weatherRescheduleAllowed: true,
  refundToWalletDefault: true,
  allowCustomerSelfCancel: true,
  lateCancellationFeePercent: 20,
};

export const initialStaffMembers: StaffMember[] = [
  { id: 'st-1', name: 'Ramesh Krishnan', role: 'Manager', phone: '+91 98401 23456', email: 'ramesh.manager@turftown.in', shift: 'Morning & Evening (6 AM – 3 PM)', permissions: { manageBookings: true, collectCash: true, blockSlots: true, viewFinances: true, editPricing: false }, status: 'Active' },
  { id: 'st-2', name: 'Murugan S.', role: 'Groundkeeper', phone: '+91 94440 98765', email: 'murugan.turf@turftown.in', shift: 'Full Day Ground Duty (2 PM – 11 PM)', permissions: { manageBookings: true, collectCash: true, blockSlots: true, viewFinances: false, editPricing: false }, status: 'Active' },
  { id: 'st-3', name: 'Coach Alex D.', role: 'Coach', phone: '+91 97909 11223', email: 'alex.academy@turftown.in', shift: 'Batch Hours (6 AM – 9 AM & 4 PM – 6 PM)', permissions: { manageBookings: false, collectCash: false, blockSlots: true, viewFinances: false, editPricing: false }, status: 'Active' },
];

export const initialNotificationPreferences: NotificationPreferencesConfig = {
  whatsappBookingConfirmation: true, whatsappPaymentReminder: true, smsAlertsManager: true,
  pushNewBooking: true, pushHoldExpiry: true, pushDailySummary: true,
  emailSettlementReports: true, soundHapticsEnabled: true,
};

export const initialNotifications: NotificationItem[] = [
  { id: 'notif-1', title: 'New Online Booking Received', message: 'Vikram Sethi booked Court 1 (Badminton) for 8:00–9:00 PM today.', time: '5 mins ago', category: 'booking', read: false, bookingId: 'BK10234', amount: 600 },
  { id: 'notif-2', title: 'Hold Slot Expiring Soon', message: 'Turf 2 hold for Arun Prakash (8–9 PM) expires in 12 minutes unless confirmed.', time: '18 mins ago', category: 'alert', read: false, bookingId: 'BK10232', amount: 1200 },
  { id: 'notif-3', title: 'Direct Bank Settlement Processed', message: '₹48,600 settled successfully to HDFC Bank A/c •••• 4321.', time: '2 hours ago', category: 'payment', read: true, amount: 48600 },
  { id: 'notif-4', title: 'Payment Received via UPI QR', message: 'Advance of ₹2,500 received for Booking #BK10231 (Rahul Kumar).', time: '4 hours ago', category: 'payment', read: true, bookingId: 'BK10231', amount: 2500 },
  { id: 'notif-5', title: 'Daily Venue Operating Schedule Ready', message: '7 total slots booked for today. 2 peak evening slots still open on Turf 1.', time: '6 hours ago', category: 'system', read: true },
];
