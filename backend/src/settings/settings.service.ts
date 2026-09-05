import { Injectable } from '@nestjs/common';
import { BookingSettingsConfig, PaymentSettingsConfig, OperatingHourDay, AmenityItem, CancellationPolicyConfig } from '../types';
import { initialBookingSettings, initialPaymentSettings, initialOperatingHours, initialAmenities, initialCancellationPolicy } from '../data/mock-data';

@Injectable()
export class SettingsService {
  private bookingSettings: BookingSettingsConfig = { ...initialBookingSettings };
  private paymentSettings: PaymentSettingsConfig = { ...initialPaymentSettings };
  private operatingHours: OperatingHourDay[] = [...initialOperatingHours];
  private amenities: AmenityItem[] = [...initialAmenities];
  private cancellationPolicy: CancellationPolicyConfig = { ...initialCancellationPolicy };

  getBookingSettings(): BookingSettingsConfig { return this.bookingSettings; }
  updateBookingSettings(data: Partial<BookingSettingsConfig>): BookingSettingsConfig {
    this.bookingSettings = { ...this.bookingSettings, ...data };
    return this.bookingSettings;
  }

  getPaymentSettings(): PaymentSettingsConfig { return this.paymentSettings; }
  updatePaymentSettings(data: Partial<PaymentSettingsConfig>): PaymentSettingsConfig {
    this.paymentSettings = { ...this.paymentSettings, ...data };
    return this.paymentSettings;
  }

  getOperatingHours(): OperatingHourDay[] { return this.operatingHours; }
  toggleOperatingDay(dayName: string): OperatingHourDay[] {
    this.operatingHours = this.operatingHours.map((d) =>
      d.day === dayName ? { ...d, isOpen: !d.isOpen } : d
    );
    return this.operatingHours;
  }

  getAmenities(): AmenityItem[] { return this.amenities; }
  toggleAmenity(id: string): AmenityItem | undefined {
    const index = this.amenities.findIndex((a) => a.id === id);
    if (index === -1) return undefined;
    this.amenities[index] = { ...this.amenities[index], enabled: !this.amenities[index].enabled };
    return this.amenities[index];
  }

  getCancellationPolicy(): CancellationPolicyConfig { return this.cancellationPolicy; }
  updateCancellationPolicy(data: Partial<CancellationPolicyConfig>): CancellationPolicyConfig {
    this.cancellationPolicy = { ...this.cancellationPolicy, ...data };
    return this.cancellationPolicy;
  }
}
