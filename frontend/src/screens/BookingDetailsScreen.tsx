import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ChevronLeft,
  Phone,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  Banknote,
  CheckCircle2,
  AlertTriangle,
  Copy,
  MessageSquare,
  Download,
  XCircle,
  RotateCcw,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Lock,
} from 'lucide-react';
import { haptics } from '../utils/haptics';
import { exportSingleBookingReceipt } from '../utils/exportUtils';
import { calculateBookingFinancials, formatMinutesSeconds } from '../utils/feeCalculator';

export const BookingDetailsScreen: React.FC = () => {
  const {
    selectedBooking,
    courts,
    cancellationPolicy,
    navigateTo,
    goBack,
    setActiveModal,
    sendPaymentLink,
    isPaymentLinkBlocked,
    getPaymentLinkTimeRemaining,
    markBookingCompleted,
    cancelBookingWithRefund,
    showToast,
  } = useApp();

  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Cancel confirm state
  const [isCancelExpanded, setIsCancelExpanded] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

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
  const isCancelled = b.status === 'Cancelled';

  // Compute refund if customer were to cancel NOW (for cancellable bookings)
  const court = courts.find((c) => c.id === b.courtId);
  const refundPct = court?.refundPercentage ?? cancellationPolicy.refundPercentage ?? 100;
  const projectedRefund = Math.round((b.paidAmount * refundPct) / 100);

  // Is this booking cancellable (not already cancelled/completed/expired)
  const isCancellable = !['Cancelled', 'Completed', 'Expired'].includes(b.status);

  const copyPhone = () => {
    haptics.tap();
    navigator.clipboard?.writeText(b.customerPhone);
    showToast('Copied to Clipboard', b.customerPhone, 'info');
  };

  const handleSupportClick = () => {
    haptics.tap();
    navigateTo('support_form');
  };

  const handleConfirmCancel = () => {
    if (!cancelReason.trim()) {
      showToast('Reason Required', 'Please enter the customer\'s cancellation reason.', 'warning');
      return;
    }
    setIsConfirming(true);
    haptics.success();
    cancelBookingWithRefund(b.id, cancelReason.trim());
    setTimeout(() => {
      setIsConfirming(false);
      setIsCancelExpanded(false);
      goBack();
    }, 600);
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
          className="md:hidden w-9 h-9 -ml-1 rounded-xl flex items-center justify-center text-[#171717] hover:bg-[#E8E6E1]/50 active-press transition-colors cursor-pointer"
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
          {isCancelled ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-red-100 text-red-700 inline-flex items-center gap-1">
              <XCircle className="w-3 h-3" />
              Cancelled
            </span>
          ) : isFullyPaid ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#2FA66A]/15 text-[#1E774A] inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Paid Full
            </span>
          ) : b.paidAmount > 0 ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#E7A72F]/15 text-[#B87C0D] inline-flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#B87C0D]" />
              Advance Paid (Due ₹{b.balanceAmount.toLocaleString('en-IN')})
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#E7A72F]/15 text-[#B87C0D] inline-flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Unpaid Pending
            </span>
          )}
        </div>
      </div>

      {/* ===== CANCELLATION STATUS CARD (shown when Cancelled) ===== */}
      {isCancelled && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-[14px] font-black text-red-800">Booking Cancelled by Customer</h3>
                <p className="text-[11px] text-red-500 mt-0.5">{b.cancelledAt || 'Cancellation time not recorded'}</p>
              </div>
            </div>
          </div>

          {/* Customer's reason */}
          {b.cancellationReason && (
            <div className="bg-white border border-red-200 rounded-xl p-3">
              <p className="text-[10.5px] font-bold text-red-600 uppercase tracking-wider mb-1">Customer's Reason</p>
              <p className="text-[12.5px] text-[#171717] font-medium leading-relaxed">
                "{b.cancellationReason}"
              </p>
            </div>
          )}

          {/* Refund Status */}
          <div className="flex items-center justify-between bg-white border border-red-200 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#777570]" />
              <div>
                <p className="text-[11px] font-bold text-[#777570] uppercase tracking-wider">Refund Status</p>
                {b.refundStatus === 'Processed' ? (
                  <p className="text-[13px] font-black text-[#2FA66A]">
                    ₹{(b.refundAmount || 0).toLocaleString('en-IN')} Refunded to Customer
                  </p>
                ) : b.refundStatus === 'Not Eligible' ? (
                  <p className="text-[13px] font-black text-[#777570]">Not Eligible (No advance paid)</p>
                ) : (
                  <p className="text-[13px] font-black text-[#E7A72F]">Pending Processing</p>
                )}
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[10.5px] font-black border whitespace-nowrap ${
                b.refundStatus === 'Processed'
                  ? 'bg-[#2FA66A]/10 text-[#2FA66A] border-[#2FA66A]/20'
                  : b.refundStatus === 'Not Eligible'
                  ? 'bg-[#F1F0EC] text-[#777570] border-[#E8E6E1]'
                  : 'bg-[#E7A72F]/10 text-[#B87C0D] border-[#E7A72F]/20'
              }`}
            >
              {b.refundStatus || 'Pending'}
            </span>
          </div>

          {b.refundStatus === 'Processed' && (
            <p className="text-[11px] text-red-500 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              Refund processed via Razorpay to customer's original payment source. Visible in Settlement Audit.
            </p>
          )}
        </div>
      )}

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
      {!isCancelled && (
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

          {(() => {
            const fin = calculateBookingFinancials(b.totalAmount);
            return (
              <div className="space-y-1.5 text-[12px]">
                <div className="flex justify-between text-[#777570]">
                  <span>Base Court Cost:</span>
                  <span className="font-bold text-[#171717]">₹{fin.baseCourtCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#777570]">
                  <span>Venue GST (18%):</span>
                  <span className="font-bold text-[#171717]">₹{fin.courtGst18.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#171717] font-bold bg-[#FAF9F6] p-1.5 rounded-lg border border-[#E8E6E1]">
                  <span>Total Turf Price (Venue Revenue):</span>
                  <span>₹{fin.courtTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#777570] pt-0.5">
                  <span>Platform Convenience Fee (5%):</span>
                  <span className="font-bold text-[#B87C0D]">+₹{fin.convenienceFee5Percent.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#777570]">
                  <span>Convenience GST (18% on fee):</span>
                  <span className="font-bold text-[#B87C0D]">+₹{fin.convenienceGst18Percent.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#777570]">
                  <span>Advance Paid ({b.paymentMethod || 'Online'}):</span>
                  <span className="font-bold text-[#2FA66A]">
                    -₹{b.paidAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="pt-1.5 border-t border-[#F1F0EC] flex justify-between items-baseline">
                  <span className="font-bold text-[#171717]">Remaining Balance Due:</span>
                  <span
                    className={`text-[18px] font-extrabold ${
                      b.balanceAmount > 0 ? 'text-[#E7A72F]' : 'text-[#2FA66A]'
                    }`}
                  >
                    ₹{b.balanceAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Banner */}
          {b.balanceAmount > 0 ? (
            <div className="bg-[#E7A72F]/15 border border-[#E7A72F]/30 rounded-xl p-2.5 text-center">
              <span className="text-[11px] font-extrabold text-[#B87C0D] uppercase tracking-wider block">
                BALANCE DUE ₹{b.balanceAmount.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-[#777570] block mt-0.5">
                Collect via payment link, UPI QR, or cash at counter
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

          {/* Payment / Action Hub based on exact Booking Status */}
          {/* State A: Hold Active (Payment Pending) */}
          {b.status === 'Payment Pending' && (
            <div className="space-y-2.5 pt-1">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-800 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-600" />
                    Pending Customer Online Payment
                  </span>
                  <span className="text-[11px] font-bold text-[#171717] bg-white px-2.5 py-0.5 rounded-md border border-[#E8E6E1]">
                    Due ₹{(b.balanceAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-[11px] text-[#777570]">
                  Payment link is valid for 15 minutes. When customer completes payment, booking automatically moves to <strong>Confirmed</strong>.
                </p>
                <button
                  type="button"
                  disabled={isPaymentLinkBlocked(b.id)}
                  onClick={() => {
                    haptics.tap();
                    if (isPaymentLinkBlocked(b.id)) {
                      const sec = getPaymentLinkTimeRemaining(b.id);
                      showToast(
                        'Payment Link Active',
                        `Payment link is valid for 15 mins. Button blocked for ${formatMinutesSeconds(sec)}.`,
                        'info'
                      );
                      return;
                    }
                    sendPaymentLink(b.id);
                  }}
                  className={`w-full h-11 rounded-xl font-black text-[12.5px] flex items-center justify-center gap-2 shadow-xs transition-all ${
                    isPaymentLinkBlocked(b.id)
                      ? 'bg-amber-100 text-amber-900 border border-amber-300 cursor-not-allowed'
                      : 'bg-[#FF6B2C] hover:bg-[#e85b1e] text-white cursor-pointer'
                  }`}
                >
                  {isPaymentLinkBlocked(b.id) ? (
                    <>
                      <Lock className="w-4 h-4 text-amber-700" />
                      <span>Payment Link Active · Blocked for {formatMinutesSeconds(getPaymentLinkTimeRemaining(b.id))}</span>
                    </>
                  ) : (
                    <span>Send Payment Link (15m Validity)</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* State B: Expired (Unpaid hold timed out) */}
          {b.status === 'Expired' && (
            <div className="space-y-2.5 pt-1">
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-xs">
                <span className="font-bold text-red-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  Hold Expired (Unpaid Slot)
                </span>
                <span className="font-bold text-red-700">Expired</span>
              </div>
              <button
                onClick={() => {
                  haptics.tap();
                  sendPaymentLink(b.id);
                }}
                className="w-full h-11 rounded-xl bg-[#FF6B2C] hover:bg-[#e85b1e] text-white font-black text-[12.5px] flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <span>Re-lock & Send Payment Link</span>
              </button>
            </div>
          )}

          {/* State C: Active Booking with Remaining Balance */}
          {!isFullyPaid && b.status !== 'Expired' && b.status !== 'Payment Pending' && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between pb-1">
                <span className="text-[11px] font-bold text-[#FF6B2C] uppercase tracking-wider">
                  Balance Due: ₹{(b.balanceAmount || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] font-semibold text-[#777570]">
                  Choose Collection Method
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  disabled={isPaymentLinkBlocked(b.id)}
                  onClick={() => {
                    haptics.tap();
                    if (isPaymentLinkBlocked(b.id)) {
                      const sec = getPaymentLinkTimeRemaining(b.id);
                      showToast(
                        'Payment Link Active',
                        `Payment link is active for 15 mins. Button blocked for ${formatMinutesSeconds(sec)}.`,
                        'info'
                      );
                      return;
                    }
                    sendPaymentLink(b.id);
                  }}
                  className={`h-11 rounded-xl font-bold text-[11.5px] flex items-center justify-center gap-1 shadow-xs transition-all ${
                    isPaymentLinkBlocked(b.id)
                      ? 'bg-amber-100 text-amber-900 border border-amber-300 cursor-not-allowed'
                      : 'bg-[#FF6B2C] text-white hover:bg-[#e85b1e] active-press cursor-pointer'
                  }`}
                >
                  {isPaymentLinkBlocked(b.id) ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-700" />
                      <span>Link Sent ({formatMinutesSeconds(getPaymentLinkTimeRemaining(b.id))})</span>
                    </>
                  ) : (
                    <span>Pay Link</span>
                  )}
                </button>
                <button
                  onClick={() => {
                    haptics.tap();
                    setActiveModal('qr_payment');
                  }}
                  className="h-11 rounded-xl bg-[#171717] text-white font-bold text-[11.5px] flex items-center justify-center gap-1 shadow-xs hover:bg-black active-press transition-all cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>UPI QR</span>
                </button>
                <button
                  onClick={() => {
                    haptics.tap();
                    setActiveModal('record_cash');
                  }}
                  className="h-11 rounded-xl bg-[#2FA66A] text-white font-bold text-[11.5px] flex items-center justify-center gap-1 shadow-xs hover:bg-[#258756] active-press transition-all cursor-pointer"
                >
                  <Banknote className="w-3.5 h-3.5" />
                  <span>Cash</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Complete Booking CTA — hidden when cancelled */}
      {!isCancelled && (
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
      )}

      {/* ===== CUSTOMER CANCELLATION SECTION (for cancellable bookings) ===== */}
      {isCancellable && (
        <div className="bg-white rounded-2xl border border-[#E8E6E1] shadow-xs overflow-hidden">
          {/* Toggle Header */}
          <button
            onClick={() => {
              haptics.tap();
              setIsCancelExpanded((p) => !p);
            }}
            className="w-full flex items-center justify-between p-3.5 text-left cursor-pointer hover:bg-[#FAF9F6] transition-colors"
          >
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-[13px] font-bold text-[#171717]">Mark as Customer Cancelled</span>
            </div>
            <div className="flex items-center gap-2">
              {b.paidAmount > 0 && (
                <span className="text-[10.5px] font-bold text-[#2FA66A] bg-[#2FA66A]/10 px-2 py-0.5 rounded-full border border-[#2FA66A]/20">
                  Refund: ₹{projectedRefund.toLocaleString('en-IN')} ({refundPct}%)
                </span>
              )}
              {isCancelExpanded ? (
                <ChevronUp className="w-4 h-4 text-[#777570]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#777570]" />
              )}
            </div>
          </button>

          {/* Expanded Cancel Form */}
          {isCancelExpanded && (
            <div className="px-3.5 pb-3.5 space-y-3 border-t border-[#F1F0EC]">
              {/* Refund Preview */}
              <div className={`mt-3 rounded-xl p-3 text-[12px] border ${b.paidAmount > 0 ? 'bg-[#2FA66A]/5 border-[#2FA66A]/20' : 'bg-[#F7F7F5] border-[#E8E6E1]'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#171717]">Refund on Cancellation:</span>
                  <span className={`font-black text-[14px] ${b.paidAmount > 0 ? 'text-[#2FA66A]' : 'text-[#777570]'}`}>
                    {b.paidAmount > 0 ? `₹${projectedRefund.toLocaleString('en-IN')}` : '₹0 (No advance)'}
                  </span>
                </div>
                {b.paidAmount > 0 && (
                  <p className="text-[11px] text-[#777570] mt-1">
                    {refundPct}% of ₹{b.paidAmount.toLocaleString('en-IN')} advance paid → returned to customer's original payment source via Razorpay.
                  </p>
                )}
                {b.paidAmount === 0 && (
                  <p className="text-[11px] text-[#777570] mt-1">
                    No advance was collected — no refund applicable.
                  </p>
                )}
              </div>

              {/* Reason Input */}
              <div>
                <label className="text-[11.5px] font-bold text-[#171717] block mb-1.5">
                  Customer's Cancellation Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Plan changed, rain, emergency, travel…"
                  rows={2}
                  className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-[12.5px] text-[#171717] placeholder-[#A3A099] focus:outline-none focus:border-[#FF6B2C] resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    haptics.tap();
                    setIsCancelExpanded(false);
                    setCancelReason('');
                  }}
                  className="h-10 rounded-xl bg-[#F1F0EC] text-[#171717] font-bold text-[12px] cursor-pointer hover:bg-[#E8E6E1] transition-colors"
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleConfirmCancel}
                  disabled={isConfirming}
                  className="h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-[12px] cursor-pointer transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  {b.paidAmount > 0
                    ? `Cancel & Refund ₹${projectedRefund.toLocaleString('en-IN')}`
                    : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

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
