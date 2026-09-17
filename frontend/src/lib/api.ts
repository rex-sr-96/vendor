/**
 * API Client Helper for TurfTown NestJS Backend
 * 
 * This module provides typed fetch functions for interacting with the
 * NestJS backend API. Currently the frontend still uses client-side
 * context state (AppContext), but this is ready for future API integration.
 */

const API_BASE = '/api';
async function fetchMasterApi(endpoint: string, options?: RequestInit): Promise<Response> {
  const envUrl = typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_API_URL : undefined;
  const urls = [
    envUrl ? `${envUrl}${endpoint}` : '',
    `http://localhost:4000/api/v1${endpoint}`,
    `http://127.0.0.1:4000/api/v1${endpoint}`,
    `https://ibooksports-backend.onrender.com/api/v1${endpoint}`,
  ].filter(Boolean);

  let lastResponse: Response | null = null;
  let lastError: any = null;

  for (const url of urls) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
      lastResponse = res;
    } catch (err) {
      lastError = err;
    }
  }

  if (lastResponse) return lastResponse;
  throw lastError || new Error('Failed to connect to backend service. Please check your network connection.');
}

export const authApi = {
  sendLoginOtp: async (mobile_number: string) => {
    const cleanNumber = mobile_number.replace(/\D/g, '').slice(-10);
    const response = await fetchMasterApi('/onboarding/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile_number: cleanNumber }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || data?.success === false) {
      throw new Error(
        data?.message ||
        `SMS dispatch failed with status ${response.status}. Please check your connection or retry.`
      );
    }
    return data as {
      success: boolean;
      message: string;
      verification_id: string;
      reqId?: string;
      expires_in_seconds?: number;
    };
  },

  login: async (mobile_number: string, otp: string, verification_id?: string) => {
    const cleanNumber = mobile_number.replace(/\D/g, '').slice(-10);
    const cleanOtp = otp.replace(/\D/g, '');
    const response = await fetchMasterApi('/onboarding/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mobile_number: cleanNumber,
        otp: cleanOtp,
        verification_id,
      }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || data?.success === false) {
      throw new Error(data?.message || 'Invalid or expired verification code. Please check and try again.');
    }
    return data as {
      success: boolean;
      message: string;
      onboarding_token: string;
      application_id: string;
      current_step: number;
      session?: any;
    };
  },
};

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

// Bookings
export const api = {
  bookings: {
    getAll: () => fetchJSON('/bookings'),
    getOne: (id: string) => fetchJSON(`/bookings/${id}`),
    create: (data: any) => fetchJSON('/bookings', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchJSON(`/bookings/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },
  courts: {
    getAll: () => fetchJSON('/courts'),
    create: (data: any) => fetchJSON('/courts', { method: 'POST', body: JSON.stringify(data) }),
  },
  slots: {
    getAll: () => fetchJSON('/slots'),
    block: (data: any) => fetchJSON('/slots/block', { method: 'POST', body: JSON.stringify(data) }),
    unblock: (id: string) => fetchJSON(`/slots/${id}/unblock`, { method: 'PATCH' }),
  },
  payments: {
    getAll: () => fetchJSON('/payments'),
    recordCash: (data: any) => fetchJSON('/payments/record-cash', { method: 'POST', body: JSON.stringify(data) }),
    sendLink: (bookingId: string) => fetchJSON('/payments/send-link', { method: 'POST', body: JSON.stringify({ bookingId }) }),
  },
  settlements: {
    getAll: () => fetchJSON('/settlements'),
    requestInstant: (amount?: number) => fetchJSON('/settlements/instant', { method: 'POST', body: JSON.stringify({ amount }) }),
  },
  settings: {
    getBooking: () => fetchJSON('/settings/booking'),
    updateBooking: (data: any) => fetchJSON('/settings/booking', { method: 'PATCH', body: JSON.stringify(data) }),
    getPayment: () => fetchJSON('/settings/payment'),
    updatePayment: (data: any) => fetchJSON('/settings/payment', { method: 'PATCH', body: JSON.stringify(data) }),
    getOperatingHours: () => fetchJSON('/settings/operating-hours'),
    toggleOperatingDay: (day: string) => fetchJSON(`/settings/operating-hours/${day}`, { method: 'PATCH' }),
    getAmenities: () => fetchJSON('/settings/amenities'),
    toggleAmenity: (id: string) => fetchJSON(`/settings/amenities/${id}`, { method: 'PATCH' }),
    getCancellation: () => fetchJSON('/settings/cancellation'),
    updateCancellation: (data: any) => fetchJSON('/settings/cancellation', { method: 'PATCH', body: JSON.stringify(data) }),
  },
  staff: {
    getAll: () => fetchJSON('/staff'),
    create: (data: any) => fetchJSON('/staff', { method: 'POST', body: JSON.stringify(data) }),
    toggleStatus: (id: string) => fetchJSON(`/staff/${id}/toggle-status`, { method: 'PATCH' }),
    updatePermissions: (id: string, permKey: string) => fetchJSON(`/staff/${id}/permissions`, { method: 'PATCH', body: JSON.stringify({ permKey }) }),
  },
  notifications: {
    getAll: () => fetchJSON('/notifications'),
    markAsRead: (id: string) => fetchJSON(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllAsRead: () => fetchJSON('/notifications/read-all', { method: 'POST' }),
    delete: (id: string) => fetchJSON(`/notifications/${id}`, { method: 'DELETE' }),
    getPreferences: () => fetchJSON('/notifications/preferences'),
    updatePreferences: (data: any) => fetchJSON('/notifications/preferences', { method: 'PATCH', body: JSON.stringify(data) }),
  },
  support: {
    getAll: () => fetchJSON('/support/tickets'),
    create: (data: any) => fetchJSON('/support/tickets', { method: 'POST', body: JSON.stringify(data) }),
  },
};

export interface BankDetailsPayload {
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  account_type: string;
  branch_name?: string;
  cancelled_cheque_url?: string;
  reason_for_change: string;
}

export interface CourtDetailsPayload {
  court_name: string;
  sport_type: string;
  surface_type: string;
  hourly_rate: number;
  court_dimensions?: string;
  lighting_available?: boolean;
  indoor_outdoor?: 'INDOOR' | 'OUTDOOR';
  remarks?: string;
}

export interface CreateVendorRequestPayload {
  request_type: 'BANK_CHANGE' | 'COURT_CHANGE';
  venue_name: string;
  vendor_name: string;
  vendor_email: string;
  vendor_phone: string;
  bank_details?: BankDetailsPayload;
  court_details?: CourtDetailsPayload;
}

export interface VendorRequestItem {
  request_id: string;
  request_type: 'BANK_CHANGE' | 'COURT_CHANGE';
  venue_name: string;
  vendor_name: string;
  vendor_email: string;
  vendor_phone: string;
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  rejection_note?: string;
  bank_details?: BankDetailsPayload;
  court_details?: CourtDetailsPayload;
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export const vendorRequestsApi = {
  getRequests: async (phone: string): Promise<VendorRequestItem[]> => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const res = await fetchMasterApi(`/requests/vendor/${cleanPhone}`);
    if (!res.ok) {
      throw new Error('Failed to load support requests');
    }
    const data = await res.json();
    const list: any[] = Array.isArray(data) ? data : data.requests || [];
    return list.map((item) => ({
      request_id: item.request_id,
      request_type: item.request_type,
      venue_name: item.venue_name,
      vendor_name: item.vendor_name || item.requester_name,
      vendor_email: item.vendor_email || item.requester_email,
      vendor_phone: item.vendor_phone || item.mobile_number,
      status: item.status || item.request_status,
      rejection_note: item.rejection_note,
      bank_details: item.bank_details ? {
        bank_name: item.bank_details.bank_name,
        account_holder_name: item.bank_details.account_holder_name,
        account_number: item.bank_details.account_number,
        ifsc_code: item.bank_details.ifsc_code,
        account_type: item.bank_details.account_type,
        branch_name: item.bank_details.branch_name,
        reason_for_change: item.bank_details.reason_for_change || 'Bank details compliance update',
      } : undefined,
      court_details: item.court_details ? {
        court_name: item.court_details.court_name,
        sport_type: item.court_details.sport_type || item.court_details.sport,
        surface_type: item.court_details.surface_type,
        hourly_rate: item.court_details.hourly_rate,
        court_dimensions: item.court_details.court_dimensions || item.court_details.dimensions,
        lighting_available: item.court_details.lighting_available !== false,
        indoor_outdoor: item.court_details.indoor_outdoor || 'OUTDOOR',
        remarks: item.court_details.remarks,
      } : undefined,
      submitted_at: item.submitted_at || item.created_at || new Date().toISOString(),
      reviewed_at: item.reviewed_at || item.status_updated_at,
      reviewed_by: item.reviewed_by || item.rejected_by_admin_id,
    }));
  },

  createRequest: async (payload: CreateVendorRequestPayload): Promise<{ success: boolean; request_id: string; message: string }> => {
    const res = await fetchMasterApi('/requests/vendor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to submit request');
    }
    return data;
  },
};

