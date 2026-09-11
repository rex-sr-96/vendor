import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ChevronLeft,
  Plus,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  X,
  UserCheck,
} from 'lucide-react';
import { haptics } from '../utils/haptics';
import { StaffMember } from '../types';

export const StaffManagementScreen: React.FC = () => {
  const {
    staffMembers,
    addStaffMember,
    toggleStaffStatus,
    goBack,
    showToast,
  } = useApp();

  const [expandedStaffId, setExpandedStaffId] = useState<string | null>(staffMembers[0]?.id || null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<StaffMember['role']>('Cashier');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      showToast('Missing Fields', 'Please provide staff name and phone number.', 'warning');
      return;
    }
    haptics.success();
    addStaffMember({
      name: name.trim(),
      role,
      phone: phone.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@turftown.in`,
      shift: 'Standard',
      status: 'Active',
      permissions: {
        manageBookings: true,
        collectCash: role === 'Manager' || role === 'Cashier',
        blockSlots: role === 'Manager' || role === 'Groundkeeper',
        viewFinances: role === 'Manager',
        editPricing: false,
      },
    });

    setName('');
    setPhone('');
    setEmail('');
    setShowAddModal(false);
  };

  const getRoleBadge = (r: StaffMember['role']) => {
    switch (r) {
      case 'Manager':
        return 'bg-[#F94001]/10 text-[#F94001] border-[#F94001]/20';
      case 'Cashier':
        return 'bg-[#16A34A]/10 text-[#15803D] border-[#16A34A]/20';
      case 'Groundkeeper':
        return 'bg-[#3B82F6]/10 text-[#2563EB] border-[#3B82F6]/20';
      case 'Coach':
        return 'bg-[#8B5CF6]/10 text-[#7C3AED] border-[#8B5CF6]/20';
    }
  };

  return (
    <div className="pb-8 pt-3 px-4 w-full space-y-3.5 select-none relative">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              haptics.tap();
              goBack();
            }}
            className="w-9 h-9 -ml-1 rounded-xl flex items-center justify-center text-[#021526] hover:bg-[#E5E7EB]/50 active-press transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.4]" />
          </button>
          <div>
            <h1 className="text-[17px] font-extrabold text-[#021526] tracking-tight leading-none">
              Staff Management
            </h1>
            <span className="text-[11px] text-[#5F6368] mt-0.5 block">
              {staffMembers.filter((s) => s.status === 'Active').length} active staff accounts
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            haptics.tap();
            setShowAddModal(true);
          }}
          className="flex items-center gap-1 text-[11.5px] font-bold text-[#F94001] bg-[#F94001]/10 px-2.5 py-1.5 rounded-xl hover:bg-[#F94001]/20 active-press cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Staff</span>
        </button>
      </div>

      {/* Staff Cards List */}
      <div className="space-y-2.5">
        {staffMembers.map((staff) => {
          const isExpanded = expandedStaffId === staff.id;
          const isActive = staff.status === 'Active';

          return (
            <div
              key={staff.id}
              className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden transition-all"
            >
              {/* Header item */}
              <div
                onClick={() => {
                  haptics.tap();
                  setExpandedStaffId(isExpanded ? null : staff.id);
                }}
                className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#F3F4F4]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#F3F4F4] text-[#021526] font-extrabold flex items-center justify-center text-[15px] shrink-0">
                    {staff.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[14px] font-bold text-[#021526]">{staff.name}</h3>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getRoleBadge(
                          staff.role
                        )}`}
                      >
                        {staff.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11.5px] text-[#5F6368]">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#5F6368]" />
                        {staff.phone}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10.5px] font-bold flex items-center gap-1 ${
                      isActive ? 'text-[#16A34A]' : 'text-[#5F6368]'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isActive ? 'bg-[#16A34A]' : 'bg-[#5F6368]'
                      }`}
                    />
                    {staff.status}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#5F6368]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#5F6368]" />
                  )}
                </div>
              </div>

              {/* Expanded details (Email & Actions) */}
              {isExpanded && (
                <div className="px-3.5 pb-3.5 pt-2.5 border-t border-[#F3F4F4] space-y-3 bg-[#FBFBFA]/50">
                  {/* Email row */}
                  <div className="flex items-center gap-2 text-[12px] text-[#021526] bg-white p-2.5 rounded-xl border border-[#E5E7EB]">
                    <div className="w-6 h-6 rounded-lg bg-[#F3F4F4] flex items-center justify-center text-[#5F6368] shrink-0 border border-[#E5E7EB]">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-[#5F6368] uppercase block leading-tight">
                        Email Address
                      </span>
                      <span className="text-[12px] font-medium text-[#021526] truncate block">
                        {staff.email}
                      </span>
                    </div>
                  </div>

                  {/* Actions (Call & Toggle Status) */}
                  <div className="pt-0.5 flex items-center gap-2">
                    <a
                      href={`tel:${staff.phone}`}
                      onClick={() => haptics.tap()}
                      className="flex-1 h-9 rounded-xl bg-white border border-[#E5E7EB] text-[#021526] font-bold text-[12px] flex items-center justify-center gap-1.5 hover:bg-[#F3F4F4] active-press"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Staff</span>
                    </a>

                    <button
                      onClick={() => {
                        haptics.tap();
                        toggleStaffStatus(staff.id);
                      }}
                      className={`flex-1 h-9 rounded-xl font-bold text-[12px] flex items-center justify-center gap-1.5 active-press transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#DC2626]/10 text-[#DC2626] hover:bg-[#DC2626]/20'
                          : 'bg-[#16A34A]/10 text-[#15803D] hover:bg-[#16A34A]/20'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{isActive ? 'Mark Inactive' : 'Activate Account'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Staff Sheet Modal */}
      {showAddModal && (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs">
          <div
            className="w-full bg-white rounded-t-[32px] p-5 pb-8 border-t border-[#E5E7EB] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom-6 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* iOS Grab Handle */}
            <div className="w-10 h-1 bg-[#E5E7EB] rounded-full mx-auto mb-1" />

            <div className="flex items-center justify-between pb-2 border-b border-[#F3F4F4]">
              <div>
                <h2 className="text-[17px] font-extrabold text-[#021526] tracking-tight">Add Staff Member</h2>
                <p className="text-[11.5px] text-[#5F6368]">Create ground staff account & assign role</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  haptics.tap();
                  setShowAddModal(false);
                }}
                className="w-8 h-8 rounded-full bg-[#F3F4F4] flex items-center justify-center text-[#5F6368] hover:text-[#021526] active-press cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="text-[11.5px] font-bold text-[#5F6368] block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Suresh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] text-[13px] font-medium text-[#021526] focus:outline-none focus:border-[#F94001]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11.5px] font-bold text-[#5F6368] block mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] text-[13px] font-medium bg-white text-[#021526] focus:outline-none focus:border-[#F94001] cursor-pointer"
                  >
                    <option value="Manager">Manager</option>
                    <option value="Cashier">Cashier</option>
                    <option value="Groundkeeper">Groundkeeper</option>
                    <option value="Coach">Coach</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11.5px] font-bold text-[#5F6368] block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 00000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] text-[13px] font-medium text-[#021526] focus:outline-none focus:border-[#F94001]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11.5px] font-bold text-[#5F6368] block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. staff@turftown.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] text-[13px] font-medium text-[#021526] focus:outline-none focus:border-[#F94001]"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    haptics.tap();
                    setShowAddModal(false);
                  }}
                  className="flex-1 h-10 rounded-xl bg-[#F3F4F4] text-[#021526] font-bold text-[13px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-[#F94001] text-white font-bold text-[13px] shadow-xs hover:bg-[#D93600] cursor-pointer"
                >
                  Add Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
