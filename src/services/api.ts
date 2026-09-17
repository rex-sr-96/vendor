// iBookSports Vendor Portal API Client
const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  'https://ibooksports-backend.onrender.com/api/v1';

export interface SendOtpResponse {
  success: boolean;
  message: string;
  verification_id?: string;
  otp?: string;
  venue_name?: string;
  expires_in_seconds?: number;
  error?: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  token?: string;
  onboarding_token?: string;
  application_id?: string;
  status?: string;
  venue_name?: string;
  owner_name?: string;
  session?: any;
  error?: string;
}

export const vendorApi = {
  // Step 1: Send MSG91 OTP for vendor login (Validates APPROVED status)
  async sendLoginOtp(mobileNumber: string): Promise<SendOtpResponse> {
    const cleanMobile = mobileNumber.replace(/\D/g, '').slice(-10);
    const response = await fetch(`${API_BASE_URL}/onboarding/auth/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mobile_number: cleanMobile }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to send OTP. Please check your number.');
    }
    return data;
  },

  // Step 2: Verify OTP and Login
  async verifyOtpAndLogin(
    mobileNumber: string,
    otp: string,
    verificationId?: string,
  ): Promise<VerifyOtpResponse> {
    const cleanMobile = mobileNumber.replace(/\D/g, '').slice(-10);
    const response = await fetch(`${API_BASE_URL}/onboarding/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mobile_number: cleanMobile,
        otp,
        verification_id: verificationId,
      }),
    });

    const data = await response.json();
    if (!response.ok || data.success === false) {
      throw new Error(data.message || data.error || 'Invalid OTP. Please try again.');
    }
    return data;
  },

  // Submit Court Creation Request (Syncs with Supabase)
  async submitCourtRequest(payload: {
    vendor_id?: string;
    venue_id?: string;
    court_data: any;
    reason?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/court-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to submit court request.');
    }
    return data;
  },
};
