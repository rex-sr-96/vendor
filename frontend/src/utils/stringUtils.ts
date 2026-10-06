/**
 * Safely splits a string or array without ever throwing TypeError on null/undefined.
 * Returns [] when the value is not a valid non-empty string or array.
 */
export function safeSplit(value: unknown, separator: string | RegExp = ","): string[] {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) {
    return value.map((v) => (v !== null && v !== undefined ? String(v).trim() : "")).filter(Boolean);
  }
  if (typeof value !== "string") {
    const str = String(value).trim();
    return str ? str.split(separator).map((s) => s.trim()).filter(Boolean) : [];
  }
  if (!value.trim()) return [];
  return value.split(separator).map((s) => s.trim()).filter(Boolean);
}

/**
 * Safely extracts the first part of a string (e.g. first name, date part, time prefix)
 */
export function safeFirstPart(value: unknown, separator: string | RegExp = " ", fallback = ""): string {
  if (!value || typeof value !== "string") return fallback;
  const parts = value.split(separator);
  return parts[0] ? parts[0].trim() : fallback;
}

/**
 * Safely normalizes court object fields
 */
export function normalizeCourt(court: any): any {
  if (!court) return { id: 'court-default', name: 'Court', sport: 'Football', pricing: 1200 };
  return {
    ...court,
    id: court.id || court.court_id || 'court-default',
    name: court.name || court.court_name || 'Court',
    sport: court.sport || 'Football',
    pricing: Number(court.pricing ?? court.price_per_hour ?? 1200),
    sports: safeSplit(court.sports || court.sport || 'Football'),
  };
}

/**
 * Safely normalizes booking object fields
 */
export function normalizeBooking(booking: any): any {
  if (!booking) return null;
  const total = Number(booking.totalAmount ?? booking.total_amount ?? 1200);
  const paid = Number(booking.paidAmount ?? booking.paid_amount ?? 0);
  const balance = Number(booking.balanceAmount ?? booking.balance_amount ?? Math.max(0, total - paid));

  return {
    ...booking,
    id: booking.id || `bk-${Date.now()}`,
    bookingNumber: booking.bookingNumber || booking.booking_number || booking.bookingCode || 'BK-0000',
    customerName: (booking.customerName || booking.customer_name || 'Customer').trim(),
    customerPhone: (booking.customerPhone || booking.customer_phone || '').trim(),
    courtId: booking.courtId || booking.court_id || 'court-1',
    courtName: (booking.courtName || booking.court_name || 'Court').trim(),
    sport: booking.sport || 'Football',
    date: booking.date || new Date().toISOString().slice(0, 10),
    timeSlot: booking.timeSlot || booking.time_slot || '06:00 PM – 07:00 PM',
    totalAmount: total,
    paidAmount: paid,
    balanceAmount: balance,
    status: booking.status || (paid >= total ? 'Confirmed' : 'Payment Pending'),
    paymentStatus: booking.paymentStatus || booking.payment_status || (paid >= total ? 'Paid' : 'Pending'),
  };
}
