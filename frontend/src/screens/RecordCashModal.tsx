import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Banknote, X, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { haptics } from '../utils/haptics';
import { calculateBookingFinancials } from '../utils/feeCalculator';

export const RecordCashModal: React.FC = () => {
  const { activeModal, setActiveModal, selectedBooking, recordCashPayment } = useApp();

  if (activeModal !== 'record_cash' || !selectedBooking) return null;

  const fin = calculateBookingFinancials(selectedBooking.balanceAmount || selectedBooking.totalAmount);

  const [cashAmount, setCashAmount] = useState<string>(
    fin.totalCustomerPayable.toString()
  );

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(cashAmount, 10);
    if (!amountNum || amountNum <= 0) return;
    haptics.success();
    recordCashPayment(selectedBooking.id, amountNum);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
        {/* Backdrop click to dismiss */}
        <div className="absolute inset-0" onClick={() => setActiveModal(null)} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-[#E5E7EB] space-y-3.5"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F4]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center">
                <Banknote className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-[#021526]">Record Cash Payment</h2>
                <p className="text-[11px] text-[#5F6368]">Physical Counter Payment</p>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveModal(null);
                haptics.tap();
              }}
              className="w-8 h-8 rounded-full bg-[#F3F4F4] flex items-center justify-center text-[#5F6368] hover:text-[#021526] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Customer & Fee Breakdown Card */}
            <div className="bg-[#F3F4F4] p-3 rounded-2xl border border-[#E5E7EB] space-y-2 text-[12px]">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-[#021526]">{selectedBooking.customerName}</span>
                  <span className="text-[11px] text-[#5F6368] block font-mono">#{selectedBooking.id} · {selectedBooking.sport}</span>
                </div>
                <span className="text-[10px] font-bold bg-[#16A34A]/10 text-[#16A34A] px-2 py-0.5 rounded-full">
                  Cash Counter
                </span>
              </div>

              <div className="space-y-1.5 pt-1.5 border-t border-[#E5E7EB] text-[11.5px]">
                <div className="flex justify-between text-[#5F6368]">
                  <span>Court Base Fee:</span>
                  <strong className="text-[#021526]">₹{fin.baseCourtCost.toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between text-[#5F6368]">
                  <span>Venue GST (18% on court):</span>
                  <strong className="text-[#021526]">₹{fin.courtGst18.toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between text-[#021526] font-bold bg-white p-1.5 rounded-lg border border-[#E5E7EB]">
                  <span>Court Total (Venue Revenue):</span>
                  <span>₹{fin.courtTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#5F6368] pt-0.5">
                  <span>Platform Convenience Fee (5%):</span>
                  <strong className="text-[#B87C0D]">+₹{fin.convenienceFee5Percent.toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between text-[#5F6368]">
                  <span>Convenience GST (18% on 5% fee):</span>
                  <strong className="text-[#B87C0D]">+₹{fin.convenienceGst18Percent.toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between items-baseline pt-1.5 border-t border-[#E5E7EB] font-bold text-[#021526]">
                  <span>Total Cash to Collect from Customer:</span>
                  <span className="text-[16px] font-black text-[#16A34A]">₹{fin.totalCustomerPayable.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Next Settlement Deduction Alert */}
            <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-2xl p-3 space-y-1">
              <span className="text-[11px] font-black text-[#B87C0D] uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Settlement Deduction Notice
              </span>
              <p className="text-[11px] text-[#5F6368] leading-snug">
                The <strong>₹{fin.totalConvenienceWithGst} platform convenience fee (5% fee ₹{fin.convenienceFee5Percent} + 18% GST ₹{fin.convenienceGst18Percent})</strong> collected in physical cash at your counter will be <strong>automatically deducted from your next automated bank settlement payout</strong>.
              </p>
            </div>

            <form onSubmit={handleConfirm} className="space-y-3">
              <div>
                <label className="block text-[12px] font-bold text-[#021526] mb-1">
                  Cash Amount Received (₹)
                </label>
                <div className="relative flex items-center bg-[#F3F4F4] border border-[#E5E7EB] rounded-[14px] px-3.5 py-2 focus-within:border-[#16A34A] focus-within:bg-white transition-all">
                  <span className="text-[16px] font-bold text-[#021526] mr-1.5">₹</span>
                  <input
                    type="number"
                    required
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    className="w-full text-[16px] font-black text-[#021526] bg-transparent focus:outline-none"
                    placeholder={fin.totalCustomerPayable.toString()}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-[#16A34A] text-white font-bold text-[13px] flex items-center justify-center shadow-xs hover:bg-[#278e5b] active-press transition-all cursor-pointer"
                >
                  Confirm ₹{cashAmount} Cash Received
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    haptics.tap();
                  }}
                  className="w-full h-8 rounded-xl bg-transparent text-[#5F6368] hover:text-[#021526] font-semibold text-[11.5px] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
