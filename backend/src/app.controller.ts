import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      status: 'ok',
      name: 'TurfTown / iBookSports Backend API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      endpoints: [
        '/api/v1/bookings',
        '/api/v1/bookings/:id/payment-qr',
        '/api/v1/vendor/qr/upi/:bookingId',
        '/api/v1/courts',
        '/api/v1/slots',
        '/api/v1/payments',
        '/api/v1/settlements',
        '/api/v1/settings',
        '/api/v1/staff',
        '/api/v1/notifications',
        '/api/v1/support',
      ],
    };
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
