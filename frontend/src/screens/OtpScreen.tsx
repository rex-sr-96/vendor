import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { authApi } from '../lib/api';

export const OtpScreen: React.FC = () => {
  const {
    navigateTo,
    ownerPhone,
    ownerName,
    verificationId,
    setVerificationId,
    refreshFromOnboarding,
    showToast,
    setCurrentUser,
    checkPhoneAccess,
  } = useApp();
  const cleanPhone = (ownerPhone || '9876543210').replace(/\D/g, '').slice(-10);
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState<number>(60);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
    if (errorMessage) setErrorMessage(null);
    
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

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isComplete || isVerifying) return;

    setErrorMessage(null);
    setIsVerifying(true);

    const enteredOtp = otp.join('');
    const cleanPhone = (ownerPhone || '9876543210').replace(/\D/g, '').slice(-10);

    try {
      const res = await authApi.login(cleanPhone, enteredOtp, verificationId || undefined);
      if (res.onboarding_token) {
        localStorage.setItem('ibooksports_vendor_token', res.onboarding_token);
        localStorage.setItem('ibooksports_onboarding_token', res.onboarding_token);
      }
      localStorage.setItem('ibooksports_partner_mobile', cleanPhone);

      // Determine user identity (staff member or owner)
      let resolvedUser: any = null;
      if (typeof window !== 'undefined') {
        try {
          const pendingStr = sessionStorage.getItem('turftown_pending_user');
          if (pendingStr) {
            resolvedUser = JSON.parse(pendingStr);
            sessionStorage.removeItem('turftown_pending_user');
          }
        } catch (e) {
          console.warn('Could not parse pending user', e);
        }
      }

      if (!resolvedUser) {
        const access = checkPhoneAccess(cleanPhone);
        if (access.userType === 'staff' && access.staff) {
          resolvedUser = {
            type: 'staff',
            id: access.staff.id,
            name: access.staff.name,
            role: access.staff.role,
            phone: cleanPhone,
            email: access.staff.email,
            permissions: access.staff.permissions,
          };
        } else {
          resolvedUser = {
            type: 'owner',
            name: ownerName || 'Karthik Rajan',
            role: 'Arena Director',
            phone: cleanPhone,
          };
        }
      }

      setCurrentUser(resolvedUser);

      // Refresh vendor profile from backend
      try {
        await refreshFromOnboarding(cleanPhone);
      } catch (e) {
        console.warn('Profile refresh fallback:', e);
      }

      const welcomeMsg =
        resolvedUser.type === 'staff'
          ? `Logged in as ${resolvedUser.name} (${resolvedUser.role}).`
          : `Logged in to arena owner control center.`;

      showToast('Authentication Successful', welcomeMsg, 'success');
      navigateTo('home');
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid or expired verification code. Please check and try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    setErrorMessage(null);
    const cleanPhone = (ownerPhone || '9876543210').replace(/\D/g, '').slice(-10);

    try {
      const res = await authApi.sendLoginOtp(cleanPhone);
      if (res.verification_id || res.reqId) {
        setVerificationId(res.verification_id || res.reqId || null);
      }
      setCountdown(60);
      showToast('OTP Resent', `A fresh 6-digit passcode was sent to +91 ${cleanPhone} via MSG91 SMS.`, 'success');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend code via MSG91. Please try again.');
    } finally {
      setIsResending(false);
    }
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
        </div>

        {/* Centered Heading */}
        <div className="text-center mb-6">
          <h1 className="text-[24px] font-bold text-[#171717] tracking-tight">
            Enter 6-digit code
          </h1>
          <div className="flex items-center justify-center gap-1.5 text-[13.5px] text-[#777570] mt-1.5">
            <span>Sent to +91 {cleanPhone.length === 10 ? `${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}` : '98765 43210'} via SMS</span>
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

        {/* Error Message Alert */}
        {errorMessage && (
          <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[12px] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Resend Timer */}
        <div className="flex flex-col gap-2.5 pt-1">
          <div className="flex items-center justify-center text-[13px] font-medium text-[#777570] px-1">
            {countdown > 0 ? (
              <span>
                Resend code in <span className="font-bold text-[#171717]">00:{countdown < 10 ? `0${countdown}` : countdown}</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="text-[#FF6B2C] font-bold hover:underline cursor-pointer"
              >
                {isResending ? 'Sending...' : 'Resend code'}
              </button>
            )}
          </div>

          {/* Verification CTA */}
          <div className="pt-4 space-y-3">
            <button
              id="btn-verify-otp"
              type="button"
              onClick={() => handleVerify()}
              disabled={!isComplete || isVerifying}
              className={`w-full h-12 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-[0.99] ${
                isComplete && !isVerifying
                  ? 'bg-[#FF6B2C] text-white shadow-md shadow-[#FF6B2C]/25 hover:bg-[#e85b1e] cursor-pointer'
                  : 'bg-[#E8E6E1] text-[#A3A099] cursor-not-allowed'
              }`}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying with MSG91...</span>
                </>
              ) : (
                <>
                  <span>Verify & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-[11.5px] text-center text-[#8E8B85]">
              Didn't receive code? Check SMS or click resend code.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
