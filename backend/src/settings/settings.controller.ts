import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('booking')
  getBookingSettings() { return this.settingsService.getBookingSettings(); }

  @Patch('booking')
  updateBookingSettings(@Body() data: any) { return this.settingsService.updateBookingSettings(data); }

  @Get('payment')
  getPaymentSettings() { return this.settingsService.getPaymentSettings(); }

  @Patch('payment')
  updatePaymentSettings(@Body() data: any) { return this.settingsService.updatePaymentSettings(data); }

  @Get('operating-hours')
  getOperatingHours() { return this.settingsService.getOperatingHours(); }

  @Patch('operating-hours/:day')
  toggleOperatingDay(@Param('day') day: string) { return this.settingsService.toggleOperatingDay(day); }

  @Get('amenities')
  getAmenities() { return this.settingsService.getAmenities(); }

  @Patch('amenities/:id')
  toggleAmenity(@Param('id') id: string) { return this.settingsService.toggleAmenity(id); }

  @Get('cancellation')
  getCancellationPolicy() { return this.settingsService.getCancellationPolicy(); }

  @Patch('cancellation')
  updateCancellationPolicy(@Body() data: any) { return this.settingsService.updateCancellationPolicy(data); }
}
