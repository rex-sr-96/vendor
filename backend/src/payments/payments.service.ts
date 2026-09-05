import { Injectable } from '@nestjs/common';
import { PaymentRecord } from '../types';
import { initialPaymentRecords } from '../data/mock-data';

@Injectable()
export class PaymentsService {
  private payments: PaymentRecord[] = [...initialPaymentRecords];

  findAll(): PaymentRecord[] {
    return this.payments;
  }

  recordCash(data: { bookingId: string; amount: number; customerName?: string }): PaymentRecord {
    const record: PaymentRecord = {
      id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
      bookingId: data.bookingId,
      customerName: data.customerName || 'Customer',
      customerPhone: '',
      courtName: '',
      timeSlot: '',
      date: new Date().toLocaleDateString('en-IN'),
      totalAmount: data.amount,
      paidAmount: data.amount,
      balance: 0,
      status: 'Paid',
      method: 'Cash',
      timestamp: 'Just now',
    };
    this.payments.unshift(record);
    return record;
  }
}
