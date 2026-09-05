import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ChevronLeft,
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
} from 'lucide-react';
import { CourtStatus } from '../types';
import { haptics } from '../utils/haptics';

export const CourtsScreen: React.FC = () => {
  const { courts, goBack, navigateTo } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [sportFilter, setSportFilter] = useState('All');

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
          Approved
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
    <div className="pb-28 pt-4 px-4 w-full max-w-md mx-auto space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={goBack}
            className="w-10 h-10 -ml-2 rounded-xl flex items-center justify-center text-[#171717] hover:bg-[#E8E6E1]/50 active-press cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
          </button>
          <div>
            <h1 className="text-[22px] font-bold text-[#171717]">Courts & Grounds</h1>
            <p className="text-[11px] text-[#777570]">Manage turfs, pricing & sports layouts</p>
          </div>
        </div>

        <button
          id="btn-open-add-court"
          onClick={handleOpenAddModal}
          className="h-9 px-3 rounded-xl bg-[#FF6B2C] text-white font-bold text-[12px] flex items-center gap-1.5 shadow-xs hover:bg-[#e85b1e] active-press cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Add Court</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative flex items-center bg-white border border-[#E8E6E1] rounded-[14px] px-3.5 py-2.5 shadow-2xs">
        <Search className="w-4 h-4 text-[#777570] mr-2.5 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search court or display name..."
          className="w-full text-[13.5px] font-medium text-[#171717] bg-transparent focus:outline-none placeholder-[#A3A099]"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-[#777570] hover:text-[#171717] p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Sport Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {['All', 'Football', 'Cricket', 'Badminton', 'Pickleball', 'Tennis'].map((sport) => (
          <button
            key={sport}
            onClick={() => {
              haptics.tap();
              setSportFilter(sport);
            }}
            className={`px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all active-press cursor-pointer ${
              sportFilter === sport
                ? 'bg-[#171717] text-white'
                : 'bg-white text-[#777570] border border-[#E8E6E1]'
            }`}
          >
            {sport}
          </button>
        ))}
      </div>

      {/* Court List */}
      <div className="space-y-3 pt-1">
        {filteredCourts.map((court) => (
          <div
            key={court.id}
            className="bg-white rounded-2xl p-4 border border-[#E8E6E1] shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[17px] font-bold text-[#171717]">{court.name}</h3>
                  {court.samePhysicalSports && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FAF9F6] text-[#777570] border border-[#E8E6E1] flex items-center gap-1">
                      <Layers className="w-3 h-3 text-[#FF6B2C]" />
                      Same Ground
                    </span>
                  )}
                </div>
                {court.displayName && (
                  <p className="text-[12px] font-medium text-[#777570] mt-0.5">
                    {court.displayName}
                  </p>
                )}
                <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                  {court.sports.map((sp) => (
                    <span
                      key={sp}
                      className="px-2 py-0.5 rounded-md bg-[#FAF9F6] text-[#171717] text-[10.5px] font-bold border border-[#E8E6E1]"
                    >
                      {sp}
                    </span>
                  ))}
                </div>
              </div>
              {getStatusBadge(court.status)}
            </div>

            {/* Pricing Section */}
            <div className="bg-[#FAF9F6] p-3 rounded-xl border border-[#E8E6E1]/80 space-y-2">
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-[#777570] font-medium">Regular Rate</span>
                <span className="font-extrabold text-[#171717] text-[15px]">
                  ₹{court.pricePerHour.toLocaleString('en-IN')}/hr
                </span>
              </div>

              {(court.peakHoursPrice || court.weekendPrice || court.minBookingDuration) && (
                <div className="pt-2 border-t border-[#E8E6E1] grid grid-cols-2 gap-2 text-[11px]">
                  {court.peakHoursPrice && (
                    <div className="flex items-center gap-1 text-[#FF6B2C] font-semibold">
                      <Flame className="w-3.5 h-3.5" />
                      <span>Peak: ₹{court.peakHoursPrice}/hr</span>
                    </div>
                  )}
                  {court.weekendPrice && (
                    <div className="flex items-center gap-1 text-[#171717] font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-[#2FA66A]" />
                      <span>Weekend: ₹{court.weekendPrice}/hr</span>
                    </div>
                  )}
                  {court.minBookingDuration && (
                    <div className="flex items-center gap-1 text-[#777570] font-medium col-span-2">
                      <Clock className="w-3.5 h-3.5 text-[#A3A099]" />
                      <span>Min Booking: {court.minBookingDuration}</span>
                    </div>
                  )}
                  {court.peakHoursStart && court.peakHoursEnd && (
                    <div className="text-[10px] text-[#A3A099] col-span-2">
                      Peak: {court.peakHoursStart} – {court.peakHoursEnd} ({court.peakDays?.join(', ') || 'Fri-Sun'})
                    </div>
                  )}
                </div>
              )}
            </div>

            {court.statusDetails && (
              <p
                className={`text-[12px] pt-1 ${
                  court.status === 'Rejected'
                    ? 'text-[#D94B4B] font-semibold'
                    : 'text-[#777570]'
                }`}
              >
                {court.statusDetails}
              </p>
            )}

            {court.status === 'Rejected' && (
              <button
                onClick={handleOpenAddModal}
                className="w-full mt-1 py-2 bg-[#D94B4B]/10 hover:bg-[#D94B4B]/20 text-[#D94B4B] rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit & Resubmit Court</span>
              </button>
            )}
          </div>
        ))}

        {filteredCourts.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center border border-[#E8E6E1] space-y-2">
            <Layers className="w-8 h-8 text-[#A3A099] mx-auto" />
            <h4 className="text-[15px] font-bold text-[#171717]">No Courts Found</h4>
            <p className="text-[12px] text-[#777570]">
              No courts match the selected filters or search query.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
