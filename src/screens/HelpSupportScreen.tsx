import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ChevronLeft,
  Search,
  Plus,
  HelpCircle,
  MessageSquare,
  CheckCircle2,
  Clock,
  ChevronRight,
  Phone,
  FileText,
} from 'lucide-react';
import { SupportTicket } from '../types';

export const HelpSupportScreen: React.FC = () => {
  const { supportTickets, navigateTo, goBack } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

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
      a: 'Use the "+ Block/Reserve" tool in the Slots tab, select Maintenance, choose the date range and mark the whole ground closed.',
    },
  ];

  const getStatusBadge = (status: SupportTicket['status']) => {
    if (status === 'Resolved') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#16A34A]/15 text-[#15803D] flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Resolved
        </span>
      );
    }
    if (status === 'In Progress') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F94001]/15 text-[#F94001] flex items-center gap-1">
          <Clock className="w-3 h-3" />
          In Progress
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F59E0B]/15 text-[#B87C0D] flex items-center gap-1">
        <Clock className="w-3 h-3" />
        Under Review
      </span>
    );
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-md mx-auto space-y-5">
      {/* Header & + Raise Ticket */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={goBack}
            className="w-10 h-10 -ml-2 rounded-xl flex items-center justify-center text-[#021526] hover:bg-[#E5E7EB]/50 active-press"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
          </button>
          <h1 className="text-[22px] font-bold text-[#021526]">Help & Support</h1>
        </div>

        <button
          onClick={() => navigateTo('support_form')}
          className="h-9 px-3 rounded-xl bg-[#F94001] text-white font-bold text-[12px] flex items-center gap-1 shadow-xs hover:bg-[#D93600] active-press"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Raise Ticket</span>
        </button>
      </div>

      {/* Emergency Hotline Banner */}
      <div className="bg-[#021526] text-white rounded-2xl p-4 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-[#5F6368] uppercase tracking-wider">
            Dedicated Partner Desk
          </span>
          <p className="text-[14px] font-bold mt-0.5">Priority Support (6 AM – 11 PM)</p>
        </div>
        <a
          href="tel:18002081010"
          className="px-3.5 py-2 bg-[#F94001] text-white rounded-xl text-[12px] font-bold flex items-center gap-1.5 active-press shadow-xs"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Call Partner Desk</span>
        </a>
      </div>

      {/* Your Support Tickets */}
      <div className="space-y-3">
        <h2 className="text-[15px] font-bold text-[#021526]">Your Support Tickets</h2>

        <div className="space-y-2.5">
          {supportTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold font-mono text-[#5F6368]">
                    {ticket.id}
                  </span>
                  <span className="text-[11px] font-bold text-[#F94001] bg-[#F94001]/10 px-2 py-0.5 rounded-full">
                    {ticket.category}
                  </span>
                </div>
                {getStatusBadge(ticket.status)}
              </div>

              <h3 className="text-[14px] font-bold text-[#021526]">{ticket.subject}</h3>
              <p className="text-[12px] text-[#5F6368] leading-relaxed">{ticket.description}</p>
              <span className="text-[10px] text-[#5F6368] block pt-1 border-t border-[#F3F4F4]">
                Updated {ticket.createdAt}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* FAQs Accordion */}
      <div className="space-y-3 pt-2">
        <h2 className="text-[15px] font-bold text-[#021526]">Frequently Asked Questions</h2>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs divide-y divide-[#F3F4F4] overflow-hidden">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-3.5">
              <button
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="w-full text-left flex items-center justify-between gap-2"
              >
                <span className="text-[13px] font-bold text-[#021526]">{faq.q}</span>
                <ChevronRight
                  className={`w-4 h-4 text-[#5F6368] transition-transform ${
                    expandedFaq === idx ? 'rotate-90 text-[#F94001]' : ''
                  }`}
                />
              </button>
              {expandedFaq === idx && (
                <p className="text-[12px] text-[#5F6368] mt-2 leading-relaxed pt-2 border-t border-[#F3F4F4]">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* App Version Stamp */}
      <div className="pt-2 pb-6 text-center space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E5E7EB] text-[#5F6368] text-[11px] font-bold shadow-2xs">
          <span className="text-[#021526]">TurfTown Partner</span>
          <span className="w-1 h-1 rounded-full bg-[#E5E7EB]" />
          <span className="text-[#16A34A] font-extrabold">v2.4.0</span>
          <span className="w-1 h-1 rounded-full bg-[#E5E7EB]" />
          <span className="text-[#5F6368] font-medium">Build 2026.08.29</span>
        </div>
        <p className="text-[10px] text-[#5F6368]">
          Ground Management & Real-time Booking Engine
        </p>
      </div>
    </div>
  );
};
