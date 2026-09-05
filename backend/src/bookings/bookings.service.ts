import { Injectable } from '@nestjs/common';
import { Booking } from '../types';
import { initialBookings } from '../data/mock-data';

@Injectable()
export class BookingsService {
  private bookings: Booking[] = [...initialBookings];

  findAll(): Booking[] {
    return this.bookings;
  }

  findOne(id: string): Booking | undefined {
    return this.bookings.find((b) => b.id === id);
  }

  create(data: Partial<Booking>): Booking {
    const total = data.totalAmount || 1200;
    const paid = data.paidAmount || 0;
    const balance = total - paid;
    const resType = data.reservationType || (balance === 0 ? 'direct_booking' : 'payment_link_request');
    const isConfirmed = resType === 'direct_booking' && balance === 0;

    const booking: Booking = {
      id: `BK${Math.floor(10240 + Math.random() * 100)}`,
      customerName: data.customerName || 'Customer',
      customerPhone: data.customerPhone || '+91 98765 00000',
      courtId: data.courtId || 'court-1',
      courtName: data.courtName || 'Turf 1',
      sport: (data.sport as any) || 'Football',
      date: data.date || '28 Aug 2026',
      timeSlot: data.timeSlot || '8:00–9:00 PM',
      totalAmount: total,
      paidAmount: paid,
      balanceAmount: balance,
      status: isConfirmed ? 'Confirmed' : paid > 0 ? 'Partially Paid' : 'Payment Pending',
      paymentStatus: balance === 0 ? 'Paid' : paid > 0 ? 'Partially Paid' : 'Pending',
      paymentMethod: data.paymentMethod || (balance === 0 ? 'UPI' : 'Online Link'),
      createdAt: 'Just now',
      notes: data.notes,
      holdExpiresInMinutes: resType === 'payment_link_request' ? 15 : 0,
      reservationType: resType,
    };
    this.bookings.unshift(booking);
    return booking;
  }

  update(id: string, data: Partial<Booking>): Booking | undefined {
    const index = this.bookings.findIndex((b) => b.id === id);
    if (index === -1) return undefined;
    this.bookings[index] = { ...this.bookings[index], ...data };
    return this.bookings[index];
  }

  // Type 1 Action: Customer pays link -> Converts to Confirmed Booking
  markPaidAndConfirm(id: string, paymentMethod: 'UPI' | 'Cash' | 'Card' = 'UPI'): Booking | undefined {
    const index = this.bookings.findIndex((b) => b.id === id);
    if (index === -1) return undefined;
    const b = this.bookings[index];
    this.bookings[index] = {
      ...b,
      status: 'Confirmed',
      paymentStatus: 'Paid',
      paidAmount: b.totalAmount,
      balanceAmount: 0,
      paymentMethod,
      holdExpiresInMinutes: 0,
    };
    return this.bookings[index];
  }

  // Type 1 Action: Customer does not pay in time -> Expires
  expireReservation(id: string): Booking | undefined {
    const index = this.bookings.findIndex((b) => b.id === id);
    if (index === -1) return undefined;
    this.bookings[index] = {
      ...this.bookings[index],
      status: 'Expired',
      holdExpiresInMinutes: 0,
    };
    return this.bookings[index];
  }

  // Type 1 Action: Customer comes back -> Re-lock slot with fresh timer
  relockReservation(id: string, holdMinutes: number = 15): Booking | undefined {
    const index = this.bookings.findIndex((b) => b.id === id);
    if (index === -1) return undefined;
    this.bookings[index] = {
      ...this.bookings[index],
      status: 'Payment Pending',
      holdExpiresInMinutes: holdMinutes,
    };
    return this.bookings[index];
  }

  // Type 1 Action: Release expired slot back to available
  releaseSlot(id: string): Booking | undefined {
    const index = this.bookings.findIndex((b) => b.id === id);
    if (index === -1) return undefined;
    this.bookings[index] = {
      ...this.bookings[index],
      status: 'Cancelled',
      holdExpiresInMinutes: 0,
    };
    return this.bookings[index];
  }
}
