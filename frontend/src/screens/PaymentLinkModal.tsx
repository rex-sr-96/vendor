import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Link2,
  Copy,
  Check,
  Send,
  Clock,
  CheckCircle2,
  X,
  Zap,
  Banknote,
  QrCode,
  Calendar,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { haptics } from '../utils/haptics';
import { calculateBookingFinancials } from '../utils/feeCalculator';

export const PaymentLinkModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    selectedBooking,
    confirmBookingPayment,
    showToast,
  } = useApp();

  const [copied, setCopied] = useState(false);

  if (activeModal !== 'payment_link' || !selectedBooking) return null;

  const isRemainingBalanceFlow = selectedBooking.paidAmount > 0 && selectedBooking.balanceAmount > 0;
  const balanceToCollect = isRemainingBalanceFlow ? selectedBooking.balanceAmount : selectedBooking.totalAmount;
  const fin = calculateBookingFinancials(selectedBooking.totalAmount);
  const paymentUrl = `https://pay.turftown.in/b/${selectedBooking.id}`;
  const holdMins = selectedBooking.holdExpiresInMinutes && selectedBooking.holdExpiresInMinutes > 0 ? selectedBooking.holdExpiresInMinutes : 15;

  const handleCopyLink = () => {
    haptics.tap();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(paymentUrl).catch(() => {});
    }
    setCopied(true);
    showToast('Link Copied', 'Payment link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    haptics.tap();
    const text = isRemainingBalanceFlow
      ? encodeURIComponent(
          `Hi ${selectedBooking.customerName}! Your booking at ${selectedBooking.courtName} (${selectedBooking.timeSlot}, ${selectedBooking.date}) has an advance of ₹${selectedBooking.paidAmount} received.\n\nRemaining Balance Due: ₹${selectedBooking.balanceAmount}.\n\nPlease pay remaining balance online via: ${paymentUrl}`
        )
      : encodeURIComponent(
          `Hi ${selectedBooking.customerName}! Your slot for ${selectedBooking.sport} at ${selectedBooking.courtName} (${selectedBooking.timeSlot}, ${selectedBooking.date}) is locked for ${holdMins} minutes.\n\nCourt Total: ₹${fin.courtTotal.toLocaleString('en-IN')} (incl. 18% GST)\nPlatform Fee (5% + 18% GST): ₹${fin.totalConvenienceWithGst}\nTotal Amount: ₹${fin.totalCustomerPayable.toLocaleString('en-IN')}\n\nPay Advance (₹${fin.advanceCustomerPayable.toLocaleString('en-IN')}) or Full (₹${fin.totalCustomerPayable.toLocaleString('en-IN')}) via: ${paymentUrl}`
        );
    const cleanPhone = selectedBooking.customerPhone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  const handleCustomerPayFull = () => {
    haptics.success();
    confirmBookingPayment(selectedBooking.id, 'Online', 'full');
    setActiveModal(null);
  };

  const handleCustomerPayAdvance = () => {
    haptics.success();
    confirmBookingPayment(selectedBooking.id, 'Online', 'advance');
    setActiveModal(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-xs select-none">
        <div className="absolute inset-0" onClick={() => setActiveModal(null)} />

        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-h-[92vh] md:max-w-lg md:rounded-3xl overflow-y-auto no-scrollbar bg-white rounded-t-3xl p-5 md:p-6 shadow-2xl border border-[#E8E6E1] space-y-3.5"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F0EC]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FF6B2C]/10 text-[#FF6B2C] flex items-center justify-center">
                <Link2 className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-[16px] font-black text-[#171717]">
                  {isRemainingBalanceFlow ? 'Collect Balance Payment Link' : 'Customer Payment Link'}
                </h2>
                <div className="flex items-center gap-1.5 text-[11px] text-[#777570]">
                  <span>Booking #{selectedBooking.id}</span>
                  <span>·</span>
                  {isRemainingBalanceFlow ? (
                    <span className="text-[#2FA66A] font-bold">
                      Advance Paid ₹{selectedBooking.paidAmount.toLocaleString('en-IN')} · Due ₹{selectedBooking.balanceAmount.toLocaleString('en-IN')}
                    </span>
                  ) : (
                    <span className="text-[#FF6B2C] font-bold flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />
                      Slot Locked ({holdMins}m Hold Active)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveModal(null);
                haptics.tap();
              }}
              className="w-8 h-8 rounded-full bg-[#F1F0EC] flex items-center justify-center text-[#777570] hover:text-[#171717] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Booking & Financial Breakdown Box */}
          <div className="bg-[#FAF9F6] p-3.5 rounded-2xl border border-[#E8E6E1] space-y-2.5 text-[12px]">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-[#171717] text-[13px] block">
                  {selectedBooking.customerName}
                </span>
                <span className="font-mono text-[#777570] text-[11px]">
                  {selectedBooking.customerPhone}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#FF6B2C]/10 text-[#FF6B2C]">
                {selectedBooking.sport} · {selectedBooking.courtName}
              </span>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-[#E8E6E1] text-[11.5px]">
              <div className="flex justify-between text-[#777570]">
                <span>Base Court Cost:</span>
                <strong className="text-[#171717]">₹{fin.baseCourtCost.toLocaleString('en-IN')}</strong>
              </div>
              <div className="flex justify-between text-[#777570]">
                <span>Venue GST (18%):</span>
                <strong className="text-[#171717]">₹{fin.courtGst18.toLocaleString('en-IN')}</strong>
              </div>
              <div className="flex justify-between text-[#171717] font-bold bg-white p-1.5 rounded-lg border border-[#E8E6E1]">
                <span>Total Turf Court Cost:</span>
                <span>₹{fin.courtTotal.toLocaleString('en-IN')}</span>
              </div>
              
              {isRemainingBalanceFlow ? (
                <>
                  <div className="flex justify-between text-[#2FA66A] font-semibold">
                    <span>Advance Already Paid Online:</span>
                    <span>-₹{selectedBooking.paidAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pt-2 border-t border-[#E8E6E1] flex items-center justify-between font-bold">
                    <div className="text-left">
                      <span className="text-[#171717] block">Remaining Due Amount to Collect:</span>
                      <span className="text-[10px] text-[#2FA66A] font-semibold flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3" />
                        100% credited to your venue ledger
                      </span>
                    </div>
                    <span className="text-[18px] font-black text-[#B87C0D]">
                      ₹{selectedBooking.balanceAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between text-[#777570] pt-0.5">
                    <span>Platform Convenience Fee (5% of Turf):</span>
                    <strong className="text-[#B87C0D]">+₹{fin.convenienceFee5Percent.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between text-[#777570]">
                    <span>Convenience GST (18% on 5% fee):</span>
                    <strong className="text-[#B87C0D]">+₹{fin.convenienceGst18Percent.toLocaleString('en-IN')}</strong>
                  </div>

                  <div className="pt-2 border-t border-[#E8E6E1] flex items-center justify-between font-bold">
                    <div className="text-left">
                      <span className="text-[#171717] block">Total Amount Payable by Customer:</span>
                      <span className="text-[10px] text-[#2FA66A] font-semibold flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3" />
                        Venue Owner credited full ₹{fin.courtTotal.toLocaleString('en-IN')} (0 deduction)
                      </span>
                    </div>
                    <span className="text-[17px] font-black text-[#171717]">
                      ₹{fin.totalCustomerPayable.toLocaleString('en-IN')}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Shareable Link Box */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#777570] uppercase tracking-wider block">
              Active Payment Link (Valid for {holdMins} mins)
            </label>
            <div className="flex items-center gap-2 bg-[#F7F6F2] p-2 rounded-2xl border border-[#E8E6E1]">
              <input
                type="text"
                readOnly
                value={paymentUrl}
                className="w-full bg-transparent text-[12px] font-mono text-[#171717] outline-hidden px-1 truncate"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all shrink-0 ${
                  copied
                    ? 'bg-[#2FA66A] text-white'
                    : 'bg-white border border-[#E8E6E1] text-[#171717] hover:bg-[#FAF9F6]'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Quick Share Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="h-10 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#128C7E] font-black text-[11.5px] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send WhatsApp Link</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="h-10 rounded-xl bg-[#FAF9F6] hover:bg-[#F1F0EC] border border-[#E8E6E1] text-[#171717] font-bold text-[11.5px] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Copy className="w-3.5 h-3.5 text-[#FF6B2C]" />
              <span>Copy Link Only</span>
            </button>
          </div>

          {/* Customer Online Payment Simulation Actions */}
          <div className="bg-[#2FA66A]/10 border border-[#2FA66A]/30 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-[#2FA66A] shrink-0 mt-0.5" />
              <div>
                <span className="text-[12px] font-black text-[#1E774A] block">
                  Automatic Confirmation on Payment
                </span>
                <p className="text-[10.5px] text-[#2FA66A]">
                  When customer pays online, booking immediately transitions to <strong>Confirmed</strong> and court fee ₹{fin.courtTotal.toLocaleString('en-IN')} is added to your ledger.
                </p>
              </div>
            </div>

            <div className="pt-1">
              {isRemainingBalanceFlow ? (
                <button
                  type="button"
                  onClick={handleCustomerPayFull}
                  className="w-full h-11 rounded-xl bg-[#2FA66A] hover:bg-[#258756] text-white font-black text-[12.5px] flex items-center justify-center gap-2 shadow-xs cursor-pointer active-press transition-colors text-center"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Simulate Customer Paying Due (₹{selectedBooking.balanceAmount.toLocaleString('en-IN')})</span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleCustomerPayFull}
                    className="h-10 rounded-xl bg-[#2FA66A] hover:bg-[#258756] text-white font-black text-[11.5px] flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active-press transition-colors text-center"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Simulate Pay Full (₹{fin.totalCustomerPayable.toLocaleString('en-IN')})</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCustomerPayAdvance}
                    className="h-10 rounded-xl bg-[#171717] hover:bg-black text-white font-black text-[11.5px] flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active-press transition-colors text-center"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2FA66A] shrink-0" />
                    <span>Simulate Advance 50% (₹{fin.advanceCustomerPayable.toLocaleString('en-IN')})</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
