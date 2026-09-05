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
        '/api/bookings',
        '/api/courts',
        '/api/slots',
        '/api/payments',
        '/api/settlements',
        '/api/settings',
        '/api/staff',
        '/api/notifications',
        '/api/support',
      ],
    };
  }

  @Get('health')
  getHealth() {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
