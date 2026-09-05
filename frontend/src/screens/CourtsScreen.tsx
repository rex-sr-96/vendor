import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Edit2,
  Flame,
  Calendar,
  Layers,
  Building2,
  Zap,
  Sparkles,
  Sliders,
  DollarSign,
  ShieldCheck,
  MoreVertical,
  Sun,
  ChevronLeft,
} from 'lucide-react';
import { CourtStatus, Court } from '../types';
import { haptics } from '../utils/haptics';
import { EditCourtModal } from '../components/EditCourtModal';

export const CourtsScreen: React.FC = () => {
  const { courts, goBack, navigateTo, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [sportFilter, setSportFilter] = useState('All');
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);

  const sportsList = ['All', 'Football', 'Cricket', 'Badminton', 'Pickleball', 'Tennis'];

  const filteredCourts = courts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.displayName && c.displayName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSport = sportFilter === 'All' || c.sports.includes(sportFilter);
    return matchesSearch && matchesSport;
  });

  const getStatusBadge = (status: CourtStatus) => {
    if (status === 'Approved') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#2FA66A]/15 text-[#1E774A] flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Approved & Live
        </span>
      );
    }
    if (status === 'Pending Approval') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E7A72F]/15 text-[#B87C0D] flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Pending Approval
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#D94B4B]/15 text-[#B52B2B] flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        Rejected
      </span>
    );
  };

  const handleOpenAddModal = () => {
    haptics.tap();
    navigateTo('add_court');
  };

  return (
    <div className="pb-20 pt-2 w-full space-y-6">
      {/* Mobile Back Button */}
      <button
        onClick={() => {
          haptics.tap();
          goBack();
        }}
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
            Manage court configurations, sport layouts, pricing rates & peak multipliers
          </p>
        </div>

        <button
          id="btn-open-add-court"
          onClick={handleOpenAddModal}
          className="h-10 px-4 rounded-xl bg-gradient-to-r from-[#FF6B2C] to-[#FF5410] hover:from-[#e85b1e] hover:to-[#db4a0b] text-white font-extrabold text-[13px] flex items-center justify-center gap-2 shadow-sm hover:shadow-md active-press cursor-pointer transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Add New Court</span>
        </button>
      </div>

      {/* Top KPI Metrics Bar for Desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-[#E8E6E1] shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#777570]">Total Courts</p>
          <p className="text-[22px] font-black text-[#171717] mt-1">{courts.length}</p>
          <p className="text-[11px] font-semibold text-[#2FA66A] mt-0.5">All 100% Operational</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#E8E6E1] shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#777570]">Approved & Live</p>
          <p className="text-[22px] font-black text-[#2FA66A] mt-1">
            {courts.filter((c) => c.status === 'Approved').length}
          </p>
          <p className="text-[11px] font-semibold text-[#777570] mt-0.5">Ready for slot locking</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#E8E6E1] shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#777570]">Base Price Range</p>
          <p className="text-[22px] font-black text-[#171717] mt-1">₹800 – ₹1,000</p>
          <p className="text-[11px] font-semibold text-[#FF6B2C] mt-0.5">Peak surge up to ₹1,400</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#E8E6E1] shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#777570]">Sports Configured</p>
          <p className="text-[22px] font-black text-[#171717] mt-1">5 Sports</p>
          <p className="text-[11px] font-semibold text-[#777570] mt-0.5">Football, Cricket, Badminton...</p>
        </div>
      </div>

      {/* Filter & Search Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E8E6E1] shadow-2xs">
        {/* Search */}
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
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-[#777570] hover:text-[#171717] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sport Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {sportsList.map((sport) => {
            const isSelected = sportFilter === sport;
            return (
              <button
                key={sport}
                onClick={() => {
                  haptics.tap();
                  setSportFilter(sport);
                }}
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
          {filteredCourts.map((court) => (
            <div
              key={court.id}
              className="bg-white rounded-3xl p-5 border border-[#E8E6E1] shadow-2xs hover:shadow-md hover:border-[#171717]/20 transition-all flex flex-col justify-between group"
            >
              {/* Top Card Info */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-[18px] font-black text-[#171717] tracking-tight group-hover:text-[#FF6B2C] transition-colors">
                      {court.name}
                    </h3>
                    {court.displayName && court.displayName !== court.name && (
                      <p className="text-[12px] font-semibold text-[#777570] mt-0.5">
                        {court.displayName}
                      </p>
                    )}
                  </div>
                  {getStatusBadge(court.status)}
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
                    <span className="px-2 py-0.5 rounded-lg bg-[#2FA66A]/10 text-[#2FA66A] text-[10px] font-bold">
                      Shared Ground
                    </span>
                  )}
                </div>

                {/* Pricing & Surface Rates Container */}
                <div className="mt-3.5 bg-[#FAF9F6] rounded-2xl p-3 border border-[#E8E6E1] space-y-2 text-[11.5px]">
                  {/* Standard Rate */}
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#777570]">Standard Hourly Rate</span>
                    <span className="text-[15px] font-black text-[#171717]">
                      ₹{(court.pricePerHour || 1000).toLocaleString('en-IN')}/hr
                    </span>
                  </div>

                  {/* Peak Slot Rate */}
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

                  {/* Weekend Rate */}
                  <div className="flex items-center justify-between pt-1.5 border-t border-[#E8E6E1]/60">
                    <span className="font-bold text-[#171717] flex items-center gap-1">
                      <Sun className="w-3.5 h-3.5 text-[#B87C0D]" />
                      <span>Weekend Flat Rate</span>
                      <span className="text-[10px] font-normal text-[#777570]">
                        ({court.peakDays?.join(', ') || 'Fri, Sat, Sun'})
                      </span>
                    </span>
                    <span className="text-[13px] font-black text-[#171717]">
                      ₹{(court.weekendPrice || (court.pricePerHour || 1000) + 500).toLocaleString('en-IN')}/hr
                    </span>
                  </div>

                  {/* Operating Hours */}
                  <div className="flex items-center justify-between pt-1.5 border-t border-[#E8E6E1]/60 text-[10.5px]">
                    <span className="font-semibold text-[#777570]">Operating Hours</span>
                    <span className="font-black text-[#171717]">
                      {court.operatingHours || '06:00 AM – 11:00 PM'}
                    </span>
                  </div>
                </div>

                {/* Surface Description */}
                {(court.statusDetails || court.type) && (
                  <p className="text-[11.5px] font-medium text-[#777570] mt-2.5 line-clamp-2">
                    {court.statusDetails || `${court.type || 'Outdoor'} turf pitch with standard markings`}
                  </p>
                )}

                {/* Court-Specific Cancellation Policy Tag */}
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
                  onClick={() => {
                    haptics.tap();
                    navigateTo('slots');
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#F7F7F5] hover:bg-[#EBE9E3] text-[#171717] text-[12px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#777570]" />
                  <span>View Slots</span>
                </button>

                <button
                  onClick={() => {
                    haptics.tap();
                    setEditingCourt(court);
                  }}
                  className="py-2 px-3 rounded-xl bg-white hover:bg-[#F7F7F5] border border-[#E8E6E1] text-[#171717] text-[12px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer active-press"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#777570]" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Court Modal */}
      <EditCourtModal
        court={editingCourt}
        isOpen={!!editingCourt}
        onClose={() => setEditingCourt(null)}
      />
    </div>
  );
};
