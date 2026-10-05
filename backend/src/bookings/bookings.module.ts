import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { VendorController } from './vendor.controller';
import { BookingsService } from './bookings.service';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [SettingsModule],
  controllers: [BookingsController, VendorController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
