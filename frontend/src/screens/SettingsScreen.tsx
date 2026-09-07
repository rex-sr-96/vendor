import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Grid3X3,
  Coffee,
  Clock,
  SlidersHorizontal,
  Wallet,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  LogOut,
  FileSpreadsheet,
  Shield,
  FileText,
  Building2,
  CheckCircle2,
  Zap,
  ShowerHead,
  Droplets,
  Car,
  Shirt,
  Trophy,
  HeartPulse,
  SunMedium,
  DoorOpen,
  Armchair,
  ShieldCheck,
  Save,
  Bell,
  Mail,
  Phone,
  Check,
  Plus,
  X,
  Trash2,
  Upload,
  AlertCircle,
  Lock,
  Building,
  CreditCard,
  Image as ImageIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { haptics } from '../utils/haptics';

type SettingsTab =
  | 'general'
  | 'amenities'
  | 'operating_hours'
  | 'booking_settings'
  | 'payment_settings'
  | 'notifications'
  | 'privacy'
  | 'terms';

export const SettingsScreen: React.FC = () => {
  const {
    navigateTo,
    venueName,
    venueCity,
    venueAddress,
    ownerPhone,
    ownerName,
    ownerEmail,
    ownerPan,
    venuePincode,
    venueEstablished,
    venueDescription,
    venuePhotos,
    setVenuePhotos,
    setVenueDetails,
    bankDetails,
    updateBankDetails,
    syncVendorProfileToBackend,
    syncBankChangeToBackend,
    isLoadingOnboardingProfile,
    refreshFromOnboarding,
    amenities,
    toggleAmenity,
    addAmenity,
    operatingHours,
    toggleOperatingDay,
    updateOperatingDayHours,
    bookingSettings,
    updateBookingSettings,
    paymentSettings,
    updatePaymentSettings,
    notificationPreferences,
    updateNotificationPreferences,
    cancellationPolicy,
    updateCancellationPolicy,
    courts,
    showToast,
    setActiveModal,
    currentUser,
  } = useApp();

  const isStaff = currentUser?.type === 'staff';

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [isMobileGeneralOpen, setIsMobileGeneralOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ==========================================
  // VENUE & OWNER PROFILE STATE
  // ==========================================
  const [vName, setVName] = useState(venueName || 'Sky Sports Arena');
  const [vCity, setVCity] = useState(venueCity || 'Coimbatore, Tamil Nadu');
  const [vAddress, setVAddress] = useState(venueAddress || '123 Avinashi Road, Peelamedu, Coimbatore');
  const [vPincode, setVPincode] = useState(venuePincode || '641018');
  const [vEstablished, setVEstablished] = useState(venueEstablished || '2023');
  const [vDescription, setVDescription] = useState(
    venueDescription || 'Premier synthetic turf and multi-sport arena with verified lighting and player amenities.'
  );

  // Owner details
  const [oName, setOName] = useState(ownerName || 'Karthik Rajan');
  const [oPhone, setOPhone] = useState(ownerPhone || '+91 98765 43210');
  const [oEmail, setOEmail] = useState(ownerEmail || 'partner@ibooksports.com');
  const [oPan, setOPan] = useState(ownerPan || '33ABCDE1234F1Z5');

  // Sync state whenever AppContext updates from backend onboarding
  useEffect(() => {
    if (venueName) setVName(venueName);
    if (venueCity) setVCity(venueCity);
    if (venueAddress) setVAddress(venueAddress);
    if (venuePincode) setVPincode(venuePincode);
    if (ownerName) setOName(ownerName);
    if (ownerPhone) setOPhone(ownerPhone);
    if (ownerEmail) setOEmail(ownerEmail);
    if (ownerPan) setOPan(ownerPan);
    if (venueEstablished) setVEstablished(venueEstablished);
    if (venueDescription) setVDescription(venueDescription);
  }, [venueName, venueCity, venueAddress, venuePincode, ownerName, ownerPhone, ownerEmail, ownerPan, venueEstablished, venueDescription]);

  const [newPhotoLabel, setNewPhotoLabel] = useState('');
  const [isAddPhotoOpen, setIsAddPhotoOpen] = useState(false);

  // ==========================================
  // PAYMENT SETTINGS & BANK DETAILS STATE
  // ==========================================
  const [activeBankDetails, setActiveBankDetails] = useState({
    bankName: 'HDFC Bank',
    accountHolder: 'Dhanush Kumar (TurfTown Arena)',
    accountNumber: '50200088921456',
    maskedNumber: '•••• •••• •••• 8892',
    ifsc: 'HDFC0001234',
    accountType: 'Current Commercial Account',
    payoutSchedule: 'T+0 Auto IMPS Midnight Direct Settlement',
    status: 'Verified & Active',
  });

  const [bankChangeRequest, setBankChangeRequest] = useState<{
    pending: boolean;
    requestId?: string;
    newBankName?: string;
    newAccountMasked?: string;
    newIfsc?: string;
    submittedAt?: string;
  } | null>(null);

  const [isBankChangeModalOpen, setIsBankChangeModalOpen] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [newHolderName, setNewHolderName] = useState('');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [newIfsc, setNewIfsc] = useState('');
  const [newAccountType, setNewAccountType] = useState('Current Commercial');
  const [changeReason, setChangeReason] = useState('');
  const [hasChequeAttached, setHasChequeAttached] = useState(false);

  // Amenities state
  const [amenityFilter, setAmenityFilter] = useState<string>('all');
  const activeAmenitiesCount = amenities.filter((a) => a.enabled).length;



  // Handle Venue Profile Save & Sync to Onboarding Database
  const handleSaveVenueProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (venuePhotos.length < 4) {
      showToast('Photos Required', 'Please maintain at least 4 photos for verification.', 'warning');
      return;
    }
    setIsSaving(true);
    haptics.tap();

    const updated = {
      venueName: vName.trim(),
      venueCity: vCity.trim(),
      venueAddress: vAddress.trim(),
      venuePincode: vPincode.trim(),
      ownerPhone: oPhone.trim(),
      ownerName: oName.trim(),
      ownerEmail: oEmail.trim(),
      ownerPan: oPan.trim(),
      venueEstablished: vEstablished.trim(),
      venueDescription: vDescription.trim(),
    };

    setVenueDetails(updated);

    const cleanPhone = oPhone.replace(/\D/g, '').slice(-10);
    const success = await syncVendorProfileToBackend({
      owner: {
        name: oName.trim(),
        mobile: cleanPhone,
        email: oEmail.trim(),
        pan: oPan.trim(),
        address: vAddress.trim(),
        pincode: vPincode.trim(),
      },
      venue: {
        name: vName.trim(),
        address: vAddress.trim(),
        city: vCity.trim(),
        pincode: vPincode.trim(),
        gst_number: oPan.trim(),
      },
      bank: {
        bank_name: bankDetails.bankName,
        account_holder_name: bankDetails.accountHolder,
        account_number: bankDetails.accountNumber,
        ifsc_code: bankDetails.ifsc,
        branch_name: bankDetails.branchName,
        account_type: bankDetails.accountType.replace(/ commercial account/i, '').trim(),
      },
    });

    setIsSaving(false);
    haptics.success();
    if (success) {
      showToast(
        'Profile Synchronized',
        'Owner details, venue info & photos updated and saved to onboarding records.',
        'success'
      );
    } else {
      showToast('Profile Saved Locally', 'Details updated locally in vendor system.', 'info');
    }
  };

  // Add Photo Handler
  const handleAddPhoto = () => {
    if (venuePhotos.length >= 8) {
      showToast('Maximum Reached', 'You can upload up to 8 photos maximum.', 'info');
      return;
    }
    const samplePool = [
      'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80',
    ];
    const nextUrl = samplePool[venuePhotos.length % samplePool.length];
    const newId = `p${Date.now()}`;
    const label = newPhotoLabel.trim() || `Facility Area ${venuePhotos.length + 1}`;

    setVenuePhotos([...venuePhotos, { id: newId, url: nextUrl, label }]);
    setNewPhotoLabel('');
    setIsAddPhotoOpen(false);
    haptics.success();
    showToast('Photo Added', `${label} added to venue gallery.`, 'success');
  };

  // Remove Photo Handler
  const handleRemovePhoto = (id: string) => {
    haptics.tap();
    if (venuePhotos.length <= 4) {
      showToast('Minimum Required', 'Minimum 4 photos required for active verification.', 'warning');
      return;
    }
    setVenuePhotos(venuePhotos.filter((p) => p.id !== id));
    showToast('Photo Removed', 'Photo removed from gallery.', 'info');
  };

  // Handle Bank Change Request
  const handleSubmitBankChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newAccountNumber !== confirmAccountNumber) {
      showToast('Account Mismatch', 'Account numbers do not match.', 'warning');
      return;
    }
    if (!newIfsc.trim() || newIfsc.length < 5) {
      showToast('Invalid IFSC', 'Please enter a valid IFSC code.', 'warning');
      return;
    }

    haptics.tap();
    const masked = `•••• •••• •••• ${newAccountNumber.slice(-4)}`;
    const reqId = `REQ-BNK-${Math.floor(1000 + Math.random() * 9000)}`;

    await syncBankChangeToBackend({
      bankName: newBankName,
      accountHolder: newHolderName || oName,
      accountNumber: newAccountNumber,
      ifsc: newIfsc.toUpperCase(),
      branchName: 'Main Branch',
      accountType: newAccountType,
    });

    setBankChangeRequest({
      pending: true,
      requestId: reqId,
      newBankName,
      newAccountMasked: masked,
      newIfsc: newIfsc.toUpperCase(),
      submittedAt: 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    setIsBankChangeModalOpen(false);
    haptics.success();
    showToast('Change Request Submitted', 'Sent to admin and synced to onboarding records.', 'success');
  };

  // Nav menu items (Staff Management and Cancellation & Refunds REMOVED)
  // Payment Settings also hidden from staff users
  const navItems: { id: SettingsTab; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    { id: 'general', label: 'Venue Profile & Info', icon: Building2, badge: `${venuePhotos.length} Photos` },
    ...(!isStaff ? [{ id: 'payment_settings' as SettingsTab, label: 'Payment Settings', icon: Wallet, badge: bankChangeRequest?.pending ? 'Pending' : 'Bank Verified' }] : []),
    { id: 'amenities', label: 'Amenities', icon: Coffee, badge: `${activeAmenitiesCount} on` },
    { id: 'operating_hours', label: 'Operating Hours', icon: Clock, badge: 'Daily' },
    { id: 'booking_settings', label: 'Booking Settings', icon: SlidersHorizontal },
    { id: 'notifications', label: 'Notification Settings', icon: Bell, badge: 'On/Off' },
    { id: 'privacy', label: 'Privacy Policy', icon: Shield },
    { id: 'terms', label: 'Terms & Conditions', icon: FileText },
  ];

  const getAmenityIcon = (iconName: string) => {
    switch (iconName) {
      case 'SunMedium':
      case 'Zap':
        return <SunMedium className="w-4 h-4 text-[#FF6B2C]" />;
      case 'ShowerHead':
      case 'DoorOpen':
        return <DoorOpen className="w-4 h-4 text-[#2FA66A]" />;
      case 'Droplets':
        return <Droplets className="w-4 h-4 text-[#3B82F6]" />;
      case 'Car':
        return <Car className="w-4 h-4 text-[#8B5CF6]" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-4 h-4 text-[#6366F1]" />;
      case 'Armchair':
        return <Armchair className="w-4 h-4 text-[#EC4899]" />;
      case 'HeartPulse':
        return <HeartPulse className="w-4 h-4 text-[#EF4444]" />;
      case 'Coffee':
        return <Coffee className="w-4 h-4 text-[#F59E0B]" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-[#777570]" />;
    }
  };

  return (
    <div className="pb-20 pt-1 w-full space-y-4 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E8E6E1]">
        <div>
          <h1 className="text-[21px] font-black text-[#171717] tracking-tight">
            Settings & Operations
          </h1>
          <p className="text-[12px] font-medium text-[#777570]">
            Venue profile, verified bank accounts, amenities & booking rules
          </p>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => {
              haptics.tap();
              navigateTo('courts');
            }}
            className="h-8.5 px-3.5 rounded-xl bg-white border border-[#E8E6E1] text-[12px] font-bold text-[#171717] hover:bg-[#F7F7F5] active-press cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Grid3X3 className="w-3.5 h-3.5 text-[#FF6B2C]" />
            <span>Manage Courts</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. MOBILE VIEW (md:hidden): Fast, clean tap-friendly vertical menu        */}
      {/* ========================================================================= */}
      <div className="block md:hidden space-y-3">
        {/* Venue Owner Mini Card */}
        <div className="bg-white rounded-2xl p-3.5 border border-[#E8E6E1] shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B2C] text-white font-extrabold text-base flex items-center justify-center">
              TT
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[#171717]">{venueName}</h2>
              <p className="text-[11px] text-[#777570]">{venueCity} · Owner: {oName}</p>
            </div>
          </div>
          <button
            onClick={() => {
              haptics.tap();
              navigateTo('courts');
            }}
            className="text-[11px] font-bold text-[#FF6B2C] bg-[#FF6B2C]/10 px-2.5 py-1 rounded-lg"
          >
            Courts
          </button>
        </div>

        {/* Mobile Rows List (Staff & Cancellation REMOVED) */}
        <div className="space-y-2">
          {[
            { id: 'general', title: 'Venue Profile & Photos', caption: `Owner details & ${venuePhotos.length} photos`, icon: Building2, screen: 'venue_profile' as const },
            ...(!isStaff ? [{ id: 'payment_settings', title: 'Payment & Bank Details', caption: 'HDFC verified payout · Change request form', icon: Wallet, screen: 'payment_settings' as const }] : []),
            { id: 'amenities', title: 'Amenities', caption: `${activeAmenitiesCount} active · Admin verified amenities`, icon: Coffee, screen: 'amenities' as const },
            { id: 'operating_hours', title: 'Operating Hours', caption: '06:00 AM – 11:00 PM (Daily schedule)', icon: Clock, screen: 'operating_hours' as const },
            { id: 'booking_settings', title: 'Booking Settings', caption: 'Advance reservation & slot duration', icon: SlidersHorizontal, screen: 'booking_settings' as const },
            { id: 'notifications', title: 'Notification Settings', caption: 'WhatsApp & SMS alerts on/off toggles', icon: Bell, screen: 'notification_settings' as const },
            { id: 'privacy', title: 'Privacy Policy', caption: 'Rich text data protection & compliance', icon: Shield, screen: 'privacy_policy' as const },
            { id: 'terms', title: 'Terms & Conditions', caption: 'Platform rules & rights', icon: FileText, screen: 'terms_conditions' as const },
            { id: 'reports', title: 'Export Booking Reports', caption: 'Day, month & custom statements', icon: FileSpreadsheet, screen: 'export_report' as const },
            { id: 'support', title: 'Help Desk & Support', caption: 'Raise ticket & toll-free hotline', icon: HelpCircle, screen: 'help_support' as const },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => {
                  haptics.tap();
                  navigateTo(item.screen);
                }}
                className="p-3.5 bg-white rounded-2xl border border-[#E8E6E1] shadow-2xs flex items-center justify-between active-press cursor-pointer hover:bg-[#FAF9F6] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FAF9F6] text-[#171717] flex items-center justify-center border border-[#E8E6E1]">
                    <Icon className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-bold text-[#171717]">{item.title}</h3>
                    <p className="text-[11px] text-[#777570]">{item.caption}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#777570]" />
              </div>
            );
          })}
        </div>

        {/* Sign out */}
        <button
          onClick={() => {
            haptics.tap();
            setActiveModal('logout_confirm');
          }}
          className="w-full py-2.5 bg-white text-[#D94B4B] border border-[#E8E6E1] rounded-2xl font-bold text-[12.5px] flex items-center justify-center gap-1.5 active-press cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Switch Account / Sign Out</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. DESKTOP VIEW (hidden md:flex): Nav-Based State-of-the-Art SaaS Layout */}
      {/* ========================================================================= */}
      <div className="hidden md:flex gap-5 items-start">
        {/* Left Navigation Sidebar */}
        <div className="w-64 shrink-0 space-y-2">
          {/* Venue Info Card */}
          <div className="bg-white rounded-2xl p-3 border border-[#E8E6E1] shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FF6B2C] text-white font-extrabold text-sm flex items-center justify-center shrink-0">
              TT
            </div>
            <div className="min-w-0">
              <h2 className="text-[13.5px] font-bold text-[#171717] truncate">{venueName}</h2>
              <p className="text-[10.5px] text-[#777570] truncate">{venueCity} · Owner: {oName}</p>
            </div>
          </div>

          {/* Navigation Tabs List (Staff & Cancellation REMOVED) */}
          <div className="bg-white rounded-2xl p-2 border border-[#E8E6E1] shadow-2xs space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    haptics.tap();
                    setActiveTab(item.id);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-[12.5px] font-bold flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#171717] text-white shadow-xs'
                      : 'text-[#55534E] hover:bg-[#FAF9F6] hover:text-[#171717]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF6B2C]' : 'text-[#777570]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9.5px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.badge === 'Pending'
                          ? 'bg-[#E7A72F]/15 text-[#B87C0D]'
                          : 'bg-[#FAF9F6] text-[#777570] border border-[#E8E6E1]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sign Out */}
          <button
            onClick={() => {
              haptics.tap();
              setActiveModal('logout_confirm');
            }}
            className="w-full py-2 bg-white text-[#D94B4B] hover:bg-[#D94B4B]/10 border border-[#E8E6E1] rounded-xl font-bold text-[11.5px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Right Active Content Panel */}
        <div className="flex-1 min-w-0 bg-white rounded-2xl p-5 border border-[#E8E6E1] shadow-2xs">
          {/* ===================================================================== */}
          {/* TAB 1: VENUE PROFILE & OWNER DETAILS & PHOTO GALLERY (Min 4, Max 8)   */}
          {/* ===================================================================== */}
          {activeTab === 'general' && (
            <form onSubmit={handleSaveVenueProfile} className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-[#F1F0EC]">
                <div>
                  <h3 className="text-[17px] font-black text-[#171717]">Venue & Owner Profile</h3>
                  <p className="text-[11.5px] text-[#777570]">
                    Verified owner credentials, business details & verified photo gallery
                  </p>
                </div>

                <button
                  type="submit"
                  className="h-8.5 px-4 rounded-xl bg-[#FF6B2C] hover:bg-[#e85b1e] text-white font-bold text-[12px] flex items-center gap-1.5 shadow-sm active-press cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save All Changes</span>
                </button>
              </div>

              {/* SECTION A: OWNER DETAILS */}
              <div className="bg-[#FAF9F6] rounded-2xl p-4 border border-[#E8E6E1] space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-[#E8E6E1]/70">
                  <h4 className="text-[13px] font-black text-[#171717] uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2FA66A]" />
                    <span>Owner / Licensee Details</span>
                  </h4>
                  <span className="text-[10px] font-bold text-[#2FA66A] bg-[#2FA66A]/10 px-2 py-0.5 rounded-full">
                    KYC Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#777570] mb-1">
                      Owner Full Name <span className="text-[#FF6B2C]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={oName}
                      onChange={(e) => setOName(e.target.value)}
                      className="w-full bg-white border border-[#E8E6E1] rounded-xl px-3 py-2 text-[13px] font-bold text-[#171717] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#777570] mb-1">
                      Registered Mobile Phone <span className="text-[#FF6B2C]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={oPhone}
                      onChange={(e) => setOPhone(e.target.value)}
                      className="w-full bg-white border border-[#E8E6E1] rounded-xl px-3 py-2 text-[13px] font-bold text-[#171717] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#777570] mb-1">Owner Email Address</label>
                    <input
                      type="email"
                      required
                      value={oEmail}
                      onChange={(e) => setOEmail(e.target.value)}
                      className="w-full bg-white border border-[#E8E6E1] rounded-xl px-3 py-2 text-[13px] font-bold text-[#171717] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#777570] mb-1">PAN / Government ID</label>
                    <input
                      type="text"
                      value={oPan}
                      onChange={(e) => setOPan(e.target.value)}
                      className="w-full bg-white border border-[#E8E6E1] rounded-xl px-3 py-2 text-[13px] font-bold text-[#171717] focus:outline-none uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION B: VENUE DETAILS */}
              <div className="bg-[#FAF9F6] rounded-2xl p-4 border border-[#E8E6E1] space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-[#E8E6E1]/70">
                  <h4 className="text-[13px] font-black text-[#171717] uppercase tracking-wider flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#FF6B2C]" />
                    <span>Venue & Arena Information</span>
                  </h4>
                  <span className="text-[10px] font-bold text-[#FF6B2C] bg-[#FF6B2C]/10 px-2 py-0.5 rounded-full">
                    Customer-Facing
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#777570] mb-1">
                      Venue Name <span className="text-[#FF6B2C]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={vName}
                      onChange={(e) => setVName(e.target.value)}
                      className="w-full bg-white border border-[#E8E6E1] rounded-xl px-3 py-2 text-[13px] font-bold text-[#171717] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#777570] mb-1">
                      City & Area <span className="text-[#FF6B2C]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={vCity}
                      onChange={(e) => setVCity(e.target.value)}
                      className="w-full bg-white border border-[#E8E6E1] rounded-xl px-3 py-2 text-[13px] font-bold text-[#171717] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#777570] mb-1">Street Address</label>
                    <input
                      type="text"
                      value={vAddress}
                      onChange={(e) => setVAddress(e.target.value)}
                      className="w-full bg-white border border-[#E8E6E1] rounded-xl px-3 py-2 text-[13px] font-bold text-[#171717] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-[#777570] mb-1">Pincode</label>
                      <input
                        type="text"
                        value={vPincode}
                        onChange={(e) => setVPincode(e.target.value)}
                        className="w-full bg-white border border-[#E8E6E1] rounded-xl px-3 py-2 text-[13px] font-bold text-[#171717] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#777570] mb-1">Established Year</label>
                      <input
                        type="text"
                        value={vEstablished}
                        onChange={(e) => setVEstablished(e.target.value)}
                        className="w-full bg-white border border-[#E8E6E1] rounded-xl px-3 py-2 text-[13px] font-bold text-[#171717] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#777570] mb-1">About the Arena (Public Bio)</label>
                  <textarea
                    rows={2}
                    value={vDescription}
                    onChange={(e) => setVDescription(e.target.value)}
                    className="w-full bg-white border border-[#E8E6E1] rounded-xl p-2.5 text-[12.5px] font-medium text-[#171717] focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* SECTION C: VENUE PHOTOS GALLERY (MIN 4, MAX 8) */}
              <div className="bg-white rounded-2xl p-4 border border-[#E8E6E1] space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-[#F1F0EC]">
                  <div>
                    <h4 className="text-[14px] font-black text-[#171717] flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-[#FF6B2C]" />
                      <span>Venue Photo Gallery</span>
                      <span className="text-[11px] font-normal text-[#777570]">(Min 4, Max 8 Photos)</span>
                    </h4>
                    <p className="text-[11px] text-[#777570]">
                      High-resolution photos displayed to players on the TurfTown public booking app
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        venuePhotos.length >= 4 && venuePhotos.length <= 8
                          ? 'bg-[#2FA66A]/10 text-[#2FA66A]'
                          : 'bg-[#E7A72F]/15 text-[#B87C0D]'
                      }`}
                    >
                      {venuePhotos.length} / 8 Photos Uploaded
                    </span>

                    {venuePhotos.length < 8 && (
                      <button
                        type="button"
                        onClick={() => setIsAddPhotoOpen(true)}
                        className="h-7 px-2.5 rounded-lg bg-[#171717] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Photo</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Photos Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  {venuePhotos.map((p, idx) => (
                    <div
                      key={p.id}
                      className="group relative rounded-xl overflow-hidden border border-[#E8E6E1] bg-[#FAF9F6] aspect-4/3 flex flex-col justify-end"
                    >
                      <img
                        src={p.url}
                        alt={p.label}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                      {/* Photo Label */}
                      <div className="relative z-10 p-2 text-white">
                        <span className="text-[10px] font-bold block leading-tight truncate">{p.label}</span>
                        <span className="text-[8.5px] text-white/70">Photo {idx + 1}</span>
                      </div>

                      {/* Delete button (only if > 4 photos) */}
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(p.id)}
                        className="absolute top-1.5 right-1.5 z-20 w-6 h-6 rounded-full bg-black/60 hover:bg-[#D94B4B] text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="Remove Photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Add Placeholder card if < 8 */}
                  {venuePhotos.length < 8 && (
                    <button
                      type="button"
                      onClick={() => setIsAddPhotoOpen(true)}
                      className="rounded-xl border-2 border-dashed border-[#E8E6E1] hover:border-[#FF6B2C] bg-[#FAF9F6] hover:bg-white aspect-4/3 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-[#777570] hover:text-[#FF6B2C]"
                    >
                      <Plus className="w-5 h-5" />
                      <span className="text-[11px] font-bold">Add Photo</span>
                      <span className="text-[9px] text-[#A3A099]">Up to 8 max</span>
                    </button>
                  )}
                </div>

                {/* Validation Notice */}
                <div className="pt-1 flex items-center justify-between text-[11px] text-[#777570]">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2FA66A]" />
                    <span>Photos are checked against ground markings and floodlight standards.</span>
                  </span>
                  <span className="font-bold text-[#171717]">Min: 4 · Max: 8</span>
                </div>
              </div>
            </form>
          )}

          {/* ===================================================================== */}
          {/* TAB 2: PAYMENT SETTINGS & BANK DETAILS WITH CHANGE REQUEST FORM       */}
          {/* ===================================================================== */}
          {activeTab === 'payment_settings' && (
            <div className="space-y-5">
              <div className="pb-2 border-b border-[#F1F0EC]">
                <h3 className="text-[17px] font-black text-[#171717]">Payment Methods & Bank Settlement</h3>
                <p className="text-[11.5px] text-[#777570]">
                  Verified settlement bank account, payout switch, UPI QR & cash collections
                </p>
              </div>

              {/* ACTIVE VERIFIED BANK ACCOUNT CARD */}
              <div className="bg-[#FAF9F6] rounded-2xl p-4 border border-[#E8E6E1] space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-[#E8E6E1]/70">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-[#2FA66A]" />
                    <span className="text-[13px] font-black text-[#171717] uppercase tracking-wider">
                      Active Settlement Bank Account
                    </span>
                  </div>

                  <span className="text-[10px] font-bold text-[#2FA66A] bg-[#2FA66A]/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified & Active</span>
                  </span>
                </div>

                {/* Bank Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <span className="text-[10.5px] font-bold text-[#777570] block">Bank Name</span>
                    <span className="text-[14px] font-black text-[#171717]">{bankDetails.bankName}</span>
                  </div>

                  <div>
                    <span className="text-[10.5px] font-bold text-[#777570] block">Account Number</span>
                    <span className="text-[14px] font-mono font-black text-[#171717]">{bankDetails.maskedNumber}</span>
                  </div>

                  <div>
                    <span className="text-[10.5px] font-bold text-[#777570] block">IFSC Code</span>
                    <span className="text-[14px] font-mono font-black text-[#171717]">{bankDetails.ifsc}</span>
                  </div>

                  <div>
                    <span className="text-[10.5px] font-bold text-[#777570] block">Account Holder</span>
                    <span className="text-[13px] font-bold text-[#171717]">{bankDetails.accountHolder}</span>
                  </div>

                  <div>
                    <span className="text-[10.5px] font-bold text-[#777570] block">Account Type</span>
                    <span className="text-[13px] font-bold text-[#171717]">{bankDetails.accountType}</span>
                  </div>

                  <div>
                    <span className="text-[10.5px] font-bold text-[#777570] block">Daily Settlement</span>
                    <span className="text-[12px] font-bold text-[#2FA66A]">{bankDetails.payoutSchedule}</span>
                  </div>
                </div>

                {/* Change Request Action Button */}
                <div className="pt-2 border-t border-[#E8E6E1]/70 flex items-center justify-between">
                  <p className="text-[11px] text-[#777570]">
                    To change payout bank account, submit a signed request to TurfTown operations for verification.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      haptics.tap();
                      setIsBankChangeModalOpen(true);
                    }}
                    className="h-8.5 px-3.5 rounded-xl bg-[#171717] hover:bg-[#2b2b2b] text-white font-bold text-[12px] flex items-center gap-1.5 shadow-xs active-press cursor-pointer transition-colors shrink-0"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-[#FF6B2C]" />
                    <span>Request Bank Change</span>
                  </button>
                </div>
              </div>

              {/* PENDING ADMIN APPROVAL BANNER IF REQUEST SUBMITTED */}
              {bankChangeRequest?.pending && (
                <div className="bg-[#E7A72F]/10 border border-[#E7A72F]/30 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#B87C0D]" />
                      <span className="text-[13px] font-black text-[#171717]">
                        Bank Account Change Request ({bankChangeRequest.requestId})
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-[#B87C0D] bg-white px-2 py-0.5 rounded-full border border-[#E7A72F]/30">
                      Pending Admin Approval
                    </span>
                  </div>
                  <p className="text-[11.5px] text-[#55534E] leading-relaxed">
                    Requested new account: <strong className="text-[#171717]">{bankChangeRequest.newBankName} ({bankChangeRequest.newAccountMasked})</strong> with IFSC <strong className="text-[#171717]">{bankChangeRequest.newIfsc}</strong>. Submitted {bankChangeRequest.submittedAt}.
                  </p>
                  <p className="text-[11px] text-[#777570]">
                    ✓ Your current HDFC account remains active for daily payouts until TurfTown admin approves the change.
                  </p>
                </div>
              )}

              {/* UPI & Cash Collection Toggles */}
              <div className="space-y-3">
                <h4 className="text-[13px] font-black text-[#171717] uppercase tracking-wider">
                  Payment Channels & Reception Desk
                </h4>

                <div className="p-3.5 bg-[#FAF9F6] rounded-xl border border-[#E8E6E1] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#2FA66A]/10 text-[#2FA66A] flex items-center justify-center">
                      <Wallet className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-[#171717]">Dynamic UPI QR Collections</h4>
                      <p className="text-[11px] text-[#777570]">Generate per-booking payment QR for Google Pay, PhonePe, Paytm</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updatePaymentSettings({ acceptUpi: !paymentSettings.acceptUpi })}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      paymentSettings.acceptUpi ? 'bg-[#2FA66A]' : 'bg-[#D1CFCA]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        paymentSettings.acceptUpi ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="p-3.5 bg-[#FAF9F6] rounded-xl border border-[#E8E6E1] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#FF6B2C]/10 text-[#FF6B2C] flex items-center justify-center">
                      <CreditCard className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-[#171717]">Cash at Venue Mode</h4>
                      <p className="text-[11px] text-[#777570]">Permit counter cash collection with manual balance reconciliation</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updatePaymentSettings({ acceptCash: !paymentSettings.acceptCash })}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      paymentSettings.acceptCash ? 'bg-[#2FA66A]' : 'bg-[#D1CFCA]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        paymentSettings.acceptCash ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 3: AMENITIES (Full Editing & Toggle Controls)                    */}
          {/* ===================================================================== */}
          {activeTab === 'amenities' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#F1F0EC]">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[17px] font-black text-[#171717]">Venue Amenities</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2FA66A]/10 text-[#2FA66A] border border-[#2FA66A]/20">
                      Admin Standardized
                    </span>
                  </div>
                  <p className="text-[11.5px] text-[#777570]">
                    Admin-defined amenities available for your facility. Toggle on/off to reflect on player booking app ({activeAmenitiesCount} Active)
                  </p>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: 'All Amenities' },
                  { id: 'Lighting', label: 'Lighting' },
                  { id: 'Facility', label: 'Facilities' },
                  { id: 'Refreshment', label: 'Refreshments' },
                  { id: 'Safety', label: 'Safety' },
                  { id: 'Equipment', label: 'Equipment' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setAmenityFilter(cat.id)}
                    className={`h-7.5 px-3 rounded-lg text-[11px] font-bold transition-all border cursor-pointer ${
                      amenityFilter === cat.id
                        ? 'bg-[#171717] text-white border-[#171717]'
                        : 'bg-[#FAF9F6] text-[#777570] border-[#E8E6E1] hover:text-[#171717]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Amenities Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 pt-1">
                {amenities
                  .filter((a) => amenityFilter === 'all' || a.category.toLowerCase() === amenityFilter.toLowerCase())
                  .map((amenity) => (
                    <div
                      key={amenity.id}
                      onClick={() => toggleAmenity(amenity.id)}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                        amenity.enabled
                          ? 'bg-[#FAF9F6] border-[#171717]/20 shadow-xs'
                          : 'bg-white border-[#E8E6E1] opacity-65'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white border border-[#E8E6E1] flex items-center justify-center shrink-0">
                          {getAmenityIcon(amenity.icon)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-[13px] font-bold text-[#171717]">{amenity.name}</h4>
                            <span className="text-[9px] font-bold uppercase text-[#777570] bg-white border border-[#E8E6E1] px-1.5 py-0.2 rounded">
                              {amenity.category}
                            </span>
                          </div>
                          <p className="text-[10.5px] text-[#777570] mt-0.5">{amenity.details}</p>
                        </div>
                      </div>

                      <div
                        className={`w-10 h-5.5 rounded-full p-0.5 transition-colors shrink-0 ${
                          amenity.enabled ? 'bg-[#2FA66A]' : 'bg-[#D1CFCA]'
                        }`}
                      >
                        <div
                          className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                            amenity.enabled ? 'translate-x-4.5' : 'translate-x-0'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 4: OPERATING HOURS (Full Day-by-Day Time Editing)                 */}
          {/* ===================================================================== */}
          {activeTab === 'operating_hours' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#F1F0EC]">
                <div>
                  <h3 className="text-[17px] font-black text-[#171717]">Operating Schedule</h3>
                  <p className="text-[11.5px] text-[#777570]">
                    Configure daily facility opening & closing hours, slot availability and closed days
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    haptics.tap();
                    operatingHours.forEach((d) => {
                      if (d.isOpen) {
                        updateOperatingDayHours(d.day, '06:00 AM', '11:00 PM');
                      }
                    });
                    showToast('Hours Applied', '06:00 AM – 11:00 PM set for all open days.', 'success');
                  }}
                  className="text-[11px] font-bold text-[#FF6B2C] bg-[#FF6B2C]/10 hover:bg-[#FF6B2C]/20 px-3 py-1.5 rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
                >
                  ⚡ Set 06:00 AM – 11:00 PM All
                </button>
              </div>

              {/* Day Rows with Time Pickers */}
              <div className="space-y-2.5">
                {operatingHours.map((day) => (
                  <div
                    key={day.day}
                    className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      day.isOpen
                        ? 'bg-[#FAF9F6] border-[#E8E6E1]'
                        : 'bg-white border-[#E8E6E1] opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E6E1] flex items-center justify-center font-black text-[13px] text-[#171717] shrink-0">
                        {day.day.slice(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-[13.5px] font-black text-[#171717]">{day.day}</h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              day.isOpen
                                ? 'bg-[#2FA66A]/10 text-[#2FA66A]'
                                : 'bg-[#EF4444]/10 text-[#EF4444]'
                            }`}
                          >
                            {day.isOpen ? 'Open for Bookings' : 'Facility Closed'}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-[#777570] mt-0.5">
                          {day.isOpen ? 'Active booking slots generated' : 'All court slots locked'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E8E6E1]/60">
                      {day.isOpen ? (
                        <div className="flex items-center gap-1.5">
                          <select
                            value={day.openTime}
                            onChange={(e) => updateOperatingDayHours(day.day, e.target.value, day.closeTime)}
                            className="bg-white border border-[#E8E6E1] rounded-xl px-2.5 py-1.5 text-[11.5px] font-bold text-[#171717] focus:outline-none cursor-pointer"
                          >
                            {['05:00 AM', '05:30 AM', '06:00 AM', '06:30 AM', '07:00 AM', '08:00 AM'].map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                          <span className="text-[11px] font-bold text-[#777570]">to</span>
                          <select
                            value={day.closeTime}
                            onChange={(e) => updateOperatingDayHours(day.day, day.openTime, e.target.value)}
                            className="bg-white border border-[#E8E6E1] rounded-xl px-2.5 py-1.5 text-[11.5px] font-bold text-[#171717] focus:outline-none cursor-pointer"
                          >
                            {['09:00 PM', '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM', '12:00 AM'].map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <span className="text-[12px] font-bold text-[#A3A099]">Closed All Day</span>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          haptics.tap();
                          toggleOperatingDay(day.day);
                        }}
                        className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                          day.isOpen ? 'bg-[#171717]' : 'bg-[#D1CFCA]'
                        }`}
                      >
                        <div
                          className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                            day.isOpen ? 'translate-x-4.5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 5: BOOKING SETTINGS                                               */}
          {/* ===================================================================== */}
          {activeTab === 'booking_settings' && (
            <div className="space-y-4">
              <div className="pb-2 border-b border-[#F1F0EC]">
                <h3 className="text-[17px] font-black text-[#171717]">Booking Policy & Rules</h3>
                <p className="text-[11.5px] text-[#777570]">
                  Advance reservation windows, player hold timers & minimum booking notice limits
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-[#FAF9F6] rounded-xl border border-[#E8E6E1] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[12.5px] font-bold text-[#171717]">Advance Booking Window</span>
                    <span className="text-[12px] font-black text-[#FF6B2C]">
                      {bookingSettings.advanceBookingDays} Days
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[7, 14, 30, 60].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => updateBookingSettings({ advanceBookingDays: days })}
                        className={`py-1.5 rounded-lg text-[11.5px] font-bold border cursor-pointer ${
                          bookingSettings.advanceBookingDays === days
                            ? 'bg-[#171717] text-white border-[#171717]'
                            : 'bg-white text-[#777570] border-[#E8E6E1]'
                        }`}
                      >
                        {days}d
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 bg-[#FAF9F6] rounded-xl border border-[#E8E6E1] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[12.5px] font-bold text-[#171717]">Online Hold Expiry Timer</span>
                    <span className="text-[12px] font-black text-[#2FA66A]">
                      {cancellationPolicy.autoReleaseHoldMinutes || 15} Mins
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[5, 10, 15].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => updateCancellationPolicy({ autoReleaseHoldMinutes: mins })}
                        className={`py-1.5 rounded-lg text-[11.5px] font-bold border cursor-pointer ${
                          cancellationPolicy.autoReleaseHoldMinutes === mins
                            ? 'bg-[#171717] text-white border-[#171717]'
                            : 'bg-white text-[#777570] border-[#E8E6E1]'
                        }`}
                      >
                        {mins} Mins
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-[#FAF9F6] rounded-xl border border-[#E8E6E1] flex items-center justify-between">
                <div>
                  <h4 className="text-[13px] font-bold text-[#171717]">Allow Multi-Court Consecutive Bookings</h4>
                  <p className="text-[11px] text-[#777570]">Permit single customers to reserve adjacent slots across grounds</p>
                </div>
                <div className="w-9 h-5 rounded-full p-0.5 bg-[#2FA66A]">
                  <div className="w-4 h-4 rounded-full bg-white translate-x-4" />
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 6: NOTIFICATION SETTINGS (DIRECT ON/OFF SWITCHES)                 */}
          {/* ===================================================================== */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="pb-2 border-b border-[#F1F0EC]">
                <h3 className="text-[17px] font-black text-[#171717]">Notification Settings (On / Off Toggles)</h3>
                <p className="text-[11.5px] text-[#777570]">
                  Directly toggle automated alert dispatch channels and venue operator notifications
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    key: 'whatsappBookingAlerts' as const,
                    title: 'WhatsApp Booking Confirmation',
                    caption: 'Send instant match passes and QR receipts to players upon booking',
                    enabled: notificationPreferences.whatsappBookingAlerts,
                  },
                  {
                    key: 'slotHoldExpiryAlerts' as const,
                    title: 'Slot Hold Expiry Warning',
                    caption: 'Alert operator when a 15-minute held checkout timer is about to lapse',
                    enabled: notificationPreferences.slotHoldExpiryAlerts,
                  },
                  {
                    key: 'dailyPayoutDigest' as const,
                    title: 'Daily Midnight Payout Digest',
                    caption: 'Automated midnight summary of IMPS settlements credited to linked bank',
                    enabled: notificationPreferences.dailyPayoutDigest,
                  },
                  {
                    key: 'slotMaintenanceReminders' as const,
                    title: 'Maintenance Block Reminders',
                    caption: 'Push notification 30 mins before scheduled court maintenance blocks',
                    enabled: notificationPreferences.slotMaintenanceReminders,
                  },
                ].map((notif) => (
                  <div
                    key={notif.key}
                    className="p-3.5 bg-[#FAF9F6] rounded-xl border border-[#E8E6E1] flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-[13px] font-bold text-[#171717]">{notif.title}</h4>
                      <p className="text-[11px] text-[#777570]">{notif.caption}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        haptics.tap();
                        updateNotificationPreferences({
                          [notif.key]: !notif.enabled,
                        });
                        showToast(
                          'Setting Updated',
                          `${notif.title} is now ${!notif.enabled ? 'ON' : 'OFF'}.`,
                          'info'
                        );
                      }}
                      className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer ${
                        notif.enabled ? 'bg-[#2FA66A]' : 'bg-[#D1CFCA]'
                      }`}
                    >
                      <div
                        className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                          notif.enabled ? 'translate-x-4.5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 7: PRIVACY POLICY (RICH TEXT DOCUMENT)                            */}
          {/* ===================================================================== */}
          {activeTab === 'privacy' && (
            <div className="space-y-5 text-[#262524] text-[13px] leading-relaxed">
              <div className="border-b border-[#F1F0EC] pb-3">
                <span className="text-[10.5px] font-bold text-[#2FA66A] bg-[#2FA66A]/10 px-2 py-0.5 rounded-full inline-flex items-center gap-1 mb-1">
                  <Shield className="w-3 h-3" />
                  <span>Official Privacy Policy · Version 2.4</span>
                </span>
                <h3 className="text-[20px] font-black text-[#171717] tracking-tight">
                  Venue & Player Data Protection Policy
                </h3>
                <p className="text-[11.5px] text-[#777570]">
                  Effective: 1 August 2026 · Governing operations for {venueName}
                </p>
              </div>

              <div className="bg-[#FAF9F6] border-l-3 border-[#FF6B2C] p-3.5 rounded-r-xl text-[12.5px] text-[#403E3B]">
                TurfTown ensures bank-grade 256-bit encryption for all booking transactions, customer phone numbers, and IMPS bank settlements. Data is never sold or utilized for third-party ad targeting.
              </div>

              <div className="space-y-1.5">
                <h4 className="text-[15px] font-black text-[#171717]">1. Data Collection & Processing</h4>
                <p className="text-[#55534E]">
                  We gather necessary venue records, staff credentials, player names, and phone numbers exclusively to facilitate ground bookings, prevent double-scheduling, and automate dynamic UPI QR payments.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-[15px] font-black text-[#171717]">2. Financial Reconciliations & Security</h4>
                <p className="text-[#55534E]">
                  Payment metadata, UPI reference strings, and settlement audit trails are processed under RBI-compliant gateway standards with automatic midnight T+0 IMPS direct payout.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-[15px] font-black text-[#171717]">3. Data Retention & Operator Rights</h4>
                <p className="text-[#55534E]">
                  Venue owners retain full ownership of customer transaction records and may download comprehensive Excel, CSV, or PDF statements at any time via the Export Reports tool.
                </p>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 8: TERMS & CONDITIONS                                             */}
          {/* ===================================================================== */}
          {activeTab === 'terms' && (
            <div className="space-y-5 text-[#262524] text-[13px] leading-relaxed">
              <div className="border-b border-[#F1F0EC] pb-3">
                <span className="text-[10.5px] font-bold text-[#FF6B2C] bg-[#FF6B2C]/10 px-2 py-0.5 rounded-full inline-flex items-center gap-1 mb-1">
                  <FileText className="w-3 h-3" />
                  <span>Platform Terms of Service · Version 2.4</span>
                </span>
                <h3 className="text-[20px] font-black text-[#171717] tracking-tight">
                  TurfTown Partner Terms & Conditions
                </h3>
                <p className="text-[11.5px] text-[#777570]">
                  Operating agreement between TurfTown and {venueName}
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-[15px] font-black text-[#171717]">1. Booking Honor System</h4>
                <p className="text-[#55534E]">
                  All confirmed player reservations placed online or manually entered at the ground must be honored during reserved timeframes. Emergency court closures must be initiated with reasonable notice.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-[15px] font-black text-[#171717]">2. Cancellation Rules</h4>
                <p className="text-[#55534E]">
                  Refunds and cancellations are governed strictly by the court-specific buffer hours and payout percentages configured in your Cancellation Settings panel.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: REQUEST BANK ACCOUNT CHANGE (Pending Admin Approval)              */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isBankChangeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
            <div className="absolute inset-0" onClick={() => setIsBankChangeModalOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-5 border border-[#E8E6E1] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#F1F0EC]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FF6B2C]/10 text-[#FF6B2C] flex items-center justify-center">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-black text-[#171717]">Request Bank Account Change</h3>
                    <p className="text-[11px] text-[#777570]">Subject to TurfTown Admin Verification</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsBankChangeModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-[#F1F0EC] flex items-center justify-center text-[#777570] hover:text-[#171717] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <form onSubmit={handleSubmitBankChange} className="space-y-3">
                <div className="p-2.5 bg-[#FAF9F6] rounded-xl border border-[#E8E6E1] text-[11px] text-[#777570] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-[#FF6B2C] shrink-0" />
                  <span>Existing HDFC payouts will continue until this request is approved by admin.</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#777570] mb-1">
                    New Bank Name <span className="text-[#FF6B2C]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ICICI Bank, State Bank of India"
                    value={newBankName}
                    onChange={(e) => setNewBankName(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-[12.5px] font-bold text-[#171717] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#777570] mb-1">
                    Account Holder Name <span className="text-[#FF6B2C]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Must match GSTIN / Business Name"
                    value={newHolderName}
                    onChange={(e) => setNewHolderName(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-[12.5px] font-bold text-[#171717] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#777570] mb-1">
                      Account Number <span className="text-[#FF6B2C]">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Account number"
                      value={newAccountNumber}
                      onChange={(e) => setNewAccountNumber(e.target.value)}
                      className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-[12.5px] font-bold text-[#171717] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#777570] mb-1">
                      Confirm Account <span className="text-[#FF6B2C]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Re-enter number"
                      value={confirmAccountNumber}
                      onChange={(e) => setConfirmAccountNumber(e.target.value)}
                      className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-[12.5px] font-bold text-[#171717] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#777570] mb-1">
                      IFSC Code <span className="text-[#FF6B2C]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ICIC0001234"
                      value={newIfsc}
                      onChange={(e) => setNewIfsc(e.target.value.toUpperCase())}
                      className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-[12.5px] font-bold text-[#171717] focus:outline-none uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#777570] mb-1">Account Type</label>
                    <select
                      value={newAccountType}
                      onChange={(e) => setNewAccountType(e.target.value)}
                      className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-2.5 py-2 text-[12px] font-bold text-[#171717] focus:outline-none"
                    >
                      <option value="Current Commercial">Current Commercial</option>
                      <option value="Savings">Savings Account</option>
                    </select>
                  </div>
                </div>

                {/* Cancelled Cheque upload mock */}
                <div>
                  <label className="block text-[11px] font-bold text-[#777570] mb-1">
                    Proof of Account (Cancelled Cheque / Bank Passbook)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      haptics.tap();
                      setHasChequeAttached(true);
                      showToast('Document Attached', 'Cancelled_Cheque_2026.pdf uploaded.', 'success');
                    }}
                    className={`w-full py-2.5 rounded-xl border-2 border-dashed flex items-center justify-center gap-1.5 text-[12px] font-bold transition-all cursor-pointer ${
                      hasChequeAttached
                        ? 'border-[#2FA66A] bg-[#2FA66A]/10 text-[#2FA66A]'
                        : 'border-[#E8E6E1] bg-[#FAF9F6] text-[#777570] hover:border-[#171717]'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{hasChequeAttached ? '✓ Cancelled_Cheque_2026.pdf Attached' : 'Attach Cancelled Cheque PDF/Image'}</span>
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#777570] mb-1">Reason for Change</label>
                  <input
                    type="text"
                    placeholder="e.g. Migrating to new business corporate branch"
                    value={changeReason}
                    onChange={(e) => setChangeReason(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-[12.5px] font-medium text-[#171717] focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-10 rounded-xl bg-[#FF6B2C] hover:bg-[#e85b1e] text-white font-black text-[13px] flex items-center justify-center gap-1.5 shadow-sm active-press cursor-pointer"
                  >
                    <span>Submit Request to Admin</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL: ADD VENUE PHOTO (Max 8)                                            */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isAddPhotoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
            <div className="absolute inset-0" onClick={() => setIsAddPhotoOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-5 border border-[#E8E6E1] shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#F1F0EC]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FF6B2C]/10 text-[#FF6B2C] flex items-center justify-center">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-black text-[#171717]">Add Venue Photo</h3>
                    <p className="text-[11px] text-[#777570]">{venuePhotos.length} of 8 uploaded</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddPhotoOpen(false)}
                  className="w-7 h-7 rounded-full bg-[#F1F0EC] flex items-center justify-center text-[#777570] hover:text-[#171717] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#777570] mb-1">
                    Photo Title / Area Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Floodlit Goalpost View 1"
                    value={newPhotoLabel}
                    onChange={(e) => setNewPhotoLabel(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-2 text-[12.5px] font-bold text-[#171717] focus:outline-none"
                  />
                </div>

                <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#E8E6E1] flex items-center justify-center flex-col gap-2 py-6">
                  <Upload className="w-6 h-6 text-[#FF6B2C]" />
                  <span className="text-[12px] font-bold text-[#171717]">Select high-res arena image</span>
                  <span className="text-[10px] text-[#777570]">JPG, PNG up to 10MB</span>
                </div>

                <button
                  type="button"
                  onClick={handleAddPhoto}
                  className="w-full h-10 rounded-xl bg-[#FF6B2C] hover:bg-[#e85b1e] text-white font-black text-[13px] flex items-center justify-center gap-1.5 shadow-sm active-press cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Photo to Gallery</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

