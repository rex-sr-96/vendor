import React from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Clock,
  MapPin,
  Send,
  Plus,
  Ban,
  Trash2,
  ChevronRight,
  Zap,
  Wrench,
  GraduationCap,
  Trophy,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { haptics } from '../utils/haptics';

export const SlotDetailsSheet: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    selectedSlot,
    selectedSlotId,
    slots,
    courts,
    sendPaymentLink,
    unblockSlotAction,
    setSelectedBookingId,
    navigateTo,
  } = useApp();

  if (activeModal !== 'slot_details') return null;

  // Derive slot from selectedSlotId
  const slot =
    selectedSlot ||
    slots.find((s) => s.id === selectedSlotId) || {
      id: selectedSlotId || 'slot-temp',
      courtId: 'court-1',
      courtName: 'Turf 1',
      sport: 'Football',
      time: '6–7 PM',
      timeFull: '06:00 PM – 07:00 PM',
      state: 'booked',
      price: 1000,
      customerName: 'Rahul Kumar',
    };

  const court = courts.find((c) => c.id === slot.courtId) || courts[0];

  // Detect if part of 2-hour continuous session
  const isContinuous =
    (slot.courtId === 'court-1' && (slot.time === '6–7 PM' || slot.time === '7–8 PM')) ||
    (slot.courtId === 'court-2' && (slot.time === '9–10 AM' || slot.time === '10–11 AM')) ||
    (slot.courtId === 'court-3' && (slot.time === '9–10 AM' || slot.time === '10–11 AM'));

  const continuousSpan =
    slot.courtId === 'court-1' && (slot.time === '6–7 PM' || slot.time === '7–8 PM')
      ? '06:00 PM – 08:00 PM (2 Continuous Hours)'
      : '09:00 AM – 11:00 AM (2 Continuous Hours)';

  const handleCreateBookingForSlot = () => {
    haptics.tap();
    setActiveModal('new_booking');
  };

  const handleBlockSlotForSlot = () => {
    haptics.tap();
    setActiveModal('block_slot');
  };

  const handleViewRelatedBooking = () => {
    haptics.tap();
    if (slot.bookingId) {
      setSelectedBookingId(slot.bookingId);
      setActiveModal(null);
      navigateTo('booking_details');
    }
  };

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="w-full max-h-[92vh] overflow-y-auto no-scrollbar bg-white rounded-t-[32px] p-5 pb-8 shadow-2xl border-t border-[#E5E7EB]"
        >
          {/* Grab Handle */}
          <div className="w-10 h-1 bg-[#E5E7EB] rounded-full mx-auto mb-3" />

          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F4]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#F94001] uppercase tracking-wider">
                  {slot.sport || 'Football'}
                </span>
                <span className="w-1 h-1 rounded-full bg-[#E5E7EB]" />
                <span className="text-[12px] font-bold text-[#021526]">{slot.courtName}</span>
                {isContinuous && (
                  <span className="text-[9.5px] font-extrabold bg-[#F94001]/10 text-[#F94001] px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                    <Zap className="w-2.5 h-2.5" />
                    2-HR CONTINUOUS
                  </span>
                )}
              </div>
              <h2 className="text-[18px] font-black text-[#021526] mt-0.5">
                {isContinuous ? continuousSpan : (slot.timeFull || slot.time)}
              </h2>
            </div>

            <button
              onClick={() => {
                setActiveModal(null);
                haptics.tap();
              }}
              className="w-8 h-8 rounded-full bg-[#F3F4F4] flex items-center justify-center text-[#5F6368] hover:text-[#021526] active-press cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Contextual Body */}
          <div className="py-3 space-y-3">
            {/* Case 1: Available Slot */}
            {slot.state === 'available' && (
              <div className="space-y-3">
                <div className="bg-[#F3F4F4] rounded-2xl p-3.5 border border-[#E5E7EB] flex justify-between items-center">
                  <div>
                    <span className="text-[10.5px] font-bold text-[#5F6368] uppercase">Slot Status</span>
                    <p className="text-[15px] font-bold text-[#021526] flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                      Open for Booking
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10.5px] font-bold text-[#5F6368] uppercase">Hourly Rate</span>
                    <p className="text-[19px] font-extrabold text-[#021526]">₹{slot.price || court.pricePerHour}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={handleCreateBookingForSlot}
                    className="h-11 bg-[#F94001] text-white rounded-xl font-bold text-[13px] flex items-center justify-center gap-1.5 shadow-xs hover:bg-[#D93600] active-press cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Booking</span>
                  </button>
                  <button
                    onClick={handleBlockSlotForSlot}
                    className="h-11 bg-white text-[#021526] border border-[#E5E7EB] rounded-xl font-bold text-[13px] flex items-center justify-center gap-1.5 hover:border-[#021526] active-press cursor-pointer"
                  >
                    <Wrench className="w-4 h-4 text-[#5F6368]" />
                    <span>Block Maint.</span>
                  </button>
                </div>
              </div>
            )}

            {/* Case 2: Booked Slot */}
            {slot.state === 'booked' && (
              <div className="space-y-3">
                <div className="bg-white rounded-2xl p-3.5 border border-[#16A34A]/30 shadow-xs space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#16A34A]/15 text-[#15803D] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                      Confirmed {isContinuous ? '· 2h Continuous Booking' : ''}
                    </span>
                    <span className="text-[14px] font-black text-[#021526]">₹{isContinuous ? (slot.price || 1000) * 2 : slot.price}</span>
                  </div>

                  <div>
                    <span className="text-[10.5px] text-[#5F6368] uppercase font-bold">Player Name</span>
                    <p className="text-[16px] font-black text-[#021526]">{slot.customerName || 'Rahul Kumar'}</p>
                    <p className="text-[11.5px] text-[#5F6368] mt-0.5">{slot.customerPhone || '+91 98450 12345'}</p>
                  </div>

                  {isContinuous && (
                    <div className="p-2.5 rounded-xl bg-[#E8F8EE] border border-[#A7E8BD] text-[11px] text-[#177A42] font-semibold flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                      <span>Reserved across consecutive hourly slots for continuous tournament play.</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {slot.bookingId ? (
                    <button
                      onClick={handleViewRelatedBooking}
                      className="col-span-2 h-11 bg-[#021526] text-white rounded-xl font-bold text-[13px] flex items-center justify-center gap-1.5 active-press cursor-pointer"
                    >
                      <span>View Full Booking Details</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveModal(null);
                        haptics.tap();
                      }}
                      className="col-span-2 h-11 bg-[#021526] text-white rounded-xl font-bold text-[13px] flex items-center justify-center active-press cursor-pointer"
                    >
                      Close Details
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Case 3: Payment Pending / Hold Slot */}
            {slot.state === 'pending' && (
              <div className="space-y-3">
                <div className="bg-[#F59E0B]/10 rounded-2xl p-3.5 border border-[#F59E0B]/30 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#F59E0B]/20 text-[#B87C0D] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Hold Expiring: {slot.countdown || '18:42'}
                    </span>
                    <span className="text-[13.5px] font-extrabold text-[#021526]">₹{slot.price}</span>
                  </div>
                  <div>
                    <p className="text-[14.5px] font-bold text-[#021526]">{slot.customerName || 'Vikram Sethi'}</p>
                    <p className="text-[11.5px] text-[#5F6368]">{slot.customerPhone || '+91 98450 11223'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      sendPaymentLink(slot.bookingId || 'BK10232');
                      setActiveModal(null);
                      haptics.tap();
                    }}
                    className="h-11 bg-[#F94001] text-white rounded-xl font-bold text-[12.5px] flex items-center justify-center gap-1.5 shadow-xs hover:bg-[#D93600] active-press cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Pay Link</span>
                  </button>
                  <button
                    onClick={() => {
                      unblockSlotAction(slot.id);
                      haptics.tap();
                    }}
                    className="h-11 bg-white text-[#DC2626] border border-[#DC2626]/30 rounded-xl font-bold text-[12.5px] flex items-center justify-center gap-1.5 hover:bg-[#DC2626]/10 active-press cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Release Slot</span>
                  </button>
                </div>
              </div>
            )}

            {/* Case 4: Maintenance / Coaching / Tournament */}
            {(slot.state === 'maintenance' || slot.state === 'coaching' || slot.state === 'tournament') && (
              <div className="space-y-3">
                <div className="bg-[#F3F4F4] rounded-2xl p-3.5 border border-[#E5E7EB] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-bold text-[#5F6368] uppercase flex items-center gap-1">
                      {slot.state === 'maintenance' ? <Wrench className="w-3 h-3" /> : null}
                      Blocked for {slot.state}
                    </span>
                    {isContinuous && (
                      <span className="text-[9.5px] font-bold bg-[#021526]/10 text-[#021526] px-2 py-0.5 rounded-full">
                        2h Continuous Block
                      </span>
                    )}
                  </div>
                  <p className="text-[15px] font-black text-[#021526]">{slot.reason || 'Pitch Maintenance'}</p>
                  {slot.notes && (
                    <p className="text-[11.5px] text-[#5F6368] mt-0.5">{slot.notes}</p>
                  )}
                </div>

                <button
                  onClick={() => {
                    unblockSlotAction(slot.id);
                    haptics.tap();
                  }}
                  className="w-full h-11 bg-white text-[#021526] border border-[#E5E7EB] rounded-xl font-bold text-[13px] flex items-center justify-center gap-1.5 hover:border-[#021526] active-press cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-[#5F6368]" />
                  <span>Unblock Slot</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
