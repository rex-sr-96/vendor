import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { authApi } from '../lib/api';
import { purgeAllVendorSessionStorage } from '../utils/authStorage';

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

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const verifyWithCode = async (codeToVerify?: string) => {
    const enteredOtp = (codeToVerify || otp.join('')).replace(/\D/g, '');
    if (enteredOtp.length < 6 || isVerifying) return;

    setErrorMessage(null);
    setIsVerifying(true);

    const cleanPhone = (ownerPhone || '9876543210').replace(/\D/g, '').slice(-10);

    try {
      const res = await authApi.login(cleanPhone, enteredOtp, verificationId || undefined);
      
      // 1. COMPLETELY PURGE ANY OLD VENDOR DATA / SESSION KEYS BEFORE LOGGING IN
      purgeAllVendorSessionStorage();

      const validToken = res.accessToken || res.token || res.onboarding_token || '';
      if (validToken) {
        localStorage.setItem('ibooksports_vendor_token', validToken);
        localStorage.setItem('ibooksports_token', validToken);
        localStorage.setItem('accessToken', validToken);
        localStorage.setItem('token', validToken);
        sessionStorage.setItem('accessToken', validToken);
        sessionStorage.setItem('ibooksports_vendor_token', validToken);
      }
      localStorage.setItem('ibooksports_partner_mobile', cleanPhone);
      sessionStorage.setItem('ibooksports_partner_mobile', cleanPhone);

      // 2. Fetch authenticated vendor profile directly using token
      let profileData: any = null;
      try {
        profileData = await refreshFromOnboarding(cleanPhone);
      } catch (e) {
        console.warn('Profile refresh fallback:', e);
      }

      const authoritativeOwnerName =
        profileData?.owner?.name ||
        profileData?.partner_details?.name ||
        res.owner_name ||
        'Venue Partner';

      const authoritativeVenueName =
        profileData?.venue?.name ||
        profileData?.business_details?.venue_name ||
        res.venue_name ||
        'Sports Arena';

      const resolvedUser = {
        type: 'owner',
        name: authoritativeOwnerName,
        role: 'Arena Director',
        phone: cleanPhone,
        venueName: authoritativeVenueName,
      };

      setCurrentUser(resolvedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('turftown_current_user', JSON.stringify(resolvedUser));
        sessionStorage.setItem('owner_name', authoritativeOwnerName);
      }

      const welcomeMsg =
        resolvedUser.type === 'staff'
          ? `Logged in as ${resolvedUser.name} (${resolvedUser.role}).`
          : `Logged in to ${resolvedUser.venueName || 'Arena Owner Control Center'} as ${resolvedUser.name}.`;

      showToast('SMS Passcode Verified', welcomeMsg, 'success');
      navigateTo('home');
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid or expired verification code. Please check and try again.');
    } finally {
      setIsVerifying(false);
    }
  };

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
      if (chars.length === 6) {
        verifyWithCode(chars.join(''));
      }
      return;
    }

    newOtp[index] = cleanVal;
    setOtp(newOtp);

    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setActiveIdx(index + 1);
    }

    if (index === 5 && cleanVal) {
      const fullCode = newOtp.join('');
      if (fullCode.length === 6) {
        verifyWithCode(fullCode);
      }
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
    verifyWithCode();
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
            className="flex items-center gap-1 text-[13px] font-semibold text-[#5F6368] hover:text-[#021526] px-2 py-1 -ml-2 rounded-lg hover:bg-[#F3F2EE] transition-colors cursor-pointer"
            aria-label="Back to login"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        {/* Centered Heading */}
        <div className="text-center mb-6">
          <h1 className="text-[24px] font-bold text-[#021526] tracking-tight">
            Enter 6-Digit Passcode
          </h1>
          <div className="flex items-center justify-center gap-1.5 text-[13.5px] text-[#5F6368] mt-1.5">
            <span>Dispatched to +91 {cleanPhone.length === 10 ? `${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}` : '98765 43210'} via MSG91 SMS</span>
            <span>•</span>
            <button
              onClick={() => navigateTo('login')}
              className="text-[#F94001] font-bold hover:underline cursor-pointer"
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
                  ? 'border-[#F94001] bg-white ring-4 ring-[#F94001]/15 shadow-sm'
                  : digit
                  ? 'border-[#021526] bg-white text-[#021526]'
                  : 'border-[#E5E7EB] text-[#021526]'
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
          <div className="flex items-center justify-center text-[13px] font-medium text-[#5F6368] px-1">
            {countdown > 0 ? (
              <span>
                Resend code in <span className="font-bold text-[#021526]">00:{countdown < 10 ? `0${countdown}` : countdown}</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="text-[#F94001] font-bold hover:underline cursor-pointer"
              >
                {isResending ? 'Dispatching SMS via MSG91...' : 'Resend SMS Passcode'}
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
                  ? 'bg-[#F94001] text-white shadow-md shadow-[#F94001]/25 hover:bg-[#D93600] cursor-pointer'
                  : 'bg-[#E5E7EB] text-[#5F6368] cursor-not-allowed'
              }`}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying with MSG91...</span>
                </>
              ) : (
                <>
                  <span>Verify Passcode & Enter Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-[11.5px] text-center text-[#5F6368]">
              Multi-tier vendor access protected by instant MSG91 SMS OTP authentication.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
