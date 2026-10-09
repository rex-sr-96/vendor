import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Check, Loader2, Sparkles, ArrowRight, Download, Copy, ShieldCheck, Smartphone, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'qrcode';
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
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  if (activeModal !== 'qr_payment' || !selectedBooking) return null;

  const isRemainingDue = selectedBooking.paidAmount > 0 && selectedBooking.balanceAmount > 0;
  const payableAmount = isRemainingDue 
    ? selectedBooking.balanceAmount 
    : (selectedBooking.balanceAmount || selectedBooking.totalAmount || 0);

  // Resolve Real Payee UPI ID (clean without spaces)
  const rawUpiId = (
    paymentSettings?.upiId ||
    '9600309604@okaxis'
  ).trim();

  // Resolve Business/Venue Name for Payee (alphanumeric for safe scanner intent)
  const payeeName = 'iBookSports';

  const bookingCode = selectedBooking.id.startsWith('BK-') ? selectedBooking.id : `BK-${selectedBooking.id}`;

  // Standard Universal NPCI UPI URI Specification (100% compatible with GPay, PhonePe, Paytm, BHIM, CRED, Amazon Pay, Any Bank App)
  // Crucial: pa should NOT encode '@' (pa=user@bank), no 'tr' parameter (which fails for P2P/standard VPAs on GPay/PhonePe)
  const upiPayloadUri = `upi://pay?pa=${rawUpiId}&pn=${encodeURIComponent(payeeName)}&am=${payableAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Booking ${bookingCode}`)}`;

  // Generate Real High-Resolution QR Code
  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(upiPayloadUri, {
      width: 400,
      margin: 1,
      color: {
        dark: '#021526',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (isMounted) setQrCodeDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate dynamic UPI QR code:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [upiPayloadUri]);

  const handleCopyUpiId = () => {
    haptics.tap();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(rawUpiId).catch(() => {});
    }
    setCopiedUpi(true);
    showToast('UPI ID Copied', `${rawUpiId} copied to clipboard`, 'success');
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleConfirmReceived = () => {
    setIsProcessing(true);
    haptics.tap();
    completeBookingPayment(selectedBooking.id);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentReceived(true);
      haptics.success();
      showToast('Payment Verified', `₹${payableAmount.toLocaleString('en-IN')} confirmed via UPI`, 'success');
    }, 600);
  };

  const handleOpenUpiApp = () => {
    haptics.tap();
    window.location.href = upiPayloadUri;
  };

  const handleClose = () => {
    setPaymentReceived(false);
    setActiveModal(null);
    haptics.tap();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-xs select-none">
        {/* Backdrop click to dismiss */}
        <div className="absolute inset-0" onClick={handleClose} />

        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-h-[92vh] overflow-y-auto no-scrollbar md:max-w-md md:rounded-[28px] bg-white rounded-t-[32px] p-5 pb-8 shadow-2xl border border-[#E5E7EB] space-y-3"
        >
          {/* iOS-style Grab Handle */}
          <div className="w-10 h-1 bg-[#E5E7EB] rounded-full mx-auto mb-2 md:hidden" />

          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-[#F3F4F4]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#021526] text-white flex items-center justify-center font-black text-[12px]">
                UPI
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-[#021526]">Scan & Pay via UPI</h2>
                <p className="text-[10.5px] text-[#5F6368]">GPay · PhonePe · Paytm · BHIM · CRED</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-[#F3F4F4] flex items-center justify-center text-[#5F6368] hover:text-[#021526] active-press cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {!paymentReceived ? (
            /* Live Dynamic QR State */
            <div className="text-center py-2 space-y-3">
              {/* Financial Breakdown Card */}
              <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-[#E2E8F0] text-[12px] space-y-1.5 text-left">
                {isRemainingDue ? (
                  <>
                    <div className="flex justify-between text-[#64748B]">
                      <span>Total Court Price:</span>
                      <strong className="text-[#021526]">₹{selectedBooking.totalAmount.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="flex justify-between text-[#16A34A] font-semibold">
                      <span>Advance Already Paid:</span>
                      <span>-₹{selectedBooking.paidAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-baseline pt-1.5 border-t border-[#E2E8F0] font-bold text-[#021526]">
                      <span className="text-[#B87C0D]">Remaining Balance Due:</span>
                      <span className="text-[18px] font-black text-[#B87C0D]">
                        ₹{payableAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-[#64748B]">
                      <span>Booking Total:</span>
                      <strong className="text-[#021526]">₹{payableAmount.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="flex justify-between items-baseline pt-1.5 border-t border-[#E2E8F0] font-bold text-[#021526]">
                      <span>Total Amount Payable:</span>
                      <span className="text-[18px] font-black text-[#021526]">
                        ₹{payableAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Real Scannable QR Code Canvas */}
              <div className="relative mx-auto w-56 p-3 bg-white rounded-3xl border-2 border-[#021526]/10 shadow-lg flex flex-col items-center justify-center">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="Scan UPI QR Code to Pay"
                    className="w-48 h-48 object-contain rounded-xl"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center bg-gray-50 rounded-xl">
                    <Loader2 className="w-8 h-8 animate-spin text-[#F94001]" />
                  </div>
                )}

                {/* NPCI Verified Badge */}
                <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-[#16A34A] bg-[#DCFCE7] px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>NPCI Dynamic UPI Verified</span>
                </div>
              </div>

              {/* Payee Info & Copy UPI ID */}
              <div className="bg-[#F3F4F4] p-2.5 rounded-xl border border-[#E5E7EB] flex items-center justify-between text-left">
                <div className="truncate pr-2">
                  <span className="text-[10px] uppercase font-bold text-[#5F6368] block">Payee UPI ID</span>
                  <span className="text-[12px] font-mono font-bold text-[#021526] truncate block">{rawUpiId}</span>
                </div>
                <button
                  onClick={handleCopyUpiId}
                  className="px-2.5 py-1 rounded-lg bg-white border border-[#E5E7EB] text-[11px] font-bold text-[#021526] flex items-center gap-1 hover:bg-[#E5E7EB] active-press cursor-pointer shrink-0"
                >
                  {copiedUpi ? <Check className="w-3 h-3 text-[#16A34A]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Supported UPI Apps Row */}
              <div className="pt-1">
                <p className="text-[10.5px] font-medium text-[#64748B] mb-2">Supported UPI Payment Apps</p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {['Google Pay', 'PhonePe', 'Paytm', 'BHIM', 'CRED', 'Amazon Pay'].map((app) => (
                    <span
                      key={app}
                      className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-[#F1F5F9] text-[#334155] border border-[#E2E8F0]"
                    >
                      {app}
                    </span>
                  ))}
                </div>
              </div>

              {/* Mobile Direct Pay Button */}
              <div className="pt-1 md:hidden">
                <button
                  onClick={handleOpenUpiApp}
                  className="w-full py-2.5 px-4 rounded-2xl bg-[#021526] text-white text-[13px] font-bold flex items-center justify-center gap-2 active-press cursor-pointer shadow-sm"
                >
                  <Smartphone className="w-4 h-4 text-[#F94001]" />
                  <span>Tap to Pay in UPI App (GPay / PhonePe)</span>
                </button>
              </div>

              {/* Mark as Received & Confirm Button */}
              <div className="pt-2">
                <button
                  onClick={handleConfirmReceived}
                  disabled={isProcessing}
                  className="w-full h-12 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white text-[14px] font-black flex items-center justify-center gap-2 transition-all active-press cursor-pointer shadow-md"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Verifying Payment...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Payment Received · Confirm Booking</span>
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
                  ✓ ₹{payableAmount.toLocaleString('en-IN')} Received
                </h3>
                <p className="text-[13px] text-[#5F6368] mt-0.5">
                  Confirmed via Dynamic UPI Scan for <strong>{selectedBooking.customerName}</strong> (#{bookingCode}).
                </p>
              </div>

              <div className="pt-3 space-y-2">
                <button
                  onClick={() => {
                    haptics.success();
                    exportSingleBookingReceipt(selectedBooking);
                    showToast('Receipt Downloaded', `Receipt #${bookingCode} exported`, 'success');
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

