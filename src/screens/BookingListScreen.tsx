import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Plus, Send, ChevronRight, CheckCircle2, Clock, AlertCircle, Download } from 'lucide-react';
import { BookingStatus, PaymentStatus } from '../types';
import { haptics } from '../utils/haptics';

export const BookingListScreen: React.FC = () => {
  const { bookings, navigateTo, setSelectedBookingId, sendPaymentLink, setActiveModal, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedSport, setSelectedSport] = useState<string>('All');

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.courtName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === 'All' ||
      (selectedStatus === 'Pending' && (b.status === 'Payment Pending' || b.status === 'Partially Paid')) ||
      (selectedStatus === 'Confirmed' && b.status === 'Confirmed') ||
      (selectedStatus === 'Completed' && b.status === 'Completed');

    const matchesSport = selectedSport === 'All' || b.sport === selectedSport;

    return matchesSearch && matchesStatus && matchesSport;
  });

  const handleOpenExportPage = () => {
    haptics.tap();
    navigateTo('export_report');
  };

  const handleCardClick = (bookingId: string) => {
    haptics.tap();
    setSelectedBookingId(bookingId);
    navigateTo('booking_details');
  };

  const getStatusBadge = (status: BookingStatus, paymentStatus: PaymentStatus) => {
    if (status === 'Confirmed' || paymentStatus === 'Paid') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#16A34A]/15 text-[#15803D] inline-flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Paid
        </span>
      );
    }
    if (status === 'Partially Paid' || paymentStatus === 'Partially Paid') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#F59E0B]/15 text-[#B87C0D] inline-flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Partially Paid
        </span>
      );
    }
    if (status === 'Completed') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#F3F4F4] text-[#5F6368]">
          Completed
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#DC2626]/15 text-[#B52B2B] inline-flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        Payment Pending
      </span>
    );
  };

  return (
    <div className="pb-8 pt-3 px-4 w-full space-y-3.5 select-none">
      {/* Top Title & Actions */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-[22px] font-extrabold text-[#021526] tracking-tight leading-none">
            Bookings
          </h1>
          <p className="text-[12px] text-[#5F6368] mt-0.5 font-medium">
            {filteredBookings.length} active & upcoming reservations
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            id="btn-export-bookings"
            onClick={handleOpenExportPage}
            className="h-9 px-2.5 rounded-xl bg-white border border-[#E5E7EB] text-[#021526] font-bold text-[12px] flex items-center gap-1.5 shadow-2xs hover:border-[#021526]/40 active-press cursor-pointer"
            title="Export bookings report (PDF / Excel / CSV)"
          >
            <Download className="w-3.5 h-3.5 text-[#021526]" />
            <span>Export</span>
          </button>
          <button
            onClick={() => {
              haptics.tap();
              setActiveModal('new_booking');
            }}
            className="h-9 px-3 rounded-xl bg-[#F94001] text-white font-bold text-[12px] flex items-center gap-1 shadow-xs hover:bg-[#D93600] active-press cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>+ Booking</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative flex items-center bg-[#F3F4F4] border border-[#E5E7EB] rounded-[14px] px-3.5 py-2 focus-within:border-[#021526] focus-within:bg-white transition-all shadow-xs">
        <Search className="w-4 h-4 text-[#5F6368] mr-2 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, ID or court..."
          className="w-full text-[13px] font-medium text-[#021526] bg-transparent focus:outline-none placeholder-[#5F6368]"
        />
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {['All', 'Pending', 'Confirmed', 'Completed'].map((status) => (
          <button
            key={status}
            onClick={() => {
              haptics.tap();
              setSelectedStatus(status);
            }}
            className={`px-3 py-1 rounded-full text-[11.5px] font-bold whitespace-nowrap transition-all active-press cursor-pointer ${
              selectedStatus === status
                ? 'bg-[#021526] text-white shadow-xs'
                : 'bg-white text-[#5F6368] border border-[#E5E7EB] hover:text-[#021526]'
            }`}
          >
            {status}
          </button>
        ))}

        <div className="w-px h-4 bg-[#E5E7EB] mx-0.5 shrink-0" />

        {['All', 'Football', 'Cricket', 'Badminton'].map((sport) => (
          <button
            key={sport}
            onClick={() => {
              haptics.tap();
              setSelectedSport(sport);
            }}
            className={`px-3 py-1 rounded-full text-[11.5px] font-bold whitespace-nowrap transition-all active-press cursor-pointer ${
              selectedSport === sport
                ? 'bg-[#021526] text-white shadow-xs'
                : 'bg-white text-[#5F6368] border border-[#E5E7EB] hover:text-[#021526]'
            }`}
          >
            {sport}
          </button>
        ))}
      </div>

      {/* Bookings Card List */}
      <div className="space-y-2.5 pt-0.5">
        {filteredBookings.map((b) => (
          <div
            key={b.id}
            onClick={() => handleCardClick(b.id)}
            className="bg-white rounded-2xl p-3.5 border border-[#E5E7EB] shadow-xs active-press cursor-pointer hover:border-[#021526]/40 transition-all space-y-2.5"
          >
            {/* Header: ID + Status badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[11.5px] font-extrabold text-[#5F6368] font-mono tracking-tight">
                  {b.id}
                </span>
                <span className="w-1 h-1 rounded-full bg-[#E5E7EB]" />
                <span className="text-[11.5px] font-semibold text-[#021526]">{b.sport}</span>
              </div>
              {getStatusBadge(b.status, b.paymentStatus)}
            </div>

            {/* Customer & Slot details */}
            <div>
              <h3 className="text-[15px] font-bold text-[#021526] leading-tight">
                {b.customerName}
              </h3>
              <p className="text-[12px] text-[#5F6368] mt-0.5">
                {b.courtName} · {b.date} · {b.timeSlot}
              </p>
            </div>

            {/* Financial summary & Action */}
            <div className="pt-2.5 border-t border-[#F3F4F4] flex items-center justify-between">
              <div>
                <span className="text-[14px] font-extrabold text-[#021526]">
                  ₹{b.totalAmount.toLocaleString('en-IN')}
                </span>
                {b.balanceAmount > 0 ? (
                  <p className="text-[10.5px] text-[#F59E0B] font-bold">
                    Paid ₹{b.paidAmount.toLocaleString('en-IN')} · Balance ₹{b.balanceAmount.toLocaleString('en-IN')}
                  </p>
                ) : (
                  <p className="text-[10.5px] text-[#16A34A] font-semibold">
                    Fully Paid via {b.paymentMethod || 'UPI'}
                  </p>
                )}
              </div>

              {b.balanceAmount > 0 ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    haptics.tap();
                    sendPaymentLink(b.id);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-[#F94001] text-white text-[11.5px] font-bold flex items-center gap-1 shadow-xs hover:bg-[#D93600] active-press cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Send Link</span>
                </button>
              ) : (
                <button
                  onClick={() => handleCardClick(b.id)}
                  className="px-2.5 py-1.5 rounded-xl bg-[#F3F4F4] text-[#021526] text-[11.5px] font-bold flex items-center gap-0.5 hover:bg-[#E5E7EB] active-press cursor-pointer"
                >
                  <span>View</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredBookings.length === 0 && (
          <div className="text-center py-10 bg-white rounded-2xl border border-[#E5E7EB] p-5">
            <p className="text-[14px] font-bold text-[#021526]">No bookings found</p>
            <p className="text-[12px] text-[#5F6368] mt-0.5">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>
    </div>
  );
};
