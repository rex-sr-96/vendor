import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Plus,
  HelpCircle,
  MessageSquare,
  CheckCircle2,
  Clock,
  ChevronRight,
  Phone,
  FileText,
  ChevronDown,
  X,
  LifeBuoy,
  Sparkles,
  ChevronLeft,
  Building2,
  Trophy,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Layers,
  ArrowRight,
  DollarSign,
  Send,
  AlertTriangle,
} from 'lucide-react';
import { SupportTicket, SupportCategory } from '../types';
import { haptics } from '../utils/haptics';
import { motion, AnimatePresence } from 'motion/react';
import {
  vendorRequestsApi,
  VendorRequestItem,
  CreateVendorRequestPayload,
} from '../lib/api';

export const HelpSupportScreen: React.FC = () => {
  const {
    supportTickets,
    addSupportTicket,
    goBack,
    showToast,
    venueName,
    ownerName,
    ownerPhone,
    ownerEmail,
    bankDetails,
  } = useApp();

  // Active Main View Tab
  const [activeTab, setActiveTab] = useState<'requests' | 'general_tickets' | 'faqs'>('requests');
  const [filterType, setFilterType] = useState<'ALL' | 'BANK_CHANGE' | 'COURT_CHANGE'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Backend Vendor Requests State
  const [vendorRequests, setVendorRequests] = useState<VendorRequestItem[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals State
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isCourtModalOpen, setIsCourtModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // General Ticket Form
  const [category, setCategory] = useState<SupportCategory>('Payment');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'Normal' | 'High' | 'Urgent'>('Normal');

  // Bank Change Request Form Fields
  const [bankName, setBankName] = useState('HDFC Bank');
  const [accountHolder, setAccountHolder] = useState(ownerName || 'Sky Sports Private Limited');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountType, setAccountType] = useState('Current Commercial Account');
  const [branchName, setBranchName] = useState('');
  const [bankChangeReason, setBankChangeReason] = useState('');
  const [bankConsent, setBankConsent] = useState(false);

  // Court Addition Request Form Fields
  const [courtName, setCourtName] = useState('');
  const [courtSport, setCourtSport] = useState('Football');
  const [courtSurface, setCourtSurface] = useState('FIFA-Grade Artificial Turf');
  const [courtHourlyRate, setCourtHourlyRate] = useState('1200');
  const [courtDimensions, setCourtDimensions] = useState('100 x 60 ft');
  const [courtLighting, setCourtLighting] = useState(true);
  const [courtIndoorOutdoor, setCourtIndoorOutdoor] = useState<'INDOOR' | 'OUTDOOR'>('OUTDOOR');
  const [courtRemarks, setCourtRemarks] = useState('');

  const currentPhone = ownerPhone || '9876543210';
  const currentEmail = ownerEmail || 'partner@ibooksports.com';
  const currentVenue = venueName || 'Sky Sports Arena';
  const currentVendor = ownerName || 'Karthik Rajan';

  // Load Vendor Requests from Backend API
  const loadVendorRequests = useCallback(async () => {
    setIsLoadingRequests(true);
    try {
      const data = await vendorRequestsApi.getRequests(currentPhone);
      setVendorRequests(data);
    } catch (e) {
      console.warn('Could not fetch remote vendor requests, using local fallback', e);
      // Seed fallback if offline
      setVendorRequests([
        {
          request_id: 'REQ-BNK-7041',
          request_type: 'BANK_CHANGE',
          venue_name: currentVenue,
          vendor_name: currentVendor,
          vendor_email: currentEmail,
          vendor_phone: currentPhone,
          status: 'REJECTED',
          rejection_note:
            'The provided cancelled cheque image is blurry and the account holder name does not match the GST legal entity. Please submit an official bank letterhead or clear passbook copy.',
          bank_details: {
            bank_name: 'Axis Bank',
            account_holder_name: 'Sky Sports LLP',
            account_number: '92102004561234',
            ifsc_code: 'UTIB0000123',
            account_type: 'Current Account',
            branch_name: 'Gandhipuram, Coimbatore',
            reason_for_change: 'Upgraded to business current account with higher IMPS transaction caps.',
          },
          submitted_at: '2026-09-04T10:30:00.000Z',
          reviewed_at: '2026-09-04T14:45:00.000Z',
          reviewed_by: 'compliance_officer_1',
        },
        {
          request_id: 'REQ-CRT-3082',
          request_type: 'COURT_CHANGE',
          venue_name: currentVenue,
          vendor_name: currentVendor,
          vendor_email: currentEmail,
          vendor_phone: currentPhone,
          status: 'APPROVED',
          court_details: {
            court_name: 'Pitch 3 — Covered AstroTurf',
            sport_type: 'Football',
            surface_type: 'FIFA Pro Artificial Grass (50mm)',
            hourly_rate: 1400,
            court_dimensions: '110 x 70 ft',
            lighting_available: true,
            indoor_outdoor: 'OUTDOOR',
            remarks: 'High-mast LED lighting with 8-a-side net barriers.',
          },
          submitted_at: '2026-09-02T11:15:00.000Z',
          reviewed_at: '2026-09-02T16:20:00.000Z',
          reviewed_by: 'ops_lead_02',
        },
        {
          request_id: 'REQ-BNK-8190',
          request_type: 'BANK_CHANGE',
          venue_name: currentVenue,
          vendor_name: currentVendor,
          vendor_email: currentEmail,
          vendor_phone: currentPhone,
          status: 'SUBMITTED',
          bank_details: {
            bank_name: 'HDFC Bank',
            account_holder_name: 'Sky Sports Private Limited',
            account_number: '50200098761234',
            ifsc_code: 'HDFC0001234',
            account_type: 'Current Commercial Account',
            branch_name: 'Peelamedu, Coimbatore',
            reason_for_change: 'Centralizing all arena payouts into primary operational treasury account.',
          },
          submitted_at: '2026-09-06T09:00:00.000Z',
        },
      ]);
    } finally {
      setIsLoadingRequests(false);
    }
  }, [currentPhone, currentVenue, currentVendor, currentEmail]);

  useEffect(() => {
    loadVendorRequests();
  }, [loadVendorRequests]);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    haptics.tap();
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Submit Bank Change Request
  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber || !confirmAccountNumber) {
      showToast('Validation Error', 'Please enter and re-confirm the account number.', 'warning');
      return;
    }
    if (accountNumber.trim() !== confirmAccountNumber.trim()) {
      showToast('Account Mismatch', 'Account numbers do not match. Please recheck.', 'warning');
      return;
    }
    if (!ifscCode.trim()) {
      showToast('IFSC Required', 'Please enter a valid 11-digit bank IFSC code.', 'warning');
      return;
    }
    if (!bankChangeReason.trim()) {
      showToast('Reason Required', 'Please provide a reason for the bank account update.', 'warning');
      return;
    }
    if (!bankConsent) {
      showToast('Consent Required', 'Please confirm that this bank account belongs to the legal venue entity.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateVendorRequestPayload = {
        request_type: 'BANK_CHANGE',
        venue_name: currentVenue,
        vendor_name: currentVendor,
        vendor_email: currentEmail,
        vendor_phone: currentPhone,
        bank_details: {
          bank_name: bankName.trim(),
          account_holder_name: accountHolder.trim(),
          account_number: accountNumber.trim(),
          ifsc_code: ifscCode.trim().toUpperCase(),
          account_type: accountType,
          branch_name: branchName.trim() || undefined,
          reason_for_change: bankChangeReason.trim(),
        },
      };

      const res = await vendorRequestsApi.createRequest(payload);
      haptics.success();
      showToast(
        'Change Request Submitted',
        `Ticket ${res.request_id} created. Confirmation email sent to ${currentEmail}.`,
        'success'
      );

      setIsBankModalOpen(false);
      setAccountNumber('');
      setConfirmAccountNumber('');
      setIfscCode('');
      setBranchName('');
      setBankChangeReason('');
      setBankConsent(false);
      await loadVendorRequests();
    } catch (err: unknown) {
      const error = err as Error;
      showToast('Submission Failed', error.message || 'Unable to submit request.', 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Court Addition Request
  const handleCourtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courtName.trim()) {
      showToast('Court Name Required', 'Please enter a name for the court/pitch.', 'warning');
      return;
    }
    const rate = parseInt(courtHourlyRate, 10);
    if (!rate || rate < 100) {
      showToast('Valid Rate Required', 'Please enter a valid hourly rate (min ₹100).', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateVendorRequestPayload = {
        request_type: 'COURT_CHANGE',
        venue_name: currentVenue,
        vendor_name: currentVendor,
        vendor_email: currentEmail,
        vendor_phone: currentPhone,
        court_details: {
          court_name: courtName.trim(),
          sport_type: courtSport,
          surface_type: courtSurface,
          hourly_rate: rate,
          court_dimensions: courtDimensions.trim() || undefined,
          lighting_available: courtLighting,
          indoor_outdoor: courtIndoorOutdoor,
          remarks: courtRemarks.trim() || undefined,
        },
      };

      const res = await vendorRequestsApi.createRequest(payload);
      haptics.success();
      showToast(
        'Court Request Submitted',
        `Ticket ${res.request_id} registered. Compliance inspection team will review within 24 hours.`,
        'success'
      );

      setIsCourtModalOpen(false);
      setCourtName('');
      setCourtHourlyRate('1200');
      setCourtRemarks('');
      await loadVendorRequests();
    } catch (err: unknown) {
      const error = err as Error;
      showToast('Submission Failed', error.message || 'Unable to submit request.', 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit General Support Ticket
  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      showToast('Subject Required', 'Please enter a query subject.', 'warning');
      return;
    }
    if (!description.trim()) {
      showToast('Details Required', 'Please enter details for your request.', 'warning');
      return;
    }

    haptics.success();
    addSupportTicket({
      category,
      subject: `[${urgency}] ${subject.trim()}`,
      description: description.trim(),
    });

    setSubject('');
    setDescription('');
    setIsTicketModalOpen(false);
    showToast('Support Ticket Raised', 'Ticket submitted. Operations desk will review within 30 mins.', 'success');
  };

  const filteredVendorRequests = vendorRequests.filter((req) => {
    if (filterType !== 'ALL' && req.request_type !== filterType) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchId = req.request_id.toLowerCase().includes(term);
      const matchType = req.request_type.toLowerCase().includes(term);
      const matchStatus = req.status.toLowerCase().includes(term);
      const matchCourt = req.court_details?.court_name?.toLowerCase().includes(term);
      const matchBank = req.bank_details?.bank_name?.toLowerCase().includes(term);
      return matchId || matchType || matchStatus || matchCourt || matchBank;
    }
    return true;
  });

  const faqs = [
    {
      q: 'How does the Bank Details Change verification process work?',
      a: 'Bank account modifications require mandatory compliance approval to prevent unauthorized payout diversions. Once submitted, our finance desk verifies the account holder against your registered GST/PAN documents. You will receive an automated email confirmation upon review, and payouts switch seamlessly to the approved account.',
    },
    {
      q: 'How long does a New Court Listing approval take?',
      a: 'Court addition requests are reviewed within 24 business hours. Our operations team verifies sport specifications, surface safety standards, and pricing boundaries before publishing the pitch live on the TurfTown consumer app.',
    },
    {
      q: 'What should I do if my bank change or court request is rejected?',
      a: 'The exact rejection reason from our compliance team is displayed prominently inside the ticket card (labeled "Bank Details Reject Reason" or "Court Details Reject Reason") and sent via email. Review the note, rectify the document or detail, and submit a revised request.',
    },
    {
      q: 'How are UPI and dynamic QR collections settled into my bank?',
      a: 'All online collections and QR transactions are settled automatically via T+0 direct IMPS payout to your linked bank account every midnight at 12:00 AM.',
    },
    {
      q: 'Can I request multiple courts at once?',
      a: 'Yes, each court requires an individual specification ticket so dimensions, surface material, and sport layouts can be certified independently.',
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pb-20 pt-2 w-full space-y-6 select-none max-w-7xl mx-auto">
      {/* Mobile Back Button */}
      <button
        onClick={() => {
          haptics.tap();
          goBack();
        }}
        className="md:hidden flex items-center gap-1.5 text-[12.5px] font-bold text-[#FF6B2C] active-press cursor-pointer pb-1"
      >
        <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
        <span>Back to Settings</span>
      </button>

      {/* Header & Main Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E8E6E1]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[24px] font-black text-[#171717] tracking-tight">
              Help Desk & Operational Support
            </h1>
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#171717] text-white">
              Partner Portal
            </span>
          </div>
          <p className="text-[13px] font-medium text-[#777570] mt-0.5">
            Submit bank & court change requests, track compliance review tickets & priority hotline
          </p>
        </div>

        {/* 3 Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              haptics.tap();
              setIsBankModalOpen(true);
            }}
            className="h-10 px-3.5 rounded-xl bg-white hover:bg-[#FAF9F6] text-[#171717] border border-[#D5D3CC] font-bold text-[12.5px] flex items-center gap-2 shadow-2xs active-press cursor-pointer transition-all"
          >
            <Building2 className="w-4 h-4 text-[#FF6B2C]" />
            <span>Change Bank Request</span>
          </button>

          <button
            onClick={() => {
              haptics.tap();
              setIsCourtModalOpen(true);
            }}
            className="h-10 px-3.5 rounded-xl bg-white hover:bg-[#FAF9F6] text-[#171717] border border-[#D5D3CC] font-bold text-[12.5px] flex items-center gap-2 shadow-2xs active-press cursor-pointer transition-all"
          >
            <Trophy className="w-4 h-4 text-[#FF6B2C]" />
            <span>Court Request</span>
          </button>

          <button
            onClick={() => {
              haptics.tap();
              setIsTicketModalOpen(true);
            }}
            className="h-10 px-4 rounded-xl bg-[#FF6B2C] hover:bg-[#e85b1e] text-white font-extrabold text-[12.5px] flex items-center gap-1.5 shadow-sm active-press cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>General Ticket</span>
          </button>
        </div>
      </div>

      {/* Hotline Strip */}
      <div className="bg-[#171717] text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#262626]">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5 text-[#FF6B2C]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10.5px] font-bold text-[#A3A099] uppercase tracking-wider">
                Priority Partner Desk
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#2FA66A]" />
              <span className="text-[10.5px] text-[#2FA66A] font-semibold">Toll-Free Online</span>
            </div>
            <h3 className="text-[15.5px] font-bold text-white mt-0.5">
              1800-208-1010 <span className="text-[12px] font-normal text-[#A3A099]">(6:00 AM – 11:00 PM IST)</span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <a
            href="tel:18002081010"
            className="h-9 px-4 bg-[#FF6B2C] hover:bg-[#e85b1e] text-white rounded-lg text-[12px] font-bold flex items-center gap-2 active-press transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Direct Call</span>
          </a>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E6E1] pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              haptics.tap();
              setActiveTab('requests');
            }}
            className={`px-4 py-2 rounded-xl text-[13px] font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'requests'
                ? 'bg-[#171717] text-white shadow-xs'
                : 'text-[#777570] hover:text-[#171717] hover:bg-[#FAF9F6]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Change Requests ({vendorRequests.length})</span>
          </button>

          <button
            onClick={() => {
              haptics.tap();
              setActiveTab('general_tickets');
            }}
            className={`px-4 py-2 rounded-xl text-[13px] font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'general_tickets'
                ? 'bg-[#171717] text-white shadow-xs'
                : 'text-[#777570] hover:text-[#171717] hover:bg-[#FAF9F6]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Support Queries ({supportTickets.length})</span>
          </button>

          <button
            onClick={() => {
              haptics.tap();
              setActiveTab('faqs');
            }}
            className={`px-4 py-2 rounded-xl text-[13px] font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'faqs'
                ? 'bg-[#171717] text-white shadow-xs'
                : 'text-[#777570] hover:text-[#171717] hover:bg-[#FAF9F6]'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Knowledge Base</span>
          </button>
        </div>

        {activeTab === 'requests' && (
          <button
            onClick={() => {
              haptics.tap();
              loadVendorRequests();
            }}
            disabled={isLoadingRequests}
            className="flex items-center gap-1.5 text-[12px] font-bold text-[#777570] hover:text-[#171717] cursor-pointer px-2.5 py-1.5 rounded-lg hover:bg-[#FAF9F6] border border-[#E8E6E1]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRequests ? 'animate-spin' : ''}`} />
            <span>Refresh Status</span>
          </button>
        )}
      </div>

      {/* TAB 1: AUDITED CHANGE REQUESTS (BANK & COURT) */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF9F6] p-3 rounded-2xl border border-[#E8E6E1]">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {(
                [
                  { id: 'ALL', label: 'All Requests' },
                  { id: 'BANK_CHANGE', label: 'Bank Details Change' },
                  { id: 'COURT_CHANGE', label: 'Court Requests' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    haptics.tap();
                    setFilterType(f.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-[12px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    filterType === f.id
                      ? 'bg-[#171717] text-white'
                      : 'bg-white text-[#777570] border border-[#E8E6E1] hover:text-[#171717]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative flex items-center bg-white border border-[#E8E6E1] rounded-xl px-3 py-1.5 w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#777570] mr-2 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search ticket ID or details..."
                className="w-full text-[12px] font-medium text-[#171717] bg-transparent focus:outline-none placeholder-[#A3A099]"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="text-[#777570] hover:text-[#171717]">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* List of Request Cards */}
          {isLoadingRequests ? (
            <div className="bg-white rounded-2xl p-12 border border-[#E8E6E1] text-center space-y-2">
              <RefreshCw className="w-6 h-6 text-[#777570] animate-spin mx-auto" />
              <p className="text-[13px] font-bold text-[#171717]">Loading change requests...</p>
            </div>
          ) : filteredVendorRequests.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 border border-[#E8E6E1] text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E1] flex items-center justify-center mx-auto text-[#A3A099]">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-[15px] font-extrabold text-[#171717]">No change requests found</h4>
                <p className="text-[12.5px] text-[#777570] max-w-md mx-auto mt-1">
                  You do not have any pending or historical change requests under this filter. Submit a new bank or court change request using the buttons above.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVendorRequests.map((req) => {
                const isBank = req.request_type === 'BANK_CHANGE';
                const isRejected = req.status === 'REJECTED';
                const isApproved = req.status === 'APPROVED';
                const isUnderReview = req.status === 'SUBMITTED';

                return (
                  <div
                    key={req.request_id}
                    className="bg-white rounded-2xl border border-[#E8E6E1] overflow-hidden shadow-2xs hover:border-[#D5D3CC] transition-all"
                  >
                    {/* Card Header Row */}
                    <div className="p-4 sm:p-5 border-b border-[#F1F0EC] flex flex-wrap items-center justify-between gap-3 bg-[#FAF9F6]/50">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        {/* Request ID Pill */}
                        <div className="flex items-center gap-1.5 bg-white border border-[#E8E6E1] px-2.5 py-1 rounded-lg">
                          <span className="text-[11.5px] font-mono font-extrabold text-[#171717]">
                            {req.request_id}
                          </span>
                          <button
                            onClick={() => handleCopyId(req.request_id)}
                            title="Copy ID"
                            className="text-[#777570] hover:text-[#171717] cursor-pointer"
                          >
                            {copiedId === req.request_id ? (
                              <Check className="w-3 h-3 text-[#047857]" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>

                        {/* Request Type Badge */}
                        {isBank ? (
                          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#FAF9F6] text-[#55534E] border border-[#E8E6E1] flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-[#FF6B2C]" />
                            Bank Details Change
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#FAF9F6] text-[#55534E] border border-[#E8E6E1] flex items-center gap-1.5">
                            <Trophy className="w-3.5 h-3.5 text-[#FF6B2C]" />
                            Court Request
                          </span>
                        )}

                        <span className="text-[11.5px] text-[#A3A099]">
                          Submitted {new Date(req.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {isApproved && (
                          <span className="px-3 py-1 rounded-full text-[11.5px] font-extrabold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approved
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-3 py-1 rounded-full text-[11.5px] font-extrabold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Rejected
                          </span>
                        )}
                        {isUnderReview && (
                          <span className="px-3 py-1 rounded-full text-[11.5px] font-extrabold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            Under Review
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Body: Bank or Court Details */}
                    <div className="p-4 sm:p-5 space-y-4">
                      {isBank && req.bank_details && (
                        <div className="space-y-3">
                          <div className="text-[11px] font-bold text-[#777570] uppercase tracking-wider">
                            Proposed Bank Account Specifications
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#FAF9F6] p-3.5 rounded-xl border border-[#E8E6E1]">
                            <div>
                              <span className="text-[11px] text-[#777570] block">Bank Name</span>
                              <span className="text-[13px] font-bold text-[#171717]">{req.bank_details.bank_name}</span>
                            </div>
                            <div>
                              <span className="text-[11px] text-[#777570] block">Account Holder</span>
                              <span className="text-[13px] font-bold text-[#171717]">{req.bank_details.account_holder_name}</span>
                            </div>
                            <div>
                              <span className="text-[11px] text-[#777570] block">Account Number</span>
                              <span className="text-[13px] font-mono font-bold text-[#171717]">
                                •••• •••• {req.bank_details.account_number.slice(-4) || '••••'}
                              </span>
                            </div>
                            <div>
                              <span className="text-[11px] text-[#777570] block">IFSC Code</span>
                              <span className="text-[13px] font-mono font-bold text-[#171717]">{req.bank_details.ifsc_code}</span>
                            </div>
                            {req.bank_details.branch_name && (
                              <div>
                                <span className="text-[11px] text-[#777570] block">Branch</span>
                                <span className="text-[12.5px] font-medium text-[#171717]">{req.bank_details.branch_name}</span>
                              </div>
                            )}
                            <div>
                              <span className="text-[11px] text-[#777570] block">Account Type</span>
                              <span className="text-[12.5px] font-medium text-[#171717]">{req.bank_details.account_type}</span>
                            </div>
                            <div className="sm:col-span-2">
                              <span className="text-[11px] text-[#777570] block">Reason for Update</span>
                              <span className="text-[12px] text-[#55534E] font-medium">{req.bank_details.reason_for_change}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {!isBank && req.court_details && (
                        <div className="space-y-3">
                          <div className="text-[11px] font-bold text-[#777570] uppercase tracking-wider">
                            Requested Court Details & Specifications
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#FAF9F6] p-3.5 rounded-xl border border-[#E8E6E1]">
                            <div>
                              <span className="text-[11px] text-[#777570] block">Court / Pitch Name</span>
                              <span className="text-[13px] font-bold text-[#171717]">{req.court_details.court_name}</span>
                            </div>
                            <div>
                              <span className="text-[11px] text-[#777570] block">Primary Sport</span>
                              <span className="text-[13px] font-bold text-[#171717]">{req.court_details.sport_type}</span>
                            </div>
                            <div>
                              <span className="text-[11px] text-[#777570] block">Surface Type</span>
                              <span className="text-[12.5px] font-medium text-[#171717]">{req.court_details.surface_type}</span>
                            </div>
                            <div>
                              <span className="text-[11px] text-[#777570] block">Base Hourly Rate</span>
                              <span className="text-[13px] font-bold text-[#171717]">₹{req.court_details.hourly_rate} / hr</span>
                            </div>
                            {req.court_details.court_dimensions && (
                              <div>
                                <span className="text-[11px] text-[#777570] block">Dimensions</span>
                                <span className="text-[12.5px] font-medium text-[#171717]">{req.court_details.court_dimensions}</span>
                              </div>
                            )}
                            <div>
                              <span className="text-[11px] text-[#777570] block">Environment & Lighting</span>
                              <span className="text-[12px] font-medium text-[#171717]">
                                {req.court_details.indoor_outdoor === 'INDOOR' ? 'Indoor Arena' : 'Outdoor Pitch'} · {req.court_details.lighting_available ? 'Floodlights Enabled' : 'Daylight Only'}
                              </span>
                            </div>
                            {req.court_details.remarks && (
                              <div className="sm:col-span-2">
                                <span className="text-[11px] text-[#777570] block">Operational Remarks</span>
                                <span className="text-[12px] text-[#55534E] font-medium">{req.court_details.remarks}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* SPECIFIC REJECT REASON ALERT BOX (USER MANDATE) */}
                      {isRejected && (
                        <div className="rounded-xl p-4 bg-[#FEF2F2] border border-[#FECACA] space-y-2">
                          <div className="flex items-center gap-2 text-[#991B1B]">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span className="text-[12.5px] font-extrabold uppercase tracking-wide">
                              {isBank ? 'Bank Details Reject Reason' : 'Court Details Reject Reason'}
                            </span>
                          </div>

                          <div className="bg-white/80 rounded-lg p-3 border border-[#FCA5A5] text-[13px] font-semibold text-[#7F1D1D] leading-relaxed">
                            {req.rejection_note ||
                              (isBank
                                ? 'The submitted bank account verification document was incomplete or could not be validated against GST records.'
                                : 'The court specification or proposed hourly rate did not meet platform guidelines.')}
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[11.5px] text-[#991B1B]">
                            <span>
                              Reviewed on {req.reviewed_at ? new Date(req.reviewed_at).toLocaleDateString('en-IN') : 'Recent'} by Compliance Desk
                            </span>
                            <button
                              onClick={() => {
                                haptics.tap();
                                if (isBank) setIsBankModalOpen(true);
                                else setIsCourtModalOpen(true);
                              }}
                              className="font-bold underline hover:text-[#7F1D1D] cursor-pointer text-left sm:text-right"
                            >
                              Submit Corrected {isBank ? 'Bank Details' : 'Court Request'} →
                            </button>
                          </div>
                        </div>
                      )}

                      {/* APPROVED CONFIRMATION STRIP */}
                      {isApproved && (
                        <div className="rounded-xl p-3 bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-between gap-2 text-[12px] text-[#065F46]">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0" />
                            <span className="font-semibold">
                              {isBank
                                ? 'Bank details approved by Finance Desk. Future midnight IMPS settlements will credit to this account.'
                                : 'Court verified and certified live for online consumer bookings.'}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#047857] font-bold shrink-0">
                            Verified on {req.reviewed_at ? new Date(req.reviewed_at).toLocaleDateString('en-IN') : 'Recent'}
                          </span>
                        </div>
                      )}

                      {/* UNDER REVIEW STRIP */}
                      {isUnderReview && (
                        <div className="rounded-xl p-3 bg-[#FFFBEB] border border-[#FDE68A] flex items-center gap-2 text-[12px] text-[#92400E]">
                          <Clock className="w-4 h-4 text-[#B45309] shrink-0" />
                          <span>
                            Under active verification by TurfTown Compliance Desk. Automated review notifications will be dispatched to <strong className="font-semibold">{currentEmail}</strong> upon decision.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GENERAL SUPPORT TICKETS */}
      {activeTab === 'general_tickets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-extrabold text-[#171717]">
              Operations Support Inquiries ({supportTickets.length})
            </h3>
            <button
              onClick={() => setIsTicketModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-[#FF6B2C] text-white text-[12px] font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Raise Query</span>
            </button>
          </div>

          {supportTickets.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 border border-[#E8E6E1] text-center space-y-2">
              <MessageSquare className="w-8 h-8 text-[#A3A099] mx-auto" />
              <p className="text-[13.5px] font-bold text-[#171717]">No operational tickets</p>
              <p className="text-[12px] text-[#777570]">
                Need help with booking disputes or app issues? Raise a ticket to connect with our operations team.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {supportTickets.map((t) => (
                <div key={t.id} className="bg-white rounded-2xl p-4 border border-[#E8E6E1] shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11.5px] font-mono font-bold text-[#FF6B2C]">{t.id}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E7A72F]/15 text-[#B87C0D] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {t.status}
                    </span>
                  </div>
                  <h4 className="text-[13.5px] font-bold text-[#171717]">{t.subject}</h4>
                  <p className="text-[12px] text-[#777570] leading-relaxed">{t.description}</p>
                  <p className="text-[10.5px] font-semibold text-[#A3A099] pt-2 border-t border-[#F1F0EC]">
                    Submitted on {t.date}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: FAQS */}
      {activeTab === 'faqs' && (
        <div className="space-y-4">
          <div className="space-y-3">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={faq.q}
                  className="bg-white rounded-2xl border border-[#E8E6E1] overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => {
                      haptics.tap();
                      setExpandedFaq(isOpen ? null : idx);
                    }}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-[#FAF9F6] transition-colors cursor-pointer"
                  >
                    <span className="text-[13.5px] font-extrabold text-[#171717]">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#777570] shrink-0 transition-transform ${
                        isOpen ? 'rotate-180 text-[#FF6B2C]' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-[13px] text-[#55534E] leading-relaxed border-t border-[#F1F0EC] bg-[#FAF9F6]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: BANK DETAILS CHANGE REQUEST */}
      <AnimatePresence>
        {isBankModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs select-none">
            <div className="absolute inset-0" onClick={() => !isSubmitting && setIsBankModalOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-[#E8E6E1] overflow-hidden max-h-[92vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-[#F1F0EC] flex items-center justify-between bg-[#FAF9F6]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#171717] text-white flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-[#FF6B2C]" />
                  </div>
                  <div>
                    <h2 className="text-[17px] font-black text-[#171717]">
                      Request Bank Details Change
                    </h2>
                    <p className="text-[11.5px] text-[#777570]">
                      Compliance review ticket · Updates midnight IMPS payout destination
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsBankModalOpen(false)}
                  disabled={isSubmitting}
                  className="w-8 h-8 rounded-full bg-white border border-[#E8E6E1] flex items-center justify-center text-[#777570] hover:text-[#171717] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleBankSubmit} className="p-5 overflow-y-auto space-y-4 text-[12.5px]">
                <div className="bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl p-3 text-[11.5px] text-[#55534E] leading-relaxed">
                  <strong className="text-[#171717] font-bold block mb-0.5">Audit Compliance Notice</strong>
                  Bank detail changes are validated against the GST / PAN of <strong>{currentVenue}</strong>. Existing settlement account continues to receive payouts until approved.
                </div>

                {/* Bank Name */}
                <div>
                  <label className="block text-[11px] font-bold text-[#777570] mb-1">
                    Bank Name <span className="text-[#FF6B2C]">*</span>
                  </label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-white border border-[#D5D3CC] rounded-xl px-3 py-2 font-bold text-[#171717] focus:outline-none focus:border-[#171717]"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="State Bank of India">State Bank of India</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                    <option value="Punjab National Bank">Punjab National Bank</option>
                    <option value="Canara Bank">Canara Bank</option>
                    <option value="Bank of Baroda">Bank of Baroda</option>
                    <option value="Other Commercial Bank">Other Commercial Bank</option>
                  </select>
                </div>

                {/* Account Holder Name */}
                <div>
                  <label className="block text-[11px] font-bold text-[#777570] mb-1">
                    Beneficiary Account Holder Name <span className="text-[#FF6B2C]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    placeholder="e.g. Sky Sports Private Limited"
                    className="w-full bg-white border border-[#D5D3CC] rounded-xl px-3 py-2 font-bold text-[#171717] focus:outline-none focus:border-[#171717]"
                  />
                  <span className="text-[10.5px] text-[#A3A099] mt-0.5 block">
                    Must strictly match the business entity registered on your tax invoices.
                  </span>
                </div>

                {/* Account Number & Confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#777570] mb-1">
                      New Account Number <span className="text-[#FF6B2C]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="e.g. 50200012345678"
                      className="w-full bg-white border border-[#D5D3CC] rounded-xl px-3 py-2 font-mono font-bold text-[#171717] focus:outline-none focus:border-[#171717]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#777570] mb-1">
                      Confirm Account Number <span className="text-[#FF6B2C]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={confirmAccountNumber}
                      onChange={(e) => setConfirmAccountNumber(e.target.value)}
                      placeholder="Re-enter account number"
                      className="w-full bg-white border border-[#D5D3CC] rounded-xl px-3 py-2 font-mono font-bold text-[#171717] focus:outline-none focus:border-[#171717]"
                    />
                  </div>
                </div>

                {/* IFSC & Branch */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#777570] mb-1">
                      IFSC Code <span className="text-[#FF6B2C]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                      placeholder="e.g. HDFC0001234"
                      maxLength={11}
                      className="w-full bg-white border border-[#D5D3CC] rounded-xl px-3 py-2 font-mono font-bold text-[#171717] uppercase focus:outline-none focus:border-[#171717]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#777570] mb-1">
                      Branch Name
                    </label>
                    <input
                      type="text"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      placeholder="e.g. Peelamedu, Coimbatore"
                      className="w-full bg-white border border-[#D5D3CC] rounded-xl px-3 py-2 font-medium text-[#171717] focus:outline-none focus:border-[#171717]"
                    />
                  </div>
                </div>

                {/* Account Type */}
                <div>
                  <label className="block text-[11px] font-bold text-[#777570] mb-1">
                    Account Classification
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Current Commercial Account', 'Savings Account'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setAccountType(t)}
                        className={`p-2.5 rounded-xl text-[12px] font-bold border transition-all cursor-pointer text-center ${
                          accountType === t
                            ? 'bg-[#171717] text-white border-[#171717]'
                            : 'bg-white text-[#777570] border-[#E8E6E1]'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reason for Change */}
                <div>
                  <label className="block text-[11px] font-bold text-[#777570] mb-1">
                    Reason for Bank Details Change <span className="text-[#FF6B2C]">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={bankChangeReason}
                    onChange={(e) => setBankChangeReason(e.target.value)}
                    placeholder="e.g. Migrated to primary corporate current account with Axis Bank..."
                    className="w-full bg-white border border-[#D5D3CC] rounded-xl p-3 text-[12px] font-medium text-[#171717] focus:outline-none focus:border-[#171717] resize-none"
                  />
                </div>

                {/* Declaration Consent */}
                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF9F6] border border-[#E8E6E1] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bankConsent}
                    onChange={(e) => setBankConsent(e.target.checked)}
                    className="mt-0.5 rounded text-[#FF6B2C] focus:ring-0"
                  />
                  <span className="text-[11px] text-[#55534E] leading-relaxed">
                    I declare under penalty of platform de-listing that this bank account is solely owned by the authorized legal entity for <strong>{currentVenue}</strong>.
                  </span>
                </label>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F1F0EC]">
                  <button
                    type="button"
                    onClick={() => setIsBankModalOpen(false)}
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl text-[12.5px] font-bold text-[#777570] hover:text-[#171717] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-[#171717] hover:bg-black text-white text-[12.5px] font-black flex items-center gap-2 shadow-xs active-press cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <Send className="w-4 h-4 text-[#FF6B2C]" />
                    )}
                    <span>Submit Bank Change Request</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: COURT ADDITION REQUEST */}
      <AnimatePresence>
        {isCourtModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs select-none">
            <div className="absolute inset-0" onClick={() => !isSubmitting && setIsCourtModalOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-[#E8E6E1] overflow-hidden max-h-[92vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-[#F1F0EC] flex items-center justify-between bg-[#FAF9F6]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#171717] text-white flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-[#FF6B2C]" />
                  </div>
                  <div>
                    <h2 className="text-[17px] font-black text-[#171717]">
                      Request Court / Pitch Addition
                    </h2>
                    <p className="text-[11.5px] text-[#777570]">
                      Compliance audit ticket · Verified before going live on TurfTown app
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCourtModalOpen(false)}
                  disabled={isSubmitting}
                  className="w-8 h-8 rounded-full bg-white border border-[#E8E6E1] flex items-center justify-center text-[#777570] hover:text-[#171717] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleCourtSubmit} className="p-5 overflow-y-auto space-y-4 text-[12.5px]">
                <div className="bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl p-3 text-[11.5px] text-[#55534E] leading-relaxed">
                  <strong className="text-[#171717] font-bold block mb-0.5">Court Listing Guideline</strong>
                  Every court is reviewed for boundary safety, lighting standards, and zone hourly rate benchmarks before publishing to public booking users.
                </div>

                {/* Court Name */}
                <div>
                  <label className="block text-[11px] font-bold text-[#777570] mb-1">
                    Court / Pitch Name <span className="text-[#FF6B2C]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={courtName}
                    onChange={(e) => setCourtName(e.target.value)}
                    placeholder="e.g. Pitch 3 — Floodlit Box Cricket Arena"
                    className="w-full bg-white border border-[#D5D3CC] rounded-xl px-3 py-2 font-bold text-[#171717] focus:outline-none focus:border-[#171717]"
                  />
                </div>

                {/* Sport & Surface */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#777570] mb-1">
                      Primary Sport <span className="text-[#FF6B2C]">*</span>
                    </label>
                    <select
                      value={courtSport}
                      onChange={(e) => setCourtSport(e.target.value)}
                      className="w-full bg-white border border-[#D5D3CC] rounded-xl px-3 py-2 font-bold text-[#171717] focus:outline-none focus:border-[#171717]"
                    >
                      <option value="Football">Football</option>
                      <option value="Cricket">Cricket</option>
                      <option value="Badminton">Badminton</option>
                      <option value="Pickleball">Pickleball</option>
                      <option value="Tennis">Tennis</option>
                      <option value="Basketball">Basketball</option>
                      <option value="Volleyball">Volleyball</option>
                      <option value="Padel">Padel</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#777570] mb-1">
                      Surface Specification <span className="text-[#FF6B2C]">*</span>
                    </label>
                    <select
                      value={courtSurface}
                      onChange={(e) => setCourtSurface(e.target.value)}
                      className="w-full bg-white border border-[#D5D3CC] rounded-xl px-3 py-2 font-medium text-[#171717] focus:outline-none focus:border-[#171717]"
                    >
                      <option value="FIFA-Grade Artificial Turf">FIFA-Grade Artificial Turf</option>
                      <option value="BWF Wooden Court">BWF Wooden Court</option>
                      <option value="Synthetic Acrylic Cushion">Synthetic Acrylic Cushion</option>
                      <option value="Natural Grass Pitch">Natural Grass Pitch</option>
                      <option value="Clay Court">Clay Court</option>
                      <option value="Hard Concrete">Hard Concrete</option>
                    </select>
                  </div>
                </div>

                {/* Hourly Rate & Dimensions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#777570] mb-1">
                      Base Hourly Rate (₹) <span className="text-[#FF6B2C]">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={100}
                      step={50}
                      value={courtHourlyRate}
                      onChange={(e) => setCourtHourlyRate(e.target.value)}
                      placeholder="1200"
                      className="w-full bg-white border border-[#D5D3CC] rounded-xl px-3 py-2 font-bold text-[#171717] focus:outline-none focus:border-[#171717]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#777570] mb-1">
                      Dimensions
                    </label>
                    <input
                      type="text"
                      value={courtDimensions}
                      onChange={(e) => setCourtDimensions(e.target.value)}
                      placeholder="e.g. 100 x 60 ft"
                      className="w-full bg-white border border-[#D5D3CC] rounded-xl px-3 py-2 font-medium text-[#171717] focus:outline-none focus:border-[#171717]"
                    />
                  </div>
                </div>

                {/* Indoor / Outdoor & Lighting */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-[#777570] mb-1">
                      Arena Environment
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCourtIndoorOutdoor('OUTDOOR')}
                        className={`py-2 rounded-xl text-[12px] font-bold border transition-all cursor-pointer text-center ${
                          courtIndoorOutdoor === 'OUTDOOR'
                            ? 'bg-[#171717] text-white border-[#171717]'
                            : 'bg-white text-[#777570] border-[#E8E6E1]'
                        }`}
                      >
                        Outdoor
                      </button>
                      <button
                        type="button"
                        onClick={() => setCourtIndoorOutdoor('INDOOR')}
                        className={`py-2 rounded-xl text-[12px] font-bold border transition-all cursor-pointer text-center ${
                          courtIndoorOutdoor === 'INDOOR'
                            ? 'bg-[#171717] text-white border-[#171717]'
                            : 'bg-white text-[#777570] border-[#E8E6E1]'
                        }`}
                      >
                        Indoor
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#777570] mb-1">
                      Night Lighting
                    </label>
                    <button
                      type="button"
                      onClick={() => setCourtLighting(!courtLighting)}
                      className={`w-full py-2 px-3 rounded-xl text-[12px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        courtLighting
                          ? 'bg-[#2FA66A]/15 text-[#1E774A] border-[#2FA66A]/30'
                          : 'bg-white text-[#777570] border-[#E8E6E1]'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{courtLighting ? 'Floodlights Available' : 'No Lighting'}</span>
                    </button>
                  </div>
                </div>

                {/* Remarks */}
                <div>
                  <label className="block text-[11px] font-bold text-[#777570] mb-1">
                    Operational Remarks / Features
                  </label>
                  <textarea
                    rows={2}
                    value={courtRemarks}
                    onChange={(e) => setCourtRemarks(e.target.value)}
                    placeholder="e.g. Equipped with 8-a-side side nets, electronic scoreboard, spectator benches..."
                    className="w-full bg-white border border-[#D5D3CC] rounded-xl p-3 text-[12px] font-medium text-[#171717] focus:outline-none focus:border-[#171717] resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F1F0EC]">
                  <button
                    type="button"
                    onClick={() => setIsCourtModalOpen(false)}
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl text-[12.5px] font-bold text-[#777570] hover:text-[#171717] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-[#171717] hover:bg-black text-white text-[12.5px] font-black flex items-center gap-2 shadow-xs active-press cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <Send className="w-4 h-4 text-[#FF6B2C]" />
                    )}
                    <span>Submit Court Request</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: GENERAL SUPPORT TICKET MODAL */}
      <AnimatePresence>
        {isTicketModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs select-none">
            <div className="absolute inset-0" onClick={() => setIsTicketModalOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-[#E8E6E1] overflow-hidden"
            >
              <div className="p-5 border-b border-[#F1F0EC] flex items-center justify-between bg-[#FAF9F6]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FF6B2C]/10 text-[#FF6B2C] flex items-center justify-center">
                    <LifeBuoy className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-[17px] font-black text-[#171717]">
                      Raise Support Ticket
                    </h2>
                    <p className="text-[11.5px] text-[#777570]">
                      Operations desk responds within 30 minutes
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsTicketModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white border border-[#E8E6E1] flex items-center justify-center text-[#777570] hover:text-[#171717] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleTicketSubmit} className="p-5 space-y-3.5 text-[12.5px]">
                {/* Category Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-[#777570] mb-1.5">
                    Category <span className="text-[#FF6B2C]">*</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(['Payment', 'Booking', 'Court', 'Technical', 'Other'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          haptics.tap();
                          setCategory(cat);
                        }}
                        className={`h-8 px-3 rounded-xl text-[11.5px] font-bold transition-all border cursor-pointer ${
                          category === cat
                            ? 'bg-[#171717] text-white border-[#171717]'
                            : 'bg-[#FAF9F6] text-[#777570] border-[#E8E6E1] hover:text-[#171717]'
                        }`}
                      >
                        {cat === 'Payment'
                          ? 'Payments & Settlements'
                          : cat === 'Booking'
                          ? 'Booking Discrepancy'
                          : cat === 'Court'
                          ? 'Slot Management'
                          : cat === 'Technical'
                          ? 'QR / Scanner Issue'
                          : 'General Inquiry'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-[11px] font-bold text-[#777570] mb-1.5">
                    Priority Level
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['Normal', 'High', 'Urgent'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => {
                          haptics.tap();
                          setUrgency(lvl);
                        }}
                        className={`py-1.5 px-2 rounded-xl text-[11.5px] font-bold transition-all border cursor-pointer text-center ${
                          urgency === lvl
                            ? lvl === 'Urgent'
                              ? 'bg-[#D94B4B] text-white border-[#D94B4B]'
                              : lvl === 'High'
                              ? 'bg-[#FF6B2C] text-white border-[#FF6B2C]'
                              : 'bg-[#171717] text-white border-[#171717]'
                            : 'bg-[#FAF9F6] text-[#777570] border-[#E8E6E1] hover:text-[#171717]'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-[11px] font-bold text-[#777570] mb-1">
                    Subject / Query Title <span className="text-[#FF6B2C]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Customer QR scan timed out but money deducted"
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-[12.5px] font-bold text-[#171717] focus:outline-none focus:border-[#171717]"
                  />
                </div>

                {/* Details */}
                <div>
                  <label className="block text-[11px] font-bold text-[#777570] mb-1">
                    Details & Notes <span className="text-[#FF6B2C]">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe transaction details, customer phone number, or booking reference..."
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl p-3 text-[12px] font-medium text-[#171717] focus:outline-none focus:border-[#171717] resize-none"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full h-11 bg-[#FF6B2C] hover:bg-[#e85b1e] text-white font-black text-[13px] rounded-xl flex items-center justify-center gap-1.5 shadow-sm active-press cursor-pointer transition-all mt-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Submit Ticket</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
