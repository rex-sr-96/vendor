import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  ChevronDown,
  ChevronLeft,
  X,
  Phone,
  HelpCircle,
  BookOpen,
  LifeBuoy,
  CreditCard,
  Clock,
  Building2,
  ShieldCheck,
  ThumbsUp,
  ArrowRight,
} from 'lucide-react';
import { haptics } from '../utils/haptics';
import { motion, AnimatePresence } from 'motion/react';

interface FAQItem {
  id: string;
  category: 'bookings' | 'payments' | 'courts' | 'cancellations' | 'staff';
  categoryLabel: string;
  question: string;
  answer: string;
  tags: string[];
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'payments',
    categoryLabel: 'Payments & Payouts',
    question: 'How are UPI and online collections settled into my bank account?',
    answer:
      'All online and dynamic QR balance collections are aggregated daily and settled automatically via T+0 direct IMPS payout to your linked verified bank account every midnight. You can also trigger an instant on-demand settlement payout from the Payments & Payouts tab at any time.',
    tags: ['payout', 'settlement', 'bank', 'upi', 'imps', 'money'],
  },
  {
    id: 'faq-2',
    category: 'payments',
    categoryLabel: 'Payments & Payouts',
    question: 'What happens if a customer payment fails or debits without confirmation?',
    answer:
      'If a customer’s UPI app debits money but the slot remains pending, verify whether the UTR appears under Payments → Recent Transactions. If confirmed, tap "Mark Paid". If unrecorded, our automated reconciliation engine releases pending holds within 15 minutes, and banks initiate an auto-refund within 24–48 hours.',
    tags: ['failed', 'debit', 'pending', 'utr', 'refund', 'payment'],
  },
  {
    id: 'faq-3',
    category: 'courts',
    categoryLabel: 'Courts & Slots',
    question: 'How does the slot hold timer work for pending online payments?',
    answer:
      'When you send a payment link to a customer or reserve a slot over the phone, the system puts a 15-minute hold on that slot. During this window, no other customer can book it. If payment is not completed within 15 minutes, the slot automatically releases back to the public pool unless manually extended or locked.',
    tags: ['hold', 'timer', 'lock', 'release', '15 minutes', 'reservation'],
  },
  {
    id: 'faq-4',
    category: 'courts',
    categoryLabel: 'Courts & Slots',
    question: 'Can I add a multi-sport court with shared physical turf markings?',
    answer:
      'Yes! When adding or editing a court, select multiple sports (such as Football and Box Cricket). You can also configure peak-hour pricing, custom weekend rates, and specify whether same-physical turf slots should lock automatically when booked for one sport.',
    tags: ['multi-sport', 'pitch', 'court', 'pricing', 'cricket', 'football'],
  },
  {
    id: 'faq-5',
    category: 'bookings',
    categoryLabel: 'Bookings & Check-in',
    question: 'How do I extend an active playing slot if players want more time?',
    answer:
      'Navigate to Bookings or Slots Matrix, tap the active booking card, and click the "+ Extend Slot" button. Select your extension duration (15m, 30m, 45m, or 60m), and the system will calculate the pro-rated fee and update the schedule seamlessly.',
    tags: ['extend', 'duration', 'extra time', 'timeline', 'slot extension'],
  },
  {
    id: 'faq-6',
    category: 'cancellations',
    categoryLabel: 'Cancellations & Refunds',
    question: 'What is the standard cancellation and refund policy workflow?',
    answer:
      'You can customize your venue cancellation rules under Refund & Policies. By default, cancellations made 4+ hours before the slot receive a 100% refund or wallet credit. Cancellations within 2–4 hours incur a 50% late cancellation fee, and under 2 hours are non-refundable.',
    tags: ['cancel', 'cancellation', 'refund', 'policy', 'wallet', 'reschedule'],
  },
  {
    id: 'faq-7',
    category: 'courts',
    categoryLabel: 'Courts & Slots',
    question: 'How do I block multiple courts for monsoon weather or turf maintenance?',
    answer:
      'In the Slots tab, click "+ Block Slot", select the "Maintenance" or "Owner Block" category, pick your target courts, and specify the date range. The system immediately marks the courts unavailable across all player discovery apps.',
    tags: ['maintenance', 'block', 'monsoon', 'rain', 'repair', 'owner lock'],
  },
  {
    id: 'faq-8',
    category: 'staff',
    categoryLabel: 'Staff & Security',
    question: 'Can I restrict staff members from viewing venue financial analytics?',
    answer:
      'Yes. Go to Staff & Roles management, select the staff member profile, and toggle off the "View Financials" permission. You can individually grant or revoke Cash Collection, Slot Blocking, and Pricing Edit rights.',
    tags: ['staff', 'permission', 'roles', 'cashier', 'manager', 'security'],
  },
];

const QUICK_GUIDES = [
  {
    title: 'Instant Payouts & Settling',
    category: 'Finance',
    icon: CreditCard,
    color: 'bg-emerald-500/10 text-emerald-600',
    desc: 'Understand T+0 midnight IMPS auto-settlements and on-demand transfers.',
  },
  {
    title: 'Slot Extension Rules',
    category: 'Operations',
    icon: Clock,
    color: 'bg-amber-500/10 text-amber-600',
    desc: 'Pro-rate pricing & extend live matches without slot collisions.',
  },
  {
    title: 'Multi-Sport Turf Configuration',
    category: 'Courts',
    icon: Building2,
    color: 'bg-blue-500/10 text-blue-600',
    desc: 'Configure shared synthetic pitches for Football, Cricket, and Futsal.',
  },
  {
    title: 'Emergency Pitch Locking',
    category: 'Maintenance',
    icon: ShieldCheck,
    color: 'bg-rose-500/10 text-rose-600',
    desc: 'Block courts instantly for weather, tournaments, or turf repairs.',
  },
];

export const HelpFAQScreen: React.FC = () => {
  const { navigateTo, goBack, showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq-1');
  const [helpfulFeedback, setHelpfulFeedback] = useState<Record<string, boolean>>({});
  const [faqList, setFaqList] = useState<FAQItem[]>(FAQ_DATA);

  useEffect(() => {
    let isMounted = true;
    async function loadCmsFaqs() {
      try {
        const res = await fetch('http://localhost:4000/api/v1/cms/public/vendor-faq');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data && Array.isArray(data.faqs) && data.faqs.length > 0) {
            const mapped: FAQItem[] = data.faqs.map((f: any) => ({
              id: f.id,
              category: f.category,
              categoryLabel: f.category_label || f.category,
              question: f.question,
              answer: f.answer,
              tags: Array.isArray(f.tags) ? f.tags : [],
            }));
            setFaqList(mapped);
          }
        }
      } catch {
        // Safe fallback to FAQ_DATA
      }
    }
    loadCmsFaqs();
    return () => {
      isMounted = false;
    };
  }, []);

  const categories = [
    { id: 'all', label: 'All Topics' },
    { id: 'bookings', label: 'Bookings & Check-in' },
    { id: 'payments', label: 'Payments & Payouts' },
    { id: 'courts', label: 'Courts & Slots' },
    { id: 'cancellations', label: 'Refunds & Policy' },
    { id: 'staff', label: 'Staff & Roles' },
  ];

  const filteredFaqs = useMemo(() => {
    return faqList.filter((faq) => {
      const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesSearch =
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q) ||
        faq.tags.some((tag) => tag.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [faqList, searchQuery, activeCategory]);

  const handleHelpfulClick = (faqId: string) => {
    haptics.tap();
    setHelpfulFeedback((prev) => ({ ...prev, [faqId]: !prev[faqId] }));
    showToast('Feedback Received', 'Thank you for helping us improve our guides!', 'success');
  };

  return (
    <div className="pb-24 pt-2 w-full space-y-6 select-none max-w-6xl mx-auto">
      {/* Top Mobile Bar */}
      <div className="flex items-center justify-between gap-2 pb-1 md:hidden">
        <button
          onClick={() => {
            haptics.tap();
            goBack();
          }}
          className="flex items-center gap-1.5 text-[13px] font-bold text-[#F94001] active-press cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Back</span>
        </button>

        <button
          onClick={() => {
            haptics.tap();
            navigateTo('support');
          }}
          className="h-8 px-3 rounded-lg bg-[#F94001]/10 text-[#F94001] text-[12px] font-extrabold flex items-center gap-1 active-press"
        >
          <LifeBuoy className="w-3.5 h-3.5" />
          <span>Support Desk</span>
        </button>
      </div>

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E7EB]/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F94001]/10 text-[#F94001] uppercase tracking-wider">
              Knowledge Base
            </span>
          </div>
          <h1 className="text-[26px] font-black text-[#021526] tracking-tight mt-1">
            Help & Frequently Asked Questions
          </h1>
          <p className="text-[13px] font-medium text-[#5F6368]">
            Operational guides, payment settlement rules, court setups, and self-serve tutorials
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              haptics.tap();
              navigateTo('support');
            }}
            className="h-10 px-4 rounded-xl bg-[#021526] hover:bg-[#061D33] text-white font-extrabold text-[13px] flex items-center justify-center gap-2 shadow-sm active-press cursor-pointer transition-all"
          >
            <LifeBuoy className="w-4 h-4 text-[#F94001]" />
            <span>Open Support Desk</span>
          </button>
        </div>
      </div>

      {/* Search Input Hero */}
      <div className="relative bg-gradient-to-br from-[#021526] to-[#252422] rounded-3xl p-6 md:p-8 text-white shadow-sm overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="text-[11px] font-extrabold tracking-wider uppercase text-[#F94001] block">
            Instant Answers
          </span>
          <h2 className="text-[20px] md:text-[24px] font-black mt-1">
            How can we help you manage your arena today?
          </h2>
          <p className="text-[13px] text-white/70 mt-1 mb-5">
            Search answers on refunds, payouts, court schedules, or slot holds.
          </p>

          <div className="relative flex items-center bg-white rounded-2xl px-4 py-3 shadow-md focus-within:ring-2 focus-within:ring-[#F94001]">
            <Search className="w-5 h-5 text-[#5F6368] mr-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides (e.g. UPI payout, slot timer, extend slot, rain block)..."
              className="w-full text-[14px] font-semibold text-[#021526] bg-transparent focus:outline-none placeholder-[#5F6368]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 rounded-full text-[#5F6368] hover:text-[#021526] hover:bg-[#F3F4F4] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Decorative background blob */}
        <div className="absolute right-[-40px] bottom-[-40px] w-64 h-64 rounded-full bg-[#F94001]/10 blur-2xl pointer-events-none" />
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                haptics.tap();
                setActiveCategory(cat.id);
              }}
              className={`h-9 px-4 rounded-xl text-[12.5px] font-bold whitespace-nowrap transition-all active-press cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#FFF1EC] text-[#F94001] border border-[#F94001]/40 font-black shadow-2xs'
                  : 'bg-white text-[#5F6368] hover:text-[#021526] border border-[#E5E7EB] hover:bg-[#F3F4F4]'
              }`}
            >
              <span>{cat.label}</span>
              {cat.id !== 'all' && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-[#F94001]/15 text-[#F94001]' : 'bg-[#F3F4F4] text-[#5F6368]'
                  }`}
                >
                  {FAQ_DATA.filter((f) => f.category === cat.id).length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Content Layout: FAQs (Left) + Quick Help & Assistance (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: FAQ Accordion List */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-[14px] font-black text-[#021526] uppercase tracking-wider">
              {activeCategory === 'all'
                ? `All Articles & FAQs (${filteredFaqs.length})`
                : `${categories.find((c) => c.id === activeCategory)?.label} (${filteredFaqs.length})`}
            </h3>

            {searchQuery && (
              <span className="text-[12px] font-medium text-[#5F6368]">
                Showing results for &ldquo;<span className="font-bold text-[#021526]">{searchQuery}</span>&rdquo;
              </span>
            )}
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-[#E5E7EB] text-center space-y-3 shadow-2xs">
              <HelpCircle className="w-10 h-10 text-[#5F6368] mx-auto stroke-[1.5]" />
              <h4 className="text-[15px] font-bold text-[#021526]">No articles matched your search</h4>
              <p className="text-[12.5px] text-[#5F6368] max-w-md mx-auto">
                Couldn&apos;t find an answer to &ldquo;{searchQuery}&rdquo;? Raise a ticket with our 24/7 Operations Desk for personalized support.
              </p>
              <button
                onClick={() => {
                  haptics.tap();
                  navigateTo('support');
                }}
                className="mt-2 h-10 px-5 rounded-xl bg-[#F94001] text-white font-extrabold text-[13px] inline-flex items-center gap-2 shadow-xs active-press"
              >
                <LifeBuoy className="w-4 h-4" />
                <span>Contact Support Desk</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((faq) => {
                const isExpanded = expandedFaqId === faq.id;
                const isHelpful = helpfulFeedback[faq.id];

                return (
                  <div
                    key={faq.id}
                    className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-2xs transition-all hover:border-[#D3D0C9]"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        haptics.tap();
                        setExpandedFaqId(isExpanded ? null : faq.id);
                      }}
                      className="w-full p-4 md:p-5 text-left flex items-start justify-between gap-3 hover:bg-[#F3F4F4] transition-colors cursor-pointer"
                    >
                      <div className="space-y-1">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-[#F3F4F4] text-[#5F6368]">
                          {faq.categoryLabel}
                        </span>
                        <h4 className="text-[14px] md:text-[14.5px] font-extrabold text-[#021526] leading-snug">
                          {faq.question}
                        </h4>
                      </div>

                      <div
                        className={`w-7 h-7 rounded-lg bg-[#F3F4F4] border border-[#E5E7EB] flex items-center justify-center shrink-0 transition-transform duration-200 mt-1 ${
                          isExpanded ? 'rotate-180 bg-[#F94001]/10 border-[#F94001]/30 text-[#F94001]' : 'text-[#5F6368]'
                        }`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 md:px-5 pb-5 pt-2 text-[13.5px] text-[#44423E] leading-relaxed border-t border-[#F3F4F4] bg-[#F3F4F4]/60">
                            <div
                              className="prose prose-sm max-w-none text-[13.5px] text-[#44423E] leading-relaxed [&_p]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                              dangerouslySetInnerHTML={{ __html: faq.answer }}
                            />

                            {/* Tags + Helpful button */}
                            <div className="mt-4 pt-3 border-t border-[#E5E7EB]/60 flex flex-wrap items-center justify-between gap-2">
                              <div className="flex flex-wrap gap-1.5">
                                {faq.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-0.5 rounded text-[11px] font-medium bg-white text-[#5F6368] border border-[#E5E7EB]"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>

                              <button
                                onClick={() => handleHelpfulClick(faq.id)}
                                className={`px-2.5 py-1 rounded-lg text-[11.5px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                  isHelpful
                                    ? 'bg-[#16A34A]/15 text-[#15803D]'
                                    : 'bg-white text-[#5F6368] hover:text-[#021526] border border-[#E5E7EB]'
                                }`}
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                                <span>{isHelpful ? 'Helpful' : 'Was this helpful?'}</span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Quick Guides & Support Contact Card */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quick Guides Card */}
          <div className="bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-2xs space-y-3.5">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#F94001]" />
              <h3 className="text-[14px] font-black text-[#021526] uppercase tracking-wider">
                Popular Quick Guides
              </h3>
            </div>

            <div className="space-y-2.5">
              {QUICK_GUIDES.map((guide) => {
                const Icon = guide.icon;
                return (
                  <div
                    key={guide.title}
                    className="p-3 rounded-2xl bg-[#F3F4F4] border border-[#E5E7EB]/70 hover:border-[#D3D0C9] transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`w-8 h-8 rounded-xl ${guide.color} flex items-center justify-center shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <h5 className="text-[12.5px] font-extrabold text-[#021526] group-hover:text-[#F94001] transition-colors">
                          {guide.title}
                        </h5>
                        <p className="text-[11px] text-[#5F6368] leading-snug">
                          {guide.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dedicated Support Ticket Card */}
          <div className="bg-gradient-to-br from-[#FFF8F4] to-white rounded-3xl p-5 border border-[#F94001]/25 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F94001]/10 text-[#F94001] flex items-center justify-center">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[15px] font-black text-[#021526]">Need Personalized Support?</h4>
              <p className="text-[12px] text-[#5F6368] mt-1 leading-relaxed">
                Have a payment dispute, court marking question, or need hardware integration? Raise a ticket with our operations team.
              </p>
            </div>
            <button
              onClick={() => {
                haptics.tap();
                navigateTo('support');
              }}
              className="w-full h-10 rounded-xl bg-[#F94001] hover:bg-[#D93600] text-white font-extrabold text-[13px] flex items-center justify-center gap-1.5 shadow-xs active-press transition-all cursor-pointer"
            >
              <span>Go to Support & Tickets</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Hotline Box */}
          <div className="bg-[#021526] text-white rounded-3xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#F94001] shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider block">
                  Urgent Escalations
                </span>
                <p className="text-[13px] font-black text-white">
                  Toll-Free Partner Hotline
                </p>
              </div>
            </div>

            <p className="text-[11.5px] text-white/70 leading-relaxed">
              Available 6:00 AM – 11:00 PM for live slot collisions and active booking disputes.
            </p>

            <a
              href="tel:18002081010"
              className="w-full h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[12.5px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-[#F94001]" />
              <span>Call 1800-208-1010</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
