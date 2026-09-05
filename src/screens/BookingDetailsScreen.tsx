import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ChevronLeft,
  Phone,
  Calendar,
  Clock,
  MapPin,
  Send,
  QrCode,
  Banknote,
  CheckCircle2,
  AlertTriangle,
  Copy,
  MessageSquare,
  Download,
} from 'lucide-react';
import { haptics } from '../utils/haptics';
import { exportSingleBookingReceipt } from '../utils/exportUtils';

export const BookingDetailsScreen: React.FC = () => {
  const {
    selectedBooking,
    navigateTo,
    goBack,
    setActiveModal,
    sendPaymentLink,
    markBookingCompleted,
    showToast,
  } = useApp();

  if (!selectedBooking) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-[#777570]">Booking not found.</p>
        <button
          onClick={() => {
            haptics.tap();
            navigateTo('bookings');
          }}
          className="mt-4 text-[#FF6B2C] font-bold"
        >
          Return to Bookings
        </button>
      </div>
    );
  }

  const b = selectedBooking;
  const isFullyPaid = b.balanceAmount === 0;
  const isCompleted = b.status === 'Completed';

  const copyPhone = () => {
    haptics.tap();
    navigator.clipboard?.writeText(b.customerPhone);
    showToast('Copied to Clipboard', b.customerPhone, 'info');
  };

  const handleSupportClick = () => {
    haptics.tap();
    navigateTo('support_form');
  };

  return (
    <div className="pb-8 pt-3 px-4 w-full space-y-3.5 select-none">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => {
            haptics.tap();
            goBack();
          }}
          className="w-9 h-9 -ml-1 rounded-xl flex items-center justify-center text-[#171717] hover:bg-[#E8E6E1]/50 active-press transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.4]" />
        </button>

        <div className="text-center">
          <h1 className="text-[16px] font-extrabold text-[#171717] leading-none">
            Booking #{b.id}
          </h1>
          <span className="text-[10.5px] text-[#777570] mt-0.5 block">{b.createdAt}</span>
        </div>

        <div>
          {isFullyPaid ? (
            <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#2FA66A]/15 text-[#1E774A] inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Confirmed
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#E7A72F]/15 text-[#B87C0D] inline-flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Pending
            </span>
          )}
        </div>
      </div>

      {/* Customer Info Card */}
      <div className="bg-white rounded-2xl p-3.5 border border-[#E8E6E1] shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-[#F1F0EC] text-[#171717] font-extrabold flex items-center justify-center text-[14px]">
            {b.customerName.charAt(0)}
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-[#171717]">{b.customerName}</h2>
            <p className="text-[12px] text-[#777570] flex items-center gap-1 font-medium">
              <span>{b.customerPhone}</span>
              <button onClick={copyPhone} className="text-[#777570] hover:text-[#171717] cursor-pointer">
                <Copy className="w-3 h-3" />
              </button>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <a
            href={`tel:${b.customerPhone}`}
            onClick={() => haptics.tap()}
            className="w-9 h-9 rounded-xl bg-[#F7F7F5] border border-[#E8E6E1] flex items-center justify-center text-[#171717] hover:bg-[#171717] hover:text-white active-press transition-all"
            aria-label="Call customer"
          >
            <Phone className="w-3.5 h-3.5 stroke-[2]" />
          </a>
        </div>
      </div>

      {/* Booking Details Card */}
      <div className="bg-white rounded-2xl p-3.5 border border-[#E8E6E1] shadow-xs space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-[#F1F0EC]">
          <span className="text-[11px] font-bold text-[#777570] uppercase tracking-wider">
            Match Details
          </span>
          <span className="text-[11.5px] font-bold text-[#FF6B2C] bg-[#FF6B2C]/10 px-2 py-0.5 rounded-full">
            {b.sport}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[12px]">
          <div className="space-y-0.5">
            <span className="text-[#777570] text-[10.5px] block">Court</span>
            <span className="font-bold text-[#171717] flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#FF6B2C]" />
              {b.courtName}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[#777570] text-[10.5px] block">Date</span>
            <span className="font-bold text-[#171717] flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#777570]" />
              {b.date}
            </span>
          </div>

          <div className="col-span-2 space-y-0.5 pt-1 border-t border-[#F1F0EC]">
            <span className="text-[#777570] text-[10.5px] block">Slot Timing</span>
            <span className="font-bold text-[#171717] flex items-center gap-1 text-[13px]">
              <Clock className="w-3 h-3 text-[#777570]" />
              {b.timeSlot}
            </span>
          </div>
        </div>

        {b.notes && (
          <div className="mt-1 bg-[#F7F7F5] rounded-xl p-2 text-[11.5px] text-[#777570]">
            <strong className="text-[#171717]">Note:</strong> {b.notes}
          </div>
        )}
      </div>

      {/* Payment Card */}
      <div className="bg-white rounded-2xl p-3.5 border border-[#E8E6E1] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[12.5px] font-bold text-[#171717]">Payment Breakdown</span>
          <button
            id="btn-download-receipt"
            onClick={() => {
              haptics.success();
              exportSingleBookingReceipt(b);
              showToast('Receipt Downloaded', `Invoice #${b.id} saved to CSV`, 'success');
            }}
            className="text-[11px] font-bold text-[#FF6B2C] hover:text-[#e85b1e] flex items-center gap-1 bg-[#FF6B2C]/10 px-2 py-0.5 rounded-lg active-press cursor-pointer"
          >
            <Download className="w-3 h-3" />
            <span>Download Receipt</span>
          </button>
        </div>

        <div className="space-y-1.5 text-[13px]">
          <div className="flex justify-between text-[#777570]">
            <span>Total Slot Price</span>
            <span className="font-bold text-[#171717]">₹{b.totalAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-[#777570]">
            <span>Advance Paid</span>
            <span className="font-bold text-[#2FA66A]">
              -₹{b.paidAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="pt-1.5 border-t border-[#F1F0EC] flex justify-between items-baseline">
            <span className="font-bold text-[#171717]">Balance Amount</span>
            <span
              className={`text-[18px] font-extrabold ${
                b.balanceAmount > 0 ? 'text-[#E7A72F]' : 'text-[#2FA66A]'
              }`}
            >
              ₹{b.balanceAmount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Banner */}
        {b.balanceAmount > 0 ? (
          <div className="bg-[#E7A72F]/15 border border-[#E7A72F]/30 rounded-xl p-2.5 text-center">
            <span className="text-[11px] font-extrabold text-[#B87C0D] uppercase tracking-wider block">
              BALANCE DUE ₹{b.balanceAmount.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-[#777570] block mt-0.5">
              Collect via UPI QR, payment link, or cash at counter
            </span>
          </div>
        ) : (
          <div className="bg-[#2FA66A]/15 border border-[#2FA66A]/30 rounded-xl p-2.5 text-center">
            <span className="text-[11px] font-extrabold text-[#1E774A] uppercase tracking-wider flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              PAYMENT COMPLETED
            </span>
            <span className="text-[10px] text-[#777570] block mt-0.5">
              Settled to Bank · Ready for court check-in
            </span>
          </div>
        )}

        {/* Payment Collection Actions if balance > 0 */}
        {!isFullyPaid && (
          <div className="space-y-2 pt-1">
            <button
              onClick={() => {
                haptics.tap();
                sendPaymentLink(b.id);
              }}
              className="w-full h-11 rounded-xl bg-[#FF6B2C] text-white font-bold text-[13px] flex items-center justify-center gap-1.5 shadow-xs hover:bg-[#e85b1e] active-press transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Payment Link</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  haptics.tap();
                  setActiveModal('qr_payment');
                }}
                className="h-10 rounded-xl bg-white border border-[#E8E6E1] text-[#171717] font-bold text-[12px] flex items-center justify-center gap-1.5 hover:border-[#171717] active-press transition-all cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-[#777570]" />
                <span>Show QR</span>
              </button>
              <button
                onClick={() => {
                  haptics.tap();
                  setActiveModal('record_cash');
                }}
                className="h-10 rounded-xl bg-white border border-[#E8E6E1] text-[#171717] font-bold text-[12px] flex items-center justify-center gap-1.5 hover:border-[#171717] active-press transition-all cursor-pointer"
              >
                <Banknote className="w-3.5 h-3.5 text-[#777570]" />
                <span>Record Cash</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Complete Booking CTA */}
      <div className="space-y-1.5 pt-0.5">
        <button
          onClick={() => {
            if (isFullyPaid && !isCompleted) {
              haptics.success();
              markBookingCompleted(b.id);
            }
          }}
          disabled={!isFullyPaid || isCompleted}
          className={`w-full h-11 rounded-xl font-bold text-[13.5px] flex items-center justify-center gap-1.5 transition-all active-press ${
            isFullyPaid && !isCompleted
              ? 'bg-[#171717] text-white shadow-xs hover:bg-black cursor-pointer'
              : isCompleted
              ? 'bg-[#2FA66A]/20 text-[#1E774A] cursor-default'
              : 'bg-[#E8E6E1] text-[#A3A099] cursor-not-allowed'
          }`}
        >
          {isCompleted ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2FA66A]" />
              <span>Booking Finished & Checked Out</span>
            </>
          ) : (
            <span>Complete Booking</span>
          )}
        </button>
      </div>

      {/* Issue / Support link */}
      <div className="text-center pt-1">
        <button
          onClick={handleSupportClick}
          className="text-[11.5px] font-semibold text-[#777570] hover:text-[#171717] inline-flex items-center gap-1 underline cursor-pointer"
        >
          <MessageSquare className="w-3 h-3" />
          Need help with this booking? Contact Support
        </button>
      </div>
    </div>
  );
};
