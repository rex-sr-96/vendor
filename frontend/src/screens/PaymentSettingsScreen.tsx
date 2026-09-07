import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Building2,
  CheckCircle2,
  QrCode,
  CreditCard,
  Banknote,
  ArrowRight,
  X,
  ShieldCheck,
  Percent,
  ChevronLeft,
} from 'lucide-react';
import { haptics } from '../utils/haptics';
import { motion, AnimatePresence } from 'motion/react';

export const PaymentSettingsScreen: React.FC = () => {
  const { paymentSettings, updatePaymentSettings, goBack, showToast, venueName, ownerName, ownerPhone, ownerEmail, navigateTo } = useApp();
  const [showBankModal, setShowBankModal] = useState(false);
  const [newBankName, setNewBankName] = useState(paymentSettings.bankName);
  const [newAccHolder, setNewAccHolder] = useState(ownerName || 'Sky Sports Private Limited');
  const [newAccNum, setNewAccNum] = useState('50100492814321');
  const [newIfsc, setNewIfsc] = useState(paymentSettings.ifscCode);
  const [changeReason, setChangeReason] = useState('Upgrading to primary current account for higher daily transaction volume.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        request_type: 'BANK_CHANGE' as const,
        venue_name: venueName || 'Sky Sports Arena',
        vendor_name: ownerName || 'Arena Owner',
        vendor_email: ownerEmail || 'partner@ibooksports.com',
        vendor_phone: ownerPhone || '9876543210',
        bank_details: {
          bank_name: newBankName.trim(),
          account_holder_name: newAccHolder.trim(),
          account_number: newAccNum.trim(),
          ifsc_code: newIfsc.trim().toUpperCase(),
          account_type: 'Current Commercial Account',
          reason_for_change: changeReason.trim(),
        },
      };

      const res = await fetch('http://localhost:4000/api/v1/requests/vendor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Submission failed');

      haptics.success();
      setShowBankModal(false);
      showToast('Change Request Created', `Request ${data.request_id} submitted for compliance review.`, 'success');
    } catch (err: unknown) {
      const e = err as Error;
      showToast('Failed', e.message || 'Could not submit bank request', 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-20 pt-2 w-full space-y-6 select-none">
      {/* Mobile Back Button */}
      <button
        onClick={() => {
          haptics.tap();
          goBack();
        }}
        className="md:hidden flex items-center gap-1.5 text-[12.5px] font-bold text-[#FF6B2C] active-press cursor-pointer pb-1"
      >
        <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
        <span>Back to Settings</span>
      </button>

      {/* Header */}
      <div className="pb-2 border-b border-[#E8E6E1]/70">
        <h1 className="text-[24px] font-black text-[#171717] tracking-tight">Payment & Payout Rules</h1>
        <p className="text-[12.5px] font-medium text-[#777570]">
          Configure bank settlement account, advance percentages & collection methods
        </p>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left Column: Settlement Bank Account & Advance Rules */}
        <div className="space-y-5">
          {/* Settlement Bank Account Card */}
          <div className="bg-[#171717] text-white rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#A3A099]">
                    Settlement Bank Account
                  </span>
                  <h3 className="text-[17px] font-black tracking-tight">
                    {paymentSettings.bankName} {paymentSettings.accountNumberMasked}
                  </h3>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#2FA66A]/20 text-[#2FA66A] border border-[#2FA66A]/30 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified
              </span>
            </div>

            <div className="text-[12.5px] text-[#A3A099] flex items-center justify-between pt-3 border-t border-white/10">
              <span className="font-mono">IFSC: {paymentSettings.ifscCode}</span>
              <button
                onClick={() => {
                  haptics.tap();
                  setShowBankModal(true);
                }}
                className="text-[#FF6B2C] font-extrabold hover:underline cursor-pointer"
              >
                Change Bank
              </button>
            </div>
          </div>

          {/* Advance Collection Policy */}
          <div className="bg-white rounded-3xl p-5 border border-[#E8E6E1] shadow-2xs space-y-3">
            <div className="flex items-center gap-2.5 pb-2 border-b border-[#F1F0EC]">
              <div className="w-8 h-8 rounded-xl bg-[#FF6B2C]/10 text-[#FF6B2C] flex items-center justify-center">
                <Percent className="w-4 h-4" />
              </div>
              <h3 className="text-[14.5px] font-black text-[#171717]">Advance Deposit Policy</h3>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E1] flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-extrabold text-[#171717]">Required Advance Deposit</p>
                  <p className="text-[11.5px] text-[#777570]">Required payment upfront to confirm slot</p>
                </div>
                <span className="text-[13px] font-black text-[#171717] bg-white border border-[#E8E6E1] px-3 py-1 rounded-xl shadow-2xs">
                  {paymentSettings.advancePercentage}%
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E1] flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-extrabold text-[#171717]">Daily Payout Schedule</p>
                  <p className="text-[11.5px] text-[#777570]">Direct automated T+1 bank transfer</p>
                </div>
                <span className="text-[12px] font-extrabold text-[#2FA66A] bg-[#2FA66A]/10 px-3 py-1 rounded-xl">
                  Automated
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Accepted Payment Methods */}
        <div className="bg-white rounded-3xl p-5 border border-[#E8E6E1] shadow-2xs space-y-4">
          <h3 className="text-[14.5px] font-black text-[#171717] pb-2 border-b border-[#F1F0EC]">
            Accepted Collection Methods
          </h3>

          <div className="space-y-3">
            {/* Online Payment */}
            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E1] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#2FA66A]/10 text-[#2FA66A] flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[13.5px] font-extrabold text-[#171717]">Online Payments (UPI / Cards)</h4>
                  <p className="text-[11.5px] text-[#777570]">Collect via links & payment gateway</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  haptics.tap();
                  updatePaymentSettings({ onlinePayment: !paymentSettings.onlinePayment });
                }}
                className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                  paymentSettings.onlinePayment ? 'bg-[#2FA66A]' : 'bg-[#D1CFCA]'
                }`}
              >
                <div
                  className={`w-5.5 h-5.5 rounded-full bg-white shadow-md absolute top-0.75 transition-transform ${
                    paymentSettings.onlinePayment ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Counter UPI QR */}
            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E1] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FF6B2C]/10 text-[#FF6B2C] flex items-center justify-center">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[13.5px] font-extrabold text-[#171717]">Dynamic Counter QR</h4>
                  <p className="text-[11.5px] text-[#777570]">Instant on-spot scanner for walk-in players</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  haptics.tap();
                  updatePaymentSettings({ upiQr: !paymentSettings.upiQr });
                }}
                className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                  paymentSettings.upiQr ? 'bg-[#2FA66A]' : 'bg-[#D1CFCA]'
                }`}
              >
                <div
                  className={`w-5.5 h-5.5 rounded-full bg-white shadow-md absolute top-0.75 transition-transform ${
                    paymentSettings.upiQr ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Cash Payments */}
            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E1] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#3B82F6]/10 text-[#2563EB] flex items-center justify-center">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[13.5px] font-extrabold text-[#171717]">Cash Payment Recording</h4>
                  <p className="text-[11.5px] text-[#777570]">Allow counter staff to record paper cash</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  haptics.tap();
                  updatePaymentSettings({ cashPayment: !paymentSettings.cashPayment });
                }}
                className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                  paymentSettings.cashPayment ? 'bg-[#2FA66A]' : 'bg-[#D1CFCA]'
                }`}
              >
                <div
                  className={`w-5.5 h-5.5 rounded-full bg-white shadow-md absolute top-0.75 transition-transform ${
                    paymentSettings.cashPayment ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Bank Modal (Centered on Desktop) */}
      <AnimatePresence>
        {showBankModal && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-xs">
            <div className="absolute inset-0" onClick={() => setShowBankModal(false)} />

            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-full max-h-[90vh] md:max-w-md md:rounded-[28px] overflow-y-auto no-scrollbar bg-white rounded-t-[28px] p-6 pb-8 shadow-2xl border border-[#E8E6E1] space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F0EC]">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#FF6B2C]/10 text-[#FF6B2C] flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-black text-[#171717]">Change Bank Account</h2>
                    <p className="text-[11.5px] text-[#777570]">Direct IMPS/NEFT payout destination</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowBankModal(false)}
                  className="w-8 h-8 rounded-full bg-[#F7F7F5] flex items-center justify-center text-[#777570] hover:text-[#171717] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveBank} className="space-y-3.5">
                <div className="bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl p-3 text-[11.5px] text-[#55534E] leading-relaxed">
                  <strong className="text-[#171717] font-bold block mb-0.5">Compliance Verification</strong>
                  Submitting a bank change creates a formal audited request ticket. Existing payouts continue uninterrupted until verified.
                </div>

                <div>
                  <label className="text-[11.5px] font-bold text-[#777570] block mb-1">Bank Name</label>
                  <input
                    type="text"
                    required
                    value={newBankName}
                    onChange={(e) => setNewBankName(e.target.value)}
                    placeholder="e.g. HDFC Bank"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAF9F6] border border-[#E8E6E1] text-[13px] font-bold text-[#171717] focus:outline-none focus:border-[#171717]"
                  />
                </div>

                <div>
                  <label className="text-[11.5px] font-bold text-[#777570] block mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    required
                    value={newAccHolder}
                    onChange={(e) => setNewAccHolder(e.target.value)}
                    placeholder="e.g. Sky Sports Private Limited"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAF9F6] border border-[#E8E6E1] text-[13px] font-bold text-[#171717] focus:outline-none focus:border-[#171717]"
                  />
                </div>

                <div>
                  <label className="text-[11.5px] font-bold text-[#777570] block mb-1">Account Number</label>
                  <input
                    type="text"
                    required
                    value={newAccNum}
                    onChange={(e) => setNewAccNum(e.target.value)}
                    placeholder="50100492814321"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAF9F6] border border-[#E8E6E1] text-[13px] font-mono font-bold text-[#171717] focus:outline-none focus:border-[#171717]"
                  />
                </div>

                <div>
                  <label className="text-[11.5px] font-bold text-[#777570] block mb-1">IFSC Code</label>
                  <input
                    type="text"
                    required
                    value={newIfsc}
                    onChange={(e) => setNewIfsc(e.target.value.toUpperCase())}
                    placeholder="HDFC0001234"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAF9F6] border border-[#E8E6E1] text-[13px] font-mono font-bold text-[#171717] focus:outline-none focus:border-[#171717]"
                  />
                </div>

                <div>
                  <label className="text-[11.5px] font-bold text-[#777570] block mb-1">Reason for Bank Change</label>
                  <input
                    type="text"
                    required
                    value={changeReason}
                    onChange={(e) => setChangeReason(e.target.value)}
                    placeholder="e.g. Upgrading corporate current account"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAF9F6] border border-[#E8E6E1] text-[12.5px] font-medium text-[#171717] focus:outline-none focus:border-[#171717]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 mt-2 rounded-xl bg-[#171717] hover:bg-black text-white font-extrabold text-[13px] shadow-sm active-press cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>{isSubmitting ? 'Submitting Request...' : 'Submit Bank Change Request'}</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
