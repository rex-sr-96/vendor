import React from 'react';
import { useApp } from '../context/AppContext';
import { Send, QrCode, Banknote, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { haptics } from '../utils/haptics';

export const PaymentCollectionSheet: React.FC = () => {
  const { activeModal, setActiveModal, selectedBooking, sendPaymentLink } = useApp();

  if (activeModal !== 'payment_options' || !selectedBooking) return null;

  const balance = selectedBooking.balanceAmount;

  const handleSelect = (mode: 'link' | 'qr' | 'cash') => {
    haptics.tap();
    if (mode === 'link') {
      sendPaymentLink(selectedBooking.id);
      setActiveModal(null);
    } else if (mode === 'qr') {
      setActiveModal('qr_payment');
    } else if (mode === 'cash') {
      setActiveModal('record_cash');
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
          className="w-full bg-white rounded-t-[32px] p-5 pb-8 shadow-2xl border-t border-[#E8E6E1]"
        >
          {/* iOS-style Sheet Grab Handle */}
          <div className="w-10 h-1 bg-[#D1CFCA] rounded-full mx-auto mb-3.5" />

          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F0EC]">
            <div>
              <span className="text-[11px] font-bold text-[#777570] uppercase tracking-wider">
                Booking #{selectedBooking.id}
              </span>
              <h2 className="text-[19px] font-bold text-[#171717]">
                Collect Balance — ₹{balance.toLocaleString('en-IN')}
              </h2>
            </div>
            <button
              onClick={() => {
                setActiveModal(null);
                haptics.tap();
              }}
              className="w-8 h-8 rounded-full bg-[#F1F0EC] flex items-center justify-center text-[#777570] hover:text-[#171717] active-press"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 3 Option Rows with descriptions */}
          <div className="space-y-2.5 py-4">
            {/* Option 1: Send Payment Link */}
            <div
              onClick={() => handleSelect('link')}
              className="bg-[#F7F7F5] hover:bg-[#F1F0EC] p-3.5 rounded-2xl border border-[#E8E6E1] flex items-center justify-between cursor-pointer active-press transition-all group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#FF6B2C] text-white flex items-center justify-center shadow-xs">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[14.5px] font-bold text-[#171717]">Send Payment Link</h3>
                  <p className="text-[11.5px] text-[#777570]">
                    SMS & WhatsApp link with UPI / Card / Netbanking
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#777570] group-hover:text-[#171717]" />
            </div>

            {/* Option 2: Show QR */}
            <div
              onClick={() => handleSelect('qr')}
              className="bg-[#F7F7F5] hover:bg-[#F1F0EC] p-3.5 rounded-2xl border border-[#E8E6E1] flex items-center justify-between cursor-pointer active-press transition-all group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#171717] text-white flex items-center justify-center shadow-xs">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[14.5px] font-bold text-[#171717]">Show UPI QR Code</h3>
                  <p className="text-[11.5px] text-[#777570]">
                    GPay, PhonePe, Paytm instant camera scan
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#777570] group-hover:text-[#171717]" />
            </div>

            {/* Option 3: Record Cash */}
            <div
              onClick={() => handleSelect('cash')}
              className="bg-[#F7F7F5] hover:bg-[#F1F0EC] p-3.5 rounded-2xl border border-[#E8E6E1] flex items-center justify-between cursor-pointer active-press transition-all group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#2FA66A] text-white flex items-center justify-center shadow-xs">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[14.5px] font-bold text-[#171717]">Record Cash Collection</h3>
                  <p className="text-[11.5px] text-[#777570]">
                    Log direct physical cash payment at counter
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#777570] group-hover:text-[#171717]" />
            </div>
          </div>

          <p className="text-[11px] text-center text-[#777570]">
            Settlement updates instantly in your venue accounting ledger.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
