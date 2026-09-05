import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ArrowRight } from 'lucide-react';

export const OtpScreen: React.FC = () => {
  const { navigateTo, ownerPhone } = useApp();
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState<number>(28);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, '');
    const newOtp = [...otp];
    
    if (cleanVal.length > 1) {
      // Pasted full OTP
      const chars = cleanVal.slice(0, 6).split('');
      chars.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      const nextFocus = Math.min(chars.length, 5);
      inputRefs.current[nextFocus]?.focus();
      setActiveIdx(nextFocus);
      return;
    }

    newOtp[index] = cleanVal;
    setOtp(newOtp);

    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setActiveIdx(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveIdx(index - 1);
    }
  };

  const isComplete = otp.every((digit) => digit.length === 1);

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isComplete) return;
    // Navigate straight to main dashboard
    navigateTo('home');
  };

  const handleAutoFill = () => {
    const demoCode = ['5', '4', '9', '2', '1', '0'];
    setOtp(demoCode);
    setActiveIdx(5);
  };

  return (
    <div className="min-h-screen bg-[#F6F5F2] flex flex-col justify-between p-5 pt-8 pb-safe">
      {/* Top Section with Back */}
      <div className="w-full max-w-sm mx-auto">
        <button
          onClick={() => navigateTo('login')}
          className="w-10 h-10 -ml-2 rounded-xl flex items-center justify-center text-[#171717] hover:bg-[#E8E6E1]/50 active-press transition-colors"
          aria-label="Back to login"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
        </button>

        <div className="mt-6 mb-8">
          <h1 className="text-[28px] font-bold text-[#171717] tracking-tight leading-tight mb-2">
            Enter OTP
          </h1>
          <div className="flex items-center gap-2 text-[15px] text-[#777570]">
            <span>Sent to +91 {ownerPhone || '98765 43210'}</span>
            <button
              onClick={() => navigateTo('login')}
              className="text-[#FF6B2C] font-semibold hover:underline"
            >
              Change
            </button>
          </div>
        </div>

        {/* 6 OTP Inputs */}
        <div className="flex justify-between gap-2.5 my-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="tel"
              maxLength={1}
              value={digit}
              onFocus={() => setActiveIdx(index)}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-12 h-14 text-center text-[22px] font-bold rounded-[12px] bg-[#F7F7F5] border transition-all focus:outline-none ${
                activeIdx === index
                  ? 'border-[#FF6B2C] bg-white ring-2 ring-[#FF6B2C]/20 shadow-sm'
                  : digit
                  ? 'border-[#171717] bg-white text-[#171717]'
                  : 'border-[#E8E6E1] text-[#171717]'
              }`}
            />
          ))}
        </div>

        {/* Countdown / Resend */}
        <div className="flex items-center justify-between text-[13px] font-medium pt-2">
          {countdown > 0 ? (
            <span className="text-[#777570]">
              Resend OTP in <span className="font-bold text-[#171717]">00:{countdown < 10 ? `0${countdown}` : countdown}</span>
            </span>
          ) : (
            <button
              onClick={() => setCountdown(30)}
              className="text-[#FF6B2C] font-bold hover:underline"
            >
              Resend OTP
            </button>
          )}

          <button
            type="button"
            onClick={handleAutoFill}
            className="text-[12px] text-[#4D83C4] font-semibold hover:underline"
          >
            Auto-fill demo (549210)
          </button>
        </div>
      </div>

      {/* Bottom Pinned CTA */}
      <div className="w-full max-w-sm mx-auto pt-6">
        <button
          id="btn-verify-otp"
          type="button"
          onClick={() => handleVerify()}
          disabled={!isComplete}
          className={`w-full h-13 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all active-press ${
            isComplete
              ? 'bg-[#FF6B2C] text-white shadow-md hover:bg-[#e85b1e] cursor-pointer'
              : 'bg-[#E8E6E1] text-[#A3A099] cursor-not-allowed'
          }`}
        >
          <span>Verify & Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
