import { Injectable } from '@nestjs/common';
import { StaffMember } from '../types';
import { initialStaffMembers } from '../data/mock-data';

@Injectable()
export class StaffService {
  private staff: StaffMember[] = [...initialStaffMembers];

  findAll(): StaffMember[] { return this.staff; }

  create(data: Omit<StaffMember, 'id'>): StaffMember {
    const member: StaffMember = { ...data, id: `st-${Date.now()}` };
    this.staff.push(member);
    return member;
  }

  toggleStatus(id: string): StaffMember | undefined {
    const index = this.staff.findIndex((s) => s.id === id);
    if (index === -1) return undefined;
    const nextStatus = this.staff[index].status === 'Active' ? 'Inactive' : 'Active';
    this.staff[index] = { ...this.staff[index], status: nextStatus };
    return this.staff[index];
  }

  updatePermissions(id: string, permKey: string): StaffMember | undefined {
    const index = this.staff.findIndex((s) => s.id === id);
    if (index === -1) return undefined;
    this.staff[index] = {
      ...this.staff[index],
      permissions: { ...this.staff[index].permissions, [permKey]: !this.staff[index].permissions[permKey as keyof StaffMember['permissions']] },
    };
    return this.staff[index];
  }
}
