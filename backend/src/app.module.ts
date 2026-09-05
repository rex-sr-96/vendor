import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { BookingsModule } from './bookings/bookings.module';
import { CourtsModule } from './courts/courts.module';
import { SlotsModule } from './slots/slots.module';
import { PaymentsModule } from './payments/payments.module';
import { SettlementsModule } from './settlements/settlements.module';
import { SettingsModule } from './settings/settings.module';
import { StaffModule } from './staff/staff.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SupportModule } from './support/support.module';

@Module({
  imports: [
    BookingsModule,
    CourtsModule,
    SlotsModule,
    PaymentsModule,
    SettlementsModule,
    SettingsModule,
    StaffModule,
    NotificationsModule,
    SupportModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
