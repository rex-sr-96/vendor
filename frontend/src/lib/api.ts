/**
 * API Client Helper for TurfTown NestJS Backend
 * 
 * This module provides typed fetch functions for interacting with the
 * NestJS backend API. Currently the frontend still uses client-side
 * context state (AppContext), but this is ready for future API integration.
 */

const API_BASE = '/api';

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
