import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { vendorApi } from '../services/api';

export const OtpScreen: React.FC = () => {
  const { navigateTo, ownerPhone, setVenueDetails, venueName, venueAddress, venueCity } = useApp();
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState<number>(30);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const storedPhone = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('vendor_login_phone')) || ownerPhone || '6369591821';
  const verificationId = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('vendor_otp_verification_id')) || undefined;

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (index: number, val: string) => {
    setErrorMessage('');
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

  const handleResendOtp = async () => {
    if (countdown > 0 || isLoading) return;
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await vendorApi.sendLoginOtp(storedPhone);
      if (res.verification_id) {
        sessionStorage.setItem('vendor_otp_verification_id', res.verification_id);
      }
      setCountdown(30);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isComplete = otp.every((digit) => digit.length === 1);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isComplete || isLoading) return;

    setIsLoading(true);
    setErrorMessage('');

    const otpCode = otp.join('');
    try {
      const res = await vendorApi.verifyOtpAndLogin(storedPhone, otpCode, verificationId);

      if (res.token) {
        localStorage.setItem('vendor_auth_token', res.token);
      }

      if (res.session?.business_details || res.venue_name) {
        setVenueDetails({
          name: res.session?.business_details?.venue_name || res.venue_name || venueName,
          address: res.session?.business_details?.venue_address || venueAddress,
          city: venueCity,
          phone: storedPhone,
        });
      }

      // Navigate straight to main dashboard
      navigateTo('home');
    } catch (err: any) {
      setErrorMessage(err.message || 'Incorrect or expired OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between p-5 pt-8 pb-safe">
      {/* Top Section with Back */}
      <div className="w-full max-w-sm mx-auto">
        <button
          onClick={() => navigateTo('login')}
          className="w-10 h-10 -ml-2 rounded-xl flex items-center justify-center text-[#021526] hover:bg-[#E5E7EB]/50 active-press transition-colors cursor-pointer"
          aria-label="Back to login"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
        </button>

        <div className="mt-6 mb-6">
          <h1 className="text-[28px] font-bold text-[#021526] tracking-tight leading-tight mb-2">
            Enter OTP
          </h1>
          <div className="flex items-center gap-2 text-[15px] text-[#5F6368]">
            <span>Sent to +91 {storedPhone}</span>
            <button
              onClick={() => navigateTo('login')}
              className="text-[#F94001] font-semibold hover:underline cursor-pointer"
            >
              Change
            </button>
          </div>
        </div>

        {/* Error message banner */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

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
              className={`w-12 h-14 text-center text-[22px] font-bold rounded-[12px] bg-[#F3F4F4] border transition-all focus:outline-none ${
                activeIdx === index
                  ? 'border-[#F94001] bg-white ring-2 ring-[#F94001]/20 shadow-sm'
                  : digit
                  ? 'border-[#021526] bg-white text-[#021526]'
                  : 'border-[#E5E7EB] text-[#021526]'
              }`}
            />
          ))}
        </div>

        {/* Countdown / Resend */}
        <div className="flex items-center justify-between text-[13px] font-medium pt-2">
          {countdown > 0 ? (
            <span className="text-[#5F6368]">
              Resend OTP in <span className="font-bold text-[#021526]">00:{countdown < 10 ? `0${countdown}` : countdown}</span>
            </span>
          ) : (
            <button
              onClick={handleResendOtp}
              disabled={isLoading}
              className="text-[#F94001] font-bold hover:underline cursor-pointer"
            >
              Resend OTP
            </button>
          )}
        </div>
      </div>

      {/* Bottom Pinned CTA */}
      <div className="w-full max-w-sm mx-auto pt-6">
        <button
          id="btn-verify-otp"
          type="button"
          onClick={() => handleVerify()}
          disabled={!isComplete || isLoading}
          className={`w-full h-13 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all active-press ${
            isComplete && !isLoading
              ? 'bg-[#F94001] text-white shadow-md hover:bg-[#D93600] cursor-pointer'
              : 'bg-[#E5E7EB] text-[#5F6368] cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Verifying OTP...</span>
            </>
          ) : (
            <>
              <span>Verify & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
