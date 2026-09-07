import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, ArrowRight, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { authApi } from '../lib/api';

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
  const {
    navigateTo,
    ownerPhone,
    ownerName,
    setVenueDetails,
    venueName,
    venueAddress,
    venueCity,
    setVerificationId,
    checkPhoneAccess,
    showToast,
  } = useApp();
  const [phoneNumber, setPhoneNumber] = useState(() => extract10DigitPhone(ownerPhone || ''));
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const cleanPhone = extract10DigitPhone(phoneNumber);
  const isValidPhone = cleanPhone.length === 10;

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPhone || isLoading) return;

    setErrorMessage(null);
    setIsLoading(true);

    // 1. Verify that the mobile number belongs to an Owner or Authorized Staff Member
    const access = checkPhoneAccess(cleanPhone);
    if (!access.allowed) {
      setErrorMessage(
        access.reason ||
          'Access restricted. This mobile number is not registered as an arena owner or authorized staff member. Please contact your venue administrator.'
      );
      setIsLoading(false);
      return;
    }

    try {
      const res = await authApi.sendLoginOtp(cleanPhone);
      setVerificationId(res.verification_id || res.reqId || null);

      // Store pending user authentication info for OtpScreen
      if (typeof window !== 'undefined') {
        const pendingUser =
          access.userType === 'staff' && access.staff
            ? {
                type: 'staff',
                id: access.staff.id,
                name: access.staff.name,
                role: access.staff.role,
                phone: cleanPhone,
                email: access.staff.email,
                permissions: access.staff.permissions,
              }
            : {
                type: 'owner',
                name: ownerName || 'Karthik Rajan',
                role: 'Arena Director',
                phone: cleanPhone,
              };
        sessionStorage.setItem('turftown_pending_user', JSON.stringify(pendingUser));
      }

      setVenueDetails({
        name: venueName,
        address: venueAddress,
        city: venueCity,
        phone: cleanPhone,
        ownerPhone: cleanPhone,
      });

      const roleBadge = access.userType === 'staff' ? ` (${access.staff?.role})` : ' (Owner)';
      showToast('OTP Dispatched', `6-digit verification code sent to +91 ${cleanPhone}${roleBadge} via MSG91 SMS.`, 'success');
      navigateTo('otp');
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to dispatch verification code via MSG91. Please verify your mobile number.');
    } finally {
      setIsLoading(false);
    }
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
                maxLength={15}
                placeholder="98765 43210"
                value={phoneNumber}
                onChange={(e) => {
                  const cleaned = extract10DigitPhone(e.target.value);
                  setPhoneNumber(cleaned);
                  if (errorMessage) setErrorMessage(null);
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  const pasted = e.clipboardData.getData('text');
                  const cleaned = extract10DigitPhone(pasted);
                  setPhoneNumber(cleaned);
                  if (errorMessage) setErrorMessage(null);
                }}
                className="w-full px-4 py-3.5 text-[16px] font-semibold text-[#171717] bg-transparent placeholder-[#A3A099] focus:outline-none tracking-wide"
                autoFocus
              />
            </div>
            <p className="text-[12px] text-[#777570] mt-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2FA66A] shrink-0" />
              <span>We'll send a 6-digit one-time code to verify your number.</span>
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[12px] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2 space-y-3">
            <button
              id="btn-login-continue"
              type="submit"
              disabled={!isValidPhone || isLoading}
              className={`w-full h-12 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-[0.99] ${
                isValidPhone && !isLoading
                  ? 'bg-[#FF6B2C] text-white shadow-md shadow-[#FF6B2C]/25 hover:bg-[#e85b1e] cursor-pointer'
                  : 'bg-[#E8E6E1] text-[#A3A099] cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Code via MSG91...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
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
