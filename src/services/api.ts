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

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return (
    localStorage.getItem('userToken') ||
    localStorage.getItem('token') ||
    localStorage.getItem('turftown_token') ||
    localStorage.getItem('ibooksports_vendor_token') ||
    localStorage.getItem('ibooksports_token') ||
    null
  );
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
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
    if (data.token && typeof window !== 'undefined') {
      localStorage.setItem('userToken', data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('turftown_token', data.token);
    }
    return data;
  },

  // Common Authenticated Vendor Endpoints (Dynamic via JWT)
  async getMyCourts() {
    const response = await fetch(`${API_BASE_URL}/courts`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch courts.');
    return response.json();
  },

  async getMySlots() {
    const response = await fetch(`${API_BASE_URL}/slots`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch slots.');
    return response.json();
  },

  async getMyBookings() {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch bookings.');
    return response.json();
  },

  async getMyStaff() {
    const response = await fetch(`${API_BASE_URL}/vendor-staff`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch staff.');
    return response.json();
  },

  async getMyProfile() {
    const response = await fetch(`${API_BASE_URL}/onboarding/vendor/profile`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch vendor profile.');
    return response.json();
  },

  // Submit Court Creation Request (Syncs with Supabase)
  async submitCourtRequest(payload: {
    court_data: any;
    reason?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/court-requests`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to submit court request.');
    }
    return data;
  },
};

