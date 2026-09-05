import { Injectable } from '@nestjs/common';
import { Slot } from '../types';
import { initialSlots } from '../data/mock-data';

@Injectable()
export class SlotsService {
  private slots: Slot[] = [...initialSlots];

  findAll(): Slot[] {
    return this.slots;
  }

  blockSlot(data: { courtId: string; courtName: string; time: string; reason: string; type: string; notes?: string }): Slot {
    const stateMap: Record<string, Slot['state']> = {
      maintenance: 'maintenance', coaching: 'coaching', tournament: 'tournament',
      private: 'booked', owner_block: 'maintenance',
    };
    const newSlot: Slot = {
      id: `slot-custom-${Date.now()}`,
      courtId: data.courtId,
      courtName: data.courtName,
      sport: 'Football',
      time: data.time,
      timeFull: `${data.time} Slot`,
      state: stateMap[data.type] || 'maintenance',
      reason: data.reason,
      price: 1000,
      notes: data.notes || `Blocked for ${data.type}`,
    };
    this.slots = [newSlot, ...this.slots.filter((s) => !(s.courtId === data.courtId && s.time === data.time))];
    return newSlot;
  }

  unblockSlot(slotId: string): Slot | undefined {
    const index = this.slots.findIndex((s) => s.id === slotId);
    if (index === -1) return undefined;
    this.slots[index] = {
      ...this.slots[index],
      state: 'available',
      customerName: undefined,
      customerPhone: undefined,
      reason: undefined,
      bookingId: undefined,
      notes: undefined,
    };
    return this.slots[index];
  }
}
