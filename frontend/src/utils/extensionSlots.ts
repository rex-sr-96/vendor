import { Booking, Court } from '../types';

export interface AvailableExtensionOption {
  addedMinutes: number;
  addedHours: number;
  stepStartTime: string;
  stepEndTime: string;
  segmentStartTime: string;
  segmentEndTime: string;
  newFullTimeSlot: string;
  addedFee: number;
  label: string;
}

export interface ExtensionAvailabilityResult {
  hasConflict: boolean;
  conflictingBooking?: Booking;
  conflictMessage?: string;
  nextOccupiedBooking?: Booking;
  nextOccupiedTime?: string;
  availableOptions: AvailableExtensionOption[];
  stepMinutes: number;
  currentStartTimeStr: string;
  currentEndTimeStr: string;
}

export function parseTimeToMinutes(tStr: string): number {
  if (!tStr) return 0;
  const isPM = /PM/i.test(tStr);
  const isAM = /AM/i.test(tStr);
  const clean = tStr.replace(/AM|PM/i, '').trim();
  const [hStr, mStr] = clean.split(':');
  let h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr || '0', 10) || 0;
  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;
  return h * 60 + m;
}

export function parseBookingRangeToMinutes(timeSlotStr: string): { startMins: number; endMins: number } | null {
  if (!timeSlotStr) return null;
  const cleanStr = timeSlotStr.replace(/\(.*?\)/g, '').trim();
  const parts = cleanStr.split(/[–\-]| to /i).map((p) => p.trim());
  if (parts.length >= 2) {
    const p0 = parts[0];
    const p1 = parts[1];
    const hasP0Period = /AM|PM/i.test(p0);
    const p1IsPM = /PM/i.test(p1);

    let startMins = parseTimeToMinutes(p0);
    let endMins = parseTimeToMinutes(p1);

    if (!hasP0Period && p1IsPM) {
      const pmStartMins = startMins < 720 ? startMins + 720 : startMins;
      if (pmStartMins < endMins) {
        startMins = pmStartMins;
      }
    }

    if (endMins <= startMins && (p1.toLowerCase().includes('am') || p1.includes('12') || endMins === 0)) {
      endMins += 1440;
    }

    return { startMins, endMins };
  } else if (parts.length === 1 && parts[0]) {
    const startMins = parseTimeToMinutes(parts[0]);
    return { startMins, endMins: startMins + 60 };
  }
  return null;
}

export function formatMinutesToTime(totalMins: number): string {
  const normalized = ((totalMins % 1440) + 1440) % 1440;
  const h24 = Math.floor(normalized / 60);
  const m = normalized % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const padH = h12 < 10 ? '0' + h12 : String(h12);
  return `${padH}:${m < 10 ? '0' + m : m} ${ampm}`;
}

export function getAvailableExtensionSlots(
  booking: Booking,
  allBookings: Booking[],
  court?: Court
): ExtensionAvailabilityResult {
  const parts = booking.timeSlot.split('–');
  const matchStartTimeStr = parts[0]?.trim() || '6:00 PM';
  const currentEndTimeStr = parts[1]?.trim() || '8:00 PM';

  const currentEndMins = parseTimeToMinutes(currentEndTimeStr);
  const hourlyRate = court?.pricePerHour || (booking.totalAmount > 0 ? booking.totalAmount : 1000);

  // Determine step size: 30 mins for badminton / pickleball, 60 mins for football / cricket
  const is30Min =
    court?.minBookingDuration?.includes('30') ||
    court?.sports?.some((s) => s.toLowerCase().includes('badminton') || s.toLowerCase().includes('pickleball')) ||
    booking.sport === 'Badminton' ||
    booking.sport === 'Pickleball';

  const stepMinutes = is30Min ? 30 : 60;
  const maxEndMins = 23 * 60; // 11:00 PM closing

  // Other active bookings on the same court and date
  const otherBookings = allBookings.filter(
    (b) =>
      b.id !== booking.id &&
      (b.courtId === booking.courtId || b.courtName === booking.courtName) &&
      b.date === booking.date &&
      b.status !== 'Cancelled' &&
      b.status !== 'Expired'
  );

  const otherRanges = otherBookings.map((b) => {
    const bParts = b.timeSlot.split('–');
    const sStr = bParts[0]?.trim() || '';
    const eStr = bParts[1]?.trim() || '';
    return {
      booking: b,
      startMins: parseTimeToMinutes(sStr),
      endMins: parseTimeToMinutes(eStr),
    };
  });

  const availableOptions: AvailableExtensionOption[] = [];
  let hasConflict = false;
  let conflictingBooking: Booking | undefined;
  let conflictMessage: string | undefined;
  let nextOccupiedBooking: Booking | undefined;
  let nextOccupiedTime: string | undefined;

  let currentCheckingStart = currentEndMins;

  // Scan up to 4 continuous slots or until closing time
  for (let stepIndex = 1; stepIndex <= 4; stepIndex++) {
    const targetEnd = currentCheckingStart + stepMinutes;
    if (targetEnd > maxEndMins) break;

    // Check if [currentCheckingStart, targetEnd) overlaps with any other booking
    const overlapping = otherRanges.find(
      (r) => r.startMins < targetEnd && r.endMins > currentCheckingStart
    );

    if (overlapping) {
      nextOccupiedBooking = overlapping.booking;
      nextOccupiedTime = `${formatMinutesToTime(overlapping.startMins)}–${formatMinutesToTime(overlapping.endMins)}`;
      if (stepIndex === 1) {
        hasConflict = true;
        conflictingBooking = overlapping.booking;
        conflictMessage = `Next slot (${formatMinutesToTime(currentCheckingStart)}–${formatMinutesToTime(targetEnd)}) is already booked by ${overlapping.booking.customerName}. Court cannot be extended.`;
      }
      break; // Cannot extend past a booked slot
    }

    // This slot is available!
    const cumulativeAddedMinutes = targetEnd - currentEndMins;
    const addedHours = cumulativeAddedMinutes / 60;
    const addedFee = Math.round((hourlyRate * cumulativeAddedMinutes) / 60);
    const newEndStr = formatMinutesToTime(targetEnd);

    availableOptions.push({
      addedMinutes: cumulativeAddedMinutes,
      addedHours,
      stepStartTime: formatMinutesToTime(currentEndMins),
      stepEndTime: newEndStr,
      segmentStartTime: formatMinutesToTime(currentCheckingStart),
      segmentEndTime: newEndStr,
      newFullTimeSlot: `${matchStartTimeStr}–${newEndStr}`,
      addedFee,
      label: `+${addedHours} Hour${addedHours !== 1 ? 's' : ''} (${formatMinutesToTime(currentCheckingStart)} – ${newEndStr})`,
    });

    currentCheckingStart = targetEnd;
  }

  return {
    hasConflict,
    conflictingBooking,
    conflictMessage,
    nextOccupiedBooking,
    nextOccupiedTime,
    availableOptions,
    stepMinutes,
    currentStartTimeStr: matchStartTimeStr,
    currentEndTimeStr,
  };
}
