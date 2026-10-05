import { Controller, Get, Param, Query } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { PaymentQrResponse } from '../types';

@Controller('vendor')
export class VendorController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get('qr/upi/:bookingId')
  async getVendorUpiQr(
    @Param('bookingId') bookingId: string,
    @Query('amount') amount?: string | number,
  ): Promise<PaymentQrResponse> {
    const parsedAmount = amount !== undefined && amount !== '' ? Number(amount) : undefined;
    return await this.bookingsService.getPaymentQr(bookingId, parsedAmount);
  }

  @Get('bookings/:id/payment-qr')
  async getVendorBookingPaymentQr(
    @Param('id') id: string,
    @Query('amount') amount?: string | number,
  ): Promise<PaymentQrResponse> {
    const parsedAmount = amount !== undefined && amount !== '' ? Number(amount) : undefined;
    return await this.bookingsService.getPaymentQr(id, parsedAmount);
  }
}
