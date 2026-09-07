import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Plus,
  Search,
  CheckCircle2,
  Clock,
  X,
  Edit2,
  Flame,
  Calendar,
  Layers,
  Building2,
  ShieldCheck,
  Sun,
  ChevronLeft,
  Lock,
  Trash2,
  AlertTriangle,
  Power,
} from 'lucide-react';
import { Court } from '../types';
import { haptics } from '../utils/haptics';
import { EditCourtModal } from '../components/EditCourtModal';
import { AddCourtModal } from '../components/AddCourtModal';
import { motion, AnimatePresence } from 'motion/react';

export const CourtsScreen: React.FC = () => {
  const { currentUser, courts, goBack, navigateTo, showToast, toggleCourtActive, deleteCourt } = useApp();
  const isStaff = currentUser?.type === 'staff';
  const [searchTerm, setSearchTerm] = useState('');
  const [sportFilter, setSportFilter] = useState('All');
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingCourt, setDeletingCourt] = useState<Court | null>(null);

  const sportsList = ['All', 'Football', 'Cricket', 'Badminton', 'Pickleball', 'Tennis'];

  const activeCount = courts.filter((c) => c.isActive !== false).length;
  const inactiveCount = courts.filter((c) => c.isActive === false).length;

  const filteredCourts = courts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.displayName && c.displayName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSport = sportFilter === 'All' || c.sports.includes(sportFilter);
    return matchesSearch && matchesSport;
  });

  const handleOpenAddModal = () => {
    haptics.tap();
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setShowAddModal(true);
    } else {
      navigateTo('add_court');
    }
  };

  const handleDeleteConfirm = () => {
    if (!deletingCourt) return;
    deleteCourt(deletingCourt.id);
    setDeletingCourt(null);
  };

  return (
    <div className="pb-20 pt-2 w-full space-y-6">
      {/* Mobile Back Button */}
      <button
        onClick={() => { haptics.tap(); goBack(); }}
        className="md:hidden flex items-center gap-1.5 text-[12.5px] font-bold text-[#FF6B2C] active-press cursor-pointer pb-1"
      >
        <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
        <span>Back to Settings</span>
      </button>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E6E1]/70">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[24px] font-black text-[#171717] tracking-tight">Courts & Grounds</h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-[#FF6B2C]/10 text-[#FF6B2C]">
              {courts.length} Facility Pitches
            </span>
          </div>
          <p className="text-[12.5px] font-medium text-[#777570]">
            Manage court configurations, pricing, active status & availability
          </p>
        </div>

        {isStaff ? (
          <div className="h-10 px-4 rounded-xl bg-[#F1F0EC] border border-[#E8E6E1] text-[#777570] font-bold text-[12.5px] flex items-center justify-center gap-1.5 shadow-2xs self-start sm:self-auto cursor-not-allowed">
            <Lock className="w-3.5 h-3.5 text-[#777570]" />
            <span>View Only (Staff)</span>
          </div>
        ) : (
          <button
            id="btn-open-add-court"
            onClick={handleOpenAddModal}
            className="h-10 px-4 rounded-xl bg-gradient-to-r from-[#FF6B2C] to-[#FF5410] hover:from-[#e85b1e] hover:to-[#db4a0b] text-white font-extrabold text-[13px] flex items-center justify-center gap-2 shadow-sm hover:shadow-md active-press cursor-pointer transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Add New Court</span>
          </button>
        )}
      </div>

      {/* KPI Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-[#E8E6E1] shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#777570]">Total Courts</p>
          <p className="text-[22px] font-black text-[#171717] mt-1">{courts.length}</p>
          <p className="text-[11px] font-semibold text-[#777570] mt-0.5">Facility grounds</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#2FA66A]/30 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#2FA66A]">Active</p>
          <p className="text-[22px] font-black text-[#2FA66A] mt-1">{activeCount}</p>
          <p className="text-[11px] font-semibold text-[#777570] mt-0.5">Open for bookings</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#E7A72F]/30 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#B87C0D]">Inactive</p>
          <p className="text-[22px] font-black text-[#B87C0D] mt-1">{inactiveCount}</p>
          <p className="text-[11px] font-semibold text-[#777570] mt-0.5">Paused / offline</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#E8E6E1] shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#777570]">Base Price Range</p>
          <p className="text-[22px] font-black text-[#171717] mt-1">₹500–₹1k</p>
          <p className="text-[11px] font-semibold text-[#FF6B2C] mt-0.5">Peak surge up to ₹1,400</p>
        </div>
      </div>

      {/* Filter & Search Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E8E6E1] shadow-2xs">
        <div className="relative flex items-center bg-[#F7F7F5] border border-[#E8E6E1] rounded-xl px-3.5 py-2 flex-1 md:max-w-md">
          <Search className="w-4 h-4 text-[#777570] mr-2.5 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search court name, sport or surface type..."
            className="w-full text-[13px] font-medium text-[#171717] bg-transparent focus:outline-none placeholder-[#A3A099]"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="p-1 text-[#777570] hover:text-[#171717] cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {sportsList.map((sport) => {
            const isSelected = sportFilter === sport;
            return (
              <button
                key={sport}
                onClick={() => { haptics.tap(); setSportFilter(sport); }}
                className={`px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-[#171717] text-white shadow-xs'
                    : 'bg-[#F7F7F5] text-[#777570] hover:text-[#171717] hover:bg-[#EBE9E3] border border-[#E8E6E1]'
                }`}
              >
                {sport}
              </button>
            );
          })}
        </div>
      </div>

      {/* Courts Responsive Grid */}
      {filteredCourts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-[#E8E6E1] text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-[#F7F7F5] text-[#777570] flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-[16px] font-extrabold text-[#171717]">No courts match your search</h3>
          <p className="text-[13px] text-[#777570] max-w-sm mx-auto">
            Try adjusting your search query or sport filter to see available facility grounds.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredCourts.map((court) => {
            const isActive = court.isActive !== false;
            return (
              <div
                key={court.id}
                className={`bg-white rounded-3xl p-5 border shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group ${
                  isActive
                    ? 'border-[#E8E6E1] hover:border-[#171717]/20'
                    : 'border-[#E8E6E1] opacity-75'
                }`}
              >
                {/* Top Card Info */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-[18px] font-black tracking-tight transition-colors ${
                        isActive ? 'text-[#171717] group-hover:text-[#FF6B2C]' : 'text-[#777570]'
                      }`}>
                        {court.name}
                      </h3>
                      {court.displayName && court.displayName !== court.name && (
                        <p className="text-[12px] font-semibold text-[#777570] mt-0.5 truncate">
                          {court.displayName}
                        </p>
                      )}
                    </div>

                    {/* Active / Inactive Status Badge */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-extrabold flex items-center gap-1 ${
                        isActive
                          ? 'bg-[#2FA66A]/15 text-[#1E774A]'
                          : 'bg-[#E7A72F]/15 text-[#B87C0D]'
                      }`}>
                        <CheckCircle2 className="w-3 h-3" />
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Active / Inactive Toggle */}
                  <div className="mt-3 flex items-center justify-between bg-[#F7F7F5] rounded-xl px-3.5 py-2.5 border border-[#E8E6E1]">
                    <div className="flex items-center gap-2">
                      <Power className={`w-3.5 h-3.5 ${isActive ? 'text-[#2FA66A]' : 'text-[#A3A099]'}`} />
                      <span className="text-[12px] font-bold text-[#171717]">
                        {isActive ? 'Court is Active' : 'Court is Inactive'}
                      </span>
                    </div>
                    {/* Toggle Switch */}
                    <button
                      id={`toggle-court-active-${court.id}`}
                      disabled={isStaff}
                      onClick={() => toggleCourtActive(court.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer focus:outline-none disabled:cursor-not-allowed ${
                        isActive ? 'bg-[#2FA66A]' : 'bg-[#D1CFCA]'
                      }`}
                      aria-label={isActive ? 'Deactivate court' : 'Activate court'}
                    >
                      <span
                        className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                          isActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                        style={{ width: '18px', height: '18px' }}
                      />
                    </button>
                  </div>

                  {/* Sports & Spec Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                    {court.sports.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-0.5 rounded-lg bg-[#F7F7F5] border border-[#E8E6E1] text-[#171717] text-[11px] font-bold"
                      >
                        {s}
                      </span>
                    ))}
                    <span className="px-2 py-0.5 rounded-lg bg-[#FF6B2C]/10 text-[#FF6B2C] text-[10.5px] font-extrabold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Min: {court.minBookingDuration || '1 hour'}</span>
                    </span>
                    {court.type && (
                      <span className="px-2 py-0.5 rounded-lg bg-[#171717]/5 text-[#171717] text-[10.5px] font-bold">
                        {court.type}
                      </span>
                    )}
                    {court.samePhysicalSports && (
                      <span className="px-2 py-0.5 rounded-lg bg-[#2FA66A]/10 text-[#2FA66A] text-[10.5px] font-extrabold flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        <span>{court.parentCourtName ? `Shares ${court.parentCourtName}` : 'Shared Ground'}</span>
                      </span>
                    )}
                  </div>

                  {/* Pricing Container */}
                  <div className="mt-3.5 bg-[#FAF9F6] rounded-2xl p-3 border border-[#E8E6E1] space-y-2 text-[11.5px]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#777570]">Standard Hourly Rate</span>
                      <span className="text-[15px] font-black text-[#171717]">
                        ₹{(court.pricePerHour || 1000).toLocaleString('en-IN')}/hr
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1.5 border-t border-[#E8E6E1]/60">
                      <span className="font-bold text-[#FF6B2C] flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" />
                        <span>Peak Hours Rate</span>
                        <span className="text-[10px] font-normal text-[#777570]">
                          ({court.peakHoursStart || '06:00 PM'}–{court.peakHoursEnd || '11:00 PM'})
                        </span>
                      </span>
                      <span className="text-[13px] font-black text-[#FF6B2C]">
                        ₹{(court.peakHoursPrice || (court.pricePerHour || 1000) + 400).toLocaleString('en-IN')}/hr
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1.5 border-t border-[#E8E6E1]/60">
                      <span className="font-bold text-[#171717] flex items-center gap-1">
                        <Sun className="w-3.5 h-3.5 text-[#B87C0D]" />
                        <span>Weekend Rate</span>
                        <span className="text-[10px] font-normal text-[#777570]">
                          ({court.peakDays?.join(', ') || 'Fri, Sat, Sun'})
                        </span>
                      </span>
                      <span className="text-[13px] font-black text-[#171717]">
                        ₹{(court.weekendPrice || (court.pricePerHour || 1000) + 500).toLocaleString('en-IN')}/hr
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1.5 border-t border-[#E8E6E1]/60 text-[10.5px]">
                      <span className="font-semibold text-[#777570]">Operating Hours</span>
                      <span className="font-black text-[#171717]">{court.operatingHours || '06:00 AM – 11:00 PM'}</span>
                    </div>
                  </div>

                  {/* Surface Description */}
                  {(court.statusDetails || court.type) && (
                    <p className="text-[11.5px] font-medium text-[#777570] mt-2.5 line-clamp-2">
                      {court.statusDetails || `${court.type || 'Outdoor'} turf pitch with standard markings`}
                    </p>
                  )}

                  {/* Cancellation Policy Tag */}
                  <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-bold text-[#777570] bg-[#FAF9F6] border border-[#E8E6E1] px-2.5 py-1.5 rounded-xl">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#2FA66A] shrink-0" />
                    <span className="truncate">
                      {court.cancellationPolicyLabel ||
                        (court.cancellationWindowHours !== undefined
                          ? court.cancellationWindowHours === 0
                            ? 'Non-Refundable'
                            : `Cancel up to ${court.cancellationWindowHours}h (${court.refundPercentage || 100}% refund)`
                          : 'Free cancel up to 12h (100% refund)')}
                    </span>
                  </div>
                </div>

                {/* Action Buttons Footer */}
                <div className="pt-4 mt-4 border-t border-[#F1F0EC] flex items-center gap-2">
                  <button
                    onClick={() => { haptics.tap(); navigateTo('slots'); }}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#F7F7F5] hover:bg-[#EBE9E3] text-[#171717] text-[12px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#777570]" />
                    <span>View Slots</span>
                  </button>

                  {!isStaff && (
                    <>
                      <button
                        onClick={() => { haptics.tap(); setEditingCourt(court); }}
                        className="py-2 px-3 rounded-xl bg-white hover:bg-[#F7F7F5] border border-[#E8E6E1] text-[#171717] text-[12px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer active-press"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-[#777570]" />
                        <span>Edit</span>
                      </button>

                      <button
                        id={`btn-delete-court-${court.id}`}
                        onClick={() => { haptics.tap(); setDeletingCourt(court); }}
                        className="py-2 px-2.5 rounded-xl bg-white hover:bg-red-50 border border-[#E8E6E1] hover:border-red-200 text-[#A3A099] hover:text-red-600 text-[12px] font-bold flex items-center justify-center transition-colors cursor-pointer active-press"
                        aria-label={`Delete ${court.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Court Modal */}
      <EditCourtModal
        court={editingCourt}
        isOpen={!!editingCourt}
        onClose={() => setEditingCourt(null)}
      />

      {/* Add Court Modal (desktop only) */}
      <AddCourtModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingCourt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center px-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) setDeletingCourt(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 12 }}
              transition={{ type: 'spring', damping: 22, stiffness: 340 }}
              className="bg-white rounded-3xl shadow-2xl border border-[#E8E6E1] p-6 w-full max-w-sm space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon Header */}
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7 text-red-500 stroke-[2]" />
                </div>
                <div>
                  <h3 className="text-[18px] font-black text-[#171717] tracking-tight">Delete Court?</h3>
                  <p className="text-[13px] font-medium text-[#777570] mt-1 leading-relaxed">
                    You are about to permanently delete{' '}
                    <strong className="text-[#171717]">{deletingCourt.name}</strong>
                    {deletingCourt.displayName && deletingCourt.displayName !== deletingCourt.name
                      ? ` (${deletingCourt.displayName})`
                      : ''}
                    . This action cannot be undone.
                  </p>
                </div>
              </div>

              {/* Consequence Warning */}
              <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 space-y-1.5">
                <p className="text-[12px] font-extrabold text-red-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  What will be deleted:
                </p>
                <ul className="text-[11.5px] font-medium text-red-600 space-y-0.5 list-disc list-inside">
                  <li>Court configuration, pricing & rules</li>
                  <li>Sport layout and schedule settings</li>
                  <li>All slot associations linked to this court</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5">
                <button
                  id={`btn-cancel-delete-${deletingCourt.id}`}
                  type="button"
                  onClick={() => setDeletingCourt(null)}
                  className="flex-1 h-11 rounded-2xl bg-[#F7F7F5] hover:bg-[#EBE9E3] border border-[#E8E6E1] text-[#171717] font-bold text-[14px] transition-colors cursor-pointer active-press"
                >
                  Cancel
                </button>
                <button
                  id={`btn-confirm-delete-${deletingCourt.id}`}
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="flex-1 h-11 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-[14px] flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer active-press"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Court
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
