import React from 'react';
import { useApp } from '../context/AppContext';
import { QrCode, Banknote, Link2, X, ChevronRight, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { haptics } from '../utils/haptics';
import { calculateBookingFinancials } from '../utils/feeCalculator';

export const PaymentCollectionSheet: React.FC = () => {
  const { activeModal, setActiveModal, selectedBooking } = useApp();

  if (activeModal !== 'payment_options' || !selectedBooking) return null;

  const balance = selectedBooking.balanceAmount || selectedBooking.totalAmount;
  const fin = calculateBookingFinancials(balance);

  const handleSelect = (mode: 'link' | 'qr' | 'cash') => {
    haptics.tap();
    if (mode === 'link') {
      setActiveModal('payment_link');
    } else if (mode === 'qr') {
      setActiveModal('qr_payment');
    } else if (mode === 'cash') {
      setActiveModal('record_cash');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-xs select-none">
        {/* Backdrop click to dismiss */}
        <div className="absolute inset-0" onClick={() => setActiveModal(null)} />

        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full md:max-w-md md:rounded-[28px] bg-white rounded-t-[32px] p-5 pb-8 shadow-2xl border border-[#E8E6E1] space-y-3"
        >
          {/* iOS-style Sheet Grab Handle for mobile */}
          <div className="w-10 h-1 bg-[#D1CFCA] rounded-full mx-auto mb-2 md:hidden" />

          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-[#F1F0EC]">
            <div>
              <span className="text-[11px] font-bold text-[#777570] uppercase tracking-wider">
                Booking #{selectedBooking.id} · {selectedBooking.customerName}
              </span>
              <h2 className="text-[18px] font-black text-[#171717]">
                Collect Balance — ₹{balance.toLocaleString('en-IN')}
              </h2>
            </div>
            <button
              onClick={() => {
                setActiveModal(null);
                haptics.tap();
              }}
              className="w-8 h-8 rounded-full bg-[#F1F0EC] flex items-center justify-center text-[#777570] hover:text-[#171717] active-press cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 3 Collection Options: Link, QR, Cash */}
          <div className="space-y-2 py-1">
            {/* Option 1: Send Payment Link */}
            <div
              onClick={() => handleSelect('link')}
              className="bg-[#FAF9F6] hover:bg-[#F1F0EC] p-3 rounded-2xl border border-[#E8E6E1] flex items-center justify-between cursor-pointer active-press transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF6B2C] text-white flex items-center justify-center shadow-xs">
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-[#171717] group-hover:text-[#FF6B2C] transition-colors">
                    Send Payment Link
                  </h3>
                  <p className="text-[11px] text-[#777570]">
                    Share link via WhatsApp / SMS (Total ₹{fin.totalCustomerPayable})
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#777570] group-hover:text-[#171717]" />
            </div>

            {/* Option 2: Show QR */}
            <div
              onClick={() => handleSelect('qr')}
              className="bg-[#FAF9F6] hover:bg-[#F1F0EC] p-3 rounded-2xl border border-[#E8E6E1] flex items-center justify-between cursor-pointer active-press transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#171717] text-white flex items-center justify-center shadow-xs">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-[#171717] group-hover:text-[#FF6B2C] transition-colors">
                    Instant UPI QR Code
                  </h3>
                  <p className="text-[11px] text-[#777570]">
                    Customer scans via GPay, PhonePe, Paytm
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#777570] group-hover:text-[#171717]" />
            </div>

            {/* Option 3: Record Cash */}
            <div
              onClick={() => handleSelect('cash')}
              className="bg-[#FAF9F6] hover:bg-[#F1F0EC] p-3 rounded-2xl border border-[#E8E6E1] flex items-center justify-between cursor-pointer active-press transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2FA66A] text-white flex items-center justify-center shadow-xs">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-[#171717] group-hover:text-[#2FA66A] transition-colors">
                    Record Cash Collection
                  </h3>
                  <p className="text-[11px] text-[#777570]">
                    Collect cash (Fee ₹{fin.totalConvenienceWithGst} deducted on next payout)
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#777570] group-hover:text-[#171717]" />
            </div>
          </div>

          <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#E8E6E1] text-[11px] text-[#777570] flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-[#B87C0D] shrink-0" />
            <span>If collected in cash, the platform 5% fee + 18% GST is deducted from your next settlement.</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
