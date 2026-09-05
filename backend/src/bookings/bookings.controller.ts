import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { Booking } from '../types';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  findAll(): Booking[] {
    return this.bookingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Booking | undefined {
    return this.bookingsService.findOne(id);
  }

  @Post()
  create(@Body() data: Partial<Booking>): Booking {
    return this.bookingsService.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Partial<Booking>): Booking | undefined {
    return this.bookingsService.update(id, data);
  }

  @Post(':id/confirm-payment')
  confirmPayment(@Param('id') id: string, @Body('paymentMethod') paymentMethod?: 'UPI' | 'Cash' | 'Card'): Booking | undefined {
    return this.bookingsService.markPaidAndConfirm(id, paymentMethod);
  }

  @Post(':id/expire')
  expire(@Param('id') id: string): Booking | undefined {
    return this.bookingsService.expireReservation(id);
  }

  @Post(':id/relock')
  relock(@Param('id') id: string, @Body('holdMinutes') holdMinutes?: number): Booking | undefined {
    return this.bookingsService.relockReservation(id, holdMinutes || 15);
  }

  @Post(':id/release')
  release(@Param('id') id: string): Booking | undefined {
    return this.bookingsService.releaseSlot(id);
  }
}
