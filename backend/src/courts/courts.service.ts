import { Injectable } from '@nestjs/common';
import { Court } from '../types';
import { initialCourts } from '../data/mock-data';

@Injectable()
export class CourtsService {
  private courts: Court[] = [...initialCourts];

  findAll(): Court[] {
    return this.courts;
  }

  create(data: Partial<Court>): Court {
    const court: Court = {
      id: `court-${Date.now()}`,
      name: data.name || 'New Turf',
      displayName: data.displayName,
      samePhysicalSports: data.samePhysicalSports ?? false,
      sports: data.sports?.length ? data.sports : ['Football'],
      pricePerHour: data.pricePerHour || 1000,
      status: 'Pending Approval',
      statusDetails: 'Submitted just now · Under fast review',
      operatingHours: data.operatingHours || '06:00 AM – 11:00 PM',
      type: data.type || 'Outdoor',
    };
    this.courts.push(court);
    return court;
  }
}
