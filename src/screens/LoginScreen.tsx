import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { navigateTo, ownerPhone, setVenueDetails, venueName, venueAddress, venueCity } = useApp();
  const [phoneNumber, setPhoneNumber] = useState(ownerPhone || '9876543210');

  const isValidPhone = phoneNumber.replace(/\D/g, '').length === 10;

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPhone) return;
    setVenueDetails({
      name: venueName,
      address: venueAddress,
      city: venueCity,
      phone: phoneNumber,
    });
    navigateTo('otp');
  };

  return (
    <div className="min-h-screen bg-[#F6F5F2] flex flex-col justify-between p-5 pt-12 pb-safe">
      {/* Top Brand Area */}
      <div className="w-full max-w-sm mx-auto">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-[#FF6B2C] flex items-center justify-center shadow-sm">
            <span className="text-white font-extrabold text-xl tracking-tighter">TT</span>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B2C]">TurfTown</span>
            <p className="text-[13px] font-semibold text-[#171717] leading-none">Owner Control Center</p>
          </div>
        </div>

        {/* Headings */}
        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-[#171717] tracking-tight leading-tight mb-2">
            Welcome back
          </h1>
          <p className="text-[15px] text-[#777570] font-normal leading-relaxed">
            Manage your venue operations, court slots, and payments on the go.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleContinue} className="space-y-4">
          <div>
            <label htmlFor="mobile-input" className="block text-[13px] font-semibold text-[#171717] mb-2">
              Mobile Number
            </label>
            <div className="relative flex items-center bg-[#F7F7F5] border border-[#E8E6E1] rounded-[14px] focus-within:border-[#FF6B2C] focus-within:bg-white transition-all overflow-hidden">
              <div className="flex items-center gap-1.5 px-3.5 py-3.5 border-r border-[#E8E6E1] bg-[#F1F0EC]/50 select-none">
                <span className="text-base">🇮🇳</span>
                <span className="text-[15px] font-bold text-[#171717]">+91</span>
              </div>
              <input
                id="mobile-input"
                type="tel"
                maxLength={10}
                placeholder="98765 43210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3.5 text-[16px] font-semibold text-[#171717] bg-transparent placeholder-[#A3A099] focus:outline-none tracking-wide"
              />
            </div>
            <p className="text-[12px] text-[#777570] mt-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2FA66A]" />
              We'll send a 6-digit one-time code to verify your number.
            </p>
          </div>

          {/* Quick Demo Pre-fill */}
          <button
            type="button"
            onClick={() => setPhoneNumber('9876543210')}
            className="text-[12px] font-semibold text-[#FF6B2C] hover:underline"
          >
            Demo auto-fill: +91 98765 43210
          </button>
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
              ? 'bg-[#FF6B2C] text-white shadow-md hover:bg-[#e85b1e] cursor-pointer'
              : 'bg-[#E8E6E1] text-[#A3A099] cursor-not-allowed'
          }`}
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-[11px] text-center text-[#777570] leading-normal px-2">
          By continuing, you agree to our{' '}
          <span className="underline hover:text-[#171717] cursor-pointer">Terms of Service</span> &{' '}
          <span className="underline hover:text-[#171717] cursor-pointer">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};
