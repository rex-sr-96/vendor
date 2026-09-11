import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Check, Loader2, Sparkles, ArrowRight, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { haptics } from '../utils/haptics';
import { exportSingleBookingReceipt } from '../utils/exportUtils';

export const QRPaymentSheet: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    selectedBooking,
    completeBookingPayment,
    paymentSettings,
    showToast,
  } = useApp();

  const [paymentReceived, setPaymentReceived] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (activeModal !== 'qr_payment' || !selectedBooking) return null;

  const balance = selectedBooking.balanceAmount;

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    haptics.tap();
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentReceived(true);
      completeBookingPayment(selectedBooking.id);
      haptics.success();
    }, 1100);
  };

  const handleClose = () => {
    setPaymentReceived(false);
    setActiveModal(null);
    haptics.tap();
  };

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="w-full bg-white rounded-t-[32px] p-6 pb-8 shadow-2xl border-t border-[#E5E7EB]"
        >
          {/* iOS-style Grab Handle */}
          <div className="w-10 h-1 bg-[#E5E7EB] rounded-full mx-auto mb-3" />

          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F4]">
            <h2 className="text-[18px] font-bold text-[#021526]">Dynamic UPI QR</h2>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-[#F3F4F4] flex items-center justify-center text-[#5F6368] hover:text-[#021526] active-press"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {!paymentReceived ? (
            /* Live QR State */
            <div className="text-center py-3 space-y-3">
              <div>
                <p className="text-[14px] font-bold text-[#021526]">{selectedBooking.customerName}</p>
                <p className="text-[11px] text-[#5F6368]">Booking #{selectedBooking.id}</p>
                <p className="text-[28px] font-extrabold text-[#021526] tracking-tight mt-0.5">
                  ₹{balance.toLocaleString('en-IN')}
                </p>
              </div>

              {/* QR Code Container */}
              <div className="bg-[#F3F4F4] border-2 border-[#E5E7EB] p-4 rounded-3xl w-48 h-48 mx-auto flex flex-col items-center justify-center shadow-inner relative">
                <svg className="w-38 h-38" viewBox="0 0 100 100">
                  <rect x="0" y="0" width="100" height="100" fill="#ffffff" rx="8" />
                  <rect x="8" y="8" width="26" height="26" fill="#021526" rx="4" />
                  <rect x="12" y="12" width="18" height="18" fill="#ffffff" rx="2" />
                  <rect x="16" y="16" width="10" height="10" fill="#021526" rx="1" />

                  <rect x="66" y="8" width="26" height="26" fill="#021526" rx="4" />
                  <rect x="70" y="12" width="18" height="18" fill="#ffffff" rx="2" />
                  <rect x="74" y="16" width="10" height="10" fill="#021526" rx="1" />

                  <rect x="8" y="66" width="26" height="26" fill="#021526" rx="4" />
                  <rect x="12" y="70" width="18" height="18" fill="#ffffff" rx="2" />
                  <rect x="16" y="74" width="10" height="10" fill="#021526" rx="1" />

                  <rect x="40" y="10" width="6" height="6" fill="#021526" />
                  <rect x="50" y="12" width="8" height="8" fill="#021526" />
                  <rect x="42" y="24" width="14" height="6" fill="#021526" />
                  <rect x="10" y="42" width="8" height="16" fill="#021526" />
                  <rect x="24" y="44" width="12" height="8" fill="#021526" />
                  <rect x="42" y="40" width="16" height="16" fill="#021526" rx="2" />
                  <rect x="64" y="44" width="12" height="12" fill="#021526" />
                  <rect x="82" y="42" width="8" height="14" fill="#021526" />
                  <rect x="42" y="66" width="8" height="12" fill="#021526" />
                  <rect x="54" y="74" width="14" height="16" fill="#021526" />
                  <rect x="74" y="66" width="16" height="8" fill="#021526" />
                  <rect x="80" y="80" width="10" height="10" fill="#021526" />

                  <circle cx="50" cy="50" r="10" fill="#F94001" />
                  <text
                    x="50"
                    y="53.5"
                    fill="#ffffff"
                    fontSize="8"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    TT
                  </text>
                </svg>

                <p className="text-[9.5px] text-[#5F6368] font-mono mt-0.5 font-semibold truncate max-w-full px-2">
                  {paymentSettings.upiId}
                </p>
              </div>

              {/* Waiting Indicator with subtle pulse */}
              <div className="flex items-center justify-center gap-2 text-[12px] text-[#5F6368] font-medium">
                <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-ping" />
                <span>Waiting for UPI payment confirmation...</span>
              </div>

              {/* Simulation Demo Button */}
              <div className="pt-1">
                <button
                  onClick={handleSimulatePayment}
                  disabled={isProcessing}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#F3F4F4] hover:bg-[#E5E7EB] text-[#021526] text-[12.5px] font-bold flex items-center justify-center gap-2 transition-all active-press cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#F94001]" />
                      <span>Verifying with UPI gateway...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#F94001]" />
                      <span>Simulate Customer Scan & Pay</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Success State */
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-6 text-center space-y-3"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-[#16A34A]/15 text-[#16A34A] flex items-center justify-center">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div>
                <h3 className="text-[22px] font-bold text-[#16A34A] tracking-tight">
                  ✓ ₹{balance.toLocaleString('en-IN')} Received
                </h3>
                <p className="text-[13px] text-[#5F6368] mt-0.5">
                  Settled via UPI direct payment for {selectedBooking.customerName}.
                </p>
              </div>

              <div className="pt-3 space-y-2">
                <button
                  onClick={() => {
                    haptics.success();
                    exportSingleBookingReceipt(selectedBooking);
                    showToast('Receipt Downloaded', `Invoice #${selectedBooking.id} saved to CSV`, 'success');
                  }}
                  className="w-full h-11 rounded-2xl bg-white border border-[#E5E7EB] text-[#021526] font-bold text-[13px] flex items-center justify-center gap-2 hover:border-[#16A34A] active-press transition-all cursor-pointer shadow-2xs"
                >
                  <Download className="w-4 h-4 text-[#16A34A]" />
                  <span>Download Payment Receipt</span>
                </button>

                <button
                  onClick={handleClose}
                  className="w-full h-12 rounded-2xl bg-[#F94001] text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-md hover:bg-[#D93600] active-press transition-all cursor-pointer"
                >
                  <span>Done & View Booking</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
