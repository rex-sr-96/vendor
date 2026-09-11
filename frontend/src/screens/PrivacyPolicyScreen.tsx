import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ChevronLeft,
  Shield,
  Lock,
  Mail,
  Phone,
  Printer,
} from 'lucide-react';
import { haptics } from '../utils/haptics';

export const PrivacyPolicyScreen: React.FC = () => {
  const { goBack, venueName } = useApp();
  const [policyData, setPolicyData] = useState<{
    title: string;
    version: string;
    effective_date: string;
    rich_text_html: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadPrivacyPolicy() {
      try {
        const res = await fetch('http://localhost:4000/api/v1/cms/public/privacy-policy');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data && data.rich_text_html) {
            setPolicyData({
              title: data.title || 'TurfTown Partner & Venue Operator Privacy Policy',
              version: data.version || '2.4',
              effective_date: data.effective_date || '1 August 2026',
              rich_text_html: data.rich_text_html,
            });
          }
        }
      } catch {
        // Fallback to static
      }
    }
    loadPrivacyPolicy();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="pb-20 pt-2 w-full max-w-4xl mx-auto space-y-6 select-none">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]/70">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              haptics.tap();
              goBack();
            }}
            className="md:hidden w-10 h-10 rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#021526] hover:bg-[#F3F4F4] shadow-2xs active-press transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <div>
            <h1 className="text-[22px] font-black text-[#021526] tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-[12px] font-medium text-[#5F6368]">
              TurfTown Partner Privacy & Data Protection Standards
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            haptics.tap();
            window.print();
          }}
          className="h-9 px-3.5 rounded-xl bg-white hover:bg-[#F3F4F4] border border-[#E5E7EB] text-[#021526] text-[12px] font-bold flex items-center gap-1.5 shadow-2xs active-press cursor-pointer transition-colors"
        >
          <Printer className="w-3.5 h-3.5 text-[#5F6368]" />
          <span>Print Policy</span>
        </button>
      </div>

      {/* Rich Text Legal Document Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E5E7EB] shadow-2xs space-y-8 text-[#262524] font-normal leading-relaxed">
        {/* Document Header */}
        <div className="border-b border-[#F3F4F4] pb-6 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#16A34A]/10 text-[#16A34A] text-[11px] font-bold mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Official Legal Notice · Version {policyData?.version || '2.4'}</span>
          </div>
          <h2 className="text-[26px] font-black text-[#021526] tracking-tight">
            {policyData?.title || 'TurfTown Partner & Venue Operator Privacy Policy'}
          </h2>
          <p className="text-[13px] text-[#5F6368]">
            Effective Date: <strong>{policyData?.effective_date || '1 August 2026'}</strong> · Applicable to venue operations for{' '}
            <span className="text-[#021526] font-bold">{venueName}</span>
          </p>
        </div>

        {policyData?.rich_text_html ? (
          <div
            className="prose prose-sm sm:prose-base max-w-none text-[#262524] leading-relaxed
              [&_h1]:text-[22px] [&_h1]:font-black [&_h1]:text-[#021526] [&_h1]:mb-3
              [&_h2]:text-[18px] [&_h2]:font-extrabold [&_h2]:text-[#021526] [&_h2]:mb-2.5
              [&_h3]:text-[16px] [&_h3]:font-bold [&_h3]:text-[#021526] [&_h3]:mb-2 [&_h3]:mt-4
              [&_p]:mb-3 [&_p]:text-[#5F6368] [&_p]:text-[13.5px]
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3 [&_ul]:space-y-1 [&_ul]:text-[13px] [&_ul]:text-[#5F6368]
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-3 [&_ol]:space-y-1 [&_ol]:text-[13px] [&_ol]:text-[#5F6368]
              [&_blockquote]:border-l-4 [&_blockquote]:border-[#F94001] [&_blockquote]:bg-[#F3F4F4] [&_blockquote]:p-4 [&_blockquote]:rounded-r-2xl [&_blockquote]:text-[13px] [&_blockquote]:text-[#403E3B] [&_blockquote]:italic [&_blockquote]:my-4
              [&_strong]:text-[#021526]"
            dangerouslySetInnerHTML={{ __html: policyData.rich_text_html }}
          />
        ) : (
          <>
            {/* Intro Callout */}
            <div className="bg-[#F3F4F4] border-l-4 border-[#F94001] rounded-r-2xl p-4 text-[13px] text-[#403E3B] leading-relaxed">
              TurfTown is dedicated to maintaining the confidentiality, integrity, and operational security of your sports facility. This policy outlines how information is gathered, protected, and utilized across the TurfTown Partner Web Console and Manager App.
            </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h3 className="text-[17px] font-black text-[#021526] tracking-tight flex items-center gap-2">
            <span className="text-[#F94001]">1.</span> Information We Collect
          </h3>
          <p className="text-[13.5px] text-[#5F6368]">
            In order to operate your digital booking desk and synchronize real-time ground slots, we process the following categories of information:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-[13px] text-[#5F6368]">
            <li>
              <strong className="text-[#021526]">Venue & Business Credentials:</strong> Facility business name, registered address, GSTIN/PAN (where applicable), bank settlement account information, and merchant point-of-contact details.
            </li>
            <li>
              <strong className="text-[#021526]">Staff & Access Logs:</strong> Manager profile logins, team member role designations (Cashier, Groundkeeper, Referee), and granular security audit logs.
            </li>
            <li>
              <strong className="text-[#021526]">Customer Booking Information:</strong> Player name, phone number, booked sports turf, slot timestamps, payment mode (UPI, Cash, or Card), and automated hold timers.
            </li>
            <li>
              <strong className="text-[#021526]">Transaction Metadata:</strong> IMPS reference numbers, UPI transaction identifiers, payout settlement timestamps, and dispute records.
            </li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h3 className="text-[17px] font-black text-[#021526] tracking-tight flex items-center gap-2">
            <span className="text-[#F94001]">2.</span> How We Use Your Data
          </h3>
          <p className="text-[13.5px] text-[#5F6368]">
            Information processed through your console is restricted solely to sports venue operations:
          </p>
          <div className="space-y-2 pl-4 border-l-2 border-[#E5E7EB] text-[13px] text-[#5F6368]">
            <p>• Generating instant QR payments and managing automated T+0 midnight direct bank payouts.</p>
            <p>• Dispatching automated WhatsApp and SMS match confirmations, booking receipts, and slot hold reminders to patrons.</p>
            <p>• Preventing double bookings via millisecond synchronization across public search apps and on-premise walk-ins.</p>
            <p>• Compiling downloadable tax statements, financial summaries, and occupancy matrix analytics.</p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h3 className="text-[17px] font-black text-[#021526] tracking-tight flex items-center gap-2">
            <span className="text-[#F94001]">3.</span> Data Protection & 256-Bit TLS Security
          </h3>
          <p className="text-[13.5px] text-[#5F6368]">
            All communications between your device, browser session, and the TurfTown cloud backend are encrypted using TLS 1.3 with AES 256-bit encryption. Database clusters employ role-based access control (RBAC), multi-factor authentication, and encrypted data-at-rest storage to prevent unauthorized inspection.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h3 className="text-[17px] font-black text-[#021526] tracking-tight flex items-center gap-2">
            <span className="text-[#F94001]">4.</span> Strict Third-Party Data Sharing Policy
          </h3>
          <p className="text-[13.5px] text-[#5F6368]">
            We do not sell, license, or monetize customer or venue data. Data transmission is strictly confined to licensed infrastructure partners essential to the service:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-[13px] text-[#5F6368]">
            <li><strong>Banking Partners & Gateways:</strong> For processing UPI settlements, refunds, and bank reconciliations.</li>
            <li><strong>Meta / WhatsApp Business Gateway:</strong> For delivery of transactional match passes and tickets.</li>
            <li><strong>SMS Carrier Gateways:</strong> For real-time OTP authentication and urgent court alert notifications.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h3 className="text-[17px] font-black text-[#021526] tracking-tight flex items-center gap-2">
            <span className="text-[#F94001]">5.</span> Data Retention & Venue Operator Rights
          </h3>
          <p className="text-[13.5px] text-[#5F6368]">
            As a registered venue partner, you retain ownership of your customer lists and accounting statements. You may export comprehensive booking registers in CSV, Excel, or PDF at any time via the Export Reports tool. Account termination requests result in permanent purge of private credentials following statutory tax retention periods.
          </p>
        </section>

        {/* Contact & Compliance Box */}
        <div className="bg-[#F3F4F4] rounded-2xl p-5 border border-[#E5E7EB] space-y-3">
          <div className="flex items-center gap-2 text-[14px] font-black text-[#021526]">
            <Lock className="w-4 h-4 text-[#16A34A]" />
            <span>Data Protection Officer & Privacy Grievances</span>
          </div>
          <p className="text-[12.5px] text-[#5F6368] leading-relaxed">
            If you have questions regarding personal data processing, customer access requests, or regulatory privacy compliance, contact our legal compliance team:
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-1 text-[12px] font-bold text-[#021526]">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#E5E7EB]">
              <Mail className="w-3.5 h-3.5 text-[#F94001]" />
              <span>privacy@turftown.app</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#E5E7EB]">
              <Phone className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>+91 80 4567 8900 (Mon–Fri, 9 AM – 6 PM)</span>
            </div>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
};
