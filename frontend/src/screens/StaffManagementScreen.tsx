import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Plus,
  Phone,
  Mail,
  Edit2,
  X,
  UserCheck,
  Shield,
  Users,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { haptics } from '../utils/haptics';
import { StaffMember } from '../types';
import { motion, AnimatePresence } from 'motion/react';

type RoleType = StaffMember['role'] | 'Receptionist';

const AVAILABLE_ROLES: { role: RoleType; label: string; desc: string }[] = [
  { role: 'Manager', label: 'Venue Manager', desc: 'Overall ground operations & staff lead' },
  { role: 'Cashier', label: 'Cashier / Billing', desc: 'Counter payments, cash register & UPI bills' },
  { role: 'Groundkeeper', label: 'Groundkeeper', desc: 'Pitch grooming, floodlights & net maintenance' },
  { role: 'Coach', label: 'Coach / Trainer', desc: 'Training academy matches & practice drills' },
];

export const StaffManagementScreen: React.FC = () => {
  const {
    staffMembers,
    addStaffMember,
    updateStaffMember,
    toggleStaffStatus,
    goBack,
    showToast,
  } = useApp();

  // Add Staff Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<RoleType>('Cashier');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  // Edit Staff Modal State (Anyone can update)
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editRole, setEditRole] = useState<RoleType>('Cashier');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');

  const activeStaffCount = staffMembers.filter((s) => s.status === 'Active').length;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      showToast('Missing Fields', 'Please provide staff name and phone number.', 'warning');
      return;
    }
    haptics.success();
    addStaffMember({
      name: name.trim(),
      role: role as StaffMember['role'],
      phone: phone.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@turftown.in`,
      shift: 'Standard',
      status: 'Active',
      permissions: {
        manageBookings: true,
        collectCash: true,
        blockSlots: true,
        viewFinances: true,
        editPricing: false,
      },
    });

    setName('');
    setPhone('');
    setEmail('');
    setShowAddModal(false);
  };

  const openEditModal = (staff: StaffMember) => {
    haptics.tap();
    setEditingStaff(staff);
    setEditName(staff.name);
    setEditRole(staff.role as RoleType);
    setEditPhone(staff.phone);
    setEditEmail(staff.email);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    if (!editName.trim() || !editPhone.trim()) {
      showToast('Missing Fields', 'Please provide staff name and phone number.', 'warning');
      return;
    }

    haptics.success();
    updateStaffMember(editingStaff.id, {
      name: editName.trim(),
      role: editRole as StaffMember['role'],
      phone: editPhone.trim(),
      email: editEmail.trim(),
    });

    setEditingStaff(null);
  };

  const getRoleBadge = (r: string) => {
    switch (r) {
      case 'Manager':
        return 'bg-[#FF6B2C]/10 text-[#FF6B2C] border-[#FF6B2C]/20';
      case 'Cashier':
        return 'bg-[#2FA66A]/10 text-[#1E774A] border-[#2FA66A]/20';
      case 'Groundkeeper':
        return 'bg-[#3B82F6]/10 text-[#2563EB] border-[#3B82F6]/20';
      case 'Coach':
        return 'bg-[#8B5CF6]/10 text-[#7C3AED] border-[#8B5CF6]/20';
      default:
        return 'bg-[#E7A72F]/10 text-[#B87C0D] border-[#E7A72F]/20';
    }
  };

  return (
    <div className="pb-20 pt-2 w-full space-y-6 select-none relative">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E6E1]/70">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[24px] font-black text-[#171717] tracking-tight">Staff & Roles</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-[#2FA66A]/10 text-[#2FA66A]">
              {activeStaffCount} of {staffMembers.length} Active
            </span>
          </div>
          <p className="text-[12.5px] font-medium text-[#777570]">
            Assign normal operational roles to arena team members without complex permission rules
          </p>
        </div>

        <button
          onClick={() => {
            haptics.tap();
            setShowAddModal(true);
          }}
          className="h-10 px-4 rounded-xl bg-[#171717] hover:bg-[#2b2b2b] text-white font-extrabold text-[13px] flex items-center justify-center gap-2 shadow-xs active-press cursor-pointer transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3] text-[#FF6B2C]" />
          <span>+ Add Staff Member</span>
        </button>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-[#E8E6E1] shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#777570]">Total Staff</p>
          <p className="text-[22px] font-black text-[#171717] mt-1">{staffMembers.length}</p>
          <p className="text-[11px] font-semibold text-[#2FA66A] mt-0.5">All accounts registered</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#E8E6E1] shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#777570]">Active On Ground</p>
          <p className="text-[22px] font-black text-[#2FA66A] mt-1">{activeStaffCount}</p>
          <p className="text-[11px] font-semibold text-[#777570] mt-0.5">Enabled for venue duty</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#E8E6E1] shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#777570]">Managers</p>
          <p className="text-[22px] font-black text-[#FF6B2C] mt-1">
            {staffMembers.filter((s) => s.role === 'Manager').length}
          </p>
          <p className="text-[11px] font-semibold text-[#777570] mt-0.5">Lead operations</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#E8E6E1] shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#777570]">Cashiers & Ops</p>
          <p className="text-[22px] font-black text-[#171717] mt-1">
            {staffMembers.filter((s) => s.role !== 'Manager').length}
          </p>
          <p className="text-[11px] font-semibold text-[#777570] mt-0.5">Ground & billing staff</p>
        </div>
      </div>

      {/* Staff Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {staffMembers.map((staff) => (
          <div
            key={staff.id}
            className="bg-white rounded-2xl p-4 border border-[#E8E6E1] shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Header: Avatar, Name, Role Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#171717] text-white flex items-center justify-center font-black text-[15px] shrink-0">
                    {staff.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-[15px] font-black text-[#171717] tracking-tight">{staff.name}</h3>
                    <span
                      className={`inline-block mt-0.5 px-2 py-0.5 rounded-md text-[10.5px] font-extrabold border ${getRoleBadge(
                        staff.role
                      )}`}
                    >
                      {staff.role}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <span
                  className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                    staff.status === 'Active'
                      ? 'bg-[#2FA66A]/10 text-[#1E774A]'
                      : 'bg-[#D94B4B]/10 text-[#D94B4B]'
                  }`}
                >
                  {staff.status}
                </span>
              </div>

              {/* Contact Details */}
              <div className="mt-3.5 p-3 rounded-xl bg-[#FAF9F6] border border-[#E8E6E1] space-y-1.5 text-[12px] font-medium text-[#777570]">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#FF6B2C]" />
                  <span className="font-bold text-[#171717]">{staff.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#777570]" />
                  <span className="truncate">{staff.email}</span>
                </div>
              </div>
            </div>

            {/* Actions Footer: Direct Edit & Status Toggle */}
            <div className="pt-3 border-t border-[#F1F0EC] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => openEditModal(staff)}
                className="px-3 py-1.5 rounded-xl bg-[#FAF9F6] hover:bg-[#F1F0EC] border border-[#E8E6E1] text-[12px] font-bold text-[#171717] flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-[#FF6B2C]" />
                <span>Edit Staff</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  haptics.tap();
                  toggleStaffStatus(staff.id);
                  showToast(
                    'Status Changed',
                    `${staff.name} is now ${staff.status === 'Active' ? 'Inactive' : 'Active'}.`,
                    'info'
                  );
                }}
                className={`px-3 py-1.5 rounded-xl text-[11.5px] font-bold cursor-pointer transition-colors ${
                  staff.status === 'Active'
                    ? 'bg-[#D94B4B]/10 hover:bg-[#D94B4B]/20 text-[#D94B4B]'
                    : 'bg-[#2FA66A]/10 hover:bg-[#2FA66A]/20 text-[#1E774A]'
                }`}
              >
                {staff.status === 'Active' ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD NEW STAFF MEMBER (Normal Role Only)                          */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
            <div className="absolute inset-0" onClick={() => setShowAddModal(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-5 border border-[#E8E6E1] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#F1F0EC]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FF6B2C]/10 text-[#FF6B2C] flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-black text-[#171717]">Add Staff Member</h3>
                    <p className="text-[11px] text-[#777570]">Select normal operational role</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-7 h-7 rounded-full bg-[#F1F0EC] flex items-center justify-center text-[#777570] hover:text-[#171717] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#777570] mb-1">
                    Full Name <span className="text-[#FF6B2C]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suresh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-[12.5px] font-bold text-[#171717] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#777570] mb-1">
                    Phone Number <span className="text-[#FF6B2C]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-[12.5px] font-bold text-[#171717] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#777570] mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="suresh@turftown.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-[12.5px] font-bold text-[#171717] focus:outline-none"
                  />
                </div>

                {/* Normal Role Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-[#777570] mb-1.5">
                    Assign Normal Role <span className="text-[#FF6B2C]">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {AVAILABLE_ROLES.map((r) => {
                      const isSelected = role === r.role;
                      return (
                        <button
                          key={r.role}
                          type="button"
                          onClick={() => setRole(r.role)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#171717] text-white border-[#171717] shadow-xs'
                              : 'bg-[#FAF9F6] border-[#E8E6E1] text-[#171717] hover:bg-[#F1F0EC]'
                          }`}
                        >
                          <span className="text-[12px] font-black block">{r.label}</span>
                          <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-white/70' : 'text-[#777570]'}`}>
                            {r.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-10 rounded-xl bg-[#FF6B2C] hover:bg-[#e85b1e] text-white font-black text-[13px] flex items-center justify-center gap-1.5 shadow-sm active-press cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Save Staff Member</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT STAFF MEMBER (Anyone Can Update Directly)                  */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {editingStaff && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
            <div className="absolute inset-0" onClick={() => setEditingStaff(null)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-5 border border-[#E8E6E1] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#F1F0EC]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#171717] text-white flex items-center justify-center">
                    <Edit2 className="w-4 h-4 text-[#FF6B2C]" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-black text-[#171717]">Edit Staff & Role</h3>
                    <p className="text-[11px] text-[#777570]">Update name, contact & assigned role</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="w-7 h-7 rounded-full bg-[#F1F0EC] flex items-center justify-center text-[#777570] hover:text-[#171717] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#777570] mb-1">
                    Staff Name <span className="text-[#FF6B2C]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-[12.5px] font-bold text-[#171717] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#777570] mb-1">
                    Phone Number <span className="text-[#FF6B2C]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-[12.5px] font-bold text-[#171717] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#777570] mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-[12.5px] font-bold text-[#171717] focus:outline-none"
                  />
                </div>

                {/* Normal Role Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-[#777570] mb-1.5">Assigned Normal Role</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {AVAILABLE_ROLES.map((r) => {
                      const isSelected = editRole === r.role;
                      return (
                        <button
                          key={r.role}
                          type="button"
                          onClick={() => setEditRole(r.role)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#171717] text-white border-[#171717] shadow-xs'
                              : 'bg-[#FAF9F6] border-[#E8E6E1] text-[#171717] hover:bg-[#F1F0EC]'
                          }`}
                        >
                          <span className="text-[12px] font-black block">{r.label}</span>
                          <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-white/70' : 'text-[#777570]'}`}>
                            {r.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-10 rounded-xl bg-[#171717] hover:bg-[#2b2b2b] text-white font-black text-[13px] flex items-center justify-center gap-1.5 shadow-sm active-press cursor-pointer transition-colors"
                  >
                    <span>Update Staff Member</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
