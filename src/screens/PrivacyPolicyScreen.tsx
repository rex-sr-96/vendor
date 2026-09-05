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
          className="w-9 h-9 -ml-1 rounded-xl flex items-center justify-center text-[#171717] hover:bg-[#E8E6E1]/50 active-press transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.4]" />
        </button>

        <div className="text-center">
          <h1 className="text-[17px] font-extrabold text-[#171717] leading-none">
            Privacy Policy
          </h1>
          <span className="text-[11px] text-[#777570] mt-0.5 block">
            TurfTown Partner Privacy Standards
          </span>
        </div>

        <div className="w-9 h-9" />
      </div>

      {/* Hero Overview Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1C1C20] via-[#141417] to-[#0E0E10] text-white rounded-[22px] p-4 shadow-md space-y-2.5 border border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#2FA66A]/20 text-[#2FA66A] flex items-center justify-center">
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

      {/* Sections List */}
      <div className="space-y-2.5">
        {sections.map((sec) => {
          const Icon = sec.icon;
          return (
            <div
              key={sec.id}
              className="bg-white rounded-2xl p-4 border border-[#E8E6E1] shadow-2xs space-y-2"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#F7F7F5] text-[#171717] flex items-center justify-center border border-[#E8E6E1]">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-[13.5px] font-extrabold text-[#171717]">
                  {sec.title}
                </h3>
              </div>
              <p className="text-[12px] text-[#55534E] leading-relaxed pl-9.5">
                {sec.content}
              </p>
            </div>
          );
        })}
      </div>

      {/* Grievance & Privacy Contact Card */}
      <div className="bg-[#FAF9F6] rounded-2xl p-4 border border-[#E8E6E1] space-y-2.5">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#FF6B2C]" />
          <span className="text-[12.5px] font-bold text-[#171717]">
            Privacy Grievance & Compliance
          </span>
        </div>
        <p className="text-[11.5px] text-[#777570] leading-relaxed">
          For data access inquiries, consent withdrawal, or privacy compliance
          questions, reach out directly to our Data Protection team.
        </p>
        <div className="pt-1 flex flex-col gap-1.5 text-[11.5px] font-semibold text-[#171717]">
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-[#777570]" />
            <span>privacy@turftown.app</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-[#777570]" />
            <span>+91 80 4567 8900 (Mon–Fri, 9 AM – 6 PM)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
