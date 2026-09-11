import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, ArrowRight } from 'lucide-react';

// Helper to extract clean 10-digit Indian phone number
const extract10DigitPhone = (raw: string): string => {
  if (!raw) return '';
  let cleaned = raw.trim();
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.slice(3);
  } else if (cleaned.startsWith('+')) {
    cleaned = cleaned.slice(1);
  }
  let digits = cleaned.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  } else if (digits.length > 10 && digits.startsWith('91')) {
    digits = digits.slice(2);
  }
  return digits.slice(0, 10);
};

export const LoginScreen: React.FC = () => {
  const { navigateTo, ownerPhone, setVenueDetails, venueName, venueAddress, venueCity } = useApp();
  const [phoneNumber, setPhoneNumber] = useState(() => extract10DigitPhone(ownerPhone || '9876543210'));

  const cleanPhone = extract10DigitPhone(phoneNumber);
  const isValidPhone = cleanPhone.length === 10;

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPhone) return;
    setVenueDetails({
      name: venueName,
      address: venueAddress,
      city: venueCity,
      phone: cleanPhone,
    });
    navigateTo('otp');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between p-5 pt-12 pb-safe">
      {/* Top Brand Area */}
      <div className="w-full max-w-sm mx-auto">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-[#F94001] flex items-center justify-center shadow-sm">
            <span className="text-white font-extrabold text-xl tracking-tighter">TT</span>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#F94001]">TurfTown</span>
            <p className="text-[13px] font-semibold text-[#021526] leading-none">Owner Control Center</p>
          </div>
        </div>

        {/* Headings */}
        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-[#021526] tracking-tight leading-tight mb-2">
            Welcome back
          </h1>
          <p className="text-[15px] text-[#5F6368] font-normal leading-relaxed">
            Manage your venue operations, court slots, and payments on the go.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleContinue} className="space-y-4">
          <div>
            <label htmlFor="mobile-input" className="block text-[13px] font-semibold text-[#021526] mb-2">
              Mobile Number
            </label>
            <div className="relative flex items-center bg-[#F3F4F4] border border-[#E5E7EB] rounded-[14px] focus-within:border-[#F94001] focus-within:bg-white transition-all overflow-hidden">
              <div className="flex items-center gap-1.5 px-3.5 py-3.5 border-r border-[#E5E7EB] bg-[#F3F4F4]/50 select-none">
                <span className="text-base">🇮🇳</span>
                <span className="text-[15px] font-bold text-[#021526]">+91</span>
              </div>
              <input
                id="mobile-input"
                type="tel"
                maxLength={15}
                placeholder="98765 43210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(extract10DigitPhone(e.target.value))}
                onPaste={(e) => {
                  e.preventDefault();
                  const pasted = e.clipboardData.getData('text');
                  setPhoneNumber(extract10DigitPhone(pasted));
                }}
                className="w-full px-4 py-3.5 text-[16px] font-semibold text-[#021526] bg-transparent placeholder-[#5F6368] focus:outline-none tracking-wide"
              />
            </div>
            <p className="text-[12px] text-[#5F6368] mt-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
              We'll send a 6-digit one-time code to verify your number.
            </p>
          </div>
        </form>
      </div>

      {/* Bottom Pinned CTA */}
      <div className="w-full max-w-sm mx-auto space-y-3 pt-6">
        <button
          id="btn-login-continue"
          type="button"
          onClick={handleContinue}
          disabled={!isValidPhone}
          className={`w-full h-13 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all active-press ${
            isValidPhone
              ? 'bg-[#F94001] text-white shadow-md hover:bg-[#D93600] cursor-pointer'
              : 'bg-[#E5E7EB] text-[#5F6368] cursor-not-allowed'
          }`}
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-[11px] text-center text-[#5F6368] leading-normal px-2">
          By continuing, you agree to our{' '}
          <span className="underline hover:text-[#021526] cursor-pointer">Terms of Service</span> &{' '}
          <span className="underline hover:text-[#021526] cursor-pointer">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};
