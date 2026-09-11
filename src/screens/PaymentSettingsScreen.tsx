import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ChevronLeft,
  Building2,
  CheckCircle2,
  QrCode,
  CreditCard,
  Banknote,
  ArrowRight,
  X,
} from 'lucide-react';

export const PaymentSettingsScreen: React.FC = () => {
  const { paymentSettings, updatePaymentSettings, goBack, showToast } = useApp();
  const [showBankModal, setShowBankModal] = useState(false);
  const [newBankName, setNewBankName] = useState(paymentSettings.bankName);
  const [newAccNum, setNewAccNum] = useState('50100492814321');
  const [newIfsc, setNewIfsc] = useState(paymentSettings.ifscCode);

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    updatePaymentSettings({
      bankName: newBankName,
      accountNumberMasked: `•••• ${newAccNum.slice(-4)}`,
      ifscCode: newIfsc,
      isVerified: true,
    });
    setShowBankModal(false);
    showToast('Bank Account Updated', 'New payout account verified successfully.', 'success');
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-md mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2 pt-2">
        <button
          onClick={goBack}
          className="w-10 h-10 -ml-2 rounded-xl flex items-center justify-center text-[#021526] hover:bg-[#E5E7EB]/50 active-press"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
        </button>
        <h1 className="text-[22px] font-bold text-[#021526]">Payment Settings</h1>
      </div>

      {/* Settlement Bank Account Card */}
      <div className="bg-[#021526] text-white rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6368]">
                Settlement Bank Account
              </span>
              <h3 className="text-[17px] font-bold">
                {paymentSettings.bankName} {paymentSettings.accountNumberMasked}
              </h3>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/30 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified
          </span>
        </div>

        <div className="text-[12px] text-[#5F6368] flex justify-between pt-1 border-t border-white/10">
          <span>IFSC: {paymentSettings.ifscCode}</span>
          <button
            onClick={() => setShowBankModal(true)}
            className="text-[#F94001] font-bold hover:underline"
          >
            Change Bank Account
          </button>
        </div>
      </div>

      {/* Payment Modes Toggles */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs divide-y divide-[#F3F4F4] overflow-hidden">
        {/* Online Payment */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center">
              <CreditCard className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-[#021526]">Online Payments (UPI/Cards)</h3>
              <p className="text-[12px] text-[#5F6368]">Collect via links and dynamic QR</p>
            </div>
          </div>

          <button
            onClick={() =>
              updatePaymentSettings({ onlinePayment: !paymentSettings.onlinePayment })
            }
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              paymentSettings.onlinePayment ? 'bg-[#F94001]' : 'bg-[#E5E7EB]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                paymentSettings.onlinePayment ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Cash Payment */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#021526]/10 text-[#021526] flex items-center justify-center">
              <Banknote className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-[#021526]">Cash Payment at Venue</h3>
              <p className="text-[12px] text-[#5F6368]">Allow on-site physical cash collection</p>
            </div>
          </div>

          <button
            onClick={() =>
              updatePaymentSettings({ cashPayment: !paymentSettings.cashPayment })
            }
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              paymentSettings.cashPayment ? 'bg-[#F94001]' : 'bg-[#E5E7EB]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                paymentSettings.cashPayment ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Bank Account Modal Sheet */}
      {showBankModal && (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs">
          <div className="w-full bg-white rounded-t-[32px] p-5 pb-8 shadow-2xl border-t border-[#E5E7EB] space-y-4 animate-in slide-in-from-bottom-6 duration-200">
            {/* iOS Grab Handle */}
            <div className="w-10 h-1 bg-[#E5E7EB] rounded-full mx-auto mb-1" />

            <div className="flex items-center justify-between pb-2 border-b border-[#F3F4F4]">
              <div>
                <h2 className="text-[17px] font-extrabold text-[#021526] tracking-tight">Update Bank Account</h2>
                <p className="text-[11.5px] text-[#5F6368]">Direct verified settlement payout account</p>
              </div>
              <button
                type="button"
                onClick={() => setShowBankModal(false)}
                className="w-8 h-8 rounded-full bg-[#F3F4F4] flex items-center justify-center text-[#5F6368] hover:text-[#021526] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBank} className="space-y-3">
              <div>
                <label className="block text-[11.5px] font-bold text-[#021526] mb-1">Bank Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Bank"
                  value={newBankName}
                  onChange={(e) => setNewBankName(e.target.value)}
                  className="w-full bg-[#F3F4F4] border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-[13.5px] font-bold text-[#021526] focus:outline-none focus:border-[#F94001]"
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-bold text-[#021526] mb-1">Account Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 50100492819283"
                  value={newAccNum}
                  onChange={(e) => setNewAccNum(e.target.value)}
                  className="w-full bg-[#F3F4F4] border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-[13.5px] font-bold font-mono text-[#021526] focus:outline-none focus:border-[#F94001]"
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-bold text-[#021526] mb-1">IFSC Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC0001234"
                  value={newIfsc}
                  onChange={(e) => setNewIfsc(e.target.value)}
                  className="w-full bg-[#F3F4F4] border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-[13.5px] font-bold font-mono uppercase text-[#021526] focus:outline-none focus:border-[#F94001]"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  className="flex-1 h-11 bg-[#F3F4F4] text-[#021526] font-bold rounded-xl active-press text-[13px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 bg-[#F94001] text-white font-bold rounded-xl active-press shadow-xs text-[13px] hover:bg-[#D93600] cursor-pointer"
                >
                  Verify & Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
