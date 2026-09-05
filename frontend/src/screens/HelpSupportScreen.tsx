import React, { useState } from 'react';
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
} from 'lucide-react';
import { SupportTicket, SupportCategory } from '../types';
import { haptics } from '../utils/haptics';
import { motion, AnimatePresence } from 'motion/react';

export const HelpSupportScreen: React.FC = () => {
  const { supportTickets, addSupportTicket, goBack, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // Ticket modal form fields
  const [category, setCategory] = useState<SupportCategory>('Payment');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'Normal' | 'High' | 'Urgent'>('Normal');

  const faqs = [
    {
      q: 'How are UPI balance collections settled into my bank?',
      a: 'All online and dynamic QR balance collections are settled automatically via T+0 direct IMPS payout to your linked HDFC account every midnight.',
    },
    {
      q: 'What happens when a held slot timer expires?',
      a: 'If a customer does not complete payment within 15 minutes, the slot is automatically released back to public availability unless manually locked.',
    },
    {
      q: 'Can I add a custom court with multi-sport markings?',
      a: 'Yes! When adding or editing a court, select multiple sports (e.g. Football + Box Cricket) so the booking calendar reflects both.',
    },
    {
      q: 'How do I block multiple slots for annual monsoon turf maintenance?',
      a: 'Use the "+ Block Slot" tool in the Slots tab, select Maintenance, choose the date range and mark the whole ground closed.',
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: SupportTicket['status']) => {
    if (status === 'Resolved') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#2FA66A]/15 text-[#1E774A] flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Resolved
        </span>
      );
    }
    if (status === 'In Progress') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FF6B2C]/15 text-[#FF6B2C] flex items-center gap-1">
          <Clock className="w-3 h-3" />
          In Progress
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E7A72F]/15 text-[#B87C0D] flex items-center gap-1">
        <Clock className="w-3 h-3" />
        Under Review
      </span>
    );
  };

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

  return (
    <div className="pb-20 pt-2 w-full space-y-6 select-none">
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E6E1]/70">
        <div>
          <h1 className="text-[24px] font-black text-[#171717] tracking-tight">Help Desk & Support</h1>
          <p className="text-[12.5px] font-medium text-[#777570]">
            Operational knowledge base, priority partner hotline & support tickets
          </p>
        </div>

        <button
          onClick={() => {
            haptics.tap();
            setIsTicketModalOpen(true);
          }}
          className="h-10 px-4 rounded-xl bg-[#FF6B2C] hover:bg-[#e85b1e] text-white font-extrabold text-[13px] flex items-center justify-center gap-1.5 shadow-sm active-press cursor-pointer transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Raise Support Ticket</span>
        </button>
      </div>

      {/* Emergency Hotline Banner */}
      <div className="bg-[#171717] text-white rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
            <Phone className="w-6 h-6 text-[#FF6B2C]" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#A3A099] uppercase tracking-wider block">
              Dedicated TurfTown Partner Desk
            </span>
            <h3 className="text-[18px] font-black text-white mt-0.5">
              Toll-Free Priority Hotline (6:00 AM – 11:00 PM)
            </h3>
            <p className="text-[12.5px] text-white/65 mt-0.5">
              Immediate assistance for payment gateway reconciliations & urgent slot disputes
            </p>
          </div>
        </div>

        <a
          href="tel:18002081010"
          className="h-11 px-5 bg-[#FF6B2C] hover:bg-[#e85b1e] text-white rounded-xl text-[13px] font-extrabold flex items-center justify-center gap-2 active-press shadow-sm transition-colors shrink-0"
        >
          <Phone className="w-4 h-4" />
          <span>Call 1800-208-1010</span>
        </a>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: FAQ Section */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-black text-[#171717] uppercase tracking-wider">
              Frequently Asked Questions
            </h2>
          </div>

          {/* Search FAQs */}
          <div className="relative flex items-center bg-white border border-[#E8E6E1] rounded-2xl px-3.5 py-2.5 shadow-2xs">
            <Search className="w-4 h-4 text-[#777570] mr-2.5 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search help articles (e.g. payouts, multi-court, hold timers)..."
              className="w-full text-[13px] font-medium text-[#171717] bg-transparent focus:outline-none placeholder-[#A3A099]"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="text-[#777570] hover:text-[#171717]">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* FAQ List */}
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

        {/* Right Column: Support Tickets History */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-black text-[#171717] uppercase tracking-wider">
              Recent Support Tickets ({supportTickets.length})
            </h2>
          </div>

          {supportTickets.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-[#E8E6E1] text-center space-y-2 shadow-2xs">
              <MessageSquare className="w-8 h-8 text-[#A3A099] mx-auto" />
              <p className="text-[13.5px] font-bold text-[#171717]">No active tickets</p>
              <p className="text-[12px] text-[#777570]">
                Need help with your arena setup? Raise a ticket to connect with our operations team.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {supportTickets.map((t) => (
                <div
                  key={t.id}
                  className="bg-white rounded-2xl p-4 border border-[#E8E6E1] shadow-2xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11.5px] font-mono font-bold text-[#FF6B2C]">{t.id}</span>
                    {getStatusBadge(t.status)}
                  </div>
                  <h4 className="text-[13.5px] font-extrabold text-[#171717]">{t.subject}</h4>
                  <p className="text-[12px] text-[#777570] line-clamp-2">{t.description}</p>
                  <p className="text-[10.5px] font-semibold text-[#A3A099] pt-1 border-t border-[#F1F0EC]">
                    Submitted on {t.date}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Minimal Support Ticket Popup Modal */}
      <AnimatePresence>
        {isTicketModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-xs select-none">
            <div className="absolute inset-0" onClick={() => setIsTicketModalOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-full max-h-[92vh] md:max-w-lg md:rounded-3xl overflow-y-auto no-scrollbar bg-white rounded-t-3xl p-5 pb-6 shadow-2xl border border-[#E8E6E1]"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F0EC]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FF6B2C]/10 text-[#FF6B2C] flex items-center justify-center">
                    <LifeBuoy className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-[17px] font-black text-[#171717] tracking-tight">
                      Raise Support Ticket
                    </h2>
                    <p className="text-[11.5px] text-[#777570] font-medium">
                      TurfTown operations desk responds within 30 mins
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsTicketModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#F1F0EC] flex items-center justify-center text-[#777570] hover:text-[#171717] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleTicketSubmit} className="py-3 space-y-3.5">
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
                            ? 'bg-[#171717] text-white border-[#171717] shadow-xs'
                            : 'bg-[#FAF9F6] text-[#777570] border-[#E8E6E1] hover:text-[#171717]'
                        }`}
                      >
                        {cat === 'Payment'
                          ? 'Payments & Payouts'
                          : cat === 'Booking'
                          ? 'Booking & Slots'
                          : cat === 'Court'
                          ? 'Court Verification'
                          : cat === 'Technical'
                          ? 'App / QR Scanner'
                          : 'General Inquiry'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority / Urgency */}
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
                    placeholder="e.g. Customer UPI debited but marked pending on Turf 1"
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-[13px] font-bold text-[#171717] focus:outline-none focus:border-[#171717]"
                  />
                </div>

                {/* Detailed Description */}
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
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl p-3 text-[12.5px] font-medium text-[#171717] focus:outline-none focus:border-[#171717] resize-none"
                  />
                </div>

                {/* Quick Notice Strip */}
                <div className="bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl p-2.5 text-[11px] text-[#777570] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2FA66A] shrink-0" />
                  <span>Your venue ID and contact details are automatically attached.</span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full h-11 bg-[#FF6B2C] hover:bg-[#e85b1e] text-white font-black text-[13px] rounded-xl flex items-center justify-center gap-1.5 shadow-sm active-press cursor-pointer transition-all mt-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Submit Support Ticket</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
