import { Injectable } from '@nestjs/common';
import { SettlementRecord } from '../types';
import { initialSettlements } from '../data/mock-data';

@Injectable()
export class SettlementsService {
  private settlements: SettlementRecord[] = [...initialSettlements];

  findAll(): SettlementRecord[] {
    return this.settlements;
  }

  requestInstant(amount: number = 12800): SettlementRecord {
    const settlement: SettlementRecord = {
      id: `SET-${Date.now()}`,
      utrNumber: `IMPS${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      settledAmount: amount,
      grossAmount: amount,
      feeDeductions: 0,
      date: '28 Aug 2026',
      time: 'Just now',
      bankName: 'HDFC Bank',
      accountMasked: '•••• 4321',
      status: 'Settled',
      period: 'Instant On-Demand Payout',
      payoutMode: 'Instant IMPS',
    };
    this.settlements.unshift(settlement);
    return settlement;
  }
}
