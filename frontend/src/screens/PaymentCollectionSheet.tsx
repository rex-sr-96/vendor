import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { QrCode, Banknote, Link2, X, ChevronRight, AlertTriangle, Clock, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { haptics } from '../utils/haptics';
import { calculateBookingFinancials, formatMinutesSeconds } from '../utils/feeCalculator';

export const PaymentCollectionSheet: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    selectedBooking,
    sendPaymentLink,
    isPaymentLinkBlocked,
    getPaymentLinkTimeRemaining,
    showToast,
  } = useApp();

  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  if (activeModal !== 'payment_options' || !selectedBooking) return null;

  const balance = selectedBooking.balanceAmount || selectedBooking.totalAmount;
  const fin = calculateBookingFinancials(balance);
  const isBlocked = isPaymentLinkBlocked(selectedBooking.id);
  const remainingSeconds = getPaymentLinkTimeRemaining(selectedBooking.id);

  const handleSelect = (mode: 'link' | 'qr' | 'cash') => {
    haptics.tap();
    if (mode === 'link') {
      if (isBlocked) {
        showToast(
          'Payment Link Active',
          `Payment link is valid for 15 mins. Button is blocked for another ${Math.ceil(remainingSeconds / 60)} mins.`,
          'info'
        );
        return;
      }
      sendPaymentLink(selectedBooking.id);
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
              id="btn-send-payment-link-option"
              onClick={() => handleSelect('link')}
              className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                isBlocked
                  ? 'bg-amber-50/70 border-amber-300 opacity-95 cursor-not-allowed shadow-2xs'
                  : 'bg-[#FAF9F6] hover:bg-[#F1F0EC] border-[#E8E6E1] cursor-pointer active-press group'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs transition-colors ${
                    isBlocked ? 'bg-amber-500 text-white' : 'bg-[#FF6B2C] text-white'
                  }`}
                >
                  {isBlocked ? <Lock className="w-5 h-5" /> : <Link2 className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3
                      className={`text-[14px] font-bold ${
                        isBlocked ? 'text-amber-950' : 'text-[#171717] group-hover:text-[#FF6B2C]'
                      } transition-colors`}
                    >
                      {isBlocked ? 'Payment Link Sent' : 'Send Payment Link'}
                    </h3>
                    {isBlocked && (
                      <span className="px-2 py-0.5 rounded-full text-[10.5px] font-black bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                        <span>Valid for {formatMinutesSeconds(remainingSeconds)}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#777570]">
                    {isBlocked
                      ? `Active payment link valid for 15 mins. Button blocked for ${formatMinutesSeconds(remainingSeconds)}.`
                      : `Share link via WhatsApp / SMS (Total ₹${fin.totalCustomerPayable})`}
                  </p>
                </div>
              </div>
              {isBlocked ? (
                <span className="text-[10px] font-black text-amber-800 bg-amber-200/80 px-2 py-1 rounded-lg border border-amber-300">
                  BLOCKED
                </span>
              ) : (
                <ChevronRight className="w-4 h-4 text-[#777570] group-hover:text-[#171717]" />
              )}
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
