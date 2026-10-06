import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ChevronLeft,
  Shield,
  Lock,
  Eye,
  Server,
  Bell,
  FileCheck,
  Mail,
  Phone,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { haptics } from '../utils/haptics';

export const PrivacyPolicyScreen: React.FC = () => {
  const { goBack, venueName } = useApp();
  const [policyData, setPolicyData] = React.useState<{
    title: string;
    version: string;
    effective_date: string;
    rich_text_html: string;
  } | null>(null);

  React.useEffect(() => {
    async function loadPrivacy() {
      try {
        const res = await fetch('http://localhost:4000/api/v1/cms/public/privacy-policy');
        if (res.ok) {
          const data = await res.json();
          if (data?.rich_text_html) setPolicyData(data);
        }
      } catch (err) {
        console.warn('Could not load live Privacy Policy:', err);
      }
    }
    loadPrivacy();
  }, []);

  const sections = [
    {
      id: 'collection',
      title: '1. Information We Collect',
      icon: Eye,
      content:
        'We collect venue business data, manager profile credentials (name, phone number, email), staff accounts, customer booking records (customer name, phone number, sport preferences, slot timing), and transaction metadata for UPI, cash, and digital payment reconciliations.',
    },
    {
      id: 'usage',
      title: '2. How We Use Information',
      icon: FileCheck,
      content:
        'Your information is used exclusively to facilitate turf slot bookings, automate WhatsApp booking confirmations, generate QR payment receipts, manage court maintenance schedules, and generate financial accounting reports for your arena operations.',
    },
    {
      id: 'security',
      title: '3. Data Protection & Security',
      icon: Lock,
      content:
        'All sensitive customer and venue management records are transmitted over TLS/HTTPS 256-bit encrypted channels. We implement role-based access controls (RBAC) ensuring staff members only access authorized manager features.',
    },
    {
      id: 'sharing',
      title: '4. Third-Party Integrations',
      icon: Server,
      content:
        'We do not sell personal data. Information is shared only with verified banking payment aggregators (for UPI payout processing) and official WhatsApp Business API gateways for transactional customer notifications.',
    },
    {
      id: 'retention',
      title: '5. Data Retention & Control',
      icon: Shield,
      content:
        'Venue booking history and audit logs are retained for accounting and compliance purposes. Venue owners have the right to request full data export or deletion of customer records at any time through manager settings.',
    },
    {
      id: 'cookies',
      title: '6. Device Permissions & Notifications',
      icon: Bell,
      content:
        'The application requests access to push notifications for real-time booking alerts, instant payment receipts, and automated hold-expiration reminders. You can modify notification permissions at any time.',
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
          className="w-9 h-9 -ml-1 rounded-xl flex items-center justify-center text-[#021526] hover:bg-[#E5E7EB]/50 active-press transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.4]" />
        </button>

        <div className="text-center">
          <h1 className="text-[17px] font-extrabold text-[#021526] leading-none">
            Privacy Policy
          </h1>
          <span className="text-[11px] text-[#5F6368] mt-0.5 block">
            TurfTown Partner Privacy Standards
          </span>
        </div>

        <div className="w-9 h-9" />
      </div>

      {/* Hero Overview Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1C1C20] via-[#141417] to-[#0E0E10] text-white rounded-[22px] p-4 shadow-md space-y-2.5 border border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#16A34A]/20 text-[#16A34A] flex items-center justify-center">
            <Shield className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="text-[13px] font-extrabold text-white block leading-tight">
              Privacy & Data Protection
            </span>
            <span className="text-[10.5px] text-white/60">
              Last updated: August 2026 · Version 2.4
            </span>
          </div>
        </div>
        <p className="text-[11.5px] text-white/80 leading-relaxed pt-1">
          TurfTown is committed to safeguarding the operational data of{' '}
          <strong className="text-white font-semibold">{venueName}</strong>, your
          staff, and all arena patrons.
        </p>
      </div>

      {policyData?.rich_text_html ? (
        <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-2xs">
          <div
            className="prose prose-sm max-w-none text-[#262524] leading-relaxed
              [&_h1]:text-[18px] [&_h1]:font-black [&_h1]:text-[#021526] [&_h1]:mb-2
              [&_h2]:text-[16px] [&_h2]:font-extrabold [&_h2]:text-[#021526] [&_h2]:mb-2
              [&_h3]:text-[14px] [&_h3]:font-bold [&_h3]:text-[#021526] [&_h3]:mb-1.5 [&_h3]:mt-3
              [&_p]:mb-2.5 [&_p]:text-[#5F6368] [&_p]:text-[12.5px]
              [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2.5 [&_ul]:space-y-1 [&_ul]:text-[12.5px] [&_ul]:text-[#5F6368]
              [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2.5 [&_ol]:space-y-1 [&_ol]:text-[12.5px] [&_ol]:text-[#5F6368]
              [&_blockquote]:border-l-3 [&_blockquote]:border-[#F94001] [&_blockquote]:bg-[#F3F4F4] [&_blockquote]:p-3 [&_blockquote]:rounded-r-xl [&_blockquote]:text-[12px] [&_blockquote]:text-[#403E3B] [&_blockquote]:italic [&_blockquote]:my-3
              [&_strong]:text-[#021526]"
            dangerouslySetInnerHTML={{ __html: policyData.rich_text_html }}
          />
        </div>
      ) : (
        /* Sections List */
        <div className="space-y-2.5">
          {sections.map((sec) => {
            const Icon = sec.icon;
            return (
              <div
                key={sec.id}
                className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-2xs space-y-2"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#F3F4F4] text-[#021526] flex items-center justify-center border border-[#E5E7EB]">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-[13.5px] font-extrabold text-[#021526]">
                    {sec.title}
                  </h3>
                </div>
                <p className="text-[12px] text-[#5F6368] leading-relaxed pl-9.5">
                  {sec.content}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Grievance & Privacy Contact Card */}
      <div className="bg-[#F3F4F4] rounded-2xl p-4 border border-[#E5E7EB] space-y-2.5">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#F94001]" />
          <span className="text-[12.5px] font-bold text-[#021526]">
            Privacy Grievance & Compliance
          </span>
        </div>
        <p className="text-[11.5px] text-[#5F6368] leading-relaxed">
          For data access inquiries, consent withdrawal, or privacy compliance
          questions, reach out directly to our Data Protection team.
        </p>
        <div className="pt-1 flex flex-col gap-1.5 text-[11.5px] font-semibold text-[#021526]">
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-[#5F6368]" />
            <span>privacy@turftown.app</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-[#5F6368]" />
            <span>+91 80 4567 8900 (Mon–Fri, 9 AM – 6 PM)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
