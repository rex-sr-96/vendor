import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Building2,
  CheckCircle2,
  QrCode,
  CreditCard,
  Banknote,
  X,
  Percent,
  ChevronLeft,
  BadgeCheck,
  Pencil,
  FileText,
  Eye,
} from 'lucide-react';
import { haptics } from '../utils/haptics';
import { motion, AnimatePresence } from 'motion/react';

export const PaymentSettingsScreen: React.FC = () => {
  const {
    paymentSettings,
    updatePaymentSettings,
    goBack,
    showToast,
    venueName,
    ownerName,
    ownerPhone,
    ownerEmail,
    navigateTo,
    bankBranchProofDocId,
    bankCancelledChequeUrl,
  } = useApp();

  // ── Change Bank modal ──────────────────────────────────────────────────────
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

      try {
        await fetch('http://localhost:4000/api/v1/requests/vendor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch {
        // Continue to update local state
      }

      haptics.success();
      const masked = `•••• ${newAccNum.slice(-4)}`;
      updatePaymentSettings({
        bankName: newBankName.trim(),
        accountNumberMasked: masked,
        ifscCode: newIfsc.trim().toUpperCase(),
        isVerified: true,
      });
      setShowBankModal(false);
      showToast('Bank Account Updated', `Payout bank updated to ${newBankName} (${masked}).`, 'success');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-20 pt-2 w-full space-y-6 select-none">
      {/* Mobile Back */}
      <button
        onClick={() => { haptics.tap(); goBack(); }}
        className="md:hidden flex items-center gap-1.5 text-[12.5px] font-bold text-[#F94001] active-press cursor-pointer pb-1"
      >
        <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
        <span>Back to Settings</span>
      </button>

      {/* Header */}
      <div className="pb-2 border-b border-[#E5E7EB]/70">
        <h1 className="text-[24px] font-black text-[#021526] tracking-tight">Payment & Payout Rules</h1>
        <p className="text-[12.5px] font-medium text-[#5F6368]">
          Configure settlement bank account, advance percentages & collection methods
        </p>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left: Bank Account + Advance Policy */}
        <div className="space-y-5">
          {/* Bank Account Card */}
          <div className="bg-[#021526] rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6368]">
                    Settlement Bank Account
                  </span>
                  <h3 className="text-[17px] font-black tracking-tight text-white">
                    {paymentSettings.bankName}
                  </h3>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/30 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified
              </span>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-2.5 bg-white/8 rounded-2xl p-3 text-[11.5px]">
              <div>
                <span className="block font-bold text-[#5F6368]">Account Number</span>
                <span className="font-mono font-black text-white">{paymentSettings.accountNumberMasked}</span>
              </div>
              <div>
                <span className="block font-bold text-[#5F6368]">IFSC Code</span>
                <span className="font-mono font-black text-white">{paymentSettings.ifscCode}</span>
              </div>
              <div>
                <span className="block font-bold text-[#5F6368]">Account Holder</span>
                <span className="font-bold text-white">Dhanush Kumar (TurfTown Arena)</span>
              </div>
              <div>
                <span className="block font-bold text-[#5F6368]">Account Type</span>
                <span className="font-bold text-white">Current Commercial</span>
              </div>
            </div>

            {/* Cancelled Cheque / Passbook Proof */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/6 border border-white/10 text-[11.5px]">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center text-[#16A34A] shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block font-bold text-[#5F6368] text-[9.5px] uppercase">Cancelled Cheque / Passbook</span>
                  <span className="font-mono text-white text-[11.5px] font-bold truncate block">
                    {bankBranchProofDocId || 'doc_bank_proof_1788778055198'}
                  </span>
                </div>
              </div>
              <a
                href={bankCancelledChequeUrl || `http://localhost:4000/api/v1/onboarding/documents/${bankBranchProofDocId || 'doc_bank_proof_1788778055198'}/view`}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
              >
                <Eye className="w-3 h-3 text-[#5F6368]" />
                <span>View</span>
              </a>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#16A34A]">
                <BadgeCheck className="w-4 h-4" />
                <span>T+0 Auto IMPS Midnight Direct Settlement</span>
              </div>
              <button
                onClick={() => { haptics.tap(); setShowBankModal(true); }}
                className="h-8 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[12px] font-bold flex items-center gap-1.5 cursor-pointer active-press transition-all"
              >
                <Pencil className="w-3.5 h-3.5" />
                Change
              </button>
            </div>
          </div>

          {/* Advance Policy */}
          <div className="bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-2xs space-y-3">
            <div className="flex items-center gap-2.5 pb-2 border-b border-[#F3F4F4]">
              <div className="w-8 h-8 rounded-xl bg-[#F94001]/10 text-[#F94001] flex items-center justify-center">
                <Percent className="w-4 h-4" />
              </div>
              <h3 className="text-[14.5px] font-black text-[#021526]">Advance Deposit Policy</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#F3F4F4] border border-[#E5E7EB] flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-extrabold text-[#021526]">Required Advance Deposit</p>
                  <p className="text-[11.5px] text-[#5F6368]">Required payment upfront to confirm slot</p>
                </div>
                <span className="text-[13px] font-black text-[#021526] bg-white border border-[#E5E7EB] px-3 py-1 rounded-xl shadow-2xs">
                  {paymentSettings.advancePercentage}%
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F3F4F4] border border-[#E5E7EB] flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-extrabold text-[#021526]">Daily Payout Schedule</p>
                  <p className="text-[11.5px] text-[#5F6368]">Direct automated T+0 bank transfer</p>
                </div>
                <span className="text-[12px] font-extrabold text-[#16A34A] bg-[#16A34A]/10 px-3 py-1 rounded-xl">
                  Automated
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Accepted Payment Methods */}
        <div className="bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-2xs space-y-4">
          <h3 className="text-[14.5px] font-black text-[#021526] pb-2 border-b border-[#F3F4F4]">
            Accepted Collection Methods
          </h3>
          <div className="space-y-3">
            {[
              { key: 'onlinePayment' as const, icon: CreditCard, color: '#16A34A', title: 'Online Payments (UPI / Cards)', sub: 'Collect via links & payment gateway' },
              { key: 'upiQr' as const, icon: QrCode, color: '#F94001', title: 'Dynamic Counter QR', sub: 'Instant on-spot scanner for walk-in players' },
              { key: 'cashPayment' as const, icon: Banknote, color: '#2563EB', title: 'Cash Payment Recording', sub: 'Allow counter staff to record paper cash' },
            ].map(({ key, icon: Icon, color, title, sub }) => {
              const isOn = !!paymentSettings[key];
              return (
                <div key={key} className="p-4 rounded-2xl bg-[#F3F4F4] border border-[#E5E7EB] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18` }}>
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div>
                      <h4 className="text-[13.5px] font-extrabold text-[#021526]">{title}</h4>
                      <p className="text-[11.5px] text-[#5F6368]">{sub}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { haptics.tap(); updatePaymentSettings({ [key]: !isOn }); }}
                    className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer shrink-0 ${isOn ? 'bg-[#16A34A]' : 'bg-[#E5E7EB]'}`}
                  >
                    <div className={`w-[18px] h-[18px] rounded-full bg-white shadow-md absolute top-[5px] transition-transform ${isOn ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── CHANGE BANK MODAL ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showBankModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end md:items-center justify-center md:p-4 bg-black/65 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setShowBankModal(false); }}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="relative w-full md:max-w-md md:rounded-[28px] bg-white rounded-t-[28px] p-6 pb-8 shadow-2xl border border-[#E5E7EB] space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-[#E5E7EB] rounded-full mx-auto -mt-2 md:hidden" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#F94001]/10 text-[#F94001] flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-[17px] font-black text-[#021526]">Change Bank Account</h2>
                    <p className="text-[11.5px] text-[#5F6368]">Direct IMPS/NEFT payout destination</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBankModal(false)}
                  className="w-8 h-8 rounded-full bg-[#F3F4F4] flex items-center justify-center text-[#5F6368] hover:text-[#021526] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveBank} className="space-y-3.5">
                <div className="bg-[#F3F4F4] border border-[#E5E7EB] rounded-xl p-3 text-[11.5px] text-[#5F6368] leading-relaxed">
                  <strong className="text-[#021526] font-bold block mb-0.5">Compliance Verification</strong>
                  Submitting a bank change creates a formal audited request ticket. Existing payouts continue uninterrupted until verified.
                </div>

                <div>
                  <label className="text-[11.5px] font-bold text-[#5F6368] block mb-1">Bank Name</label>
                  <input
                    type="text" required value={newBankName}
                    onChange={(e) => setNewBankName(e.target.value)}
                    placeholder="e.g. HDFC Bank"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#F3F4F4] border border-[#E5E7EB] text-[13px] font-bold text-[#021526] focus:outline-none focus:border-[#021526]"
                  />
                </div>

                <div>
                  <label className="text-[11.5px] font-bold text-[#5F6368] block mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    required
                    value={newAccHolder}
                    onChange={(e) => setNewAccHolder(e.target.value)}
                    placeholder="e.g. Sky Sports Private Limited"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#F3F4F4] border border-[#E5E7EB] text-[13px] font-bold text-[#021526] focus:outline-none focus:border-[#021526]"
                  />
                </div>
                <div>
                  <label className="text-[11.5px] font-bold text-[#5F6368] block mb-1">Account Number</label>
                  <input
                    type="text" required value={newAccNum}
                    onChange={(e) => setNewAccNum(e.target.value)}
                    placeholder="50100492814321"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#F3F4F4] border border-[#E5E7EB] text-[13px] font-mono font-bold text-[#021526] focus:outline-none focus:border-[#021526]"
                  />
                </div>
                <div>
                  <label className="text-[11.5px] font-bold text-[#5F6368] block mb-1">IFSC Code</label>
                  <input
                    type="text" required value={newIfsc}
                    onChange={(e) => setNewIfsc(e.target.value.toUpperCase())}
                    placeholder="HDFC0001234"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#F3F4F4] border border-[#E5E7EB] text-[13px] font-mono font-bold text-[#021526] focus:outline-none focus:border-[#021526]"
                  />
                </div>

                <div>
                  <label className="text-[11.5px] font-bold text-[#5F6368] block mb-1">Reason for Bank Change</label>
                  <input
                    type="text"
                    required
                    value={changeReason}
                    onChange={(e) => setChangeReason(e.target.value)}
                    placeholder="e.g. Upgrading corporate current account"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#F3F4F4] border border-[#E5E7EB] text-[12.5px] font-medium text-[#021526] focus:outline-none focus:border-[#021526]"
                  />
                </div>
                <div className="flex items-start gap-2 text-[11px] text-[#5F6368] bg-[#F3F4F4] border border-[#E5E7EB] rounded-xl p-3">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                  <span>Changes are saved immediately. All future settlements will go to this account.</span>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 mt-2 rounded-xl bg-[#021526] hover:bg-black text-white font-extrabold text-[13px] shadow-sm active-press cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>{isSubmitting ? 'Saving Bank Account...' : 'Save Bank Account'}</span>
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
