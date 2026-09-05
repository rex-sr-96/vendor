import { Controller, Get, Post, Body } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentRecord } from '../types';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  findAll(): PaymentRecord[] {
    return this.paymentsService.findAll();
  }

  @Post('record-cash')
  recordCash(@Body() data: { bookingId: string; amount: number; customerName?: string }): PaymentRecord {
    return this.paymentsService.recordCash(data);
  }

  @Post('send-link')
  sendLink(@Body() data: { bookingId: string }): { success: boolean; message: string } {
    return { success: true, message: `Payment link sent for booking ${data.bookingId}` };
  }
}
