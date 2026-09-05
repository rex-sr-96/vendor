import { Injectable } from '@nestjs/common';
import { SupportTicket } from '../types';
import { initialSupportTickets } from '../data/mock-data';

@Injectable()
export class SupportService {
  private tickets: SupportTicket[] = [...initialSupportTickets];

  findAll(): SupportTicket[] { return this.tickets; }

  create(data: Omit<SupportTicket, 'id' | 'status' | 'date'>): SupportTicket {
    const ticket: SupportTicket = {
      ...data,
      id: `SUP${Math.floor(10235 + Math.random() * 50)}`,
      status: 'Open',
      date: '28 Aug 2026',
    };
    this.tickets.unshift(ticket);
    return ticket;
  }
}
