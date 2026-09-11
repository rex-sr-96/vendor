import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  LifeBuoy,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Paperclip,
  X,
  Send,
  Phone,
  HelpCircle,
  FileText,
  Upload,
  Check,
  CreditCard,
  CalendarDays,
  Wrench,
  Banknote,
  LayoutList,
  Ticket,
} from 'lucide-react';
import { SupportTicket, SupportCategory } from '../types';
import { haptics } from '../utils/haptics';
import { motion, AnimatePresence } from 'motion/react';

type CategoryFilter = 'all' | 'Payment' | 'Booking' | 'Technical' | 'Settlements' | 'General' | 'Other';
type StatusFilter = 'All' | 'Open' | 'In Progress' | 'Resolved';

export const SupportScreen: React.FC = () => {
  const { supportTickets, addSupportTicket, goBack, navigateTo, showToast } = useApp();

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected ticket detail modal
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // Raise ticket modal
  const [isRaiseOpen, setIsRaiseOpen] = useState(false);

  // Raise ticket form fields
  const [formCategory, setFormCategory] = useState<SupportCategory>('Payment');
  const [formSubject, setFormSubject] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formBookingId, setFormBookingId] = useState('');
  const [formPriority, setFormPriority] = useState<'Low' | 'High' | 'Urgent'>('Low');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachedPreview, setAttachedPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('File Too Large', 'Please upload a file smaller than 10MB.', 'warning');
      return;
    }

    setAttachedFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setAttachedPreview(null);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAttachedFile(null);
    setAttachedPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Metrics
  const openCount = supportTickets.filter((t) => t.status === 'Open').length;
  const inProgressCount = supportTickets.filter((t) => t.status === 'In Progress').length;
  const resolvedCount = supportTickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length;

  const filteredTickets = useMemo(() => {
    return supportTickets.filter((ticket) => {
      if (categoryFilter !== 'all' && ticket.category !== categoryFilter) return false;
      if (statusFilter === 'Open' && ticket.status !== 'Open') return false;
      if (statusFilter === 'In Progress' && ticket.status !== 'In Progress') return false;
      if (statusFilter === 'Resolved' && ticket.status !== 'Resolved' && ticket.status !== 'Closed') return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        ticket.id.toLowerCase().includes(q) ||
        ticket.subject.toLowerCase().includes(q) ||
        ticket.category.toLowerCase().includes(q) ||
        ticket.description.toLowerCase().includes(q) ||
        (ticket.bookingId && ticket.bookingId.toLowerCase().includes(q))
      );
    });
  }, [supportTickets, categoryFilter, statusFilter, searchQuery]);

  const handleRaiseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubject.trim()) {
      showToast('Subject Required', 'Please enter a subject for your ticket.', 'warning');
      return;
    }
    if (!formDescription.trim()) {
      showToast('Details Required', 'Please describe your issue.', 'warning');
      return;
    }
    haptics.success();
    addSupportTicket({
      category: formCategory,
      requestType: 'general_support',
      subject: formPriority !== 'Low' ? `[${formPriority}] ${formSubject.trim()}` : formSubject.trim(),
      description: formDescription.trim(),
      bookingId: formBookingId.trim() || undefined,
      priority: formPriority,
      attachmentName: attachedFile ? attachedFile.name : undefined,
    });
    showToast('Support Ticket Raised', 'Your query has been submitted to the merchant operations desk.', 'success');
    setIsRaiseOpen(false);
    setFormSubject('');
    setFormDescription('');
    setFormBookingId('');
    setAttachedFile(null);
    setAttachedPreview(null);
    setFormPriority('Low');
    setFormCategory('Payment');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusBadge = (status: SupportTicket['status']) => {
    switch (status) {
      case 'Resolved':
      case 'Closed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#16A34A]/15 text-[#15803D] flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
            Resolved
          </span>
        );
      case 'In Progress':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#2B7FFF]/15 text-[#2B7FFF] flex items-center gap-1">
            <Clock className="w-3 h-3 stroke-[2.5]" />
            In Progress
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#F94001]/15 text-[#F94001] flex items-center gap-1">
            <AlertCircle className="w-3 h-3 stroke-[2.5]" />
            Open
          </span>
        );
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Payment': return 'bg-blue-500/10 text-blue-700';
      case 'Booking': return 'bg-purple-500/10 text-purple-700';
      case 'Technical': return 'bg-amber-500/10 text-amber-700';
      case 'Settlements': return 'bg-emerald-500/10 text-emerald-700';
      case 'General': return 'bg-slate-500/10 text-slate-700';
      default: return 'bg-[#F3F4F4] text-[#5F6368]';
    }
  };

  const supportCategories: SupportCategory[] = ['Payment', 'Booking', 'Technical', 'Settlements', 'General', 'Other'];

  return (
    <div className="pb-24 pt-2 w-full space-y-4 sm:space-y-6 select-none max-w-6xl mx-auto">
      {/* Mobile Navigation Bar */}
      <div className="flex items-center justify-between gap-2 pb-1 sm:hidden">
        <button
          onClick={() => { haptics.tap(); goBack(); }}
          className="flex items-center gap-1 text-[13px] font-bold text-[#F94001] active-press cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Back</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { haptics.tap(); navigateTo('help_faq'); }}
            className="h-8 px-2.5 rounded-xl bg-[#F3F4F4] border border-[#E5E7EB] text-[11.5px] font-bold text-[#5F6368] flex items-center gap-1 active-press"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#F94001]" />
            <span>FAQs</span>
          </button>
          <button
            onClick={() => { haptics.tap(); setIsRaiseOpen(true); }}
            className="h-8 px-3 rounded-xl bg-[#F94001] hover:bg-[#D93600] text-white text-[12px] font-extrabold flex items-center gap-1 active-press shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]/70">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F94001]" />
            <span className="text-[10px] sm:text-[10.5px] font-black tracking-widest text-[#F94001] uppercase">
              PARTNER SUPPORT DESK
            </span>
          </div>
          <h1 className="text-[21px] sm:text-[26px] font-black text-[#021526] tracking-tight leading-tight">
            Support & Help Tickets
          </h1>
          <p className="text-[12px] sm:text-[13px] font-medium text-[#5F6368] mt-0.5">
            Raise payment disputes, booking issues, technical queries & operations help
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => { haptics.tap(); navigateTo('help_faq'); }}
            className="h-10 px-3.5 rounded-xl bg-white hover:bg-[#F3F4F4] border border-[#E5E7EB] text-[#021526] font-bold text-[13px] flex items-center justify-center gap-1.5 shadow-2xs active-press cursor-pointer transition-all"
          >
            <HelpCircle className="w-4 h-4 text-[#F94001]" />
            <span>Help & FAQ</span>
          </button>
          <button
            onClick={() => { haptics.tap(); setIsRaiseOpen(true); }}
            className="h-10 px-4 rounded-xl bg-[#F94001] hover:bg-[#D93600] text-white font-extrabold text-[13px] flex items-center justify-center gap-1.5 shadow-sm active-press cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Raise a Ticket</span>
          </button>
        </div>
      </div>

      {/* Stat Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#E5E7EB] shadow-2xs space-y-0.5">
          <span className="text-[10.5px] font-bold text-[#5F6368] uppercase tracking-wider block">Total Tickets</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[20px] sm:text-[24px] font-black text-[#021526]">{supportTickets.length}</span>
            <span className="text-[10.5px] font-semibold text-[#5F6368]">All time</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#E5E7EB] shadow-2xs space-y-0.5">
          <span className="text-[10.5px] font-bold text-[#F94001] uppercase tracking-wider block">Open</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[20px] sm:text-[24px] font-black text-[#F94001]">{openCount}</span>
            <span className="text-[10.5px] font-semibold text-[#5F6368]">Pending</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#E5E7EB] shadow-2xs space-y-0.5">
          <span className="text-[10.5px] font-bold text-[#2B7FFF] uppercase tracking-wider block">In Progress</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[20px] sm:text-[24px] font-black text-[#2B7FFF]">{inProgressCount}</span>
            <span className="text-[10.5px] font-semibold text-[#5F6368]">Being worked</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#E5E7EB] shadow-2xs space-y-0.5">
          <span className="text-[10.5px] font-bold text-[#15803D] uppercase tracking-wider block">Resolved</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[20px] sm:text-[24px] font-black text-[#15803D]">{resolvedCount}</span>
            <span className="text-[10.5px] font-semibold text-[#5F6368]">Closed</span>
          </div>
        </div>
      </div>

      {/* Tickets List + Right Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main List */}
        <div className="w-full lg:col-span-8 space-y-3.5">
          {/* Search & Filters */}
          <div className="space-y-2.5">
            <div className="relative flex items-center bg-white border border-[#E5E7EB] rounded-2xl px-3.5 py-2 shadow-2xs">
              <Search className="w-4 h-4 text-[#5F6368] mr-2.5 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ticket ID, subject or booking ID..."
                className="w-full text-[12.5px] font-medium text-[#021526] bg-transparent focus:outline-none placeholder-[#5F6368]"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="p-0.5 text-[#5F6368] hover:text-[#021526]">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              {[
                { id: 'all',         label: 'All Tickets',  Icon: Ticket },
                { id: 'Payment',     label: 'Payment',      Icon: CreditCard },
                { id: 'Booking',     label: 'Booking',      Icon: CalendarDays },
                { id: 'Technical',   label: 'Technical',    Icon: Wrench },
                { id: 'Settlements', label: 'Settlements',  Icon: Banknote },
                { id: 'General',     label: 'General',      Icon: LayoutList },
              ].map(({ id, label, Icon }) => {
                const isActive = categoryFilter === id;
                return (
                  <button
                    key={id}
                    onClick={() => { haptics.tap(); setCategoryFilter(id as CategoryFilter); }}
                    className={`h-8 px-3 rounded-xl text-[12px] font-bold whitespace-nowrap transition-all active-press cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#021526] text-white shadow-xs'
                        : 'bg-white text-[#5F6368] hover:text-[#021526] border border-[#E5E7EB]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#F94001]' : 'text-[#5F6368]'}`} />
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              {(['All', 'Open', 'In Progress', 'Resolved'] as StatusFilter[]).map((status) => {
                const isActive = statusFilter === status;
                return (
                  <button
                    key={status}
                    onClick={() => { haptics.tap(); setStatusFilter(status); }}
                    className={`h-6.5 px-2.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all active-press cursor-pointer ${
                      isActive
                        ? 'bg-[#FFF1EC] text-[#F94001] border border-[#F94001]/30 font-black shadow-2xs'
                        : 'bg-[#F3F4F4] text-[#5F6368] hover:text-[#021526] border border-[#E5E7EB]'
                    }`}
                  >
                    {status === 'All' ? 'All Statuses' : status}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tickets */}
          {filteredTickets.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E5E7EB] text-center space-y-3 shadow-2xs">
              <LifeBuoy className="w-9 h-9 text-[#5F6368] mx-auto stroke-[1.5]" />
              <h4 className="text-[14.5px] font-bold text-[#021526]">No tickets found</h4>
              <p className="text-[12px] text-[#5F6368] max-w-md mx-auto leading-relaxed">
                {searchQuery || categoryFilter !== 'all' || statusFilter !== 'All'
                  ? 'No tickets match the selected filters or search terms.'
                  : 'You have no active support tickets. Raise one if you need help!'}
              </p>
              <button
                onClick={() => { haptics.tap(); setIsRaiseOpen(true); }}
                className="mt-1 h-9 px-4 rounded-xl bg-[#F94001] text-white font-extrabold text-[12.5px] inline-flex items-center gap-1.5 shadow-xs active-press cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Raise a Ticket</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => { haptics.tap(); setSelectedTicket(ticket); }}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E7EB] shadow-2xs hover:border-[#D3D0C9] transition-all cursor-pointer active-press group space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11.5px] font-black text-[#021526] bg-[#F3F4F4] border border-[#E5E7EB] px-2 py-0.5 rounded-md">
                        #{ticket.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold flex items-center gap-1 ${getCategoryColor(ticket.category)}`}>
                        <LifeBuoy className="w-3 h-3" />
                        {ticket.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#5F6368] font-medium">{ticket.date || 'Today'}</span>
                      {getStatusBadge(ticket.status)}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[14px] sm:text-[14.5px] font-extrabold text-[#021526] group-hover:text-[#F94001] transition-colors leading-snug">
                      {ticket.subject}
                    </h4>
                    <p className="text-[12px] sm:text-[12.5px] text-[#5F6368] line-clamp-2 mt-1 leading-relaxed">
                      {ticket.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#F3F4F4] flex items-center justify-between text-[11px] text-[#5F6368]">
                    <div className="flex items-center gap-2.5">
                      {ticket.attachmentName && (
                        <span className="flex items-center gap-1 font-medium text-[#5F6368]">
                          <Paperclip className="w-3 h-3" />
                          <span className="truncate max-w-[120px] sm:max-w-none">{ticket.attachmentName}</span>
                        </span>
                      )}
                      {ticket.bookingId && (
                        <span className="flex items-center gap-1 font-semibold text-[#021526]">
                          <FileText className="w-3 h-3 text-[#F94001]" />
                          {ticket.bookingId}
                        </span>
                      )}
                      {ticket.priority && ticket.priority !== 'Low' && (
                        <span className={`font-bold text-[10.5px] ${ticket.priority === 'Urgent' ? 'text-red-600' : 'text-[#F94001]'}`}>
                          {ticket.priority} Priority
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-[#F94001] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      <span>Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel: Desktop Only */}
        <div className="hidden lg:block lg:col-span-4 space-y-4">
          {/* CTA Card */}
          <div className="bg-gradient-to-br from-[#021526] to-[#252422] rounded-3xl p-5 text-white shadow-sm space-y-3">
            <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#F94001] block">
              Partner Support Desk
            </span>
            <h4 className="text-[16px] font-black">Need help with a payment or booking issue?</h4>
            <p className="text-[12px] text-white/70 leading-relaxed">
              Submit a support ticket for UPI disputes, slot conflicts, settlement queries, or app technical issues. Our team responds within 15–30 minutes.
            </p>
            <button
              onClick={() => { haptics.tap(); setIsRaiseOpen(true); }}
              className="w-full h-10 rounded-xl bg-white hover:bg-neutral-100 text-[#021526] font-extrabold text-[13px] flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3] text-[#F94001]" />
              <span>Raise a Ticket</span>
            </button>
          </div>

          {/* Response SLAs */}
          <div className="bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-2xs space-y-3">
            <h4 className="text-[14px] font-extrabold text-[#021526] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#F94001]" />
              <span>Response Timeframes</span>
            </h4>
            <div className="space-y-2.5 text-[12px]">
              {[
                { label: 'Payment & UPI', time: '15–30 Mins', color: 'text-blue-600 bg-blue-50' },
                { label: 'Booking Conflicts', time: '15–30 Mins', color: 'text-purple-600 bg-purple-50' },
                { label: 'Settlements', time: '1–2 Hours', color: 'text-emerald-600 bg-emerald-50' },
                { label: 'Technical / App', time: '1–3 Hours', color: 'text-amber-600 bg-amber-50' },
                { label: 'General Queries', time: '30–60 Mins', color: 'text-slate-600 bg-slate-50' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-2 rounded-xl bg-[#F3F4F4] border border-[#E5E7EB]/60">
                  <span className="font-semibold text-[#021526]">{item.label}</span>
                  <span className={`font-mono font-bold px-2 py-0.5 rounded ${item.color}`}>{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hotline */}
          <div className="bg-[#F3F4F4] rounded-3xl p-5 border border-[#E5E7EB] space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F94001]/10 text-[#F94001] flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-[13.5px] font-extrabold text-[#021526]">Direct Partner Hotline</h5>
                <p className="text-[11px] text-[#5F6368]">Urgent issues · Available Mon–Sat, 8AM–10PM</p>
              </div>
            </div>
            <a
              href="tel:18002081010"
              className="w-full h-10 rounded-xl bg-white hover:bg-[#F3F4F4] border border-[#E5E7EB] text-[#021526] font-bold text-[12.5px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-[#F94001]" />
              <span>1800-208-1010</span>
            </a>
          </div>
        </div>
      </div>

      {/* Raise Ticket Modal */}
      <AnimatePresence>
        {isRaiseOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:py-6 sm:px-4 overflow-y-auto"
            style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) setIsRaiseOpen(false); }}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: 'spring', damping: 24, stiffness: 300 }}
              className="relative bg-[#F3F4F4] w-full sm:max-w-xl rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-[#E5E7EB] overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-[#E5E7EB] rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 pt-3 pb-4 border-b border-[#E5E7EB] bg-white shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#F94001]/10 text-[#F94001] flex items-center justify-center">
                    <LifeBuoy className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-[16px] font-black text-[#021526]">Raise a Support Ticket</h2>
                    <p className="text-[11px] text-[#5F6368]">Our desk responds within 15–30 minutes</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsRaiseOpen(false)}
                  className="w-8 h-8 rounded-xl bg-[#F3F4F4] hover:bg-[#EBE9E3] border border-[#E5E7EB] flex items-center justify-center text-[#5F6368] hover:text-[#021526] transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleRaiseSubmit} className="flex-1 overflow-y-auto px-5 py-5 space-y-4 overscroll-contain">
                {/* Category */}
                <div>
                  <label className="block text-[12px] font-bold text-[#021526] mb-2">Support Category</label>
                  <div className="flex flex-wrap gap-2">
                    {supportCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormCategory(cat)}
                        className={`h-8 px-3.5 rounded-full text-[12px] font-bold transition-all active-press cursor-pointer ${
                          formCategory === cat
                            ? 'bg-[#FFF1EC] text-[#F94001] border border-[#F94001]/40 font-black shadow-2xs'
                            : 'bg-white text-[#5F6368] border border-[#E5E7EB]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-[12px] font-bold text-[#021526] mb-2">Priority Level</label>
                  <div className="flex gap-2">
                    {(['Low', 'High', 'Urgent'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setFormPriority(p)}
                        className={`flex-1 h-9 rounded-xl text-[12px] font-bold transition-all border cursor-pointer ${
                          formPriority === p
                            ? p === 'Urgent'
                              ? 'bg-red-50 text-red-600 border-red-300 font-black'
                              : 'bg-[#FFF1EC] text-[#F94001] border border-[#F94001]/40 font-black'
                            : 'bg-white text-[#5F6368] border-[#E5E7EB] hover:text-[#021526]'
                        }`}
                      >
                        {p === 'Low' ? 'Normal' : p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-[12px] font-bold text-[#021526] mb-1.5">Subject <span className="text-[#F94001]">*</span></label>
                  <div className="bg-[#F3F4F4] border border-[#E5E7EB] rounded-[14px] px-3.5 py-3 focus-within:border-[#021526] focus-within:bg-white transition-all">
                    <input
                      type="text"
                      required
                      value={formSubject}
                      onChange={(e) => setFormSubject(e.target.value)}
                      placeholder="e.g. Customer UPI debited but booking still pending"
                      className="w-full text-[13.5px] font-semibold text-[#021526] bg-transparent focus:outline-none placeholder-[#5F6368]"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[12px] font-bold text-[#021526] mb-1.5">Description <span className="text-[#F94001]">*</span></label>
                  <div className="bg-[#F3F4F4] border border-[#E5E7EB] rounded-[14px] p-3.5 focus-within:border-[#021526] focus-within:bg-white transition-all">
                    <textarea
                      rows={3}
                      required
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Describe the issue in detail — include booking ID, time, amounts or error messages..."
                      className="w-full text-[13px] font-medium text-[#021526] bg-transparent focus:outline-none placeholder-[#5F6368] resize-none"
                    />
                  </div>
                </div>

                {/* Booking ID (optional) */}
                <div>
                  <label className="block text-[12px] font-bold text-[#021526] mb-1.5">Booking ID <span className="text-[10.5px] text-[#5F6368] font-normal">(Optional)</span></label>
                  <div className="bg-[#F3F4F4] border border-[#E5E7EB] rounded-[14px] px-3.5 py-2.5 focus-within:border-[#021526] focus-within:bg-white transition-all">
                    <input
                      type="text"
                      value={formBookingId}
                      onChange={(e) => setFormBookingId(e.target.value)}
                      placeholder="e.g. BK10231"
                      className="w-full text-[13px] font-semibold text-[#021526] bg-transparent focus:outline-none placeholder-[#5F6368]"
                    />
                  </div>
                </div>

                {/* Attachment */}
                <div>
                  <label className="block text-[12px] font-bold text-[#021526] mb-1.5">
                    Attach Screenshot / Receipt <span className="text-[10.5px] text-[#5F6368] font-normal">(Optional)</span>
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const dropped = e.dataTransfer.files?.[0];
                      if (dropped) {
                        const fakeEvent = { target: { files: [dropped] } } as any;
                        handleFileChange(fakeEvent);
                      }
                    }}
                    className={`border-2 border-dashed rounded-2xl p-3.5 text-center cursor-pointer transition-all ${
                      attachedFile
                        ? 'border-[#16A34A] bg-[#16A34A]/5'
                        : 'border-[#E5E7EB] bg-[#F3F4F4] hover:border-[#021526]'
                    }`}
                  >
                    {attachedFile ? (
                      <div className="flex items-center justify-between gap-3 text-left">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {attachedPreview ? (
                            <img
                              src={attachedPreview}
                              alt="Attachment preview"
                              className="w-10 h-10 rounded-lg object-cover border border-[#16A34A]/30 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-[12.5px] font-bold text-[#021526] truncate">{attachedFile.name}</p>
                            <p className="text-[11px] font-semibold text-[#16A34A] flex items-center gap-1 mt-0.5">
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>Attached &bull; {formatFileSize(attachedFile.size)}</span>
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-rose-50 border border-[#E5E7EB] hover:border-rose-200 text-[#5F6368] hover:text-rose-600 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                          title="Remove attached file"
                        >
                          <X className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1 py-1">
                        <Upload className="w-5 h-5 text-[#5F6368] mx-auto" />
                        <p className="text-[12.5px] font-bold text-[#021526]">Click or drag to upload screenshot or receipt</p>
                        <p className="text-[10.5px] text-[#5F6368]">PNG, JPG, WEBP, PDF up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-1">
                  <button
                    type="submit"
                    className="w-full h-12 rounded-2xl bg-[#F94001] text-white font-extrabold text-[14px] flex items-center justify-center gap-2 shadow-md hover:bg-[#D93600] active-press transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    Submit Support Ticket
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ticket Details Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full border border-[#E5E7EB] shadow-2xl space-y-4 p-5 sm:p-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11.5px] font-black text-[#021526] bg-[#F3F4F4] border border-[#E5E7EB] px-2 py-0.5 rounded-md">
                      #{selectedTicket.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold ${getCategoryColor(selectedTicket.category)}`}>
                      {selectedTicket.category}
                    </span>
                  </div>
                  <h3 className="text-[15px] font-black text-[#021526] mt-1.5 leading-snug">{selectedTicket.subject}</h3>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="w-8 h-8 rounded-full bg-[#F3F4F4] border border-[#E5E7EB] flex items-center justify-center text-[#5F6368] hover:text-[#021526] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status Row */}
              <div className="bg-[#F3F4F4] rounded-2xl p-3.5 border border-[#E5E7EB] flex flex-wrap items-center justify-between gap-2.5">
                <div>
                  <span className="text-[10.5px] font-bold text-[#5F6368] block">Status</span>
                  <div className="mt-0.5">{getStatusBadge(selectedTicket.status)}</div>
                </div>
                <div>
                  <span className="text-[10.5px] font-bold text-[#5F6368] block">Date</span>
                  <span className="text-[12px] font-bold text-[#021526]">{selectedTicket.date || 'Today'}</span>
                </div>
                {selectedTicket.priority && (
                  <div>
                    <span className="text-[10.5px] font-bold text-[#5F6368] block">Priority</span>
                    <span className={`text-[11.5px] font-extrabold ${selectedTicket.priority === 'Urgent' ? 'text-red-600' : 'text-[#F94001]'}`}>
                      {selectedTicket.priority}
                    </span>
                  </div>
                )}
                {selectedTicket.bookingId && (
                  <div>
                    <span className="text-[10.5px] font-bold text-[#5F6368] block">Booking</span>
                    <span className="text-[11.5px] font-black text-[#021526]">{selectedTicket.bookingId}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#5F6368]">Issue Description</span>
                <div className="p-3.5 rounded-2xl bg-[#F3F4F4] border border-[#E5E7EB] text-[13px] font-medium text-[#021526] leading-relaxed">
                  {selectedTicket.description}
                </div>
              </div>

              {/* Attachment */}
              {selectedTicket.attachmentName && (
                <div className="p-3 rounded-2xl bg-[#F3F4F4] border border-[#E5E7EB] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-[#5F6368]" />
                    <span className="text-[12.5px] font-bold text-[#021526]">{selectedTicket.attachmentName}</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#16A34A] bg-[#16A34A]/10 px-2.5 py-1 rounded-lg">Attached</span>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex justify-end pt-2 border-t border-[#E5E7EB]">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="h-10 px-6 rounded-xl bg-[#021526] hover:bg-[#061D33] text-white font-bold text-[13px] active-press cursor-pointer transition-colors shadow-xs"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
