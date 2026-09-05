import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

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
    <div className="w-full flex flex-col justify-between select-none">
      {/* Brand Header */}
      <div className="w-full">
        <div className="flex flex-col items-center text-center mb-7">
          {/* TurfTown Brand Emblem */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF6B2C] to-[#E8591A] flex items-center justify-center shadow-lg shadow-[#FF6B2C]/25 mb-4">
            <span className="text-white font-black text-xl tracking-tighter">TT</span>
          </div>

          {/* Owner Center Tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6B2C]/10 border border-[#FF6B2C]/20 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B2C]" />
            <span className="text-[11px] font-bold text-[#FF6B2C] uppercase tracking-wider">Owner Control Center</span>
          </div>

          <h1 className="text-[25px] font-bold text-[#171717] tracking-tight">
            Welcome back
          </h1>
          <p className="text-[13.5px] text-[#777570] mt-1.5 leading-normal max-w-[300px]">
            Sign in with your registered mobile number to manage court bookings & venue operations.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleContinue} className="space-y-4">
          <div>
            <label htmlFor="mobile-input" className="block text-[13px] font-semibold text-[#171717] mb-2">
              Mobile Number
            </label>
            <div className="relative flex items-center bg-[#F9F9F7] border border-[#E8E6E1] rounded-2xl focus-within:border-[#FF6B2C] focus-within:ring-4 focus-within:ring-[#FF6B2C]/10 focus-within:bg-white transition-all overflow-hidden">
              <div className="flex items-center gap-1.5 px-3.5 py-3.5 border-r border-[#E8E6E1] bg-[#F2F1ED]/50 select-none">
                <span className="text-base">🇮🇳</span>
                <span className="text-[14px] font-bold text-[#171717]">+91</span>
              </div>
              <input
                id="mobile-input"
                type="tel"
                maxLength={10}
                placeholder="98765 43210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3.5 text-[16px] font-semibold text-[#171717] bg-transparent placeholder-[#A3A099] focus:outline-none tracking-wide"
                autoFocus
              />
            </div>
            <p className="text-[12px] text-[#777570] mt-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2FA66A] shrink-0" />
              <span>We'll send a 6-digit one-time code to verify your number.</span>
            </p>
          </div>

          {/* Quick Demo Pre-fill Button */}
          <button
            type="button"
            onClick={() => setPhoneNumber('9876543210')}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#FFF6F0] border border-[#FF6B2C]/25 text-[#FF6B2C] hover:bg-[#FFEDE0] transition-colors text-[12px] font-semibold cursor-pointer group"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FF6B2C]" />
              <span>Demo Quick Sign-In</span>
            </span>
            <span className="font-mono font-bold text-[11.5px] bg-white text-[#FF6B2C] px-2 py-0.5 rounded-md border border-[#FF6B2C]/20 shadow-xs">
              +91 98765 43210
            </span>
          </button>

          {/* Submit Action */}
          <div className="pt-2 space-y-3">
            <button
              id="btn-login-continue"
              type="submit"
              disabled={!isValidPhone}
              className={`w-full h-12 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-[0.99] ${
                isValidPhone
                  ? 'bg-[#FF6B2C] text-white shadow-md shadow-[#FF6B2C]/25 hover:bg-[#e85b1e] cursor-pointer'
                  : 'bg-[#E8E6E1] text-[#A3A099] cursor-not-allowed'
              }`}
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11.5px] text-center text-[#8E8B85] leading-normal px-2">
              By continuing, you agree to our{' '}
              <span className="underline hover:text-[#171717] cursor-pointer">Terms of Service</span> &{' '}
              <span className="underline hover:text-[#171717] cursor-pointer">Privacy Policy</span>.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
