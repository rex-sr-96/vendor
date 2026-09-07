import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ChevronLeft,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Scale,
  CreditCard,
  RotateCcw,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { haptics } from '../utils/haptics';

export const TermsConditionsScreen: React.FC = () => {
  const { goBack, venueName } = useApp();
  const [termsData, setTermsData] = useState<{
    title: string;
    version: string;
    effective_date: string;
    rich_text_html: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadTerms() {
      try {
        const res = await fetch('http://localhost:4000/api/v1/cms/public/terms-and-conditions');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data && data.rich_text_html) {
            setTermsData({
              title: data.title || 'Venue Partner Agreement & Service Terms',
              version: data.version || '3.0',
              effective_date: data.effective_date || '1 August 2026',
              rich_text_html: data.rich_text_html,
            });
          }
        }
      } catch {
        // Fallback to static termsList
      }
    }
    loadTerms();
    return () => {
      isMounted = false;
    };
  }, []);

  const termsList = [
    {
      id: 'partner',
      title: '1. Venue Partnership & Account Usage',
      icon: Building2,
      content:
        'By operating TurfTown Manager for your sports arena, you warrant that you are an authorized owner, manager, or representative of the venue. You are responsible for safeguarding your login OTP credentials and managing role permissions for your ground staff.',
    },
    {
      id: 'booking_honor',
      title: '2. Slot Management & Booking Honor System',
      icon: CheckCircle2,
      content:
        'All confirmed bookings placed by players through online channels or entered manually by staff must be honored during the reserved time slot. Pitch modifications or emergency court blocks should be made with timely notice to players.',
    },
    {
      id: 'payments',
      title: '3. Payments & Digital Reconciliations',
      icon: CreditCard,
      content:
        'Direct UPI QR and card payments collected from players are credited directly to your linked verified bank account. The venue owner agrees to maintain updated bank IFSC details and reconcile settlement batches regularly.',
    },
    {
      id: 'cancellations',
      title: '4. Cancellation & Refund Guidelines',
      icon: RotateCcw,
      content:
        'Cancellations and partial refunds are governed by the venue’s configured policy rules. When a booking is cancelled within the eligible free cancellation window, refunds will be initiated automatically or adjusted via offline reconciliation.',
    },
    {
      id: 'ground_safety',
      title: '5. Ground Safety & Player Code of Conduct',
      icon: ShieldCheck,
      content:
        'The arena management holds full discretion to enforce turf safety rules, appropriate footwear (studs/turf shoes), equipment guidelines, and player conduct standards on the premises.',
    },
    {
      id: 'service',
      title: '6. Service Availability & Platform Updates',
      icon: Scale,
      content:
        'TurfTown strives to maintain 99.9% platform availability. Periodic system enhancements or scheduled maintenance windows will be notified in advance through manager announcements.',
    },
  ];

  return (
    <div className="pb-10 pt-3 px-4 w-full space-y-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => {
            haptics.tap();
            goBack();
          }}
          className="md:hidden w-9 h-9 -ml-1 rounded-xl flex items-center justify-center text-[#171717] hover:bg-[#E8E6E1]/50 active-press transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.4]" />
        </button>

        <div className="text-center">
          <h1 className="text-[17px] font-extrabold text-[#171717] leading-none">
            Terms & Conditions
          </h1>
          <span className="text-[11px] text-[#777570] mt-0.5 block">
            Partner Agreement & Service Terms
          </span>
        </div>

        <div className="w-9 h-9" />
      </div>

      {/* Hero Overview Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1C1C20] via-[#141417] to-[#0E0E10] text-white rounded-[22px] p-4 shadow-md space-y-2.5 border border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FF6B2C]/20 text-[#FF6B2C] flex items-center justify-center">
            <FileText className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="text-[13px] font-extrabold text-white block leading-tight">
              {termsData?.title || 'Venue Partner Agreement'}
            </span>
            <span className="text-[10.5px] text-white/60">
              Effective Date: {termsData?.effective_date || 'August 2026'} · Version {termsData?.version || '3.0'}
            </span>
          </div>
        </div>
        <p className="text-[11.5px] text-white/80 leading-relaxed pt-1">
          These terms govern the use of TurfTown Manager systems for{' '}
          <strong className="text-white font-semibold">{venueName}</strong>{' '}
          court reservations, payouts, and customer operations.
        </p>
      </div>

      {termsData?.rich_text_html ? (
        <div className="bg-white rounded-2xl p-5 border border-[#E8E6E1] shadow-2xs">
          <div
            className="prose prose-sm max-w-none text-[#262524] leading-relaxed
              [&_h1]:text-[18px] [&_h1]:font-black [&_h1]:text-[#171717] [&_h1]:mb-2
              [&_h2]:text-[16px] [&_h2]:font-extrabold [&_h2]:text-[#171717] [&_h2]:mb-2
              [&_h3]:text-[14px] [&_h3]:font-bold [&_h3]:text-[#171717] [&_h3]:mb-1.5 [&_h3]:mt-3
              [&_p]:mb-2.5 [&_p]:text-[#55534E] [&_p]:text-[12.5px]
              [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2.5 [&_ul]:space-y-1 [&_ul]:text-[12.5px] [&_ul]:text-[#55534E]
              [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2.5 [&_ol]:space-y-1 [&_ol]:text-[12.5px] [&_ol]:text-[#55534E]
              [&_blockquote]:border-l-3 [&_blockquote]:border-[#FF6B2C] [&_blockquote]:bg-[#FAF9F6] [&_blockquote]:p-3 [&_blockquote]:rounded-r-xl [&_blockquote]:text-[12px] [&_blockquote]:text-[#403E3B] [&_blockquote]:italic [&_blockquote]:my-3
              [&_strong]:text-[#171717]"
            dangerouslySetInnerHTML={{ __html: termsData.rich_text_html }}
          />
        </div>
      ) : (
      /* Terms Accordions/Cards */
      <div className="space-y-2.5">
        {termsList.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 border border-[#E8E6E1] shadow-2xs space-y-2"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#FAF9F6] text-[#171717] flex items-center justify-center border border-[#E8E6E1]">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-[13.5px] font-extrabold text-[#171717]">
                  {item.title}
                </h3>
              </div>
              <p className="text-[12px] text-[#55534E] leading-relaxed pl-9.5">
                {item.content}
              </p>
            </div>
          );
        })}
      </div>
      )}

      {/* Support & Legal Queries */}
      <div className="bg-[#FAF9F6] rounded-2xl p-4 border border-[#E8E6E1] space-y-2">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-[#FF6B2C]" />
          <span className="text-[12.5px] font-bold text-[#171717]">
            Legal & Partner Inquiries
          </span>
        </div>
        <p className="text-[11.5px] text-[#777570] leading-relaxed">
          Questions regarding your partner contract, commercial rates, or dispute
          resolution can be submitted through partner legal support at{' '}
          <span className="font-bold text-[#171717]">legal@turftown.app</span>.
        </p>
      </div>
    </div>
  );
};
