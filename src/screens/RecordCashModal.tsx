import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Banknote, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { haptics } from '../utils/haptics';

export const RecordCashModal: React.FC = () => {
  const { activeModal, setActiveModal, selectedBooking, recordCashPayment } = useApp();
  const [cashAmount, setCashAmount] = useState<string>(
    selectedBooking ? selectedBooking.balanceAmount.toString() : '2500'
  );

  if (activeModal !== 'record_cash' || !selectedBooking) return null;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(cashAmount, 10);
    if (!amountNum || amountNum <= 0) return;
    haptics.success();
    recordCashPayment(selectedBooking.id, amountNum);
  };

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-[#E8E6E1]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F0EC]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#2FA66A]/10 text-[#2FA66A] flex items-center justify-center">
                <Banknote className="w-4 h-4" />
              </div>
              <h2 className="text-[17px] font-bold text-[#171717]">Record Cash Payment</h2>
            </div>
            <button
              onClick={() => {
                setActiveModal(null);
                haptics.tap();
              }}
              className="w-8 h-8 rounded-full bg-[#F1F0EC] flex items-center justify-center text-[#777570] hover:text-[#171717]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-3 space-y-3">
            <div>
              <p className="text-[12px] text-[#777570]">
                Booking #{selectedBooking.id} · <span className="font-bold text-[#171717]">{selectedBooking.customerName}</span>
              </p>
              <p className="text-[14px] font-bold text-[#E7A72F] mt-0.5">
                Balance Due ₹{selectedBooking.balanceAmount.toLocaleString('en-IN')}
              </p>
            </div>

            <form onSubmit={handleConfirm} className="space-y-3.5">
              <div>
                <label className="block text-[12px] font-bold text-[#171717] mb-1">
                  Cash Received (₹)
                </label>
                <div className="relative flex items-center bg-[#F7F7F5] border border-[#E8E6E1] rounded-[14px] px-3.5 py-2.5 focus-within:border-[#2FA66A] focus-within:bg-white transition-all">
                  <span className="text-[17px] font-bold text-[#171717] mr-1.5">₹</span>
                  <input
                    type="number"
                    required
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    className="w-full text-[17px] font-extrabold text-[#171717] bg-transparent focus:outline-none"
                    placeholder="2500"
                  />
                </div>
                <p className="text-[10.5px] text-[#777570] mt-1">
                  Cash drawer balance will be credited instantly upon confirmation.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-[#2FA66A] text-white font-bold text-[13.5px] flex items-center justify-center shadow-xs hover:bg-[#278e5b] active-press transition-all cursor-pointer"
                >
                  Confirm Cash Received
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    haptics.tap();
                  }}
                  className="w-full h-9 rounded-xl bg-transparent text-[#777570] hover:text-[#171717] font-semibold text-[12px]"
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
