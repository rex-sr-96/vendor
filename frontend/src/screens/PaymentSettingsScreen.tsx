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
} from 'lucide-react';
import { haptics } from '../utils/haptics';
import { motion, AnimatePresence } from 'motion/react';

export const PaymentSettingsScreen: React.FC = () => {
  const { paymentSettings, updatePaymentSettings, goBack, showToast } = useApp();

  // ── Change Bank modal ──────────────────────────────────────────────────────
  const [showBankModal, setShowBankModal] = useState(false);
  const [newBankName, setNewBankName] = useState(paymentSettings.bankName);
  const [newAccNum, setNewAccNum] = useState('50100492814321');
  const [newIfsc, setNewIfsc] = useState(paymentSettings.ifscCode);

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
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
  };

  return (
    <div className="pb-20 pt-2 w-full space-y-6 select-none">
      {/* Mobile Back */}
      <button
        onClick={() => { haptics.tap(); goBack(); }}
        className="md:hidden flex items-center gap-1.5 text-[12.5px] font-bold text-[#FF6B2C] active-press cursor-pointer pb-1"
      >
        <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
        <span>Back to Settings</span>
      </button>

      {/* Header */}
      <div className="pb-2 border-b border-[#E8E6E1]/70">
        <h1 className="text-[24px] font-black text-[#171717] tracking-tight">Payment & Payout Rules</h1>
        <p className="text-[12.5px] font-medium text-[#777570]">
          Configure settlement bank account, advance percentages & collection methods
        </p>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left: Bank Account + Advance Policy */}
        <div className="space-y-5">
          {/* Bank Account Card */}
          <div className="bg-[#171717] rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#A3A099]">
                    Settlement Bank Account
                  </span>
                  <h3 className="text-[17px] font-black tracking-tight text-white">
                    {paymentSettings.bankName}
                  </h3>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#2FA66A]/20 text-[#2FA66A] border border-[#2FA66A]/30 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified
              </span>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-2.5 bg-white/8 rounded-2xl p-3 text-[11.5px]">
              <div>
                <span className="block font-bold text-[#A3A099]">Account Number</span>
                <span className="font-mono font-black text-white">{paymentSettings.accountNumberMasked}</span>
              </div>
              <div>
                <span className="block font-bold text-[#A3A099]">IFSC Code</span>
                <span className="font-mono font-black text-white">{paymentSettings.ifscCode}</span>
              </div>
              <div>
                <span className="block font-bold text-[#A3A099]">Account Holder</span>
                <span className="font-bold text-white">Dhanush Kumar (TurfTown Arena)</span>
              </div>
              <div>
                <span className="block font-bold text-[#A3A099]">Account Type</span>
                <span className="font-bold text-white">Current Commercial</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#2FA66A]">
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
                  <p className="text-[11.5px] text-[#777570]">Direct automated T+0 bank transfer</p>
                </div>
                <span className="text-[12px] font-extrabold text-[#2FA66A] bg-[#2FA66A]/10 px-3 py-1 rounded-xl">
                  Automated
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Accepted Payment Methods */}
        <div className="bg-white rounded-3xl p-5 border border-[#E8E6E1] shadow-2xs space-y-4">
          <h3 className="text-[14.5px] font-black text-[#171717] pb-2 border-b border-[#F1F0EC]">
            Accepted Collection Methods
          </h3>
          <div className="space-y-3">
            {[
              { key: 'onlinePayment' as const, icon: CreditCard, color: '#2FA66A', title: 'Online Payments (UPI / Cards)', sub: 'Collect via links & payment gateway' },
              { key: 'upiQr' as const, icon: QrCode, color: '#FF6B2C', title: 'Dynamic Counter QR', sub: 'Instant on-spot scanner for walk-in players' },
              { key: 'cashPayment' as const, icon: Banknote, color: '#2563EB', title: 'Cash Payment Recording', sub: 'Allow counter staff to record paper cash' },
            ].map(({ key, icon: Icon, color, title, sub }) => {
              const isOn = !!paymentSettings[key];
              return (
                <div key={key} className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E1] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18` }}>
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div>
                      <h4 className="text-[13.5px] font-extrabold text-[#171717]">{title}</h4>
                      <p className="text-[11.5px] text-[#777570]">{sub}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { haptics.tap(); updatePaymentSettings({ [key]: !isOn }); }}
                    className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer shrink-0 ${isOn ? 'bg-[#2FA66A]' : 'bg-[#D1CFCA]'}`}
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
              className="relative w-full md:max-w-md md:rounded-[28px] bg-white rounded-t-[28px] p-6 pb-8 shadow-2xl border border-[#E8E6E1] space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-[#D1CFCA] rounded-full mx-auto -mt-2 md:hidden" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FF6B2C]/10 text-[#FF6B2C] flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-[17px] font-black text-[#171717]">Change Bank Account</h2>
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
                <div>
                  <label className="text-[11.5px] font-bold text-[#777570] block mb-1">Bank Name</label>
                  <input
                    type="text" required value={newBankName}
                    onChange={(e) => setNewBankName(e.target.value)}
                    placeholder="e.g. HDFC Bank"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAF9F6] border border-[#E8E6E1] text-[13px] font-bold text-[#171717] focus:outline-none focus:border-[#FF6B2C]"
                  />
                </div>
                <div>
                  <label className="text-[11.5px] font-bold text-[#777570] block mb-1">Account Number</label>
                  <input
                    type="text" required value={newAccNum}
                    onChange={(e) => setNewAccNum(e.target.value)}
                    placeholder="50100492814321"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAF9F6] border border-[#E8E6E1] text-[13px] font-bold text-[#171717] focus:outline-none focus:border-[#FF6B2C]"
                  />
                </div>
                <div>
                  <label className="text-[11.5px] font-bold text-[#777570] block mb-1">IFSC Code</label>
                  <input
                    type="text" required value={newIfsc}
                    onChange={(e) => setNewIfsc(e.target.value.toUpperCase())}
                    placeholder="HDFC0001234"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAF9F6] border border-[#E8E6E1] text-[13px] font-bold text-[#171717] focus:outline-none focus:border-[#FF6B2C]"
                  />
                </div>
                <div className="flex items-start gap-2 text-[11px] text-[#777570] bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl p-3">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2FA66A] shrink-0 mt-0.5" />
                  <span>Changes are saved immediately. All future settlements will go to this account.</span>
                </div>
                <button
                  type="submit"
                  className="w-full h-11 mt-2 rounded-xl bg-gradient-to-r from-[#FF6B2C] to-[#FF5410] hover:from-[#e85b1e] hover:to-[#db4a0b] text-white font-extrabold text-[13px] shadow-sm active-press cursor-pointer transition-all"
                >
                  Save Bank Account
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
