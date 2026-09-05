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
    <div className="w-full flex flex-col justify-between select-none">
      {/* Top Header with Back */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateTo('login')}
            className="flex items-center gap-1 text-[13px] font-semibold text-[#777570] hover:text-[#171717] px-2 py-1 -ml-2 rounded-lg hover:bg-[#F3F2EE] transition-colors cursor-pointer"
            aria-label="Back to login"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6B2C] bg-[#FF6B2C]/10 px-2.5 py-0.5 rounded-full border border-[#FF6B2C]/20">
            Step 2 of 2
          </span>
        </div>

        {/* Centered Heading */}
        <div className="text-center mb-6">
          <h1 className="text-[24px] font-bold text-[#171717] tracking-tight">
            Enter 6-digit code
          </h1>
          <div className="flex items-center justify-center gap-1.5 text-[13.5px] text-[#777570] mt-1.5">
            <span>Sent to +91 {ownerPhone || '98765 43210'}</span>
            <span>•</span>
            <button
              onClick={() => navigateTo('login')}
              className="text-[#FF6B2C] font-bold hover:underline cursor-pointer"
            >
              Change
            </button>
          </div>
        </div>

        {/* 6 OTP Input Boxes */}
        <div className="flex justify-center gap-2 sm:gap-2.5 my-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="tel"
              maxLength={1}
              value={digit}
              onFocus={() => setActiveIdx(index)}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-[20px] sm:text-[22px] font-bold rounded-xl bg-[#F9F9F7] border transition-all focus:outline-none ${
                activeIdx === index
                  ? 'border-[#FF6B2C] bg-white ring-4 ring-[#FF6B2C]/15 shadow-sm'
                  : digit
                  ? 'border-[#171717] bg-white text-[#171717]'
                  : 'border-[#E8E6E1] text-[#171717]'
              }`}
            />
          ))}
        </div>

        {/* Resend Timer & Auto-fill */}
        <div className="flex flex-col gap-2.5 pt-1">
          <div className="flex items-center justify-between text-[12.5px] font-medium text-[#777570] px-1">
            {countdown > 0 ? (
              <span>
                Resend code in <span className="font-bold text-[#171717]">00:{countdown < 10 ? `0${countdown}` : countdown}</span>
              </span>
            ) : (
              <button
                onClick={() => setCountdown(30)}
                className="text-[#FF6B2C] font-bold hover:underline cursor-pointer"
              >
                Resend code
              </button>
            )}

            <button
              type="button"
              onClick={handleAutoFill}
              className="text-[12px] text-[#FF6B2C] font-semibold hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Demo code (549210)</span>
            </button>
          </div>

          {/* Verification CTA */}
          <div className="pt-4 space-y-3">
            <button
              id="btn-verify-otp"
              type="button"
              onClick={() => handleVerify()}
              disabled={!isComplete}
              className={`w-full h-12 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-[0.99] ${
                isComplete
                  ? 'bg-[#FF6B2C] text-white shadow-md shadow-[#FF6B2C]/25 hover:bg-[#e85b1e] cursor-pointer'
                  : 'bg-[#E8E6E1] text-[#A3A099] cursor-not-allowed'
              }`}
            >
              <span>Verify & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11.5px] text-center text-[#8E8B85]">
              Didn't receive code? Check spam or click resend code.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
