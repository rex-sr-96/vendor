import { Injectable, NotFoundException } from '@nestjs/common';
import { StaffMember } from '../types';
import { initialStaffMembers } from '../data/mock-data';

@Injectable()
export class StaffService {
  private staff: StaffMember[] = [...initialStaffMembers];

  findAll(filters?: { role?: string; status?: string; query?: string }): StaffMember[] {
    let result = [...this.staff];

    if (filters?.role && filters.role !== 'ALL') {
      result = result.filter(
        (s) => s.role.toLowerCase() === filters.role!.toLowerCase(),
      );
    }

    if (filters?.status && filters.status !== 'ALL') {
      result = result.filter(
        (s) => s.status.toLowerCase() === filters.status!.toLowerCase(),
      );
    }

    if (filters?.query && filters.query.trim() !== '') {
      const q = filters.query.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.phone.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q),
      );
    }

    return result;
  }

  create(data: Omit<StaffMember, 'id'>): StaffMember {
    const member: StaffMember = {
      ...data,
      id: `st-${Date.now()}`,
      status: data.status || 'Active',
      permissions: data.permissions || {
        manageBookings: true,
        collectCash: false,
        blockSlots: false,
        viewFinances: false,
        editPricing: false,
      },
    };
    this.staff.unshift(member);
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
      permissions: {
        ...this.staff[index].permissions,
        [permKey]: !this.staff[index].permissions[permKey as keyof StaffMember['permissions']],
      },
    };
    return this.staff[index];
  }

  deleteStaff(id: string): { success: boolean; message: string; deletedId: string } {
    const index = this.staff.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new NotFoundException(`Staff member with ID '${id}' not found`);
    }
    const removed = this.staff.splice(index, 1)[0];
    return {
      success: true,
      message: `Staff member '${removed.name}' deleted successfully`,
      deletedId: id,
    };
  }
}

